import Station  from "./station.js";
import {levDistance} from "./misc/sorting.js";

function supportsMSA() {
    // Returns a boolean signalling if the browser supports the Media Source API (and therefore HLS, admittedly not natively)
    return !!(window['MediaSource'] || window['WebKitMediaSource']); // Gets the objects, inverts it (converting it to bool), inverts it again (shows if initial value was truthy or falsy)
}

function supportsHLS() {
    // Returns a boolean signalling if the browser supports HLS natively (Safari + mobile browsers)
    // https://stackoverflow.com/questions/40039076/how-can-i-precisely-detect-hls-support-on-different-browsers-and-different-os
    var video = document.createElement('video');
    return Boolean(video.canPlayType('application/vnd.apple.mpegURL') || video.canPlayType('audio/mpegurl'))
}

class Waves extends EventTarget {
    constructor() {
        super();

        window.waves = this;                                // Register self to window. This won't cause issues at all!

        this.stations       = {};

        this.audioContext   = new AudioContext();
        this.gainNode       = this.audioContext.createGain();

        this.loadingSoundElem = new Audio();                // Can be set by client.
        this.loadingSoundElem.loop = true;

        this.currentPlayer  = new Audio();
        this.currentStation = new Station();
        this.currentTrack   = this.audioContext.createMediaElementSource(this.currentPlayer);
        this.currentTrack.connect(this.gainNode).connect(this.audioContext.destination);

        this.realState    = "unknown";

        const loadingTrack = this.audioContext.createMediaElementSource(this.loadingSoundElem);
        loadingTrack.connect(this.gainNode).connect(this.audioContext.destination);

        // Check if the client supports HLS
        this.supportsHLS = supportsHLS();
        this.supportsMSA = supportsMSA();

        this.addEventListener("playing",  this.setStatePlaying)
        // this.addEventListener("play",     this.setStatePlaying)
        this.addEventListener("seeked",   this.setStatePlaying)
        this.addEventListener("seeking",  this.setStateLoading)
        this.addEventListener("waiting",  this.setStateLoading)
        this.addEventListener("stalled",  this.setStateLoading)
        this.addEventListener("ended",    this.setStateStopped)
        this.addEventListener("pause",    this.setStateStopped)
        this.addEventListener("error",    this.setStateLoading)
    }

    set loadingSound(url) {
        this.loadingSound.src = url;
        this.loadingSound.load()
    }

    get loadingSound() {
        return this.loadingSoundElem
    }

    set state(state) {
        this.realState = state;

        const event = new CustomEvent("stateChanged", {
            detail: {state: this.realState, station: this.currentStation}
        });

        this.dispatchEvent(event);
    }

    get state() {
        return this.realState
    }

    setStatePlaying(ev=undefined) {
        console.debug(`${this.currentStation.name}:`, ev ? ev.type : "Playing (generic)")
        this.state = "playing";
        this.loadingSound.pause();
    }

    setStateLoading(ev=undefined) {
        console.debug(`${this.currentStation.name}:`, ev ? ev.type : "Loading (generic)")
        this.state = "loading";
        this.loadingSound.play();
    }

    setStateStopped(ev=undefined) {
        console.debug(`${this.currentStation.name}:`, ev ? ev.type : "Stopped (generic)")
        this.state = "stopped";
        this.loadingSound.pause();
    }

    raiseEvent(ev) {
        // Forwards the event to Waves
        // This is because `this` in this context is actually `this.currentPlayer`
        const event = new Event(ev.type);
        console.debug(`Raising ${ev.type} event from ${ev.target} to Waves...`)
        waves.dispatchEvent(event);
    }

    setStation(station, preventAutoPlay=false) {
        this.currentStation.stop();
        if (!preventAutoPlay) this.loadingSound.play();

        if (!this.stations[station]) {
            throw ReferenceError("Station not found.");
        }

        // Disconnect the previous track
        this.currentTrack.disconnect();
        delete this.currentTrack;
        // Remove event listeners
        this.currentPlayer.removeEventListener("playing",  this.raiseEvent);
        this.currentPlayer.removeEventListener("seeked",   this.raiseEvent);
        this.currentPlayer.removeEventListener("seeking",  this.raiseEvent);
        this.currentPlayer.removeEventListener("waiting",  this.raiseEvent);
        this.currentPlayer.removeEventListener("stalled",  this.raiseEvent);
        this.currentPlayer.removeEventListener("ended",    this.raiseEvent);
        this.currentPlayer.removeEventListener("pause",    this.raiseEvent);
        this.currentPlayer.removeEventListener("error",    this.raiseEvent);

        // Switch the station over
        this.currentStation = this.stations[station];
        this.currentPlayer  = this.currentStation.player;
        // Make new audio track for the context
        this.currentTrack   = this.audioContext.createMediaElementSource(this.currentPlayer);
        this.currentTrack.connect(this.gainNode).connect(this.audioContext.destination);

        // Forward event listeners
        this.currentPlayer.addEventListener("playing",  this.raiseEvent);
        this.currentPlayer.addEventListener("seeked",   this.raiseEvent);
        this.currentPlayer.addEventListener("seeking",  this.raiseEvent);
        this.currentPlayer.addEventListener("waiting",  this.raiseEvent);
        this.currentPlayer.addEventListener("stalled",  this.raiseEvent);
        this.currentPlayer.addEventListener("ended",    this.raiseEvent);
        this.currentPlayer.addEventListener("pause",    this.raiseEvent);
        this.currentPlayer.addEventListener("error",    this.raiseEvent);

        const event = new CustomEvent("stationChanged", {detail: {station}})
        this.dispatchEvent(event)

        if (!preventAutoPlay) this.currentStation.play();
    }

    addStation(station) {
        this.stations[station.name] = station;
        this.dispatchEvent(
            new CustomEvent("stationAdded", {detail: {station}})
        )
    }

    play() {
        this.audioContext.resume().then(r => {console.log("Resumed audio context.")});
        this.currentStation.play();
    }

    stop() {
        this.currentStation.stop();
    }

    async searchStations(query, providers=[]) {
        let output = [];
        if (providers) {
            for (const provider of providers) {
                let results = await provider.search(query);
                results.map(value => {value.lev = levDistance(value.name, query); output.push(value)});
            }
            output.sort((a, b) => {
                if (a.lev < b.lev) return -1;
                if (b.lev < a.lev) return 1;
                return 0;
            })
        }
        return output;
    }

    // Helper functions to speed up development
    playpause() {
        // Handles automatically choosing to play or pause.
        if (this.state === "playing" || this.state === "loading") {
            this.stop();
        }
        else {
            this.play();
        }
    }
}

export default Waves;
