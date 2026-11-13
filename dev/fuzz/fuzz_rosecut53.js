// v53 soundness fuzz for rose-cut (static + dynamic): planted rose tilings on boards with many holes (narrow passages).
//   GLIMMITH_CORE=./reference/solver-core.v99.js node fuzz_rosecut53.js [N=200] [seed=1]
// 1. every deduce event agrees with the planted tiling (it holds in every tiling, so also in the planted one)
// 2. the number of tilings (0 / 1 / 2+) agrees with the plain exact solver (solvePuzzle), when both finish
// 3. how often rose-cut fired, and edges decided before any search with rose-cut on vs off
const L = require('../fuzzlib.js'), S = L.S;
const N = +process.argv[2] || 200, seed0 = +process.argv[3] || 1;

function planted(seed){
  const R = L.rng(seed * 7919 + 13), pick = n => Math.floor(R() * n);
  const w = 5 + pick(5), h = 5 + pick(5), holeP = 0.1 + R() * 0.2;
  const active = L.makeGrid(w, h, 1);
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < holeP) active[r][c] = 0;
  const T = 2 + pick(3), maxSz = T + 1 + pick(5);
  const pieceOf = L.makeGrid(w, h, -1), pieces = [], order = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) order.push([c, r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id;
    const target = T + pick(maxSz - T + 1);
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
  // pieces too small for T roses: drop their tiles (holes), so every piece holds one rose of every type
  for(const cells of pieces) if(cells.length < T) for(const [c, r] of cells){ active[r][c] = 0; }
  const kept = pieces.filter(p => p.length >= T);
  if(kept.length < 2) return null;
  const roses = new Map();
  for(const cells of kept){
    const idx = cells.map((_, i) => i);
    for(let i = idx.length - 1; i > 0; i--){ const j = pick(i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    for(let t = 1; t <= T; t++){ const [c, r] = cells[idx[t - 1]]; roses.set(`${c},${r}`, t); }
  }
  const walls = new Map(), id = new Map();
  kept.forEach((p, i) => p.forEach(([c, r]) => id.set(`${c},${r}`, i)));
  const wallP = R() < 0.5 ? 0 : 0.08;
  for(const [k, a] of id){
    const [c, r] = k.split(',').map(Number);
    const b1 = id.get(`${c + 1},${r}`), b2 = id.get(`${c},${r + 1}`);
    if(b1 !== undefined && b1 !== a && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
    if(b2 !== undefined && b2 !== a && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
  }
  const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
  return { puzzle: { w, h, active, walls, roses, polyominoes: new Map(), areaNumbers: new Map() }, bank: [], rules, planted: kept };
}

function plantedWalls(P){
  const id = new Map(); P.planted.forEach((p, i) => p.forEach(([c, r]) => id.set(`${c},${r}`, i)));
  const s = new Set();
  for(const [k, a] of id){
    const [c, r] = k.split(',').map(Number);
    const b1 = id.get(`${c + 1},${r}`), b2 = id.get(`${c},${r + 1}`);
    if(b1 !== undefined && b1 !== a) s.add(`v:${c},${r}`);
    if(b2 !== undefined && b2 !== a) s.add(`h:${c},${r}`);
  }
  return s;
}

function run(P, opts, budget){
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, null), se = L.collectSpecialEdges(P.puzzle.walls);
  const ev = [], sols = []; let exceeded = false, impossible = null, stage = false, early = 0;
  for(const e of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, se, Object.assign({ nodeBudget: budget, testNodes: 2000 }, opts))){
    if(e.type === 'deduce'){ ev.push(e); if(!stage) early++; }
    else if(e.type === 'stage') stage = true;
    else if(e.type === 'solution'){ sols.push(e); if(sols.length >= 2) break; }
    else if(e.type === 'budget-exceeded'){ exceeded = true; break; }
    else if(e.type === 'impossible' || e.type === 'impossible-early'){ impossible = e.why; }
  }
  return { ev, sols: sols.length, exceeded, impossible, early };
}

let checked = 0, bad = 0, fired = 0, cmpN = 0, skipped = 0, earlyOn = 0, earlyOff = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i;
  const P = planted(seed); if(!P){ skipped++; continue; }
  const pw = plantedWalls(P);
  const on = run(P, {}, 200000), off = run(P, { roseCut: false }, 200000);
  checked++;
  const rc = on.ev.filter(e => e.rule === 'rose-cut').length; if(rc) fired++;
  earlyOn += on.early; earlyOff += off.early;
  for(const e of on.ev){
    const want = pw.has(e.spot.key) ? 'wall' : 'same';
    if(e.value !== want){ bad++; console.log(`WRONG seed ${seed}: ${e.spot.key}=${e.value} (${e.rule})`); break; }
  }
  if(on.impossible){ bad++; console.log(`WRONG seed ${seed}: impossible (${on.impossible}) but the planted tiling exists`); }
  if(!on.exceeded){
    const ex = L.exact(P, 2, 300000);
    if(!ex.exceeded){
      cmpN++;
      const a = Math.min(on.sols, 2), b = Math.min(ex.sols.length, 2);
      if(a !== b){ bad++; console.log(`MISMATCH seed ${seed}: deduce ${a} vs exact ${b}`); }
    }
  }
}
console.log(`checked ${checked} (skipped ${skipped}), rose-cut fired on ${fired}, verdicts compared ${cmpN}, problems ${bad}; edges before search: on ${earlyOn} vs off ${earlyOff}`);
process.exitCode = bad ? 1 : 0;
