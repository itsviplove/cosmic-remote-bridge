pub mod remote_desktop;
pub mod screencast;
pub mod session;

use crate::models::{CapabilityReport, PortalAvailability};
use remote_desktop::RemoteDesktopPortal;
use screencast::ScreencastPortal;

#[derive(Debug, Default)]
pub struct PortalStack {
    screencast: Option<ScreencastPortal>,
    remote_desktop: Option<RemoteDesktopPortal>,
}

impl PortalStack {
    pub fn from_report(report: &CapabilityReport) -> Self {
        Self {
            screencast: matches!(report.screencast_portal, PortalAvailability::Available)
                .then(ScreencastPortal::placeholder),
            remote_desktop: matches!(report.remote_desktop_portal, PortalAvailability::Available)
                .then(RemoteDesktopPortal::placeholder),
        }
    }

    pub fn screencast(&self) -> Option<&ScreencastPortal> {
        self.screencast.as_ref()
    }

    pub fn remote_desktop(&self) -> Option<&RemoteDesktopPortal> {
        self.remote_desktop.as_ref()
    }
}
