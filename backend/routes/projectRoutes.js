// routes/projectRoutes.js
// Project management routes

const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// ─── Create Project ──────────────────────────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Please fill in all fields",
      });
    }

    const project = await Project.create({
      title,
      description,
      admin: req.user.id,
      members: [req.user.id],
    });

    // Add project to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { projects: project._id },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Get User Projects ───────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    })
      .populate("admin", "name email")
      .populate("members", "name email");

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Get Single Project ──────────────────────────────────
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(
      req.params.id
    )
      .populate("admin", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Add Member ──────────────────────────────────────────
router.put(
  "/:id/add-member",
  protect,
  async (req, res) => {
    try {
      const { userId } = req.body;

      const project = await Project.findById(
        req.params.id
      );

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      // Admin only
      if (
        project.admin.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "Only admin can add members",
        });
      }

      // Prevent duplicate
      if (
        project.members.includes(userId)
      ) {
        return res.status(400).json({
          message:
            "User is already a member",
        });
      }

      project.members.push(userId);
      await project.save();

      await User.findByIdAndUpdate(userId, {
        $push: { projects: project._id },
      });

      res.status(200).json({
        message: "Member added successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

// ─── Remove Member ───────────────────────────────────────
router.put(
  "/:id/remove-member/:userId",
  protect,
  async (req, res) => {
    try {
      const project = await Project.findById(
        req.params.id
      );

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      // Admin only
      if (
        project.admin.toString() !== req.user.id
      ) {
        return res.status(403).json({
          message:
            "Only admin can remove members",
        });
      }

      // Prevent removing admin
      if (
        project.admin.toString() ===
        req.params.userId
      ) {
        return res.status(400).json({
          message:
            "Admin cannot be removed",
        });
      }

      // Remove from project
      project.members =
        project.members.filter(
          (member) =>
            member.toString() !==
            req.params.userId
        );

      await project.save();

      // Remove from user
      await User.findByIdAndUpdate(
        req.params.userId,
        {
          $pull: {
            projects: project._id,
          },
        }
      );

      res.status(200).json({
        message:
          "Member removed successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;