#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use std;
use tauri::Manager;

pub mod errors;
pub mod handlers;
pub mod download;

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
				})
			};

			Ok(())
		})
		.invoke_handler(tauri::generate_handler![handlers::splash_close])
		.run(tauri::generate_context!())
		.expect("error while running tauri application");
}
