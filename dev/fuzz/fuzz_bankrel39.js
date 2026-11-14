// v39: shape bank + walls that compare sizes (lt / gt / diffN / gemini / delta).   node fuzz_bankrel39.js [N=400] [seed=1] [maxSide=7]
// PLANTED puzzles whose bank holds exactly the shapes of the planted tiling (so the bank sizes are usually NOT consecutive: {1,3}, {2,4}, {3,9} ...).
// For each puzzle: (1) the exact solver (solvePuzzle) must find the planted tiling among its solutions, (2) deduceSolve must never contradict the planted
// tiling (no impossible-early, every deduce event agrees). Runs the v39 core and the v38 core: v39 must have 0 failures; the v38 count shows the fuzz sees BUG 1.
const L = require('../fuzzlib.js'), S39 = require('../reference/solver-core.v103.js'), S38 = require('../reference/solver-core.v103.js');
const N = +process.argv[2] || 400, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 7;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pieceKey = cells => cells.map(([c, r]) => `${c},${r}`).sort().join(';');
function check(S, P){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null), se = L.collectSpecialEdges(P.puzzle.walls);
  const want = P.planted.map(pieceKey).sort().join('|');
  // (1a) the unpinned exact search finds at least one tiling (a false "no solution" is BUG 1's symptom)
  let nsol = 0;
  for(const ev of S.solvePuzzle(P.puzzle.w, P.puzzle.h, ctx, se, 300000)){
    if(ev.type === 'solution'){ nsol++; break; }
    else if(ev.type === 'budget-exceeded') return { skip: true };
  }
  if(!nsol) return { bad: 'exact solver finds no tiling at all' };
  // (1b) with the planted tiling pinned edge by edge the exact search must accept it
  const { w, h } = P.puzzle, pid = Array.from({ length: h }, () => Array(w).fill(-1)); P.planted.forEach((cells, i) => cells.forEach(([c, r]) => { pid[r][c] = i; }));
  const extra = new Set(), links = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(pid[r][c] < 0) continue;
    if(c + 1 < w && pid[r][c + 1] >= 0){ if(pid[r][c] === pid[r][c + 1]) links.push([c, r, c + 1, r]); else extra.add(`v:${c},${r}`); }
    if(r + 1 < h && pid[r + 1][c] >= 0){ if(pid[r][c] === pid[r + 1][c]) links.push([c, r, c, r + 1]); else extra.add(`h:${c},${r}`); }
  }
  let pinned = 0;
  for(const ev of S.solvePuzzle(w, h, ctx, se, 300000, { extraWalls: extra, links })){ if(ev.type === 'solution') pinned++; if(pinned) break; }
  if(!pinned) return { bad: 'the planted tiling, pinned, is rejected' };
  const pm = Array.from({ length: P.puzzle.h }, () => Array(P.puzzle.w).fill(-1)); P.planted.forEach((cells, i) => cells.forEach(([c, r]) => { pm[r][c] = i; }));
  const ctx2 = S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx2, se, { testNodes: 30, stopAtTwo: true, nodeBudget: 300000 })){
    if(ev.type === 'impossible-early') return { bad: 'deduceSolve says impossible: ' + ev.reason };
    if(ev.type === 'deduce' && ev.value !== (pm[ev.spot.r1][ev.spot.c1] === pm[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall')) return { bad: 'deduce contradicts the planted tiling (' + ev.rule + ')' };
    if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
  }
  return { ok: true };
}
let made = 0, skipped = 0, bad39 = 0, bad38 = 0, nonConsec = 0; const msgs = [];
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed);
  const P = L.plantedPuzzle(seed, { maxW: maxSide - 2, maxH: maxSide - 2, rich: true, bankP: 1, clueP: R() < 0.5 ? 0.05 + R() * 0.2 : 0.3, wallP: 0.7, maxPiece: 3 + Math.floor(R() * 5), holes: 0.04 });
  // the bank must hold every shape of the planted tiling (the generator sometimes drops one) and only walls that compare sizes are interesting
  const keys = new Set(P.bank.map(b => S39.canonicalShapeKey(b.cells)));
  if(!P.planted.every(c => keys.has(S39.canonicalShapeKey(c)))){ skipped++; continue; }
  let rel = 0; for(const t of P.puzzle.walls.values()) if(t === 'lt' || t === 'gt' || t.startsWith('diff')) rel++;
  if(!rel){ skipped++; continue; }
  const sizes = [...new Set(P.bank.map(b => b.cells.length))].sort((a, b) => a - b);
  if(sizes.some((s, j) => j && s - sizes[j - 1] > 1)) nonConsec++;
  made++;
  const r39 = check(S39, P); if(r39.skip){ skipped++; made--; continue; }
  const r38 = check(S38, P);
  if(r39.bad){ bad39++; if(msgs.length < 8) msgs.push(`v39 seed ${seed}: ${r39.bad}`); }
  if(r38.bad) bad38++;
}
console.log(`puzzles ${made} (bank sizes not consecutive in ${nonConsec}), skipped ${skipped} | failures: v39 = ${bad39}, v38 = ${bad38}`);
for(const m of msgs) console.log(m);
process.exitCode = bad39 ? 1 : 0;
