// Core v106: every tile keeps the exact set of sizes its piece can have, holes included. Synthetic boards:
//  - Delta: a piece of 1 tile on one side of a Delta wall, so the other side can not be 1 tile (one shape of 1 tile): it grows;
//  - the same with a domino on the left (one shape of 2 tiles);
//  - the walls that compare sizes: a set with a hole ({1, 5} across a difference 2 from a 3) is kept;
// and every decision holds in every tiling the exact search finds.
// node tests/solver/test_sizeset106.js
'use strict';
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v114.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const RULES = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
const board = (rows, walls, areas, rules) => ({ puzzle: { w: rows[0].length, h: rows.length, active: rows.map(r => [...r].map(c => c === '.' ? 0 : 1)), walls: new Map(walls), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(areas) }, bank: [], rules: Object.assign({}, RULES, rules) });
const run = (P, extra) => { const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, []), ev = [];
  for(const e of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ nodeBudget: 200000, stopAtTwo: true, testNodes: 20 }, extra))) ev.push(e);
  return { ded: ev.filter(e => e.type === 'deduce'), sols: ev.filter(e => e.type === 'solution').length }; };
const pieceOf = sol => { const m = new Map(); sol.forEach((p, i) => (p.cells || p).forEach(([c, r]) => m.set(`${c},${r}`, i))); return m; };
const tiles = k => { const [o, rest] = k.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
function sound(name, P, r){
  const all = L.exact(P, 0, 2000000);
  const bad = r.ded.filter(x => x.via !== 'search' && !all.sols.every(sol => { const m = pieceOf(sol), [p, q] = tiles(x.spot.key); return (m.get(p) === m.get(q)) === (x.value === 'same'); }));
  check(`${name}: every decision holds in all ${all.sols.length} tilings`, !all.exceeded && bad.length === 0, bad.map(x => [x.spot.key, x.value, x.rule]));
  return all.sols.length;
}
// Delta after a single tile: the middle tile must join the right one
{ const P = board(['###'], [['v:0,0', 'delta']], [['0,0', 1]], {});
  const a = run(P), b = run(P, { tileSizes: false }), e = a.ded.find(x => x.spot.key === 'v:1,0'), e2 = b.ded.find(x => x.spot.key === 'v:1,0');
  check('Delta after 1 tile: the other side grows, by a rule', e && e.value === 'same' && e.via === 'rule', e && [e.value, e.via, e.rule]);
  check('... one tiling either way', a.sols === 1 && b.sols === 1, [a.sols, b.sols]);
  sound('Delta after 1 tile', P, a); }
// Delta after a domino (one shape of 2 tiles): the right side can not be 2 tiles; a 2x? strip
{ const P = board(['####'], [['v:1,0', 'delta']], [['0,0', 2]], { max: 2 });
  const a = run(P);
  check('Delta after a domino, at most 2 tiles: the right side is two single tiles', a.sols === 1, a.sols);
  const e = a.ded.find(x => x.spot.key === 'v:2,0');
  check('... the wall between them: the right side can not be 2 tiles ("Different sizes")', e && e.value === 'wall' && e.via === 'rule' && e.rule === 'size-range', e && [e.value, e.via, e.rule]);
  sound('Delta after a domino', P, a); }
// a set with a hole: across a difference 2 from a piece of 3, the other side is 1 or 5, never 3 or 4
{ const P = board(['#####', '#####'], [['v:0,0', 'diff2']], [['0,1', 3]], {});
  const a = run(P);
  sound('difference 2 from a 3', P, a);
  check('difference 2 from a 3: a verdict', a.sols >= 1, a.sols); }
console.log(`tile size sets (core v106): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
