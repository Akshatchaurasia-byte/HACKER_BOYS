// DevMatch - Profile Creation Page
(function() {
  var formData = { name:'', role:'', bio:'', experience:'', availability:'full-time', github:'', linkedin:'', skills:[], interests:[], seekingSkills:[] };
  var currentStep = 1;

  function init() {
    populateSkillsGrid('skills-grid', 'skills');
    populateSkillsGrid('seeking-grid', 'seekingSkills');
    populateInterestsGrid();
    setupExpButtons();
    setupStepNav();
    setupCustomSkill();
    prefillFromExisting();
  }

  function prefillFromExisting() {
    var cu = getCurrentUser();
    if (!cu) return;
    formData = Object.assign({}, cu);
    document.getElementById('inp-name').value = cu.name || '';
    document.getElementById('inp-title').value = cu.role || '';
    document.getElementById('inp-bio').value = cu.bio || '';
    document.getElementById('inp-github').value = cu.github || '';
    document.getElementById('inp-linkedin').value = cu.linkedin || '';
    var availSel = document.getElementById('inp-avail');
    if (availSel) availSel.value = cu.availability || 'full-time';
    if (cu.experience) {
      var btn = document.querySelector('.exp-btn[data-exp="'+cu.experience+'"]');
      if (btn) { document.querySelectorAll('.exp-btn').forEach(function(b){b.classList.remove('active');}); btn.classList.add('active'); }
    }
    updateSkillsUI('skills-grid', 'skills');
    updateSkillsUI('seeking-grid', 'seekingSkills');
    updateSelectedChips();
    if (cu.interests) {
      cu.interests.forEach(function(id){
        var el = document.querySelector('.interest-option[data-int="'+id+'"]');
        if (el) el.classList.add('selected');
      });
    }
  }

  function populateSkillsGrid(gridId, field) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = SKILLS_CATALOG.map(function(skill) {
      var sel = (formData[field]||[]).indexOf(skill.id) >= 0 ? ' selected' : '';
      return '<span class="skill-option'+sel+'" data-skill="'+skill.id+'" data-field="'+field+'">'+skill.label+'</span>';
    }).join('');
    grid.addEventListener('click', function(e) {
      var opt = e.target.closest('.skill-option');
      if (!opt) return;
      var sid = opt.dataset.skill;
      var f = opt.dataset.field || field;
      var arr = formData[f] || [];
      var idx = arr.indexOf(sid);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(sid);
      formData[f] = arr;
      opt.classList.toggle('selected', idx < 0);
      if (f === 'skills') updateSelectedChips();
    });
  }

  function updateSkillsUI(gridId, field) {
    var chips = document.querySelectorAll('#'+gridId+' .skill-option');
    chips.forEach(function(chip) {
      chip.classList.toggle('selected', (formData[field]||[]).indexOf(chip.dataset.skill) >= 0);
    });
  }

  function populateInterestsGrid() {
    var grid = document.getElementById('interests-grid');
    if (!grid) return;
    grid.innerHTML = INTERESTS_CATALOG.map(function(int) {
      var sel = (formData.interests||[]).indexOf(int.id) >= 0 ? ' selected' : '';
      return '<div class="interest-option'+sel+'" data-int="'+int.id+'">'+
        '<span class="interest-emoji">'+int.emoji+'</span>'+
        '<span class="interest-label">'+int.label+'</span></div>';
    }).join('');
    grid.addEventListener('click', function(e) {
      var opt = e.target.closest('.interest-option');
      if (!opt) return;
      var iid = opt.dataset.int;
      var arr = formData.interests || [];
      var idx = arr.indexOf(iid);
      if (idx >= 0) arr.splice(idx, 1); else arr.push(iid);
      formData.interests = arr;
      opt.classList.toggle('selected', idx < 0);
    });
  }

  function updateSelectedChips() {
    var container = document.getElementById('selected-chips');
    if (!container) return;
    if (!formData.skills || formData.skills.length === 0) { container.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem">None selected yet</span>'; return; }
    container.innerHTML = formData.skills.map(function(sid) {
      return '<span class="skill-chip removable" data-sid="'+sid+'">'+getSkillLabel(sid)+' ✕</span>';
    }).join('');
    container.querySelectorAll('.skill-chip.removable').forEach(function(chip) {
      chip.addEventListener('click', function() {
        var sid = chip.dataset.sid;
        formData.skills = formData.skills.filter(function(s){ return s !== sid; });
        var opt = document.querySelector('#skills-grid .skill-option[data-skill="'+sid+'"]');
        if (opt) opt.classList.remove('selected');
        updateSelectedChips();
      });
    });
  }

  function setupExpButtons() {
    var btns = document.querySelectorAll('.exp-btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        btns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        formData.experience = btn.dataset.exp;
      });
    });
  }

  function setupStepNav() {
    var s1n = document.getElementById('step1-next');
    var s2b = document.getElementById('step2-back');
    var s2n = document.getElementById('step2-next');
    var s3b = document.getElementById('step3-back');
    var s3n = document.getElementById('step3-next');
    var s4b = document.getElementById('step4-back');
    var submit = document.getElementById('submit-profile');
    if (s1n) s1n.addEventListener('click', function(){ if(validateStep1()) goTo(2); });
    if (s2b) s2b.addEventListener('click', function(){ goTo(1); });
    if (s2n) s2n.addEventListener('click', function(){ if(validateStep2()) goTo(3); });
    if (s3b) s3b.addEventListener('click', function(){ goTo(2); });
    if (s3n) s3n.addEventListener('click', function(){ if(validateStep3()) { buildPreview(); goTo(4); } });
    if (s4b) s4b.addEventListener('click', function(){ goTo(3); });
    if (submit) submit.addEventListener('click', submitProfile);
  }

  function setupCustomSkill() {
    var input = document.getElementById('custom-skill-input');
    var addBtn = document.getElementById('add-custom-skill');
    if (!addBtn || !input) return;
    function addCustom() {
      var val = input.value.trim();
      if (!val) return;
      var id = 'custom_'+val.toLowerCase().replace(/\s+/g,'_');
      if (formData.skills.indexOf(id) >= 0) { input.value=''; return; }
      formData.skills.push(id);
      SKILLS_CATALOG.push({id:id, label:val, category:'Custom'});
      var grid = document.getElementById('skills-grid');
      if (grid) {
        var span = document.createElement('span');
        span.className = 'skill-option selected';
        span.dataset.skill = id;
        span.dataset.field = 'skills';
        span.textContent = val;
        grid.appendChild(span);
        span.addEventListener('click', function(){
          var idx = formData.skills.indexOf(id);
          if (idx>=0) formData.skills.splice(idx,1); else formData.skills.push(id);
          span.classList.toggle('selected', idx<0);
          updateSelectedChips();
        });
      }
      updateSelectedChips();
      input.value = '';
    }
    addBtn.addEventListener('click', addCustom);
    input.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); addCustom(); } });
  }

  function validateStep1() {
    formData.name = (document.getElementById('inp-name').value||'').trim();
    formData.role = (document.getElementById('inp-title').value||'').trim();
    formData.bio = (document.getElementById('inp-bio').value||'').trim();
    formData.github = (document.getElementById('inp-github').value||'').trim();
    formData.linkedin = (document.getElementById('inp-linkedin').value||'').trim();
    var avail = document.getElementById('inp-avail');
    if (avail) formData.availability = avail.value;
    var ok = true;
    var errName = document.getElementById('err-name');
    var errTitle = document.getElementById('err-title');
    var errExp = document.getElementById('err-exp');
    if (!formData.name) { if(errName) errName.classList.remove('hidden'); ok=false; } else { if(errName) errName.classList.add('hidden'); }
    if (!formData.role) { if(errTitle) errTitle.classList.remove('hidden'); ok=false; } else { if(errTitle) errTitle.classList.add('hidden'); }
    if (!formData.experience) { if(errExp) errExp.classList.remove('hidden'); ok=false; } else { if(errExp) errExp.classList.add('hidden'); }
    return ok;
  }
  function validateStep2() {
    var errSkills = document.getElementById('err-skills');
    if (!formData.skills || formData.skills.length === 0) { if(errSkills) errSkills.classList.remove('hidden'); return false; }
    if (errSkills) errSkills.classList.add('hidden');
    return true;
  }
  function validateStep3() {
    var errInts = document.getElementById('err-interests');
    if (!formData.interests || formData.interests.length === 0) { if(errInts) errInts.classList.remove('hidden'); return false; }
    if (errInts) errInts.classList.add('hidden');
    return true;
  }

  function goTo(step) {
    document.querySelectorAll('.form-step').forEach(function(s){ s.classList.remove('active'); });
    var stepEl = document.getElementById('form-step-'+step);
    if (stepEl) stepEl.classList.add('active');
    document.querySelectorAll('.step-item').forEach(function(item, idx) {
      var n = idx + 1;
      item.classList.remove('active','completed');
      if (n < step) item.classList.add('completed');
      else if (n === step) item.classList.add('active');
    });
    currentStep = step;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function buildPreview() {
    var container = document.getElementById('profile-preview-card');
    if (!container) return;
    var color = avatarStyle(formData.avatarColor || Math.floor(Math.random()*8));
    formData.avatarColor = formData.avatarColor || Math.floor(Math.random()*8);
    var skillChips = (formData.skills||[]).map(function(s){ return '<span class="skill-chip">'+getSkillLabel(s)+'</span>'; }).join('');
    var intChips = (formData.interests||[]).map(function(i){ return '<span class="skill-chip interest-chip">'+getInterestLabel(i)+'</span>'; }).join('');
    container.innerHTML = '<div class="profile-preview-header">'+
      '<div class="modal-avatar-lg" style="background:'+color+'">'+getInitials(formData.name||'?')+'</div>'+
      '<div class="modal-name">'+formData.name+'</div>'+
      '<div class="modal-role">'+formData.role+'</div>'+
      '<div class="modal-meta"><span class="skill-chip cyan-chip">'+expLabel(formData.experience||'intermediate')+'</span>'+
      '<span class="skill-chip">'+(formData.availability||'flexible').replace('-',' ')+'</span></div>'+
      (formData.bio?'<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:0.75rem;text-align:center">'+formData.bio+'</div>':'')+
      '</div><div class="profile-preview-body">'+
      '<div class="preview-section"><div class="preview-section-label">Skills ('+formData.skills.length+')</div><div class="preview-chips">'+skillChips+'</div></div>'+
      '<div class="preview-section"><div class="preview-section-label">Interests</div><div class="preview-chips">'+intChips+'</div></div>'+
      ((formData.github||formData.linkedin)?'<div class="preview-section"><div class="preview-section-label">Links</div>'+
      (formData.github?'<span class="skill-chip" style="margin-right:0.4rem">github.com/'+formData.github+'</span>':'')+
      (formData.linkedin?'<span class="skill-chip">'+formData.linkedin+'</span>':'')+
      '</div>':'')+
      '</div>';
  }

  function submitProfile() {
    var btn = document.getElementById('submit-profile');
    if (btn) { btn.textContent = 'Launching...'; btn.disabled = true; }

    // Save to localStorage (keeps offline mode working)
    var db = getDB();
    var cu = getCurrentUser();
    if (cu) {
      var idx = db.users.findIndex(function(u){ return u.id === cu.id; });
      var updated = Object.assign({}, cu, formData, {joinedAt: cu.joinedAt || Date.now()});
      if (idx >= 0) db.users[idx] = updated; else db.users.push(updated);
      saveCurrentUser(updated);
    } else {
      var newUser = Object.assign({}, formData, {
        id: 'u' + Date.now(),
        joinedAt: Date.now(),
        avatarColor: formData.avatarColor != null ? formData.avatarColor : Math.floor(Math.random() * 8)
      });
      db.users.push(newUser);
      saveCurrentUser(newUser);
    }
    saveDB(db);

    // Also sync to server if API is available and user is logged in
    if (typeof DevMatchAPI !== 'undefined' && DevMatchAPI.isLoggedIn()) {
      DevMatchAPI.updateProfile({
        name: formData.name, role: formData.role, bio: formData.bio,
        skills: formData.skills, interests: formData.interests,
        seekingSkills: formData.seekingSkills, experience: formData.experience,
        availability: formData.availability, github: formData.github,
        linkedin: formData.linkedin, avatarColor: formData.avatarColor
      }).then(function(data) {
        if (data.user) saveCurrentUser(data.user);
        window.location.href = 'matches.html';
      }).catch(function() {
        window.location.href = 'matches.html';
      });
    } else {
      setTimeout(function(){ window.location.href = 'matches.html'; }, 600);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();