
// Elements

const player = document.getElementById("player");
const audioSource = player.children.item(0);
console.debug(audioSource);

let currentSongTitle = document.getElementById("current-song-title");
let currentSongArtist = document.getElementById("current-song-artist");
let currentSongArt = document.getElementById("current-song-art");
let currentSongElapsed = document.getElementById("elapsed");
let currentSongDuration = document.getElementById("duration");
let currentSongProgress = document.getElementById("progress")

const nextSongTitle = document.getElementById("next-song-title");
const nextSongArtist = document.getElementById("next-song-artist");
const nextSongArt = document.getElementById("next-song-art");

// Important init stuff

let noise = null;

audioSource.src = "assets/audio/noise.wav";
let currentStation = null;

runningInElectron = !!window.metadata;


if (runningInElectron) {
  console.error("Running under electron.")
}

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

  if (noise) {
    noise.volume = (volume / 100) /4;
  }
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
    stopped: "<span class='fa-fw fa-solid fa-play'></span> Stopped",
    playing: "<span class='fa-fw fa-solid fa-pause'></span> Playing",
    paused: "<span class='fa-fw fa-solid fa-play'></span> Paused",
    buffer: "<span class='fa-fw fa-solid fa-spin fa-spinner'></span> Buffering",
  }

  playPauseButton.innerHTML = statuses[status];
}

function togglePlay() {
  if (player.paused) {
    audioSource.src += "&nocache=" + Math.random();
    player.load();
    setPlayPauseButtonIcon("playing")
  } else {
    player.pause();
    setPlayPauseButtonIcon("paused");
  }
}

playPauseButton.addEventListener("click", togglePlay);

player.addEventListener("loadeddata", _ =>{
  console.debug("Loading started.")
  player.play()
});


function convertSecondsToMinutes(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = secs - minutes * 60;
  return `${minutes}:${seconds}`
}

// The following code handles giving browsers and operating systems media information
async function updateMetadata(title="", artist="", album="radio waves", artUrl="https://radio.byemc.xyz/assets/icon-300.png", startTime=Date.now(), duration=0, playingStatus="Stopped", elapsed=0, id = Math.floor(Math.random() * 1000)) {
  // Double-check the inputs to make sure they arent undefined
  console.debug("Elapsed: ", elapsed)

  if (!album) album = "radio waves";
  if (!artUrl) artUrl = "https://radio.byemc.xyz/assets/icon-300.png";
  if (!startTime) startTime = Date.now();
  if (!duration) duration = 0;
  if (!playingStatus) playingStatus = "Stopped";
  if (!id) id = Math.floor(Math.random() * 1000);

  // First the MediaMetadata API (covers every current browser [Chrome, Firefox and __ESPECIALLY__ iOS Safari])
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album,
      artwork: [
        {
          src: artUrl
        }
      ]
    })

    playingStatus = playingStatus.toLowerCase() !== "playing" ? "paused" : "playing"; // or this
    navigator.mediaSession.playbackState = playingStatus;

    currentSongDuration.innerText = `${convertSecondsToMinutes(duration)}`
    currentSongProgress.max = (duration * 1000);
    currentSongProgress.dataset.duration = duration;
    currentSongProgress.dataset.startTime = startTime;
    currentSongProgress.value = Date.now() - startTime

    if (elapsed) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        position: elapsed,
        playbackRate: 1
      })
      currentSongProgress.dataset.offset = Math.round(elapsed - ((Date.now() - startTime) / 1000))
      currentSongElapsed.innerText = `${convertSecondsToMinutes(elapsed)}`;
    } else {
      navigator.mediaSession.setPositionState({
        duration: duration,
        position: Math.min(Math.round((Date.now() - startTime) / 1000), duration),
        playbackRate: 1
      })
      currentSongElapsed.innerText = `${convertSecondsToMinutes(Math.min(Math.round((Date.now() - startTime) / 1000), duration))}`;
    }

  }
}

const actionHandlers = [
  ['play',          togglePlay],
  ['pause',         togglePlay],
];

for (const [action, handler] of actionHandlers) {
  try {
    navigator.mediaSession.setActionHandler(action, handler);
  } catch (error) {
    console.log(`The media session action "${action}" is not supported yet.`);
  }
}

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

// Stations
function addStation(url, name="", metadata_type="icecast", azuracast_server_url="", azuracast_station_shortcode="") {
  console.log("Adding station: ", {
      url,
      name,
      metadata_type,
      azuracast_server_url,
      azuracast_station_shortcode
  });

  stationList.push({url, name, metadata_type, azuracast_server_url, azuracast_station_shortcode});
  localStorage.setItem("stations", JSON.stringify(stationList));
}

function removeStation(station) {
  console.log(stationList.indexOf(station))

  if (stationList.length === 1) {

    stationList = [];
    localStorage.setItem("stations", JSON.stringify(stationList));
    renderStationListInTuner();

    return
  }

  stationList = stationList.slice(stationList.indexOf(station), 1);
  console.log(stationList);
  localStorage.setItem("stations", JSON.stringify(stationList));


  renderStationListInTuner();
}

function tuneRadio(station={url:"assets/audio/noise.wav"}) {
  player.pause();
  console.log(station)
  audioSource.src = station.url + "?nocache=" + Math.random();
  currentStation = station;
  player.load();

  location.hash = "#station";
}

// View-specific code

// Tuner

function renderStationListInTuner() {
  const tunerStationList = document.getElementById("tunerStationList");
  tunerStationList.innerText = "";
  for (let result of stationList) {
    let station = result;
    const newStation = document.createElement("div");
    newStation.classList = "station";
    newStation.innerHTML = `<h3 class="station_title">${result.name}</h3>
<button class="tune_station"><span class="fa-fw fa-solid fa-play-circle"></span> Play Station</button>
<button class="remove_station dangerous"><span class="fa-fw fa-solid fa-trash" title="Remove Station"></span></button>
`
    newStation.getElementsByClassName("tune_station")[0].onclick = _=> { tuneRadio(result) };
    newStation.getElementsByClassName("remove_station")[0].onclick = _=> { removeStation(station) };

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
  let azuracastServerURL, azuracastStationshortcode;
  if (stationMetadataType === "azuracast") {
    azuracastServerURL = document.getElementById("add_station_azuracast_server").value;
    azuracastStationshortcode = document.getElementById("add_station_azuracast_shortcode").value;
  } else {
    azuracastServerURL = "";
    azuracastStationshortcode = "";
  }

  addStation(audioURL, stationName, stationMetadataType, azuracastServerURL, azuracastStationshortcode);
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
    newStation.innerHTML = `<h3 class="station_title">${result.name}</h3><p class="description">${result.description}</p><button onclick="addStation('${result.listen_url}', '${result.name}', 'azuracast', '${url}', '${result.shortcode}'); location.hash='#tuner';" class="add_station"><span class="fa-fw fa-solid fa-plus-circle"></span> Add Station</button>`
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
  "#fullscreen": document.getElementById("fullscreen"),
  "#settings": document.getElementById("settings"),
};

const viewFunctions = { // These run when a view is loaded.
  "#tuner": renderStationListInTuner,
  "#station": async function () {
    const stationThingy = views['#station'];

    if (!currentStation) {
      location.hash = "#tuner";
      return;
    }

    currentSongTitle = document.getElementById("current-song-title");
    currentSongArtist = document.getElementById("current-song-artist");
    currentSongArt = document.getElementById("current-song-art");
    currentSongElapsed = document.getElementById("elapsed");
    currentSongDuration = document.getElementById("duration");
    currentSongProgress = document.getElementById("progress");

    if (currentStation.metadata_type === "azuracast") {
      let request = await fetch(currentStation.azuracast_server_url + `/api/station/${currentStation.azuracast_station_shortcode}`);
      let json = await request.json();

      document.getElementById("station_name").innerText = json.name;
      document.getElementById("station_description").innerText = json.description;
    } else {
      stationThingy.innerHTML = "Yeah this is icecast, metadata coming soon."
    }
  },
  "#fullscreen": async function () {
    currentSongTitle = document.getElementById("full-current-song-title");
    currentSongArtist = document.getElementById("full-current-song-artist");
    currentSongArt = document.getElementById("full-current-song-art");
    currentSongElapsed = document.getElementById("full-elapsed");
    currentSongDuration = document.getElementById("full-duration");
    currentSongProgress = document.getElementById("full-progress");

    await updateLoop();
  }
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

// Set an interval to poll the station for metadata
async function getCurrentSongInfoFromAzuracastStation(server, shortcode) {

  let response = await (await fetch(server + "/api/nowplaying/" + shortcode + "?nocache=" + Math.random())).json();

  let album;
  if (response.now_playing.song.album) {
    album = response.now_playing.song.album;
  } else {
    album = response.station.name;
  }

  try {
    nextSongTitle.innerText = response.playing_next.song.title;
    nextSongArtist.innerText = response.playing_next.song.artist;
    nextSongArt.src = response.playing_next.song.art;


    document.getElementById("live_listeners").innerText = response.listeners.unique;
    const history = document.getElementById("history");
    history.innerText = "";
    for (let song of response.song_history) {
      const div = document.createElement("div");
      div.classList = "chip compact song stack h";
      const img = document.createElement("img");
      img.classList = "rounded"
      img.src = song.song.art;
      const stack = document.createElement("div");
      stack.classList = "stack v nogap justify-center";

      //Strings
      const title = document.createElement("span");
      const artist = document.createElement("span");
      const timeSince = document.createElement("span");

      title.innerText = song.song.title;
      artist.innerText = song.song.artist;
      timeSince.innerText = ""

      stack.append(title, artist, timeSince);

      div.appendChild(img);
      div.appendChild(stack);
      history.appendChild(div)
    }
  } catch (e) {
    console.error(e)
  }


  return {title: response.now_playing.song.title, artist: response.now_playing.song.artist, album: album,
    art: response.now_playing.song.art, startTime: response.now_playing.played_at * 1000, duration: response.now_playing.duration,
    elapsed: response.now_playing.elapsed}
}

async function getCurrentSongInfoFromIceCastStation(streamUrl) {
  return;
}

async function updateLoop() {
  let metadata = {}
  if (!currentStation) {
    await updateMetadata("Not tuned", "waves")
    return;
  }
  if (currentStation.metadata_type === "azuracast") {
    metadata = await getCurrentSongInfoFromAzuracastStation(currentStation.azuracast_server_url, currentStation.azuracast_station_shortcode);
  } else {
    metadata = await getCurrentSongInfoFromIceCastStation(currentStation.url);
  }

  const isPlaying = player.paused ? "paused" : "playing";
  await updateMetadata(metadata.title, metadata.artist, metadata.album, metadata.art, metadata.startTime, metadata.duration, isPlaying,  metadata.elapsed);

  currentSongTitle.innerText = metadata.title;
  currentSongArtist.innerText = metadata.artist;
  currentSongArt.src          = metadata.art;
}

setInterval(updateLoop, 3000);

async function updateProgressBars() {
  try {
    currentSongProgress.value = Date.now() - currentSongProgress.dataset.startTime;

  } catch (e) {
    currentSongProgress.value = 0
  }
  currentSongElapsed.innerText = convertSecondsToMinutes(Math.round(((Date.now() - currentSongProgress.dataset.startTime) / 1000)) + Number(currentSongProgress.dataset.offset))
}

setInterval(updateProgressBars, 500);

// Give user feedback on buffering

player.addEventListener('playing', function() {
  console.log('Playback started.');
  if (noise !== null) {
    noise.pause();
  }
  noise = null;
  setPlayPauseButtonIcon("playing");
  updateLoop();
});

player.addEventListener('pause', function() {
  console.log('Playback paused.');
  setPlayPauseButtonIcon("paused");
  updateLoop();

});

player.addEventListener('waiting', function() {
  console.log("Buffering...");
  noise = new Audio("assets/audio/noise.wav");
  try {
    noise.play();
  } catch (e) {
    console.error(e);
  }
  noise.volume = player.volume / 4;
  noise.loop = true;
  setPlayPauseButtonIcon("buffer");

});

window.addEventListener("hashchange", updateView);
updateView();
