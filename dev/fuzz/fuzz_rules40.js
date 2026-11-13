// Soundness of the v40 deductions on PLANTED puzzles (area numbers, stamps, relation walls, roses, size rules, bank, rules):
// every 'deduce' event of the page's pipeline must agree with the planted tiling, no 'impossible-early' on a satisfiable puzzle.
// Also reports how often area-sum / bridge-count fired, so a silent rule is visible.   node fuzz_rules40.js [N=400] [seed=1] [maxSide=7]
const L = require('../fuzzlib.js'), S = L.S, S39 = require('../reference/solver-core.v100.js');       // v39 = the filter: the generator sometimes builds a puzzle that is not valid for its own tiling
const N = +process.argv[2] || 400, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 7;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function pieceOfMap(P){ const m = Array.from({ length: P.puzzle.h }, () => Array(P.puzzle.w).fill(-1)); P.planted.forEach((cells, i) => cells.forEach(([c, r]) => { m[r][c] = i; })); return m; }
const optSets = [{ stopAtTwo: true }, { stopAtTwo: true, areaSumSlack: 99 }];
let made = 0, checked = 0, bad = 0, skipped = 0; const fired = {};
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed);
  const P = L.plantedPuzzle(seed, { maxW: maxSide - 1, maxH: maxSide - 1, rich: R() < 0.7, clueP: 0.3 + R() * 0.6, wallP: R() < 0.5 ? 0.1 : 0.45, maxPiece: 3 + Math.floor(R() * 6), bank: R() < 0.25 });
  const pm = pieceOfMap(P);
  { let imp = false; const c0 = S39.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S39.deduceSolve(P.puzzle.w, P.puzzle.h, c0, L.collectSpecialEdges(P.puzzle.walls), { stopAtTwo: true, nodeBudget: 200000 })){
      if(ev.type === 'impossible-early'){ imp = true; break; }
      if(ev.type === 'deduce' && ev.value !== (pm[ev.spot.r1][ev.spot.c1] === pm[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall')){ imp = true; break; }
      if(ev.type === 'stage' || ev.type === 'solution' || ev.type === 'budget-exceeded') break; }
    if(imp){ skipped++; continue; } }
  made++;
  for(const [oi, op] of optSets.entries()){
    const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ nodeBudget: 200000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on a planted puzzle, seed', seed, 'optset', oi, ev.reason); break; }
      if(ev.type === 'deduce'){
        checked++;
        const truth = pm[ev.spot.r1][ev.spot.c1] === pm[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall';
        if(oi === 0 && (ev.rule === 'area-sum' || ev.rule === 'bridge-count')) fired[ev.rule] = (fired[ev.rule] || 0) + 1;
        if(ev.value !== truth){ bad++; if(bad < 9) console.log('WRONG', ev.rule, 'seed', seed, 'optset', oi, JSON.stringify(ev.spot), ev.value, 'planted says', truth); }
      }
      if(ev.type === 'stage' || ev.type === 'solution' || ev.type === 'budget-exceeded') break;   // deductions only (the search is fuzz_edge40.js)
    }
  }
}
console.log(`planted puzzles ${made} (skipped ${skipped} invalid generator outputs), deduce events checked ${checked}, new rules fired ${JSON.stringify(fired)}, WRONG/IMPOSSIBLE ${bad}`);
process.exit(bad ? 1 : 0);
