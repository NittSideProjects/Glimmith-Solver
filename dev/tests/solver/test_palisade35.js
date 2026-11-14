// PALISADE (v35): every example of the footer entry, checked three ways:
//   1. what the solver decides (rule tag included),
//   2. it is TRUE: an independent pruned search (below, shares nothing with solver-core) finds no tiling that has the opposite value,
//   3. impossible examples: that search finds no tiling at all; solvable ones: it finds at least one.
// node test_palisade35.js
const L = require('../../fuzzlib.js'), S = require('../../reference/solver-core.v102.js'), S34 = require('../../reference/solver-core.v102.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const R0 = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
const mk = (w, h, pal, o = {}) => ({ puzzle: { w, h, active: o.active || Array.from({ length: h }, () => Array(w).fill(1)), walls: new Map(o.walls || []), roses: new Map(o.roses || []), polyominoes: new Map(), areaNumbers: new Map(), palisades: new Map(pal), compasses: new Map(), watchtowers: new Map() }, bank: [], rules: Object.assign({}, R0, o.rules || {}) });
function deduce(Core, Q){
  const ctx = Core.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null), out = {}; let imp = null, why = null;
  for(const ev of Core.deduceSolve(Q.puzzle.w, Q.puzzle.h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { testNodes: 1 })){
    if(ev.type === 'deduce') out[ev.spot.key] = ev.value + ':' + ev.rule;
    if(ev.type === 'impossible-early'){ imp = ev.reason; why = ev.why; break; }
    if(ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break;
  }
  return { out, imp, why };
}
const { tiling } = require('../../pal_refuter.js');
function ex(name, Q, want){
  const d = deduce(S, Q);
  if(want.imp){
    check(name + ': impossible by ' + want.imp, d.imp !== null && d.why === want.imp, [d.why]);
    check(name + ': really no tiling', tiling(Q) === false);
    return;
  }
  check(name + ': not wrongly impossible', d.imp === null, [d.imp, d.why]);
  check(name + ': has a tiling', tiling(Q) === true);
  for(const [k, v] of Object.entries(want.edges || {})) check(name + ': ' + k + ' = ' + v, d.out[k] === v, d.out[k]);
  for(const [k, v] of Object.entries(d.out)){                      // everything decided is true: the opposite value has no tiling
    const same = v.startsWith('same');
    if(tiling(Q, { key: k, v: same ? 1 : 0 })) check(name + ': decided ' + k + ' ' + v + ' holds in every tiling', false);
  }
  for(const k of want.none || []) check(name + ': ' + k + ' is NOT decided', d.out[k] === undefined, d.out[k]);
  pass++;
}
const imp = why => ({ imp: why });
// ================= 1. the outline (and an empty tile) is a wall =================
ex('0 on the outline', mk(4, 4, [['1,0', '0']]), imp('pal-count'));
ex('1 on the outline: the other three sides are links', mk(4, 4, [['1,0', '1']]), { edges: { 'v:0,0': 'same:pal-link', 'v:1,0': 'same:pal-link', 'h:1,0': 'same:pal-link' } });
ex('straight 2 on the outline: wall across, links along', mk(4, 4, [['1,0', '2s']]), { edges: { 'h:1,0': 'wall:pal-wall', 'v:0,0': 'same:pal-link', 'v:1,0': 'same:pal-link' } });
ex('bend 2 on the outline: the side across is a link', mk(4, 4, [['1,0', '2c']]), { edges: { 'h:1,0': 'same:pal-link' }, none: ['v:0,0', 'v:1,0'] });
ex('bend 2 in a corner: both inner sides are links', mk(4, 4, [['0,0', '2c']]), { edges: { 'v:0,0': 'same:pal-link', 'h:0,0': 'same:pal-link' } });
ex('1 in a corner', mk(4, 4, [['0,0', '1']]), imp('pal-count'));
ex('straight 2 in a corner', mk(4, 4, [['0,0', '2s']]), imp('pal-count'));
ex('0 in a corner', mk(4, 4, [['0,0', '0']]), imp('pal-count'));
ex('3 in a corner: one of the two inner sides is open, nothing decided', mk(4, 4, [['0,0', '3']]), { edges: {}, none: ['v:0,0', 'h:0,0'] });
ex('1 next to an empty tile: the hole is its wall', mk(4, 4, [['1,1', '1']], { active: [[1, 1, 1, 1], [1, 1, 0, 1], [1, 1, 1, 1], [1, 1, 1, 1]] }), { edges: { 'v:0,1': 'same:pal-link', 'h:1,0': 'same:pal-link', 'h:1,1': 'same:pal-link' } });
// ================= 2. count the sides that are left =================
ex('0: four links', mk(4, 4, [['1,1', '0']]), { edges: { 'v:0,1': 'same:pal-link', 'v:1,1': 'same:pal-link', 'h:1,0': 'same:pal-link', 'h:1,1': 'same:pal-link' } });
ex('straight 2 with a wall above: wall below, links on both sides', mk(4, 4, [['1,1', '2s']], { walls: [['h:1,0', 'wall']] }), { edges: { 'h:1,1': 'wall:pal-wall', 'v:0,1': 'same:pal-link', 'v:1,1': 'same:pal-link' } });
ex('1 with its wall known: three links', mk(4, 4, [['1,1', '1']], { walls: [['v:0,1', 'wall']] }), { edges: { 'h:1,0': 'same:pal-link', 'h:1,1': 'same:pal-link', 'v:1,1': 'same:pal-link' } });
ex('bend 2 with walls above and right: links below and left', mk(4, 4, [['1,1', '2c']], { walls: [['h:1,0', 'wall'], ['v:1,1', 'wall']] }), { edges: { 'h:1,1': 'same:pal-link', 'v:0,1': 'same:pal-link' } });
ex('bend 2 with a wall above: the side below is a link', mk(4, 4, [['1,1', '2c']], { walls: [['h:1,0', 'wall']] }), { edges: { 'h:1,1': 'same:pal-link' } });
ex('3 with three walls known: the fourth side is the link', mk(4, 4, [['1,1', '3']], { walls: [['h:1,0', 'wall'], ['v:0,1', 'wall'], ['h:1,1', 'wall']] }), { edges: { 'v:1,1': 'same:pal-link' } });
// ================= 3. how big the piece is =================
ex('1 needs 4 tiles: Maximum 3', mk(4, 4, [['1,1', '1']], { rules: { max: 3 } }), imp('pal-size'));
ex('0 needs 5 tiles: Maximum 4', mk(4, 4, [['1,1', '0']], { rules: { max: 4 } }), imp('pal-size'));
ex('a 4 is one tile: Precision 2', mk(4, 4, [['1,1', '4']], { rules: { precision: 2 } }), imp('size'));
ex('straight 2 needs 3 tiles: Precision 2', mk(4, 4, [['1,1', '2s']], { rules: { precision: 2 } }), imp('pal-size'));
ex('bend 2 needs 3 tiles: Maximum 2', mk(4, 4, [['1,1', '2c']], { rules: { max: 2 } }), imp('pal-size'));
ex('3 needs 2 tiles: Precision 1', mk(4, 4, [['1,1', '3']], { rules: { precision: 1 } }), imp('pal-size'));
ex('4: four walls', mk(4, 4, [['1,1', '4']]), { edges: { 'v:0,1': 'wall:pal-size', 'v:1,1': 'wall:pal-size', 'h:1,0': 'wall:pal-size', 'h:1,1': 'wall:pal-size' } });
// ================= 4. side by side: the shared side counts for both =================
ex('0 beside a 3: the 3 opens towards the 0, its other sides are walls', mk(4, 4, [['1,1', '0'], ['2,1', '3']]), { edges: { 'v:1,1': 'same:pal-link', 'h:2,0': 'wall:pal-wall', 'h:2,1': 'wall:pal-wall', 'v:2,1': 'wall:pal-wall' } });
ex('0 beside a 4', mk(4, 4, [['1,1', '0'], ['2,1', '4']]), imp('pal-count'));
ex('0 beside a straight 2: it runs along the 0', mk(4, 4, [['1,1', '0'], ['2,1', '2s']]), { edges: { 'v:1,1': 'same:pal-link', 'v:2,1': 'same:pal-link', 'h:2,0': 'wall:pal-wall', 'h:2,1': 'wall:pal-wall' } });
ex('0 beside a bend 2: the side across is a wall', mk(4, 4, [['1,1', '0'], ['2,1', '2c']]), { edges: { 'v:1,1': 'same:pal-link', 'v:2,1': 'wall:pal-wall' } });
ex('4 beside a straight 2: it runs across the 4', mk(4, 4, [['1,1', '4'], ['2,1', '2s']]), { edges: { 'v:1,1': 'wall:pal-size', 'v:2,1': 'wall:pal-wall', 'h:2,0': 'same:pal-link', 'h:2,1': 'same:pal-link' } });
// ================= 5. corner to corner: a 2x2 block never has exactly one wall =================
ex('1 corner to corner with a straight 2: the far sides of the 1 are links', mk(4, 4, [['1,1', '1'], ['2,2', '2s']]), { edges: { 'h:1,0': 'same:pal-pair', 'v:0,1': 'same:pal-pair' } });
ex('the same from the other side (the 2 above and left)', mk(4, 4, [['1,1', '2s'], ['2,2', '1']]), { edges: { 'v:2,2': 'same:pal-pair', 'h:2,2': 'same:pal-pair' } });
ex('0 corner to corner with a straight 2', mk(4, 4, [['1,1', '0'], ['2,2', '2s']]), imp('pal-pair'));
ex('0 corner to corner with a 3: the sides of the 3 facing the 0 are walls', mk(4, 4, [['1,1', '0'], ['2,2', '3']]), { edges: { 'h:2,1': 'wall:pal-pair', 'v:1,2': 'wall:pal-pair' } });
// ================= 6. only two pieces: opposite sides of a straight 2 are the same piece, of a bend 2 different pieces =================
ex('two pieces (Precision 8), straight 2: its opposite sides are one piece', mk(4, 4, [['1,1', '2s']], { rules: { precision: 8 }, walls: [['h:2,0', 'wall']] }), { edges: { 'v:1,0': 'same:pal-two' } });
ex('two pieces (2 roses), straight 2', mk(4, 4, [['1,1', '2s']], { roses: [['0,0', 1], ['3,3', 1]], walls: [['h:2,0', 'wall']] }), { edges: { 'v:1,0': 'same:pal-two' } });
ex('two pieces (Precision 8), bend 2: its opposite sides are different pieces', mk(4, 4, [['1,1', '2c']], { rules: { precision: 8 }, walls: [['h:2,0', 'wall']] }), { edges: { 'v:1,0': 'same:pal-two' } });
ex('two pieces not certain (Minimum 3 on 4x4): no parity', mk(4, 4, [['1,1', '2s']], { rules: { min: 3 }, walls: [['h:2,0', 'wall']] }), { edges: {}, none: ['v:1,0'] });
// ================= 7. a piece that holds a palisade (Boxy rectangles) =================
ex('Boxy, a 0 in the middle of 3x3: the piece is the whole board', mk(3, 3, [['1,1', '0']], { rules: { boxy: true } }), { edges: { 'v:0,0': 'same:boxy-corner', 'h:0,0': 'same:boxy-corner' } });
ex('Boxy, Maximum 4, a 1 on the side of 3x3 needs a rectangle of 6', mk(3, 3, [['0,1', '1']], { rules: { boxy: true, max: 4 } }), imp('boxy-corner'));
// ================= 8. nothing changes without palisades =================
{ const Q = mk(4, 4, [], { walls: [['v:1,1', 'wall']] }); const a = deduce(S, Q), b = deduce(S34, Q); check('no palisade: v35 = v34', JSON.stringify(a.out) === JSON.stringify(b.out) && a.imp === b.imp); }
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
