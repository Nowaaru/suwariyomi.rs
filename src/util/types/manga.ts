type Image = string;
type ScanlatorName = string;

export type Chapter = {
    name?: string;
    volume?: number;
    chapter: number;
    scanlators: Array<ScanlatorName>;
    id: string;

    // at minimum, the chapter and id must be defined.
};

export type Manga = {
    id: string;
    name: string;
    source: string;
    covers: Array<Image>;

    chapters: Array<Chapter>;
    uploaded: number;
};
