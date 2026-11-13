// corepath.js: which solver core the shared scripts load.
//   GLIMMITH_CORE set   -> that file (relative paths are taken from the current directory, as before)
//   otherwise           -> the newest reference/solver-core.vNN.js (highest NN), so a new core is picked up without edits
// Scripts that compare two fixed versions (fuzz_xx / test_xx / scan_xx with their own require) are not affected.
'use strict';
const fs = require('fs'), path = require('path');
const refDir = path.join(__dirname, 'reference');

function latestCore(){
  let best = null, bestN = -1;
  for(const f of fs.readdirSync(refDir)){
    const m = f.match(/^solver-core\.v(\d+)\.js$/);
    if(m && Number(m[1]) > bestN){ bestN = Number(m[1]); best = f; }
  }
  if(!best) throw new Error('no reference/solver-core.vNN.js found');
  return path.join(refDir, best);
}

function corePath(){
  const env = process.env.GLIMMITH_CORE;
  if(!env) return latestCore();
  if(path.isAbsolute(env)) return env;
  const fromCwd = path.resolve(env), fromRoot = path.resolve(__dirname, env);   // the old require() took it from the project root
  return fs.existsSync(fromCwd) ? fromCwd : fromRoot;
}

module.exports = { corePath, latestCore };
