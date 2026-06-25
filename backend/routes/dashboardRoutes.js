// Dashboard stats route
// Returns aggregated task stats for the current user in ONE query

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");

// ─── GET /api/dashboard/stats ────────────────────────────────
// Returns total, todo, inProgress, done, overdue counts + recent tasks
router.get("/stats", protect, async (req, res) => {
  try {
    // Get all projects the user is a member of
    const projects = await Project.find({ members: req.user.id }).select("_id");
    const projectIds = projects.map((p) => p._id);

    if (projectIds.length === 0) {
      return res.status(200).json({
        totalTasks: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        doneTasks: 0,
        overdueTasks: 0,
        recentTasks: [],
      });
    }

    const now = new Date();

    // Single aggregation query — no N+1
    const [counts, recentTasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todo: {
              $sum: { $cond: [{ $eq: ["$status", "To Do"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] },
            },
            done: {
              $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] },
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$status", "Done"] },
                      { $lt: ["$dueDate", now] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Task.find({ project: { $in: projectIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("project", "title")
        .populate("assignedTo", "name")
        .select("title status priority dueDate project assignedTo"),
    ]);

    const stats = counts[0] || {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
    };

    res.status(200).json({
      totalTasks: stats.total,
      todoTasks: stats.todo,
      inProgressTasks: stats.inProgress,
      doneTasks: stats.done,
      overdueTasks: stats.overdue,
      recentTasks,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
