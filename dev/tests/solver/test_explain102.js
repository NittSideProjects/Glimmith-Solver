// Core v102: opts.explain gives the cases behind a proof by contradiction.
// For every step the solver proves "by trying the other way" on a synthetic puzzle, the position before the step is replayed
// (preAssume / preJoin / preApart) and the cases are asked for: one case, the same reason the solver gave, and the trace is sound
// (every edge of the trace really follows: setting the assumption plus the trace never contradicts ... the assumption itself fails).
// node tests/solver/test_explain102.js
'use strict';
const fs = require('fs'), path = require('path');
const S = require(process.env.GLIMMITH_CORE || '../../reference/solver-core.v103.js'), L = require('../../fuzzlib.js');
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
// v103: a far join found by trying the two groups apart (tiny synthetic boards: the rule examples of the page)
{
  const EX = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'build', 'rule_examples_V1.0.16.json'), 'utf8'));
  const RULES0 = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false, bricky: false, loopy: false, wally: false, heterogeneous: false };
  for(const key of ['fact:clue-join', 'fact:pair-join']){
    const c = EX[key] && EX[key].x[0]; if(!c){ check(key + ': the example exists', false); continue; }
    const q = { w: c.p.w, h: c.p.h, active: c.p.active }; for(const f of ['walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers']) q[f] = new Map(c.p[f] || []);
    const go = extra => [...S.deduceSolve(q.w, q.h, S.buildSolverContext(q, c.b || [], Object.assign({}, RULES0, c.r || {}), null, c.n || []), L.collectSpecialEdges(q.walls), Object.assign({}, OPTS, extra))];
    const evs = go({}).filter(e => e.type === 'deduce' || e.type === 'fact'), pr = { preAssume: [], preJoin: [], preApart: [] }; let seen = 0;
    for(const e of evs){
      if(e.type === 'fact' && e.kind === 'join' && 'fact:' + e.rule === key){
        seen++;
        const res = go({ preAssume: pr.preAssume.slice(), preJoin: pr.preJoin.slice(), preApart: pr.preApart.slice(), explain: { apart: [e.a[0], e.a[1], e.b[0], e.b[1]] } }).find(x => x.type === 'cases');
        check(key + ': trying the two tiles apart is refuted, with a reason', !!res && res.complete && res.cases.length >= 1 && res.cases.every(k => !k.open && k.why && k.assume.every(a => a.length === 2)), res && res.cases.map(k => k.open ? 'open' : k.why));
      }
      if(e.type === 'deduce') pr.preAssume.push([e.spot.key, e.value]); else (e.kind === 'join' ? pr.preJoin : pr.preApart).push([e.a[0], e.a[1], e.b[0], e.b[1]]);
    }
    check(key + ': the board has such a step', seen >= 1, seen);
  }
}
// an edge that is already decided: nothing to explain
{ const k = pre.preAssume[0]; const r = run({ preAssume: pre.preAssume.slice(), explain: { edge: [k[0], 'wall'] } }).find(x => x.type === 'cases'); check('a decided edge gives no case', !!r && r.stale && r.cases.length === 0); }
// a normal run never yields a cases event
check('a normal run has no cases event', !run({}).some(x => x.type === 'cases'));
console.log(`explain (core v102, v103): ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
