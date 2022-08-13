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
