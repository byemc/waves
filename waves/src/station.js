
class Station {
    constructor(name) {
        this.name = name;
        this.icon = "data:image/png;base64,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";
        this.player = new Audio();

        this.metadataSource = undefined;
    }

    play() {
        this.player.load();

        this.player.addEventListener("canplay", _=>{
            this.player.play();

            // console.log(`${this.name}: Started playing... (${this.player.duration}, ${this.player.currentTime}, ${this.player.src})`);
        }, {once: true});

    }

    stop() {
        this.player.pause();
    }
}

class URLStation extends Station {
    /**
     * Defines a Station that plays from a streamed file.
     *
     * @param props
     * @param url
     */

    constructor(props, url) {
        super(props);
        this.url = url;
        this.doCaching = false;                     // Append a random number to the filename to avoid caching issues.

        // this.player.src = this.url; // Prevent loading every time, only on first play.
        this.player.crossOrigin = "crossorigin";
    }

    play() {
        const url = new URL(this.url)
        url.search = Math.floor(Math.random() * 10000)
        this.player.src = url.toString()

        super.play()
    }
}

class HLSStation extends Station {
    /**
     * Defines a station similar to a URLStation but using HLS as the streaming format.
     * Uses HLS.js to handle playback
     *
     * @param props
     * @param url
     * @param fallbackStream
     */

    constructor(props, url, fallbackStream=null) {
        super(props);
    }
}

export default Station;
export {URLStation};
