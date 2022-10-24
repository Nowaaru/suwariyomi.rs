use rusqlite::{Connection, OptionalExtension};

pub struct ReaderDB {
    db: Connection,
}

impl ReaderDB {
    #[must_use]
    pub fn new(path: &Option<std::path::PathBuf>) -> Self {
        let db = path.as_ref().map_or_else(
            || Connection::open_in_memory().expect("unable to open in-memory database"),
            |p| {
                let p2 = &p.clone();
                Connection::open(p2).unwrap_or_else(|_| {
                    panic!(
                        "unable to open database from path {}",
                        &p2.to_str().unwrap()
                    )
                })
            },
        );

        if let Err(why) = db.execute(
            "CREATE TABLE IF NOT EXISTS ReaderSettings
            (
               source TEXT NOT NULL,
               id TEXT NOT NULL,
               data TEXT NOT NULL
            )
            ",
            (),
        ) {
            panic!(
                "unable to create ReaderSettings table: {}",
                why.to_string().as_str(),
            );
        };

        Self { db }
    }

    pub fn insert<T>(&self, source: String, id: String, json_data: T)
    where
        T: serde::Serialize + rusqlite::ToSql,
    {
        self.db
            .execute(
                "REPLACE INTO ReaderSettings
                (source, id, data) VALUES (?1, ?2, ?3)
            ",
                (source, id, json_data),
            )
            .map_or_else(|_| (), |_| ())
    }

    pub fn get(
        &self,
        source: String,
        id: String,
    ) -> Result<Option<serde_json::Value>, rusqlite::Error> {
        self.db
            .query_row(
                "SELECT * FROM ReaderSettings WHERE id = ?1 AND source = ?2",
                (id, source),
                |row| row.get("data"),
            )
            .optional()
    }
}
