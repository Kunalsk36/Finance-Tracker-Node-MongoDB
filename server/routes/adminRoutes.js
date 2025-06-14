const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Contact = require('../models/Contact');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Admin Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ error: 'Invalid username' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get total users
router.get('/total-users', verifyAdminToken, async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ totalUsers: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// ✅ Get total contact form submissions
router.get('/total-contacts', verifyAdminToken, async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.json({ totalContact: count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user count' });
  }
});

// ✅ Get all users
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await User.find({}, 'name email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Get all contact submissions
router.get('/contacts', verifyAdminToken, async (req, res) => {
  try {
    const contacts = await Contact.find({}, 'name email message');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

// ✅ Add new admin
router.post('/add-admin', verifyAdminToken, async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ error: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashed });
    await newAdmin.save();
    res.json({ message: 'New admin added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error adding new admin' });
  }
});

module.exports = router;
