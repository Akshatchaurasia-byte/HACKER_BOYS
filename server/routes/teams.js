var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var jwt = require('jsonwebtoken');

// Auth Middleware
function authMiddleware(req, res, next) {
  var token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    var decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET || 'devmatch_hackathon_secret_2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/teams - List all teams
router.get('/', authMiddleware, function(req, res) {
  var allTeams = db.getTeams();
  res.json({ teams: allTeams });
});

// POST /api/teams - Create a team
router.post('/', authMiddleware, function(req, res) {
  var teamData = req.body;
  if (!teamData.name || !teamData.description) return res.status(400).json({ error: 'Name and description required' });
  
  teamData.ownerId = req.user.id;
  var newTeam = db.addTeam(teamData);
  res.status(201).json({ team: newTeam });
});

// GET /api/teams/requests - Fetch pending requests for teams I own
router.get('/requests', authMiddleware, function(req, res) {
  var myTeams = db.getTeams().filter(function(t) { return t.ownerId === req.user.id; });
  var myTeamIds = myTeams.map(function(t) { return t.id; });
  var requests = db.getTeamRequests().filter(function(r) { return myTeamIds.includes(r.teamId) && r.status === 'pending'; });
  res.json({ requests: requests });
});

// POST /api/teams/:id/apply - Apply to team
router.post('/:id/apply', authMiddleware, function(req, res) {
  var teamId = req.params.id;
  // Check if already applied
  var existing = db.getTeamRequests().find(function(r) { return r.teamId === teamId && r.applicantId === req.user.id; });
  if (existing) return res.status(400).json({ error: 'Already applied' });
  
  var reqObj = db.addTeamRequest({ teamId: teamId, applicantId: req.user.id });
  res.json({ success: true, request: reqObj });
});

// POST /api/teams/requests/:reqId - Accept/Deny
router.post('/requests/:reqId', authMiddleware, function(req, res) {
  var reqId = req.params.reqId;
  var action = req.body.action; // 'accepted' or 'rejected'
  
  var success = db.updateTeamRequest(reqId, action);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Failed to update request' });
  }
});

module.exports = router;