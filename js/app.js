
// Elements

const player = document.getElementById("player");
const audioSource = player.children.item(0);
console.debug(audioSource);

// Play/Pause button

const playPauseButton = document.getElementById("playpause");

// Volume stuff
const controlMute = document.getElementById("control_mute");
const controlRealVolume = document.getElementById("control_real_volume");
const controlVolume = document.getElementById("control_volume");

// Handles the volume slider changing.

function setMuteButtonIcon (volume) {
  const mutedIcon = "fa-volume-mute";
  const silent = "fa-volume-off";
  const low = "fa-volume-low";
  const high = "fa-volume-high";

  if (volume === 0) {
    controlMute.innerHTML = `<span class="fa-fw fa-solid ${silent}"></span>`;
  } else if (volume <= 50) {
    controlMute.innerHTML = `<span class="fa-fw fa-solid ${low}"></span>`;
  } else if (volume <= 100) {
    controlMute.innerHTML = `<span class="fa-fw fa-solid ${high}"></span>`;
  }

  controlMute.classList.remove("danger");

  if (player.muted) {
    controlMute.classList.add("danger");
    controlMute.innerHTML = `<span class="fa-fw fa-solid ${mutedIcon}"></span>`;
  }
}

function toggleMute () {
  player.muted = !player.muted;
  setMuteButtonIcon(player.volume);
}

function setVolume (volume) {
  if (volume > 100) {
    volume = 100
  }
  if (volume < 0) {
    volume = 0;
  }
  setMuteButtonIcon(volume);
  localStorage.setItem("volume", volume);
  player.volume = volume / 100;
  controlVolume.value = volume;
  controlRealVolume.value = volume;
}

controlMute.addEventListener("click", toggleMute);

controlRealVolume.addEventListener("input", _ => {
  setVolume(controlRealVolume.value);
})

controlVolume.addEventListener("input", _ => {
  setVolume(controlVolume.value);
})

// The following code deals with playing, pausing

function setPlayPauseButtonIcon(status="stopped") {
  const statuses = {
    stopped: "<span class='fa-fw fa-solid fa-stop'></span> Stopped",
    playing: "<span class='fa-fw fa-solid fa-pause'></span> Playing",
    paused: "<span class='fa-fw fa-solid fa-play'></span> Paused",
    buffer: "<span class='fa-fw fa-solid fa-spin fa-spinner'></span> Buffering",
  }

  playPauseButton.innerHTML = statuses[status];
}

function togglePlay() {
  if (player.paused) {
    player.load();
    player.play();
    setPlayPauseButtonIcon("playing")
  } else {
    player.pause();
    setPlayPauseButtonIcon("paused");
  }
}

playPauseButton.addEventListener("click", togglePlay);

// Give user feedback on buffering

player.addEventListener('playing', function() {
  console.log('Playback started.');
  setPlayPauseButtonIcon("playing");
});

player.addEventListener('pause', function() {
  console.log('Playback paused.');
  setPlayPauseButtonIcon("paused");
});

player.addEventListener('waiting', function() {
  console.log("Buffering...");
  setPlayPauseButtonIcon("buffer");
});

// Read saved variables from localStorage
function getLocalStorageItem (item, fallback = null) {
  if (localStorage.getItem(item)) {
    return localStorage.getItem((item));
  } else {
    return fallback;
  }
}

setVolume(getLocalStorageItem("volume", 100));
let stationList = JSON.parse(getLocalStorageItem("stations", "[]"));

// Creates stations
function addStation(url, name="", metadata_type="icecast", azuracast_server_url="", azuracast_station_shortname="") {
  console.log("Adding station: ", {
      url,
      name,
      metadata_type,
      azuracast_server_url,
      azuracast_station_shortname
  });

  stationList.push({url, name, metadata_type, azuracast_server_url, azuracast_station_shortname});
  localStorage.setItem("stations", JSON.stringify(stationList));
}

// View-specific code

// Tuner

function renderStationListInTuner() {
  const tunerStationList = document.getElementById("tunerStationList");
  tunerStationList.innerText = "";
  for (let result of stationList) {
    const newStation = document.createElement("div");
    newStation.classList = "station";
    newStation.innerHTML = `<h3 class="station_title">${result.name}</h3><button class="tune_station"><span class="fa-fw fa-solid fa-play-circle"></span> Play Station</button>`
    document.getElementById("tunerStationList").appendChild(newStation);
  }
}

// Manual station creator

document.getElementById("add_station_metadata_azuracast_option").addEventListener("click", function () {
  document.getElementById("add_station_manually_azuracast_metadata_options").hidden=false;
});

document.getElementById("add_station_metadata_icecast_option").addEventListener("click", function () {
  document.getElementById("add_station_manually_azuracast_metadata_options").hidden=true;
});

document.getElementById("add_station_add_station").addEventListener("click", function () {
  const audioURL = document.getElementById("add_station_url").value;
  const stationName = document.getElementById("add_station_name").value;
  const stationMetadataType = document.querySelector("input[name='add_metadata_type']:checked").value;
  let azuracastServerURL, azuracastStationShortname;
  if (stationMetadataType === "azuracast") {
    azuracastServerURL = document.getElementById("add_station_azuracast_server").value;
    azuracastStationShortname = document.getElementById("add_station_azuracast_shortname").value;
  } else {
    azuracastServerURL = "";
    azuracastStationShortname = "";
  }

  addStation(audioURL, stationName, stationMetadataType, azuracastServerURL, azuracastStationShortname);
  location.hash = "#tuner";
});

// Azuracast searcher

async function getStationsFromAzuracastServer(url) {
  let search = await fetch(url + "/api/stations");
  let results = await search.json()
  console.log(results);
  // Clear the results box
  document.getElementById("add_azuracast_results").innerText = "";
  for (let result of results) {
    const newStation = document.createElement("div");
    newStation.classList = "station search_result";
    newStation.innerHTML = `<h3 class="station_title">${result.name}</h3><p class="description">${result.description}</p><button onclick="addStation('${result.default_url}', '${result.name}', 'azuracast', '${url}', ${result.shortname});" class="add_station"><span class="fa-fw fa-solid fa-plus-circle"></span> Add Station</button>`
    document.getElementById("add_azuracast_results").appendChild(newStation);
  }
}

document.getElementById("add_azcast_search").addEventListener("click", _=>{
  getStationsFromAzuracastServer(document.getElementById('add_fromazcast_url').value).then(r => {});
});




// The following deals with routing between the different Views.

const views = {
  "#tuner": document.getElementById("tuner"),
  "#add_station": document.getElementById("add_station"),
  "#add_station_from_azuracast": document.getElementById("add_station_from_azuracast"),
  "#station": document.getElementById("station"),
  "#settings": document.getElementById("settings"),
};

const viewFunctions = { // These run when a view is loaded.
  "#tuner": renderStationListInTuner,
}

function updateView() {
  let view = location.hash
  let selectedView;
  if (views[view]) {
    selectedView = views[view];
    // Remove the active class from whoever has it
    const currentlyActiveNavbarIcons = document.querySelectorAll("#navbar > .nav_active");
    if (currentlyActiveNavbarIcons.length > 0) {
      currentlyActiveNavbarIcons[0].classList.remove("nav_active");
    }

    // Set the navbar icon to active
    let navbaricon = document.getElementById('navbar').querySelectorAll(`#navbar > a[href*='${view}']`)[0];
    if (navbaricon) {
      navbaricon.classList = "nav_active";
    }
  } else {
    view = "#tuner";
    selectedView = views[view];
    // Remove the active class from whoever has it
    const currentlyActiveNavbarIcons = document.querySelectorAll("#navbar > .nav_active");
    if (currentlyActiveNavbarIcons.length > 0) {
      currentlyActiveNavbarIcons[0].classList.remove("nav_active");
    }

    // Set the navbar icon to active
    let navbaricon = document.getElementById('navbar').querySelectorAll(`#navbar > a[href*='${view}']`)[0];
    navbaricon.classList = "nav_active";
  }

  // Select all "section" elements and hide them
  const allSectionsThatAreViews = document.querySelectorAll("main > section");
  for (let item of allSectionsThatAreViews) {
    item.hidden = "hidden";
    item.ariaHidden = "true";
  }

  // Run the view's `on switch` function if it exists
  if (viewFunctions[view]) {
    viewFunctions[view]();
  }

  // Show the view
  selectedView.hidden = false;
  selectedView.ariaHidden = "false";
}

window.addEventListener("hashchange", updateView);
updateView();
