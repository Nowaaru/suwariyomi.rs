import { invoke } from "@tauri-apps/api/tauri";
import { Chapter, Manga } from "types/manga";
import { MangaValidator } from "./sources";
import { DefaultSettings, LoadedSettings, Settings } from "./settings";
import format from "pretty-format";

const ipcFunctions = {
    path: {
        exists: async (path: string): Promise<boolean> => {
            return invoke("path_exists", { path });
        },
    },
    manga: {
        getAll: async (source?: string): Promise<Array<Manga>> => {
            return invoke("get_all_manga", { source });
        },

        getMultiple: async (
            source: string,
            ids: Array<string>
        ): Promise<Array<Manga>> => {
            return invoke("get_mangas", { source, ids });
        },
        get: async (id: string, source: string): Promise<Manga | undefined> => {
            return invoke("get_manga", { id, source });
        },

        insert: async (manga: Manga): Promise<never> => {
            return invoke("insert_manga", { manga: MangaValidator(manga) });
        },

        remove: async (id: string, source: string): Promise<never> => {
            return invoke("remove_manga", { id, source });
        },

        clear: async (): Promise<never> => {
            return invoke("clear_manga", {});
        },
    },
    chapters: {
        getAll: async (
            source?: string,
            id?: string,
            manga_id?: string
        ): Promise<Array<Chapter>> => {
            return invoke("get_all_chapters", { source, id, manga_id });
        },

        getMultiple: async (
            source: string,
            manga_id: string,
            ids: Array<string>
        ): Promise<Array<Chapter>> => {
            return invoke("get_chapters", { source, manga_id, ids });
        },

        get: async (
            source: string,
            manga_id: string,
            id: string
        ): Promise<Array<Chapter>> => {
            return invoke("get_chapter", { source, id, manga_id });
        },

        insert: async (chapter: Chapter): Promise<never> => {
            return invoke("insert_chapter", { chapter });
        },

        remove: async (manga_id: string, id: string): Promise<never> => {
            return invoke("remove_chapter", { manga_id, id });
        },

        clear: async (): Promise<never> => {
            return invoke("clear_chapters", {});
        },
    },
    app: {
        getAppSettings: async (): Promise<LoadedSettings> => {
            return invoke("get_app_settings", {}).then(
                async (res) =>
                    (res as LoadedSettings) ?? (await DefaultSettings)
            );
        },
        setAppSettings: async (
            new_settings?: LoadedSettings
        ): Promise<boolean> => {
            // TODO: Figure out why newSettings is required instead of the snake_case new_settings
            return invoke("set_app_settings", {
                newSettings: format(new_settings, {
                    printFunctionName: false,
                    printBasicPrototype: false,
                    callToJSON: true,
                }),
            });
        },
    },
    sources: {
        get: async (): Promise<Array<string>> => {
            return invoke("get_sources", {});
        },
    },
};

export default ipcFunctions;
