// DevMatch Chat UI Logic
var ChatApp = (function() {
  var socket = null;
  var currentUser = null;
  var currentConnId = null;
  var otherUser = null;
  var usersCache = [];

  function init(user) {
    currentUser = user;
    if (typeof io !== "undefined") {
      socket = io();
      socket.on('receive_message', function(msg) {
        if (msg.connectionId === currentConnId) {
          renderMessage(msg);
          scrollToBottom();
        }
      });
    } else {
      console.error("Socket.io not loaded");
    }

    loadConnections();
    loadInbox();
    document.getElementById('inbox-toggle-btn').addEventListener('click', function() { document.getElementById('team-inbox-panel').classList.toggle('hidden'); });

    // Form submit
    document.getElementById('chat-form').addEventListener('submit', function(e) {
      e.preventDefault();
      var input = document.getElementById('chat-input');
      var text = input.value.trim();
      if (!text || !currentConnId) return;

      var newMsg = {
        connectionId: currentConnId,
        sender: currentUser.id,
        text: text
      };

      if (socket) socket.emit('send_message', newMsg);
      input.value = '';
    });
  }

  function loadConnections() {
    DevMatchAPI.fetchConnections().then(function(data) {
      var conns = data.connections || [];
      // Get full user details for each connection using fetchUser or fetchUsers
      DevMatchAPI.fetchUsers().then(function(uData) {
        var allUsers = uData.users || [];
        usersCache = allUsers; // Store globally for open chat reference
        var listEl = document.getElementById('conn-list');
        listEl.innerHTML = '';

        // Inject Open (Global) Chat automatically
        var globalItem = document.createElement('div');
        globalItem.className = 'conn-item';
        globalItem.id = 'conn-global';
        globalItem.innerHTML = 
          '<div class="conn-avatar" style="background: linear-gradient(135deg, #10b981, #34d399); font-size:1.1rem;">🌍</div>' +
          '<div class="conn-info">' +
            '<div class="conn-name">Open Chat</div>' +
            '<div class="conn-role">Talk to everyone!</div>' +
          '</div>';
        
        globalItem.addEventListener('click', function() {
          document.querySelectorAll('.conn-item').forEach(function(el){ el.classList.remove('active'); });
          globalItem.classList.add('active');
          openChat('global', {name: 'Open Chat', role: 'Global community channel'}, '🌍', 'linear-gradient(135deg, #10b981, #34d399)');
        });
        listEl.appendChild(globalItem);

        var validConns = conns.filter(function(c) { return c.status === 'accepted' || c.status === 'pending'; });
        
        if (validConns.length === 0 && false) { // Handled by standard empty state logic if needed
          return;
        }

        validConns.forEach(function(c) {
          var isSender = c.from === currentUser.id;
          var otherId = isSender ? c.to : c.from;
          var match = allUsers.find(function(u) { return u.id === otherId; });
          
          if (!match) return; // Wait, maybe user deleted?

          var item = document.createElement('div');
          item.className = 'conn-item';
          item.id = 'conn-' + c.id;
          
          var initials = match.name.split(' ').map(function(n){return n[0]}).join('').substring(0,2).toUpperCase();
          var bg = typeof avatarStyle !== 'undefined' ? avatarStyle(match.avatarColor || 0) : ' linear-gradient(135deg, #7c3aed, #00d4ff)';

          item.innerHTML = 
            '<div class="conn-avatar" style="background:' + bg + '">' + initials + '</div>' +
            '<div class="conn-info">' +
              '<div class="conn-name">' + match.name + '</div>' +
              '<div class="conn-role">' + (match.role || 'Builder') + '</div>' +
            '</div>';
          
          item.addEventListener('click', function() {
            if (c.status !== 'accepted') {
               alert("Connection is still pending.");
               return;
            }
            document.querySelectorAll('.conn-item').forEach(function(el){ el.classList.remove('active'); });
            item.classList.add('active');
            openChat(c.id, match, initials, bg);
          });
          
          listEl.appendChild(item);
        });
      });
    });
  }

  function openChat(connId, targetUser, initials, bg) {
    if (currentConnId && socket) {
      // Could leave old room if needed, but no built-in leave handler here needed
    }
    currentConnId = connId;
    otherUser = targetUser;

    document.getElementById('no-chat').classList.add('hidden');
    document.getElementById('active-chat').classList.remove('hidden');
    
    document.getElementById('chat-name').textContent = targetUser.name;
    document.getElementById('chat-role').textContent = targetUser.role;
    var avi = document.getElementById('chat-avatar');
    avi.textContent = initials;
    avi.style.background = bg;

    var historyEl = document.getElementById('chat-history');
    historyEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.85rem;">Loading history...</div>';

    if (socket) socket.emit('join_room', currentConnId);

    DevMatchAPI.fetchMessages(currentConnId).then(function(data) {
      historyEl.innerHTML = '';
      var msgs = data.messages || [];
      if (msgs.length === 0) {
        historyEl.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.85rem;padding-top:2rem;">This is the start of your conversation with ' + targetUser.name + '</div>';
      }
      msgs.forEach(renderMessage);
      scrollToBottom();
    });
  }

  function renderMessage(msg) {
    // If it's the first message, remove the empty placeholder
    var historyEl = document.getElementById('chat-history');
    if (historyEl.innerHTML.indexOf("start of your conversation") !== -1) {
      historyEl.innerHTML = '';
    }

    var isMe = msg.sender === currentUser.id;
    var div = document.createElement('div');
    div.className = 'message ' + (isMe ? 'sent' : 'received');
    
    var timeStr = '';
    if (msg.sentAt) {
      var d = new Date(msg.sentAt);
      timeStr = d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
    }

    var senderNameHtml = '';
    if (!isMe && currentConnId === 'global') {
       var senderUser = usersCache.find(function(u){ return u.id === msg.sender; });
       var sName = senderUser ? senderUser.name : "Unknown User";
       senderNameHtml = '<div style="font-size: 0.72rem; font-weight: 700; color: var(--accent-violet); margin-bottom: 0.2rem; margin-left: 0.4rem;">' + sName + '</div>';
    }

    div.innerHTML = 
      senderNameHtml +
      '<div class="msg-bubble">' + msg.text + '</div>' +
      (timeStr ? '<div class="msg-time">' + timeStr + '</div>' : '');
      
    historyEl.appendChild(div);
  }

  function scrollToBottom() {
    var historyEl = document.getElementById('chat-history');
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function loadInbox() {
    DevMatchAPI.fetchTeamRequests().then(function(data) {
      var reqs = data.requests || [];
      var inboxEl = document.getElementById('inbox-list');
      inboxEl.innerHTML = '';
      if (reqs.length === 0) {
        inboxEl.innerHTML = '<div style="font-size:0.75rem; color:var(--text-muted);">No new requests.</div>';
        return;
      }
      
      DevMatchAPI.fetchUsers().then(function(uData) {
         var users = uData.users || [];
         reqs.forEach(function(req) {
            var applicant = users.find(function(u){ return u.id === req.applicantId; });
            var name = applicant ? applicant.name : 'Someone';
            
            var item = document.createElement('div');
            item.style.cssText = "background: var(--bg-base); border: 1px solid var(--border); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 0.5rem;";
            item.innerHTML = 
              '<div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.4rem;">' + name + ' wants to join!</div>' +
              '<div style="display:flex; gap: 0.5rem;">' +
                '<button class="btn btn-primary" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="ChatApp.respondReq(\'' + req.id + '\', \'accepted\')">Accept</button>' +
                '<button class="btn btn-ghost" style="padding:0.2rem 0.5rem; font-size:0.7rem;" onclick="ChatApp.respondReq(\'' + req.id + '\', \'rejected\')">Deny</button>' +
              '</div>';
            inboxEl.appendChild(item);
         });
      });
    });
  }

  function respondReq(reqId, action) {
    DevMatchAPI.respondTeamRequest(reqId, action).then(function() {
      alert("Application " + action);
      loadInbox();
      loadConnections(); // Refresh side channel list to see new group chat if added!
    }).catch(function(e) { alert(e.error || "Failed"); });
  }

  return { init: init, respondReq: respondReq };
})();