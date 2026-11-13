// Tiny examples: random boards of 2 to 12 tiles with ONE mechanic (sometimes two, for the rules that need two), helped only by area
// numbers and plain walls. For every rule a step can show it keeps, per kind of case, the simplest puzzle where the solver uses it.
// node tiny.js <core.js> <fuzzlib.js> <out candidates.json> <seconds> <seed> [mechanic every board gets, e.g. wally]
'use strict';
const fs = require('fs');
const [, , corePath, libPath, outPath, maxSec, seedArg, focus] = process.argv;
const S = require(corePath), L = require(libPath);
const X = require('./lib.js');
const R = L.rng(+seedArg || 1), pick = n => Math.floor(R() * n), one = a => a[pick(a.length)];
const RULES = ['precision', 'min', 'max', 'mismatch', 'match', 'mingleShape', 'mingleArea', 'solitude', 'boxy', 'nonBoxy', 'bricky', 'loopy', 'wally', 'heterogeneous'];
const MECH = RULES.concat(['bank', 'ban', 'roses', 'stamp', 'palisade', 'compass', 'tower', 'delta', 'gemini', 'ineq', 'diff', 'link']);
const BAN_SHAPES = [[[0,0],[1,0]], [[0,0],[1,0],[2,0]], [[0,0],[1,0],[0,1]], [[0,0],[1,0],[0,1],[1,1]], [[0,0]], [[0,0],[1,0],[2,0],[1,1]]];
const norm = cells => { const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); return cells.map(([x, y]) => [x - mx, y - my]); };
const isRect = cells => { const n = norm(cells), w = Math.max(...n.map(q => q[0])) + 1, h = Math.max(...n.map(q => q[1])) + 1; return w * h === cells.length; };

function make(){
  const w = 1 + pick(4), h = 1 + pick(4);
  const active = L.makeGrid(w, h, 1);
  if(R() < 0.3){ const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1]]; const [c, r] = one(corners); active[r][c] = 0; if(R() < 0.3){ const [c2, r2] = [pick(w), pick(h)]; active[r2][c2] = 0; } }
  const tiles = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) tiles.push([c, r]);
  if(tiles.length < 2 || tiles.length > 12) return null;
  const on = (c, r) => c >= 0 && r >= 0 && c < w && r < h && active[r][c];
  { const seen = new Set([tiles[0].join()]), q = [tiles[0]]; for(const [c, r] of q) for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) if(on(c+dc, r+dr) && !seen.has(`${c+dc},${r+dr}`)){ seen.add(`${c+dc},${r+dr}`); q.push([c+dc, r+dr]); }
    if(q.length !== tiles.length) return null; }
  // planted tiling
  const pieceOf = L.makeGrid(w, h, -1), pieces = [], maxSz = 1 + pick(5);
  const order = tiles.slice(); for(let i = order.length - 1; i > 0; i--){ const j = pick(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
  for(const [c0, r0] of order){
    if(pieceOf[r0][c0] !== -1) continue;
    const id = pieces.length, cells = [[c0, r0]]; pieceOf[r0][c0] = id; const target = 1 + pick(maxSz);
    while(cells.length < target){
      const cand = []; for(const [c, r] of cells) for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]) if(on(c+dc, r+dr) && pieceOf[r+dr][c+dc] === -1) cand.push([c+dc, r+dr]);
      if(!cand.length) break; const [nc, nr] = one(cand); pieceOf[nr][nc] = id; cells.push([nc, nr]);
    }
    pieces.push(cells);
  }
  const keys = pieces.map(p => S.canonicalShapeKey(p)), sizes = pieces.map(p => p.length);
  const mech = new Set(focus ? [focus] : R() < 0.1 ? [] : [one(MECH)]); if(mech.size && R() < (focus ? 0.12 : 0.35)) mech.add(one(MECH));
  const rules = Object.fromEntries(RULES.map(k => [k, k === 'precision' || k === 'min' || k === 'max' ? null : false]));
  const walls = new Map(), roses = new Map(), polyominoes = new Map(), areaNumbers = new Map(), palisades = new Map(), compasses = new Map(), watchtowers = new Map();
  const used = new Set(); let bank = [], ban = [];
  const inner = [], border = [];                                       // edges inside a piece / between two pieces
  for(const [c, r] of tiles){ if(on(c+1, r)) (pieceOf[r][c] === pieceOf[r][c+1] ? inner : border).push([`v:${c},${r}`, pieceOf[r][c], pieceOf[r][c+1]]);
    if(on(c, r+1)) (pieceOf[r][c] === pieceOf[r+1][c] ? inner : border).push([`h:${c},${r}`, pieceOf[r][c], pieceOf[r+1][c]]); }
  const adjDiff = f => border.every(([, a, b]) => f(a) !== f(b));
  const freeTile = cells => { const f = cells.filter(([c, r]) => !used.has(`${c},${r}`)); if(!f.length) return null; const t = one(f); used.add(t.join()); return t.join(); };
  for(const m of mech){
    if(m === 'precision'){ if(new Set(sizes).size !== 1) return null; rules.precision = sizes[0]; }
    else if(m === 'min') rules.min = Math.min(...sizes);
    else if(m === 'max') rules.max = Math.max(...sizes);
    else if(m === 'mismatch'){ if(new Set(keys).size !== keys.length) return null; rules.mismatch = true; }
    else if(m === 'match'){ if(new Set(keys).size !== 1) return null; rules.match = true; }
    else if(m === 'mingleShape'){ if(!adjDiff(i => keys[i])) return null; rules.mingleShape = true; }
    else if(m === 'mingleArea'){ if(!adjDiff(i => sizes[i])) return null; rules.mingleArea = true; }
    else if(m === 'boxy'){ if(!pieces.every(isRect)) return null; rules.boxy = true; }
    else if(m === 'nonBoxy'){ if(pieces.some(isRect)) return null; rules.nonBoxy = true; }
    else if(m === 'solitude'){ rules.solitude = true; }
    else if(RULES.includes(m)) rules[m] = true;
    else if(m === 'bank'){ const seen = new Set(); pieces.forEach((cells, i) => { if(seen.has(keys[i])) return; seen.add(keys[i]); bank.push({ id: bank.length + 1, cells: norm(cells) }); });
      if(R() < 0.3){ const x = one(BAN_SHAPES); if(!seen.has(S.canonicalShapeKey(x))) bank.push({ id: bank.length + 1, cells: x }); } }
    else if(m === 'ban'){ const x = one(BAN_SHAPES), k = S.canonicalShapeKey(x); if(keys.includes(k)) return null; ban = [{ id: 1, cells: x }]; }
    else if(m === 'roses'){ const T = 1 + pick(2); if(Math.min(...sizes) < T) return null; let n = 0;
      for(const cells of pieces) for(let t = 1; t <= T; t++){ const k = freeTile(cells); if(!k) return null; roses.set(k, t); n++; } }
    else if(m === 'stamp'){ let n = 0; pieces.forEach((cells, i) => { if(R() < 0.5 || (!n && i === pieces.length - 1)){ const k = freeTile(cells); if(k){ polyominoes.set(k, { cells: norm(cells), canonicalKey: keys[i] }); n++; } } }); if(!n) return null; }
    else if(m === 'palisade'){ const n = 1 + pick(2); for(let i = 0; i < n; i++){ const [c, r] = one(tiles); if(used.has(`${c},${r}`)) continue; used.add(`${c},${r}`);
        const sd = [[0,-1],[1,0],[0,1],[-1,0]].map(([dc, dr]) => on(c+dc, r+dr) && pieceOf[r+dr][c+dc] === pieceOf[r][c] ? 0 : 1), s = sd[0] + sd[1] + sd[2] + sd[3];
        palisades.set(`${c},${r}`, s === 2 ? (sd[0] + sd[2] === 1 ? '2c' : '2s') : String(s)); } if(!palisades.size) return null; }
    else if(m === 'compass'){ const n = 1 + (R() < 0.25 ? 1 : 0); for(let i = 0; i < n; i++){ const [c, r] = one(tiles); if(used.has(`${c},${r}`)) continue; used.add(`${c},${r}`);
        const cells = pieces[pieceOf[r][c]], v = { n: cells.filter(q => q[1] < r).length, e: cells.filter(q => q[0] > c).length, s: cells.filter(q => q[1] > r).length, w: cells.filter(q => q[0] < c).length };
        const keep = 1 + pick(2), dirs = ['n', 'e', 's', 'w'].sort(() => R() - 0.5).slice(0, keep); for(const d of ['n', 'e', 's', 'w']) if(!dirs.includes(d)) v[d] = null;
        compasses.set(`${c},${r}`, v); } if(!compasses.size) return null; }
    else if(m === 'tower'){ const n = 1 + (R() < 0.3 ? 1 : 0); for(let i = 0; i < n; i++){ const vc = pick(w + 1), vr = pick(h + 1);
        const around = [[vc-1, vr-1], [vc, vr-1], [vc-1, vr], [vc, vr]].filter(([c, r]) => on(c, r)); if(around.length < 2) continue;
        watchtowers.set(`${vc},${vr}`, new Set(around.map(([c, r]) => pieceOf[r][c])).size); } if(!watchtowers.size) return null; }
    else if(m === 'link'){ if(!inner.length) return null; walls.set(one(inner)[0], 'link'); }
    else { if(!border.length) return null; const n = 1 + (R() < 0.3 ? 1 : 0);
      for(let i = 0; i < n; i++){ const [k, a, b] = one(border); if(walls.has(k)) continue;
        if(m === 'delta'){ if(keys[a] === keys[b]) continue; walls.set(k, 'delta'); }
        else if(m === 'gemini'){ if(keys[a] !== keys[b]) continue; walls.set(k, 'gemini'); }
        else if(m === 'ineq'){ if(sizes[a] === sizes[b]) continue; walls.set(k, sizes[a] < sizes[b] ? 'lt' : 'gt'); }
        else if(m === 'diff') walls.set(k, 'diff' + Math.abs(sizes[a] - sizes[b])); }
      if(![...walls.values()].some(t => t !== 'wall' && t !== 'link')) return null; }
  }
  // helpers: area numbers and plain walls
  const nArea = R() < 0.45 ? 0 : 1 + pick(Math.min(3, pieces.length));
  for(let i = 0; i < nArea; i++){ const p = pick(pieces.length), k = freeTile(pieces[p]); if(k) areaNumbers.set(k, sizes[p]); }
  if(rules.solitude){ const sym = new Map(); for(const m of [roses, polyominoes, areaNumbers, palisades, compasses]) for(const k of m.keys()){ const [c, r] = k.split(',').map(Number); sym.set(pieceOf[r][c], (sym.get(pieceOf[r][c]) || 0) + 1); }
    for(let i = 0; i < pieces.length; i++){ if((sym.get(i) || 0) > 1) return null; if(!sym.get(i)){ const k = freeTile(pieces[i]); if(!k) return null; areaNumbers.set(k, sizes[i]); } } }
  const nWall = R() < 0.5 ? 0 : 1 + pick(2);
  for(let i = 0; i < nWall && border.length; i++){ const [k] = one(border); if(!walls.has(k)) walls.set(k, 'wall'); }
  const P = { w, h, active, walls: [...walls], roses: [...roses], polyominoes: [...polyominoes], areaNumbers: [...areaNumbers], palisades: [...palisades], compasses: [...compasses], watchtowers: [...watchtowers] };
  const clues = walls.size + roses.size + polyominoes.size + areaNumbers.size + palisades.size + compasses.size + watchtowers.size + bank.length + ban.length;
  return { rec: { puzzle: P, rules, bank, ban }, mech: [...mech].sort(), tiles: tiles.length, clues };
}
if(require.main !== module) module.exports = { make };                  // find.js borrows the generator (it sets process.argv first)
else {
const best = {};                                                       // rule -> signature -> candidate
const t0 = Date.now(), deadline = t0 + (+maxSec || 60) * 1000; let made = 0, solved = 0;
while(Date.now() < deadline){
  const g = make(); if(!g) continue; made++;
  const res = X.run(S, L, g.rec); if(!res) continue; solved++;
  const { sols, events, firstAt } = res;
  const unique = sols === 1;
  for(const [key, f] of firstAt){
    // what came before the step: decisions by other rules make the picture harder to read
    const before = events.slice(0, f.at).filter(e => e.t === 'd' && e.r !== key).length;
    const score = g.mech.length * 100 + g.tiles * 3 + g.clues * 2 + before * 2 + (unique ? 0 : 6);
    const wt = [...new Set(g.rec.puzzle.walls.map(([, t]) => /^diff/.test(t) ? 'diff' : t === 'gt' ? 'lt' : t).filter(t => t !== 'wall'))].sort();
    const sig = g.mech.join('+') + '|' + wt.join('+') + '|' + f.v;
    const slot = best[key] || (best[key] = {});
    if(slot[sig] && slot[sig].score <= score) continue;
    slot[sig] = { score, unique, tiles: g.tiles, mech: g.mech, rec: g.rec, events: events.slice(0, f.at + 40), at: f.at };
  }
}
fs.writeFileSync(outPath, JSON.stringify(best));
console.log('made', made, 'solved', solved, 'rules', Object.keys(best).length);
}
