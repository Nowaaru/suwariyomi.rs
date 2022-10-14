import { fs, path } from "@tauri-apps/api";
import { invoke } from "@tauri-apps/api/tauri";
import { Chapter, Manga } from "types/manga";
import { SearchFilters } from "types/search";

import _ from "lodash";
import fetch from "util/fetch";

type HexColor = string;
export abstract class Source {
    public abstract getManga(mangaId: string): Promise<Manga>;

    public abstract getMangaUrl(mangaId: string): string;

    public abstract getChapterUrl(
        mangaId: string,
        chapterId: string,
        pageNumber?: number | null
    ): string;

    public abstract getPages(
        mangaId: string,
        chapterId: string
    ): Promise<Array<string>>;

    public abstract getChapters(
        mangaId: string,
        offset?: number,
        sortOrder?: {
            [K in
                | "createdAt"
                | "updatedAt"
                | "volume"
                | "chapter"]?: "asc" | "desc";
        }
    ): Promise<{ data: Array<Chapter>; total: number }>;

    public abstract search(
        query: string,
        offset: number,
        tree: Record<string, unknown>
    ): Promise<{ total: number; data: Array<Manga> }>;

    public abstract setFilters(newFilters: SearchFilters): void;

    public abstract get id(): string;

    public abstract get icon(): string;

    public abstract get tags(): Promise<Array<string>>;

    public abstract get downloadable(): boolean;

    public abstract get colors(): Record<string, HexColor>;

    public abstract get filters(): SearchFilters;
}

const evalCache: Record<string, Source> = {};
async function dynamicImport(targetPath: string) {
    const myPath = await path.resolve(targetPath);
    const readFile = await fs.readTextFile(myPath);

    if (!evalCache[readFile])
        evalCache[readFile] = new (
            await import(
                `data:text/javascript;charset=utf-8,${encodeURIComponent(
                    readFile
                )}`
                /* @vite-ignore */
            )
        ).default({ fetch });

    return evalCache[readFile];
}

type SourceDirPath = string;
export class SourceHandler {
    constructor() {
        const allSources = invoke("get_sources") as Promise<Array<string>>;
        this.sourceArray = [];
        allSources.then((dirs) => {
            this.sourceArray.push(
                new Promise((resolve, rej) => {
                    dirs.forEach(async (res) => {
                        const pathToMain = await path.join(
                            res as SourceDirPath,
                            "main.js"
                        );

                        (
                            invoke("path_exists", {
                                path: pathToMain,
                            }) as Promise<boolean>
                        ).then((exists) => {
                            if (!exists) return rej(false);
                            dynamicImport(pathToMain).then((requiredSource) => {
                                this.sources[requiredSource.id] =
                                    requiredSource;

                                this.defaults[requiredSource.id] =
                                    Object.freeze({
                                        ...requiredSource.filters,
                                    });

                                resolve(requiredSource);
                            });
                        });
                    });
                })
            );
        });
    }

    public get sourcesArray() {
        return [...this.sourceArray];
    }

    public async loaded() {
        await Promise.all(this.sourcesArray);
    }

    public getSource(sourceId: keyof typeof this.sources): Source {
        return this.sources[sourceId];
    }

    public defaultFilters(sourceId: keyof typeof this.sources): SearchFilters {
        return _.cloneDeep(this.defaults[sourceId]);
    }

    public async querySource(
        sourceId: keyof typeof this.sources
    ): Promise<Source | undefined> {
        let sourcesQueried = 0;
        return new Promise((res, rej) => {
            this.sourceArray.forEach((source) => {
                source
                    .then((assumedSource) => {
                        sourcesQueried += 1;
                        if (assumedSource.id === sourceId) res(source);
                        else if (sourcesQueried === this.sourceArray.length)
                            res(undefined);
                    })
                    .catch(rej);
            });
        });
    }

    private sourceArray: Array<Promise<Source>>;
    private defaults: Record<string, SearchFilters> = {};
    private sources: Record<string, Source> = {};
}

const assert = (
    cond: unknown,
    res?: string,
    options?: { loose?: boolean; warn?: boolean; fail?: () => unknown }
) => {
    const { loose, warn, fail = _.noop } = options ?? {};
    if (
        (!loose && (cond === false || _.isNil(cond))) ||
        (loose && (cond == false || _.isNil(cond)))
    ) {
        fail();
        if (!warn) throw new Error(res);

        console.warn(`[VALIDATOR] ${res}`);
        return false;
    }
    return true;
};

export const MangaValidator = (manga: Manga) => {
    assert(manga && !_.isEmpty(manga), "the manga should be defined");

    const {
        source,
        id,
        added,
        authors,
        chapters,
        covers,
        description,
        name,
        tags,
        uploaded,
    } = manga;

    assert(source, "field 'source' should be defined");
    assert(id, "field 'id' should be defined");

    assert(
        !_.isNaN(added) && added >= -1,
        "field 'added' should be a number greater or equal to -1"
    );

    assert(_.isArray(authors), "field 'authors' should be an array");
    assert(
        chapters?.every(_.isString),
        "field 'chapters' should be an array of chapter ids (strings)"
    );
    assert(
        covers?.every(_.isString),
        "field 'chapters' should be an array of covers (strings)"
    );

    assert(
        description,
        "field 'description' should be a string. since this is fixed internally by the reader, do not fret!",
        {
            warn: true,
            fail: () => {
                manga.description = "";
            },
        }
    );

    assert(_.isString(name), "field 'name' should be a string");
    assert(
        tags?.every(_.isString),
        "field 'tags' should be an array of strings"
    );
    assert(
        !_.isNaN(uploaded),
        "field 'uploaded' should be a number greater or equal to -1"
    );

    return manga;
};

export async function getAllChapters(sourceHandler: Source, mangaId: string) {
    let expectedTotal = null;
    const allChapters: Array<Chapter> = [];

    while (Math.random() < 500) {
        const mangaResult = await sourceHandler
            ?.getChapters(mangaId)
            .then(({ data, total }) => ({
                data: data
                    .filter(({ lang }) => lang === "en"),
                total,
            }))
            .catch(console.error);

        if (!mangaResult) return allChapters;
        if (!expectedTotal) expectedTotal = mangaResult.total ?? 150;

        const addedChapters = mangaResult.data.filter(
            (ch) => !allChapters.find((n) => n.id === ch.id)
        );

        if (addedChapters.length > 0) {
            allChapters.push(...addedChapters);
            if (allChapters.length > expectedTotal) return allChapters;

            continue;
        }

        break;
    }

    return allChapters;
}

export default new SourceHandler();
