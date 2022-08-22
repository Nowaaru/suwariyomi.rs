use crate::errors;
use tauri::Manager;
#[tauri::command]
pub fn splash_close(window: tauri::Window) -> Result<(), errors::InternalError> {
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

#[tauri::command]
pub fn return_to_tray(window: tauri::Window) -> Result<(), errors::InternalError> {
    if let Err(_) = window.hide() {
        return Err(errors::InternalError::new("failed to hide window"));
    }

    Ok(())
}
