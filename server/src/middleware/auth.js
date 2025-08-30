const jwt = require('jsonwebtoken');
const prisma = require('../db/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isVerified: true
      }
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    req.user = { ...decoded, ...user };
    next();
  } catch (err) {
<<<<<<< HEAD
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: "Invalid or expired token" });
=======
    console.log(`Exception while doing something: ${err}`);
>>>>>>> 695296bbcba2ae68b159ad7a57337e4b14d04b29
  }
};
