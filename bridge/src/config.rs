use serde::{Deserialize, Serialize};
use url::Url;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostConfig {
    pub bind: String,
    pub relay_url: Option<Url>,
    pub pair_token: Option<String>,
    pub allow_lan: bool,
    pub enable_ydotool_fallback: bool,
}

impl Default for HostConfig {
    fn default() -> Self {
        Self {
            bind: "127.0.0.1:9876".into(),
            relay_url: None,
            pair_token: None,
            allow_lan: false,
            enable_ydotool_fallback: false,
        }
    }
}
