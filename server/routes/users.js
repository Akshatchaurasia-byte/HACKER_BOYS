var express = require('express');
var db = require('../utils/db');
var matcher = require('../utils/matcher');
var authMiddleware = require('../middleware/auth');
var router = express.Router();

// GET /api/users - public listing
router.get('/users', function(req, res) {
  var users = db.getUsers();
  var q = req.query;
  // Filter
  if (q.skill) users = users.filter(function(u) { return (u.skills||[]).indexOf(q.skill) >= 0; });
  if (q.experience) users = users.filter(function(u) { return u.experience === q.experience; });
  if (q.domain) users = users.filter(function(u) { return (u.interests||[]).indexOf(q.domain) >= 0; });
  if (q.availability) users = users.filter(function(u) { return u.availability === q.availability; });
  if (q.search) {
    var term = q.search.toLowerCase();
    users = users.filter(function(u) {
      return u.name.toLowerCase().indexOf(term) >= 0 ||
        (u.role||'').toLowerCase().indexOf(term) >= 0 ||
        (u.skills||[]).join(' ').toLowerCase().indexOf(term) >= 0;
    });
  }
  // Sort
  if (q.sort === 'name') users.sort(function(a,b) { return a.name.localeCompare(b.name); });
  else if (q.sort === 'exp-desc') {
    var expO = {beginner:0,intermediate:1,advanced:2,expert:3};
    users.sort(function(a,b) { return (expO[b.experience]||0)-(expO[a.experience]||0); });
  }
  else users.sort(function(a,b) { return (b.joinedAt||0)-(a.joinedAt||0); });
  // Remove password hashes from response
  var safe = users.map(function(u) {
    var copy = Object.assign({}, u);
    delete copy.passwordHash;
    return copy;
  });
  res.json({ users: safe, count: safe.length });
});

// GET /api/users/:id
router.get('/users/:id', function(req, res) {
  var user = db.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  var safe = Object.assign({}, user);
  delete safe.passwordHash;
  res.json({ user: safe });
});

// PUT /api/users/me - update own profile
router.put('/users/me', authMiddleware, function(req, res) {
  var updated = db.updateUser(req.userId, req.body);
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  var safe = Object.assign({}, updated);
  delete safe.passwordHash;
  res.json({ user: safe });
});

// GET /api/match - ranked matches for current user
router.get('/match', authMiddleware, function(req, res) {
  var currentUser = db.getUserById(req.userId);
  if (!currentUser) return res.status(404).json({ error: 'User not found.' });
  var allUsers = db.getUsers();
  var ranked = matcher.getRankedMatches(currentUser, allUsers);
  // Strip password hashes
  var results = ranked.map(function(item) {
    var safe = Object.assign({}, item.user);
    delete safe.passwordHash;
    return { user: safe, score: item.score };
  });
  res.json({ matches: results, count: results.length });
});

// POST /api/connect/:userId - send connection request
router.post('/connect/:userId', authMiddleware, function(req, res) {
  var toUser = db.getUserById(req.params.userId);
  if (!toUser) return res.status(404).json({ error: 'Target user not found.' });
  if (req.params.userId === req.userId) return res.status(400).json({ error: 'Cannot connect to yourself.' });
  var conns = db.getConnections();
  var existing = conns.find(function(c) {
    return (c.from === req.userId && c.to === req.params.userId) ||
           (c.from === req.params.userId && c.to === req.userId);
  });
  if (existing) return res.json({ connection: existing, message: 'Connection already exists.' });
  var conn = {
    id: 'c' + Date.now(),
    from: req.userId,
    to: req.params.userId,
    status: 'pending',
    createdAt: Date.now()
  };
  db.addConnection(conn);
  res.status(201).json({ connection: conn });
});

// GET /api/connections - my connections
router.get('/connections', authMiddleware, function(req, res) {
  var conns = db.getConnections().filter(function(c) {
    return c.from === req.userId || c.to === req.userId;
  });
  res.json({ connections: conns });
});

// PUT /api/connect/:id - accept/reject
router.put('/connect/:id', authMiddleware, function(req, res) {
  var updated = db.updateConnection(req.params.id, { status: req.body.status });
  if (!updated) return res.status(404).json({ error: 'Connection not found.' });
  res.json({ connection: updated });
});



// GET /api/messages/:connectionId
router.get('/messages/:connectionId', authMiddleware, function(req, res) {
  var msgs = db.getMessages(req.params.connectionId);
  res.json({ messages: msgs });
});

module.exports = router;