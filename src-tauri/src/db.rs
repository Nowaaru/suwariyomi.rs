use std::convert::Infallible;

use crate::errors::{self, InternalError};
use rusqlite::{self, Connection, OptionalExtension};

pub struct Covers {
    covers: std::vec::Vec<Cover>,
}

#[derive(PartialEq, Eq)]
pub struct Cover {
    url: String,
}

pub struct Manga {
    id: String,
    name: String,
    source: String,
    covers: Covers,

    chapters: String,
    uploaded: i32,
    added: i32,
}

impl std::fmt::Display for Covers {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Covers {{ ")?;

        self.covers.iter().for_each(|val| {
            write!(f, "{} ", val.url).unwrap();
        });

        write!(f, "}}")
    }
}

impl std::fmt::Display for Cover {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Cover {{ url: {} }}", self.url)
    }
}

impl std::fmt::Display for Manga {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let Manga {
            id,
            name,
            source,
            covers,
            chapters,
            uploaded,
            added,
        } = self;
        write!(f, "Manga {{\n\tid: {}\n\tname: {}\n\tsource: {}\n\tcovers: {}\n\n\tchapters: {}\n\tuploaded: {}\n\tadded: {}\n}}", id, name, source, covers, chapters, uploaded, added)
    }
}

struct Chapter {
    id: String,
    manga_id: String, // The manga it belongs to.
    chapter: i32,
    volume: i32,

    title: String,

    last_read: i32,
    last_updated: i32,
    time_spent_reading: i32,

    pages: i32,
    count: i32,
    scanlators: std::vec::Vec<String>,
}

struct MangaDB {
    db: Connection,
}

struct ChapterDB {
    db: Connection,
}

pub struct DBHandler {
    manga_db: MangaDB,
    chapter_db: ChapterDB,
}

impl MangaDB {
    pub fn new(path: Option<std::path::PathBuf>) -> Self {
        // Make tables if not present.
        let db = if path.is_none() { Connection::open_in_memory().expect("unable to open in-memory database") }
                else { Connection::open(path.unwrap()).expect("unable to open database") };

        // Since arrays cannot be stored in SQL, just have covers be a JSON array. Same with
        // chapters
        match db.execute("
                         CREATE TABLE IF NOT EXISTS Library 
                         (
                             id TEXT NOT NULL PRIMARY KEY, 
                             name TEXT NOT NULL, 
                             source TEXT NOT NULL, 
                             covers TEXT NOT NULL, 
                             chapters TEXT NOT NULL, 
                             uploaded INT NOT NULL,
                             added INT NOT NULL
                        )
                         ", []) 
        {
            Ok(_) => println!("Table was created."),
            Err(why) => println!("Failed: {}", why),
        }

        Self {
            db
        }
    }

    pub fn insert(&self, manga: Manga) -> Result<usize, rusqlite::Error> {
        let Manga {
            id,
            name,
            source,
            covers,
            chapters,
            uploaded,
            added,
        } = manga;
        let mut serialized_covers = String::new();
        for cover in covers.covers.iter() {
            let mut cover_with_separator = cover.url.clone();
            cover_with_separator.push_str("$$");
            serialized_covers.push_str(cover_with_separator.as_str());
        }

        self.db.execute(
            "INSERT INTO Library 
                    (id, name, source, covers, chapters, uploaded, added) 
                VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            (
                id,
                name,
                source,
                serialized_covers,
                chapters,
                uploaded,
                added,
            ),
        )
    }

    pub fn delete(&self, id: String) -> Result<Option<usize>, rusqlite::Error> {
        self.db
            .execute("DELETE * FROM LIBRARY WHERE id = ?1", [id])
            .optional()
    }

    pub fn get_from_id(&self, id: String) -> Result<Option<Manga>, rusqlite::Error> {
        self.db
            .query_row("SELECT * FROM Library WHERE id = ?1", [id], |row| {
                Ok(Manga {
                    id: row.get("id").unwrap(),
                    name: row.get("name").unwrap(),

                    source: row.get("source").unwrap(),
                    covers: Covers {
                        covers: row
                            .get::<&str, std::string::String>("covers")
                            .unwrap()
                            .split("$$")
                            .map(|url| Cover {
                                url: url.to_string(),
                            })
                            .collect::<std::vec::Vec<Cover>>(),
                    },
                    chapters: row.get("chapters").unwrap(),
                    uploaded: row.get("uploaded").unwrap(),
                    added: row.get("added").unwrap(),
                })
            })
            .optional()
    }
}

impl ChapterDB {
    pub fn new(path: Option<std::path::PathBuf> ) -> Self {
        let db: Connection;
        if let None = path {
            db = Connection::open_in_memory().expect("unable to open in-memory database");
        } else { 
            let path = path.unwrap();
            let p2 = path.clone();
            db = Connection::open(path).expect( 
                format!("unable to open database with path {}", 
                        p2
                            .to_str()
                            .unwrap() 
                       )
                .as_str() 
            )  
        }
        match db.execute("
                         CREATE TABLE IF NOT EXISTS Chapters 
                         (
                            id TEXT NOT NULL PRIMARY KEY,
                            manga_id TEXT NOT NULL,
                            title TEXT NOT NULL, 
                            chapter INT NOT NULL,
                            volume INT NOT NULL,
                            last_read INT NOT NULL,
                            last_updated INT NOT NULL,
                            time_spent_reading INT NOT NULL,
                            pages INT NOT NULL, 
                            count INT NOT NULL,
                            scanlators TEXT NOT NULL
                        ) 
                         ", []
                        ) 
        {            
            Ok(_) => println!("Chapters table was created."),       
            Err(why) => println!("Chapters failed: {}", why)         
        }

        Self {  
            db 
        }
    }

    pub fn insert(&self, chapter: Chapter) -> Result<usize, rusqlite::Error> {
        let Chapter {
            id, 
            manga_id,
            title,
            chapter,
            volume,
            last_read,
            last_updated,
            time_spent_reading,
            pages,
            count,
            scanlators
        } = chapter;

        self.db.execute(
            "INSERT INTO Chapters
                (id, manga_id, title, chapter, volume, last_read, last_updated, time_spent_reading, pages, count, scanlators)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
             (
                 id, 
                 manga_id,
                 title,
                 chapter,
                 volume,
                 last_read,
                 last_updated,
                 time_spent_reading,
                 pages,
                 count,
                 scanlators.join("$$"),
            )
        )
    }

    pub fn get_from_id(&self, chapter_id: String) -> Result<Option<Chapter>, rusqlite::Error> {
         self.db.query_row("SELECT * FROM Chapters WHERE id = ?1", [chapter_id], | row | Ok(Chapter {
            id: row.get("id").unwrap(),
            manga_id: row.get("manga_id").unwrap(),
            
            title: row.get::<&str, std::string::String>("title").unwrap(),

            chapter: row.get::<&str, i32>("chapter").unwrap(),
            volume: row.get::<&str, i32>("volume").unwrap(),

            last_read: row.get::<&str, i32>("last_read").unwrap(),
            last_updated: row.get::<&str, i32>("last_upated").unwrap(),
            time_spent_reading: row.get::<&str, i32>("time_spent_reading").unwrap(),
            
            pages: row.get::<&str, i32>("pages").unwrap(),
            count: row.get::<&str, i32>("count").unwrap(),

            scanlators: row.get::<&str, std::string::String>("scanlators")
                .unwrap()
                .split("$$")
                .map(|v| v.to_string())
                .collect::< std::vec::Vec<String> >()
        })).optional()
    }
}

pub fn init(mut _path: &std::path::PathBuf) -> Result<DBHandler, errors::InternalError> {
    // Create database files in the app folder
    // For now, open the database in memory for testing purposes.
    // path.push("sw.db");

    let manga_handler = MangaDB::new(None);
    let chapter_handler = ChapterDB::new(None);
    manga_handler.insert(Manga {
        name: "Fuzoroi no Renri".to_string(),
        source: "MangaDex".to_string(),
        id: "153779b6-0d55-4681-99ba-f42ca58de385".to_string(),
        covers: Covers {
            covers: vec![
                Cover { 
                    url: "https://mangadex.org/covers/153779b6-0d55-4681-99ba-f42ca58de385/7355c533-0e1f-407f-b100-5639eeef21f9.jpg"
                        .to_string() 
                }
            ]
        },
        chapters: "".to_string(),
        added: 0,
        uploaded: 0,
    }).expect("Failed to insert.");

    match manga_handler.get_from_id("1".to_string()) {
        Ok(Some(val)) => {
            println!("{}", val);
        }
        Ok(None) => {
            println!("Apparently.. no value was found.")
        }
        Err(val) => {
             println!("An error occured: {}", val)
        }
    }

    Ok(DBHandler {
        manga_db: manga_handler,
         chapter_db: chapter_handler,
    })
}
