use tauri::Manager;

#[tauri::command]
pub fn splash_close(window: tauri::Window) -> Result<(), crate::errors::InternalError> {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        match splashscreen.close() {
            Ok(()) => return Ok(()),
            Err(why) => {
                return Err(crate::errors::InternalError::new(&*format!(
                    "Splashscreen failed to close: {}",
                    why
                )))
            }
        }
    } else {
        Err(crate::errors::InternalError::new("No splash-screen found."))
    }
}