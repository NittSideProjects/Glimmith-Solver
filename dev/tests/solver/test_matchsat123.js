// v123: the SAT final search for Match.
//  1. satNew against brute force: random small formulas, every model enumerated (blocking clauses between calls, tiny budgets).
//  2. A planted Match puzzle (synthetic: a 6x6 board cut into four quarter-turned copies of one 9-tile piece, palisades taken from
//     that tiling until the solver calls it unique): SAT on / off / "too big" all give the same unique solution.
//  3. A deadline already passed: the search reports a timeout, not "no solution".
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v125.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if(c) pass++; else { fail++; console.log('FAIL:', m); } };

// 1
let seed = 12345; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
let bad = 0;
for(let t = 0; t < 1500; t++){
  const nv = 1 + Math.floor(rnd() * 10), nc = Math.floor(rnd() * nv * 5), cls = [];
  for(let i = 0; i < nc; i++){ const len = 1 + Math.floor(rnd() * 4), c = []; for(let j = 0; j < len; j++){ const v = 1 + Math.floor(rnd() * nv); c.push(rnd() < 0.5 ? v : -v); } cls.push(c); }
  let bf = 0; for(let m = 0; m < (1 << nv); m++) if(cls.every(c => c.some(l => ((m >> (Math.abs(l) - 1)) & 1) === (l > 0 ? 1 : 0)))) bf++;
  const s = S.satNew(); for(let i = 0; i < nv; i++) s.newVar(); for(const c of cls) s.addClause(c);
  let cnt = 0;
  for(;;){ const r = s.solve(1 + Math.floor(rnd() * 3)); if(r === 0) continue; if(r < 0) break;
    const m = []; for(let v = 1; v <= nv; v++) m.push(s.value(v));
    if(!cls.every(c => c.some(l => m[Math.abs(l) - 1] === (l > 0)))){ bad++; break; }
    cnt++; if(!s.addClause(m.map((x, i) => x ? -(i + 1) : (i + 1)))) break; }
  if(cnt !== bf) bad++;
}
ok(bad === 0, `SAT model counts equal brute force on 1500 formulas (${bad} wrong)`);

// 2: find a 9-tile piece whose four quarter turns about the centre tile the 6x6 board (deterministic search)
const n = 6, rot = ([x, y]) => [n - 1 - y, x];
let tiling = null;
for(let tries = 0; tries < 20000 && !tiling; tries++){
  const A = [[0, 0]], has = new Set(['0,0']);
  while(A.length < 9){ const [x, y] = A[Math.floor(rnd() * A.length)], d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rnd() * 4)], q = [x + d[0], y + d[1]];
    if(q[0] < 0 || q[1] < 0 || q[0] >= n || q[1] >= n || has.has(q.join(','))) continue; A.push(q); has.add(q.join(',')); }
  const lab = new Map(); let clash = false; let P = A;
  for(let k = 0; k < 4 && !clash; k++){ for(const c of P){ const key = c.join(','); if(lab.has(key)){ clash = true; break; } lab.set(key, k); } P = P.map(rot); }
  if(!clash && lab.size === 36) tiling = lab;
}
ok(!!tiling, 'a quarter-turn tiling of 6x6 by one 9-tile piece');
if(tiling){
  const pz = { w: n, h: n, active: L.makeGrid(n, n, true), walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), compasses: new Map(), watchtowers: new Map() };
  const rules = { precision: null, min: null, max: null, match: true };
  const P = { puzzle: pz, bank: [], rules };
  const palOf = (x, y) => { const k = tiling.get(x + ',' + y); let m = 0; [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy], i) => { const o = tiling.get((x + dx) + ',' + (y + dy)); if(o === undefined || o !== k) m |= 1 << i; });
    const pop = (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) + ((m >> 3) & 1); return pop === 2 ? ((m === 5 || m === 10) ? '2s' : '2c') : String(pop); };
  const cells = []; for(let y = 0; y < n; y++) for(let x = 0; x < n; x++) cells.push([x, y]);
  const want = [...new Set(tiling.values())].map(k => cells.filter(([x, y]) => tiling.get(x + ',' + y) === k));
  const wantSig = L.sig(want.map(cs => ({ cells: cs })));
  let r = null;
  for(let i = 0; i < 36; i++){
    const [x, y] = cells[Math.floor(rnd() * 36)]; pz.palisades.set(x + ',' + y, palOf(x, y));
    r = L.deduce(P, {}, 2, 200000); if(r.sols.length === 1) break;
  }
  ok(r && r.sols.length === 1 && L.sig(r.sols[0]) === wantSig, 'SAT: the planted puzzle is unique, with the planted tiling');
  const off = L.deduce(P, { matchSat: false }, 2, 200000);
  ok(off.sols.length === 1 && L.sig(off.sols[0]) === wantSig, 'old final search: the same unique tiling');
  const big = L.deduce(P, { matchSatClauses: 1, finalOnly: true }, 2, 200000);
  ok(big.sols.length === 1 && L.sig(big.sols[0]) === wantSig, '"too big" falls back to the old final search');
  const fo = L.deduce(P, { finalOnly: true }, 2, 200000);
  ok(fo.sols.length === 1 && L.sig(fo.sols[0]) === wantSig, 'SAT straight after the root propagation: the same tiling');
  // 3
  const ctx = S.buildSolverContext(pz, [], rules, null, []);
  let sawTimeout = false, sols = 0;
  for(const ev of S.deduceSolve(n, n, ctx, [], { finalOnly: true, deadline: Date.now() - 1 })){ if(ev.type === 'timeout') sawTimeout = true; if(ev.type === 'solution') sols++; }
  ok(sawTimeout && sols === 0, 'a passed deadline gives a timeout');
}
console.log(`matchsat (core v123): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
