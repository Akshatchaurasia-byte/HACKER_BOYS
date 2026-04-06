// DevMatch - Matching Algorithm and UI Builders
function matchScore(userA, userB) {
  var skillsA = new Set(userA.skills || []);
  var skillsB = new Set(userB.skills || []);
  var aLacksFromB = Array.from(skillsB).filter(function(s){return !skillsA.has(s);});
  var bLacksFromA = Array.from(skillsA).filter(function(s){return !skillsB.has(s);});
  var allArr = Array.from(skillsA).concat(Array.from(skillsB));
  var totalUnique = new Set(allArr).size;
  var complementScore = totalUnique > 0 ? ((aLacksFromB.length + bLacksFromA.length) / (totalUnique * 2)) * 100 : 0;
  var intsA = new Set(userA.interests || []);
  var intsB = new Set(userB.interests || []);
  var sharedInts = Array.from(intsA).filter(function(i){return intsB.has(i);}).length;
  var totalInts = new Set(Array.from(intsA).concat(Array.from(intsB))).size;
  var interestScore = totalInts > 0 ? (sharedInts / totalInts) * 100 : 0;
  var expMap = {beginner:0, intermediate:1, advanced:2, expert:3};
  var eA = expMap[userA.experience] != null ? expMap[userA.experience] : 1;
  var eB = expMap[userB.experience] != null ? expMap[userB.experience] : 1;
  var expDiff = Math.abs(eA - eB);
  var expScore = expDiff === 0 ? 100 : expDiff === 1 ? 75 : expDiff === 2 ? 40 : 15;
  var seekingBonus = 0;
  if (userA.seekingSkills && userA.seekingSkills.length > 0) {
    var seeking = new Set(userA.seekingSkills);
    var mc = Array.from(skillsB).filter(function(s){return seeking.has(s);}).length;
    seekingBonus = seeking.size > 0 ? (mc / seeking.size) * 15 : 0;
  }
  var total = (complementScore * 0.40) + (interestScore * 0.35) + (expScore * 0.25) + seekingBonus;
  return {total: Math.min(100, Math.round(total)), complementScore: Math.round(complementScore), interestScore: Math.round(interestScore), expScore: Math.round(expScore)};
}

function getRankedMatches(currentUser, allUsers) {
  return allUsers.filter(function(u){return u.id !== currentUser.id;})
    .map(function(u){return {user:u, score:matchScore(currentUser,u)};})
    .sort(function(a,b){return b.score.total - a.score.total;});
}

function getMatchColor(score) {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#00d4ff";
  if (score >= 40) return "#f59e0b";
  return "#9b94c4";
}

function buildUserCard(user, matchData) {
  var initials = getInitials(user.name);
  var color = avatarStyle(user.avatarColor != null ? user.avatarColor : 0);
  var expCls = "exp-" + (user.experience || "intermediate");
  var expTxt = expLabel(user.experience || "intermediate");
  var skills = user.skills || [];
  var skillChips = skills.slice(0,4).map(function(s){return '<span class="skill-chip small">'+getSkillLabel(s)+'</span>';}).join("");
  var moreSkills = skills.length > 4 ? '<span class="skill-chip small">+'+(skills.length-4)+'</span>' : "";
  var interestTxt = (user.interests||[]).slice(0,3).map(getInterestLabel).join(", ");
  var availIcon = user.availability==="full-time"?"🟢":user.availability==="weekends"?"🟡":"🔵";
  var matchStr = matchData ? '<span class="card-match">'+matchData.total+'% match</span>' : "";
  var av = (user.availability||"flexible").replace("-"," ");
  return '<div class="builder-card" data-uid="'+user.id+'" tabindex="0" role="button">'+
    '<div class="card-top">'+
    '<div class="card-avatar" style="background:'+color+'">'+initials+'</div>'+
    '<div class="card-info">'+
    '<div class="card-name">'+user.name+'</div>'+
    '<div class="card-role">'+(user.role||"")+'</div>'+
    '<div class="card-exp '+expCls+'">'+expTxt+'</div></div></div>'+
    (user.bio?'<div class="card-bio">'+user.bio+'</div>':"") +
    '<div class="card-skills">'+skillChips+moreSkills+'</div>'+
    (interestTxt?'<div class="card-interests">🎯 '+interestTxt+'</div>':"") +
    '<div class="card-footer"><div class="card-avail"><span class="avail-dot"></span>'+availIcon+' '+av+'</div>'+
    '<div class="card-actions">'+matchStr+
    '<button class="btn btn-primary btn-sm connect-btn" data-uid="'+user.id+'">Connect</button></div></div></div>';
}

function buildUserModal(user, matchData) {
  var initials = getInitials(user.name);
  var color = avatarStyle(user.avatarColor!=null?user.avatarColor:0);
  var expTxt = expLabel(user.experience||"intermediate");
  var skillChips = (user.skills||[]).map(function(s){return '<span class="skill-chip">'+getSkillLabel(s)+'</span>';}).join("");
  var intChips = (user.interests||[]).map(function(i){return '<span class="skill-chip interest-chip">'+getInterestLabel(i)+'</span>';}).join("");
  var ghLink = user.github ? '<a href="https://github.com/'+user.github+'" target="_blank" rel="noopener" class="modal-link-btn">GitHub</a>' : "";
  var liLink = user.linkedin ? '<a href="https://'+user.linkedin+'" target="_blank" rel="noopener" class="modal-link-btn">LinkedIn</a>' : "";
  var matchSection = matchData ? ('<div class="modal-section"><div class="modal-section-label">Match Score — '+matchData.total+'% Overall</div>'+
    '<div class="modal-score-bar"><div class="modal-score-fill" style="width:'+matchData.total+'%"></div></div>'+
    '<div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-top:0.4rem;">'+
    '<span>Skills: '+matchData.complementScore+'%</span><span>Interests: '+matchData.interestScore+'%</span><span>Exp: '+matchData.expScore+'%</span></div></div>') : "";
  var mScore = matchData ? '<span class="skill-chip" style="color:#10b981;background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.3)">'+matchData.total+'% match</span>' : "";
  return '<div class="modal-avatar-lg" style="background:'+color+'">'+initials+'</div>'+
    '<div class="modal-name">'+user.name+'</div>'+
    '<div class="modal-role">'+(user.role||"")+'</div>'+
    '<div class="modal-meta"><span class="skill-chip cyan-chip">'+expTxt+'</span>'+
    '<span class="skill-chip">'+(user.availability||"flexible").replace("-"," ")+'</span>'+mScore+'</div>'+
    (user.bio?'<div class="modal-bio">'+user.bio+'</div>':"") +
    matchSection+
    '<div class="modal-section"><div class="modal-section-label">Skills</div><div class="modal-chips">'+skillChips+'</div></div>'+
    '<div class="modal-section"><div class="modal-section-label">Interests</div><div class="modal-chips">'+intChips+'</div></div>'+
    ((ghLink||liLink)?'<div class="modal-links">'+ghLink+liLink+'</div>':"") +
    '<button class="btn btn-primary btn-lg modal-connect-btn" style="width:100%;justify-content:center" data-uid="'+user.id+'">Request to Connect</button>';
}

function showToast(msg, duration) {
  duration = duration || 3000;
  var toast = document.getElementById('global-toast');
  if (!toast) { toast=document.createElement('div'); toast.id='global-toast'; toast.className='toast'; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(function(){ toast.classList.remove('show'); }, duration);
}

function openUserModal(user, matchData, overlayId, contentId) {
  var overlay = document.getElementById(overlayId||'modal-overlay');
  var content = document.getElementById(contentId||'modal-content');
  if (!overlay || !content) return;
  content.innerHTML = buildUserModal(user, matchData);
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  content.querySelectorAll('.modal-connect-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      overlay.classList.add('hidden'); document.body.style.overflow = '';
      showConnectModal(user, getCurrentUser());
    });
  });
  overlay.addEventListener('click', function(e){ if(e.target===overlay){ overlay.classList.add('hidden'); document.body.style.overflow=''; } });
}

function showConnectModal(user, cu) {
  // Build a connect modal with an email input so the request can be emailed to the target user
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  var preEmail = (user && user.email) ? user.email : '';
  overlay.innerHTML = '<div class="modal connect-modal">'+
    '<button class="modal-close" id="cm-close">&#x2715;</button>'+
    '<h2>Request to connect — '+(user.name||'')+'</h2>'+
    '<p>Send a request to <strong>'+ (user.name || '') +'</strong> so they can approve or deny via email.</p>'+
    '<div style="margin-top:0.5rem">'+
      '<label style="display:block;font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem">Recipient email</label>'+
      '<input id="cm-email" type="email" value="'+preEmail+'" placeholder="recipient@example.com" style="width:100%;padding:0.6rem;border:1px solid var(--border);border-radius:6px" />'+
    '</div>'+
    '<div style="margin-top:0.75rem">'+
      '<label style="display:block;font-size:0.85rem;color:var(--text-muted);margin-bottom:0.25rem">Optional message</label>'+
      '<textarea id="cm-msg" placeholder="Hi, I\'d like to collaborate..." style="width:100%;min-height:80px;padding:0.6rem;border:1px solid var(--border);border-radius:6px"></textarea>'+
    '</div>'+
    '<div style="display:flex;gap:0.5rem;margin-top:1rem">'+
      '<button class="btn btn-primary" id="cm-send">Send Request</button>'+
      '<button class="btn btn-ghost" id="cm-cancel">Cancel</button>'+
    '</div>'+
    '</div>';
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  function closeM(){ try { document.body.removeChild(overlay); } catch(e){} document.body.style.overflow=''; }
  overlay.querySelector('#cm-close').addEventListener('click', closeM);
  overlay.querySelector('#cm-cancel').addEventListener('click', closeM);
  overlay.addEventListener('click', function(e){ if(e.target===overlay) closeM(); });

  var sendBtn = overlay.querySelector('#cm-send');
  sendBtn.addEventListener('click', function() {
    var email = overlay.querySelector('#cm-email').value.trim();
    var msg = overlay.querySelector('#cm-msg').value.trim();
    if (!email) { showToast('Please enter a recipient email'); return; }
    sendBtn.disabled = true; sendBtn.textContent = 'Sending...';
    var payload = { email: email, data: { requester: (cu? { id: cu.id, name: cu.name, email: cu.email } : null), targetId: user.id, message: msg } };
    fetch('/api/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(function(res){ return res.json(); }).then(function(json){
      sendBtn.disabled = false; sendBtn.textContent = 'Send Request';
      if (json && json.request) {
        closeM();
        // Show quick success overlay
        var s = document.createElement('div'); s.className = 'modal-overlay';
        s.innerHTML = '<div class="modal connect-modal">'+
          '<button class="modal-close" id="cm2-close">&#x2715;</button>'+
          '<div class="connect-success-icon">&#x1F389;</div>'+
          '<h2>Request Sent!</h2>'+
          '<p>Your request has been emailed to <strong>'+email+'</strong>. They can accept or reject via the email link.</p>'+
          '<button class="btn btn-primary btn-lg" style="width:100%;justify-content:center;margin-top:1rem" id="cm2-done">Done ✓</button>'+
          '</div>';
        document.body.appendChild(s); document.body.style.overflow='hidden';
        function closeS(){ try{ document.body.removeChild(s);}catch(e){} document.body.style.overflow=''; }
        s.querySelector('#cm2-close').addEventListener('click', closeS);
        s.querySelector('#cm2-done').addEventListener('click', closeS);

        // Add a local pending connection for immediate UX (optional)
        try {
          var db = getDB();
          if (cu && db) {
            if (!db.connections) db.connections = [];
            var ex = db.connections.find(function(c){return (c.from===cu.id&&c.to===user.id)||(c.from===user.id&&c.to===cu.id);});
            if (!ex) { db.connections.push({from:cu.id, to:user.id, status:'pending', at:Date.now()}); saveDB(db); }
          }
        } catch (e) { /* ignore */ }
      } else {
        showToast((json && json.error) ? json.error : 'Failed to send request');
      }
    }).catch(function(err){ sendBtn.disabled = false; sendBtn.textContent = 'Send Request'; showToast('Network error'); console.error(err); });
  });
}