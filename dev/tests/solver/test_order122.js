// core v122: (1) a wall between two groups known to be different (a wall already between two of their tiles) is a 'basic' step;
// (2) two area numbers that add up to more than the area closed in by walls round them are one piece ('area-pair'). Synthetic boards.
const L = require('../../fuzzlib.js'), S = require('../../reference/solver-core.v127.js');
let pass = 0, fail = 0; const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL', n, x !== undefined ? JSON.stringify(x) : ''); } };
const run = (pz, rules) => { const ctx = S.buildSolverContext(pz, [], rules || {}, null, []); return [...S.deduceSolve(pz.w, pz.h, ctx, L.collectSpecialEdges(pz.walls), { stopAtTwo: true })]; };
const base = (w, h, extra) => Object.assign({ w, h, active: Array.from({ length: h }, () => Array(w).fill(1)), walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(), compasses: new Map(), watchtowers: new Map() }, extra);
// (1) two linked pairs side by side, a wall between their top tiles: the bottom edge between them is a wall, known to be different
{
  const ev = run(base(2, 2, { walls: new Map([['v:0,0', 'wall'], ['h:0,0', 'link'], ['h:1,0', 'link']]) }), { links: true });
  const d = ev.find(e => e.type === 'deduce' && e.spot.key === 'v:0,1');
  check('the bottom edge is a wall', d && d.value === 'wall', d && [d.value, d.rule]);
  check('... because the two groups are known to be different', d && d.rule === 'basic', d && d.rule);
}
// (2) two 4s at opposite corners of a 3x2 area: 4 + 4 > 6, so they are one piece
{
  const ev = run(base(3, 2, { areaNumbers: new Map([['0,0', 4], ['2,1', 4]]) }));
  const f = ev.find(e => e.type === 'fact' && e.rule === 'area-pair');
  check('the two 4s are joined by the area-pair step', !!f && ((f.a + '' === '0,0' && f.b + '' === '2,1') || (f.a + '' === '2,1' && f.b + '' === '0,0')), f && [f.a, f.b]);
  check('no probe was needed for it', !ev.some(e => e.type === 'deduce' && e.via === 'probe'));
}
// (2b) different numbers that do not fit side by side: impossible, with the reason
{
  const ev = run(base(3, 2, { areaNumbers: new Map([['0,0', 4], ['2,1', 3]]) }));
  const im = ev.find(e => e.type === 'impossible-early');
  check('4 and 3 in an area of 6: impossible (the piece count may say it first)', !!im, im && im.why);
}
// (2c) the numbers fit: nothing is said
{
  const ev = run(base(4, 2, { areaNumbers: new Map([['0,0', 4], ['3,1', 4]]) }));
  check('two 4s in an area of 8 fit side by side: no area-pair step', !ev.some(e => (e.type === 'fact' || e.type === 'deduce') && e.rule === 'area-pair'));
}
console.log(`test_order122: core v122 order (basic first, area-pair): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
