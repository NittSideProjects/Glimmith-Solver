// v87: cross / pair probes. PLANTED puzzles: a random tiling of a 4-6 x 4-6 board (region growth, pieces of 2-9 tiles, sometimes a hole),
// a few drawn walls on piece borders, area numbers on some pieces; then 2-4 pairs of tiles that are in the SAME planted piece but far apart
// are joined before the first pass (opts.preJoin), so groups in parts (and pairs of them) exist from the start: the cross rule and the pair
// probes get work. The planted tiling stays a solution, so: never impossible, every deduction agrees with it, unique = the planted tiling.
// Runs with the portfolio off (the pair stage then runs right after the probes).   usage: node fuzz_cross87.js [N=200] [seed=1]
const L = require('./fuzzlib.js');
const N = +process.argv[2] || 200, seed0 = +process.argv[3] || 1;
let bad = 0, deds = 0, runs = 0, made = 0;
for(let i = 0; i < N; i++){
  const rnd = L.rng(seed0 * 6007 + i * 13 + 1), pick = a => a[Math.floor(rnd() * a.length)];
  const w = 4 + Math.floor(rnd() * 3), h = 4 + Math.floor(rnd() * 3), active = L.makeGrid(w, h, 1);
  if(rnd() < 0.3) active[1 + Math.floor(rnd() * (h - 2))][1 + Math.floor(rnd() * (w - 2))] = 0;
  const cells = []; for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) if(active[y][x]) cells.push([x, y]);
  const owner = new Map(); let id = 0;
  for(const [c0, r0] of cells.slice().sort(() => rnd() - 0.5)){
    if(owner.has(`${c0},${r0}`)) continue; const pc = [[c0, r0]]; owner.set(`${c0},${r0}`, id);
    const target = 2 + Math.floor(rnd() * 8);
    for(let tries = 0; pc.length < target && tries < 60; tries++){
      const [c, r] = pick(pc), [dc, dr] = pick([[1, 0], [-1, 0], [0, 1], [0, -1]]), k = `${c + dc},${r + dr}`;
      if(active[r + dr] && active[r + dr][c + dc] && !owner.has(k)){ owner.set(k, id); pc.push([c + dc, r + dr]); }
    }
    id++;
  }
  const pieces = new Map(); for(const [k, v] of owner){ if(!pieces.has(v)) pieces.set(v, []); pieces.get(v).push(k.split(',').map(Number)); }
  const walls = new Map(), areaNumbers = new Map();
  for(const [k, v] of owner){ const [c, r] = k.split(',').map(Number);
    for(const [dc, dr, o] of [[1, 0, 'v'], [0, 1, 'h']]){ const k2 = `${c + dc},${r + dr}`; if(owner.has(k2) && owner.get(k2) !== v && rnd() < 0.25) walls.set(`${o}:${c},${r}`, 'wall'); } }
  for(const pc of pieces.values()) if(rnd() < 0.3){ const [x, y] = pick(pc); areaNumbers.set(`${x},${y}`, pc.length); }
  const joins = [];
  for(const pc of [...pieces.values()].filter(p => p.length >= 3).sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3))){
    let best = null; for(const a of pc) for(const b of pc){ const d = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]); if(d >= 2 && (!best || d > best[0])) best = [d, a, b]; }
    if(best) joins.push([best[1][0], best[1][1], best[2][0], best[2][1]]);
  }
  if(joins.length < 2) continue;
  made++;
  const P = { puzzle: { w, h, active, walls, roses: new Map(), polyominoes: new Map(), areaNumbers, palisades: new Map(), compasses: new Map(), watchtowers: new Map() },
              rules: { precision: null, min: null, max: 9, match: false, mismatch: false }, bank: [], hints: null };
  const pidOf = (x, y) => owner.get(`${x},${y}`);
  const sigPlanted = [...pieces.values()].map(pc => pc.map(([x, y]) => `${x},${y}`).sort().join(';')).sort().join('|');
  for(const [j, o] of [{ testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true }].entries()){
    const r = L.deduce(P, Object.assign({ keepEvents: true, stopAtTwo: true, portfolio: false, pairProbeMs: 400, preJoin: joins }, o), 2, 300000);
    if(r.exceeded) continue; runs++;
    if(r.sols.length === 0){ bad++; if(bad <= 5) console.log('IMPOSSIBLE on a planted puzzle', j, 'i', i, JSON.stringify(joins), JSON.stringify([...walls.keys()])); }
    if(r.sols.length === 1 && L.sig(r.sols[0]) !== sigPlanted){ bad++; if(bad <= 5) console.log('UNIQUE but not planted', j, 'i', i); }
    for(const ev of r.events){
      if(ev.type !== 'deduce') continue; deds++;
      const sp = ev.spot, same = pidOf(sp.c1, sp.r1) === pidOf(sp.c2, sp.r2);
      if(same !== (ev.value === 'same')){ bad++; if(bad <= 5) console.log('UNSOUND', j, ev.value, sp.key, ev.rule, 'i', i); }
    }
  }
}
console.log(`cross fuzz: planted ${made}, runs ${runs}, deductions checked ${deds}, problems ${bad}`);
process.exit(bad ? 1 : 0);
