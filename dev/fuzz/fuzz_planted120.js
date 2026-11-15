// V1.0.36: the whole solver, run with the PAGE's settings, against planted tilings that obey every clue and rule put on the board.
// A random tiling is planted; clues are read off it (compasses, palisades, plus fuzzlib's area numbers / roses / polyominoes);
// each rule is switched on only when the planted tiling obeys it (Mismatch, Match, Mingle Shape / Area, Heterogeneous, Boxy,
// Non-boxy, Bricky, Loopy, Wally, Minimum / Maximum / Precision). So the planted tiling is always a solution, and:
//   * the solver must never say impossible (a false "impossible" is the worst bug it can have);
//   * every deduction made by a rule or a probe must agree with the planted tiling (the search can name another tiling);
//   * when it says unique, its solution must be the planted tiling.
//   node fuzz/fuzz_planted120.js [N=300] [seed=1]
const L = require('../fuzzlib.js'), S = require('../reference/solver-core.v120.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const PAGE = { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, exact: 'edge', stopAtTwo: true, fullScan: true, nodeBudget: 300000 };
let ran = 0, bad = 0, checked = 0, unique = 0, cut = 0; const dist = [0, 0, 0]; const ruleUse = {};
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 3 + pick(5), h = 3 + pick(4);
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + pick(7), rich: R() < 0.5, noSpecials: true, clueP: [0.15, 0.3, 0.5][pick(3)], wallP: [0, 0.15][pick(2)], bank: false, holes: [0, 0.08][pick(2)] });
  if(!P0.planted.length) continue;
  const own = new Map(); P0.planted.forEach((p, k) => p.forEach(([c, r]) => own.set(c + ',' + r, k)));
  const at = (c, r) => own.get(c + ',' + r);
  const pieces = P0.planted, sizes = pieces.map(p => p.length), keys = pieces.map(p => S.canonicalShapeKey(p));
  const box = p => { const xs = p.map(q => q[0]), ys = p.map(q => q[1]); return (Math.max(...xs) - Math.min(...xs) + 1) * (Math.max(...ys) - Math.min(...ys) + 1); };
  const touching = []; for(const [k, a] of own){ const [c, r] = k.split(',').map(Number); for(const [dc, dr] of [[1, 0], [0, 1]]){ const b = at(c + dc, r + dr); if(b !== undefined && b !== a) touching.push([a, b]); } }
  const vert = (x, y) => { const t = [at(x - 1, y - 1), at(x, y - 1), at(x - 1, y), at(x, y)]; return [[0, 1], [1, 3], [2, 3], [0, 2]].filter(([i, j]) => t[i] !== t[j]).length; };
  let briOk = true, looOk = true; for(let y = 0; y <= h; y++) for(let x = 0; x <= w; x++){ const k = vert(x, y); if(k === 4) briOk = false; if(k === 3) looOk = false; }
  let wallyOk = true; for(const [k, a] of own){ const [c, r] = k.split(',').map(Number); if([[0, -1], [1, 0], [0, 1], [-1, 0]].filter(([dc, dr]) => at(c + dc, r + dr) === a).length > 2) wallyOk = false; }
  const rules = Object.assign({}, P0.rules);
  const want = (name, ok) => { if(ok && R() < 0.3){ rules[name] = true; ruleUse[name] = (ruleUse[name] || 0) + 1; } };
  want('mismatch', new Set(keys).size === keys.length);
  want('match', new Set(keys).size === 1 && pieces.length > 1);
  want('mingleShape', touching.every(([a, b]) => keys[a] !== keys[b]));
  want('mingleArea', touching.every(([a, b]) => sizes[a] !== sizes[b]));
  want('heterogeneous', new Set(sizes).size === sizes.length);
  want('boxy', pieces.every(p => box(p) === p.length));
  want('nonBoxy', pieces.every(p => box(p) !== p.length));
  want('bricky', briOk); want('loopy', looOk); want('wally', wallyOk);
  if(rules.boxy && rules.nonBoxy) delete rules.nonBoxy;
  if(R() < 0.2) rules.min = Math.min(...sizes); if(R() < 0.2) rules.max = Math.max(...sizes);
  const palisades = new Map(), compasses = new Map();
  for(const [k, a] of own){
    const [c, r] = k.split(',').map(Number);
    if(R() < 0.25){ const sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => at(c + dc, r + dr) === a ? 0 : 1), n = sd[0] + sd[1] + sd[2] + sd[3]; palisades.set(k, n === 2 ? ((sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2) ? '2s' : '2c') : String(n)); }
    else if(R() < 0.2){
      const p = pieces[a], cp = { n: null, e: null, s: null, w: null };
      for(const d of ['n', 'e', 's', 'w']) if(R() < 0.5) cp[d] = p.filter(([x, y]) => d === 'n' ? y < r : d === 's' ? y > r : d === 'e' ? x > c : x < c).length;
      compasses.set(k, cp);
    }
  }
  const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades, compasses, watchtowers: new Map() }), bank: P0.bank, rules };
  let ctx; try { ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, { maxRegions: null, maxRegionSize: null }, []); } catch(e){ continue; }
  ran++; let sol = 0, solOk = true, budget = false, early = false;
  try {
    for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), PAGE)){
      if(ev.type === 'impossible-early'){ early = true; bad++; console.log('IMPOSSIBLE seed', seed, ev.why, JSON.stringify(rules)); break; }
      if(ev.type === 'budget-exceeded' || ev.type === 'timeout') budget = true;
      if(ev.type === 'solution'){
        sol++;
        const o2 = new Map(); ev.pieces.forEach((p, k) => (p.cells || p).forEach(q => { const [x, y] = Array.isArray(q) ? q : [q.x, q.y]; o2.set(x + ',' + y, k); }));
        let same = true; for(const [k, a] of own) for(const [k2, b] of own) if(k < k2 && (a === b) !== (o2.get(k) === o2.get(k2))){ same = false; break; }
        if(!same) solOk = false;
      }
      if(ev.type !== 'deduce' || ev.via === 'search') continue;
      const m = /^([vh]):(\d+),(\d+)$/.exec(ev.spot.key); const c = +m[2], r = +m[3];
      const a = at(c, r), b = m[1] === 'v' ? at(c + 1, r) : at(c, r + 1); if(a === undefined || b === undefined) continue;
      checked++;
      if(ev.value !== (a === b ? 'same' : 'wall')){ bad++; console.log('WRONG seed', seed, ev.spot.key, ev.value, ev.rule, ev.via, JSON.stringify(rules)); break; }
    }
  } catch(e){ bad++; console.log('CRASH seed', seed, e.message); }
  dist[Math.min(sol, 2)]++;
  if(sol === 0 && !budget && !early){ bad++; console.log('NO SOLUTION FOUND (the planted one is valid) seed', seed, JSON.stringify(rules)); }
  if(sol === 1){ unique++; if(!solOk){ bad++; console.log('UNIQUE BUT NOT THE PLANTED TILING seed', seed, JSON.stringify(rules)); } }
}
console.log(`fuzz_planted120: ${ran} planted boards (solutions 0/1/2+: ${dist.join('/')}), deductions checked ${checked}, rules used ${JSON.stringify(ruleUse)}, wrong ${bad}`);
process.exit(bad ? 1 : 0);
