// Soundness + strength check of the v23 rose-window / polyomino deduction rules.
//   node fuzz_rose_poly23.js [N=300] [seed=1] [maxSide=7]
// Puzzles are PLANTED: a random tiling, one rose of every type in each piece (several types), stamps of the piece's own shape on
// some pieces, area numbers on a few, sometimes a bank holding every piece shape, sometimes a size rule. So the planted
// tiling is always a valid solution, and every deduction (wall / same) the solver makes must agree with it.
//   1. soundness: every deduce event agrees with the planted tiling (for every option set, scan included)
//   2. oracle:    on small boards the final verdict (0/1/2+ solutions) equals the brute-force oracle
//   3. strength:  edges decided before any search, v22 core vs v23 core (printed at the end)
const L = require('../fuzzlib.js');
const O = require('../oracle.js');
const S23 = require('../reference/solver-core.v101.js');
const S22 = require('../reference/solver-core.v101.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, maxSide = +process.argv[4] || 7;
const rng = (s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; });

function planted(seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 3 + pick(maxSide - 2), h = 3 + pick(maxSide - 2);
  const active = L.makeGrid ? L.makeGrid(w, h, 1) : Array.from({ length: h }, () => Array(w).fill(1));
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < 0.05) active[r][c] = 0;
  const pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [];
  const order = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) order.push([c, r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  const maxSz = 2 + pick(5);
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id;
    const target = 1 + pick(maxSz);
    while(cells.length < target){
      const cand = [];
      for(const [c, r] of cells) for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc = c + dc, nr = r + dr;
        if(nc >= 0 && nr >= 0 && nc < w && nr < h && active[nr][nc] && pieceOf[nr][nc] === -1) cand.push([nc, nr]);
      }
      if(!cand.length) break;
      const [nc, nr] = cand[pick(cand.length)]; pieceOf[nr][nc] = id; cells.push([nc, nr]);
    }
    pieces.push(cells);
  }
  const minPiece = Math.min(...pieces.map(p => p.length));
  const walls = new Map();
  const wallP = R() < 0.5 ? 0 : 0.25;
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c]) continue;
    if(c + 1 < w && active[r][c + 1] && pieceOf[r][c] !== pieceOf[r][c + 1] && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
    if(r + 1 < h && active[r + 1][c] && pieceOf[r][c] !== pieceOf[r + 1][c] && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
  }
  const roses = new Map(), polyominoes = new Map(), areaNumbers = new Map();
  const roseTypes = R() < 0.6 ? Math.min(minPiece, 1 + pick(3)) : 0;
  const taken = new Set();
  pieces.forEach(cells => {
    for(let t = 1; t <= roseTypes; t++){
      let k; do { const [c, r] = cells[pick(cells.length)]; k = `${c},${r}`; } while(taken.has(k));
      taken.add(k); roses.set(k, t);
    }
  });
  const stampP = R() < 0.7 ? 0.3 + R() * 0.5 : 0, areaP = R() < 0.3 ? 0.2 : 0;
  pieces.forEach(cells => {
    const free = cells.filter(([c, r]) => !taken.has(`${c},${r}`));
    if(free.length && R() < stampP){
      const [c, r] = free[pick(free.length)];
      const mnx = Math.min(...cells.map(q => q[0])), mny = Math.min(...cells.map(q => q[1]));
      polyominoes.set(`${c},${r}`, { cells: cells.map(([x, y]) => [x - mnx, y - mny]), canonicalKey: S23.canonicalShapeKey(cells) });
      taken.add(`${c},${r}`);
    } else if(free.length && R() < areaP){
      const [c, r] = free[pick(free.length)]; areaNumbers.set(`${c},${r}`, cells.length); taken.add(`${c},${r}`);
    }
  });
  const sizes = pieces.map(p => p.length), rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
  const rp = pick(6);
  if(rp === 0) rules.min = Math.min(...sizes); else if(rp === 1) rules.max = Math.max(...sizes); else if(rp === 2){ rules.min = Math.min(...sizes); rules.max = Math.max(...sizes); }
  else if(rp === 3 && new Set(sizes).size === 1) rules.precision = sizes[0];
  const bank = [];
  if(R() < 0.4){
    const seen = new Set();
    pieces.forEach(cells => {
      const k = S23.canonicalShapeKey(cells); if(seen.has(k)) return; seen.add(k);
      const mnx = Math.min(...cells.map(q => q[0])), mny = Math.min(...cells.map(q => q[1]));
      bank.push({ id: bank.length + 1, cells: cells.map(([x, y]) => [x - mnx, y - mny]) });
    });
  }
  return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules, planted: pieces, pieceOf };
}

function eventsUntilSearch(S, P, maxEvents){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
  const gen = S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, stopAtTwo: true });
  const decided = []; let impossible = false, total = 0;
  for(const ev of gen){
    if(ev.type === 'plan') total = ev.spots;
    if(ev.type === 'deduce') decided.push(ev);
    if(ev.type === 'impossible-early'){ impossible = true; break; }
    if(ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break;
    if(decided.length > maxEvents) break;
  }
  return { decided, impossible, total };
}

let bad = 0, checked = 0, oracleChecked = 0, deduced22 = 0, deduced23 = 0, totalSpots = 0, ruleCount = {};
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
];
for(let i = 0; i < N; i++){
  const P = planted(seed0 * 100000 + i);
  const sameP = (a, b) => P.pieceOf[a[1]][a[0]] === P.pieceOf[b[1]][b[0]];
  // 1. every deduction agrees with the planted tiling (all option sets, scan included)
  for(const [oi, op] of optSets.entries()){
    const ctx = S23.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    let nEv = 0;
    for(const ev of S23.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 200000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on a planted puzzle, seed', seed0 * 100000 + i, oi, ev.reason); break; }
      if(ev.type === 'deduce'){
        checked++; nEv++;
        const a = [ev.spot.c1, ev.spot.r1], b = [ev.spot.c2, ev.spot.r2];
        const truth = sameP(a, b) ? 'same' : 'wall';
        if(ev.value !== truth){ bad++; if(bad <= 8) console.log('WRONG deduction', ev.rule, ev.source, 'seed', seed0 * 100000 + i, 'optset', oi, JSON.stringify(ev.spot), ev.value, 'planted says', truth); }
        if(oi === 0) ruleCount[ev.rule || 'basic'] = (ruleCount[ev.rule || 'basic'] || 0) + 1;
      }
      if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
    }
  }
  // 2. final verdict vs the oracle on small boards
  if(P.puzzle.w * P.puzzle.h <= 16){
    const truth = O.oracle(P, 3);
    if(truth !== null){
      oracleChecked++;
      if(truth.length < 1){ bad++; console.log('planted puzzle has no oracle solution?! seed', seed0 * 100000 + i); }
      const r = L.deduce(P, optSets[1], 2, 200000);
      if(!r.exceeded && r.sols.length !== Math.min(truth.length, 2)){ bad++; console.log('VERDICT mismatch seed', seed0 * 100000 + i, 'oracle', truth.length, 'got', r.sols.length); }
    }
  }
  // 3. strength: how much is decided before any search
  const a = eventsUntilSearch(S22, P, 1e9), b = eventsUntilSearch(S23, P, 1e9);
  deduced22 += a.decided.length; deduced23 += b.decided.length; totalSpots += b.total;
  if(b.decided.length < a.decided.length){ bad++; console.log('v23 decides FEWER edges than v22, seed', seed0 * 100000 + i, a.decided.length, b.decided.length); }
}
console.log(`rose/polyomino fuzz: puzzles ${N}, deductions checked ${checked}, oracle-checked ${oracleChecked}, problems ${bad}`);
console.log(`edges decided before any search: v22 ${deduced22} / v23 ${deduced23} of ${totalSpots} open edges`);
console.log('by rule (option set 0):', JSON.stringify(ruleCount));
process.exit(bad ? 1 : 0);
