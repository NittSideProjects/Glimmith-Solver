// v86: Boxy + walls that compare sizes (boxy-place size walls). PLANTED puzzles: a random guillotine cut of a 3-7 x 3-7 board into
// rectangles; on some piece borders a wall that compares the two sizes (lt / gt / diffN, always true for the planted tiling, so the planted
// tiling is a solution); sometimes area numbers, a minimum size. Checks (no oracle needed): every deduction agrees with the planted tiling,
// the verdict is never "impossible", and a unique verdict is the planted tiling.   usage: node fuzz_boxyrel86.js [N=300] [seed=1]
const L = require('./fuzzlib.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
let bad = 0, deds = 0, runs = 0, made = 0, unique = 0;
for(let i = 0; i < N; i++){
  const rnd = L.rng(seed0 * 9973 + i * 17 + 3), pick = a => a[Math.floor(rnd() * a.length)];
  const w = 3 + Math.floor(rnd() * 5), h = 3 + Math.floor(rnd() * 5), active = L.makeGrid(w, h, 1);
  // guillotine cut
  const rects = [], cut = (x0, y0, x1, y1) => {               // inclusive
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    if(W * H <= 2 + Math.floor(rnd() * 6) || (W === 1 && H === 1)){ rects.push([x0, y0, x1, y1]); return; }
    if((W >= H && W > 1) || H === 1){ const c = x0 + Math.floor(rnd() * (W - 1)); cut(x0, y0, c, y1); cut(c + 1, y0, x1, y1); }
    else { const c = y0 + Math.floor(rnd() * (H - 1)); cut(x0, y0, x1, c); cut(x0, c + 1, x1, y1); }
  };
  cut(0, 0, w - 1, h - 1);
  const pid = Array.from({ length: h }, () => Array(w).fill(-1)), size = rects.map(([a, b, c, d]) => (c - a + 1) * (d - b + 1));
  rects.forEach(([a, b, c, d], k) => { for(let y = b; y <= d; y++) for(let x = a; x <= c; x++) pid[y][x] = k; });
  const walls = new Map(), areaNumbers = new Map();
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) for(const [dx, dy, o] of [[1, 0, 'v'], [0, 1, 'h']]){
    const X = x + dx, Y = y + dy; if(X >= w || Y >= h || pid[y][x] === pid[Y][X] || rnd() > 0.35) continue;
    const sa = size[pid[y][x]], sb = size[pid[Y][X]], k = `${o}:${x},${y}`;
    const r = rnd();
    if(r < 0.5) walls.set(k, 'diff' + Math.abs(sa - sb));
    else if(sa < sb) walls.set(k, 'lt'); else if(sa > sb) walls.set(k, 'gt'); else walls.set(k, 'diff0');
  }
  rects.forEach(([a, b, c, d], k) => { if(rnd() < 0.25){ areaNumbers.set(`${a + Math.floor(rnd() * (c - a + 1))},${b + Math.floor(rnd() * (d - b + 1))}`, size[k]); } });
  const minS = Math.min(...size);
  const rules = { precision: null, min: rnd() < 0.5 ? minS : null, max: null, match: false, mismatch: false, boxy: true };
  const puzzle = { w, h, active, walls, roses: new Map(), polyominoes: new Map(), areaNumbers, palisades: new Map(), compasses: new Map(), watchtowers: new Map() };
  const P = { puzzle, rules, bank: [], hints: null };
  made++;
  const sigPlanted = rects.map(([a, b, c, d]) => { const cs = []; for(let y = b; y <= d; y++) for(let x = a; x <= c; x++) cs.push(`${x},${y}`); return cs.sort().join(';'); }).sort().join('|');
  for(const [j, o] of [{ testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true }, { finalOnly: true }].entries()){
    const r = L.deduce(P, Object.assign({ keepEvents: true, stopAtTwo: true }, o), 2, 400000);
    if(r.exceeded) continue; runs++;
    if(r.sols.length === 0){ bad++; if(bad <= 5) console.log('IMPOSSIBLE on a planted puzzle, opts', j, 'i', i, JSON.stringify([...walls]), JSON.stringify(rects)); }
    if(r.sols.length === 1){ unique++; if(L.sig(r.sols[0]) !== sigPlanted){ bad++; if(bad <= 5) console.log('UNIQUE but not the planted tiling, opts', j, 'i', i); } }
    for(const ev of r.events){
      if(ev.type !== 'deduce') continue; deds++;
      const sp = ev.spot, same = pid[sp.r1][sp.c1] === pid[sp.r2][sp.c2];
      if(same !== (ev.value === 'same')){ bad++; if(bad <= 5) console.log('UNSOUND', j, ev.value, sp.key, ev.rule, 'i', i); }
    }
  }
}
console.log(`boxy-rel fuzz: planted ${made}, runs ${runs} (unique ${unique}), deductions checked ${deds}, problems ${bad}`);
process.exit(bad ? 1 : 0);
