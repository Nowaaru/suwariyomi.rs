use std::{fs, path::{PathBuf, Path}, error::Error};
use crate::{
    db::{Chapter, ChapterDB, Manga, MangaDB, Mangas, Chapters},
    errors::{self, InternalError},
    get_db_path,
};

use tauri::{
    api::path::{resolve_path, BaseDirectory},
    Env, Manager,
};

pub fn stringify_result<T,E>(r: Result<T, E>) -> Result<T, String>
        where E: Error
{
    match r {
        Ok(y) => Ok(y),
        Err(e) => Err(e.to_string())
    }
}

pub fn stringify_result_none<T,E>(r: Result<T, E>) -> Result<(), String>
        where E: Error
{
    match r {
        Ok(..) => Ok(()),
        Err(e) => Err(e.to_string())
    }
}

pub fn get_manga_db() -> MangaDB {
    MangaDB::new(&get_db_path())
}

pub fn get_chapter_db() -> ChapterDB {
    ChapterDB::new(&get_db_path())
}

#[tauri::command]
pub fn splash_close(window: tauri::Window) -> Result<(), errors::InternalError> {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        match splashscreen.close() {
            Ok(()) => Ok(()),
            Err(why) => Err(crate::errors::InternalError::new(&*format!(
                "Splashscreen failed to close: {}",
                why
            ))),
        }
    } else {
        Err(crate::errors::InternalError::new("No splash-screen found."))
    }
}

#[tauri::command]
pub fn path_exists(path: String) -> bool {
    Path::new(path.as_str()).exists()
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
pub fn get_mangas(source: String, ids: std::vec::Vec<String>) -> Result<std::vec::Vec<Manga>, String> {
    let db = get_manga_db();
    stringify_result(db.get_multiple(source, ids))
}

#[tauri::command]
pub fn insert_manga(manga: Manga) -> Result<usize, String> {
    let db = get_manga_db();
    stringify_result(db.insert(manga))
}

#[tauri::command]
pub fn remove_manga(id: String, source: String) -> Result<(), String> {
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
    manga_id: Option<String>,
) -> Result<Chapters, String> {
    let db = get_chapter_db();
    match db.get_all(manga_id) {
        Ok(chapters) => Ok(Chapters { chapters }),
        Err(y) => Err(y.to_string()),
    }
}

#[tauri::command]
pub fn get_chapter(
    chapter_id: String,
    manga_id: String,
    source: String,
) -> Result<Option<Chapter>, String> {
    let db = get_chapter_db();
    stringify_result(db.get(source, chapter_id, manga_id))
}

#[tauri::command]
pub fn get_chapters(source: String, manga_id: String, ids: std::vec::Vec<String>) -> Result<std::vec::Vec<Chapter>, String> {
    let db = get_chapter_db();
    stringify_result(db.get_multiple(source, manga_id, ids))
}

#[tauri::command]
pub fn insert_chapter(chapter: Chapter) -> Result<(), String> {
    let db = get_chapter_db();
    stringify_result_none(db.insert(chapter))
}

#[tauri::command]
pub fn remove_chapter(manga_id: String, chapter_id: String) -> Result<(), String> {
    let db = get_chapter_db();
    stringify_result_none(db.delete(manga_id, chapter_id))
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
        Path::new("com.suwariyomirs.swrs\\sources").as_os_str().to_str().unwrap(),
        Some(BaseDirectory::Config),
    );

    if let Ok(path) = sources_path {
        match fs::try_exists(&path) {
            Ok(exists) => {
                if !exists {
                    return Err(InternalError::new("sources directory does not exist"));
                }

                let mut all_sources: Vec<PathBuf> = vec![];
                if let Ok(itr) = fs::read_dir(path) {
                    itr.for_each(|val| match val {
                        Ok(val) => all_sources.push(val.path()),
                        Err(..) => (),
                    });

                    return Ok(all_sources);
                } else {
                    return Err(InternalError::new("unable to read sources directory"));
                }
            }
            Err(y) => Err(InternalError::new(y.to_string().as_str())),
        }
    } else {
        Err(InternalError::new("unable to get sources dir"))
    }
}

#[tauri::command]
pub fn return_to_tray(window: tauri::Window) -> Result<(), errors::InternalError> {
    if window.hide().is_err() {
        Err(errors::InternalError::new("failed to hide window"))
    } else {
        Ok(())
    }
}
