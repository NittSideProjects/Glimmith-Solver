// v84: Match + holes fuzz (match-hole), from fuzz_matchanchor83.js: 1-3 empty cells (often inside, so pieces can close around them),
// otherwise as v83: (match-anchor shapes, the multi-side compass size cap). From fuzz_matchcompass82.js. Small boards (3-4 x 3-4, sometimes a hole, sometimes
// drawn walls) tiled by copies of ONE random shape (planted), compass values read off the planted tiling (each side shown with p 0.6),
// sometimes one value altered (a mutant: often impossible). Every verdict is compared with the independent oracle (all solutions), and every
// deduction must hold in ALL oracle solutions.   usage: node fuzz_matchhole84.js [N=300] [seed=1]    (GLIMMITH_CORE picks the core)
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
let bad = 0, checked = 0, deds = 0, dedBad = 0, planted = 0, skipped = 0, mutants = 0; const tally = { none: 0, unique: 0, multi: 0 };
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function randomShape(rnd, s){
  const cells = [[0, 0]], has = new Set(['0,0']);
  while(cells.length < s){ const [x, y] = cells[Math.floor(rnd() * cells.length)], [dx, dy] = DIRS[Math.floor(rnd() * 4)], k = `${x + dx},${y + dy}`;
    if(!has.has(k)){ has.add(k); cells.push([x + dx, y + dy]); } }
  return cells;
}
function orients(cells){
  const T = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
  const out = [], seen = new Set();
  for(const t of T){ const p = cells.map(([x, y]) => t(x, y)), mx = Math.min(...p.map(q => q[0])), my = Math.min(...p.map(q => q[1]));
    const q = p.map(([x, y]) => [x - mx, y - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]), k = q.join(';'); if(!seen.has(k)){ seen.add(k); out.push(q); } }
  return out;
}
function tile(rnd, w, h, active, shape){            // random backtracking tiling of the active tiles by copies of shape; null if none found
  const ors = orients(shape), owner = new Map(); let nodes = 0;
  const free = (x, y) => x >= 0 && y >= 0 && x < w && y < h && active[y][x] && !owner.has(`${x},${y}`);
  const rec = id => {
    if(++nodes > 20000) return false;
    let first = null;
    for(let y = 0; y < h && !first; y++) for(let x = 0; x < w; x++) if(free(x, y)){ first = [x, y]; break; }
    if(!first) return true;
    const order = ors.slice().sort(() => rnd() - 0.5);
    for(const o of order){
      const [ax, ay] = o[0], dx = first[0] - ax, dy = first[1] - ay;     // o[0] is the first cell in scan order: it must cover `first`
      if(!o.every(([x, y]) => free(x + dx, y + dy))) continue;
      for(const [x, y] of o) owner.set(`${x + dx},${y + dy}`, id);
      if(rec(id + 1)) return true;
      for(const [x, y] of o) owner.delete(`${x + dx},${y + dy}`);
    }
    return false;
  };
  return rec(0) ? owner : null;
}
for(let i = 0; i < N; i++){
  const rnd = L.rng(seed0 * 7919 + i * 31 + 5), pick = a => a[Math.floor(rnd() * a.length)];
  const w = 3 + Math.floor(rnd() * 2), h = 3 + Math.floor(rnd() * 2), active = L.makeGrid(w, h, 1);
  for(let k = 0, m = 1 + Math.floor(rnd() * 3); k < m; k++){ const x = rnd() < 0.7 ? 1 + Math.floor(rnd() * (w - 2)) : Math.floor(rnd() * w), y = rnd() < 0.7 ? 1 + Math.floor(rnd() * (h - 2)) : Math.floor(rnd() * h); active[y][x] = 0; }
  const cellsA = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) cellsA.push([c, r]);
  const T = cellsA.length, divs = []; for(let s = 2; s <= Math.min(6, T); s++) if(T % s === 0) divs.push(s);
  if(!divs.length){ skipped++; continue; }
  let owner = null;
  let size = 0;
  for(let t = 0; t < 12 && !owner; t++){ size = pick(divs); owner = tile(rnd, w, h, active, randomShape(rnd, size)); }
  if(!owner){ skipped++; continue; }
  planted++;
  const walls = new Map();
  for(const [k, v] of owner){ const [c, r] = k.split(',').map(Number);
    for(const [dc, dr, o] of [[1, 0, 'v'], [0, 1, 'h']]){ const k2 = `${c + dc},${r + dr}`; if(owner.has(k2) && owner.get(k2) !== v && rnd() < 0.1) walls.set(`${o}:${c},${r}`, 'wall'); } }
  const compasses = new Map();
  for(let k = 0, m = Math.floor(rnd() * 3); k < m; k++){
    const [c, r] = pick(cellsA), mine = cellsA.filter(([x, y]) => owner.get(`${x},${y}`) === owner.get(`${c},${r}`));
    const t = { n: 0, e: 0, s: 0, w: 0 }; for(const [x, y] of mine){ if(y < r) t.n++; if(y > r) t.s++; if(x > c) t.e++; if(x < c) t.w++; }
    const o = { n: null, e: null, s: null, w: null }; for(const d of ['n', 'e', 's', 'w']) if(rnd() < 0.6) o[d] = t[d];
    compasses.set(`${c},${r}`, o);
  }
  const palisades = new Map(), areaNumbers = new Map();
  for(let k = 0, m = Math.floor(rnd() * 4); k < m; k++){
    const [c, r] = pick(cellsA), key = `${c},${r}`; if(compasses.has(key)) continue; const me = owner.get(key);
    const sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => owner.get(`${c + dc},${r + dr}`) === me ? 0 : 1), n = sd[0] + sd[1] + sd[2] + sd[3];
    let t = n === 2 ? (sd[0] + sd[2] === 1 ? '2c' : '2s') : String(n);
    if(rnd() < 0.15){ t = pick(['0', '1', '2c', '2s', '3', '4']); mutants++; }
    palisades.set(key, t);
  }
  if(rnd() < 0.3){ const [c, r] = pick(cellsA), key = `${c},${r}`; if(!compasses.has(key) && !palisades.has(key)) areaNumbers.set(key, rnd() < 0.8 ? size : 1 + Math.floor(rnd() * 5)); }
  if(rnd() < 0.3 && compasses.size){ const [k, o] = pick([...compasses]); const d = pick(['n', 'e', 's', 'w']); o[d] = Math.floor(rnd() * 4); mutants++; }
  const puzzle = { w, h, active, walls, roses: new Map(), polyominoes: new Map(), areaNumbers, palisades, compasses, watchtowers: new Map() };
  const rules = { precision: null, min: null, max: null, match: true, mismatch: false };
  const P = { puzzle, rules, bank: [], hints: null };
  const all = O.oracle(P, 200000); if(!all){ skipped++; continue; }
  const sigs = all.map(O.sigCells);
  tally[all.length === 0 ? 'none' : all.length === 1 ? 'unique' : 'multi']++;
  const optSets = [{ testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true },             // the page's defaults
                   { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
                   { finalOnly: true }];
  for(const [j, o] of optSets.entries()){
    const r = L.deduce(P, Object.assign({ keepEvents: true, stopAtTwo: true }, o), 2, 400000);
    if(r.exceeded) continue; checked++;
    const want = Math.min(all.length, 2); let ok = r.sols.length === want;
    if(ok && all.length === 1) ok = L.sig(r.sols[0]) === sigs[0];
    if(ok && want === 2) ok = r.sols.every(s => sigs.includes(L.sig(s)));
    if(!ok){ bad++; if(bad <= 5) console.log('MISMATCH opts', j, 'i', i, 'oracle', all.length, 'got', r.sols.length, JSON.stringify([...compasses]), JSON.stringify([...walls.keys()]), JSON.stringify(active)); }
    if(all.length > 0) for(const ev of r.events){
      if(ev.type !== 'deduce') continue; deds++;
      const sp = ev.spot;
      const holds = sg => sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); });
      for(const sg of sigs){ if(holds(sg) !== (ev.value === 'same')){ dedBad++; if(dedBad <= 5) console.log('UNSOUND', j, ev.value, sp.key, ev.rule, 'i', i); break; } }
    }
  }
}
console.log(`match-hole fuzz: planted ${planted} (skipped ${skipped}, mutants ${mutants}) ${JSON.stringify(tally)} runs checked ${checked}, deductions checked ${deds}, mismatches ${bad}, unsound ${dedBad}`);
process.exit(bad || dedBad ? 1 : 0);
