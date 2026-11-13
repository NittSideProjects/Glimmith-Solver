// END-TO-END FUZZ (v36 Bricky): the whole solver (Solver B, deduction + exact stage) against the brute-force oracle on small planted boards
// (holes, hand walls, clues, palisades, Boxy / Mismatch / Min / Max / stamps mixed in, Bricky always on): same number of tilings (capped at 2), same verdict.
// node fuzz_bricky36.js N seed
const L = require('./fuzzlib.js'), O = require('./oracle.js'), S = require('./reference/solver-core.v98.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function palType(owner, c, r){ const me = owner.get(c + ',' + r), sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => owner.get((c + dc) + ',' + (r + dr)) === me ? 0 : 1); const n = sd[0] + sd[1] + sd[2] + sd[3]; return n === 2 ? ((sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2) ? '2s' : '2c') : String(n); }
let bad = 0, ran = 0, uniq = 0, multi = 0, none = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(4), h = 2 + pick(3);
  if(w * h > 12) continue;                                  // the oracle is exponential
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + pick(6), rich: R() < 0.5, noSpecials: true, clueP: [0.1, 0.3, 0.6][pick(3)], wallP: [0, 0.2][pick(2)], bank: false, holes: [0, 0.1, 0.2][pick(3)] });
  const owner = new Map(); P0.planted.forEach((p, k) => p.forEach(([c, r]) => owner.set(c + ',' + r, k)));
  if(owner.size === 0) continue;
  const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules: Object.assign({}, P0.rules, { bricky: true }) };
  if(R() < 0.3){ for(const key of owner.keys()){ if(R() < 0.4){ const [c, r] = key.split(',').map(Number); Q.puzzle.palisades.set(key, palType(owner, c, r)); } } }
  if(R() < 0.25) Q.rules.boxy = true;
  const truth = O.oracle(Q, 200000); if(truth === null) continue;
  ran++;
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []); let n = 0, imp = false;
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true, testNodes: 20 })){ if(ev.type === 'solution') n++; if(ev.type === 'impossible-early'){ imp = true; break; } }
  const want = Math.min(truth.length, 2), got = imp ? 0 : Math.min(n, 2);
  if(want === 0) none++; else if(want === 1) uniq++; else multi++;
  if(want !== got){ bad++; console.log('MISMATCH seed', seed, 'oracle', truth.length, 'solver', got, JSON.stringify([w, h, Q.puzzle.active, [...Q.puzzle.walls], [...Q.puzzle.palisades], Q.rules, [...Q.puzzle.areaNumbers]])); }
}
console.log(`fuzz_bricky36: ${ran} puzzles (${uniq} unique, ${multi} several, ${none} none), ${bad} mismatches`);
process.exit(bad ? 1 : 0);
