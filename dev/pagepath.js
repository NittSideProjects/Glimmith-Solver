// pagepath.js: the page the tests use by default = the newest glimmith_solver_V1.0.N.html at the top of the repository (highest N).
// Only the newest page is kept in the repository (git history has the others), so the tests never name a version.
'use strict';
const fs = require('fs'), path = require('path');
const top = path.join(__dirname, '..');
module.exports = function latestPage(){
  let best = null, bestN = -1;
  for(const f of fs.readdirSync(top)){ const m = f.match(/^glimmith_solver_V1\.0\.(\d+)\.html$/); if(m && +m[1] > bestN){ bestN = +m[1]; best = f; } }
  if(!best) throw new Error('no glimmith_solver_V1.0.N.html at the top of the repository');
  return path.join(top, best);
};
