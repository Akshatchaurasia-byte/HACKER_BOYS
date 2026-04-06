var fs = require('fs');
var path = require('path');

var DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function readDB() {
  try {
    var raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    var empty = { users: [], connections: [], messages: [], teams: [], team_requests: [] };
    writeDB(empty);
    return empty;
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function getUsers() {
  return readDB().users || [];
}

function getUserById(id) {
  return getUsers().find(function(u) { return u.id === id; }) || null;
}

function getUserByEmail(email) {
  return getUsers().find(function(u) { return u.email === email; }) || null;
}

function addUser(user) {
  var db = readDB();
  db.users.push(user);
  writeDB(db);
  return user;
}

function updateUser(id, updates) {
  var db = readDB();
  var idx = db.users.findIndex(function(u) { return u.id === id; });
  if (idx < 0) return null;
  Object.keys(updates).forEach(function(key) {
    if (key !== 'id' && key !== 'passwordHash') {
      db.users[idx][key] = updates[key];
    }
  });
  writeDB(db);
  return db.users[idx];
}

function getConnections() {
  return readDB().connections || [];
}

function addConnection(conn) {
  var db = readDB();
  if (!db.connections) db.connections = [];
  db.connections.push(conn);
  writeDB(db);
  return conn;
}

function updateConnection(id, updates) {
  var db = readDB();
  if (!db.connections) db.connections = [];
  var idx = db.connections.findIndex(function(c) { return c.id === id; });
  if (idx < 0) return null;
  Object.keys(updates).forEach(function(key) {
    db.connections[idx][key] = updates[key];
  });
  writeDB(db);
  return db.connections[idx];
}

function getMessages(connectionId) {
  var db = readDB();
  return (db.messages || []).filter(function(m) { return m.connectionId === connectionId; });
}

function addMessage(msg) {
  var db = readDB();
  if (!db.messages) db.messages = [];
  var newMsg = Object.assign({}, msg, { id: 'm' + Date.now(), sentAt: Date.now() });
  db.messages.push(newMsg);
  writeDB(db);
  return newMsg;
}

function getTeams() {
  var db = readDB();
  return db.teams || [];
}

function addTeam(team) {
  var db = readDB();
  if (!db.teams) db.teams = [];
  var newTeam = Object.assign({}, team, { id: 'team_' + Date.now(), members: [team.ownerId], createdAt: Date.now() });
  db.teams.push(newTeam);
  writeDB(db);
  return newTeam;
}

function getTeamRequests() {
  var db = readDB();
  return db.team_requests || [];
}

function addTeamRequest(req) {
  var db = readDB();
  if (!db.team_requests) db.team_requests = [];
  var newReq = Object.assign({}, req, { id: 'req_' + Date.now(), status: 'pending', createdAt: Date.now() });
  db.team_requests.push(newReq);
  writeDB(db);
  return newReq;
}

function updateTeamRequest(reqId, status) {
  var db = readDB();
  if (!db.team_requests) return false;
  var req = db.team_requests.find(function(r) { return r.id === reqId; });
  if (req) {
    req.status = status;
    if (status === 'accepted') {
       if (!db.teams) db.teams = [];
       var team = db.teams.find(function(t) { return t.id === req.teamId; });
       if (team && !team.members.includes(req.applicantId) && team.members.length < 4) {
           team.members.push(req.applicantId);
           if (!db.connections) db.connections = [];
           var existingGroupConn = db.connections.find(function(c) { return c.from === 'team' && c.teamId === req.teamId; });
           if (!existingGroupConn) {
              db.connections.push({ id: 'conn_team_' + req.teamId, from: 'team', to: 'team', teamId: req.teamId, status: 'accepted' });
           }
       } else {
           req.status = 'rejected_full';
       }
    }
    writeDB(db);
    return true;
  }
  return false;
}

// Approval request helpers (for email-based approve/reject flow)
function getApprovalRequests() {
  var db = readDB();
  return db.approval_requests || [];
}

function addApprovalRequest(reqObj) {
  var db = readDB();
  if (!db.approval_requests) db.approval_requests = [];
  var newReq = Object.assign({}, reqObj, { id: 'ar_' + Date.now(), status: reqObj.status || 'pending', createdAt: Date.now() });
  db.approval_requests.push(newReq);
  writeDB(db);
  return newReq;
}

function getApprovalRequestByToken(token) {
  var db = readDB();
  if (!db.approval_requests) return null;
  return db.approval_requests.find(function(r) { return r.token === token; }) || null;
}

function getApprovalRequestsByEmail(email) {
  var db = readDB();
  if (!db.approval_requests) return [];
  return db.approval_requests.filter(function(r) { return r.email === email; });
}

function updateApprovalRequestStatus(token, status) {
  var db = readDB();
  if (!db.approval_requests) return null;
  var idx = db.approval_requests.findIndex(function(r) { return r.token === token; });
  if (idx < 0) return null;
  db.approval_requests[idx].status = status;
  db.approval_requests[idx].resolvedAt = Date.now();
  writeDB(db);
  return db.approval_requests[idx];
}

module.exports = {
  readDB: readDB,
  writeDB: writeDB,
  getUsers: getUsers,
  getUserById: getUserById,
  getUserByEmail: getUserByEmail,
  addUser: addUser,
  updateUser: updateUser,
  getConnections: getConnections,
  addConnection: addConnection,
  updateConnection: updateConnection,
  getMessages: getMessages,
  addMessage: addMessage,
  getTeams: getTeams,
  addTeam: addTeam,
  getTeamRequests: getTeamRequests,
  addTeamRequest: addTeamRequest,
  updateTeamRequest: updateTeamRequest
  ,
  // approval request functions
  getApprovalRequests: getApprovalRequests,
  addApprovalRequest: addApprovalRequest,
  getApprovalRequestByToken: getApprovalRequestByToken,
  getApprovalRequestsByEmail: getApprovalRequestsByEmail,
  updateApprovalRequestStatus: updateApprovalRequestStatus
};