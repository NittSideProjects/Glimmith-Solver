// preloaded into a fuzzer (node -r hook.js): records every puzzle the fuzzer hands to buildSolverContext
const fs = require('fs');
const S = require(process.env.GLIMMITH_CORE);
const orig = S.buildSolverContext, seen = new Set(), out = [];
const ser = v => v instanceof Map ? [...v] : v;
S.buildSolverContext = function(puzzle, bank, rules, hints, ban){
  try {
    const p = {}; for(const k of ['w', 'h', 'active', 'walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers']) if(puzzle[k] !== undefined) p[k] = ser(puzzle[k]);
    const rec = { puzzle: p, bank: bank || [], rules: rules || {}, ban: ban || [] };
    const k = JSON.stringify(rec);
    if(!seen.has(k) && out.length < 4000){ seen.add(k); out.push(rec); }
  } catch(e){}
  return orig.apply(this, arguments);
};
process.on('exit', () => { fs.appendFileSync(process.env.HARVEST_OUT, out.map(r => JSON.stringify(r)).join('\n') + (out.length ? '\n' : '')); });
