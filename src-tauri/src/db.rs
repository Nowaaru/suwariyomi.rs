use std::{error::Error, rc::Rc};

use rusqlite::{self, vtab::array::load_module, Connection, OptionalExtension, Row};
use serde::{Deserialize, Serialize};

use crate::errors::InternalError;

#[derive(Debug, Deserialize, Serialize)]
#[serde(transparent)]
pub struct Scanlators {
    pub scanlators: Vec<String>,
}

impl std::fmt::Display for Scanlators {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Scanlators [")?;
        for scanlator in &self.scanlators {
            write!(f, " {} ", scanlator.as_str())?;
        }

        write!(f, "]")
    }
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(transparent)]
pub struct Covers {
    pub covers: Vec<Cover>,
}

#[derive(PartialEq, Eq, Debug, Deserialize, Serialize)]
pub struct Cover {
    pub url: String,
}

impl std::fmt::Display for Covers {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Covers {{ ")?;

        self.covers.iter().for_each(|val| {
            write!(f, " {} ", val.url).unwrap();
        });

        write!(f, "}}")
    }
}

impl std::fmt::Display for Cover {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Cover {{ url: {} }}", self.url)
    }
}

#[derive(Serialize, Deserialize)]
pub struct Manga {
    pub id: String,
    pub name: String,
    pub description: String,
    pub source: String,

    pub covers: Vec<String>,
    pub authors: Vec<String>,
    pub chapters: Vec<String>,
    pub tags: Vec<String>,

    pub uploaded: i64,
    pub added: i64,
}

#[derive(Serialize, Deserialize)]
#[serde(transparent)]
pub struct Mangas {
    pub mangas: Vec<Manga>,
}

impl std::fmt::Display for Manga {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Manga {
            id,
            name,
            description,
            source,
            covers,
            chapters,
            authors,
            tags,
            uploaded,
            added,
        } = self;

        // TODO: Make this multiline
        write!(f, "Manga {{\n\tid: {}\n\tname: {}\n\tdescription: {}\n\tsource: {}\n\tcovers: {:?}\n\n\tchapters: {:?}\n\tauthors: {:?}\n\ttags: {:?}\n\tuploaded: {}\n\tadded: {}\n}}", id, name, description, source, covers, chapters, authors, tags,  uploaded, added)
    }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(transparent)]
pub struct Chapters {
    pub chapters: Vec<Chapter>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Chapter {
    pub id: String,
    pub manga_id: String,
    pub source: String,
    pub chapter: i32,
    pub volume: i32,

    pub title: String,

    pub last_read: i64,
    pub last_updated: i64,
    pub date_uploaded: i64,
    pub time_spent_reading: i64,

    pub pages: i32,
    pub total: i32,
    pub lang: String,
    pub scanlators: Vec<String>,
}

impl std::fmt::Display for Chapter {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Chapter {
            id,
            manga_id,
            chapter,
            volume,
            title,
            last_read,
            date_uploaded,
            last_updated,
            time_spent_reading,
            pages,
            total,
            lang,
            scanlators,
            source,
        } = self;

        writeln!(f, "Chapter {{")?;
        writeln!(f, "\tid: {}", id)?;
        writeln!(f, "\tmanga_id: {}", manga_id)?;
        writeln!(f, "\tsource: {}", source)?;
        writeln!(f, "\tchapter: {}", chapter)?;
        writeln!(f, "\tvolume: {}", volume)?;
        writeln!(f, "\ttitle: {}", title)?;
        writeln!(f, "\tlast_read: {}", last_read)?;
        writeln!(f, "\tlast_updated: {}", last_updated)?;
        writeln!(f, "\tdate_uploaded: {}", date_uploaded)?;
        writeln!(f, "\ttime_spent_reading: {}", time_spent_reading)?;
        writeln!(f, "\tpages: {}", pages)?;
        writeln!(f, "\ttotal: {}", total)?;
        writeln!(f, "\tlang: {}", lang)?;
        writeln!(f, "\tscanlators: {:#?}", scanlators)?;
        write!(f, "}}")
    }
}

pub struct MangaDB {
    db: Connection,
}

pub struct ChapterDB {
    db: Connection,
}

pub struct DBHandler {
    pub manga_db: MangaDB,
    pub chapter_db: ChapterDB,
}

fn generate_manga_from_row(row: &Row) -> Result<Manga, rusqlite::Error> {
    Ok(Manga {
        id: row.get("id")?,
        name: row.get("name")?,
        description: row.get("description")?,
        source: row.get("source")?,

        covers: serde_json::from_str(row.get::<&str, String>("covers")?.as_str()).unwrap(),
        authors: serde_json::from_str(row.get::<&str, String>("authors")?.as_str()).unwrap(),
        chapters: serde_json::from_str(row.get::<&str, String>("chapters")?.as_str()).unwrap(),
        tags: serde_json::from_str(row.get::<&str, String>("tags")?.as_str()).unwrap(),

        uploaded: row.get("uploaded")?,
        added: row.get("added")?,
    })
}

fn generate_chapter_from_row(row: &Row) -> Result<Chapter, rusqlite::Error> {
    Ok(Chapter {
        id: row.get("id")?,
        manga_id: row.get("manga_id")?,
        source: row.get("source")?,

        title: row.get::<&str, String>("title")?,

        chapter: row.get::<&str, i32>("chapter")?,
        volume: row.get::<&str, i32>("volume")?,

        last_read: row.get::<&str, i64>("last_read")?,
        date_uploaded: row.get::<&str, i64>("date_uploaded")?,
        last_updated: row.get::<&str, i64>("last_updated")?,
        time_spent_reading: row.get::<&str, i64>("time_spent_reading")?,

        pages: row.get::<&str, i32>("pages")?,
        total: row.get::<&str, i32>("total")?,

        lang: row.get::<&str, String>("lang")?,
        scanlators: serde_json::from_str(row.get::<&str, String>("scanlators")?.as_str())
            .unwrap_or(vec![]),
    })
}

impl MangaDB {
    pub fn new(path: &Option<std::path::PathBuf>) -> Self {
        // Make tables if not present.
        // let db = if path.is_none() { Connection::open_in_memory().expect("unable to open in-memory database") }
        //        else { Connection::open(path.unwrap()).expect("unable to open database") };

        let db = if let Some(path) = path {
            let p2 = path.clone();
            Connection::open(path).unwrap_or_else(|_| {
                panic!("unable to open database from path {}", p2.to_str().unwrap())
            })
        } else {
            Connection::open_in_memory().expect("unable to open in-memory database")
        };

        match db.execute(
            "
                         CREATE TABLE IF NOT EXISTS Library
                         (
                             id TEXT NOT NULL PRIMARY KEY,
                             name TEXT NOT NULL,
                             source TEXT NOT NULL,
                             covers TEXT NOT NULL,

                             chapters TEXT NOT NULL,
                             description TEXT NOT NULL,
                             authors TEXT NOT NULL,
                             tags TEXT NOT NULL,

                             uploaded INT NOT NULL,
                             added INT NOT NULL
                        )
                         ",
            [],
        ) {
            Ok(_) => println!("Table was created."),
            Err(why) => println!("Failed: {}", why),
        }

        Self { db }
    }

    pub fn insert(&self, manga: Manga) -> Result<usize, rusqlite::Error> {
        let Manga {
            id,
            name,
            source,
            description,
            authors,
            tags,
            covers,
            chapters,
            uploaded,
            added,
        } = manga;

        self.db.execute(
            "REPLACE INTO Library
                    (id, name, source, covers, chapters, uploaded, added, description, authors, tags)
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            (
                id,
                name,
                source,
                serde_json::to_string(&covers).unwrap(),
                serde_json::to_string(&chapters).unwrap(),
                uploaded,
                added,
                description,
                serde_json::to_string(&authors).unwrap(),
                serde_json::to_string(&tags).unwrap(),
            ),
        )
    }

    pub fn delete(&self, id: String, source: String) -> Result<Option<usize>, rusqlite::Error> {
        self.db
            .execute(
                "DELETE * FROM LIBRARY WHERE id = ?1 AND source = ?2 ",
                [id, source],
            )
            .optional()
    }

    pub fn get(&self, id: String, source: String) -> Result<Option<Manga>, rusqlite::Error> {
        self.db
            .query_row(
                "SELECT * FROM Library WHERE id = ?1 AND source = ?2",
                [id, source],
                |row| generate_manga_from_row(row),
            )
            .optional()
    }

    pub fn get_multiple(
        &self,
        source: String,
        ids: Vec<String>,
    ) -> Result<std::vec::Vec<Manga>, rusqlite::Error> {
        load_module(&self.db).unwrap();
        let mut prepared_rows = self
            .db
            .prepare("SELECT * FROM Library where source = ?1 AND id IN rarray(?2)")?;
        let values_iter: Vec<rusqlite::types::Value> =
            ids.into_iter().map(rusqlite::types::Value::from).collect();
        let iter = prepared_rows.query_map((source, Rc::new(values_iter)), |row| {
            generate_manga_from_row(row)
        })?;

        Ok(iter.map(|res| res.unwrap()).collect::<Vec<Manga>>())
    }

    pub fn get_all(&self, source: Option<String>) -> Result<Vec<Manga>, rusqlite::Error> {
        // FIXME: this shit
        // oh lord. here we go again.

        if let Some(source) = source {
            let mut prepared_rows = self.db.prepare("SELECT * FROM Library WHERE source = ?1")?;
            let iter = prepared_rows.query_map([source], |row| generate_manga_from_row(row))?;

            Ok(iter.map(|v| v.unwrap()).collect::<Vec<Manga>>())
        } else {
            let mut prepared_rows = self.db.prepare("SELECT * FROM Library")?;
            let iter = prepared_rows.query_map([], |row| generate_manga_from_row(row))?;

            Ok(iter.map(|v| v.unwrap()).collect::<Vec<Manga>>())
        }
    }

    pub fn clear(&self) -> Result<(), rusqlite::Error> {
        match self.db.execute("DELETE FROM Library", []) {
            Ok(..) => Ok(()),
            Err(y) => Err(y),
        }
    }
}

impl ChapterDB {
    pub fn new(path: &Option<std::path::PathBuf>) -> Self {
        let db: Connection = if let Some(path) = path {
            let p2 = path.clone();
            Connection::open(path).unwrap_or_else(|_| {
                panic!("unable to open database with path {}", p2.to_str().unwrap())
            })
        } else {
            Connection::open_in_memory().expect("unable to open database")
        };

        match db.execute(
            "
                         CREATE TABLE IF NOT EXISTS Chapters
                         (
                            id TEXT NOT NULL PRIMARY KEY,
                            manga_id TEXT NOT NULL,
                            source TEXT NOT NULL,
                            chapter INT NOT NULL,
                            volume INT NOT NULL,

                            title TEXT NOT NULL,

                            last_updated INT NOT NULL,
                            last_read INT NOT NULL,
                            time_spent_reading INT NOT NULL,
                            date_uploaded INT NOT NULL,

                            pages INT NOT NULL,
                            total INT NOT NULL,
                            scanlators TEXT NOT NULL
                            lang TEXT NOT NULL
                        )
                         ",
            [],
        ) {
            Ok(_) => println!("Chapters table was created."),
            Err(why) => println!("Chapters failed: {}", why),
        }

        Self { db }
    }

    pub fn insert(&self, chapter: Chapter) -> Result<usize, rusqlite::Error> {
        let Chapter {
            id,
            manga_id,
            title,
            chapter,
            volume,
            last_read,
            date_uploaded,
            last_updated,
            time_spent_reading,
            pages,
            total,
            lang,
            scanlators,
            source,
        } = chapter;

        self.db.execute(
            "REPLACE INTO Chapters
                (id, manga_id, title, chapter, volume, last_read, date_uploaded, last_updated, time_spent_reading, pages, total, scanlators, lang, source)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
             (
                 id,
                 manga_id,
                 title,
                 chapter,
                 volume,
                 last_read,
                 date_uploaded,
                 last_updated,
                 time_spent_reading,
                 pages,
                 total,
                 serde_json::to_string(&scanlators).unwrap(),
                 lang,
                 source,
            )
        )
    }

    pub fn get(
        &self,
        source: String,
        chapter_id: String,
        manga_id: String,
    ) -> Result<Option<Chapter>, rusqlite::Error> {
        self.db
            .query_row(
                "SELECT * FROM Chapters WHERE id = ?1 AND manga_id = ?2 AND source = ?3",
                [chapter_id, manga_id, source],
                |row| generate_chapter_from_row(row),
            )
            .optional()
    }

    pub fn get_multiple(
        &self,
        source: String,
        manga_id: String,
        ids: Vec<String>,
    ) -> Result<std::vec::Vec<Chapter>, rusqlite::Error> {
        load_module(&self.db).unwrap();
        let mut prepared_rows = self.db.prepare(
            "SELECT * FROM Chapters where manga_id = ?1 and source = ?2 AND id IN rarray(?2)",
        )?;
        let values_iter: Vec<rusqlite::types::Value> =
            ids.into_iter().map(rusqlite::types::Value::from).collect();
        let iter = prepared_rows.query_map((manga_id, source, Rc::new(values_iter)), |row| {
            generate_chapter_from_row(row)
        })?;

        Ok(iter.map(|res| res.unwrap()).collect::<Vec<Chapter>>())
    }

    pub fn get_all(&self, manga_id: Option<String>) -> Result<Vec<Chapter>, rusqlite::Error> {
        // FIXME: turn iter repetition into a function
        // fuckin christ this code is dog shitty ass

        let mut prepared_rows;
        if let Some(manga_id) = manga_id {
            prepared_rows = self
                .db
                .prepare("SELECT * FROM Chapters WHERE manga_id = ?1")?;

            match prepared_rows.query_map([manga_id], |row| generate_chapter_from_row(row)) {
                Ok(iter) => Ok(iter.map(|v| v.unwrap()).collect::<Vec<Chapter>>()),
                Err(why) => Err(why),
            }
        } else {
            prepared_rows = self.db.prepare("SELECT * FROM Chapters")?;

            match prepared_rows.query_map([], |row| generate_chapter_from_row(row)) {
                Ok(iter) => Ok(iter.map(|v| v.unwrap()).collect::<Vec<Chapter>>()),
                Err(why) => Err(why),
            }
        }
    }

    pub fn delete(&self, manga_id: String, id: String) -> Result<Option<usize>, rusqlite::Error> {
        self.db
            .execute(
                "DELETE * FROM Chapters WHERE manga_id = ?1 AND id = ?2",
                [manga_id, id],
            )
            .optional()
    }

    pub fn clear(&self) -> Result<(), rusqlite::Error> {
        match self.db.execute("DELETE FROM Chapters", []) {
            Ok(..) => Ok(()),
            Err(y) => Err(y),
        }
    }
}

pub fn init(mut _path: &std::path::PathBuf) -> Result<DBHandler, crate::errors::InternalError> {
    // Create database files in the app folder
    // For now, open the database in memory for testing purposes.
    // path.push("sw.db");

    let manga_handler = MangaDB::new(&None);
    let chapter_handler = ChapterDB::new(&None);

    Ok(DBHandler {
        manga_db: manga_handler,
        chapter_db: chapter_handler,
    })
}
