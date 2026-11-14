// Core v101: a group on a wall that compares sizes has at most the tiles it can still reach ("reach cap").
// Synthetic boards: a pocket with a narrow neck; two "difference" walls in the bottom row; the outer groups can reach 1 or 2 tiles,
// so the middle piece is 4 bigger and has to leave through the neck. The rules find it, without a proof by contradiction.
// node tests/solver/test_reachcap101.js
'use strict';
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v102.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const RULES = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
const OPTS = { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 200000, exact: 'portfolio', slices: 's18,e', fullScan: true };
function run(rows, walls, rules, extra){
  const puzzle = { w: rows[0].length, h: rows.length, active: rows.map(r => [...r].map(c => c === '#' ? 1 : 0)), walls: new Map(walls), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() };
  const ctx = S.buildSolverContext(puzzle, [], Object.assign({}, RULES, rules), null, []);
  const ev = [...S.deduceSolve(puzzle.w, puzzle.h, ctx, L.collectSpecialEdges(puzzle.walls), Object.assign({}, OPTS, extra))];
  return { puzzle, rules: Object.assign({}, RULES, rules), ded: ev.filter(e => e.type === 'deduce'), sols: ev.filter(e => e.type === 'solution') };
}
const neck = (r, keys) => keys.map(k => r.ded.find(e => e.spot.key === k));
for(const [name, rows, walls, rules, keys] of [
  ['both outer groups may take one more tile', ['#####', '#####', '..#..', '#####'], [['v:1,3', 'diff4'], ['v:2,3', 'diff4']], {}, ['h:2,2', 'h:2,1']],
  ['a wider board, difference 3', ['.#####', '.#####', '...#..', '######'], [['v:2,3', 'diff3'], ['v:3,3', 'diff3']], {}, ['h:3,2', 'h:3,1']],
]){
  const a = run(rows, walls, rules), b = run(rows, walls, rules, { reachCap: false });
  check(name + ': the neck is linked by a rule', neck(a, keys).every(e => e && e.value === 'same' && e.via === 'rule' && e.rule === 'area-rel'), neck(a, keys).map(e => e && [e.via, e.rule, e.value]));
  check(name + ': without the reach cap it took a proof by contradiction (or nothing)', neck(b, keys).every(e => !e || e.via !== 'rule'), neck(b, keys).map(e => e && [e.via, e.rule]));
  check(name + ': same verdict with and without', a.sols.length === b.sols.length && a.sols.length >= 1, [a.sols.length, b.sols.length]);
  // every decision holds in every tiling the exact search finds (it does not use the deduction rules)
  const all = L.exact({ puzzle: a.puzzle, bank: [], rules: a.rules }, 0, 2000000);
  check(name + ': the exact search lists the tilings', !all.exceeded && all.sols.length >= 1, all.sols.length);
  const pieceOf = sol => { const m = new Map(); sol.forEach((p, i) => (p.cells || p).forEach(([c, r]) => m.set(`${c},${r}`, i))); return m; };
  const tiles = k => { const [o, rest] = k.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
  const bad = a.ded.filter(e => e.via !== 'search' && !all.sols.every(sol => { const m = pieceOf(sol), [x, y] = tiles(e.spot.key); return (m.get(x) === m.get(y)) === (e.value === 'same'); }));
  check(name + ': every decision holds in all ' + all.sols.length + ' tilings', bad.length === 0, bad.map(e => [e.spot.key, e.value, e.rule]));
}
// a group that can not reach the size its wall asks for: impossible, found without a search
{
  const r = run(['###', '.#.'], [['v:0,0', 'diff5']], {});
  check('a difference no reach can give is impossible', r.sols.length === 0, r.sols.length);
}
console.log(`reach cap (core v101): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
