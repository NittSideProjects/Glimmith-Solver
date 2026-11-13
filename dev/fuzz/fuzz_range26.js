// Soundness + strength of the v26 Minimum / Maximum / Range deduction.   node fuzz_range26.js [N=300] [seed=1] [maxSide=6]
// PLANTED puzzles: a random tiling (piece sizes in a random band), with size rules min / max / both / loose / precision (also looser than the planted
// band), stamps, area numbers, roses, a bank, other boolean rules, fixed walls.
//   1. every deduce event agrees with the planted tiling (three option sets)
//   2. verdict equals the brute-force oracle on small boards -- also for MUTANTS (rule values / clues changed: often impossible)
//   3. strength: edges decided before any search, v25 core vs v26 core
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const S26 = require('../reference/solver-core.v100.js'), S25 = require('../reference/solver-core.v100.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 6;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
const norm = cells => { const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); return cells.map(([x, y]) => [x - mx, y - my]); };
function growTiling(R, w, h, active, sizes){
  const pick = n => Math.floor(R() * n), pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [], order = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) order.push([c, r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id;
    const target = sizes[pick(sizes.length)];
    while(cells.length < target){
      const cand = [];
      for(const [c, r] of cells) for(const [dc, dr] of DIRS){ const nc = c + dc, nr = r + dr; if(nc >= 0 && nr >= 0 && nc < w && nr < h && active[nr][nc] && pieceOf[nr][nc] === -1) cand.push([nc, nr]); }
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
    const w = 2 + pick(maxSide - 1), h = 2 + pick(maxSide - 1);
    const active = Array.from({ length: h }, () => Array(w).fill(1));
    const holeP = R() < 0.3 ? 0.08 : 0;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < holeP) active[r][c] = 0;
    const a = 1 + pick(4), b = a + pick(4), sizes = []; for(let k = a; k <= b; k++) sizes.push(k);
    const { pieces, pieceOf } = growTiling(R, w, h, active, sizes);
    if(pieces.length < 1) continue;
    const walls = new Map(), wallP = R() < 0.5 ? 0 : 0.3;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
      if(!active[r][c]) continue;
      if(c + 1 < w && active[r][c + 1] && pieceOf[r][c] !== pieceOf[r][c + 1] && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
      if(r + 1 < h && active[r + 1][c] && pieceOf[r][c] !== pieceOf[r + 1][c] && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
    }
    const polyominoes = new Map(), areaNumbers = new Map(), roses = new Map(), stampP = R() < 0.3 ? 0.3 : 0, areaP = R() < 0.4 ? 0.3 : 0;
    let roseTypes = R() < 0.12 ? 1 : 0; if(pieces.some(p => p.length < roseTypes + 1)) roseTypes = 0;
    pieces.forEach(cells => {
      const free = cells.slice().sort(() => R() - 0.5), used = new Set();
      for(let ty = 1; ty <= roseTypes; ty++){ const q = free.find(([c, r]) => !used.has(c + ',' + r)); if(q){ roses.set(q[0] + ',' + q[1], ty); used.add(q[0] + ',' + q[1]); } }
      const spare = cells.filter(([c, r]) => !used.has(c + ',' + r));
      if(!spare.length) return;
      const [c, r] = spare[pick(spare.length)];
      if(R() < stampP) polyominoes.set(`${c},${r}`, { cells: norm(cells), canonicalKey: S26.canonicalShapeKey(cells) });
      else if(R() < areaP) areaNumbers.set(`${c},${r}`, cells.length);
    });
    const sz = pieces.map(p => p.length), mn = Math.min(...sz), mx = Math.max(...sz);
    const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
    const kind = pick(7), looseLo = Math.max(1, mn - pick(2)), looseHi = mx + pick(2);
    if(kind === 0) rules.min = mn; else if(kind === 1) rules.max = mx; else if(kind === 2 || kind === 3){ rules.min = mn; rules.max = mx; }
    else if(kind === 4){ rules.min = looseLo; rules.max = looseHi; } else if(kind === 5){ rules.min = mn; } else if(mn === mx) rules.precision = mn; else { rules.min = mn; rules.max = mx; }
    if(R() < 0.1 && new Set(sz).size === pieces.length) rules.mismatch = true;
    if(R() < 0.1) rules.mingleArea = pieces.every((p, i) => true) && (() => { for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){ if(!active[r][c]) continue; for(const [dc, dr] of [[1,0],[0,1]]){ const nc = c + dc, nr = r + dr; if(nc < w && nr < h && active[nr][nc] && pieceOf[r][c] !== pieceOf[nr][nc] && pieces[pieceOf[r][c]].length === pieces[pieceOf[nr][nc]].length) return false; } } return true; })();
    if(rules.precision == null && (rules.min == null || rules.min <= 1) && (rules.max == null || rules.max >= Math.max(w, h) * 2)) continue;   // no effective size rule: nothing to test here (and such puzzles can be very slow, v25 alike)
    const bank = [];
    if(R() < 0.25){ const seen = new Set(); pieces.forEach(cells => { const k = S26.canonicalShapeKey(cells); if(seen.has(k)) return; seen.add(k); bank.push({ id: bank.length + 1, cells: norm(cells) }); }); }
    return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules, pieceOf, pieces };
  }
  return null;
}
function mutant(P, seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  const Q = { puzzle: { w: P.puzzle.w, h: P.puzzle.h, active: P.puzzle.active.map(r => r.slice()), walls: new Map(P.puzzle.walls), roses: new Map(P.puzzle.roses), polyominoes: new Map(P.puzzle.polyominoes), areaNumbers: new Map(P.puzzle.areaNumbers) }, bank: P.bank.slice(), rules: Object.assign({}, P.rules) };
  const cellsAll = []; for(let r = 0; r < Q.puzzle.h; r++) for(let c = 0; c < Q.puzzle.w; c++) if(Q.puzzle.active[r][c]) cellsAll.push([c, r]);
  const m = pick(7);
  if(m === 0){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.areaNumbers.set(`${c},${r}`, 1 + pick(5)); }
  else if(m === 1){ Q.rules.min = 1 + pick(5); Q.rules.precision = null; }
  else if(m === 2){ Q.rules.max = 1 + pick(5); Q.rules.precision = null; }
  else if(m === 3){ Q.rules.min = 2 + pick(4); Q.rules.max = Q.rules.min + pick(3); Q.rules.precision = null; }
  else if(m === 4){ Q.rules.precision = 1 + pick(5); }
  else if(m === 5){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.active[r][c] = 0; }
  else { const k = [...Q.puzzle.walls.keys()]; if(k.length) Q.puzzle.walls.delete(k[pick(k.length)]); else { const [c, r] = cellsAll[pick(cellsAll.length)]; if(c + 1 < Q.puzzle.w && Q.puzzle.active[r][c + 1]) Q.puzzle.walls.set(`v:${c},${r}`, 'wall'); } }
  return Q;
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
let bad = 0, made = 0, checked = 0, oracleN = 0, mutN = 0, mutImp = 0, d25 = 0, d26 = 0, spots = 0, fewer = 0; const ruleCount = {}, kinds = { min: 0, max: 0, range: 0, precision: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, P = planted(seed); if(!P) continue; made++;
  kinds[P.rules.precision != null ? 'precision' : P.rules.min != null && P.rules.max != null ? 'range' : P.rules.min != null ? 'min' : 'max']++;
  const sameP = (a, b) => P.pieceOf[a[1]][a[0]] === P.pieceOf[b[1]][b[0]];
  for(const [oi, op] of optSets.entries()){
    const ctx = S26.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S26.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
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
  const check = (Q, label) => {
    if(Q.puzzle.w * Q.puzzle.h > 16) return;
    const truth = O.oracle(Q, 3);
    if(truth === null) return;
    oracleN++;
    for(const [name, f] of [['deduce', () => L.deduce(Q, optSets[1], 2, 200000)], ['exact', () => L.exact(Q, 2, 200000)]]){
      const r = f();
      if(!r.exceeded && r.sols.length !== Math.min(truth.length, 2)){ bad++; console.log('VERDICT mismatch', label, name, 'seed', seed, 'oracle', truth.length, 'got', r.sols.length); }
    }
    return truth.length;
  };
  const tl = check(P, 'planted');
  if(tl !== undefined && tl < 1){ bad++; console.log('planted has no oracle solution, seed', seed); }
  for(let k = 0; k < 4; k++){ const Q = mutant(P, seed * 10 + k); mutN++; const n = check(Q, 'mutant' + k); if(n === 0) mutImp++; }
  const a = untilSearch(S25, P), b = untilSearch(S26, P);
  d25 += a.n; d26 += b.n; spots += b.total;
  if(b.n < a.n){ fewer++; if(fewer < 6) console.log('note: v26 decides FEWER edges than v25 before search, seed', seed, a.n, b.n); }
}
console.log(`range fuzz: planted ${made}/${N} (${JSON.stringify(kinds)}), deductions checked ${checked}, oracle-checked ${oracleN} (mutants ${mutN}, impossible ${mutImp}), problems ${bad}`);
console.log(`edges decided before any search: v25 ${d25} / v26 ${d26} of ${spots} open edges; puzzles where v26 decided fewer: ${fewer}`);
console.log('by rule (first option set):', JSON.stringify(ruleCount));
process.exit(bad ? 1 : 0);
