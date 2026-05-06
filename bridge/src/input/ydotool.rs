use super::adapter::{InputAdapter, InputAdapterKind};
use crate::models::ControlEvent;

#[derive(Debug, Default)]
pub struct YdotoolInputAdapter;

impl InputAdapter for YdotoolInputAdapter {
    fn kind(&self) -> InputAdapterKind {
        InputAdapterKind::Ydotool
    }

    fn requires_privileged_host_setup(&self) -> bool {
        true
    }

    fn supports_event(&self, event: &ControlEvent) -> bool {
        match event {
            ControlEvent::Text { .. } => false,
            _ => true,
        }
    }
}

#[derive(Debug, Clone)]
pub struct YdotoolCommandPlan {
    pub daemon_socket: String,
    pub needs_uinput: bool,
    pub command_preview: String,
}

impl YdotoolCommandPlan {
    pub fn pointer_move(x: i32, y: i32) -> Self {
        Self {
            daemon_socket: "/run/user/$UID/.ydotool_socket".into(),
            needs_uinput: true,
            command_preview: format!("ydotool mousemove --absolute {x} {y}"),
        }
    }

    pub fn key_combo(keys: &str) -> Self {
        Self {
            daemon_socket: "/run/user/$UID/.ydotool_socket".into(),
            needs_uinput: true,
            command_preview: format!("ydotool key {keys}"),
        }
    }
}
