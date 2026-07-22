// Health check endpoint — responds instantly for keep-alive pings
// Added to server.js root-level so Render can use it as the health check URL

const express = require("express");
const router = express.Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

module.exports = router;
