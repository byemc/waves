import SearchProvider from "./searchProvider.js";
import {URLStation} from "../station.js";

export default class RadioBrowser extends SearchProvider {
    // Some of these functions are based off https://api.radio-browser.info/examples/serverlist-browser.js

    constructor(props) {
        super(props);

        this.baseURL = "http://all.api.radio-browser.info";
        this.getRandomAPIServer().then(data=>{this.baseURL = data})
    }

    async getAPIBaseURLs() {
        const request = await this.fetch("http://all.api.radio-browser.info/json/servers");
        if (request.status >= 200 && request.status < 300) {
            const items = (await request.json()).map(x=>"https://"+x.name);
            return items;
        }
        throw Error(`HTTP Error ${request.status} — ${request.statusText}`)
    }

    async getAPISettings() {
        const request = await this.fetch("http://all.api.radio-browser.info/json/config");
        if (request.status >= 200 && request.status < 300) {
            return await request.json();
        }
        throw Error(`HTTP Error ${request.status} — ${request.statusText}`)
    }

    async getRandomAPIServer() {
        const hosts = await this.getAPIBaseURLs()
        return hosts[Math.floor(Math.random() * hosts.length)];
    }

    async search(query) {
        const params = new URLSearchParams();
        params.set("name", query);
        params.set("hidebroken", true);
        const url = new URL(`${this.baseURL}/json/stations/search`);
        url.search = params.toString()
        const results = await this.fetch(url.toString());
        const output = [];
        for (const station of await results.json()) {
            const newStation = new URLStation(station.name, station.url);
            newStation.icon = station.favicon || newStation.icon;
            output.push(newStation)
        }

        return output;
    }
}
