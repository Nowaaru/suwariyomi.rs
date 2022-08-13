#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std;
use tauri::Manager;

mod errors;
mod handlers;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let _splash_screen = {
                let window = app.get_window("splashscreen").unwrap();
                window.open_devtools();

                tauri::async_runtime::spawn(async move {
                    // setup garbo
                    println!("Initializing..!");
                    std::thread::sleep(std::time::Duration::from_secs_f64(5.0));
                    println!("Done!");

                    if let Ok(()) = handlers::splash_close(window) {
                       println!("Splash screen closed.");
                    }
                })
            };

            let window = app.get_window("main").unwrap();
            window.open_devtools();

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![crate::handlers::splash_close])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
