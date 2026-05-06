use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityReport {
    pub updated_at: String,
    pub machine: String,
    pub session_type: SessionType,
    pub desktop: DesktopKind,
    pub viewer_mode: ViewerMode,
    pub control_mode: ControlMode,
    pub screencast_portal: PortalAvailability,
    pub remote_desktop_portal: PortalAvailability,
    pub input_capture_portal: PortalAvailability,
    pub pipewire: ServiceAvailability,
    pub uinput: ServiceAvailability,
    pub ydotoold: ServiceAvailability,
    pub recommendation: String,
    pub notes: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SessionType {
    Wayland,
    X11,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DesktopKind {
    Cosmic,
    Other(String),
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ViewerMode {
    PortalViewerPossible,
    ViewerBlocked,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ControlMode {
    PortalControlPossible,
    ViewerPlusUinputFallback,
    ViewerOnly,
    ControlBlocked,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PortalAvailability {
    Available,
    Missing,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ServiceAvailability {
    Available,
    Missing,
    Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointerMove {
    pub x: i32,
    pub y: i32,
    pub absolute: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PointerButton {
    pub button: String,
    pub pressed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyEvent {
    pub key: String,
    pub pressed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ControlEvent {
    PointerMove(PointerMove),
    PointerButton(PointerButton),
    KeyEvent(KeyEvent),
    Text { text: String },
    Scroll { delta_x: i32, delta_y: i32 },
}
