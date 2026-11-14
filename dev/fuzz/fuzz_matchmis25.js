// Soundness + strength of the v25 Match / Mismatch deduction.   node fuzz_matchmis25.js [N=300] [seed=1] [maxSide=6]
// PLANTED puzzles: Match = a tiling by copies of ONE random polyomino; Mismatch = a tiling whose pieces all have different shapes;
// with stamps, area numbers, roses, a bank (the planted shapes + decoys), size rules, fixed walls.
//   1. every deduce event agrees with the planted tiling (three option sets)
//   2. verdict equals the brute-force oracle on small boards -- also for MUTANTS (planted puzzle with a clue/rule changed: often impossible)
//   3. strength: edges decided before any search, v24 core vs v25 core
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const S25 = require('../reference/solver-core.v103.js'), S24 = require('../reference/solver-core.v103.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 6;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
function randomShape(R, n){                                        // a random connected shape of n cells
  const cells = [[0, 0]], have = new Set(['0,0']);
  while(cells.length < n){ const [x, y] = cells[Math.floor(R() * cells.length)], [dx, dy] = DIRS[Math.floor(R() * 4)], k = (x + dx) + ',' + (y + dy); if(!have.has(k)){ have.add(k); cells.push([x + dx, y + dy]); } }
  return S25.normalizeCells(cells);
}
function tileWith(R, w, h, active, X){                              // exact cover of the active tiles by copies of X (random backtracking), or null
  const ors = S25.shapeOrientations(X), pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [];
  let steps = 0;
  function go(){
    if(++steps > 20000) return false;
    let c0 = -1, r0 = -1;
    outer: for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c] && pieceOf[r][c] === -1){ c0 = c; r0 = r; break outer; }
    if(c0 < 0) return true;
    const opts = [];
    for(const ori of ors) for(const [sx, sy] of ori) {
      const cells = ori.map(([x, y]) => [x - sx + c0, y - sy + r0]);
      if(cells.every(([c, r]) => c >= 0 && r >= 0 && c < w && r < h && active[r][c] && pieceOf[r][c] === -1)) opts.push(cells);
    }
    for(let i = opts.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    for(const cells of opts){
      const id = pieces.length; pieces.push(cells); for(const [c, r] of cells) pieceOf[r][c] = id;
      if(go()) return true;
      pieces.pop(); for(const [c, r] of cells) pieceOf[r][c] = -1;
    }
    return false;
  }
  return go() ? { pieces, pieceOf } : null;
}
function growTiling(R, w, h, active, sizes){                        // random tiling into pieces of the given sizes
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
const norm = cells => { const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); return cells.map(([x, y]) => [x - mx, y - my]); };
function planted(seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  for(let attempt = 0; attempt < 600; attempt++){
    const w = 2 + pick(maxSide - 1), h = 2 + pick(maxSide - 1);
    const active = Array.from({ length: h }, () => Array(w).fill(1));
    const holeP = R() < 0.35 ? 0.06 : 0;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < holeP) active[r][c] = 0;
    const mode = pick(14) === 0 ? 5 : pick(5);                // 0,1 match; 2,3,4 mismatch; 5 both (one piece)
    const wantMatch = mode < 2 || mode === 5, wantMis = mode >= 2;
    let t;
    if(mode === 5){ t = growTiling(R, w, h, active, [w * h]); if(t.pieces.length !== 1) continue; }
    else if(wantMatch){ t = tileWith(R, w, h, active, randomShape(R, 2 + pick(4))); if(!t) continue; }
    else {
      t = growTiling(R, w, h, active, R() < 0.5 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]);
      const keys = t.pieces.map(p => S25.canonicalShapeKey(p)); if(new Set(keys).size !== keys.length) continue;
    }
    const { pieces, pieceOf } = t, keys = pieces.map(p => S25.canonicalShapeKey(p));
    if(pieces.length < 1) continue;
    const walls = new Map(), wallP = R() < 0.5 ? 0 : 0.3;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
      if(!active[r][c]) continue;
      if(c + 1 < w && active[r][c + 1] && pieceOf[r][c] !== pieceOf[r][c + 1] && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
      if(r + 1 < h && active[r + 1][c] && pieceOf[r][c] !== pieceOf[r + 1][c] && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
    }
    const polyominoes = new Map(), areaNumbers = new Map(), roses = new Map(), stampP = R() < 0.6 ? 0.1 + R() * 0.5 : 0, areaP = R() < 0.5 ? 0.35 : 0;
    let roseTypes = R() < 0.2 ? 1 + pick(2) : 0;
    if(pieces.some(p => p.length < roseTypes + 1)) roseTypes = 0;
    pieces.forEach(cells => {
      const free = cells.slice().sort(() => R() - 0.5), used = new Set();
      for(let ty = 1; ty <= roseTypes; ty++){ const q = free.find(([c, r]) => !used.has(c + ',' + r)); if(q){ roses.set(q[0] + ',' + q[1], ty); used.add(q[0] + ',' + q[1]); } }
      const spare = cells.filter(([c, r]) => !used.has(c + ',' + r));
      if(!spare.length) return;
      const [c, r] = spare[pick(spare.length)];
      if(R() < stampP) polyominoes.set(`${c},${r}`, { cells: norm(cells), canonicalKey: S25.canonicalShapeKey(cells) });
      else if(R() < areaP) areaNumbers.set(`${c},${r}`, cells.length);
    });
    const rules = { precision: null, min: null, max: null, mismatch: wantMis, match: wantMatch, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
    const sizes = pieces.map(p => p.length), mn = Math.min(...sizes), mx = Math.max(...sizes), rp = pick(6);
    if(rp === 0) rules.min = mn; else if(rp === 1) rules.max = mx; else if(rp === 2){ rules.min = mn; rules.max = mx; } else if(rp === 3 && mn === mx) rules.precision = mn;
    if(pieces.every(p => S25.isRectangular(p)) && R() < 0.3) rules.boxy = true;
    else if(pieces.every(p => !S25.isRectangular(p)) && R() < 0.3) rules.nonBoxy = true;
    const bank = [];
    if(R() < 0.5){
      const seen = new Set();
      pieces.forEach((cells, i) => { if(seen.has(keys[i])) return; seen.add(keys[i]); bank.push({ id: bank.length + 1, cells: norm(cells) }); });
      for(let d = pick(3); d > 0; d--){ const sh = randomShape(R, 1 + pick(5)), k = S25.canonicalShapeKey(sh); if(!seen.has(k)){ seen.add(k); bank.push({ id: bank.length + 1, cells: sh }); } }
    }
    return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules, pieceOf, pieces };
  }
  return null;
}
function mutant(P, seed){                                                   // change one thing: the result may or may not still be solvable
  const R = rng(seed), pick = n => Math.floor(R() * n);
  const Q = { puzzle: { w: P.puzzle.w, h: P.puzzle.h, active: P.puzzle.active.map(r => r.slice()), walls: new Map(P.puzzle.walls), roses: new Map(P.puzzle.roses), polyominoes: new Map(P.puzzle.polyominoes), areaNumbers: new Map(P.puzzle.areaNumbers) }, bank: P.bank.slice(), rules: Object.assign({}, P.rules) };
  const cellsAll = []; for(let r = 0; r < Q.puzzle.h; r++) for(let c = 0; c < Q.puzzle.w; c++) if(Q.puzzle.active[r][c]) cellsAll.push([c, r]);
  const m = pick(8);
  if(m === 0){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.areaNumbers.set(`${c},${r}`, 1 + pick(5)); }
  else if(m === 1){ const [c, r] = cellsAll[pick(cellsAll.length)]; const sh = randomShape(R, 1 + pick(4)); Q.puzzle.polyominoes.set(`${c},${r}`, { cells: sh, canonicalKey: S25.canonicalShapeKey(sh) }); }
  else if(m === 2){ Q.rules.match = !Q.rules.match; }
  else if(m === 3){ Q.rules.mismatch = !Q.rules.mismatch; }
  else if(m === 4){ Q.rules.min = 1 + pick(3); Q.rules.max = Q.rules.min + pick(3); Q.rules.precision = null; }
  else if(m === 5){ Q.rules.precision = 1 + pick(5); }
  else if(m === 6){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.active[r][c] = 0; }
  else { Q.bank = Q.bank.slice(0, Math.max(0, Q.bank.length - 1)); }
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
let bad = 0, made = 0, checked = 0, oracleN = 0, mutN = 0, mutImp = 0, d24 = 0, d25 = 0, spots = 0, fewer = 0; const ruleCount = {}, modeCount = { match: 0, mismatch: 0, both: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, P = planted(seed); if(!P) continue; made++;
  modeCount[P.rules.match && P.rules.mismatch ? 'both' : P.rules.match ? 'match' : 'mismatch']++;
  const sameP = (a, b) => P.pieceOf[a[1]][a[0]] === P.pieceOf[b[1]][b[0]];
  for(const [oi, op] of optSets.entries()){
    const ctx = S25.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S25.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
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
  for(let k = 0; k < 3; k++){ const Q = mutant(P, seed * 10 + k); mutN++; const n = check(Q, 'mutant' + k); if(n === 0) mutImp++; }
  const a = untilSearch(S24, P), b = untilSearch(S25, P);
  d24 += a.n; d25 += b.n; spots += b.total;
  if(b.n < a.n){ fewer++; if(fewer < 6) console.log('note: v25 decides FEWER edges than v24 before search, seed', seed, a.n, b.n); }
}
console.log(`match/mismatch fuzz: planted ${made}/${N} (${JSON.stringify(modeCount)}), deductions checked ${checked}, oracle-checked ${oracleN} (mutants ${mutN}, impossible ${mutImp}), problems ${bad}`);
console.log(`edges decided before any search: v24 ${d24} / v25 ${d25} of ${spots} open edges; puzzles where v25 decided fewer: ${fewer}`);
console.log('by rule (first option set):', JSON.stringify(ruleCount));
process.exit(bad ? 1 : 0);
