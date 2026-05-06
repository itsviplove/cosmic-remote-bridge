use super::session::PortalSessionHandle;

#[derive(Debug, Clone)]
pub struct ScreencastPortal {
    pub session: PortalSessionHandle,
}

impl ScreencastPortal {
    pub fn placeholder() -> Self {
        Self {
            session: PortalSessionHandle::placeholder("screencast"),
        }
    }

    pub async fn create_session(&self) {
        // TODO: ashpd ScreenCast::create_session
    }

    pub async fn select_sources(&self) {
        // TODO: request monitor/window selection according to UX plan
    }

    pub async fn start(&self) {
        // TODO: start session and return PipeWire stream node ids
    }
}
