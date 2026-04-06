require('dotenv').config();
var express = require('express');
var cors = require('cors');
var path = require('path');
var authRoutes = require('./routes/auth');
var userRoutes = require('./routes/users');
var teamRoutes = require('./routes/teams');
var requestRoutes = require('./routes/requests');

var app = express();
var http = require('http');
var server = http.createServer(app);
var { Server } = require('socket.io');
var io = new Server(server, { cors: { origin: '*' } });
var PORT = process.env.PORT || 5000;

io.on('connection', function(socket) {
  socket.on('join_room', function(connectionId) {
    socket.join(connectionId);
  });
  socket.on('send_message', function(data) {
    var dbUtils = require('./utils/db');
    var msg = dbUtils.addMessage(data);
    io.to(data.connectionId).emit('receive_message', msg);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', requestRoutes);

// Fallback: serve index.html for any non-API route
app.get('*', function(req, res) {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

server.listen(PORT, function() {
  console.log('');
  console.log('  ========================================');
  console.log('  DevMatch Server running on port ' + PORT);
  console.log('  http://localhost:' + PORT);
  console.log('  ========================================');
  console.log('');
});