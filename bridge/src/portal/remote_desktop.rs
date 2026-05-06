use super::session::PortalSessionHandle;
use crate::models::ControlEvent;

#[derive(Debug, Clone)]
pub struct RemoteDesktopPortal {
    pub session: PortalSessionHandle,
}

impl RemoteDesktopPortal {
    pub fn placeholder() -> Self {
        Self {
            session: PortalSessionHandle::placeholder("remote-desktop"),
        }
    }

    pub async fn create_session(&self) {
        // TODO: ashpd RemoteDesktop::create_session
    }

    pub async fn start(&self) {
        // TODO: bind keyboard/pointer capabilities approved by the portal
    }

    pub async fn send_event(&self, _event: ControlEvent) {
        // TODO: map ControlEvent to portal-native pointer/keyboard calls
    }
}
