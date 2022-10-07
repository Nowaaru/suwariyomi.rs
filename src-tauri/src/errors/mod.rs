use std::string::ToString;
#[derive(Debug, serde::Serialize)]
pub struct InternalError {
    message: std::string::String,
}

impl InternalError {
    #[must_use] pub fn new<T>(message: T) -> Self
    where T: ToString
    {
        Self {
            message: message.to_string(),
        }
    }
}

impl From<rusqlite::Error> for InternalError {
    fn from(err: rusqlite::Error) -> Self {
        Self {
            message: err
        }
    }
}

impl From<serde_json::Error> for InternalError {
    fn from(err: serde_json::Error) -> Self {
        Self {
            message: err.to_string()
        }
    }
}

impl From<serde_rusqlite::Error> for InternalError {
    fn from(err: serde_rusqlite::Error) -> Self {
        Self {
            message: err.to_string()
        }
    }
}


impl std::fmt::Display for InternalError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "InternalError {{\n\tmessage:{}\n}}", &self.message)
    }
}

impl std::error::Error for InternalError {
    fn description(&self) -> &str {
        &self.message
    }
}

#[derive(Debug)]
pub struct DownloadError {
    message: String,
}

impl DownloadError {
    #[must_use] pub const fn new(msg: std::string::String) -> Self {
        Self {
            message: msg,
        }
    }
}

impl std::fmt::Display for DownloadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", &self.message)
    }
}

impl std::error::Error for DownloadError {
    fn description(&self) -> &str {
        &self.message
    }
}

#[derive(Debug)]
pub struct RequestError {
    message: String,
    status: String,
}

impl RequestError {
    #[must_use] pub const fn new(msg: std::string::String, status: std::string::String) -> Self {
        Self {
            message: msg,
            status,
        }
    }
}

impl std::fmt::Display for RequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}: {}", &self.status, &self.message)
    }
}

impl std::error::Error for RequestError {
    fn description(&self) -> &str {
        &self.message
    }
}
