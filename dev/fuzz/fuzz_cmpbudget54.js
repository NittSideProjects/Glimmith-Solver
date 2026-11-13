// v54 cmp-budget: planted tilings with one rose of each type per piece and TRUE compass numbers, every deduction checked against the planted
// tiling (a planted tiling is a solution, so no deduction may contradict it), and the verdict (0 / 1 / 2+) against the deduce run with
// cmpBudget off.   node fuzz_cmpbudget54.js [N=150] [seed=1]        (uses the newest core, or GLIMMITH_CORE)
const L = require('../fuzzlib.js');
const N = +process.argv[2] || 150, seed0 = +process.argv[3] || 1;
let bad = 0, fired = 0, tested = 0; const tally = {};
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i;
  const P = L.plantedPuzzle(seed, { w: 5 + (i % 3), h: 5 + ((i >> 1) % 3), maxPiece: 7 + (i % 4), rich: false, clueP: 0, wallP: 0.15, bank: false, holes: 0.02 });
  const R = L.rng(seed + 11), pick = n => Math.floor(R() * n);
  const K = 1 + (i % 2), pieces = P.planted;
  if(pieces.some(p => p.length < K)) continue;
  const roses = new Map(), comps = new Map(), used = new Set();
  pieces.forEach(cells => {
    const free = cells.slice();
    for(let t = 1; t <= K; t++){ const j = pick(free.length), [c, r] = free.splice(j, 1)[0]; roses.set(c + ',' + r, t); used.add(c + ',' + r); }
    if(R() < 0.9 && free.length){                         // a compass with the true count on 1-2 random sides
      const [c, r] = free[pick(free.length)], cp = { n: null, e: null, s: null, w: null };
      const cnt = { n: 0, e: 0, s: 0, w: 0 };
      for(const [x, y] of cells){ if(y < r) cnt.n++; else if(y > r) cnt.s++; if(x > c) cnt.e++; else if(x < c) cnt.w++; }
      const ds = ['n', 'e', 's', 'w']; const k = 1 + pick(3);
      for(let q = 0; q < k; q++){ const d = ds[pick(4)]; cp[d] = cnt[d]; }
      comps.set(c + ',' + r, cp);
    }
  });
  if(!comps.size) continue;
  Object.assign(P.puzzle, { roses, compasses: comps, polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), watchtowers: new Map() });
  // the planted walls
  const pid = new Map(); pieces.forEach((cells, k) => cells.forEach(([c, r]) => pid.set(c + ',' + r, k)));
  const isWall = key => { const [t, xy] = key.split(':'), [c, r] = xy.split(',').map(Number);
    const a = pid.get(c + ',' + r), b = t === 'v' ? pid.get((c + 1) + ',' + r) : pid.get(c + ',' + (r + 1)); return a !== b; };
  tested++;
  const on = L.deduce(P, { keepEvents: true, testMs: 50 }, 2, 300000), off = L.deduce(P, { cmpBudget: false, testMs: 50 }, 2, 300000);
  let wrong = 0, cb = 0;
  for(const ev of on.events){
    if(ev.type === 'impossible-early'){ wrong++; console.log('seed', seed, 'IMPOSSIBLE-EARLY', ev.why); }
    if(ev.type === 'deduce'){ if(ev.rule === 'cmp-budget') cb++; if((ev.value === 'wall') !== isWall(ev.spot.key)){ wrong++; if(wrong < 3) console.log('seed', seed, 'WRONG', ev.spot.key, ev.value, ev.rule); } }
  }
  if(cb) fired++;
  const v = r => r.exceeded ? 'budget' : r.sols.length === 0 ? 'none' : r.sols.length === 1 ? 'unique' : 'multi';
  const a = v(on), b = v(off); tally[a] = (tally[a] || 0) + 1;
  if(a === 'none') { wrong++; console.log('seed', seed, 'NO SOLUTION found but the planted one exists'); }
  if(a !== b && a !== 'budget' && b !== 'budget'){ wrong++; console.log('seed', seed, 'VERDICT', a, 'vs off', b); }
  if(wrong) bad++;
}
console.log(`core ${require('path').basename(L.CORE_PATH)}: tested ${tested}, cmp-budget fired in ${fired}, verdicts ${JSON.stringify(tally)}, bad ${bad}`);
process.exitCode = bad ? 1 : 0;
