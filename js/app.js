// DevMatch - Main Explore Page Logic
(function() {
  var db = initDB();
  var currentFilter = 'all';
  var currentExp = 'all';
  var allUsers = [];

  function init() {
    allUsers = db.users;
    updateNavCTA();
    updateStats();
    renderCards(allUsers);
    setupFilters();
    setupSearch();
    setupModal();
    animateStats();
  }

  function updateNavCTA() {
    var cu = getCurrentUser();
    var ctaBtn = document.getElementById('nav-cta');
    var avatarEl = document.getElementById('nav-user-avatar');
    var loginBtn = document.getElementById('nav-login-btn');
    var signupBtn = document.getElementById('nav-signup-btn');
    var logoutBtn = document.getElementById('nav-logout-btn');
    if (cu && ctaBtn && avatarEl) {
      ctaBtn.textContent = 'Edit Profile';
      ctaBtn.classList.remove('hidden');
      avatarEl.textContent = getInitials(cu.name);
      avatarEl.style.background = avatarStyle(cu.avatarColor || 0);
      avatarEl.classList.remove('hidden');
      if (loginBtn) loginBtn.classList.add('hidden');
      if (signupBtn) signupBtn.classList.add('hidden');
      if (logoutBtn) { logoutBtn.classList.remove('hidden'); logoutBtn.addEventListener('click', function(){ if (typeof DevMatchAPI !== 'undefined') DevMatchAPI.logout(); else { localStorage.clear(); window.location.href='login.html'; } }); }
    }
  }

  function updateStats() {
    var uEl = document.getElementById('stat-users');
    var mEl = document.getElementById('stat-matches');
    if (uEl) uEl.textContent = db.users.length;
    if (mEl) mEl.textContent = db.connections ? db.connections.length : 0;
  }

  function animateStats() {
    var statNums = document.querySelectorAll('.stat-num');
    statNums.forEach(function(el) {
      var target = parseInt(el.textContent);
      if (isNaN(target) || target === 0) return;
      var start = 0;
      var duration = 1200;
      var startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        el.textContent = Math.round(progress * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function getFilteredUsers() {
    var cu = getCurrentUser();
    return allUsers.filter(function(u) {
      if (cu && u.id === cu.id) return false;
      if (currentExp !== 'all' && u.experience !== currentExp) return false;
      if (currentFilter === 'all') return true;
      return (u.interests || []).some(function(i){ return getInterestLabel(i).toLowerCase().indexOf(currentFilter.toLowerCase()) >= 0 || i.toLowerCase() === currentFilter.toLowerCase(); });
    });
  }

  function renderCards(users) {
    var grid = document.getElementById('cards-grid');
    var empty = document.getElementById('empty-state');
    var count = document.getElementById('results-count');
    if (!grid) return;
    var cu = getCurrentUser();
    var filtered = getFilteredUsers();
    if (count) count.textContent = filtered.length + ' builder' + (filtered.length !== 1 ? 's' : '');
    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');
    var html = '';
    filtered.forEach(function(u) {
      var matchData = cu ? matchScore(cu, u) : null;
      html += buildUserCard(u, matchData);
    });
    grid.innerHTML = html;
    grid.querySelectorAll('.builder-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.classList.contains('connect-btn')) return;
        var uid = card.dataset.uid;
        var user = allUsers.find(function(u){ return u.id === uid; });
        if (!user) return;
        var cu2 = getCurrentUser();
        var md = cu2 ? matchScore(cu2, user) : null;
        openUserModal(user, md, 'modal-overlay', 'modal-content');
      });
      var connectBtn = card.querySelector('.connect-btn');
      if (connectBtn) connectBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var uid = connectBtn.dataset.uid;
        var user = allUsers.find(function(u){ return u.id === uid; });
        if (user) showConnectModal(user, getCurrentUser());
      });
    });
  }

  function setupFilters() {
    var tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderCards(allUsers);
      });
    });
    var expFilter = document.getElementById('exp-filter');
    if (expFilter) expFilter.addEventListener('change', function() {
      currentExp = expFilter.value;
      renderCards(allUsers);
    });
  }

  function setupSearch() {
    var toggle = document.getElementById('search-toggle');
    var overlay = document.getElementById('search-overlay');
    var input = document.getElementById('global-search');
    var results = document.getElementById('search-results');
    var closeBtn = document.getElementById('close-search');
    if (!toggle || !overlay || !input) return;
    toggle.addEventListener('click', function(){ overlay.classList.toggle('hidden'); if(!overlay.classList.contains('hidden')) input.focus(); });
    if (closeBtn) closeBtn.addEventListener('click', function(){ overlay.classList.add('hidden'); });
    input.addEventListener('input', function() {
      var q = input.value.trim().toLowerCase();
      if (!q || !results) { if(results) results.innerHTML=''; return; }
      var matches = allUsers.filter(function(u) {
        return u.name.toLowerCase().indexOf(q) >= 0 ||
          (u.skills||[]).some(function(s){ return getSkillLabel(s).toLowerCase().indexOf(q) >= 0; }) ||
          (u.interests||[]).some(function(i){ return getInterestLabel(i).toLowerCase().indexOf(q) >= 0; }) ||
          (u.role||'').toLowerCase().indexOf(q) >= 0;
      }).slice(0, 5);
      results.innerHTML = matches.map(function(u){
        return '<div class="search-result-item" data-uid="'+u.id+'">' +
          '<div class="preview-avatar grad-violet" style="background:'+avatarStyle(u.avatarColor||0)+';width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;color:white;flex-shrink:0;">'+getInitials(u.name)+'</div>'+
          '<div><div style="font-weight:600">'+u.name+'</div><div style="font-size:0.78rem;color:var(--text-secondary)">'+u.role+'</div></div>'+
          '<div style="margin-left:auto;font-size:0.75rem;color:var(--text-muted)">'+(u.skills||[]).slice(0,2).map(getSkillLabel).join(', ')+'</div>' +
          '</div>';
      }).join('');
      results.querySelectorAll('.search-result-item').forEach(function(item){
        item.addEventListener('click', function(){
          var user = allUsers.find(function(u){ return u.id === item.dataset.uid; });
          if (user) { overlay.classList.add('hidden'); openUserModal(user, getCurrentUser()?matchScore(getCurrentUser(),user):null,'modal-overlay','modal-content'); }
        });
      });
    });
  }

  function setupModal() {
    var closeBtn = document.getElementById('modal-close');
    var overlay = document.getElementById('modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', function(){ if(overlay) overlay.classList.add('hidden'); document.body.style.overflow=''; });
    if (overlay) overlay.addEventListener('click', function(e){ if(e.target===overlay){ overlay.classList.add('hidden'); document.body.style.overflow=''; } });
  }

  document.addEventListener('DOMContentLoaded', init);
})();