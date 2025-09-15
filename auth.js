// routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validatePassword, validateEmail, validateUsername } from '../utils/validation.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// register
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    
    // Check if all required fields are provided
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'email, username, password required' });
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error });
    }

    // Enforce corporate domain
    const allowedDomain = '@mmc.com';
    if (!email.toLowerCase().endsWith(allowedDomain)) {
      return res.status(400).json({ message: `Only ${allowedDomain} email addresses can register` });
    }

    // Validate username
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ message: usernameValidation.errors.join(', ') });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.errors.join(', ') });
    }

    // Check if user already exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(409).json({ message: 'Email or username already in use' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email, 
      username, 
      passwordHash
    });

    return res.status(201).json({
      message: 'Registration successful. You can now log in.',
      id: user._id,
      email: user.email,
      username: user.username,
      isVerified: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: 'username and password required' });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User does not exist. Please register.' });
    }
    
    // Enforce corporate domain at login as well
    const allowedDomain = '@mmc.com';
    if (!String(user.email || '').toLowerCase().endsWith(allowedDomain)) {
      return res.status(403).json({ message: `Only ${allowedDomain} users can log in` });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Email verification removed; domain policy enforced below

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ 
      message: 'Login successful', 
      id: user._id, 
      username: user.username, 
      email: user.email,
      token 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Email verification and resend endpoints removed

export default router;
 
// Reset password without email/OTP (corporate constraint)
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body || {};
    if (!username || !newPassword) {
      return res.status(400).json({ message: 'username and newPassword required' });
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.errors.join(', ') });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Enforce domain policy for corporate users
    const allowedDomain = '@mmc.com';
    if (!String(user.email || '').toLowerCase().endsWith(allowedDomain)) {
      return res.status(403).json({ message: `Only ${allowedDomain} users can reset password` });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});
