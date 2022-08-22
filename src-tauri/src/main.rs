#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std;
use tauri::CustomMenuItem;
use tauri::Manager;
use tauri::{SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

pub mod download;
pub mod errors;
pub mod handlers;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window_main = app.get_window("main").unwrap();
            let _splash_screen = {
                let window = app.get_window("splashscreen").unwrap();
                window.set_always_on_top(true)?;
                tauri::async_runtime::spawn(async move {
                    std::thread::sleep(std::time::Duration::from_secs_f64(8.0));
                    if let Ok(()) = handlers::splash_close(window) {
                        if let Ok(()) = window_main.show() {
                            window_main.open_devtools();

                            if let Ok(()) = window_main.set_focus() {
                                Ok(())
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

                tauri::async_runtime::spawn(async move {})
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
        .on_system_tray_event(|app, handler| match handler {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                if let Err(..) = window.show() {
                    panic!("Could not show window.");
                }
            }
            _ => (),
        })
        .invoke_handler(tauri::generate_handler![handlers::splash_close])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
