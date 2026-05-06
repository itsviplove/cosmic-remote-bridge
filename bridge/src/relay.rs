use crate::config::HostConfig;
use crate::models::CapabilityReport;
use anyhow::Result;
use tracing::info;

#[derive(Debug, Clone)]
pub struct RelayClient {
    config: HostConfig,
    capability: CapabilityReport,
}

impl RelayClient {
    pub fn new(config: HostConfig, capability: CapabilityReport) -> Self {
        Self { config, capability }
    }

    pub async fn publish_capability(&mut self) -> Result<()> {
        if let Some(url) = &self.config.relay_url {
            info!(relay = %url, viewer_mode = ?self.capability.viewer_mode, control_mode = ?self.capability.control_mode, "TODO: POST capability snapshot to relay");
        }
        Ok(())
    }
}
