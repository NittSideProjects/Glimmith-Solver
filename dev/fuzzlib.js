// shared helpers for the deduction-solver tests: random puzzles + running both solvers
const CORE_PATH = require('./corepath.js').corePath();      // GLIMMITH_CORE or the newest reference/solver-core.vNN.js
const S = require(CORE_PATH);
const { buildSolverContext, solvePuzzle, deduceSolve, canonicalShapeKey } = S;

function makeGrid(w, h, v = 1){ return Array.from({ length: h }, () => Array(w).fill(v)); }
function collectSpecialEdges(walls){
  const edges = [];
  walls.forEach((type, key) => {
    if(type === 'wall') return;
    const [orient, rest] = key.split(':');
    const [c, r] = rest.split(',').map(Number);
    const [c2, r2] = orient === 'v' ? [c+1, r] : [c, r+1];
    if(['delta','gemini','lt','gt'].includes(type)) edges.push({ c1:c, r1:r, c2, r2, kind: type });
    else if(type.startsWith('diff')) edges.push({ c1:c, r1:r, c2, r2, kind:'diff', value: parseInt(type.slice(4), 10) });
  });
  return edges;
}

// small deterministic PRNG
function rng(seed){ let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const BANK_SHAPES = [
  [[0,0],[1,0]], [[0,0],[1,0],[2,0]], [[0,0],[0,1],[1,1]], [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[3,0]], [[0,0]], [[0,0],[1,0],[2,0],[1,1]], [[0,0],[1,0],[1,1],[2,1]]
];

// opts.rich: also random special walls / symbols / rules
function randomPuzzle(seed, o){
  o = o || {};
  const R = rng(seed);
  const pick = n => Math.floor(R() * n);
  const w = o.w || 2 + pick(o.maxW || 4), h = o.h || 2 + pick(o.maxH || 4);
  const active = makeGrid(w, h, 1);
  const holes = o.holes != null ? o.holes : 0.12;
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(R() < holes) active[r][c] = 0;
  const walls = new Map();
  const wallP = o.wallP != null ? o.wallP : 0.12;
  const specials = ['delta','gemini','lt','gt','diff0','diff1','diff2'];
  for(let r=0;r<h;r++) for(let c=0;c<w;c++){
    if(!active[r][c]) continue;
    if(c+1<w && active[r][c+1] && R() < wallP){
      let t = 'wall';
      if(o.rich && !o.noSpecials && R() < 0.3){ t = specials[pick(specials.length)]; if(t==='lt'||t==='gt') t = R()<.5?'lt':'gt'; }
      walls.set(`v:${c},${r}`, t);
    }
    if(r+1<h && active[r+1][c] && R() < wallP){
      let t = 'wall';
      if(o.rich && !o.noSpecials && R() < 0.3) t = specials[pick(specials.length)];
      walls.set(`h:${c},${r}`, t);
    }
  }
  const roses = new Map(), polyominoes = new Map(), areaNumbers = new Map();
  const cells = [];
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(active[r][c]) cells.push([c,r]);
  const symP = o.symP != null ? o.symP : 0.15;
  const usedSym = new Set();
  const total = cells.length;
  for(const [c,r] of cells){
    if(R() > symP) continue;
    const k = `${c},${r}`;
    const t = pick(3);
    if(t === 0) areaNumbers.set(k, 1 + pick(Math.max(2, Math.min(total, 6))));
    else if(t === 1 && o.rich) roses.set(k, 1 + pick(2));
    else if(t === 2 && o.rich){
      const sh = BANK_SHAPES[pick(4)];
      polyominoes.set(k, { cells: sh, canonicalKey: canonicalShapeKey(sh) });
    } else areaNumbers.set(k, 1 + pick(Math.max(2, Math.min(total, 6))));
  }
  const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
  const rp = pick(8);
  if(rp === 0) rules.precision = 2 + pick(3);
  else if(rp === 1) rules.max = 2 + pick(4);
  else if(rp === 2){ rules.min = 2; rules.max = 2 + pick(4); }
  else if(rp === 3) rules.min = 2;
  if(o.rich){
    if(R() < 0.12) rules.mismatch = true;
    if(R() < 0.06) rules.match = true;
    if(R() < 0.12) rules.mingleShape = true;
    if(R() < 0.12) rules.mingleArea = true;
    if(R() < 0.1) rules.solitude = true;
    if(R() < 0.1) rules.boxy = true;
    if(R() < 0.05) rules.nonBoxy = true;
  } else if(R() < .2) rules.mingleArea = true;
  const bank = [];
  if(o.bank !== false && R() < (o.bankP != null ? o.bankP : 0.3)){
    const n = 1 + pick(3);
    for(let i=0;i<n;i++) bank.push({ id: i+1, cells: BANK_SHAPES[pick(BANK_SHAPES.length)] });
  }
  return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules };
}

function sig(pieces){
  return pieces.map(p => p.cells.map(([c,r]) => `${c},${r}`).sort().join(';')).sort().join('|');
}

function exact(P, maxSolutions, budget){
  const ctx = buildSolverContext(P.puzzle, P.bank, P.rules, P.hints, P.ban);
  const se = collectSpecialEdges(P.puzzle.walls);
  const sols = []; let exceeded = false;
  for(const ev of solvePuzzle(P.puzzle.w, P.puzzle.h, ctx, se, budget || 300000)){
    if(ev.type === 'solution'){ sols.push(ev.pieces); if(maxSolutions && sols.length >= maxSolutions) break; }
    else if(ev.type === 'budget-exceeded'){ exceeded = true; break; }
  }
  return { sols, exceeded };
}

function deduce(P, dopts, maxSolutions, budget){
  const ctx = buildSolverContext(P.puzzle, P.bank, P.rules, P.hints, P.ban);
  const se = collectSpecialEdges(P.puzzle.walls);
  const sols = []; const events = []; let exceeded = false;
  const keep = dopts && dopts.keepEvents;
  const extra = process.env.FUZZ_OPTS ? JSON.parse(process.env.FUZZ_OPTS) : null;          // v87: extra solver options for every deduce run (e.g. '{"portfolio":false}')
  for(const ev of deduceSolve(P.puzzle.w, P.puzzle.h, ctx, se, Object.assign({ nodeBudget: budget || 300000 }, dopts, extra || {}))){
    if(keep && ev.type !== 'progress') events.push(ev);
    if(ev.type === 'solution'){ sols.push(ev.pieces); if(maxSolutions && sols.length >= maxSolutions) break; }
    else if(ev.type === 'budget-exceeded'){ exceeded = true; break; }
  }
  return { sols, exceeded, events };
}
module.exports = { S, CORE_PATH, makeGrid, collectSpecialEdges, rng, randomPuzzle, sig, exact, deduce, BANK_SHAPES };

// A puzzle built around a planted tiling, so most instances are solvable and many are (nearly) unique.
function plantedPuzzle(seed, o){
  o = o || {};
  const R = rng(seed);
  const pick = n => Math.floor(R() * n);
  const w = o.w || 3 + pick(o.maxW || 3), h = o.h || 3 + pick(o.maxH || 3);
  const active = makeGrid(w, h, 1);
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(R() < (o.holes != null ? o.holes : 0.06)) active[r][c] = 0;
  // random tiling (o.loopyColor: a LOOPY-valid tiling = the monochrome 4-connected components of a 2-colouring of the tiles, tiles beside the outline have colour 1; v37): grow regions from random seeds up to a random target size
  const pieceOf = makeGrid(w, h, -1);
  const pieces = [];
  if(o.loopyColor){
    const col = makeGrid(w, h, 0), pOne = o.colorP != null ? o.colorP : 0.5;
    for(let r=0;r<h;r++) for(let c=0;c<w;c++){
      const edge = c === 0 || r === 0 || c === w - 1 || r === h - 1;
      col[r][c] = edge ? 1 : (R() < pOne ? 1 : 0);
    }
    for(let r0=0;r0<h;r0++) for(let c0=0;c0<w;c0++){
      if(pieceOf[r0][c0] !== -1) continue;
      const id = pieces.length, cells = [[c0,r0]]; pieceOf[r0][c0] = id;
      for(let k = 0; k < cells.length; k++){
        const [c,r] = cells[k];
        for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const nc=c+dc, nr=r+dr;
          if(nc>=0&&nr>=0&&nc<w&&nr<h&&pieceOf[nr][nc]===-1&&col[nr][nc]===col[r0][c0]){ pieceOf[nr][nc] = id; cells.push([nc,nr]); }
        }
      }
      pieces.push(cells);
    }
  } else {
  const maxSz = o.maxPiece || 6;
  const order = [];
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(active[r][c]) order.push([c,r]);
  for(let i = order.length - 1; i > 0; i--){ const j = pick(i+1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0,r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length; const cells = [[c0,r0]]; pieceOf[r0][c0] = id;
    const target = 1 + pick(maxSz);
    while(cells.length < target){
      const cand = [];
      for(const [c,r] of cells) for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nc=c+dc, nr=r+dr;
        if(nc>=0&&nr>=0&&nc<w&&nr<h&&active[nr][nc]&&pieceOf[nr][nc]===-1) cand.push([nc,nr]);
      }
      if(!cand.length) break;
      const [nc,nr] = cand[pick(cand.length)];
      pieceOf[nr][nc] = id; cells.push([nc,nr]);
    }
    pieces.push(cells);
  }
  }
  const walls = new Map(), roses = new Map(), polyominoes = new Map(), areaNumbers = new Map();
  const wallP = o.wallP != null ? o.wallP : 0.35;
  const sizeOf = id => pieces[id].length;
  const specials = ['delta','gemini','lt','gt','diff0','diff1','diff2','diff3'];
  function addBoundaryWall(orient, c, r, c2, r2){
    const a = pieceOf[r][c], b = pieceOf[r2][c2];
    if(a === b) return;
    if(R() >= wallP) return;
    let type = 'wall';
    if(o.rich && !o.noSpecials && R() < 0.5){
      // pick a relation that the planted tiling actually satisfies
      const sa = sizeOf(a), sb = sizeOf(b);
      const ka = canonicalShapeKey(pieces[a]), kb = canonicalShapeKey(pieces[b]);
      const opts = [];
      if(ka !== kb) opts.push('delta'); else opts.push('gemini');
      if(sa < sb) opts.push('lt'); if(sa > sb) opts.push('gt');
      const d = Math.abs(sa - sb); if(d <= 9) opts.push('diff' + d);
      type = opts[pick(opts.length)];
    }
    walls.set(`${orient}:${c},${r}`, type);
  }
  for(let r=0;r<h;r++) for(let c=0;c<w;c++){
    if(!active[r][c]) continue;
    if(c+1<w && active[r][c+1]) addBoundaryWall('v', c, r, c+1, r);
    if(r+1<h && active[r+1][c]) addBoundaryWall('h', c, r, c, r+1);
  }
  const clueP = o.clueP != null ? o.clueP : 0.5;
  const minPiece = Math.min(...pieces.map(p => p.length));
  const roseTypes = o.rich && R() < 0.35 ? Math.min(minPiece, 1 + pick(2)) : 0;   // 0 = no roses; else each piece gets one of each type
  pieces.forEach((cells, id) => {
    if(roseTypes){
      for(let t = 1; t <= roseTypes; t++){
        let k; do { const [c,r] = cells[pick(cells.length)]; k = `${c},${r}`; } while(roses.has(k));
        roses.set(k, t);
      }
      return;
    }
    if(R() < clueP){
      const [c,r] = cells[pick(cells.length)];
      const k = `${c},${r}`;
      const t = o.rich ? pick(3) : 0;
      if(t === 2) polyominoes.set(k, { cells: cells.map(([x,y]) => [x - Math.min(...cells.map(q=>q[0])), y - Math.min(...cells.map(q=>q[1]))]), canonicalKey: canonicalShapeKey(cells) });
      else areaNumbers.set(k, cells.length);
    }
  });
  // roses and other symbols must not share a tile -- roses win (only when roseTypes), already exclusive here
  const sizes = pieces.map(p => p.length);
  const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
  const mn = Math.min(...sizes), mx = Math.max(...sizes);
  const rp = pick(6);
  if(rp === 0){ rules.min = mn; }
  else if(rp === 1){ rules.max = mx; }
  else if(rp === 2){ rules.min = mn; rules.max = mx; }
  // planted-consistent boolean rules
  const keys = pieces.map(p => canonicalShapeKey(p));
  if(o.rich){
    if(new Set(keys).size === keys.length && R() < 0.5) rules.mismatch = true;
    // mingle: every adjacent pair of pieces differs
    let adjOk = { shape: true, area: true };
    for(let r=0;r<h;r++) for(let c=0;c<w;c++){
      if(!active[r][c]) continue;
      for(const [dc,dr] of [[1,0],[0,1]]){
        const nc=c+dc, nr=r+dr; if(nc>=w||nr>=h||!active[nr][nc]) continue;
        const a = pieceOf[r][c], b = pieceOf[nr][nc]; if(a===b) continue;
        if(keys[a] === keys[b]) adjOk.shape = false;
        if(sizes[a] === sizes[b]) adjOk.area = false;
      }
    }
    if(adjOk.shape && R() < 0.5) rules.mingleShape = true;
    if(adjOk.area && R() < 0.5) rules.mingleArea = true;
    if(pieces.every(p => isRect(p)) && R() < 0.5) rules.boxy = true;
    else if(pieces.every(p => !isRect(p)) && R() < 0.5) rules.nonBoxy = true;
  }
  const bank = [];
  if(o.bank !== false && R() < (o.bankP != null ? o.bankP : 0.3)){
    const seen = new Set();
    pieces.forEach((cells, id) => {
      const k = keys[id]; if(seen.has(k)) return; seen.add(k);
      const mnx = Math.min(...cells.map(q=>q[0])), mny = Math.min(...cells.map(q=>q[1]));
      bank.push({ id: bank.length + 1, cells: cells.map(([x,y]) => [x-mnx, y-mny]) });
    });
    if(R() < 0.5 && bank.length > 1) bank.splice(pick(bank.length), 1);   // sometimes a bank that cannot tile
  }
  return { puzzle: { w, h, active, walls, roses, polyominoes, areaNumbers }, bank, rules, planted: pieces };
}
function isRect(cells){
  const xs = cells.map(q=>q[0]), ys = cells.map(q=>q[1]);
  return cells.length === (Math.max(...xs)-Math.min(...xs)+1)*(Math.max(...ys)-Math.min(...ys)+1);
}
module.exports.plantedPuzzle = plantedPuzzle;
