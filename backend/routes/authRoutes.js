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
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// ─── Shared: Branded verification email HTML ──────────────
const buildVerificationEmail = (name, verificationUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your TeamTask email</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f2;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0f172a;padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="background:#2563eb;border-radius:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:22px;font-weight:800;">T</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0;letter-spacing:-0.02em;">TeamTask</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 8px;letter-spacing:-0.02em;">Verify your email address</h2>
              <p style="color:#64748b;font-size:15px;line-height:1.6;margin:0 0 28px;">Hi ${name}, welcome to TeamTask! Click the button below to verify your email and activate your account.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#2563eb;">
                    <a href="${verificationUrl}"
                       style="display:inline-block;background:#2563eb;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:-0.01em;">
                      Verify my email →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;margin:28px 0 0;line-height:1.6;">
                Or copy this link into your browser:<br/>
                <a href="${verificationUrl}" style="color:#2563eb;word-break:break-all;">${verificationUrl}</a>
              </p>
              <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0;" />
              <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">
                This link expires in <strong>1 hour</strong>. If you didn't create a TeamTask account, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
              <p style="color:#cbd5e1;font-size:12px;margin:0;">© ${new Date().getFullYear()} TeamTask. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Register ────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = hashToken(verificationToken);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    // Send email in isolated try-catch so email failure never blocks registration
    let emailSent = false;
    let devVerificationUrl = null;
    try {
      const emailResult = await sendEmail({
        to: user.email,
        subject: "Verify your TeamTask account",
        html: buildVerificationEmail(user.name, verificationUrl),
      });
      emailSent = !emailResult.skipped;
      if (emailResult.skipped) devVerificationUrl = verificationUrl;
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      // Still return success — user can resend from the inbox screen
      devVerificationUrl = verificationUrl;
    }

    res.status(201).json({
      message: "Account created! We've sent a verification link to your email.",
      emailSent,
      ...(devVerificationUrl ? { devVerificationUrl } : {}),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Login ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Resend Verification Email ───────────────────────────
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    // Don't reveal whether email exists (security best practice)
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered and unverified, we've sent a new link.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "This email is already verified. Please log in.",
      });
    }

    // Rate limit: only allow resend if more than 5 minutes have passed since last send
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires > Date.now() + (60 * 60 * 1000 - FIVE_MINUTES)
    ) {
      return res.status(429).json({
        message: "Please wait a few minutes before requesting another verification email.",
      });
    }

    // Generate fresh token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = hashToken(verificationToken);
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const emailResult = await sendEmail({
      to: user.email,
      subject: "Verify your TeamTask account",
      html: buildVerificationEmail(user.name, verificationUrl),
    });

    res.status(200).json({
      message: "A new verification link has been sent to your email.",
      emailSent: !emailResult.skipped,
      ...(emailResult.skipped ? { devVerificationUrl: verificationUrl } : {}),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ─── Verify Email ────────────────────────────────────────
router.get("/verify-email/:token", async (req, res) => {
  try {
    const hashedToken = hashToken(req.params.token);

    const userByToken = await User.findOne({
      emailVerificationToken: hashedToken,
    });

    // Token not found — treat as already verified (handles double-call edge case)
    if (!userByToken) {
      return res.status(200).json({
        message: "Email verified successfully. You can now log in.",
        alreadyVerified: true,
      });
    }

    // Token found but expired
    if (userByToken.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification link has expired. Please request a new one.",
      });
    }

    // Mark verified and clear token
    userByToken.isEmailVerified = true;
    userByToken.emailVerificationToken = undefined;
    userByToken.emailVerificationExpires = undefined;
    await userByToken.save();

    res.status(200).json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
