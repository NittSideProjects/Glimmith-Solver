#!/usr/bin/env node
// Does the solver ACCEPT the game's own stored solution of every converted puzzle?   (checks the converter AND the solver rules)
//
//   node tools/validate_converted.js [--dir game_puzzles_converted] [--zone Zone1] [--difficulty 3] [--ids Zone1/0008,Zone2/0010]
//                                    [--campaign] [--budget 200000] [--out results.json]
//
// For every puzzle with a stored solution: all edges of the solution are pinned (walls and links), then the exact search (solvePuzzle) must
// find exactly that one tiling. Statuses: ok | REJECTED (solver finds nothing, or another tiling = converter or solver-rule bug) |
// HAND-WALL-NOT-IN-SOLUTION (a wall of the puzzle is not a wall of the solution) | no-solution (file has none) | ERROR.
// This is NOT the uniqueness / timing analysis (that is a later step); with everything pinned it only verifies the rules on a full tiling.
'use strict';
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const L = require(path.join(root, 'fuzzlib.js')), S = L.S;

const args = process.argv.slice(2), opt = {};
for(let i = 0; i < args.length; i++){ if(args[i].startsWith('--')){ const k = args[i].slice(2); opt[k] = (args[i + 1] && !args[i + 1].startsWith('--')) ? args[++i] : true; } }
const dir = path.resolve(opt.dir || path.join(root, 'game_puzzles_converted'));
const budget = Number(opt.budget || 200000);

function loadFile(rel){
  const j = JSON.parse(fs.readFileSync(path.join(dir, rel), 'utf8')), pz = j.puzzles[0], st = pz.state, p = st.puzzle, M = a => new Map(a || []);
  return { name: pz.name, sol: pz.solutionWalls || null,
    P: { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
                   palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) },
         bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] } };
}
function pieces(P, sw){   // components of active tiles not separated by a solution wall
  const { w, h, active } = P.puzzle, seen = Array.from({ length: h }, () => Array(w).fill(false)), out = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c] || seen[r][c]) continue;
    const cells = [], st = [[c, r]]; seen[r][c] = true;
    while(st.length){ const [x, y] = st.pop(); cells.push([x, y]);
      for(const [nx, ny, key] of [[x + 1, y, `v:${x},${y}`], [x - 1, y, `v:${x - 1},${y}`], [x, y + 1, `h:${x},${y}`], [x, y - 1, `h:${x},${y - 1}`]]){
        if(nx < 0 || ny < 0 || nx >= w || ny >= h || !active[ny][nx] || seen[ny][nx] || sw.has(key)) continue; seen[ny][nx] = true; st.push([nx, ny]); } }
    out.push({ cells });
  }
  return out;
}
function wallSig(ps, w, h){
  const id = new Map(); ps.forEach((p, i) => p.cells.forEach(([c, r]) => id.set(`${c},${r}`, i))); const keys = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    const a = id.get(`${c},${r}`); if(a === undefined) continue;
    const b = id.get(`${c + 1},${r}`); if(b !== undefined && a !== b) keys.push(`v:${c},${r}`);
    const d = id.get(`${c},${r + 1}`); if(d !== undefined && a !== d) keys.push(`h:${c},${r}`);
  }
  return keys.sort().join('|');
}
function check(rec){
  const t0 = Date.now(), { P, sol } = loadFile(rec.file), { w, h, active, walls } = P.puzzle;
  if(!sol) return { id: rec.id, status: 'no-solution', ms: 0 };
  const sw = new Set(sol), missing = [...walls.keys()].filter(k => !sw.has(k));
  if(missing.length) return { id: rec.id, status: 'HAND-WALL-NOT-IN-SOLUTION', detail: missing.slice(0, 5).join(' '), ms: Date.now() - t0 };
  const extra = new Set(), links = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c]) continue;
    if(c + 1 < w && active[r][c + 1]){ const k = `v:${c},${r}`; if(!walls.has(k)){ if(sw.has(k)) extra.add(k); else links.push([c, r, c + 1, r]); } }
    if(r + 1 < h && active[r + 1][c]){ const k = `h:${c},${r}`; if(!walls.has(k)){ if(sw.has(k)) extra.add(k); else links.push([c, r, c, r + 1]); } }
  }
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(walls);
  let n = 0, sig = null;
  for(const ev of S.solvePuzzle(w, h, ctx, se, budget, { extraWalls: extra, links })){
    if(ev.type === 'solution'){ n++; sig = wallSig(ev.pieces, w, h); }
    if(n >= 2) break;
  }
  const same = sig === wallSig(pieces(P, sw), w, h);
  const ok = n === 1 && same;
  return { id: rec.id, status: ok ? 'ok' : 'REJECTED', detail: ok ? '' : (n === 0 ? 'solver finds no tiling with the stored solution pinned' : `solver finds ${n}, same=${same}`), ms: Date.now() - t0 };
}

const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
let recs = index.puzzles;
if(opt.zone) recs = recs.filter(r => r.zone === opt.zone);
if(opt.difficulty) recs = recs.filter(r => r.difficulty === Number(opt.difficulty));
if(opt.ids) { const s = new Set(String(opt.ids).split(',')); recs = recs.filter(r => s.has(r.id)); }
if(opt.campaign) recs = recs.filter(r => r.inCampaign);
const results = [], tally = {};
const t0 = Date.now();
for(const rec of recs){
  let res;
  try{ res = check(rec); } catch(e){ res = { id: rec.id, status: 'ERROR', detail: String(e && e.message || e).slice(0, 200), ms: 0 }; }
  results.push(res); tally[res.status] = (tally[res.status] || 0) + 1;
  if(res.status !== 'ok' && res.status !== 'no-solution') console.log(res.status.padEnd(26), res.id.padEnd(14), rec.category.padEnd(26), `${rec.w}x${rec.h}`.padEnd(6), res.detail || '');
}
const slow = results.slice().sort((a, b) => b.ms - a.ms).slice(0, 3).map(r => `${r.id} ${r.ms}ms`).join(', ');
console.log(`checked ${recs.length} puzzle(s) in ${((Date.now() - t0) / 1000).toFixed(1)} s:`, JSON.stringify(tally), '| slowest:', slow);
if(opt.out) fs.writeFileSync(opt.out, JSON.stringify({ tally, results }, null, 1));
process.exitCode = (tally.REJECTED || tally.ERROR || tally['HAND-WALL-NOT-IN-SOLUTION']) ? 1 : 0;
