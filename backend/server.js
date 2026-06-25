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

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://team-task-manager-one.vercel.app",
    ],
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