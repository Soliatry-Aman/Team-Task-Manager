// routes/userRoutes.js
// User search and listing routes

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

// ─── Get All Users ───────────────────────────────────────
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find().select(
      "-password"
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Search User By Email ────────────────────────────────
router.get("/search", protect, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        message: "Please provide an email to search",
      });
    }

    const user = await User.findOne({
      email: {
        $regex: email,
        $options: "i",
      },
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "No user found with that email",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;