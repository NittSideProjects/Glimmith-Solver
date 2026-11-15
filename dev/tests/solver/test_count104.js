// Core v104: the number of pieces as one range (fewest .. most), worked out once from every rule and clue that counts pieces.
// Synthetic boards: roses, area numbers that fill the board, Mismatch with a bank whose shapes must each be used once,
// Heterogeneous, Match, the user's limit on pieces; then the closed-in areas that must add up to the count ('piece-region').
// node tests/solver/test_count104.js
'use strict';
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v112.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const RULES = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
function board(rows, o = {}){
  return { w: rows[0].length, h: rows.length, active: rows.map(r => [...r].map(c => c === '.' ? 0 : 1)), walls: new Map(o.walls || []),
    roses: new Map(o.roses || []), polyominoes: new Map(), areaNumbers: new Map(o.areas || []) };
}
const ctxOf = (rows, o = {}) => S.buildSolverContext(board(rows, o), o.bank || [], Object.assign({}, RULES, o.rules), o.hints || null, []);
const count = c => [c.pieceLo, c.pieceHi];

// the symbols give the count
{ const c = ctxOf(['####', '####'], { roses: [['0,0', 1], ['3,1', 1]] });
  check('two roses of one type: exactly 2 pieces', String(count(c)) === '2,2', count(c));
  check('the old upper bound follows the count', c.pieceCapMax === 2, c.pieceCapMax); }
// the area numbers fill the board
{ const c = ctxOf(['####', '####'], { areas: [['0,0', 3], ['3,1', 5]] });
  check('numbers 3 and 5 on 8 tiles: exactly 2 pieces', String(count(c)) === '2,2', count(c));
  check('... of 3 and 5 tiles only', c.sizeLo === 3 && c.sizeHi === 5 && c.pieceMult.mhi[4] === 0, [c.sizeLo, c.sizeHi, c.pieceMult.mhi]); }
// area numbers that may share pieces: a lowest count
{ const c = ctxOf(['######'], { areas: [['0,0', 2], ['1,0', 2], ['2,0', 2]] });
  check('three tiles of number 2 need 2 pieces of 2, so 3 to 4 pieces', String(count(c)) === '3,4', count(c));
  check('... at least 2 pieces of 2 tiles', c.pieceMult.mlo[2] === 2, c.pieceMult.mlo); }
// Mismatch with a bank of 1, 2 and 3 tiles on 6 tiles: every shape is used exactly once
{ const bank = [{ id: 1, cells: [[0, 0]] }, { id: 2, cells: [[0, 0], [1, 0]] }, { id: 3, cells: [[0, 0], [1, 0], [2, 0]] }];
  const c = ctxOf(['######'], { bank, rules: { mismatch: true } });
  check('Mismatch, 3 shapes for 6 tiles: exactly 3 pieces', String(count(c)) === '3,3', count(c));
  check('... each shape exactly once', [1, 2, 3].every(k => c.pieceMult.mlo[k] === 1 && c.pieceMult.mhi[k] === 1), [c.pieceMult.mlo, c.pieceMult.mhi]); }
// Heterogeneous: all sizes different
{ const c = ctxOf(['###', '###'], { rules: { heterogeneous: true } });
  check('Heterogeneous on 6 tiles: 1 to 3 pieces (6, 1+5, 2+4, 1+2+3)', String(count(c)) === '1,3', count(c));
  check('... at most one piece of each size', [1, 2, 3, 4, 5, 6].every(k => c.pieceMult.mhi[k] === 1), c.pieceMult.mhi); }
// Match: not counted by the pass (Match's own size list is stricter), its own check still finds the impossible board below
{ const c = ctxOf(['###', '###'], { roses: [['0,0', 1], ['2,1', 1]], rules: { match: true } });
  check('Match: the count pass steps aside', c.pieceLo == null && !c.countInfeasible, [count(c), c.countInfeasible]); }
// the user's limit meets the lowest count
{ const c = ctxOf(['###', '###'], { areas: [['0,0', 1], ['2,1', 1]], rules: { max: 3 }, hints: { maxRegions: 2 } });
  check('two pieces of 1 and the rest still to cover, at most 2 pieces: impossible', c.countInfeasible === true, [c.countInfeasible, count(c)]);
  const d = ctxOf(['###', '###'], { areas: [['0,0', 1], ['2,1', 1]], rules: { max: 4 }, hints: { maxRegions: 3 } });
  check('... at most 3 pieces: 1 + 1 + 4, exactly 3', String(count(d)) === '3,3' && d.pieceMult.mlo[4] === 1, [count(d), d.pieceMult.mlo]); }
// the plain size rules alone: the count is what the sizes allow
{ const c = ctxOf(['#####'], { rules: { min: 2, max: 3 } });
  check('5 tiles of 2 to 3: exactly 2 pieces', String(count(c)) === '2,2', count(c)); }
// the exact search and the deduction both stop on a count that does not exist
{ const P = { puzzle: board(['###', '###'], { roses: [['0,0', 1], ['1,0', 1], ['2,0', 1], ['0,1', 1]] }), bank: [], rules: Object.assign({}, RULES, { match: true }) };
  check('exact search: no tiling', L.exact(P, 2, 100000).sols.length === 0);
  const r = L.deduce(P, { keepEvents: true, stopAtTwo: true }, 2, 100000);
  check('deduction: no tiling', r.sols.length === 0, r.sols.length); }

// piece-region: numbers 2, 1, 1, 1, 1 fill the 6 tiles, so 5 pieces; the right block holds at most 4, so the left column is one piece
{ const P = { puzzle: board(['#.##', '#.##'], { areas: [['0,1', 2], ['2,0', 1], ['3,0', 1], ['2,1', 1], ['3,1', 1]] }), bank: [], rules: Object.assign({}, RULES) };
  const c = S.buildSolverContext(P.puzzle, [], P.rules, null, []);
  check('the numbers fill the board: exactly 5 pieces', String(count(c)) === '5,5', count(c));
  const r = L.deduce(P, { keepEvents: true }, 2, 100000), e = r.events.find(x => x.type === 'deduce' && x.spot.key === 'h:0,0');
  check('the left column is linked by the count of pieces', e && e.value === 'same' && e.via === 'rule' && e.rule === 'piece-region', e && [e.value, e.via, e.rule]);
  const r2 = L.deduce(P, { keepEvents: true, pieceCount: false }, 2, 100000), e2 = r2.events.find(x => x.type === 'deduce' && x.spot.key === 'h:0,0');
  check('... and by another rule without it', e2 && e2.value === 'same' && e2.rule !== 'piece-region', e2 && [e2.value, e2.rule]);
  check('one tiling either way', r.sols.length === 1 && r2.sols.length === 1, [r.sols.length, r2.sols.length]); }
// piece-region behind a wall: four 1s, two tiles left, at most 5 pieces: the two tiles are one piece
{ const P = { puzzle: board(['###', '###'], { walls: [['v:0,0', 'wall'], ['v:0,1', 'wall']], areas: [['1,0', 1], ['2,0', 1], ['1,1', 1], ['2,1', 1]] }), bank: [], rules: Object.assign({}, RULES, { max: 2 }), hints: { maxRegions: 5 } };
  const c = S.buildSolverContext(P.puzzle, [], P.rules, P.hints, []);
  check('four 1s and two tiles left, pieces of at most 2, at most 5 pieces: 5 pieces', String(count(c)) === '5,5', count(c));
  const r = L.deduce(P, { keepEvents: true }, 2, 100000);
  const all = L.exact(P, 0, 100000);
  const pieceOf = sol => { const m = new Map(); sol.forEach((p, i) => (p.cells || p).forEach(([x, y]) => m.set(`${x},${y}`, i))); return m; };
  const tiles = k => { const [o, rest] = k.split(':'), [x, y] = rest.split(',').map(Number); return [`${x},${y}`, o === 'v' ? `${x + 1},${y}` : `${x},${y + 1}`]; };
  const bad = r.events.filter(e => e.type === 'deduce' && !all.sols.every(sol => { const m = pieceOf(sol), [x, y] = tiles(e.spot.key); return (m.get(x) === m.get(y)) === (e.value === 'same'); }));
  check('every decision holds in all ' + all.sols.length + ' tilings', all.sols.length >= 1 && bad.length === 0, bad.map(e => [e.spot.key, e.value, e.rule]));
  check('one tiling', r.sols.length === 1, r.sols.length); }

console.log(`piece count (core v104): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
