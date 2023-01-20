use serde_json::{json, Value};
use std::{
    fs::{read, write},
    path::{Path, PathBuf},
};
use tauri::api::path::BaseDirectory;

use crate::errors::InternalError;

pub struct Settings {}

impl Settings {
    pub fn new(init: Option<Value>) -> Self {
        if let Some(_initial_settings) = init {
            return Self {};
        };

        Self {}
    }

    fn get_path(&self) -> PathBuf {
        let app_context = tauri::generate_context!();
        tauri::api::path::resolve_path(
            app_context.config(),
            app_context.package_info(),
            &tauri::Env::default(),
            Path::new("com.suwariyomirs.swrs\\settings.json")
                .as_os_str()
                .to_str()
                .unwrap(),
            Some(BaseDirectory::Config),
        )
        .map_or_else(|_| panic!("unable to get settings path"), |v| v)
    }

    pub fn set<T>(&self, new_settings: Option<T>) -> bool
    where
        std::string::String: From<T>,
        T: From<std::string::String>,
    {
        write(
            self.get_path(),
            new_settings.map_or_else(
                || json!({}).to_string(),
                |val| std::string::String::from(val),
            ),
        )
        .is_ok()
    }

    pub fn get(&self) -> Result<Option<Value>, InternalError> {
        if !self.get_path().exists() {
            return Ok(None);
        };

        read(self.get_path()).map_or_else(
            |why| Err(InternalError::new(why)),
            |v| serde_json::from_slice(&v).map_or_else(|_| Ok(None), |d| Ok(Some(d))),
        )
    }
}
