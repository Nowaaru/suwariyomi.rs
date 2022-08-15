#[derive(Debug, serde::Serialize)]
pub struct InternalError {
    message: std::string::String,
}

impl InternalError {
    pub fn new(message: &str) -> Self {
        InternalError { message: message.to_string() }
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
    pub fn new(msg: std::string::String) -> Self {
        Self {
            message: msg.to_string(), 
        }
    }
}

impl std::fmt::Display for DownloadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f,"{}", &self.message)
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
    pub fn new(msg: std::string::String, status: std::string::String) -> Self {
        Self {
            message: msg.to_string(), 
            status: status,
        }
    }
}

impl std::fmt::Display for RequestError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f,"{}: {}", &self.status, &self.message)
    }
}

impl std::error::Error for RequestError {
    fn description(&self) -> &str {
        &self.message
    }
}