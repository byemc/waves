
class Station {
    constructor(name) {
        this.name = name;
        this.player = new Audio();

        this.player.addEventListener("seeking", _ => {
            console.log(`${this.name}: Started seeking... (${this.player.duration}, ${this.player.currentTime})`);
        });

        this.player.addEventListener("seeked", _ => {
            console.log(`${this.name}: Seeked... (${this.player.duration}, ${this.player.currentTime})`);
        });

        this.metadataSource = undefined;
    }

    play() {
        this.player.load();

        this.player.addEventListener("canplay", _=>{
            this.player.play();

            console.log(`${this.name}: Started playing... (${this.player.duration}, ${this.player.currentTime}, ${this.player.src})`);
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
        this.doCaching = false; // Append a random number to the filename to avoid caching issues.

        this.player.src = this.url;
        this.player.crossOrigin = "crossorigin";
    }

    play() {
        const url = new URL(this.url)
        url.search = Math.floor(Math.random() * 10000)
        this.player.src = url.toString()

        super.play()
    }
}

export default Station;
export {URLStation};
