// DevMatch - People / Browse All Page
(function() {
  var db, cu, allUsers;
  var searchQ = '';
  var filterSkill = 'all';
  var filterExp = 'all';
  var filterDomain = 'all';
  var filterAvail = 'all';
  var sortMode = 'recent';

  function init() {
    db = initDB();
    cu = getCurrentUser();
    allUsers = db.users;
    populateSkillFilter();
    setupFilters();
    setupModal();
    render();
  }

  function populateSkillFilter() {
    var sel = document.getElementById('people-skill-filter');
    if (!sel) return;
    var allSkills = new Set();
    allUsers.forEach(function(u){ (u.skills||[]).forEach(function(s){ allSkills.add(s); }); });
    Array.from(allSkills).sort().forEach(function(sid) {
      var opt = document.createElement('option');
      opt.value = sid; opt.textContent = getSkillLabel(sid);
      sel.appendChild(opt);
    });
  }

  function getFiltered() {
    var list = allUsers;
    if (cu) list = list.filter(function(u){ return u.id !== cu.id; });
    if (searchQ) list = list.filter(function(u){
      var q = searchQ;
      return u.name.toLowerCase().indexOf(q) >= 0 ||
        (u.role||'').toLowerCase().indexOf(q) >= 0 ||
        (u.skills||[]).some(function(s){ return getSkillLabel(s).toLowerCase().indexOf(q) >= 0; }) ||
        (u.interests||[]).some(function(i){ return getInterestLabel(i).toLowerCase().indexOf(q) >= 0; });
    });
    if (filterSkill !== 'all') list = list.filter(function(u){ return (u.skills||[]).indexOf(filterSkill) >= 0; });
    if (filterExp !== 'all') list = list.filter(function(u){ return u.experience === filterExp; });
    if (filterDomain !== 'all') list = list.filter(function(u){
      return (u.interests||[]).some(function(i){ return getInterestLabel(i).toLowerCase().indexOf(filterDomain.toLowerCase()) >= 0; });
    });
    if (filterAvail !== 'all') list = list.filter(function(u){ return u.availability === filterAvail; });
    var expOrder = {beginner:0,intermediate:1,advanced:2,expert:3};
    if (sortMode === 'name') list = list.slice().sort(function(a,b){ return a.name.localeCompare(b.name); });
    else if (sortMode === 'recent') list = list.slice().sort(function(a,b){ return (b.joinedAt||0) - (a.joinedAt||0); });
    else if (sortMode === 'exp-asc') list = list.slice().sort(function(a,b){ return (expOrder[a.experience]||0)-(expOrder[b.experience]||0); });
    else if (sortMode === 'exp-desc') list = list.slice().sort(function(a,b){ return (expOrder[b.experience]||0)-(expOrder[a.experience]||0); });
    return list;
  }

  function render() {
    var grid = document.getElementById('people-grid');
    var empty = document.getElementById('people-empty');
    var count = document.getElementById('people-count');
    if (!grid) return;
    var list = getFiltered();
    if (count) count.textContent = list.length + ' builder' + (list.length !== 1 ? 's' : '');
    if (list.length === 0) { grid.innerHTML=''; if(empty) empty.classList.remove('hidden'); return; }
    if (empty) empty.classList.add('hidden');
    grid.innerHTML = list.map(function(u) {
      var md = cu ? matchScore(cu, u) : null;
      return buildUserCard(u, md);
    }).join('');
    grid.querySelectorAll('.builder-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.classList.contains('connect-btn')) return;
        var u = allUsers.find(function(x){ return x.id === card.dataset.uid; });
        if (u) openUserModal(u, cu?matchScore(cu,u):null, 'modal-overlay', 'modal-content');
      });
      var cb = card.querySelector('.connect-btn');
      if (cb) cb.addEventListener('click', function(e) {
        e.stopPropagation();
        var u = allUsers.find(function(x){ return x.id === cb.dataset.uid; });
        if (u) showConnectModal(u, cu);
      });
    });
  }

  function setupFilters() {
    var search = document.getElementById('people-search');
    if (search) search.addEventListener('input', function(){ searchQ = search.value.trim().toLowerCase(); render(); });
    var skillF = document.getElementById('people-skill-filter');
    if (skillF) skillF.addEventListener('change', function(){ filterSkill = skillF.value; render(); });
    var expF = document.getElementById('people-exp-filter');
    if (expF) expF.addEventListener('change', function(){ filterExp = expF.value; render(); });
    var domF = document.getElementById('people-domain-filter');
    if (domF) domF.addEventListener('change', function(){ filterDomain = domF.value; render(); });
    var avF = document.getElementById('people-avail-filter');
    if (avF) avF.addEventListener('change', function(){ filterAvail = avF.value; render(); });
    var sortF = document.getElementById('people-sort');
    if (sortF) sortF.addEventListener('change', function(){ sortMode = sortF.value; render(); });
    var resetBtns = document.querySelectorAll('#people-reset-filters, #people-reset-btn');
    resetBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        searchQ=''; filterSkill='all'; filterExp='all'; filterDomain='all'; filterAvail='all'; sortMode='recent';
        if(search) search.value='';
        if(skillF) skillF.value='all';
        if(expF) expF.value='all';
        if(domF) domF.value='all';
        if(avF) avF.value='all';
        if(sortF) sortF.value='recent';
        render();
      });
    });
  }

  function setupModal() {
    var overlay = document.getElementById('modal-overlay');
    var closeBtn = document.getElementById('modal-close');
    if (closeBtn) closeBtn.addEventListener('click', function(){ if(overlay) overlay.classList.add('hidden'); document.body.style.overflow=''; });
    if (overlay) overlay.addEventListener('click', function(e){ if(e.target===overlay){ overlay.classList.add('hidden'); document.body.style.overflow=''; } });
  }

  document.addEventListener('DOMContentLoaded', init);
})();