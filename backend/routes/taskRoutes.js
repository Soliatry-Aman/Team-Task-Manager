// Task management routes

const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const { protect } = require("../middleware/authMiddleware");

// ─── GET My Tasks ─────────────────────────────────────────────
// Returns all tasks assigned to the current user across all projects
// Single query — eliminates the N+1 problem in frontend
router.get("/my", protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("project", "title admin members")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Attach isAdmin flag to each task
    const enriched = tasks.map((task) => {
      const t = task.toObject();
      t.projectTitle = t.project?.title || "Unknown Project";
      t.isAdmin =
        t.project?.admin?.toString() === req.user.id;
      return t;
    });

    res.status(200).json(enriched);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Create Task ──────────────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      priority,
      projectId,
      assignedTo,
    } = req.body;

    // Validation
    if (
      !title ||
      !description ||
      !dueDate ||
      !projectId ||
      !assignedTo
    ) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Admin only
    if (project.admin.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only admin can create tasks",
      });
    }

    // Assigned user must be project member
    const isMember = project.members
      .map((id) => id.toString())
      .includes(assignedTo);

    if (!isMember) {
      return res.status(400).json({
        message: "Assigned user is not a project member",
      });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project: projectId,
      assignedTo,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Get Tasks By Project ─────────────────────────────────────
router.get("/:projectId", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Only project members
    const isMember = project.members
      .map((id) => id.toString())
      .includes(req.user.id);

    if (!isMember) {
      return res.status(403).json({
        message: "Not authorized to view tasks",
      });
    }

    const tasks = await Task.find({
      project: req.params.projectId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Update Task ─────────────────────────────────────────────
// Supports updating status AND optionally title, description, dueDate, priority
router.put("/:taskId", protect, async (req, res) => {
  try {
    const { status, title, description, dueDate, priority } = req.body;

    const task = await Task.findById(req.params.taskId).populate("project");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Admin or assigned member only
    const isAdmin =
      task.project.admin.toString() === req.user.id;
    const isAssigned =
      task.assignedTo.toString() === req.user.id;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        message: "Not authorized to update this task",
      });
    }

    // Update status if provided
    if (status !== undefined) {
      const validStatuses = ["To Do", "In Progress", "Done"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid task status",
        });
      }
      task.status = status;
    }

    // Admin can also update other fields
    if (isAdmin) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (priority !== undefined) {
        const validPriorities = ["Low", "Medium", "High"];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({ message: "Invalid priority" });
        }
        task.priority = priority;
      }
    }

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Delete Task ─────────────────────────────────────────────
router.delete("/:taskId", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate("project");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Admin only
    if (task.project.admin.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Only admin can delete tasks",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;