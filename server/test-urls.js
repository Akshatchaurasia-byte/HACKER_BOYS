var http = require('http');

function testUrl(path) {
  return new Promise(function(resolve, reject) {
    console.log('Attempting:', path);
    var req = http.get('http://localhost:5000' + path, function(res) {
      console.log('Connected!');
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        console.log('\n✅ ' + path);
        console.log('Status:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('Body preview:', body.substring(0, 200) + (body.length > 200 ? '...' : ''));
        resolve();
      });
    });
    req.on('error', function(e) {
      console.error('Connection error:', e.message, e.code);
      reject(e);
    });
  });
}

(async function() {
  try {
    console.log('Testing Approval Endpoints...\n');
    await testUrl('/api/approve?token=test_approval_token_abc123def456');
    await testUrl('/api/reject?token=test_approval_token_abc123def456');
    await testUrl('/api/approve?token=invalid_token_xyz');
    console.log('\n\n✅ All tests completed!');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
