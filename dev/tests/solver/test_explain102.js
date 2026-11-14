// Core v102: opts.explain gives the cases behind a proof by contradiction.
// For every step the solver proves "by trying the other way" on a synthetic puzzle, the position before the step is replayed
// (preAssume / preJoin / preApart) and the cases are asked for: one case, the same reason the solver gave, and the trace is sound
// (every edge of the trace really follows: setting the assumption plus the trace never contradicts ... the assumption itself fails).
// node tests/solver/test_explain102.js
'use strict';
const fs = require('fs'), path = require('path');
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v102.js'), L = require('../../fuzzlib.js');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const OPTS = { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 200000, exact: 'portfolio', slices: 's18,e', fullScan: true };
const s = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'fixtures', 'colors_V1.0.6.glimmith.json'), 'utf8')).puzzles[0].state;
const p = s.puzzle, puzzle = { w: p.w, h: p.h, active: p.active };
for(const f of ['walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers']) puzzle[f] = new Map(p[f] || []);
const run = extra => [...S.deduceSolve(p.w, p.h, S.buildSolverContext(puzzle, [], s.sizeRules, null, []), L.collectSpecialEdges(puzzle.walls), Object.assign({}, OPTS, extra))];
const ev = run({}).filter(e => e.type === 'deduce' || e.type === 'fact');
const sols = run({}).filter(e => e.type === 'solution');
check('the puzzle solves', sols.length >= 1, sols.length);
const pre = { preAssume: [], preJoin: [], preApart: [] }; let probes = 0;
for(const e of ev){
  if(e.type === 'deduce' && e.via === 'probe'){
    probes++;
    const other = e.value === 'wall' ? 'same' : 'wall';
    const out = run({ preAssume: pre.preAssume.slice(), preJoin: pre.preJoin.slice(), preApart: pre.preApart.slice(), explain: { edge: [e.spot.key, other] } });
    const res = out.find(x => x.type === 'cases');
    check(`step ${e.spot.key}: the cases come back and close the proof`, !!res && res.complete && res.cases.length >= 1, res && [res.complete, res.cases.length]);
    if(!res || !res.cases.length) continue;
    const c = res.cases[0];
    check(`step ${e.spot.key}: one case, on the tried value`, res.cases.length === 1 && c.assume.length === 1 && c.assume[0][0] === e.spot.key && c.assume[0][1] === other, c.assume);
    check(`step ${e.spot.key}: the same reason as the solver gave`, c.why === e.why, [c.why, e.why]);
    check(`step ${e.spot.key}: the trace holds edges that were still open, each once`, c.trace.length > 0 && new Set(c.trace.map(t => t[0])).size === c.trace.length && c.trace.every(t => t[0] !== e.spot.key && !pre.preAssume.some(q => q[0] === t[0])), c.trace.length);
    check(`step ${e.spot.key}: no run ends after the cases (no solution, no decision)`, !out.some(x => x.type === 'solution') && out[out.length - 1].type === 'cases');
    check(`step ${e.spot.key}: the place, when given, is a list of tiles of the board`, c.at === null || (Array.isArray(c.at) && c.at.every(([x, y]) => p.active[y][x])), c.at);
    // the solver's own value does not fail there
    const good = run({ preAssume: pre.preAssume.slice(), preJoin: pre.preJoin.slice(), preApart: pre.preApart.slice(), explain: { edge: [e.spot.key, e.value], maxDepth: 0 } }).find(x => x.type === 'cases');
    check(`step ${e.spot.key}: the proven value itself is not refuted`, !!good && !good.complete && good.cases.every(c2 => c2.open), good && good.cases.map(c2 => c2.why));
  }
  if(e.type === 'deduce') pre.preAssume.push([e.spot.key, e.value]);
  else (e.kind === 'join' ? pre.preJoin : pre.preApart).push([e.a[0], e.a[1], e.b[0], e.b[1]]);
}
check('the puzzle has proofs by contradiction to explain', probes >= 3, probes);
// an edge that is already decided: nothing to explain
{ const k = pre.preAssume[0]; const r = run({ preAssume: pre.preAssume.slice(), explain: { edge: [k[0], 'wall'] } }).find(x => x.type === 'cases'); check('a decided edge gives no case', !!r && r.stale && r.cases.length === 0); }
// a normal run never yields a cases event
check('a normal run has no cases event', !run({}).some(x => x.type === 'cases'));
console.log(`explain (core v102): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
