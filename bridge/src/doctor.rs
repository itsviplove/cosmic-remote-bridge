use crate::models::{
    CapabilityReport, ControlMode, DesktopKind, PortalAvailability, ServiceAvailability, SessionType,
    ViewerMode,
};
use std::time::{SystemTime, UNIX_EPOCH};

pub async fn detect_capabilities() -> CapabilityReport {
    // TODO: replace this placeholder logic with real Linux checks:
    // - XDG_SESSION_TYPE / desktop environment
    // - DBus portal introspection via ashpd/zbus
    // - PipeWire service/socket checks
    // - /dev/uinput presence and permissions
    // - ydotoold socket/process detection

    CapabilityReport {
        updated_at: iso_now(),
        machine: "unverified-host".into(),
        session_type: SessionType::Unknown,
        desktop: DesktopKind::Unknown,
        viewer_mode: ViewerMode::Unknown,
        control_mode: ControlMode::Unknown,
        screencast_portal: PortalAvailability::Unknown,
        remote_desktop_portal: PortalAvailability::Unknown,
        input_capture_portal: PortalAvailability::Unknown,
        pipewire: ServiceAvailability::Unknown,
        uinput: ServiceAvailability::Unknown,
        ydotoold: ServiceAvailability::Unknown,
        recommendation: "Run on a Pop!_OS COSMIC host and replace placeholder detection with ashpd/zbus + filesystem/service checks.".into(),
        notes: vec![
            "This Rust module is a scaffold because the current workspace has no Rust toolchain.".into(),
            "Mirror the shell doctor output so browser/relay/UI all consume the same capability vocabulary.".into(),
            "Prefer viewer-only mode unless both capture and a safe control adapter are confirmed.".into(),
        ],
    }
}

fn iso_now() -> String {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or_default();
    format!("unix:{seconds}")
}
