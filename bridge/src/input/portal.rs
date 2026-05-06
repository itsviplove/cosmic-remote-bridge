use super::adapter::{InputAdapter, InputAdapterKind};
use crate::models::ControlEvent;

#[derive(Debug, Default)]
pub struct PortalInputAdapter;

impl InputAdapter for PortalInputAdapter {
    fn kind(&self) -> InputAdapterKind {
        InputAdapterKind::PortalRemoteDesktop
    }

    fn requires_privileged_host_setup(&self) -> bool {
        false
    }

    fn supports_event(&self, _event: &ControlEvent) -> bool {
        true
    }
}
