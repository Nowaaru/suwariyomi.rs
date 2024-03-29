use crate::{
    db::{Chapter, ChapterDB, Chapters, Manga, MangaDB, Mangas},
    errors::{self, InternalError},
    get_db_path,
    readerdb::ReaderDB,
    settings::Settings,
};
use std::{
    error::Error,
    fs,
    path::{Path, PathBuf},
};

use tauri::{
    api::path::{resolve_path, BaseDirectory},
    Env, Manager,
};

pub fn stringify_result<T, E>(r: Result<T, E>) -> Result<T, String>
where
    E: Error,
{
    match r {
        Ok(y) => Ok(y),
        Err(e) => Err(e.to_string()),
    }
}

pub fn stringify_result_none<T, E>(r: Result<T, E>) -> Result<(), String>
where
    E: Error,
{
    match r {
        Ok(..) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[must_use]
pub fn get_manga_db() -> MangaDB {
    MangaDB::new(&get_db_path())
}

#[must_use]
pub fn get_chapter_db() -> ChapterDB {
    ChapterDB::new(&get_db_path())
}

#[tauri::command]
pub fn splash_close(window: tauri::Window) -> Result<(), errors::InternalError> {
    window.get_window("splashscreen").map_or_else(
        || Err(crate::errors::InternalError::new("No splash-screen found.")),
        |splashscreen| match splashscreen.close() {
            Ok(()) => Ok(()),
            Err(why) => Err(crate::errors::InternalError::new(format!(
                "Splashscreen failed to close: {why}"
            ))),
        },
    )
}

#[tauri::command]
#[must_use]
pub fn path_exists(path: &str) -> bool {
    Path::new(path).exists()
}

#[tauri::command]
pub fn get_all_manga(source: Option<String>) -> Result<Mangas, String> {
    let db = get_manga_db();
    match db.get_all(source) {
        Ok(mangas) => Ok(Mangas { mangas }),
        Err(y) => Err(y.to_string()),
    }
}

#[tauri::command]
pub fn get_manga(id: String, source: String) -> Result<Option<Manga>, String> {
    let db = get_manga_db();
    stringify_result(db.get(id, source))
}

#[tauri::command]
pub fn get_mangas(
    source: String,
    ids: std::vec::Vec<String>,
) -> Result<std::vec::Vec<Manga>, String> {
    let db = get_manga_db();
    stringify_result(db.get_multiple(source, ids))
}

#[tauri::command]
pub fn insert_manga(manga: Manga) -> Result<usize, String> {
    let db = get_manga_db();
    stringify_result(db.insert(manga))
}

#[tauri::command]
pub fn remove_manga(source: String, id: String) -> Result<(), String> {
    let db = get_manga_db();
    stringify_result_none(db.delete(id, source))
}

#[tauri::command]
pub fn clear_manga() -> Result<(), String> {
    let db = get_manga_db();
    stringify_result_none(db.clear())
}

#[tauri::command]
pub fn get_all_chapters(
    source: Option<String>,
    id: Option<String>,
    manga_id: Option<String>,
) -> Result<Chapters, String> {
    let db = get_chapter_db();
    match db.get_all(source, id, manga_id) {
        Ok(chapters) => Ok(Chapters { chapters }),
        Err(y) => Err(y.to_string()),
    }
}

#[tauri::command]
pub fn get_chapter(
    manga_id: String,
    source: String,
    id: String,
) -> Result<Option<Chapter>, String> {
    let db = get_chapter_db();
    stringify_result(db.get(source, id, manga_id))
}

#[tauri::command]
pub fn get_chapters(
    source: String,
    manga_id: String,
    ids: std::vec::Vec<String>,
) -> Result<std::vec::Vec<Chapter>, String> {
    let db = get_chapter_db();
    stringify_result(db.get_multiple(source, manga_id, ids))
}

#[tauri::command]
pub fn insert_chapter(chapter: Chapter) -> Result<(), String> {
    let db = get_chapter_db();
    stringify_result_none(db.insert(chapter))
}

#[tauri::command]
pub fn remove_chapter(manga_id: String, id: String) -> Result<(), String> {
    let db = get_chapter_db();
    stringify_result_none(db.delete(manga_id, id))
}

#[tauri::command]
pub fn clear_chapters() -> Result<(), String> {
    let db = get_chapter_db();
    stringify_result_none(db.clear())
}

#[tauri::command]
pub fn get_sources() -> Result<Vec<PathBuf>, InternalError> {
    let app_context = tauri::generate_context!();
    let sources_path = resolve_path(
        app_context.config(),
        app_context.package_info(),
        &Env::default(),
        Path::new("com.suwariyomirs.swrs\\sources")
            .as_os_str()
            .to_str()
            .unwrap(),
        Some(BaseDirectory::Config),
    );

    if let Ok(path) = sources_path {
        match fs::try_exists(&path) {
            Ok(exists) => {
                if !exists {
                    return Err(InternalError::new("sources directory does not exist"));
                }

                let mut all_sources: Vec<PathBuf> = vec![];
                fs::read_dir(path).map_or_else(
                    |_| Err(InternalError::new("unable to read sources directory")),
                    |itr| {
                        itr.for_each(|val| {
                            if let Ok(val) = val {
                                all_sources.push(val.path());
                            }
                        });

                        Ok(all_sources)
                    },
                )
            }
            Err(y) => Err(InternalError::new(y.to_string().as_str())),
        }
    } else {
        Err(InternalError::new("unable to get sources dir"))
    }
}

#[tauri::command]
pub fn get_app_settings() -> Result<Option<serde_json::Value>, InternalError> {
    Settings {}.get()
}

#[tauri::command]
pub fn set_app_settings(new_settings: std::string::String) -> bool {
    Settings {}.set(Some(new_settings))
}

#[tauri::command]
pub fn get_reader_settings(
    source: String,
    id: String,
) -> Result<Option<serde_json::Value>, InternalError> {
    let db_return = ReaderDB::new(&get_db_path()).get(source, id);
    db_return.map_or_else(|why| Err(InternalError::new(why)), Ok)
}

#[tauri::command]
pub fn set_reader_settings(source: String, id: String, data: String) -> Result<(), InternalError> {
    let reader_db = ReaderDB::new(&get_db_path());
    reader_db.insert(source, id, data);

    Ok(())
}

#[tauri::command]
pub fn return_to_tray(window: tauri::Window) -> Result<(), errors::InternalError> {
    if window.hide().is_err() {
        Err(errors::InternalError::new("failed to hide window"))
    } else {
        Ok(())
    }
}
