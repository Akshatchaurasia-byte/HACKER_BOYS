var express = require('express');
var router = express.Router();
var db = require('../utils/db');
var mailer = require('../utils/mailer');
var crypto = require('crypto');

// POST /api/request
router.post('/request', async function(req, res) {
  try {
    var email = req.body.email;
    var data = req.body.data || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    // create token
    var token = crypto.randomBytes(24).toString('hex');
    var reqObj = db.addApprovalRequest({ email: email, data: data, token: token, status: 'pending' });

    // send email in background (fire and forget)
    setImmediate(function() {
      try {
        mailer.sendApprovalEmail(email, token, data.requester || null).catch(function(err) {
          console.error('Email send error:', err && err.message ? err.message : err);
        });
      } catch (e) {
        console.error('Email send exception:', e);
      }
    });

    res.json({ message: 'Request sent for approval', request: reqObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/approve?token=...
router.get('/approve', async function(req, res) {
  var token = req.query.token;
  if (!token) {
    return res.status(400).send(`
      <html>
        <head><title>Approval Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Missing Token</h1><p>The approval link is invalid or missing the token.</p></body>
      </html>
    `);
  }
  var r = db.getApprovalRequestByToken(token);
  if (!r) {
    return res.status(404).send(`
      <html>
        <head><title>Approval Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Invalid Token</h1><p>This approval token is not found or has expired.</p><p><strong>Debug Info:</strong> Token: ${token.substring(0, 8)}...</p></body>
      </html>
    `);
  }
  var updated = db.updateApprovalRequestStatus(token, 'approved');
  if (!updated) {
    return res.status(500).send(`
      <html>
        <head><title>Approval Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Failed to Update</h1><p>Could not process your approval. Please try again.</p></body>
      </html>
    `);
  }
  res.send(`
    <html>
      <head><title>Approval Confirmed</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#4caf50}p{color:#666}</style></head>
      <body><h1>✅ Request Approved</h1><p>Your approval has been recorded. You can close this page.</p></body>
    </html>
  `);
});

// GET /api/reject?token=...
router.get('/reject', async function(req, res) {
  var token = req.query.token;
  if (!token) {
    return res.status(400).send(`
      <html>
        <head><title>Rejection Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Missing Token</h1><p>The rejection link is invalid or missing the token.</p></body>
      </html>
    `);
  }
  var r = db.getApprovalRequestByToken(token);
  if (!r) {
    return res.status(404).send(`
      <html>
        <head><title>Rejection Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Invalid Token</h1><p>This rejection token is not found or has expired.</p><p><strong>Debug Info:</strong> Token: ${token.substring(0, 8)}...</p></body>
      </html>
    `);
  }
  var updated = db.updateApprovalRequestStatus(token, 'rejected');
  if (!updated) {
    return res.status(500).send(`
      <html>
        <head><title>Rejection Error</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#d32f2f}p{color:#666}</style></head>
        <body><h1>❌ Failed to Update</h1><p>Could not process your rejection. Please try again.</p></body>
      </html>
    `);
  }
  res.send(`
    <html>
      <head><title>Rejection Confirmed</title><style>body{font-family:Arial;text-align:center;padding:2rem;background:#f5f5f5}h1{color:#ff9800}p{color:#666}</style></head>
      <body><h1>❌ Request Rejected</h1><p>Your rejection has been recorded. You can close this page.</p></body>
    </html>
  `);
});

// GET /api/requests/pending?email=owner@example.com
router.get('/requests/pending', function(req, res) {
  var email = req.query.email;
  if (!email) return res.status(400).json({ error: 'Email required' });
  var all = db.getApprovalRequestsByEmail(email);
  var pending = all.filter(function(r){ return r.status === 'pending'; });
  res.json({ requests: pending });
});

module.exports = router;
