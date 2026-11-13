// Directed fuzz for shapes pinned across gemini / delta walls (v29).   node fuzz_gemini29.js [N=400] [seed=1]
// Planted tilings on 4-5 x 3-4 boards: every wall between two planted pieces of the same shape becomes gemini, between different shapes delta (with some
// probability, else plain), one or two stamps copy planted pieces. Then:
//   1. every deduce event (3 option sets) agrees with the planted tiling
//   2. MUTANTS (a stamp changed to another shape, a gemini <-> delta swap): exact search and deduce give the same verdict and the same unique tiling
//   3. strength: edges decided before any search, v28 vs v29 (never fewer)
const L = require('../fuzzlib.js');
const S29 = require('../reference/solver-core.v100.js'), S28 = require('../reference/solver-core.v100.js');
const N = +process.argv[2] || 400, seed0 = +process.argv[3] || 1;
const ck = L.S.canonicalShapeKey;
const optSets = [ { testNodes: 15, restart: 'first', order: 'scan', useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' }, { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' } ];
function untilSearch(S, P){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null); let n = 0;
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, stopAtTwo: true })){
    if(ev.type === 'deduce') n++;
    if(ev.type === 'impossible-early' || ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break;
  }
  return n;
}
let bad = 0, made = 0, checked = 0, gained = 0, gainEdges = 0, fewer = 0, mut = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = L.rng(seed ^ 0x9e3779b9), pick = n => Math.floor(R() * n);
  const P = L.plantedPuzzle(seed, { w: 4 + (i % 2), h: 3 + (i % 3 === 0 ? 1 : 0), rich: false, clueP: 0, wallP: 0.9, maxPiece: 4, bank: false });
  const w = P.puzzle.w, h = P.puzzle.h, pm = Array.from({ length: h }, () => Array(w).fill(-1));
  P.planted.forEach((c, k) => c.forEach(([x, y]) => { pm[y][x] = k; }));
  let rel = 0;
  P.puzzle.walls.forEach((t, k) => {
    const [o, rest] = k.split(':'), [c, r] = rest.split(',').map(Number), [c2, r2] = o === 'v' ? [c + 1, r] : [c, r + 1];
    const a = pm[r][c], b = pm[r2][c2]; if(a === b || R() < 0.15) return;
    P.puzzle.walls.set(k, ck(P.planted[a]) === ck(P.planted[b]) ? 'gemini' : 'delta'); rel++;
  });
  if(!rel) continue;
  P.puzzle.areaNumbers = new Map(); P.puzzle.polyominoes = new Map(); P.puzzle.roses = new Map();
  const stampOf = piece => { const mx = Math.min(...piece.map(q => q[0])), my = Math.min(...piece.map(q => q[1])); return { cells: piece.map(([a, b]) => [a - mx, b - my]), canonicalKey: ck(piece) }; };
  for(let s = 0; s < 1 + pick(2); s++){ const piece = P.planted[pick(P.planted.length)]; P.puzzle.polyominoes.set(piece[pick(piece.length)].join(','), stampOf(piece)); }
  P.rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
  made++;
  for(const [oi, op] of optSets.entries()){
    const ctx = S29.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of S29.deduceSolve(w, h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on planted puzzle, seed', seed, 'optset', oi, ev.reason); break; }
      if(ev.type === 'deduce'){
        checked++;
        const truth = pm[ev.spot.r1][ev.spot.c1] === pm[ev.spot.r2][ev.spot.c2] ? 'same' : 'wall';
        if(ev.value !== truth){ bad++; if(bad < 9) console.log('WRONG', ev.rule, 'seed', seed, 'optset', oi, JSON.stringify(ev.spot), ev.value, 'planted says', truth); }
      }
      if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
    }
  }
  const a = untilSearch(S28, P), b = untilSearch(S29, P);
  if(b < a){ fewer++; console.log('v29 decides FEWER edges, seed', seed, a, b); }
  if(b > a){ gained++; gainEdges += b - a; }
  // mutants
  for(let k = 0; k < 3; k++){
    const Q = { puzzle: { w, h, active: P.puzzle.active, walls: new Map(P.puzzle.walls), roses: new Map(), polyominoes: new Map(P.puzzle.polyominoes), areaNumbers: new Map() }, bank: [], rules: P.rules };
    if(k === 0){ const keys = [...Q.puzzle.polyominoes.keys()], key = keys[pick(keys.length)], other = P.planted[pick(P.planted.length)]; Q.puzzle.polyominoes.set(key, stampOf(other)); }
    else { const ks = [...Q.puzzle.walls.keys()].filter(x => Q.puzzle.walls.get(x) === 'gemini' || Q.puzzle.walls.get(x) === 'delta'); if(!ks.length) continue; const key = ks[pick(ks.length)]; Q.puzzle.walls.set(key, Q.puzzle.walls.get(key) === 'gemini' ? 'delta' : 'gemini'); }
    mut++;
    const ex = L.exact(Q, 2, 300000), de = L.deduce(Q, optSets[1], 2, 300000);
    if(ex.exceeded || de.exceeded) continue;
    if(ex.sols.length !== de.sols.length || (ex.sols.length === 1 && L.sig(ex.sols[0]) !== L.sig(de.sols[0]))){ bad++; console.log('VERDICT mismatch mutant', k, 'seed', seed, 'exact', ex.sols.length, 'deduce', de.sols.length); }
  }
}
console.log(`gemini/delta fuzz: planted ${made}, deductions checked ${checked}, mutants ${mut}, problems ${bad}`);
console.log(`edges decided before any search: v29 decides MORE in ${gained} puzzles (+${gainEdges} edges), fewer in ${fewer}`);
process.exit(bad || fewer ? 1 : 0);
