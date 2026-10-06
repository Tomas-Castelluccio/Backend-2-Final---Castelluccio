const mongoose = require("mongoose");

class HealthController {
  check = async (req, res) => {
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const databaseState = states[mongoose.connection.readyState] || "unknown";
    const isHealthy = databaseState === "connected";

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "ok" : "degraded",
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database: databaseState,
    });
  };
}

module.exports = HealthController;