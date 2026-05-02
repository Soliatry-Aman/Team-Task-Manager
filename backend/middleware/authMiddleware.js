// middleware/authMiddleware.js
// Protect routes using JWT authentication

const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach user data
    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, invalid token" });
  }
};

module.exports = { protect };