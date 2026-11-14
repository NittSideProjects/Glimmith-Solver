// Naked pairs / triples for Mismatch (v25): soundness + gain.   node fuzz_naked25.js [N=400] [maxSide=6]
// Planted Mismatch puzzles with a tight bank (the planted shapes only), area numbers and many fixed walls, so that small shape domains and
// pairs of groups known to be different pieces are common. Every deduction is checked against the planted tiling; the gain is measured against
// the same core with the naked pass switched off (the source text is patched in memory).
const fs = require('fs'), Module = require('module');
const N = +process.argv[2] || 400; let maxSideArg = +process.argv[3] || 6;
const L = require('../fuzzlib.js');
const S25 = require('../reference/solver-core.v103.js');
let maxSide = 6;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
function randomShape(R, n){                                        // a random connected shape of n cells
  const cells = [[0, 0]], have = new Set(['0,0']);
  while(cells.length < n){ const [x, y] = cells[Math.floor(R() * cells.length)], [dx, dy] = DIRS[Math.floor(R() * 4)], k = (x + dx) + ',' + (y + dy); if(!have.has(k)){ have.add(k); cells.push([x + dx, y + dy]); } }
  return S25.normalizeCells(cells);
}
function tileWith(R, w, h, active, X){                              // exact cover of the active tiles by copies of X (random backtracking), or null
  const ors = S25.shapeOrientations(X), pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [];
  let steps = 0;
  function go(){
    if(++steps > 20000) return false;
    let c0 = -1, r0 = -1;
    outer: for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c] && pieceOf[r][c] === -1){ c0 = c; r0 = r; break outer; }
    if(c0 < 0) return true;
    const opts = [];
    for(const ori of ors) for(const [sx, sy] of ori) {
      const cells = ori.map(([x, y]) => [x - sx + c0, y - sy + r0]);
      if(cells.every(([c, r]) => c >= 0 && r >= 0 && c < w && r < h && active[r][c] && pieceOf[r][c] === -1)) opts.push(cells);
    }
    for(let i = opts.length - 1; i > 0; i--){ const j = Math.floor(R() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    for(const cells of opts){
      const id = pieces.length; pieces.push(cells); for(const [c, r] of cells) pieceOf[r][c] = id;
      if(go()) return true;
      pieces.pop(); for(const [c, r] of cells) pieceOf[r][c] = -1;
    }
    return false;
  }
  return go() ? { pieces, pieceOf } : null;
}
function growTiling(R, w, h, active, sizes){                        // random tiling into pieces of the given sizes
  const pick = n => Math.floor(R() * n), pieceOf = Array.from({ length: h }, () => Array(w).fill(-1)), pieces = [], order = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) order.push([c, r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id;
    const target = sizes[pick(sizes.length)];
    while(cells.length < target){
      const cand = [];
      for(const [c, r] of cells) for(const [dc, dr] of DIRS){ const nc = c + dc, nr = r + dr; if(nc >= 0 && nr >= 0 && nc < w && nr < h && active[nr][nc] && pieceOf[nr][nc] === -1) cand.push([nc, nr]); }
      if(!cand.length) break;
      const [nc, nr] = cand[pick(cand.length)]; pieceOf[nr][nc] = id; cells.push([nc, nr]);
    }
    pieces.push(cells);
  }
  return { pieces, pieceOf };
}
const norm = cells => { const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); return cells.map(([x, y]) => [x - mx, y - my]); };
function planted(seed){
  const R = rng(seed), pick = n => Math.floor(R() * n);
  for(let attempt = 0; attempt < 600; attempt++){
    const w = 2 + pick(maxSide - 1), h = 2 + pick(maxSide - 1);
    const active = Array.from({ length: h }, () => Array(w).fill(1));
    const holeP = R() < 0.35 ? 0.06 : 0;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(R() < holeP) active[r][c] = 0;
    const mode = 2 + pick(3);                // 0,1 match; 2,3,4 mismatch; 5 both (one piece)
    const wantMatch = mode < 2 || mode === 5, wantMis = mode >= 2;
    let t;
    if(mode === 5){ t = growTiling(R, w, h, active, [w * h]); if(t.pieces.length !== 1) continue; }
    else if(wantMatch){ t = tileWith(R, w, h, active, randomShape(R, 2 + pick(4))); if(!t) continue; }
    else {
      t = growTiling(R, w, h, active, R() < 0.5 ? [1, 2, 3, 4] : [1, 2, 3, 4, 5]);
      const keys = t.pieces.map(p => S25.canonicalShapeKey(p)); if(new Set(keys).size !== keys.length) continue;
    }
    const { pieces, pieceOf } = t, keys = pieces.map(p => S25.canonicalShapeKey(p));
    if(pieces.length < 1) continue;
    const walls = new Map(), wallP = 0.6;
    for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
      if(!active[r][c]) continue;
      if(c + 1 < w && active[r][c + 1] && pieceOf[r][c] !== pieceOf[r][c + 1] && R() < wallP) walls.set(`v:${c},${r}`, 'wall');
      if(r + 1 < h && active[r + 1][c] && pieceOf[r][c] !== pieceOf[r + 1][c] && R() < wallP) walls.set(`h:${c},${r}`, 'wall');
    }
    const polyominoes = new Map(), areaNumbers = new Map(), roses = new Map(), stampP = 0.05, areaP = 0.3;
    let roseTypes = R() < 0.2 ? 1 + pick(2) : 0;
    if(pieces.some(p => p.length < roseTypes + 1)) roseTypes = 0;
    pieces.forEach(cells => {
      const free = cells.slice().sort(() => R() - 0.5), used = new Set();
      for(let ty = 1; ty <= roseTypes; ty++){ const q = free.find(([c, r]) => !used.has(c + ',' + r)); if(q){ roses.set(q[0] + ',' + q[1], ty); used.add(q[0] + ',' + q[1]); } }
      const spare = cells.filter(([c, r]) => !used.has(c + ',' + r));
      if(!spare.length) return;
      const [c, r] = spare[pick(spare.length)];
      if(R() < stampP) polyominoes.set(`${c},${r}`, { cells: norm(cells), canonicalKey: S25.canonicalShapeKey(cells) });
      else if(R() < areaP) areaNumbers.set(`${c},${r}`, cells.length);
    });
    const rules = { precision: null, min: null, max: null, mismatch: wantMis, match: wantMatch, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
    const sizes = pieces.map(p => p.length), mn = Math.min(...sizes), mx = Math.max(...sizes), rp = pick(6);
    if(rp === 0) rules.min = mn; else if(rp === 1) rules.max = mx; else if(rp === 2){ rules.min = mn; rules.max = mx; } else if(rp === 3 && mn === mx) rules.precision = mn;
    if(pieces.every(p => S25.isRectangular(p)) && R() < 0.3) rules.boxy = true;
    else if(pieces.every(p => !S25.isRectangular(p)) && R() < 0.3) rules.nonBoxy = true;
    const bank = [];
    if(true){
      const seen = new Set();
      pieces.forEach((cells, i) => { if(seen.has(keys[i])) return; seen.add(keys[i]); bank.push({ id: bank.length + 1, cells: norm(cells) }); });
      for(let d = 0; d > 0; d--){ const sh = randomShape(R, 1 + pick(5)), k = S25.canonicalShapeKey(sh); if(!seen.has(k)){ seen.add(k); bank.push({ id: bank.length + 1, cells: sh }); } }
    }
    return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules, pieceOf, pieces };
  }
  return null;
}
function mutant(P, seed){                                                   // change one thing: the result may or may not still be solvable
  const R = rng(seed), pick = n => Math.floor(R() * n);
  const Q = { puzzle: { w: P.puzzle.w, h: P.puzzle.h, active: P.puzzle.active.map(r => r.slice()), walls: new Map(P.puzzle.walls), roses: new Map(P.puzzle.roses), polyominoes: new Map(P.puzzle.polyominoes), areaNumbers: new Map(P.puzzle.areaNumbers) }, bank: P.bank.slice(), rules: Object.assign({}, P.rules) };
  const cellsAll = []; for(let r = 0; r < Q.puzzle.h; r++) for(let c = 0; c < Q.puzzle.w; c++) if(Q.puzzle.active[r][c]) cellsAll.push([c, r]);
  const m = pick(8);
  if(m === 0){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.areaNumbers.set(`${c},${r}`, 1 + pick(5)); }
  else if(m === 1){ const [c, r] = cellsAll[pick(cellsAll.length)]; const sh = randomShape(R, 1 + pick(4)); Q.puzzle.polyominoes.set(`${c},${r}`, { cells: sh, canonicalKey: S25.canonicalShapeKey(sh) }); }
  else if(m === 2){ Q.rules.match = !Q.rules.match; }
  else if(m === 3){ Q.rules.mismatch = !Q.rules.mismatch; }
  else if(m === 4){ Q.rules.min = 1 + pick(3); Q.rules.max = Q.rules.min + pick(3); Q.rules.precision = null; }
  else if(m === 5){ Q.rules.precision = 1 + pick(5); }
  else if(m === 6){ const [c, r] = cellsAll[pick(cellsAll.length)]; Q.puzzle.active[r][c] = 0; }
  else { Q.bank = Q.bank.slice(0, Math.max(0, Q.bank.length - 1)); }
  return Q;
}



maxSide = maxSideArg;
const B = require('../reference/solver-core.v103.js');
const A = (() => { const f = require.resolve('../reference/solver-core.v103.js'), src = fs.readFileSync(f, 'utf8'); const needle = 'const nk = nakedPass(dom, dmap);'; if(!src.includes(needle)) throw new Error('naked pass call not found'); const m = new Module(f); m.filename = f; m.paths = Module._nodeModulePaths(require('path').dirname(f)); m._compile(src.replace(needle, 'const nk = false;'), f); return m.exports; })();
const opts = [{ testNodes: 15, restart: 'first', order: 'scan', useWitness: true }, { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' }];
let bad = 0, checked = 0, made = 0, more = 0, pairTagged = 0, aN = 0, bN = 0;
for(let i = 0; i < N; i++){
  const P = planted(5550000 + i); if(!P || !P.rules.mismatch) continue; made++;
  const same = (a, b) => P.pieceOf[a[1]][a[0]] === P.pieceOf[b[1]][b[0]];
  for(const op of opts){
    const ctx = B.buildSolverContext(P.puzzle, P.bank, P.rules, null);
    for(const ev of B.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ stopAtTwo: true, nodeBudget: 100000 }, op))){
      if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE on planted', 5550000 + i, ev.reason); break; }
      if(ev.type === 'deduce'){ checked++; if(ev.rule === 'mismatch-pair') pairTagged++;
        const truth = same([ev.spot.c1, ev.spot.r1], [ev.spot.c2, ev.spot.r2]) ? 'same' : 'wall';
        if(ev.value !== truth){ bad++; console.log('WRONG', ev.rule, ev.source, 'seed', 5550000 + i, ev.value, 'planted', truth); } }
      if(ev.type === 'solution' || ev.type === 'budget-exceeded') break;
    }
  }
  const cnt = S => { const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null); let n = 0; for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, stopAtTwo: true })){ if(ev.type === 'deduce') n++; if(['impossible-early','testing','stage','solution'].includes(ev.type)) break; } return n; };
  const a = cnt(A), b = cnt(B); aN += a; bN += b; if(b > a) more++; if(b < a) { bad++; console.log('naked decided FEWER', 5550000 + i, a, b); }
}
console.log(`mismatch planted ${made}, deductions checked ${checked} (tagged mismatch-pair: ${pairTagged}), puzzles where the pass decides more before search: ${more}, edges before search without/with: ${aN}/${bN}, problems ${bad}`);
process.exit(bad ? 1 : 0);
