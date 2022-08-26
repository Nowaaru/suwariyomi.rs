use crate::{
    db::{Manga, MangaDB, ChapterDB, Chapter},
    errors,
};
use tauri::Manager;
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
pub fn get_all_manga(source: Option<String>) -> Result<std::vec::Vec<Manga>, rusqlite::Error> {
    let db = MangaDB::new(None);
    db.get_all(source)
}

#[tauri::command]
pub fn get_manga(id: String, source: String) -> Result<Option<Manga>, rusqlite::Error> {
    let db = MangaDB::new(None);
    db.get(id, source)
}

#[tauri::command]
pub fn insert_manga(manga: Manga) {
    let db = MangaDB::new(None);
    db.insert(manga);
}

#[tauri::command]
pub fn remove_manga(id: String, source: String) -> Result<Option<usize>, rusqlite::Error> {
    let db = MangaDB::new(None);
    db.delete(id, source)
}

#[tauri::command]
pub fn get_all_chapters(manga_id: Option<String>) -> Result<std::vec::Vec<Chapter>, rusqlite::Error> {
    let db = ChapterDB::new(None);
    db.get_all(manga_id)
}

#[tauri::command]
pub fn get_chapter(chapter_id: String, manga_id: String) -> Result<Option<Chapter>, rusqlite::Error> {
    let db = ChapterDB::new(None);
    db.get(chapter_id, manga_id)
}

#[tauri::command]
pub fn remove_chapter(manga_id: String, chapter_id: String) {
    let db = ChapterDB::new(None);
    db.delete(manga_id, chapter_id)
}

#[tauri::command]
pub fn return_to_tray(window: tauri::Window) -> Result<(), errors::InternalError> {
    if window.hide().is_err() {
        Err(errors::InternalError::new("failed to hide window"))
    } else {
        Ok(())
    }
}
