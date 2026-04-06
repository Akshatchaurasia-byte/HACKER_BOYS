var http = require('http');

var testData = {
  email: 'trakinmining2006@gmail.com',
  data: {
    requester: { name: 'Test User', email: 'test@example.com' },
    message: 'Testing approval flow'
  }
};

var postData = JSON.stringify(testData);

var options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/request',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

var req = http.request(options, function(res) {
  var body = '';
  res.on('data', function(chunk) { body += chunk; });
  res.on('end', function() {
    console.log('\n✅ Request sent successfully!\n');
    var parsed = JSON.parse(body);
    console.log('Response:', JSON.stringify(parsed, null, 2));
    if (parsed.request && parsed.request.token) {
      console.log('\n📧 Email has been sent with this token:');
      console.log('Token:', parsed.request.token);
      console.log('\n🔗 Approval link: http://localhost:5000/api/approve?token=' + parsed.request.token);
      console.log('🔗 Rejection link: http://localhost:5000/api/reject?token=' + parsed.request.token);
    }
    process.exit(0);
  });
  res.on('error', function(e) {
    console.error('❌ Response Error:', e.message);
    process.exit(1);
  });
});

req.on('error', function(e) {
  console.error('❌ Request Error:', e.message);
  process.exit(1);
});

try {
  req.write(postData);
  req.end();
} catch (e) {
  console.error('❌ Write Error:', e.message);
  process.exit(1);
}

setTimeout(function() {
  console.error('❌ Timeout: No response after 5 seconds');
  process.exit(1);
}, 5000);
