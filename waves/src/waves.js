import Station  from "./station.js";

class Waves {
    constructor() {
        this.stations = {};

        this.audioContext = new AudioContext();
        this.gainNode = this.audioContext.createGain();

        this.loadingSoundElem = new Audio(); // Can be set by client.
        this.loadingSoundElem.loop = true;

        this.currentPlayer  = new Audio();
        this.currentStation = new Station();
        this.currentTrack   = this.audioContext.createMediaElementSource(this.currentPlayer);
        this.currentTrack.connect(this.gainNode).connect(this.audioContext.destination);

        const loadingTrack = this.audioContext.createMediaElementSource(this.loadingSoundElem);
        loadingTrack.connect(this.gainNode).connect(this.audioContext.destination);
    }

    setStation(station) {
        this.currentStation.stop();

        if (!this.stations[station]) {
            throw ReferenceError("Station not found.");
        }

        this.currentStation = this.stations[station];
        this.currentPlayer  = this.currentStation.player;
        // this.currentPlayer.controls = "controls";
        delete this.currentTrack;
        this.currentTrack   = this.audioContext.createMediaElementSource(this.currentPlayer);
        this.currentTrack.connect(this.gainNode).connect(this.audioContext.destination);

        this.currentPlayer.addEventListener("playing", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.pause();
        })

        this.currentPlayer.addEventListener("play", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.pause();
        })

        this.currentPlayer.addEventListener("seeked", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.pause();
        })

        this.currentPlayer.addEventListener("seeking", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.play();
        })

        this.currentPlayer.addEventListener("waiting", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.play();
        })

        this.currentPlayer.addEventListener("stalled", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.play();
        })

        this.currentPlayer.addEventListener("ended", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.play();
        })

        this.currentPlayer.addEventListener("error", ev=>{
            console.debug(`${station}:`, ev)
            this.loadingSoundElem.play();
        })
    }

    addStation(station) {
        this.stations[station.name] = station;
        console.log(`Added station ${station.name}`)
    }

    play() {
        this.currentStation.play();
    }

    // Code that deals with embedding waves
    embed() {
        document.currentScript.insertAdjacentHTML("beforebegin", EMBED)
    }
}

export default Waves;
