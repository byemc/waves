
export default class SearchProvider {
    constructor() {
        this.userAgent = "waves js library/5.0.0";
    }

    async fetch(resource, options={}) {
        options.userAgent = this.userAgent;
        return fetch(resource,
                    options)
    }

    search(query) {
        return [];
    }
}
