// Soundness + strength of the v28 facts for the walls that compare sizes (chain budget, pair budget, parity).   node fuzz_rel28.js [N=300] [seed=1] [maxSide=6]
// PLANTED puzzles (fuzzlib.plantedPuzzle: area numbers on many pieces, stamps, relation walls lt / gt / diffN / gemini / delta, roses, size rules, bank):
//   1. every deduce event agrees with the planted tiling (three option sets)
//   2. verdict equals the brute-force oracle on small boards, also for MUTANTS (an area number / rule / wall changed: often impossible)
//   3. strength: edges decided before any search, v27 core vs v28 core
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const S27 = require('../reference/solver-core.v103.js'), S26 = require('../reference/solver-core.v103.js');   // (names kept: S27 = the new core, S26 = the one before)
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 6;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function pieceOfMap(P){ const m = Array.from({ length: P.puzzle.h }, () => Array(P.puzzle.w).fill(-1)); P.planted.forEach((cells, i) => cells.forEach(([c, r]) => { m[r][c] = i; })); return m; }
function mutant(P, seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  const Q = { puzzle: { w: P.puzzle.w, h: P.puzzle.h, active: P.puzzle.active.map(r => r.slice()), walls: new Map(P.puzzle.walls), roses: new Map(P.puzzle.roses), polyominoes: new Map(P.puzzle.polyominoes), areaNumbers: new Map(P.puzzle.areaNumbers) }, bank: P.bank.slice(), rules: Object.assign({}, P.rules) };
  const cells = []; for(let r = 0; r < Q.puzzle.h; r++) for(let c = 0; c < Q.puzzle.w; c++) if(Q.puzzle.active[r][c]) cells.push([c, r]);
  const m = pick(8), [c, r] = cells[pick(cells.length)];
  if(m === 0) Q.puzzle.areaNumbers.set(`${c},${r}`, 1 + pick(6));
  else if(m === 1){ const k = [...Q.puzzle.areaNumbers.keys()]; if(k.length) Q.puzzle.areaNumbers.set(k[pick(k.length)], 1 + pick(6)); else Q.puzzle.areaNumbers.set(`${c},${r}`, 2); }
  else if(m === 2){ Q.rules.min = 1 + pick(4); Q.rules.precision = null; }
  else if(m === 3){ Q.rules.max = 2 + pick(4); Q.rules.precision = null; }
  else if(m === 4){ const k = [...Q.puzzle.walls.keys()]; if(k.length) Q.puzzle.walls.delete(k[pick(k.length)]); else Q.puzzle.areaNumbers.set(`${c},${r}`, 3); }
  else if(m === 5){ Q.puzzle.areaNumbers.set(`${c},${r}`, 1 + pick(3)); Q.puzzle.areaNumbers.set(`${cells[pick(cells.length)].join(',')}`, 1 + pick(3)); }
  else {                                                   // a wall that compares sizes changes its relation
    const k = [...Q.puzzle.walls.keys()].filter(x => Q.puzzle.walls.get(x) !== 'wall'); const kinds = ['lt', 'gt', 'diff0', 'diff1', 'diff2', 'diff3', 'gemini'];
    if(k.length) Q.puzzle.walls.set(k[pick(k.length)], kinds[pick(kinds.length)]); else Q.puzzle.areaNumbers.set(`${c},${r}`, 2);
  }
  return Q;
}
const optSets = [ { testNodes: 15, restart: 'first', order: 'scan', useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' }, { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' } ];
function untilSearch(S, P){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null); let n = 0, total = 0; const byRule = {};
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, stopAtTwo: true })){
    if(ev.type === 'plan') total = ev.spots;
    if(ev.type === 'deduce'){ n++; byRule[ev.rule] = (byRule[ev.rule] || 0) + 1; }
    if(ev.type === 'impossible-early' || ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break;
  }
  return { n, total, byRule };
}
let skipped = 0, bad = 0, made = 0, checked = 0, oracleN = 0, mutN = 0, mutImp = 0, d26 = 0, d27 = 0, spots = 0, fewer = 0; const ruleCount = {};
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed);
  const P = L.plantedPuzzle(seed, { maxW: maxSide - 2, maxH: maxSide - 2, rich: true, clueP: R() < 0.5 ? 0.1 + R() * 0.3 : 0.35 + R() * 0.6, wallP: R() < 0.3 ? 0.2 : 0.6, maxPiece: 3 + Math.floor(R() * 4), bank: R() < 0.3 });
  // the generator sometimes builds a puzzle that is not valid for its own tiling (bank without a shape, rose + stamp clashes ...): v26 already says so, skip those
  { const c26 = S26.buildSolverContext(P.puzzle, P.bank, P.rules, null); let imp = false;
    for(const ev of S26.deduceSolve(P.puzzle.w, P.puzzle.h, c26, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1 })){ if(ev.type === 'impossible-early'){ imp = true; break; } if(ev.type === 'testing') break; }
    if(!imp){                                   // ... or the previous core already disagrees with the planted tiling (any option set: a few generated puzzles are not valid for their own tiling)
      const pm0 = pieceOfMap(P);
      for(const op0 of optSets){
        const c0 = S26.buildSolverContext(P.puzzle, P.bank, P.rules, null);
        for(const ev of S26.deduceSolve(P.puzzle.w, P.puzzle.h, c0, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op0))){
          if(ev.type === 'impossible-early'){ imp = true; break; }
          if(ev.type === 'deduce' && ev.value !== (pm0[ev.spot.r1][ev.spot.c1] === pm0[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall')){ imp = true; break; }
          if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
        }
        if(imp) break;
      }
    }
    if(imp){ skipped++; continue; } }
  made++;
  const pm = pieceOfMap(P);
  for(const [oi, op] of optSets.entries()){
    const ctx = S27.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S27.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on planted puzzle, seed', seed, 'optset', oi, ev.reason); break; }
      if(ev.type === 'deduce'){
        checked++;
        const truth = pm[ev.spot.r1][ev.spot.c1] === pm[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall';
        if(ev.value !== truth){ bad++; if(bad < 9) console.log('WRONG', ev.rule, ev.source, 'seed', seed, 'optset', oi, JSON.stringify(ev.spot), ev.value, 'planted says', truth); }
        if(oi === 0) ruleCount[ev.rule] = (ruleCount[ev.rule] || 0) + 1;
      }
      if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
    }
  }
  const check = (Q, label) => {
    if(Q.puzzle.w * Q.puzzle.h > 16) return;
    const truth = O.oracle(Q, 3); if(truth === null) return;
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
  const a = untilSearch(S26, P), b = untilSearch(S27, P);
  d26 += a.n; d27 += b.n; spots += b.total;
  if(b.n < a.n){ fewer++; if(fewer < 6) console.log('note: v28 decides FEWER edges than v27 before search, seed', seed, a.n, b.n); }
}
console.log(`rel fuzz: planted ${made} (skipped ${skipped} invalid), deductions checked ${checked}, oracle-checked ${oracleN} (mutants ${mutN}, impossible ${mutImp}), problems ${bad}`);
console.log(`edges decided before any search: v27 ${d26} / v28 ${d27} of ${spots} open edges; puzzles where v28 decided fewer: ${fewer}`);
console.log('by rule (first option set):', JSON.stringify(ruleCount));
process.exit(bad ? 1 : 0);
