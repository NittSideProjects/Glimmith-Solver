// cores v111-v114 (refactoring steps 5-8): forced growth with Non-boxy, the box per tile (compasses, Boxy), the shared corner checks,
// RULE_FAMILY. Synthetic planted boards only; each verdict is checked against the brute-force oracle.
const L = require('../../fuzzlib.js'), O = require('../../oracle.js'), S = require('../../reference/solver-core.v117.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if(c) pass++; else { fail++; console.log('FAIL', m); } };
const tags = new Set([...S.RULE_TAGS || [], 'grow', 'reach']);
for(const [t, [f, s]] of Object.entries(S.RULE_FAMILY)) ok(['grow', 'reach', 'region', 'place', 'corner'].includes(f) && typeof s === 'string' && s.length > 0, 'family of ' + t);
ok(Object.keys(S.RULE_FAMILY).length >= 35, 'RULE_FAMILY size');
const rng = s => () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
const seen = {};
for(const [name, extra] of [['nonBoxy', { nonBoxy: true }], ['boxy', { boxy: true }], ['bricky', { bricky: true }], ['loopy', { loopy: true }], ['bricky+loopy', { bricky: true, loopy: true }]]){
  let n = 0;
  for(let i = 0; i < 400 && n < 25; i++){
    const seed = 114000 + i * 7 + name.length, R = rng(seed);
    const w = 2 + Math.floor(R() * 3), h = 2 + Math.floor(R() * 3);
    const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + Math.floor(R() * 4), rich: R() < 0.5, noSpecials: true, clueP: 0.4, wallP: 0, bank: false, holes: 0 });
    if(!P0.planted.length) continue;
    const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules: Object.assign({}, P0.rules, extra) };
    const truth = O.oracle(Q, 100000); if(truth === null) continue;
    const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []); let sol = 0, imp = false;
    for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true })){
      if(ev.type === 'solution') sol++; if(ev.type === 'impossible-early'){ imp = true; break; }
      if(ev.type === 'deduce' && ev.rule) seen[ev.rule] = (seen[ev.rule] || 0) + 1;
    }
    ok(Math.min(truth.length, 2) === (imp ? 0 : Math.min(sol, 2)), `${name} seed ${seed}: oracle ${truth.length}, solver ${imp ? 0 : sol}`);
    n++;
  }
  ok(n >= 10, name + ': enough boards');
}
console.log(`test_refactor114: refactoring steps 5-8 (cores v111-v114): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
