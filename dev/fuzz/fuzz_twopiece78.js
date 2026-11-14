// v78: two-piece DP. Planted 2-piece tilings on small boards (holes, drawn walls), clues: area numbers (two values a + b = tiles), true watchtower
// values at some corners, sometimes a rose pair. The DP runs right after the probes (portfolio off). Verdicts and EVERY deduction are checked
// against the independent oracle (all solutions). The DP runs before any probe (opts.twoPieceEarly) so it does the work.   usage: GLIMMITH_CORE=reference/solver-core.v102.js node fuzz_twopiece78.js [N=200] [seed=1]
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 200, seed0 = +process.argv[3] || 1, sparse = process.argv[4] === 'sparse';   // sparse: few clues, no drawn walls, one tower value sometimes changed
let dpRuns = 0, dpBad = 0, made = 0, bad = 0, deds = 0, dedBad = 0, tpDeds = 0, tried = 0; const tally = { 0: 0, 1: 0, 2: 0 };
for(let i = 0; made < N && tried < N * 50; i++){
  tried++;
  const rnd = L.rng(seed0 * 7919 + i), pick = a => a[Math.floor(rnd() * a.length)];
  const w = 3 + Math.floor(rnd() * 2), h = 3 + Math.floor(rnd() * 2), active = L.makeGrid(w, h, 1);
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(rnd() < 0.12) active[r][c] = 0;
  const cells = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) cells.push([c, r]);
  if(cells.length < 4) continue;
  const key = (c, r) => c + ',' + r, act = (c, r) => c >= 0 && r >= 0 && c < w && r < h && active[r][c];
  const conn = set => { if(!set.size) return false; const s0 = [...set][0], seen = new Set([s0]), q = [s0]; while(q.length){ const [c, r] = q.pop().split(',').map(Number); for(const [X, Y] of [[c+1,r],[c-1,r],[c,r+1],[c,r-1]]){ const k = key(X, Y); if(set.has(k) && !seen.has(k)){ seen.add(k); q.push(k); } } } return seen.size === set.size; };
  if(!conn(new Set(cells.map(([c, r]) => key(c, r))))) continue;
  // grow piece A from a random tile; B = the rest (must be connected)
  const target = 1 + Math.floor(rnd() * (cells.length - 1)), A = new Set(); const [sc, sr] = pick(cells); A.add(key(sc, sr));
  for(let g = 0; g < 200 && A.size < target; g++){ const [c, r] = pick([...A]).split(',').map(Number), [dc, dr] = pick([[1,0],[-1,0],[0,1],[0,-1]]); if(act(c + dc, r + dr)) A.add(key(c + dc, r + dr)); }
  const B = new Set(cells.map(([c, r]) => key(c, r)).filter(k => !A.has(k)));
  if(!B.size || !conn(B) || A.size === B.size) continue;
  const areaNumbers = new Map();
  const nA = sparse ? 1 : 1 + Math.floor(rnd() * 2), nB = sparse ? 1 : 1 + Math.floor(rnd() * 2);
  for(let j = 0; j < nA; j++) areaNumbers.set(pick([...A]), A.size);
  for(let j = 0; j < nB; j++) areaNumbers.set(pick([...B]), B.size);
  const watchtowers = new Map();
  for(let vy = 0; vy <= h; vy++) for(let vx = 0; vx <= w; vx++){
    if(rnd() > (sparse ? 0.12 : 0.2)) continue;
    const ts = [[vx-1,vy-1],[vx,vy-1],[vx-1,vy],[vx,vy]].filter(([c, r]) => act(c, r));
    if(!ts.length) continue;
    const pcs = new Set(ts.map(([c, r]) => A.has(key(c, r)) ? 'A' : 'B'));
    watchtowers.set(vx + ',' + vy, pcs.size);
  }
  if(sparse && watchtowers.size && rnd() < 0.3){ const k = pick([...watchtowers.keys()]); watchtowers.set(k, 1 + Math.floor(rnd() * 3)); }
  const walls = new Map();
  for(const [c, r] of cells){ if(act(c + 1, r) && A.has(key(c, r)) !== A.has(key(c + 1, r)) && !sparse && rnd() < 0.15) walls.set(`v:${c},${r}`, 'wall'); if(act(c, r + 1) && A.has(key(c, r)) !== A.has(key(c, r + 1)) && !sparse && rnd() < 0.15) walls.set(`h:${c},${r}`, 'wall'); }
  const roses = new Map();
  if(rnd() < 0.3){ roses.set(pick([...A]), 1); roses.set(pick([...B]), 1); }
  made++;
  const puzzle = { w, h, active, walls, roses, polyominoes: new Map(), areaNumbers, palisades: new Map(), compasses: new Map(), watchtowers };
  const P = { puzzle, rules: { precision: null, min: null, max: null }, bank: [], hints: null };
  const all = O.oracle(P, 200000), sigs = all.map(O.sigCells); tally[Math.min(all.length, 2)]++;
  let dpSols = undefined;
  const r = L.deduce(P, { testNodes: 30, restart: 'continue', order: 'clues', useWitness: true, keepEvents: true, portfolio: false, twoPieceEarly: true, onTwoPiece: x => { dpSols = x; } }, 2, 400000);
  if(dpSols !== undefined && dpSols !== null && roses.size === 0){                 // no roses: the DP holds every rule, so its count is the true count
    dpRuns++; if(dpSols !== Math.min(all.length, 2)){ dpBad++; console.log('DP COUNT MISMATCH seed', seed0 * 7919 + i, 'dp', dpSols, 'oracle', all.length); } }
  if(r.exceeded) continue;
  const want = Math.min(all.length, 2);
  if(!(r.sols.length === want && r.sols.every(s => sigs.includes(L.sig(s))))){ bad++; console.log('VERDICT MISMATCH seed', seed0 * 7919 + i, 'oracle', all.length, 'got', r.sols.length); }
  for(const ev of r.events){
    if(ev.type !== 'deduce') continue; deds++; if(ev.rule === 'two-piece') tpDeds++;
    const sp = ev.spot, same = sg => sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); });
    for(const sg of sigs) if(same(sg) !== (ev.value === 'same')){ dedBad++; console.log('UNSOUND', ev.value, sp.key, ev.rule, 'seed', seed0 * 7919 + i); break; }
  }
}
console.log(`two-piece fuzz: ${made} puzzles (oracle: ${tally[0]} none, ${tally[1]} unique, ${tally[2]} several), deductions checked ${deds} (two-piece ${tpDeds}), verdict mismatches ${bad}, unsound ${dedBad}; DP count checked ${dpRuns}, wrong ${dpBad}`);
process.exit(bad || dedBad || dpBad ? 1 : 0);
