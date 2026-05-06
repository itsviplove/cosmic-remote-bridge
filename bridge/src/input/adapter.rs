use crate::models::ControlEvent;
use std::collections::BTreeSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum InputAdapterKind {
    PortalRemoteDesktop,
    Ydotool,
}

pub trait InputAdapter: Send + Sync {
    fn kind(&self) -> InputAdapterKind;
    fn requires_privileged_host_setup(&self) -> bool;
    fn supports_event(&self, event: &ControlEvent) -> bool;
}

#[derive(Debug)]
pub struct InputAdapterRegistry {
    available: BTreeSet<InputAdapterKind>,
}

impl Default for InputAdapterRegistry {
    fn default() -> Self {
        Self {
            available: BTreeSet::from([
                InputAdapterKind::PortalRemoteDesktop,
                InputAdapterKind::Ydotool,
            ]),
        }
    }
}

impl InputAdapterRegistry {
    pub fn has(&self, kind: InputAdapterKind) -> bool {
        self.available.contains(&kind)
    }

    pub fn with_available(mut self, kinds: impl IntoIterator<Item = InputAdapterKind>) -> Self {
        self.available.extend(kinds);
        self
    }
}
