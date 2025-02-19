
import './scss/styles.scss';
import { version, writeVersion } from "./js/version";

console.log(`~waves~\n${version}`);

import Marquee from './js/marquee';

let toMarquee = document.querySelectorAll(".marquee");
for (let i = 0; i < toMarquee.length; i++) {
    toMarquee[i].marquee = new Marquee(toMarquee[i])
}

const nowPlayingElem = document.getElementById("now-playing");
const nowPlayingTitle = document.querySelector(".song-title");
const nowPlayingArtist = document.querySelector(".song-artist");
const nowPlayingArt = document.querySelector(".song-art");

const serverURL = new URL(document.getElementById("server").value);
serverURL.protocol = "wss"
serverURL.pathname = "/api/live/nowplaying/websocket";

const socket = new WebSocket(serverURL);

socket.addEventListener("open", () => {
    console.debug(`Opened WebSocket connection to ${socket.url}`);
    const stationKey = `station:${document.getElementById("station").value}`
    const outgoing = {
        "subs": {}
    }
    outgoing.subs[stationKey] = {recover: true};
    console.debug(`WEBSOCKET(${socket.url}):`, outgoing)
    socket.send(JSON.stringify(outgoing));
});

socket.addEventListener("message", (ev) => {
    // console.log(JSON.parse(ev.data));
    const data = JSON.parse(ev.data);
    if (!data.channel) {
        return
    }
    const stationData = data.pub.data.np;
    console.log(stationData);

    nowPlayingTitle.innerText = stationData.now_playing.song.title;
    nowPlayingArtist.innerText = stationData.now_playing.song.artist;
    nowPlayingArt.src = stationData.now_playing.song.art;
})

// Write the version number to the footer
writeVersion("version");
