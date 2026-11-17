// Core v105: every tile keeps the size range of its piece ("tile sizes"), so what one pass finds about sizes (walls that compare
// sizes, reach, closed-in areas, ...) is kept for the next ones. Synthetic planted boards (fuzzlib.plantedPuzzle) with Difference /
// Inequality / Delta walls where two groups end up with no size in common: a wall by the new rule 'size-range'. Checked: the wall
// comes from that rule, the same board without tile sizes does not find it by a rule, the verdict does not change, and every decision
// holds in every tiling the exact search finds.
// node tests/solver/test_tilesize105.js
'use strict';
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v125.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const board = i => L.plantedPuzzle(5000 + i, { w: 4 + (i % 3), h: 4 + (i % 2), maxPiece: 6, rich: true, clueP: 0.3, wallP: 0.1 });
const run = (P, extra) => { const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, []), ev = [];
  for(const e of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), Object.assign({ nodeBudget: 200000, stopAtTwo: true, testNodes: 20 }, extra))) ev.push(e);
  return { ded: ev.filter(e => e.type === 'deduce'), sols: ev.filter(e => e.type === 'solution').length }; };
const pieceOf = sol => { const m = new Map(); sol.forEach((p, i) => (p.cells || p).forEach(([c, r]) => m.set(`${c},${r}`, i))); return m; };
const tiles = k => { const [o, rest] = k.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
for(const [i, key] of [[131, 'v:0,4'], [175, 'h:4,1'], [178, 'h:3,0']]){
  const P = board(i), a = run(P), b = run(P, { tileSizes: false });
  const e = a.ded.find(x => x.spot.key === key), e2 = b.ded.find(x => x.spot.key === key);
  check(`board ${i}: ${key} is a wall by "Different sizes"`, e && e.value === 'wall' && e.via === 'rule' && e.rule === 'size-range', e && [e.value, e.via, e.rule]);
  check(`board ${i}: without tile sizes, not by that rule`, !e2 || e2.rule !== 'size-range', e2 && [e2.via, e2.rule]);
  check(`board ${i}: same verdict`, a.sols === b.sols, [a.sols, b.sols]);
  const all = L.exact(P, 0, 2000000);
  const bad = a.ded.filter(x => x.via !== 'search' && !all.sols.every(sol => { const m = pieceOf(sol), [p, q] = tiles(x.spot.key); return (m.get(p) === m.get(q)) === (x.value === 'same'); }));
  check(`board ${i}: every decision holds in all ${all.sols.length} tilings`, !all.exceeded && all.sols.length >= 1 && bad.length === 0, bad.map(x => [x.spot.key, x.value, x.rule]));
}
console.log(`tile sizes (core v105): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
