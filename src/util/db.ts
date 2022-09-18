import { invoke } from "@tauri-apps/api/tauri";
import { Chapter, Manga } from "types/manga";
/*
                            last_updated INT NOT NULL,
                            last_read INT NOT NULL,
                            time_spent_reading INT NOT NULL,
                            date_uploaded INT NOT NULL,
*/
export const MangaDB = {
    insert(manga: Manga) {
        if (!manga.added) manga.added = -1;
        return invoke("insert_manga", { manga });
    },

    async get(id: string, source: string): Promise<Manga | undefined> {
        return invoke("get_manga", { id, source }) as Promise<
            Manga | undefined
        >;
    },

    async get_all(source: string): Promise<Array<Manga>> {
        return invoke("get_all_manga", { source }) as Promise<Array<Manga>>;
    }
};

export const ChapterDB = {
    insert(chapter: Chapter) {
        return invoke("insert_chapter", { chapter });
    },

    async get(id: string, manga_id: string) {
        return invoke("get_chapter", { id, manga_id });
    },
};
