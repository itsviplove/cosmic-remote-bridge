mod app;
mod config;
mod doctor;
mod input;
mod models;
mod pipewire;
mod portal;
mod relay;

use anyhow::Result;
use clap::{Parser, Subcommand};
use config::HostConfig;
use tracing_subscriber::EnvFilter;

#[derive(Debug, Parser)]
#[command(name = "cosmic-remote-host")]
#[command(about = "Host-side scaffold for COSMIC Remote Bridge")]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Detect local capabilities and print a recommendation.
    Doctor {
        #[arg(long)]
        json: bool,
    },
    /// Start the host service in its safest default mode.
    Serve {
        #[arg(long)]
        relay_url: Option<String>,
        #[arg(long)]
        pair_token: Option<String>,
        #[arg(long)]
        bind: Option<String>,
    },
    /// Print an example config for future install flows.
    PrintConfig,
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .without_time()
        .init();

    let cli = Cli::parse();

    match cli.command {
        Command::Doctor { json } => app::run_doctor(json).await,
        Command::Serve {
            relay_url,
            pair_token,
            bind,
        } => {
            let mut config = HostConfig::default();
            config.bind = bind.unwrap_or(config.bind);
            if let Some(url) = relay_url {
                config.relay_url = Some(url.parse()?);
            }
            config.pair_token = pair_token;
            app::run_service(config).await
        }
        Command::PrintConfig => {
            let config = HostConfig::default();
            println!("{}", serde_json::to_string_pretty(&config)?);
            Ok(())
        }
    }
}
