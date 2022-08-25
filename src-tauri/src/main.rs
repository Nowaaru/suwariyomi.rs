#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::CustomMenuItem;
use tauri::Manager;
use tauri::{SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

pub mod db;
pub mod download;
pub mod errors;
pub mod handlers;

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

                // Start up database handler and then test manga
                let handler = db::init(&path).unwrap();
                for i in 1..25 {
                    handler.manga_db.insert(db::Manga {
                        name: "Fuzoroi no Renri".to_string(),
                        source: "MangaDex".to_string(),
                        id: i.to_string(), //"153779b6-0d55-4681-99ba-f42ca58de385".to_string(),
                        covers: db::Covers {
                            covers: vec![
                                db::Cover { 
                                    url: "https://mangadex.org/covers/153779b6-0d55-4681-99ba-f42ca58de385/7355c533-0e1f-407f-b100-5639eeef21f9.jpg"
                                        .to_string() 
                                }
                            ]
                        },
                        chapters: "".to_string(),
                        added: 0,
                        uploaded: 0,
                    }).expect("Failed to insert manga.");
                };

                match handler.manga_db.get_all(None) {
                    Ok(v) => {
                        println!("{}", v.len());
                    },
                    Err(y) => println!("{}", y)
                };

                handler.chapter_db.insert(db::Chapter {
                    id: "Test 1".to_string(),
                    title: "The End".to_string(),
                    manga_id: "153779b6-0d55-4681-99ba-f42ca58de385".to_string(),
                    
                    volume: 0,
                    chapter: 1,
                    
                    last_read: 0,
                    last_updated: 0,
                    time_spent_reading: 0,

                    pages: 0,
                    count: 0,

                    scanlators: vec![],
                }).expect("Failed to insert chapter.");

                match handler.chapter_db.get("Test 1".to_string(), "153779b6-0d55-4681-99ba-f42ca58de385".to_string()) {
                    Ok(Some(v)) => println!("{}", v),
                    Ok(None) => println!("No chapters found."),
                    Err(val) => println!("A chapter error occured: {}", val),
                }
            };

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
        .invoke_handler(tauri::generate_handler![handlers::splash_close])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
