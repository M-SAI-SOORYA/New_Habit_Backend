import mongoose from "mongoose";

const DATABASE_STATES = ["disconnected", "connected", "connecting", "disconnecting"];

export function getHealth(_request, response) {
  const database = DATABASE_STATES[mongoose.connection.readyState] || "unknown";
  const healthy = database === "connected";

  response.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? "ok" : "degraded",
      database,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
}
