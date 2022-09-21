type CoverUrl = string
type ChapterId = string;
type Author = string;
type Scanlator = string;
type Tag = string;
type Scanlators = Array<Scanlator>;
type int = number;

export type Chapter = {
    id: string,
    manga_id: string,
    source: string,
    chapter: int,
    volume: int,

    title?: string,

    last_read: int,
    date_uploaded: int,
    last_updated: int,
    time_spent_reading: int,

    pages: int,
    total: int,
    lang: string,
    scanlators: Scanlators,
};

export type Manga = {
    id: string;
    name: string;
    description: string;
    source: string;

    covers: Array<CoverUrl>;
    authors: Array<Author>;
    chapters: Array<ChapterId>;
    tags: Array<Tag>

    uploaded: number;
    added: number;
};
/*
 *
pub struct Chapter {
    pub id: String,
    pub manga_id: String, // The manga it belongs to.
    pub chapter: i32,
    pub volume: i32,

    pub title: String,

    pub last_read: i32,
    pub last_updated: i32,
    pub time_spent_reading: i32,

    pub pages: i32,
    pub count: i32,
    pub scanlators: std::vec::Vec<String>,
}
*/
