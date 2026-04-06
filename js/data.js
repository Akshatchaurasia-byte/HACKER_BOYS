// =========================================================
// DevMatch — Seed Data & Constants
// =========================================================

const SKILLS_CATALOG = [
  { id: 'react', label: 'React', category: 'Frontend' },
  { id: 'vue', label: 'Vue.js', category: 'Frontend' },
  { id: 'angular', label: 'Angular', category: 'Frontend' },
  { id: 'html_css', label: 'HTML/CSS', category: 'Frontend' },
  { id: 'typescript', label: 'TypeScript', category: 'Frontend' },
  { id: 'node', label: 'Node.js', category: 'Backend' },
  { id: 'python', label: 'Python', category: 'Backend' },
  { id: 'java', label: 'Java', category: 'Backend' },
  { id: 'go', label: 'Go', category: 'Backend' },
  { id: 'rust', label: 'Rust', category: 'Backend' },
  { id: 'django', label: 'Django', category: 'Backend' },
  { id: 'fastapi', label: 'FastAPI', category: 'Backend' },
  { id: 'ml', label: 'Machine Learning', category: 'AI/ML' },
  { id: 'dl', label: 'Deep Learning', category: 'AI/ML' },
  { id: 'nlp', label: 'NLP', category: 'AI/ML' },
  { id: 'cv', label: 'Computer Vision', category: 'AI/ML' },
  { id: 'llm', label: 'LLMs / GPT', category: 'AI/ML' },
  { id: 'solidity', label: 'Solidity', category: 'Web3' },
  { id: 'web3js', label: 'Web3.js', category: 'Web3' },
  { id: 'ipfs', label: 'IPFS', category: 'Web3' },
  { id: 'defi', label: 'DeFi', category: 'Web3' },
  { id: 'aws', label: 'AWS', category: 'DevOps' },
  { id: 'docker', label: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', label: 'Kubernetes', category: 'DevOps' },
  { id: 'mongodb', label: 'MongoDB', category: 'Database' },
  { id: 'postgres', label: 'PostgreSQL', category: 'Database' },
  { id: 'redis', label: 'Redis', category: 'Database' },
  { id: 'figma', label: 'Figma', category: 'Design' },
  { id: 'ux', label: 'UX Research', category: 'Design' },
  { id: 'threejs', label: 'Three.js', category: 'Creative' },
  { id: 'unity', label: 'Unity', category: 'Creative' },
  { id: 'flutter', label: 'Flutter', category: 'Mobile' },
  { id: 'reactnative', label: 'React Native', category: 'Mobile' },
];

const INTERESTS_CATALOG = [
  { id: 'aiml', label: 'AI & ML', emoji: '🤖' },
  { id: 'web3', label: 'Web3', emoji: '⛓️' },
  { id: 'fintech', label: 'FinTech', emoji: '💹' },
  { id: 'saas', label: 'SaaS', emoji: '☁️' },
  { id: 'healthtech', label: 'HealthTech', emoji: '🏥' },
  { id: 'gamedev', label: 'GameDev', emoji: '🎮' },
  { id: 'edtech', label: 'EdTech', emoji: '📚' },
  { id: 'climatetech', label: 'ClimateTech', emoji: '🌱' },
  { id: 'security', label: 'Security', emoji: '🔐' },
  { id: 'robotics', label: 'Robotics / IoT', emoji: '🤖' },
  { id: 'ar_vr', label: 'AR / VR', emoji: '👓' },
  { id: 'social', label: 'Social Impact', emoji: '🌍' },
];

const EXP_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const EXP_ICONS = { beginner: '🌱', intermediate: '⚡', advanced: '🚀', expert: '🏆' };

const AVATAR_COLORS = [
  'var(--grad-cyan)', 'var(--grad-violet)', 'var(--grad-pink)', 'var(--grad-green)',
  'linear-gradient(135deg,#f59e0b,#ef4444)', 'linear-gradient(135deg,#06b6d4,#10b981)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)', 'linear-gradient(135deg,#f97316,#ef4444)'
];

const SEED_USERS = [
  { id:'u1', name:'Ananya Krishnan', role:'Full Stack Developer', bio:'Passionate about building products that scale. Love React and Python. Open to AI project ideas.', experience:'advanced', availability:'full-time', skills:['react','typescript','python','fastapi','postgres'], interests:['aiml','saas','healthtech'], github:'ananya-k', linkedin:'linkedin.com/in/ananya-k', avatarColor: 0, joinedAt: Date.now()-86400000*5 },
  { id:'u2', name:'Rahul Sharma', role:'ML Engineer', bio:'Working on NLP and recommendation systems at IIT. Looking for frontend-savvy partners.', experience:'advanced', availability:'weekends', skills:['python','ml','nlp','llm','dl'], interests:['aiml','healthtech','edtech'], github:'rahul-s', linkedin:'linkedin.com/in/rahul-s', avatarColor: 1, joinedAt: Date.now()-86400000*3 },
  { id:'u3', name:'Jake Martinez', role:'Web3 Developer', bio:'Solidity dev building DeFi protocols. Need a frontend dev and designer to ship.', experience:'intermediate', availability:'full-time', skills:['solidity','web3js','defi','react','ipfs'], interests:['web3','fintech'], github:'jake-m3', linkedin:'', avatarColor: 2, joinedAt: Date.now()-86400000*7 },
  { id:'u4', name:'Priya Patel', role:'UX Designer', bio:'Figma-first designer who codes HTML/CSS. Obsessed with accessible, beautiful products.', experience:'intermediate', availability:'flexible', skills:['figma','ux','html_css','react'], interests:['saas','healthtech','social'], github:'priya-p', linkedin:'linkedin.com/in/priya-p', avatarColor: 3, joinedAt: Date.now()-86400000*2 },
  { id:'u5', name:'Carlos Mendez', role:'Backend Engineer', bio:'Go/Rust systems builder. Looking for ML folks to add intelligence to robust pipelines.', experience:'expert', availability:'part-time', skills:['go','rust','docker','kubernetes','redis'], interests:['aiml','saas','security'], github:'cmendez', linkedin:'linkedin.com/in/carlosmendez', avatarColor: 4, joinedAt: Date.now()-86400000*10 },
  { id:'u6', name:'Diya Roy', role:'AI Research Intern', bio:'Undergraduate at BITS working on computer vision for medical imaging. PyTorch everyday.', experience:'beginner', availability:'full-time', skills:['python','cv','dl','ml'], interests:['aiml','healthtech','climatetech'], github:'diya-r', linkedin:'linkedin.com/in/diya-r', avatarColor: 5, joinedAt: Date.now()-86400000*1 },
  { id:'u7', name:'Sam Chen', role:'Game Developer', bio:'Unity + Three.js dev looking to build immersive hackathon demos. AR/VR enthusiast.', experience:'intermediate', availability:'weekends', skills:['unity','threejs','react','typescript'], interests:['gamedev','ar_vr'], github:'sam-c-dev', linkedin:'', avatarColor: 6, joinedAt: Date.now()-86400000*4 },
  { id:'u8', name:'Amara Osei', role:'DevOps Engineer', bio:'Cloud infra and deployment automation expert. Will make sure your hackathon project actually runs in prod.', experience:'expert', availability:'flexible', skills:['aws','docker','kubernetes','postgres','redis'], interests:['saas','security','aiml'], github:'amara-o', linkedin:'linkedin.com/in/amara-o', avatarColor: 7, joinedAt: Date.now()-86400000*6 },
  { id:'u9', name:'Lena Walsh', role:'Flutter Developer', bio:'Mobile-first thinker. Built 3 apps on the Play Store. Want to build something impactful at a hackathon.', experience:'advanced', availability:'full-time', skills:['flutter','reactnative','node','mongodb'], interests:['healthtech','edtech','social'], github:'lena-w', linkedin:'linkedin.com/in/lena-w', avatarColor: 0, joinedAt: Date.now()-86400000*8 },
  { id:'u10', name:'Hamid Reza', role:'FinTech Enthusiast', bio:'Economics + CS hybrid. Building payment infra and financial literacy tools.', experience:'intermediate', availability:'part-time', skills:['python','node','postgres','react'], interests:['fintech','saas','web3'], github:'hamid-r', linkedin:'linkedin.com/in/hamid-r', avatarColor: 1, joinedAt: Date.now()-86400000*9 },
  { id:'u11', name:'Sophie Brunner', role:'NLP Researcher', bio:'PhD track at TU Munich. Working on multilingual LLM fine-tuning. Looking to apply research to real products.', experience:'expert', availability:'weekends', skills:['python','nlp','llm','ml','dl'], interests:['aiml','edtech','social'], github:'sophie-b-nlp', linkedin:'linkedin.com/in/sophie-b', avatarColor: 2, joinedAt: Date.now()-86400000*12 },
  { id:'u12', name:'Kenji Tanaka', role:'React Developer', bio:'Frontend craftsman who cares deeply about animation and micro-interactions. Framer Motion was made for me.', experience:'intermediate', availability:'flexible', skills:['react','typescript','html_css','threejs'], interests:['saas','gamedev','ar_vr'], github:'kenji-t', linkedin:'linkedin.com/in/kenji-t', avatarColor: 3, joinedAt: Date.now()-86400000*11 },
];

// DB helpers
function getDB() {
  try {
    return JSON.parse(localStorage.getItem('devmatch_db') || 'null') || { users: [...SEED_USERS], connections: [], swipes: [] };
  } catch(e) { return { users: [...SEED_USERS], connections: [], swipes: [] }; }
}
function saveDB(db) {
  localStorage.setItem('devmatch_db', JSON.stringify(db));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('devmatch_current_user') || 'null'); } catch(e) { return null; }
}
function saveCurrentUser(user) {
  localStorage.setItem('devmatch_current_user', JSON.stringify(user));
}
function initDB() {
  const db = getDB();
  if (!db.connections) db.connections = [];
  if (!db.swipes) db.swipes = [];
  saveDB(db);
  return db;
}
function getSkillLabel(id) {
  const s = SKILLS_CATALOG.find(x => x.id === id);
  return s ? s.label : id;
}
function getInterestLabel(id) {
  const i = INTERESTS_CATALOG.find(x => x.id === id);
  return i ? i.label : id;
}
function getInitials(name) {
  return name.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
}
function avatarStyle(colorIdx) {
  return AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
}
function expLabel(exp) {
  return EXP_ICONS[exp] + ' ' + exp.charAt(0).toUpperCase() + exp.slice(1);
}
