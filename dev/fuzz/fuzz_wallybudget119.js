// v119 soundness fuzz for the Wally dead-end budget (wallyEndsStep, spent budget: every tile gets exactly its links).
// Planted tilings that obey Wally (no tile with 3+ neighbours in its own piece), the number of pieces given as the maximum (so
// the budget is often spent), some palisades from the planted tiling; every deduce event must agree with the planted tiling.
//   node fuzz/fuzz_wallybudget119.js [N=300] [seed=1]
const L = require('../fuzzlib.js'), S = require('../reference/solver-core.v119.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
let ran = 0, checked = 0, bad = 0, fired = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 3 + pick(4), h = 3 + pick(4);
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 3 + pick(6), rich: false, noSpecials: true, clueP: [0, 0.1, 0.2][pick(3)], wallP: [0, 0.1][pick(2)], bank: false, holes: [0, 0.1][pick(2)] });
  const owner = new Map(); P0.planted.forEach((p, k) => p.forEach(([c, r]) => owner.set(c + ',' + r, k)));
  if(owner.size === 0) continue;
  const nb = (c, r) => [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => owner.get((c + dc) + ',' + (r + dr)));
  let wallyOk = true;
  for(const [k, me] of owner){ const [c, r] = k.split(',').map(Number); if(nb(c, r).filter(x => x === me).length > 2){ wallyOk = false; break; } }
  if(!wallyOk) continue;
  const pal = new Map();
  for(const [k, me] of owner) if(R() < 0.35){ const [c, r] = k.split(',').map(Number); pal.set(k, String(nb(c, r).filter(x => x !== me).length)); }
  const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades: pal, compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules: Object.assign({}, P0.rules, { wally: true }) };
  const hints = { maxRegions: P0.planted.length };
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, hints, []);
  ran++;
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true, nodeBudget: 50000 })){
    if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on a planted board, seed', seed, ev.reason, ev.why); break; }
    if(ev.type !== 'deduce') continue;
    const m = /^([vh]):(\d+),(\d+)$/.exec(ev.spot.key); const c = +m[2], r = +m[3];
    const a = owner.get(c + ',' + r), b = m[1] === 'v' ? owner.get((c + 1) + ',' + r) : owner.get(c + ',' + (r + 1));
    const truth = a === b ? 'same' : 'wall';
    checked++; if(ev.rule === 'wally-ends') fired++;
    if(ev.value !== truth){ bad++; console.log('WRONG seed', seed, ev.spot.key, ev.value, ev.rule, ev.via); break; }
  }
}
console.log(`fuzz_wallybudget119: ${ran} planted Wally boards, deductions checked ${checked} (wally-ends ${fired}), wrong ${bad}`);
process.exit(bad ? 1 : 0);
