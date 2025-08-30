const prisma = require('../db/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateOTP } = require('../utils/otpGenerator'); // OTP utility
const smsService = require('../services/smsService'); // Make sure you have SMS service

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * REGISTER USER & SEND OTP
 */
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'ATTENDEE', phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user as unverified
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        phone,
        isVerified: false,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isVerified: true,
        createdAt: true
      }
    });

    // Generate OTP
    const otp = generateOTP(6);

    // Save OTP in DB (or in-memory store like Redis) with expiry
    await prisma.otp.create({
      data: {
        userId: user.id,
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      }
    });

    // Send OTP via SMS
    if (phone) {
      await smsService.sendSMS(phone, `Your verification OTP is: ${otp}`);
    }

    res.status(201).json({
      message: 'User registered successfully. OTP sent for verification',
      userId: user.id
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * VERIFY OTP
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    // Fetch OTP from DB
    const record = await prisma.otp.findFirst({
      where: {
        userId,
        code: otp,
        expiresAt: { gt: new Date() } // not expired
      }
    });

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true }
    });

    // Delete used OTP
    await prisma.otp.delete({ where: { id: record.id } });

    res.json({ message: 'User verified successfully' });

  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

/**
 * LOGIN USER
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' });
    if (!user.isVerified) return res.status(401).json({ message: 'Account not verified' });

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({ message: 'Login successful', token, user: userWithoutPassword });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
