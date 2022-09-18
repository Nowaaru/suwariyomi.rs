#![feature(fs_try_exists)]
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::path::Path;
use std::path::PathBuf;

use tauri::CustomMenuItem;
use tauri::Manager;
use tauri::{
    api::path::{resolve_path, BaseDirectory},
    SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

pub mod db;
pub mod download;
pub mod errors;
pub mod handlers;

pub fn get_db_path() -> Option<PathBuf> {
    let return_none = false;
    if return_none {
        return None;
    }

    let app_context = tauri::generate_context!();
    let db_path = resolve_path(
        app_context.config(),
        app_context.package_info(),
        &tauri::Env::default(),
        Path::new("com.suwariyomirs.swrs\\suwariyomi.db3").as_os_str().to_str().unwrap(),
        Some(BaseDirectory::Config),
    );

    if let Ok(db_path) = db_path {
        return Some(db_path);
    }

    panic!("unable to get db path");
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window_main = app.get_window("main").unwrap();
            let window = app.get_window("splashscreen").unwrap();
            window.set_always_on_top(true)?;
            tauri::async_runtime::spawn(async move {
                // Uncomment if the splash screen needs debugging.
                // std::thread::sleep(std::time::Duration::from_secs_f64(8.0));
                if handlers::splash_close(window).is_ok() {
                    if window_main.show().is_ok() {
                        window_main.open_devtools();

                        if window_main.set_focus().is_err() {
                            Err(errors::InternalError::new("unable to focus main window"))
                        } else {
                            Ok(())
                        }
                    } else {
                        Err(errors::InternalError::new("unable to show main window"))
                    }
                } else {
                    panic!("splash screen failed to close.")
                }
            });

            // Setup files in filesystem
            let app_config = app.config();
            let app_data = tauri::api::path::app_dir(&app_config);

            if let Some(path) = app_data {
                if !path.exists() && std::fs::create_dir(&path).is_err() {
                    panic!("unable to create path {:?}", path.to_str().unwrap());
                }

                // try creating sources directory
                let sources_dir = path.clone().join("sources/");
                println!("{} {}", &sources_dir.display(), &sources_dir.exists());
                if !sources_dir.exists() && std::fs::create_dir(&sources_dir).is_err() {
                    panic!("unable to create path {:?}", sources_dir.to_str().unwrap());
                }
            }
            Ok(())
        })
        .system_tray(
            SystemTray::new().with_menu(
                SystemTrayMenu::new()
                    .add_item(CustomMenuItem::new("hide".to_string(), "Hide Icon"))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new("quit".to_string(), "Quit")),
            ),
        )
        .on_system_tray_event(|app, handler| {
            if let SystemTrayEvent::LeftClick { .. } = handler {
                let window = app.get_window("main").unwrap();
                window.show().expect("Could not show window.");
            }
        })
        .invoke_handler(tauri::generate_handler![
            handlers::splash_close,
            handlers::path_exists,
            handlers::get_all_manga,
            handlers::get_manga,
            handlers::get_mangas,
            handlers::insert_manga,
            handlers::remove_manga,
            handlers::clear_manga,
            handlers::get_all_chapters,
            handlers::get_chapter,
            handlers::get_chapters,
            handlers::insert_chapter,
            handlers::remove_chapter,
            handlers::clear_chapters,
            handlers::get_sources,
            handlers::return_to_tray,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
