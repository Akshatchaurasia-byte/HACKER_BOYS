// server/test-send.js
require('dotenv').config();
const mailer = require('./utils/mailer');
mailer.sendApprovalEmail(process.env.GMAIL_USER, 'test-token-123', { name: 'Test Sender' });
console.log('Test send invoked');