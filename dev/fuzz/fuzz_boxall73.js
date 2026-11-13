// v73: box-shapes / box-all. Random small boards (holes + drawn walls), Boxy + Mismatch, kept only when the placeable rectangles add up to
// exactly the board (the case box-all handles). Verdicts and every deduction are checked against the independent oracle.
// usage: GLIMMITH_CORE=reference/solver-core.v100.js node fuzz_boxall73.js [N=150] [seed=1]
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 150, seed0 = +process.argv[3] || 1;
let boxAllDeds = 0, made = 0, bad = 0, deds = 0, dedBad = 0, tried = 0; const tally = { 0: 0, 1: 0, 2: 0 };
for(let i = 0; made < N && tried < N * 400; i++){
  tried++;
  const rnd = L.rng(seed0 * 9311 + i);
  const w = 3 + Math.floor(rnd() * 4), h = 2 + Math.floor(rnd() * 4), active = L.makeGrid(w, h, 1);
  const hole = rnd() * 0.35;
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(rnd() < hole) active[r][c] = 0;
  const walls = new Map(), wd = rnd() * 0.25;
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c]) continue;
    if(c + 1 < w && active[r][c + 1] && rnd() < wd) walls.set(`v:${c},${r}`, 'wall');
    if(r + 1 < h && active[r + 1][c] && rnd() < wd) walls.set(`h:${c},${r}`, 'wall');
  }
  let T = 0; for(const row of active) for(const v of row) T += v; if(T < 3 || T > 16) continue;
  const ok = (x, y) => x >= 0 && y >= 0 && x < w && y < h && active[y][x];
  const fits = (W, H) => { for(let y0 = 0; y0 + H <= h; y0++) for(let x0 = 0; x0 + W <= w; x0++){ let g = true;
    for(let y = y0; y < y0 + H && g; y++) for(let x = x0; x < x0 + W; x++){ if(!ok(x, y) || (x + 1 < x0 + W && walls.has(`v:${x},${y}`)) || (y + 1 < y0 + H && walls.has(`h:${x},${y}`))){ g = false; break; } }
    if(g) return true; } return false; };
  let sum = 0; for(let a = 1; a <= Math.max(w, h); a++) for(let b = a; a * b <= T; b++) if(fits(a, b) || (a !== b && fits(b, a))) sum += a * b;
  if(sum !== T) continue;
  made++;
  const puzzle = { w, h, active, walls, roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), compasses: new Map(), watchtowers: new Map() };
  const P = { puzzle, rules: { precision: null, min: null, max: null, mismatch: true, boxy: true }, bank: [], hints: null };
  const t0 = Date.now(); const all = O.oracle(P, 200000), sigs = all.map(O.sigCells); tally[Math.min(all.length, 2)]++;
  const r = L.deduce(P, { testNodes: 30, restart: 'continue', order: 'clues', useWitness: true, keepEvents: true }, 2, 400000);
  if(process.env.FZV) console.log('puzzle', made, w + 'x' + h, 'T', T, 'oracle', all.length, 'ms', Date.now() - t0);
  if(r.exceeded) continue;
  const want = Math.min(all.length, 2);
  if(!(r.sols.length === want && r.sols.every(s => sigs.includes(L.sig(s))))){ bad++; console.log('VERDICT MISMATCH seed', seed0 * 9311 + i, 'oracle', all.length, 'got', r.sols.length); }
  for(const ev of r.events || []){
    if(ev.type !== 'deduce') continue; deds++; if(ev.rule === 'box-all' || (ev.why || '').includes('box-all')) boxAllDeds++; const sp = ev.spot;
    const same = sg => sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); });
    for(const sg of sigs) if(same(sg) !== (ev.value === 'same')){ dedBad++; console.log('UNSOUND', ev.value, sp.key, ev.rule || ev.source, 'seed', seed0 * 9311 + i); break; }
  }
}
console.log(`box-all fuzz: ${made} puzzles (oracle: ${tally[0]} none, ${tally[1]} unique, ${tally[2]} several), deductions checked ${deds} (box-all ${boxAllDeds}), verdict mismatches ${bad}, unsound ${dedBad}`);
process.exit(bad || dedBad ? 1 : 0);
