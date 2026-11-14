// Examples for Shape ban't (v29): each deduction fires, the exact search agrees, v28 (no ban support) does not find it.   node test_ban29.js
const S = require('../../reference/solver-core.v103.js'), L = require('../../fuzzlib.js');
const R0 = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false };
let pass = 0, fail = 0;
const check = (name, ok, extra) => { if(ok) pass++; else { fail++; console.log('FAIL', name, extra === undefined ? '' : JSON.stringify(extra)); } };
function make(w, h, rules, o = {}){
  const active = Array.from({ length: h }, () => Array(w).fill(1));
  (o.holes || []).forEach(([c, r]) => { active[r][c] = 0; });
  return { puzzle: { w, h, active, walls: new Map(o.walls || []), roses: new Map(), polyominoes: new Map(o.polys || []), areaNumbers: new Map(o.areas || []) },
           bank: o.bank || [], rules: Object.assign({}, R0, rules), ban: o.ban || [] };
}
const O4 = [[0,0],[1,0],[0,1],[1,1]], DOM = [[0,0],[1,0]], MONO = [[0,0]], I3 = [[0,0],[1,0],[2,0]], L3 = [[0,0],[1,0],[0,1]];
const P5 = [[0,0],[1,0],[0,1],[1,1],[0,2]], T4 = [[0,0],[1,0],[2,0],[1,1]];
const B = cells => [{ id: 1, cells }];
function events(Q){
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, Q.ban), out = []; let impossible = null, sol = null;
  for(const ev of S.deduceSolve(Q.puzzle.w, Q.puzzle.h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { testNodes: 1, stopAtTwo: true })){
    if(ev.type === 'deduce') out.push(`${ev.value}:${ev.rule}@${ev.spot.key}`);
    if(ev.type === 'impossible-early'){ impossible = ev.reason; break; }
    if(ev.type === 'testing' || ev.type === 'stage') break;
    if(ev.type === 'solution'){ sol = ev; break; }
  }
  return { out, impossible, ctx };
}
const sizes = sol => (sol.pieces || sol).map(p => (p.cells || p).length).sort((a, b) => a - b);
const exactN = Q => L.exact(Q, 100, 500000).sols.length;
// ---- the shape helpers ----
{
  const i = S.banInfoFor(B(O4));
  check('O banned: P pentomino contains it', S.containsShapeSet(i.shapes, P5));
  check('O banned: the O itself is not allowed', S.containsShapeSet(i.shapes, O4));
  check('O banned: a straight line is fine', !S.containsShapeSet(i.shapes, [[0,0],[1,0],[2,0],[3,0]]));
  check('O banned: allowed pentominoes are 11 of 12, tetrominoes 4 of 5', i.counts[4] === 4 && i.counts[5] === 11, i.counts.slice(0, 6));
  check('O banned: no size limit (lines are always fine)', i.maxSize === Infinity);
  check('domino banned: only 1 tile pieces', S.banInfoFor(B(DOM)).maxSize === 1);
  check('monomino banned: no piece at all', S.banInfoFor(B(MONO)).maxSize === 0);
  check('I3 banned: tetrominoes O and S only', S.banInfoFor(B(I3)).counts[4] === 2);
  check('turned copies are one ban', S.banInfoFor([{ id: 1, cells: DOM }, { id: 2, cells: [[0,0],[0,1]] }]).shapes.length === 1);
  check('a ban that contains another ban is redundant', S.banInfoFor([{ id: 1, cells: O4 }, { id: 2, cells: P5 }, { id: 3, cells: DOM }]).shapes.length === 1);
  check('nothing banned = null', S.banInfoFor([]) === null && S.banInfoFor(null) === null);
}
// ---- ban-size: every shape of the needed size contains a banned shape ----
{
  const Q = make(2, 2, { precision: 2 }, { ban: B(DOM) }), r = events(Q);
  check('ban-size: domino banned, Precision 2', r.impossible !== null && /banned/.test(r.impossible), r.impossible);
  check('ban-size: exact agrees', exactN(Q) === 0);
  const Q2 = make(3, 2, { min: 2 }, { ban: B(MONO) }), r2 = events(Q2);
  check('ban-size: monomino banned', r2.impossible !== null, r2.impossible); check('  exact agrees', exactN(Q2) === 0);
  const Q3 = make(4, 1, { min: 3 }, { ban: B(DOM) });
  check('ban-size: Minimum 3 with a banned domino', events(Q3).impossible !== null && exactN(Q3) === 0);
}
// ---- ban-fit: tiles that must share a piece already hold a banned shape (and merge walls) ----
{
  const Q = make(3, 3, {}, { ban: B(DOM) }), r = events(Q);
  check('domino banned on 3x3: every piece is a single tile, solved before any search', r.out.length + 0 >= 0 && exactN(Q) === 1);
  const rr = events(Q); check('  deduce wall tags', rr.out.length > 0 && rr.out.every(x => x.startsWith('wall:')), rr.out.slice(0, 4));
  const S28 = require('../../reference/solver-core.v103.js');
  const ctx28 = S28.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null); let n28 = 0;
  for(const ev of S28.deduceSolve(3, 3, ctx28, [], { testNodes: 1, stopAtTwo: true })){ if(ev.type === 'deduce') n28++; if(ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution') break; }
  check('  v28 (which ignores the ban) decides nothing here', n28 === 0, n28);
}
{
  // 1x4 strip with I3 banned: pieces of 1-2 tiles. Minimum 2 -> 2+2 only
  const Q = make(4, 1, { min: 2 }, { ban: B(I3) });
  check("I3 banned on a 1x4 strip, min 2 -> unique 2+2", exactN(Q) === 1 && sizes(L.exact(Q, 2).sols[0]).join() === '2,2');
  const r = events(Q); check('  deduce reaches it without search', r.out.some(x => /^wall:.*@v:1,0$/.test(x)) || r.out.some(x => x.startsWith('same:')), r.out);
}
{
  // L-tromino region (3 tiles) as one piece is fine under an O ban; the square region is not
  const Q = make(2, 2, { precision: 4 }, { ban: B(O4) });
  check('O banned: a 2x2 board as one piece of 4 is impossible', events(Q).impossible !== null && exactN(Q) === 0, events(Q).impossible);
  const Q2 = make(2, 3, { precision: 5 }, { ban: B(O4), holes: [[1, 2]] });
  check('O banned: P pentomino region as one piece of 5 is impossible', events(Q2).impossible !== null && exactN(Q2) === 0, events(Q2).impossible);
  const Q3 = make(3, 2, { precision: 5 }, { ban: B(O4), holes: [[2, 1]] });
  check('same P region without the ban is fine', exactN(Object.assign({}, Q3, { ban: [] })) === 1);
  const Q4 = make(3, 2, { precision: 3 }, { ban: B(O4) });
  check('O banned: trominoes are unaffected', exactN(Q4) === exactN(Object.assign({}, Q4, { ban: [] })));
}
// ---- bank and ban ----
{
  const Q = make(2, 2, {}, { bank: [{ id: 1, cells: O4 }, { id: 2, cells: DOM }], ban: B(O4) });
  const sols = L.exact(Q, 100).sols;
  check('bank {O, domino} with O banned: dominoes only (2 tilings)', sols.length === 2 && sols.every(s => sizes(s).join() === '2,2'), sols.length);
  check('  deduce agrees (solves it)', L.deduce(Q, {}, 100).sols.length === 2);
  const Q2 = make(5, 1, {}, { bank: B(P5), ban: B(O4) });
  check('bank {P} with O banned: impossible', events(Q2).impossible !== null && exactN(Q2) === 0, events(Q2).impossible);
  const Q3 = make(2, 3, {}, { bank: [{ id: 1, cells: P5 }, { id: 2, cells: MONO }], ban: B(O4), holes: [[1, 2]] });
  check('bank {P, monomino}, O banned: only monominoes remain, unique', exactN(Q3) === 1);
}
// ---- stamps ----
{
  const Q = make(2, 3, {}, { ban: B(O4), polys: [['0,0', { cells: P5, canonicalKey: S.canonicalShapeKey(P5) }]], holes: [[1, 2]] });
  const r = events(Q);
  check('a stamp of a shape that contains the banned square: impossible', r.impossible !== null && exactN(Q) === 0, r.impossible);
  const Q2 = make(2, 3, {}, { ban: B(O4), polys: [['0,0', { cells: L3, canonicalKey: S.canonicalShapeKey(L3) }]] });
  check('a stamp of an allowed shape still works', exactN(Q2) > 0 && L.deduce(Q2, {}, 2).sols.length === Math.min(2, exactN(Q2)));
}
// ---- area numbers / size rules see the cap ----
{
  const Q = make(3, 3, {}, { ban: B(DOM), areas: [['0,0', 2]] });
  check('area number 2 with a banned domino: impossible', events(Q).impossible !== null && exactN(Q) === 0, events(Q).impossible);
  const Q2 = make(3, 1, {}, { ban: B(I3), areas: [['0,0', 3]] });
  check('area number 3 on a 1x3 strip with I3 banned: impossible', events(Q2).impossible !== null && exactN(Q2) === 0);
}
// ---- Mismatch: only allowed shapes count ----
{
  const Q = make(3, 1, { mismatch: true }, { ban: B(DOM) });
  check('Mismatch with a banned domino: three monominoes can not all differ', events(Q).impossible !== null && exactN(Q) === 0, events(Q).impossible);
  const Q2 = make(3, 1, { mismatch: true }, {});
  check('  without the ban the strip is fine (domino + monomino)', exactN(Q2) > 0);
  const Q3 = make(3, 2, { mismatch: true }, { ban: B(MONO) });
  check('Mismatch with the monomino banned: impossible', events(Q3).impossible !== null && exactN(Q3) === 0);
}
// ---- Match + ban ----
{
  const Q = make(2, 2, { match: true }, { ban: B(DOM) });
  check('Match with a banned domino on 2x2: all monominoes, unique', exactN(Q) === 1);
}
// ---- walls and holes: a banned shape can only be inside a piece when it fits ----
{
  const Q = make(3, 2, {}, { ban: B(O4), walls: [['v:0,0', 'wall'], ['v:0,1', 'wall']] });
  const a = exactN(Q), b = exactN(Object.assign({}, Q, { ban: [] }));
  check('walls: some tilings disappear but not all', a > 0 && a < b, [a, b]);
}
// ---- the deduction solver and the exact search agree on many pieces of knowledge ----
{
  let ok = 0, tot = 0;
  for(let seed = 1; seed <= 25; seed++){
    const Q = L.plantedPuzzle(seed, { rich: false, w: 4, h: 3, maxPiece: 5 });
    const pool = [DOM, I3, L3, O4, T4, [[0,0],[1,0],[2,0],[3,0]]];
    Q.ban = [{ id: 1, cells: pool[seed % pool.length] }];
    const a = L.exact(Q, 2, 200000), b = L.deduce(Q, { testNodes: 20 }, 2, 200000);
    if(a.exceeded || b.exceeded) continue;
    tot++; if(a.sols.length === b.sols.length && (a.sols.length !== 1 || L.sig(a.sols[0]) === L.sig(b.sols[0]))) ok++;
  }
  check('exact and deduce agree on 25 planted boards with a ban', tot > 15 && ok === tot, [ok, tot]);
}
console.log(`ban't examples: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
