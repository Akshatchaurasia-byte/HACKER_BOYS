// DevMatch - Matches Page
(function() {
  var db, cu, matches;
  var matchFilter = 'all';
  var swipeIdx = 0;

  function init() {
    db = initDB();
    cu = getCurrentUser();
    if (!cu) {
      document.getElementById('no-profile-state').classList.remove('hidden');
      return;
    }
    document.getElementById('match-content').classList.remove('hidden');
    matches = getRankedMatches(cu, db.users);
    renderHeader();
    fetchApprovalRequests();
    renderSwipeDeck();
    renderMatchGrid(matches);
    setupFilters();
    setupRefresh();
  }

  function fetchApprovalRequests() {
    var panel = document.getElementById('approval-requests-panel');
    var list = document.getElementById('approval-requests-list');
    if (!panel || !list || !cu || !cu.email) return;
    fetch('/api/requests/pending?email=' + encodeURIComponent(cu.email)).then(function(res){ return res.json(); }).then(function(json){
      var reqs = (json && json.requests) ? json.requests : [];
      if (reqs.length === 0) { panel.style.display = 'none'; list.innerHTML = ''; return; }
      panel.style.display = '';
      list.innerHTML = reqs.map(function(r){
        var who = r.data && r.data.requester ? (r.data.requester.name || r.data.requester.email) : (r.data && r.data.message ? r.data.message : 'Someone');
        return '<div class="request-row" data-token="'+r.token+'" style="border:1px solid var(--border);padding:0.6rem;border-radius:8px;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center">'+
          '<div style="flex:1"><div style="font-weight:600">'+who+'</div><div style="font-size:0.85rem;color:var(--text-muted)">'+(r.data && r.data.message ? r.data.message : '')+'</div></div>'+
          '<div style="display:flex;gap:0.5rem;margin-left:0.75rem">'+
          '<button class="btn btn-primary btn-sm req-accept" data-token="'+r.token+'">Accept</button>'+
          '<button class="btn btn-ghost btn-sm req-reject" data-token="'+r.token+'">Reject</button>'+
          '</div></div>';
      }).join('');
      // wire buttons
      list.querySelectorAll('.req-accept').forEach(function(b){ b.addEventListener('click', function(){ respondRequest(b.dataset.token, 'approve'); }); });
      list.querySelectorAll('.req-reject').forEach(function(b){ b.addEventListener('click', function(){ respondRequest(b.dataset.token, 'reject'); }); });
    }).catch(function(err){ console.error(err); });
  }

  function respondRequest(token, action) {
    if (!token) return;
    var endpoint = action === 'approve' ? '/api/approve?token=' + encodeURIComponent(token) : '/api/reject?token=' + encodeURIComponent(token);
    fetch(endpoint).then(function(res){ return res.text(); }).then(function(text){
      showToast(text || (action === 'approve' ? 'Approved' : 'Rejected'));
      fetchApprovalRequests();
    }).catch(function(err){ showToast('Network error'); console.error(err); });
  }

  function renderHeader() {
    var info = document.getElementById('matches-user-info');
    if (!info) return;
    var color = avatarStyle(cu.avatarColor != null ? cu.avatarColor : 0);
    info.innerHTML = '<div class="matches-user-avatar" style="background:'+color+'">'+getInitials(cu.name)+'</div>'+
      '<div><div class="matches-user-name">'+cu.name+'</div><div class="matches-user-role">'+cu.role+'</div></div>';
    var mc = document.getElementById('match-count');
    if (mc) mc.textContent = matches.length + ' matches found';
  }

  function renderSwipeDeck() {
    var deck = document.getElementById('swipe-deck');
    if (!deck || matches.length === 0) { var ss = document.getElementById('swipe-section'); if(ss) ss.style.display='none'; return; }
    swipeIdx = 0;
    renderDeckCards();
    var skipBtn = document.getElementById('swipe-skip');
    var connectBtn = document.getElementById('swipe-connect');
    if (skipBtn) skipBtn.addEventListener('click', function(){ swipeCard('left'); });
    if (connectBtn) connectBtn.addEventListener('click', function(){ swipeCard('right'); });
  }

  function renderDeckCards() {
    var deck = document.getElementById('swipe-deck');
    if (!deck) return;
    deck.innerHTML = '';
    var visible = matches.slice(swipeIdx, swipeIdx + 3);
    visible.forEach(function(item, i) {
      var u = item.user;
      var card = document.createElement('div');
      card.className = 'swipe-card ' + (i===0?'swipe-card-front':i===1?'swipe-card-mid':'swipe-card-back');
      card.dataset.uid = u.id;
      var color = avatarStyle(u.avatarColor != null ? u.avatarColor : 0);
      card.innerHTML = '<div class="swipe-avatar" style="background:'+color+'">'+getInitials(u.name)+'</div>'+
        '<div class="swipe-info">'+
        '<div class="swipe-name">'+u.name+'</div>'+
        '<div class="swipe-role">'+u.role+'</div>'+
        '<div class="swipe-match-pct">'+item.score.total+'%</div>'+
        '<div class="swipe-match-label">Compatibility</div>'+
        '<div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.3rem;">'+
        (u.skills||[]).slice(0,3).map(function(s){return '<span class="skill-chip small">'+getSkillLabel(s)+'</span>';}).join('')+
        '</div></div>';
      if (i === 0) {
        card.style.zIndex = 2;
        setupCardSwipe(card);
      }
      deck.appendChild(card);
    });
    if (swipeIdx >= matches.length) {
      deck.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);flex-direction:column;gap:0.5rem"><div style="font-size:2rem">✅</div><div>All caught up!</div></div>';
    }
  }

  function setupCardSwipe(card) {
    var startX = 0;
    var isDragging = false;
    card.addEventListener('mousedown', function(e){ startX = e.clientX; isDragging = true; });
    card.addEventListener('mousemove', function(e){
      if (!isDragging) return;
      var dx = e.clientX - startX;
      card.style.transform = 'translateX('+dx+'px) rotate('+(dx*0.05)+'deg)';
    });
    card.addEventListener('mouseup', function(e){
      isDragging = false;
      var dx = e.clientX - startX;
      card.style.transform = '';
      if (Math.abs(dx) > 80) swipeCard(dx > 0 ? 'right' : 'left');
    });
    card.addEventListener('mouseleave', function(){ isDragging = false; card.style.transform = ''; });
  }

  function swipeCard(dir) {
    var deck = document.getElementById('swipe-deck');
    if (!deck) return;
    var front = deck.querySelector('.swipe-card-front');
    if (!front) return;
    var m = matches[swipeIdx];
    front.classList.add(dir === 'right' ? 'swiping-right' : 'swiping-left');
    setTimeout(function() {
      if (dir === 'right' && m) { showConnectModal(m.user, cu); }
      swipeIdx++;
      renderDeckCards();
    }, 400);
  }

  function renderMatchGrid(items) {
    var grid = document.getElementById('matches-grid');
    var empty = document.getElementById('match-empty');
    var count = document.getElementById('match-count');
    if (!grid) return;
    var filtered = items;
    if (matchFilter === '80') filtered = items.filter(function(x){ return x.score.total >= 80; });
    else if (matchFilter === '60') filtered = items.filter(function(x){ return x.score.total >= 60 && x.score.total < 80; });
    else if (matchFilter === 'complementary') filtered = items.filter(function(x){ return x.score.complementScore >= 50; });
    if (count) count.textContent = filtered.length + ' matches found';
    if (filtered.length === 0) { grid.innerHTML=''; if(empty) empty.classList.remove('hidden'); return; }
    if (empty) empty.classList.add('hidden');
    grid.innerHTML = filtered.map(function(item) {
      var u = item.user;
      var s = item.score;
      var c = getMatchColor(s.total);
      var circ = 2 * Math.PI * 22;
      var offset = circ - (s.total / 100) * circ;
      var color = avatarStyle(u.avatarColor != null ? u.avatarColor : 0);
      return '<div class="match-card" data-uid="'+u.id+'">'+
        '<div class="match-score-ring">'+
        '<svg class="match-score-svg" viewBox="0 0 52 52">'+
        '<circle class="match-score-bg" cx="26" cy="26" r="22"/>'+
        '<circle class="match-score-arc" cx="26" cy="26" r="22" stroke="'+c+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+offset+'"/>'+
        '</svg><div class="match-score-pct" style="color:'+c+'">'+s.total+'%</div></div>'+
        '<div class="card-top" style="padding-right:4rem">'+
        '<div class="card-avatar" style="background:'+color+'">'+getInitials(u.name)+'</div>'+
        '<div class="card-info"><div class="card-name">'+u.name+'</div><div class="card-role">'+(u.role||'')+'</div>'+
        '<div class="card-exp exp-'+(u.experience||'intermediate')+'">'+expLabel(u.experience||'intermediate')+'</div></div></div>'+
        (u.bio?'<div class="card-bio" style="-webkit-line-clamp:2;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem">'+u.bio+'</div>':'')+
        '<div class="card-skills">'+(u.skills||[]).slice(0,4).map(function(sk){return '<span class="skill-chip small">'+getSkillLabel(sk)+'</span>';}).join('')+'</div>'+
        '<div class="match-breakdown">'+
        '<div class="breakdown-row"><span>Complementary Skills</span><div class="breakdown-bar"><div class="breakdown-fill fill-skills" style="width:'+s.complementScore+'%"></div></div></div>'+
        '<div class="breakdown-row"><span>Shared Interests</span><div class="breakdown-bar"><div class="breakdown-fill fill-interests" style="width:'+s.interestScore+'%"></div></div></div>'+
        '<div class="breakdown-row"><span>Exp. Compatibility</span><div class="breakdown-bar"><div class="breakdown-fill fill-exp" style="width:'+s.expScore+'%"></div></div></div>'+
        '</div>'+
        '<div class="card-footer" style="margin-top:0.75rem">'+
        '<div class="card-avail"><span class="avail-dot"></span>'+(u.availability||'flexible').replace('-',' ')+'</div>'+
        '<button class="btn btn-primary btn-sm connect-btn" data-uid="'+u.id+'">Connect</button></div></div>';
    }).join('');
    grid.querySelectorAll('.match-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.classList.contains('connect-btn')) return;
        var uid = card.dataset.uid;
        var item = matches.find(function(m){ return m.user.id === uid; });
        if (item) openUserModal(item.user, item.score, 'modal-overlay', 'modal-content');
      });
      var btn = card.querySelector('.connect-btn');
      if (btn) btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var item = matches.find(function(m){ return m.user.id === btn.dataset.uid; });
        if (item) showConnectModal(item.user, cu);
      });
    });
    setupConnectModal();
  }

  function setupConnectModal() {
    var overlay = document.getElementById('modal-overlay');
    var closeBtn = document.getElementById('modal-close');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'modal-overlay hidden';
      overlay.id = 'modal-overlay';
      overlay.innerHTML = '<div class="modal"><button class="modal-close" id="modal-close">&#x2715;</button><div id="modal-content"></div></div>';
      document.body.appendChild(overlay);
    }
    var closeB = document.getElementById('modal-close');
    if (closeB) closeB.addEventListener('click', function(){ overlay.classList.add('hidden'); document.body.style.overflow=''; });
    overlay.addEventListener('click', function(e){ if(e.target===overlay){ overlay.classList.add('hidden'); document.body.style.overflow=''; } });
  }

  function setupFilters() {
    var tabs = document.querySelectorAll('[data-match-filter]');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        matchFilter = tab.dataset.matchFilter;
        renderMatchGrid(matches);
      });
    });
  }

  function setupRefresh() {
    var btn = document.getElementById('refresh-matches');
    if (!btn) return;
    btn.addEventListener('click', function() {
      db = initDB();
      cu = getCurrentUser();
      if (!cu) return;
      matches = getRankedMatches(cu, db.users);
      renderMatchGrid(matches);
      showToast('Matches refreshed!');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();