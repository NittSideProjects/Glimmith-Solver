// END-TO-END FUZZ (v89 Wally): the whole solver (deduction + exact stage) against the brute-force oracle on small planted boards.
// The oracle does not know Wally: its tilings are filtered here with an independent check ("every tile has at least 2 neighbouring
// tiles of the board in another piece"). Holes, hand walls, clues, palisades, Boxy / Loopy / Bricky / Min / Max mixed in.
// node fuzz_wally89.js N seed        (VALID=1: only boards whose planted tiling satisfies Wally)
const L = require('../fuzzlib.js'), O = require('../oracle.js'), S = require(process.env.GLIMMITH_CORE || '../reference/solver-core.v100.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function palType(owner, c, r){ const me = owner.get(c + ',' + r), sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => owner.get((c + dc) + ',' + (r + dr)) === me ? 0 : 1); const n = sd[0] + sd[1] + sd[2] + sd[3]; return n === 2 ? ((sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2) ? '2s' : '2c') : String(n); }
function wallyOk(owner){
  for(const [key, me] of owner){
    const [c, r] = key.split(',').map(Number); let n = 0;
    for(const [dc, dr] of [[0, -1], [1, 0], [0, 1], [-1, 0]]){ const o = owner.get((c + dc) + ',' + (r + dr)); if(o !== me) n++;   /* v91: the outline and empty tiles count (no T tetromino) */ }
    if(n < 2) return false;
  }
  return true;
}
const ownerOf = pieces => { const m = new Map(); pieces.forEach((p, k) => p.forEach(([c, r]) => m.set(c + ',' + r, k))); return m; };
const VALID = !!process.env.VALID;
let bad = 0, ran = 0, uniq = 0, multi = 0, none = 0, ms = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(4), h = 2 + pick(3);
  if(w * h > 12) continue;
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 1 + pick(5), rich: R() < 0.5, noSpecials: true, clueP: [0, 0.1, 0.3][pick(3)], wallP: [0, 0.2][pick(2)], bank: false, holes: [0, 0.1, 0.2][pick(3)] });
  const owner = ownerOf(P0.planted);
  if(owner.size === 0 || (VALID && !wallyOk(owner))) continue;
  const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules: Object.assign({}, P0.rules, { wally: true }) };
  if(R() < 0.25){ for(const key of owner.keys()){ if(R() < 0.4){ const [c, r] = key.split(',').map(Number); Q.puzzle.palisades.set(key, palType(owner, c, r)); } } }
  const x = R(); if(x < 0.15) Q.rules.boxy = true; else if(x < 0.25) Q.rules.loopy = true; else if(x < 0.35) Q.rules.bricky = true;
  const all = O.oracle(Q, 200000); if(all === null || all.length >= 200000) continue;
  const truth = all.filter(p => wallyOk(ownerOf(p)));
  ran++;
  const t0 = Date.now();
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []); let n = 0, imp = false;
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true, testNodes: 20 })){ if(ev.type === 'solution') n++; if(ev.type === 'impossible-early'){ imp = true; break; } }
  ms += Date.now() - t0;
  const want = Math.min(truth.length, 2), got = imp ? 0 : Math.min(n, 2);
  if(want === 0) none++; else if(want === 1) uniq++; else multi++;
  if(want !== got){ bad++; console.log('MISMATCH seed', seed, 'oracle', truth.length, 'solver', got, JSON.stringify([w, h, Q.puzzle.active, [...Q.puzzle.walls], [...Q.puzzle.palisades], Q.rules, [...Q.puzzle.areaNumbers]])); }
}
console.log(`fuzz_wally89: ${ran} puzzles (${uniq} unique, ${multi} several, ${none} none), ${bad} mismatches, solver ${ms} ms`);
process.exit(bad ? 1 : 0);
