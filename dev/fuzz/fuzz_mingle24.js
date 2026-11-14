// Soundness + strength of the v24 Mingle Area / Mingle Shape deduction.   node fuzz_mingle24.js [N=300] [seed=1] [maxSide=6]
// PLANTED puzzles: a random tiling whose neighbouring pieces really differ in size (mingleArea) and/or shape (mingleShape);
// sometimes only two sizes/shapes are used (alternation), with stamps, area numbers, a bank of the planted shapes, size rules.
//   1. every deduce event agrees with the planted tiling (three option sets)   2. verdict equals the brute-force oracle on small boards
//   3. strength: edges decided before any search, v23 core vs v24 core
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const S24 = require('../reference/solver-core.v103.js'), S23 = require('../reference/solver-core.v103.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 6;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function tiling(R, w, h, active, sizes){
  const pick = n => Math.floor(R() * n), pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [], order = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) order.push([c, r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id;
    const target = sizes[pick(sizes.length)];
    while(cells.length < target){
      const cand = [];
      for(const [c, r] of cells) for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc = c + dc, nr = r + dr; if(nc >= 0 && nr >= 0 && nc < w && nr < h && active[nr][nc] && pieceOf[nr][nc] === -1) cand.push([nc, nr]); }
      if(!cand.length) break;
      const [nc, nr] = cand[pick(cand.length)]; pieceOf[nr][nc] = id; cells.push([nc, nr]);
    }
    pieces.push(cells);
  }
  return { pieces, pieceOf };
}
function planted(seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  for(let attempt = 0; attempt < 400; attempt++){
    const w = 3 + pick(maxSide - 2), h = 3 + pick(maxSide - 2);
    const active = Array.from({ length: h }, () => Array(w).fill(1));
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < 0.04) active[r][c] = 0;
    const mode = pick(3);                                  // 0 area, 1 shape, 2 both
    const sizePool = R() < 0.5 ? [1 + pick(3), 2 + pick(3)] : [1 + pick(2), 2 + pick(2), 3 + pick(3)];
    const { pieces, pieceOf } = tiling(R, w, h, active, sizePool);
    const keys = pieces.map(p => S24.canonicalShapeKey(p)), sizes = pieces.map(p => p.length);
    let okA = true, okS = true;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
      if(!active[r][c]) continue;
      for(const [dc, dr] of [[1,0],[0,1]]){
        const nc = c + dc, nr = r + dr; if(nc >= w || nr >= h || !active[nr][nc]) continue;
        const a = pieceOf[r][c], b = pieceOf[nr][nc]; if(a === b) continue;
        if(sizes[a] === sizes[b]) okA = false; if(keys[a] === keys[b]) okS = false;
      }
    }
    const wantA = mode !== 1, wantS = mode !== 0;
    if((wantA && !okA) || (wantS && !okS)) continue;
    if(pieces.length < 2) continue;
    const walls = new Map();
    const wallP = R() < 0.5 ? 0 : 0.3;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
      if(!active[r][c]) continue;
      if(c + 1 < w && active[r][c + 1] && pieceOf[r][c] !== pieceOf[r][c + 1] && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
      if(r + 1 < h && active[r + 1][c] && pieceOf[r][c] !== pieceOf[r + 1][c] && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
    }
    const polyominoes = new Map(), areaNumbers = new Map(), stampP = R() < 0.6 ? 0.15 + R() * 0.5 : 0, areaP = R() < 0.4 ? 0.3 : 0;
    pieces.forEach(cells => {
      const [c, r] = cells[pick(cells.length)];
      if(R() < stampP){ const mnx = Math.min(...cells.map(q => q[0])), mny = Math.min(...cells.map(q => q[1])); polyominoes.set(`${c},${r}`, { cells: cells.map(([x, y]) => [x - mnx, y - mny]), canonicalKey: S24.canonicalShapeKey(cells) }); }
      else if(R() < areaP) areaNumbers.set(`${c},${r}`, cells.length);
    });
    const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: wantS, mingleArea: wantA, solitude: false, boxy: false, nonBoxy: false };
    const mn = Math.min(...sizes), mx = Math.max(...sizes), rp = pick(5);
    if(rp === 0) rules.min = mn; else if(rp === 1) rules.max = mx; else if(rp === 2){ rules.min = mn; rules.max = mx; }
    if(new Set(keys).size === keys.length && R() < 0.2) rules.mismatch = true;
    if(pieces.every(p => L.isRect ? L.isRect(p) : S24.isRectangular(p)) && R() < 0.3) rules.boxy = true;
    const bank = [];
    if(R() < 0.45){ const seen = new Set(); pieces.forEach((cells, i) => { if(seen.has(keys[i])) return; seen.add(keys[i]); const mnx = Math.min(...cells.map(q => q[0])), mny = Math.min(...cells.map(q => q[1])); bank.push({ id: bank.length + 1, cells: cells.map(([x, y]) => [x - mnx, y - mny]) }); }); }
    return { puzzle: { w, h, active, walls, roses: new Map(), polyominoes, areaNumbers }, bank, rules, pieceOf, pieces };
  }
  return null;
}
function untilSearch(S, P){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
  let n = 0, total = 0; const byRule = {};
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, stopAtTwo: true })){
    if(ev.type === 'plan') total = ev.spots;
    if(ev.type === 'deduce'){ n++; byRule[ev.rule] = (byRule[ev.rule] || 0) + 1; }
    if(ev.type === 'impossible-early' || ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break;
  }
  return { n, total, byRule };
}
const optSets = [ { testNodes: 15, restart: 'first', order: 'scan', useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' }, { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' } ];
let bad = 0, made = 0, checked = 0, oracleN = 0, d23 = 0, d24 = 0, spots = 0; const ruleCount = {};
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, P = planted(seed); if(!P) continue; made++;
  const sameP = (a, b) => P.pieceOf[a[1]][a[0]] === P.pieceOf[b[1]][b[0]];
  for(const [oi, op] of optSets.entries()){
    const ctx = S24.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S24.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on planted puzzle, seed', seed, 'optset', oi, ev.reason); break; }
      if(ev.type === 'deduce'){
        checked++;
        const truth = sameP([ev.spot.c1, ev.spot.r1], [ev.spot.c2, ev.spot.r2]) ? 'same' : 'wall';
        if(ev.value !== truth){ bad++; if(bad < 9) console.log('WRONG', ev.rule, ev.source, 'seed', seed, 'optset', oi, JSON.stringify(ev.spot), ev.value, 'planted says', truth); }
        if(oi === 0) ruleCount[ev.rule] = (ruleCount[ev.rule] || 0) + 1;
      }
      if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
    }
  }
  if(P.puzzle.w * P.puzzle.h <= 16){
    const truth = O.oracle(P, 3);
    if(truth !== null){
      oracleN++;
      if(truth.length < 1){ bad++; console.log('planted has no oracle solution, seed', seed); }
      const r = L.deduce(P, optSets[1], 2, 200000);
      if(!r.exceeded && r.sols.length !== Math.min(truth.length, 2)){ bad++; console.log('VERDICT mismatch seed', seed, 'oracle', truth.length, 'got', r.sols.length); }
    }
  }
  const a = untilSearch(S23, P), b = untilSearch(S24, P);
  d23 += a.n; d24 += b.n; spots += b.total;
  if(b.n < a.n){ bad++; console.log('v24 decides FEWER edges than v23, seed', seed, a.n, b.n); }
}
console.log(`mingle fuzz: planted puzzles ${made}/${N}, deductions checked ${checked}, oracle-checked ${oracleN}, problems ${bad}`);
console.log(`edges decided before any search: v23 ${d23} / v24 ${d24} of ${spots} open edges`);
console.log('by rule (first option set):', JSON.stringify(ruleCount));
process.exit(bad ? 1 : 0);
