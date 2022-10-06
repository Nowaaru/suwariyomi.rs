class SearchCache {
    public set(data?: unknown) {
        this.data = data;
        console.log(data);
    }

    public get() {
        return this.data;
    }

    private data?: unknown;
}

export default new SearchCache();
