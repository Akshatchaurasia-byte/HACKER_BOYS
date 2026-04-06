const fs = require('fs');
const http = require('http');
const data = fs.readFileSync('request.json','utf8');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/request',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let out = '';
  res.on('data', (chunk) => out += chunk);
  res.on('end', () => { console.log(out); });
});

req.on('error', (e) => { console.error('Request error', e); });
req.write(data);
req.end();
