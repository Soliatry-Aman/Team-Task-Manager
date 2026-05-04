// routes/authRoutes.js
// User authentication routes

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ─── Register ────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all fields" });
    }

    // Check existing user
    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email is already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(verificationToken);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 60 * 60 * 1000,
    });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Verify your TeamTask account",
      html: `
        <h2>Verify your email</h2>
        <p>Hello ${user.name},</p>
        <p>Click the link below to verify your TeamTask account:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.status(201).json({
      message:
        "Account created. Please verify your email before logging in.",
      ...(emailResult.skipped
        ? {
            devVerificationUrl: verificationUrl,
          }
        : {}),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// ─── Login ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all fields" });
    }

    // Find user
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message: "Please verify your email before login",
      });
    }

    res.status(200).json({
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

// Verify Email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Verification link is invalid or expired",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
