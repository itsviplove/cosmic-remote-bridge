#[derive(Debug, Clone)]
pub struct PipeWireCapturePlan {
    pub node_id: Option<u32>,
    pub pixel_format: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
}

impl PipeWireCapturePlan {
    pub fn placeholder() -> Self {
        Self {
            node_id: None,
            pixel_format: None,
            width: None,
            height: None,
        }
    }
}

pub async fn consume_frames(_plan: &PipeWireCapturePlan) {
    // TODO: connect to PipeWire node returned by ScreenCast portal.
    // Suggested first milestone: pull frames into an in-memory ring buffer
    // before attempting WebRTC transport.
}
