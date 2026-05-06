#[derive(Debug, Clone)]
pub struct PortalSessionHandle {
    pub request_path: String,
    pub session_path: Option<String>,
}

impl PortalSessionHandle {
    pub fn placeholder(name: &str) -> Self {
        Self {
            request_path: format!("org.freedesktop.portal.Request.{name}"),
            session_path: None,
        }
    }
}
