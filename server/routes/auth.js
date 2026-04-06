var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var db = require('../utils/db');
var authMiddleware = require('../middleware/auth');
var router = express.Router();

// POST /api/auth/register
router.post('/register', function(req, res) {
  try {
    var body = req.body;
    if (!body.name || !body.email || !body.password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (body.password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    var existing = db.getUserByEmail(body.email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(body.password, salt);
    var newUser = {
      id: 'u' + Date.now(),
      name: body.name,
      email: body.email,
      passwordHash: hash,
      role: body.role || '',
      bio: body.bio || '',
      experience: body.experience || 'intermediate',
      availability: body.availability || 'flexible',
      skills: body.skills || [],
      interests: body.interests || [],
      seekingSkills: body.seekingSkills || [],
      github: body.github || '',
      linkedin: body.linkedin || '',
      avatarColor: body.avatarColor != null ? body.avatarColor : Math.floor(Math.random() * 8),
      joinedAt: Date.now()
    };
    db.addUser(newUser);
    var token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    var safeUser = Object.assign({}, newUser);
    delete safeUser.passwordHash;
    res.status(201).json({ token: token, user: safeUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', function(req, res) {
  try {
    var body = req.body;
    if (!body.email || !body.password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    var user = db.getUserByEmail(body.email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    var valid = bcrypt.compareSync(body.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    var token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    var safeUser = Object.assign({}, user);
    delete safeUser.passwordHash;
    res.json({ token: token, user: safeUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, function(req, res) {
  var user = db.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  var safeUser = Object.assign({}, user);
  delete safeUser.passwordHash;
  res.json({ user: safeUser });
});

module.exports = router;