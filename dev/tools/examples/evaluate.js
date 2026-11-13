// For every recorded puzzle (smallest first), run the solver with the page's default settings and keep, for every rule a step can
// show, the best example: fewest tiles, a unique puzzle preferred (a unique one may be up to 1.5x bigger).
// node evaluate.js <core.js> <fuzzlib.js> <puzzles.jsonl (several: a,b)> <out examples.json> [max seconds] [max tiles]
'use strict';
const fs = require('fs');
const [, , corePath, libPath, inPath, outPath, maxSec, maxTiles] = process.argv;
const S = require(corePath), L = require(libPath);
const PAGE_OPTS = { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true,
  nodeBudget: 200000, exact: 'portfolio', slices: 's18,e', fullScan: true };
const M = a => new Map(a || []);
const recs = inPath.split(",").flatMap(f => fs.readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map(l => JSON.parse(l)));
const tiles = r => r.puzzle.active.flat().filter(Boolean).length;
// dedupe and sort by size
const uniq = new Map(); for(const r of recs){ const k = JSON.stringify(r); if(!uniq.has(k)) uniq.set(k, r); }
const list = [...uniq.values()].filter(r => r.puzzle && r.puzzle.active && tiles(r) >= 2).sort((a, b) => tiles(a) - tiles(b));
console.log(list.length, 'puzzles to try');
const best = new Map();                       // ruleKey -> { score, rec, events, unique }
const t0 = Date.now(), deadline = t0 + (+maxSec || 900) * 1000;
const compact = ev => ev.type === 'deduce' ? { t: 'd', k: ev.spot.key, v: ev.value, r: ev.rule, via: ev.via, c: ev.cause, p: ev.pass, y: ev.why || '' }
  : ev.type === 'fact' ? { t: 'f', kind: ev.kind, a: ev.a, b: ev.b, r: ev.rule, c: ev.cause } : { t: 's', cells: ev.cells };
let done = 0;
for(const rec of list){
  if(Date.now() > deadline) break;
  const n = tiles(rec);
  // skip when every rule this size could give already has a smaller unique example (cheap check: nothing to gain above 40 tiles)
  if(n > (+maxTiles || 40)) break;
  const p = rec.puzzle;
  const puzzle = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
    palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
  let ctx; try { ctx = S.buildSolverContext(puzzle, rec.bank, rec.rules, null, rec.ban); } catch(e){ continue; }
  const events = [], firstAt = new Map(); let sols = 0, failed = false; const start = Date.now();
  // as the page's step view: a link between tiles already known to be in one piece belongs to the step on screen, not to its rule
  const par = new Map(), find = k => { while(par.has(k) && par.get(k) !== k) k = par.get(k); return k; }, join = (x, y) => { x = find(x); y = find(y); if(x !== y) par.set(x, y); };
  const tilesOf = key => { const [o, rest] = key.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
  for(const [k, t] of puzzle.walls) if(t === 'link'){ const [x, y] = tilesOf(k); join(x, y); }
  try {
    for(const ev of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(puzzle.walls), PAGE_OPTS)){
      if(ev.type === 'solution') sols++;
      if(ev.type === 'impossible-early'){ failed = true; break; }
      if(ev.type === 'deduce' || ev.type === 'fact' || ev.type === 'shape'){
        events.push(compact(ev));
        let key = null, known = false;
        if(ev.type === 'deduce' && ev.value === 'same'){ const [x, y] = tilesOf(ev.spot.key); known = find(x) === find(y); join(x, y); }
        if(ev.type === 'fact' && ev.kind === 'join') join(ev.a.join(','), ev.b.join(','));
        if(ev.type === 'deduce' && ev.via === 'rule' && !known && !(ev.rule === 'basic' && ev.value === 'same')) key = ev.rule;
        if(ev.type === 'fact' && ev.kind === 'join') key = 'fact:' + ev.rule;
        if(key && !firstAt.has(key)) firstAt.set(key, events.length - 1);
      }
      if(Date.now() - start > 4000){ failed = true; break; }
    }
  } catch(e){ failed = true; }
  done++;
  if(failed || sols === 0) continue;
  const unique = sols === 1, score = n * (unique ? 1 : 1.5);
  for(const [key, at] of firstAt){
    const b = best.get(key);
    if(b && b.score <= score) continue;
    best.set(key, { score, unique, tiles: n, rec, events: events.slice(0, at + 60), at });
  }
}
const out = {}; for(const [k, v] of [...best].sort()) out[k] = v;
fs.writeFileSync(outPath, JSON.stringify(out));
console.log('tried', done, 'in', ((Date.now() - t0) / 1000).toFixed(0), 's; rules with an example:', best.size);
console.log([...best].sort().map(([k, v]) => `${k}:${v.tiles}${v.unique ? 'u' : ''}`).join(' '));
