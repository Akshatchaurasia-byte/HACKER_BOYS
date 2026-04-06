// DevMatch API Client
// Centralised fetch layer for all server communication
var DevMatchAPI = (function() {
  var BASE = '/api';

  function getToken() {
    return localStorage.getItem('devmatch_token') || null;
  }

  function saveAuth(token, user) {
    localStorage.setItem('devmatch_token', token);
    saveCurrentUser(user);
  }

  function clearAuth() {
    localStorage.removeItem('devmatch_token');
    localStorage.removeItem('devmatch_current_user');
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function authHeaders() {
    var token = getToken();
    var h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }

  function handleResponse(res) {
    if (res.status === 401) {
      clearAuth();
      // Optionally redirect to login
    }
    return res.json();
  }

  // ========== AUTH ==========
  function register(body) {
    return fetch(BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse);
  }

  function login(email, password) {
    return fetch(BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    }).then(handleResponse);
  }

  function getMe() {
    return fetch(BASE + '/auth/me', {
      headers: authHeaders()
    }).then(handleResponse);
  }

  // ========== USERS ==========
  function fetchUsers(params) {
    var qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(BASE + '/users' + qs, {
      headers: authHeaders()
    }).then(handleResponse);
  }

  function fetchUser(id) {
    return fetch(BASE + '/users/' + id, {
      headers: authHeaders()
    }).then(handleResponse);
  }

  function updateProfile(updates) {
    return fetch(BASE + '/users/me', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates)
    }).then(handleResponse);
  }

  // ========== MATCHING ==========
  function fetchMatches() {
    return fetch(BASE + '/match', {
      headers: authHeaders()
    }).then(handleResponse);
  }

  // ========== CONNECTIONS ==========
  function sendConnect(userId) {
    return fetch(BASE + '/connect/' + userId, {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse);
  }

  function fetchConnections() {
    return fetch(BASE + '/connections', {
      headers: authHeaders()
    }).then(handleResponse);
  }

  function respondConnect(connId, status) {
    return fetch(BASE + '/connect/' + connId, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: status })
    }).then(handleResponse);
  }

  // ========== MESSAGES ==========
  function fetchMessages(connId) {
    return fetch(BASE + '/messages/' + connId, {
      headers: authHeaders()
    }).then(handleResponse);
  }

  // ========== TEAMS ==========
  function fetchTeams() {
    return fetch(BASE + '/teams', { headers: authHeaders() }).then(handleResponse);
  }

  function createTeam(teamData) {
    return fetch(BASE + '/teams', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(teamData)
    }).then(handleResponse);
  }

  function applyToTeam(teamId) {
    return fetch(BASE + '/teams/' + teamId + '/apply', {
      method: 'POST',
      headers: authHeaders()
    }).then(handleResponse);
  }

  function fetchTeamRequests() {
    return fetch(BASE + '/teams/requests', { headers: authHeaders() }).then(handleResponse);
  }

  function respondTeamRequest(reqId, action) {
    return fetch(BASE + '/teams/requests/' + reqId, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ action: action })
    }).then(handleResponse);
  }

  // ========== LOGOUT ==========
  function logout() {
    clearAuth();
    window.location.href = 'login.html';
  }

  return {
    getToken: getToken,
    saveAuth: saveAuth,
    clearAuth: clearAuth,
    isLoggedIn: isLoggedIn,
    register: register,
    login: login,
    getMe: getMe,
    fetchUsers: fetchUsers,
    fetchUser: fetchUser,
    updateProfile: updateProfile,
    fetchMatches: fetchMatches,
    sendConnect: sendConnect,
    fetchConnections: fetchConnections,
    respondConnect: respondConnect,
    fetchMessages: fetchMessages,
    fetchTeams: fetchTeams,
    createTeam: createTeam,
    applyToTeam: applyToTeam,
    fetchTeamRequests: fetchTeamRequests,
    respondTeamRequest: respondTeamRequest,
    logout: logout
  };
})();