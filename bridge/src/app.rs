use crate::config::HostConfig;
use crate::doctor;
use crate::input::{InputAdapterKind, InputAdapterRegistry};
use crate::models::{CapabilityReport, ControlMode, ViewerMode};
use crate::portal::PortalStack;
use crate::relay::RelayClient;
use anyhow::Result;
use tracing::{info, warn};

pub async fn run_doctor(json: bool) -> Result<()> {
    let report = doctor::detect_capabilities().await;
    if json {
        println!("{}", serde_json::to_string_pretty(&report)?);
    } else {
        print_human_report(&report);
    }
    Ok(())
}

pub async fn run_service(config: HostConfig) -> Result<()> {
    let report = doctor::detect_capabilities().await;
    let input_registry = InputAdapterRegistry::default();

    info!(viewer_mode = ?report.viewer_mode, control_mode = ?report.control_mode, "host capability snapshot");

    let portal = PortalStack::from_report(&report);
    let mut relay = RelayClient::new(config.clone(), report.clone());

    if matches!(report.viewer_mode, ViewerMode::PortalViewerPossible) {
        info!("viewer mode can proceed once portal screencast + PipeWire implementation lands");
        let _ = portal.screencast();
    } else {
        warn!("viewer mode blocked; serve should stay in doctor/error state");
    }

    let adapter_kind = choose_input_adapter(&report, &input_registry);
    if let Some(kind) = adapter_kind {
        info!(adapter = ?kind, "selected control adapter strategy");
    } else {
        info!("no control adapter enabled; service should remain viewer-only");
    }

    relay.publish_capability().await?;
    info!(bind = %config.bind, "host service scaffold initialized");
    info!("TODO: add HTTP/WebRTC server, portal session management, PipeWire capture loop, and authenticated command handling");
    Ok(())
}

fn choose_input_adapter(
    report: &CapabilityReport,
    registry: &InputAdapterRegistry,
) -> Option<InputAdapterKind> {
    match report.control_mode {
        ControlMode::PortalControlPossible if registry.has(InputAdapterKind::PortalRemoteDesktop) => {
            Some(InputAdapterKind::PortalRemoteDesktop)
        }
        ControlMode::ViewerPlusUinputFallback if registry.has(InputAdapterKind::Ydotool) => {
            Some(InputAdapterKind::Ydotool)
        }
        _ => None,
    }
}

fn print_human_report(report: &CapabilityReport) {
    println!("Cosmic Remote Bridge host doctor");
    println!("viewer_mode: {:?}", report.viewer_mode);
    println!("control_mode: {:?}", report.control_mode);
    println!("recommendation: {}", report.recommendation);
    println!("notes:");
    for note in &report.notes {
        println!("- {note}");
    }
}
