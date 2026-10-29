'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Validation Helpers ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const clean = phone.trim().replace(/[\s-]/g, '');
  return PHONE_REGEX.test(clean);
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
};

// ─── POST /api/auth/register ───────────────────────────────────────────────
// Self-registration is always role=donor. Admin/hospital accounts are seeded.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required', code: 'VALIDATION_ERROR' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address (e.g. name@example.com)',
        code: 'INVALID_EMAIL'
      });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9',
        code: 'INVALID_PHONE'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        code: 'WEAK_PASSWORD'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email is already registered', code: 'EMAIL_CONFLICT' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'donor', // always donor — role cannot be chosen by self-registration
      phone: phone ? phone.trim() : '',
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required', code: 'VALIDATION_ERROR' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address (e.g. name@example.com)', code: 'INVALID_EMAIL' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        error: 'This account was created with Google Sign-In. Please click "Sign in with Google" to continue.',
        code: 'USE_GOOGLE_AUTH'
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture || '',
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/google ──────────────────────────────────────────────────
router.post('/google', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google credential token is required', code: 'MISSING_TOKEN' });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: 'Google Client ID is not configured on the server', code: 'CONFIG_ERROR' });
    }

    // Verify the Google ID token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('Google token verification failed:', verifyErr.message);
      return res.status(401).json({ error: 'Invalid or expired Google Token', code: 'INVALID_GOOGLE_TOKEN' });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Unable to retrieve email from Google account', code: 'NO_EMAIL' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }]
    });

    if (user) {
      // Link googleId or update avatar picture if changed
      let changed = false;
      if (!user.googleId) {
        user.googleId = googleId;
        changed = true;
      }
      if (picture && user.picture !== picture) {
        user.picture = picture;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    } else {
      // Self-registration defaults to 'donor'
      user = await User.create({
        name: name || 'Google User',
        email: normalizedEmail,
        googleId,
        picture: picture || '',
        role: 'donor',
      });
    }

    // Issue RedFlow JWT token
    const appToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture || '',
        phone: user.phone || '',
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/create-hospital ─────────────────────────────────────────
// Admin only: create a new hospital account with full location & contact details
router.post('/create-hospital', auth, role(['admin']), async (req, res, next) => {
  try {
    const { name, email, password, phone, address, district, state, pincode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Hospital Name, Email, and Password are required', code: 'VALIDATION_ERROR' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address (e.g. hospital@example.com)',
        code: 'INVALID_EMAIL'
      });
    }

    if (phone && !validatePhone(phone)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit contact mobile number starting with 6, 7, 8, or 9',
        code: 'INVALID_PHONE'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        code: 'WEAK_PASSWORD'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'Account with this email already exists', code: 'EMAIL_CONFLICT' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const hospitalUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'hospital',
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      district: (district || 'Hassan').trim(),
      state: (state || 'Karnataka').trim(),
      pincode: (pincode || '').trim(),
    });

    return res.status(201).json({
      message: 'Hospital account created successfully',
      hospital: {
        id: hospitalUser._id,
        name: hospitalUser.name,
        email: hospitalUser.email,
        role: hospitalUser.role,
        phone: hospitalUser.phone,
        address: hospitalUser.address,
        district: hospitalUser.district,
        state: hospitalUser.state,
        pincode: hospitalUser.pincode,
        createdAt: hospitalUser.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});


// ─── GET /api/auth/hospitals ───────────────────────────────────────────────
// Admin only: list all registered hospital accounts
router.get('/hospitals', auth, role(['admin']), async (req, res, next) => {
  try {
    const hospitals = await User.find({ role: 'hospital' }).sort({ createdAt: -1 });
    return res.status(200).json({ hospitals });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

