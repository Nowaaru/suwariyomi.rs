use rusqlite::{self, Connection, OptionalExtension, Row};

pub struct Covers {
    pub covers: std::vec::Vec<Cover>,
}

#[derive(PartialEq, Eq)]
pub struct Cover {
    pub url: String,
}

pub struct Manga {
    pub id: String,
    pub name: String,
    pub source: String,
    pub covers: Covers,

    pub chapters: String,
    pub uploaded: i32,
    pub added: i32,
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

        // TODO: Make this multiline
        write!(f, "Manga {{\n\tid: {}\n\tname: {}\n\tsource: {}\n\tcovers: {}\n\n\tchapters: [ {} ]\n\tuploaded: {}\n\tadded: {}\n}}", id, name, source, covers, chapters, uploaded, added)
    }
}

pub struct Chapter {
    pub id: String,
    pub manga_id: String, // The manga it belongs to.
    pub chapter: i32,
    pub volume: i32,

    pub title: String,

    pub last_read: i32,
    pub last_updated: i32,
    pub date_uploaded: i32,
    pub time_spent_reading: i32,

    pub pages: i32,
    pub count: i32,
    pub scanlators: std::vec::Vec<String>,
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
            count,
            scanlators
        } = self;

        writeln!(f, "Chapter {{")?;
        writeln!(f, "\tid: {}", id)?;
        writeln!(f, "\tmanga_id: {}", manga_id)?;
        writeln!(f, "\tchapter: {}", chapter)?;
        writeln!(f, "\tvolume: {}", volume)?;
        writeln!(f, "\ttitle: {}", title)?;
        writeln!(f, "\tlast_read: {}", last_read)?;
        writeln!(f, "\tlast_updated: {}", last_updated)?;
        writeln!(f, "\tlast_updated: {}", last_updated)?;
        writeln!(f, "\ttime_spent_reading: {}", time_spent_reading)?;
        writeln!(f, "\tpages: {}", pages)?;
        writeln!(f, "\tcount: {}", count)?;
        writeln!(f, "\tscanlators: [ {} ]", scanlators.join(" "))?;
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

fn generate_manga_from_row(row: &Row) -> Manga {
    Manga {
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
    }
}

fn generate_chapter_from_row(row: &Row) -> Chapter {
    Chapter {
        id: row.get("id").unwrap(),
        manga_id: row.get("manga_id").unwrap(),

        title: row.get::<&str, std::string::String>("title").unwrap(),

        chapter: row.get::<&str, i32>("chapter").unwrap(),
        volume: row.get::<&str, i32>("volume").unwrap(),

        last_read: row.get::<&str, i32>("last_read").unwrap(),
        date_uploaded: row.get::<&str, i32>("date_uploaded").unwrap(),
        last_updated: row.get::<&str, i32>("last_updated").unwrap(),
        time_spent_reading: row.get::<&str, i32>("time_spent_reading").unwrap(),

        pages: row.get::<&str, i32>("pages").unwrap(),
        count: row.get::<&str, i32>("count").unwrap(),

        scanlators: row.get::<&str, std::string::String>("scanlators")
            .unwrap()
            .split("$$")
            .map(|v| v.to_string())
            .collect::< std::vec::Vec<String> >()
    }
}

impl MangaDB {
    pub fn new(path: &Option<std::path::PathBuf>) -> Self {
        // Make tables if not present.
        // let db = if path.is_none() { Connection::open_in_memory().expect("unable to open in-memory database") }
        //        else { Connection::open(path.unwrap()).expect("unable to open database") };

        let db = if let Some(path) = path {
            let p2 = path.clone();
            Connection::open(path).unwrap_or_else(|_| panic!("unable to open database from path {}", p2.to_str().unwrap()))
        } else { Connection::open_in_memory().expect("unable to open in-memory database") };

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

    pub fn delete(&self, id: String, source: String) -> Result<Option<usize>, rusqlite::Error> {
        self.db
            .execute("DELETE * FROM LIBRARY WHERE id = ?1 AND source = ?2 ", [id, source])
            .optional()
    }

    pub fn get(&self, id: String, source: String) -> Result<Option<Manga>, rusqlite::Error> {
        self.db
            .query_row("SELECT * FROM Library WHERE id = ?1 AND source = ?2", [id, source], |row| {
                Ok(generate_manga_from_row(row))
            })
            .optional()
    }

    pub fn get_all(&self, source: Option<String>) -> Result<std::vec::Vec<Manga>, rusqlite::Error> {
        // FIXME: this shit
        // oh lord. here we go again.

        if let Some(source) = source {
            let mut prepared_rows = self.db.prepare("SELECT * FROM Library WHERE source = ?1")?;
            let iter = prepared_rows.query_map([source], |row| Ok(
                    generate_manga_from_row(row)
                    ))?;

            Ok(iter.map(|v| v.unwrap() ).collect::<std::vec::Vec<Manga>>())
        } else {
            let mut prepared_rows = self.db.prepare("SELECT * FROM Library")?;
            let iter = prepared_rows.query_map([], |row| Ok(
                    generate_manga_from_row(row)
            ))?;

            Ok(iter.map(|v| v.unwrap() ).collect::<std::vec::Vec<Manga>>())
        }
    }

    pub fn clear(&self) -> Result<(), rusqlite::Error> {
        match self.db.execute("DELETE * FROM Library", []) {
            Ok(..) => Ok(()),
            Err(y) => Err(y)
        }
    }
}

impl ChapterDB {
    pub fn new(path: &Option<std::path::PathBuf> ) -> Self {
        let db: Connection =
        if let Some(path) = path {
            let p2 = path.clone();
            Connection::open(path).unwrap_or_else(|_| panic!( "unable to open database with path {}", p2.to_str().unwrap()))
        } else {
            Connection::open_in_memory().expect("unable to open database")
        };

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
            date_uploaded,
            last_updated,
            time_spent_reading,
            pages,
            count,
            scanlators
        } = chapter;

        self.db.execute(
            "INSERT INTO Chapters
                (id, manga_id, title, chapter, volume, last_read, date_uploaded, last_updated, time_spent_reading, pages, count, scanlators)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
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
                 count,
                 scanlators.join("$$"),
            )
        )
    }

    pub fn get(&self, chapter_id: String, manga_id: String) -> Result<Option<Chapter>, rusqlite::Error> {
         self.db.query_row("SELECT * FROM Chapters WHERE id = ?1 AND manga_id = ?2", [chapter_id, manga_id], | row | Ok ( generate_chapter_from_row(row) ) ).optional()
    }

    pub fn get_all(&self, manga_id: Option<String>) -> Result<std::vec::Vec<Chapter>, rusqlite::Error> {
        // FIXME: turn iter repetition into a function
        // fuckin christ this code is dog shitty ass

        let mut prepared_rows;
        if let Some(manga_id) = manga_id {
            prepared_rows = self.db.prepare("SELECT * FROM Chapters WHERE manga_id = ?1")?;

            match prepared_rows.query_map(
                [manga_id],
                |row| Ok(
                        generate_chapter_from_row(row)
                      )
            ) {
                Ok(iter) => Ok(iter.map(|v| v.unwrap() ).collect::<std::vec::Vec<Chapter>>()),
                Err(why) => Err(why)
            }
       } else {
            prepared_rows = self.db.prepare("SELECT * FROM Chapters")?;

            match prepared_rows.query_map(
                [],
                |row| Ok(
                        generate_chapter_from_row(row)
                      )
            ) {
                Ok(iter) => Ok(iter.map(|v| v.unwrap() ).collect::<std::vec::Vec<Chapter>>()),
                Err(why) => Err(why)
            }
       }
    }

    pub fn delete(&self, manga_id: String, id: String) -> Result<Option<usize>, rusqlite::Error> {
        self.db
            .execute("DELETE * FROM Chapters WHERE manga_id = ?1 AND id = ?2", [manga_id, id])
            .optional()
    }

    pub fn clear(&self) -> Result<(), rusqlite::Error> {
        match self.db.execute("DELETE * FROM Chapters", []) {
            Ok(..) => Ok(()),
            Err(y) => Err(y)
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
