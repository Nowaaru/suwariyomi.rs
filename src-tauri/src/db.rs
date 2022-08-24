use std::convert::Infallible;

use crate::errors::{self, InternalError};
use rusqlite::{self, Connection, OptionalExtension};

struct Covers {
    covers: std::vec::Vec<Cover>,
}

#[derive(PartialEq, Eq)]
struct Cover {
    url: String,
}

struct Manga {
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

        self.covers.iter().for_each(| val | {
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
    chapter: String,
    volume: String,

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

impl MangaDB {
    pub fn new(db: Connection) -> Self {
        // Make tables if not present.

        // Since arrays cannot be stored in SQL, just have covers be a JSON array. Same with
        // chapters
        match db.execute("CREATE TABLE IF NOT EXISTS Library (id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL, covers TEXT NOT NULL, chapters TEXT NOT NULL, uploaded INT NOT NULL, added INT NOT NULL)", []) {
            Ok(_) => println!("Table was created."),
            Err(why) => println!("Failed: {}", why),
        }

        Self { db }
    }

    pub fn fill(&self, amt: i32) -> Result<bool, Infallible> {
        for i in 1..=amt {
            self.db.execute("INSERT INTO Library (id, name, source, covers, chapters, uploaded, added) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ",
            (i.to_string(), "Some Manga", "3", "4$$5$$6$$7$$8$$9", 10, "11", 12)).expect("rip");
        }

        Ok(true)
    }

    pub fn get_from_id(&self, id: String) -> Result<Option<Manga>, rusqlite::Error> {
        self.db
            .query_row("SELECT * FROM Library WHERE id = '1'", [], |row| {
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

pub fn init(mut _path: &std::path::PathBuf) -> Result<(), errors::InternalError> {
    // Create database files in the app folder
    // For now, open the database in memory for testing purposes.
    // path.push("sw.db");

    if let Ok(db) = rusqlite::Connection::open_in_memory() {
        let manga_handler = MangaDB::new(db);
        manga_handler.fill(100).expect("rip 2");

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
        Ok(())
    } else {
        Err(InternalError::new("unable to open database 'sw.db'"))
    }
}
