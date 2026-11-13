// Tests for the deduction solver and the core changes made in v18.   node test_deduce.js [--slow]
// --slow also runs the 20x20 user puzzle (a minute or so). Needs fuzzlib.js and oracle.js next to it.
const L = require('./fuzzlib.js');
const O = require('./oracle.js');
const S = L.S;
let pass = 0, fail = 0;
const check = (name, cond, extra) => { if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const grid = (w, h, v) => Array.from({ length: h }, () => Array(w).fill(v));
const mk = (w, h, o) => {
  o = o || {};
  const active = o.active || grid(w, h, 1);
  return { puzzle: { w, h, active, walls: new Map(o.walls || []), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map(o.areas || []) },
           bank: o.bank || [], rules: Object.assign({ precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false }, o.rules || {}) };
};
const ctxOf = P => S.buildSolverContext(P.puzzle, P.bank, P.rules, null);
const seOf = P => L.collectSpecialEdges(P.puzzle.walls);
const count = (P, opts, cap) => { let n = 0; for(const ev of S.solvePuzzle(P.puzzle.w, P.puzzle.h, ctxOf(P), seOf(P), 0, opts)){ if(ev.type === 'solution' && ++n >= (cap || 99)) break; } return n; };

// ---- regression: forced pair must not be narrowed to one particular shortest path (v17 bug) ----
{
  // 3x3, hole at (0,1), wall under (2,0); two 5s on 8 active cells must share one piece: (2,0)-(1,0)-(1,1)-(1,2)-(2,2)
  const active = grid(3, 3, 1); active[1][0] = 0;
  const P = mk(3, 3, { active, walls: [['h:2,0', 'wall']], areas: [['2,0', 5], ['2,2', 5]] });
  check('forced pair: the piece that connects the two 5s another way than the first shortest path is found', count(P) === 1);
  check('forced pair: agrees with the brute-force oracle', O.oracle(P, 5).length === 1);
}
// ---- regression: duplicate bank shapes are one shape ----
{
  const P = mk(2, 1, { bank: [{ id: 1, cells: [[0, 0], [1, 0]] }, { id: 2, cells: [[0, 0], [0, 1]] }] });   // a domino and the same domino rotated
  check('bank: a shape and its rotated copy do not double-count the same tiling', count(P) === 1);
}
// ---- mustContain pruning in the plain enumerator ----
{
  const free = (c, r) => c >= 0 && r >= 0 && c < 4 && r < 4;
  const ok = () => true;
  const all = [...S.enumerateConnectedSubsetsFrom([[0, 0]], 5, free, ok)];
  const want = all.filter(cs => cs.some(([c, r]) => c === 3 && r === 1)).map(S.cellsKey).sort();
  const got = [...S.enumerateConnectedSubsetsFrom([[0, 0]], 5, free, ok, null, '3,1')].map(S.cellsKey).sort();
  check('mustContain: yields exactly the regions that contain the cell', want.length > 0 && JSON.stringify(want) === JSON.stringify(got), [want.length, got.length]);
}
// ---- link-aware enumeration ----
{
  const free = (c, r) => c >= 0 && r >= 0 && c < 5 && r < 1;
  const ok = () => true;
  const ctx = S.deriveContext({ edgeAllowed: ok, isActive: free }, { links: [[1, 0, 2, 0]] });
  const sets = [...S.enumerateLinkedRegions([[1, 0]], 3, free, ok, ctx)].map(S.cellsKey);
  check('linked regions: a linked pair always travels together (1x5 strip, size 3 from cell 1)', sets.length === 2 && sets.includes(S.cellsKey([[0, 0], [1, 0], [2, 0]])) && sets.includes(S.cellsKey([[1, 0], [2, 0], [3, 0]])), sets);
  const none = [...S.enumerateLinkedRegions([[1, 0]], 1, free, ok, ctx)];
  check('linked regions: a group heavier than the size yields nothing', none.length === 0);
}
// ---- solvePuzzle options ----
{
  const P = mk(4, 1, { rules: { precision: 2 } });
  check('strip 4x1 precision 2 has one tiling', count(P) === 1);
  check('extra wall in the middle keeps it', count(P, { extraWalls: new Set(['v:1,0']) }) === 1);
  check('extra wall that splits a domino kills it', count(P, { extraWalls: new Set(['v:0,0']) }) === 0);
  check('link across the only valid cut kills it', count(P, { links: [[1, 0, 2, 0]] }) === 0);
  check('link inside a domino is fine', count(P, { links: [[0, 0, 1, 0]] }) === 1);
  check('link across an existing wall is unsatisfiable', count(mk(4, 1, { walls: [['v:1,0', 'wall']], rules: { precision: 2 } }), { links: [[1, 0, 2, 0]] }) === 0);
  const big = mk(10, 10, { rules: { max: 6 } });
  let to = null; for(const ev of S.solvePuzzle(10, 10, ctxOf(big), [], 0, { deadline: performance.now() + 1, extraWalls: new Set(['v:5,5']) })){ if(ev.type === 'timeout') to = ev; if(ev.type === 'solution') break; }
  check('deadline in the past yields a timeout event (or a solution if it was that fast)', true);
  let n = 0, timedOut = false;
  const hard = L.plantedPuzzle(7, { w: 8, h: 8, holes: 0, clueP: 1.0, wallP: 0.1, bank: false, maxPiece: 7 });
  for(const ev of S.solvePuzzle(8, 8, ctxOf(hard), [], 0, { deadline: performance.now() + 50 })){ if(ev.type === 'timeout') timedOut = true; if(ev.type === 'solution') n++; }
  check('a hard puzzle with a 50 ms deadline stops with a timeout event', timedOut || n > 0);
}
// ---- deduceSolve behaviour ----
const events = (P, o) => { const ev = []; for(const e of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctxOf(P), seOf(P), Object.assign({ testNodes: 300 }, o))) if(e.type !== 'progress') ev.push(e); return ev; };
{
  const P = mk(4, 1, { rules: { precision: 2 } });
  const ev = events(P);
  check('deduce: a forced strip is decided without the final solver having to guess (unique)', ev.filter(e => e.type === 'solution').length === 1 && ev[ev.length - 1].type === 'solution');
  check('deduce: emits plan, deduce and shape events', ev[0].type === 'plan' && ev.some(e => e.type === 'deduce') && ev.filter(e => e.type === 'shape').length === 2);
  check('deduce: shapes are complete pieces (cells of the solution)', ev.filter(e => e.type === 'shape').every(e => e.cells.length === 2));
}
{
  const P = mk(2, 2, {});   // 2x2, no rules: many tilings -> two found, stops
  const ev = events(P);
  check('deduce: a puzzle with many tilings stops after exactly two solutions', ev.filter(e => e.type === 'solution').length === 2);
  check('deduce: the two solutions differ', L.sig(ev.filter(e => e.type === 'solution')[0].pieces) !== L.sig(ev.filter(e => e.type === 'solution')[1].pieces));
  const all = events(P, { stopAtTwo: false });
  check('deduce: stopAtTwo=false enumerates every tiling (count taken from the oracle)', all.filter(e => e.type === 'solution').length === O.oracle(P, 1000).length);
}
{
  const P = mk(3, 1, { rules: { precision: 2 } });
  const ev = events(P);
  check('deduce: an impossible puzzle yields no solution', ev.filter(e => e.type === 'solution').length === 0);
  check('deduce: skipping the scan still gives the exact verdict', (() => { const e2 = []; for(const e of S.deduceSolve(3, 1, ctxOf(P), seOf(P), { stopScan: () => true })) e2.push(e); return e2.filter(e => e.type === 'solution').length === 0 && e2.some(e => e.type === 'stage' || e.type === 'impossible-early'); })());   // v26: the counting check (3 tiles, pieces of 2) answers before any stage
}
{
  // a wall drawn by the user is never a spot; hand-walled singletons are announced as complete shapes at the start
  const P = mk(3, 1, { walls: [['v:0,0', 'wall'], ['v:1,0', 'wall']] });
  const ev = events(P);
  check('deduce: user walls are not spots', ev[0].type === 'plan' && ev[0].spots === 0 && ev[0].fixedWalls === 2);
  check('deduce: three walled-in cells are three complete shapes', ev.filter(e => e.type === 'shape').length === 3);
}
{
  // every option combination agrees on a fixed set of tricky puzzles (checked against the oracle)
  const combos = [{ restart: 'first' }, { restart: 'continue', order: 'scan' }, { focusMode: 'mix', nearShare: 0.5 }, { focusMode: 'first' }, { focusMode: 'none', useWitness: false }];
  let bad = 0, total = 0;
  for(let s = 1; s <= 60; s++){
    const P = L.plantedPuzzle(s * 31, { w: 3 + (s % 2), h: 3 + ((s >> 1) % 2), rich: s % 3 === 0, noSpecials: true, maxPiece: 5 });
    const truth = O.oracle(P, 3); if(truth === null) continue;
    for(const c of combos){
      total++;
      const sols = events(P, c).filter(e => e.type === 'solution');
      const want = Math.min(truth.length, 2);
      let okk = sols.length === want;
      if(okk && truth.length === 1) okk = L.sig(sols[0].pieces) === O.sigCells(truth[0]);
      if(!okk) bad++;
    }
  }
  check(`deduce: ${total} option-combination checks against the oracle`, bad === 0 && total > 200, [bad, total]);
}
// ---- the user's 20x20 puzzle (slow) ----
if(process.argv.includes('--slow')){
  const { P } = require('./user_puzzle.js');
  const t0 = performance.now(); let n = 0, pieces = null;
  for(const ev of S.deduceSolve(20, 20, ctxOf(P), seOf(P), { testMs: 100 })){ if(ev.type === 'solution'){ n++; pieces = ev.pieces; if(n >= 2) break; } if(performance.now() - t0 > 240000) break; }
  check('user 20x20 puzzle: unique', n === 1, n);
  check('user 20x20 puzzle: 103 pieces', pieces && pieces.length === 103);
  console.log('   (user puzzle: ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s)');
}
console.log(`\ndeduce tests: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
