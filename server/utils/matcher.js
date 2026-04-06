// DevMatch Matching Algorithm (Server-Side)
function matchScore(userA, userB) {
  var skillsA = new Set(userA.skills || []);
  var skillsB = new Set(userB.skills || []);
  var aLacksFromB = Array.from(skillsB).filter(function(s) { return !skillsA.has(s); });
  var bLacksFromA = Array.from(skillsA).filter(function(s) { return !skillsB.has(s); });
  var allArr = Array.from(skillsA).concat(Array.from(skillsB));
  var totalUnique = new Set(allArr).size;
  var complementScore = totalUnique > 0 ? ((aLacksFromB.length + bLacksFromA.length) / (totalUnique * 2)) * 100 : 0;

  var intsA = new Set(userA.interests || []);
  var intsB = new Set(userB.interests || []);
  var sharedInts = Array.from(intsA).filter(function(i) { return intsB.has(i); }).length;
  var totalInts = new Set(Array.from(intsA).concat(Array.from(intsB))).size;
  var interestScore = totalInts > 0 ? (sharedInts / totalInts) * 100 : 0;

  var expMap = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
  var eA = expMap[userA.experience] != null ? expMap[userA.experience] : 1;
  var eB = expMap[userB.experience] != null ? expMap[userB.experience] : 1;
  var expDiff = Math.abs(eA - eB);
  var expScore = expDiff === 0 ? 100 : expDiff === 1 ? 75 : expDiff === 2 ? 40 : 15;

  var seekingBonus = 0;
  if (userA.seekingSkills && userA.seekingSkills.length > 0) {
    var seeking = new Set(userA.seekingSkills);
    var mc = Array.from(skillsB).filter(function(s) { return seeking.has(s); }).length;
    seekingBonus = seeking.size > 0 ? (mc / seeking.size) * 15 : 0;
  }

  var total = (complementScore * 0.40) + (interestScore * 0.35) + (expScore * 0.25) + seekingBonus;
  return {
    total: Math.min(100, Math.round(total)),
    complementScore: Math.round(complementScore),
    interestScore: Math.round(interestScore),
    expScore: Math.round(expScore)
  };
}

function getRankedMatches(currentUser, allUsers) {
  return allUsers
    .filter(function(u) { return u.id !== currentUser.id; })
    .map(function(u) { return { user: u, score: matchScore(currentUser, u) }; })
    .sort(function(a, b) { return b.score.total - a.score.total; });
}

module.exports = { matchScore: matchScore, getRankedMatches: getRankedMatches };