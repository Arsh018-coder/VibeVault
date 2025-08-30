const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
