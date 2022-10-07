use bindet;
use futures_util::StreamExt;
use reqwest;
use std::io::Write;

use crate::errors::DownloadError;
use mime::{self, FromStrError};

pub struct Download {
    url: std::string::String,
    size: u64,
    progress: Option<usize>,
    bytes: Vec<u8>,
}

impl std::fmt::Debug for Download {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Download {{")?;
        writeln!(f, "\turl: {}", &self.url)?;
        writeln!(f, "\tprogress: {:?} : {}", &self.progress, &self.size)?;
        writeln!(f, "}}")
    }
}

pub struct Result {
    url: std::string::String,
    bytes: Vec<u8>,
    extension: std::string::String,
    size: u64,
}

impl std::fmt::Debug for Result {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        writeln!(f, "Result {{")?;
        writeln!(f, "\turl: {}", &self.url)?;
        writeln!(f, "\tsize: {}", &self.size)?;
        writeln!(f, "\textension: {:?}", &self.extension)?;
        writeln!(f, "}}")
    }
}

impl Result {
    #[must_use]
    pub fn new(from: &Download) -> Self {
        return Self {
            url: std::string::String::from(&from.url), // This is slow.
            bytes: bytes::Bytes::from(from.bytes.clone()).to_vec(), // This is also slow.
            size: from.size,
            extension: match bindet::detect(std::io::Cursor::new(from.bytes())) {
                Ok(val) => match val {
                    Some(mut val) => {
                        val.likely_to_be.reverse();

                        let popped: std::result::Result<mime::Mime, FromStrError> =
                            val.likely_to_be.pop().unwrap().try_into();

                        popped.unwrap().subtype().to_string()
                    }
                    None => {
                        panic!("Unable to get file extension.");
                    }
                },

                Err(val) => panic!("{}", format!("An unexpected error occured: {}", val)),
            },
        };
    }

    pub fn write_to(
        &self,
        path: std::string::String,
        name: std::string::String,
    ) -> std::result::Result<(), DownloadError> {
        let path = std::path::Path::new(&path).join(format!("{}.{}", name, self.extension));
        match std::fs::File::create(&path) {
            Ok(mut file) => {
                if let Ok(()) = file.write_all(&self.bytes) {
                    return Ok(());
                }

                Err(DownloadError::new(
                    "An error occured whilst writing to file.".to_string(),
                ))
            }
            Err(why) => Err(DownloadError::new(
                format!("Failed to write file: {}", why,),
            )),
        }
    }
}

impl Download {
    #[must_use]
    pub fn new(url: &str) -> Self {
        Self {
            url: std::string::String::from(url),
            size: 0,
            progress: None,

            bytes: Vec::new(),
        }
    }

    #[must_use]
    pub const fn progress(&self) -> Option<usize> {
        self.progress
    }

    #[must_use]
    pub const fn bytes(&self) -> &Vec<u8> {
        &self.bytes
    }

    pub async fn start(&mut self) -> std::result::Result<Result, DownloadError> {
        match reqwest::get(&self.url).await {
            Err(why) => Err(DownloadError::new(
                crate::errors::RequestError::new(
                    why.to_string(),
                    why.status().unwrap().to_string(),
                )
                .to_string(),
            )),
            Ok(data) => {
                let content_length = data.content_length();
                if content_length.is_some() {
                    self.size = content_length.unwrap();
                    let mut stream = data.bytes_stream();
                    while let Some(item) = stream.next().await {
                        match item {
                            Ok(chunk) => {
                                let mut iter = Vec::from_iter(chunk);
                                self.bytes.append(&mut iter);
                                match self.progress {
                                    Some(_) => {
                                        self.progress = Some(self.progress.unwrap() + iter.len());
                                    }
                                    None => {
                                        self.progress = Some(iter.len());
                                    }
                                }
                            }
                            Err(why) => {
                                return Err(DownloadError::new(why.to_string()));
                            }
                        }
                    }

                    Ok(Result::new(self))
                } else {
                    Err(DownloadError::new(
                        "No content length provided.".to_string(),
                    ))
                }
            }
        }
    }
}
