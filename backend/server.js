// server.js
// Main backend entry point

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect database
connectDB();

// Initialize app
const app = express();

// ── Health check — NO CORS, always responds (used for wake-up ping) ──
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// ── CORS — allow any *.vercel.app subdomain + localhost ──
const allowedOrigins = [
  /^https:\/\/.*\.vercel\.app$/,   // all vercel preview & prod URLs
  /^http:\/\/localhost:\d+$/,       // local dev
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server (no origin) or matching origins
      if (!origin || allowedOrigins.some((pattern) => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Task Manager API is running",
    routes: [
      "GET/POST /api/auth",
      "GET /api/users, /api/users/me, /api/users/search",
      "GET/POST/PUT/DELETE /api/projects",
      "GET/POST/PUT/DELETE /api/tasks, GET /api/tasks/my",
      "GET /api/dashboard/stats",
    ],
  });
});

// Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});