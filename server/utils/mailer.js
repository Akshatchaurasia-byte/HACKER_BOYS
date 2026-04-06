const nodemailer = require('nodemailer');
require('dotenv').config();

// Read and sanitize env vars
const GMAIL_USER = (process.env.GMAIL_USER || '').trim();
const GMAIL_PASS = (process.env.GMAIL_PASS || '').trim();
const APP_DOMAIN = (process.env.APP_DOMAIN || 'http://localhost:5000').trim();

if (!GMAIL_USER || !GMAIL_PASS) {
  console.warn('MAILER: GMAIL_USER or GMAIL_PASS is not set. Email sending will fail until these are configured.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER || undefined,
    pass: GMAIL_PASS || undefined
  }
});

function sendApprovalEmail(userEmail, token, requester) {
  const acceptLink = `${APP_DOMAIN}/api/approve?token=${token}`;
  const rejectLink = `${APP_DOMAIN}/api/reject?token=${token}`;

  const mailOptions = {
    from: GMAIL_USER || 'no-reply@example.com',
    to: userEmail,
    subject: 'DevMatch — Request Approval Needed',
    html: `
      <h3>New Request from ${requester && requester.name ? requester.name : 'Someone'}</h3>
      <p>They requested to connect. Click a link below to respond:</p>
      <p><a href="${acceptLink}">✅ Accept</a> &nbsp; <a href="${rejectLink}">❌ Reject</a></p>
      <p>If these links do not work, copy/paste the full URL into your browser.</p>
    `
  };

  // Attempt send and return a Promise so callers can await or handle errors
  return transporter.sendMail(mailOptions).then(function(info) {
    console.log('Approval email sent to', userEmail);
    return info;
  }).catch(function(err) {
    // Do not print secrets; provide actionable diagnostic info
    console.error('Failed to send approval email —', err && err.message ? err.message : err);
    throw err;
  });
}

module.exports = { sendApprovalEmail };
