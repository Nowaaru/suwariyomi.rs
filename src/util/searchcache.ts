import {Status} from "components/searchsource";
import {Manga} from "types/manga";

export type Search = {
    query: string;
    scope?: string;
    results: Record<
        string,
        {
            status: Status;
            manga: Array<Manga>;
        }
    >;
};

class SearchCache {
    public set(data?: Search) {
        this.data = data;
    }

    public get() {
        return this.data;
    }

    public scroll?: number;

    private data?: Search;
}



export default new SearchCache();
