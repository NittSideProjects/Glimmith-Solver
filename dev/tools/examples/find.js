// Looks for examples of one rule under conditions the author asks for, and prints the simplest ones as records for curated.json.
// node find.js <core.js> <fuzzlib.js> <rule> <mechanic every board gets, or -> <seconds> [key=value ...]
//   tiles=N    at least N tiles           before=N   at most N decisions by other rules before the step (default 0)
//   stamp=N    every polyomino clue has at least N tiles      area=N   every area number is at least N
//   only=1     no second mechanic         first=1    the rule's step is the very first step      noarea=1   no area numbers
//   apart=1    no two polyomino clues side by side
'use strict';
const [, , corePath, libPath, rule, focus, seconds, ...opts] = process.argv;
const o = Object.fromEntries(opts.map(x => x.split('=')));
process.argv = [process.argv[0], 'tiny.js', corePath, libPath, '', '0', o.seed || '1', focus === '-' ? '' : focus];
const { make } = require('./tiny.js'), { minimize } = require('./minimize.js');
const S = require(corePath), L = require(libPath), X = require('./lib.js');
const minTiles = +o.tiles || 0, maxBefore = +o.before || 0;
const valid = rec => X.tiles(rec) >= minTiles && (!o.stamp || (rec.puzzle.polyominoes || []).every(([, v]) => v.cells.length >= +o.stamp))
  && (!o.area || (rec.puzzle.areaNumbers || []).every(([, v]) => v >= +o.area)) && (!o.only || X.mechanics(rec).length <= 1) && (!o.noarea || !(rec.puzzle.areaNumbers || []).length)
  && (!o.apart || (rec.puzzle.polyominoes || []).every(([k], i, all) => all.every(([q], j) => i === j || Math.abs(k.split(',')[0] - q.split(',')[0]) + Math.abs(k.split(',')[1] - q.split(',')[1]) > 1)));
const before = (res, key) => res.events.slice(0, res.firstAt.get(key).at).filter(e => e.t === 'd' && e.r !== key).length;
const found = new Map(), end = Date.now() + (+seconds || 30) * 1000; let n = 0;
while(Date.now() < end){
  const g = make(); if(!g || !valid(g.rec)) continue;
  const res = X.run(S, L, g.rec); if(!res || !res.firstAt.has(rule) || before(res, rule) > maxBefore) continue;
  if(o.first && res.firstAt.get(rule).at !== 0) continue;
  const m = minimize(g.rec, rule, valid); if(!m) continue;
  const r2 = X.run(S, L, m.rec); if(before(r2, rule) > maxBefore) continue;
  n++; const id = JSON.stringify(m.rec); if(!found.has(id)) found.set(id, m);
}
const draw = rec => { const p = rec.puzzle, at = new Map();
  for(const [f, ch] of [['areaNumbers', null], ['roses', 'r'], ['polyominoes', 'P'], ['palisades', 'p'], ['compasses', 'c']]) for(const [k, v] of p[f] || []) at.set(k, ch ? ch + (f === 'roses' ? v : f === 'polyominoes' ? v.cells.length : '') : String(v));
  return p.active.map((row, r) => row.map((a, c) => a ? (at.get(`${c},${r}`) || '.').padEnd(3) : '   ').join('')).join('\n'); };
console.log(n, 'hits,', found.size, 'different');
for(const m of [...found.values()].sort((a, b) => a.score - b.score).slice(0, +o.show || 6)){
  console.log('\n--', m.sig, 'tiles', m.tiles, m.unique ? 'unique' : 'several solutions', 'score', m.score);
  console.log(draw(m.rec)); console.log(JSON.stringify(m.rec));
  console.log(m.events.filter(e => e.t !== 's').map(e => e.t === 'f' ? 'fact' : `${e.r}:${e.k}=${e.v === 'same' ? 'link' : 'wall'}`).join(' '));
}
