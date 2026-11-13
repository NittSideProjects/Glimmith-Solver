// Glimmith solver test suite (rebuilt from HANDOFF §9; uses the v14 API
// solvePuzzle(w,h,ctx,deltaEdges,geminiEdges,budget) + the new boxy / non-boxy rules).
const S = require(require('../../corepath.js').corePath());      // GLIMMITH_CORE or the newest reference/solver-core.vNN.js
const {
  buildSolverContext, solvePuzzle, canonicalShapeKey, candidatesForCell,
  enumerateConnectedSubsetsContaining, isRectangular, enumerateRectanglesContaining
} = S;

let pass = 0, fail = 0;
function check(name, cond){
  if(cond){ pass++; } else { fail++; console.log('FAIL:', name); }
}

// ---------- harness ----------
function makeGrid(w, h, v = 1){ return Array.from({ length: h }, () => Array(w).fill(v)); }
function wallsFromList(list){
  const m = new Map();
  for(const [orient, c, r, type] of list) m.set(`${orient}:${c},${r}`, type || 'wall');
  return m;
}
function shape(id, cells){ return { id, cells }; }
const DOMINO = shape(1, [[0,0],[1,0]]);
const TROMINO_I = shape(2, [[0,0],[1,0],[2,0]]);
const TROMINO_L = shape(3, [[0,0],[0,1],[1,1]]);
const I4 = shape(4, [[0,0],[1,0],[2,0],[3,0]]);
const O4 = shape(5, [[0,0],[1,0],[0,1],[1,1]]);
const L_TROM = TROMINO_L;

// mirrors the app's collectSpecialEdges(): wall type -> specialEdges entry
function collectSpecialEdges(walls){
  const edges = [];
  walls.forEach((type, key) => {
    if(type === 'wall') return;
    const [orient, rest] = key.split(':');
    const [c, r] = rest.split(',').map(Number);
    const [c2, r2] = orient === 'v' ? [c+1, r] : [c, r+1];
    if(type === 'delta' || type === 'gemini' || type === 'lt' || type === 'gt'){
      edges.push({ c1:c, r1:r, c2, r2, kind: type });
    } else if(type.startsWith('diff')){
      edges.push({ c1:c, r1:r, c2, r2, kind:'diff', value: parseInt(type.slice(4), 10) });
    }
  });
  return edges;
}

function runSolver(w, h, active, walls, bank, maxSolutions, rules, extras, budget, hints){
  extras = extras || {};
  const puzzle = {
    w, h, active, walls,
    roses: extras.roses || new Map(),
    polyominoes: extras.polyominoes || new Map(),
    areaNumbers: extras.areaNumbers || new Map()
  };
  const ctx = buildSolverContext(puzzle, bank || [], rules || {}, hints);
  const specialEdges = collectSpecialEdges(walls);
  const solutions = [];
  let nodes = 0, exceeded = false;
  for(const ev of solvePuzzle(w, h, ctx, specialEdges, budget || 2_000_000)){
    if(ev.type === 'solution'){ solutions.push(ev.pieces); if(maxSolutions && solutions.length >= maxSolutions) break; }
    else if(ev.type === 'progress') nodes = ev.nodes;
    else if(ev.type === 'budget-exceeded'){ exceeded = true; break; }
  }
  return { solutions, nodes, exceeded };
}
function allSolutions(w, h, active, walls, bank, rules, extras){
  return runSolver(w, h, active, walls, bank, 0, rules, extras).solutions;
}
function timed(fn){ const t = Date.now(); const r = fn(); return { r, ms: Date.now() - t }; }
function cellKeyOf(c, r){ return `${c},${r}`; }
function piecesAdjacent(a, b){
  const set = new Set(b.cells.map(([c,r]) => cellKeyOf(c,r)));
  return a.cells.some(([c,r]) => [[1,0],[-1,0],[0,1],[0,-1]].some(([dc,dr]) => set.has(cellKeyOf(c+dc, r+dr))));
}
function everyAdjacentPair(pieces, pred){
  for(let i = 0; i < pieces.length; i++)
    for(let j = i+1; j < pieces.length; j++)
      if(piecesAdjacent(pieces[i], pieces[j]) && !pred(pieces[i], pieces[j])) return false;
  return true;
}
function pieceSize(p){ return p.cells.length; }
function covers(piece, c, r){ return piece.cells.some(([x,y]) => x === c && y === r); }
function pieceAt(pieces, c, r){ return pieces.find(p => covers(p, c, r)); }

// ---------- 1-4: basic tilings ----------
{
  const g = makeGrid(4, 2);
  check('1a 2x4 domino capped at 2', runSolver(4, 2, g, new Map(), [DOMINO], 2).solutions.length === 2);
  check('1b 2x4 domino uncapped = 5', allSolutions(4, 2, g, new Map(), [DOMINO]).length === 5);
  check('2 1x4 + I-tetromino unique', allSolutions(4, 1, makeGrid(4,1), new Map(), [I4]).length === 1);
  check('3 2x2 + O unique', allSolutions(2, 2, makeGrid(2,2), new Map(), [O4]).length === 1);
  check('4 3-cell L + domino on 3 cells impossible', allSolutions(3, 1, makeGrid(3,1), new Map(), [L_TROM, DOMINO]).length === 0);
}

// ---------- 5: walls ----------
{
  const g = makeGrid(2, 2);
  check('5a 2x2 domino baseline 2', allSolutions(2, 2, g, new Map(), [DOMINO]).length === 2);
  const w = wallsFromList([['v',0,0],['v',0,1]]);
  check('5b walls v:0,0 + v:0,1 -> unique', allSolutions(2, 2, g, w, [DOMINO]).length === 1);
}

// ---------- 6-9: delta / gemini ----------
{
  const g = makeGrid(4, 1);
  check('6 1x4 domino delta at v:1,0 impossible', allSolutions(4,1,g,wallsFromList([['v',1,0,'delta']]),[DOMINO]).length === 0);
  check('7 1x4 domino gemini at v:1,0 unique', allSolutions(4,1,g,wallsFromList([['v',1,0,'gemini']]),[DOMINO]).length === 1);
  const g5 = makeGrid(5, 1);
  const bank = [DOMINO, TROMINO_I];
  check('8a 1x5 domino+tromino baseline 2', allSolutions(5,1,g5,new Map(),bank).length === 2);
  check('8b delta at v:2,0 unique', allSolutions(5,1,g5,wallsFromList([['v',2,0,'delta']]),bank).length === 1);
  check('9 gemini at v:2,0 impossible', allSolutions(5,1,g5,wallsFromList([['v',2,0,'gemini']]),bank).length === 0);
}

// ---------- 10: canonical key ----------
{
  const J = [[1,0],[1,1],[1,2],[0,2]], L = [[0,0],[0,1],[0,2],[1,2]];
  check('10 canonical J === L', canonicalShapeKey(J) === canonicalShapeKey(L));
}

// ---------- 11-14: size rules ----------
{
  check('11 I-tet precision 4 unique', allSolutions(4,1,makeGrid(4,1),new Map(),[I4],{precision:4}).length === 1);
  check('12 I-tet precision 3 impossible', allSolutions(4,1,makeGrid(4,1),new Map(),[I4],{precision:3}).length === 0);
  const g5 = makeGrid(5,1), bank = [DOMINO, TROMINO_I];
  check('13a min3 impossible', allSolutions(5,1,g5,new Map(),bank,{min:3}).length === 0);
  check('13b max2 impossible', allSolutions(5,1,g5,new Map(),bank,{max:2}).length === 0);
  check('14 min2 max3 -> 2 tilings', allSolutions(5,1,g5,new Map(),bank,{min:2,max:3}).length === 2);
}

// ---------- 15: polyomino enumeration (OEIS A001168) ----------
{
  const all = () => true, edge = () => true;
  const expected = [1, 2, 6, 19, 63, 216];
  for(let n = 1; n <= 6; n++){
    let count = 0;
    for(const _ of enumerateConnectedSubsetsContaining([15,15], n, (c,r) => c >= 0 && r >= 0 && c < 30 && r < 30, edge)) count++;
    check(`15 fixed-through-seed size ${n} = ${n * expected[n-1]}`, count === n * expected[n-1]);
  }
}

// ---------- 16-18: empty bank free-form ----------
{
  check('16a 1x5 precision 5 unique', allSolutions(5,1,makeGrid(5,1),new Map(),[],{precision:5}).length === 1);
  check('16b 1x4 precision 2 unique', allSolutions(4,1,makeGrid(4,1),new Map(),[],{precision:2}).length === 1);
  check('16c 2x4 precision 2 -> 5', allSolutions(4,2,makeGrid(4,2),new Map(),[],{precision:2}).length === 5);
  check('17 1x1 no rules unique', allSolutions(1,1,makeGrid(1,1),new Map(),[]).length === 1);
  const t = timed(() => allSolutions(5,1,makeGrid(5,1),new Map(),[],{precision:4}));
  check('18 1x5 precision 4 impossible fast', t.r.length === 0 && t.ms < 500);
}

// ---------- 19: candidatesForCell ----------
{
  const puzzle = { w:6, h:6, active: makeGrid(6,6), walls: new Map() };
  const ctx = buildSolverContext(puzzle, [DOMINO], {});
  const cands = [...candidatesForCell(ctx, 2, 2, (c,r) => c>=0&&r>=0&&c<6&&r<6, null)];
  check('19 domino through interior cell -> 4 placements', cands.length === 4);
}

// ---------- 20-21: wraparound ----------
{
  const edge = (c1,r1,c2,r2) => !(c1 === 0 && c2 === 0 && Math.min(r1,r2) === 0);   // blocks h:0,0 (between (0,0) and (0,1))
  const valid = (c,r) => c>=0 && c<2 && r>=0 && r<2;
  const res = [...enumerateConnectedSubsetsContaining([1,0], 4, valid, edge)];
  check('20 wraparound: 2x2 with h:0,0 blocked -> 0 results', res.length === 0);
  const walls = wallsFromList([['h',1,1],['v',1,1],['v',1,2],['h',2,1]]);
  for(const k of walls.keys()) walls.set(k, 'gemini');
  const ring = runSolver(8,8,makeGrid(8,8),walls,[],1,{precision:4});
  const ringCells = [[1,1],[2,1],[1,2],[2,2]];
  check('21 gemini ring: if solvable, the four ringed cells lie in four different pieces',
    !ring.exceeded && (ring.solutions.length === 0 || new Set(ringCells.map(([c,r]) => ring.solutions[0].indexOf(pieceAt(ring.solutions[0], c, r)))).size === 4));
}

// ---------- 22-25: roses ----------
{
  const g = makeGrid(4,1);
  const rose = (...list) => new Map(list.map(([c,r,t]) => [cellKeyOf(c,r), t]));
  check('22a one rose on 1x4 domino -> impossible', allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1])}).length === 0);
  check('22b roses at (0,0),(2,0) -> unique', allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1],[2,0,1])}).length === 1);
  check('23 two roses in one piece -> impossible', allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1],[1,0,1])}).length === 0);
  check('24 two types, one piece both, other none -> impossible', allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1],[1,0,2])}).length === 0);
  check('25a each piece one of each type -> unique', allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1],[1,0,2],[2,0,1],[3,0,2])}).length === 1);
  const t = timed(() => allSolutions(4,1,g,new Map(),[DOMINO],{}, {roses: rose([0,0,1],[1,0,1],[2,0,2])}));
  check('25b unequal rose type counts -> impossible instantly', t.r.length === 0 && t.ms < 50);
}

// ---------- 26-29: polyomino stamps ----------
{
  const stamp = (c, r, cells) => new Map([[cellKeyOf(c,r), { cells, canonicalKey: canonicalShapeKey(cells) }]]);
  const straight3 = [[0,0],[1,0],[2,0]], domino = [[0,0],[1,0]];
  const s26 = allSolutions(5,1,makeGrid(5,1),new Map(),[],{min:2,max:3},{polyominoes: stamp(0,0,straight3)});
  check('26 straight-tromino stamp at (0,0) forces straight tromino piece', s26.length > 0 && s26.every(sol => pieceSize(pieceAt(sol,0,0)) === 3));
  const two = new Map([...stamp(0,0,domino), ...stamp(4,0,domino)]);
  check('27 two domino stamps on 1x6 solvable', allSolutions(6,1,makeGrid(6,1),new Map(),[],{min:2,max:3},{polyominoes: two}).length > 0);
  check('28 3-cell stamp at precision 2 impossible', allSolutions(6,1,makeGrid(6,1),new Map(),[],{precision:2},{polyominoes: stamp(0,0,straight3)}).length === 0);
  check('29 stamp not in non-empty bank impossible', allSolutions(6,1,makeGrid(6,1),new Map(),[DOMINO],{},{polyominoes: stamp(0,0,straight3)}).length === 0);
}

// ---------- 30-37: Match / Mismatch / Mingle on 4x4 free-form min2/max4 ----------
{
  const g = makeGrid(4,4), base = {min:2, max:4};
  const baseSols = allSolutions(4,4,g,new Map(),[],base);
  const sameShape = sol => sol.every(p => p.canonicalKey === sol[0].canonicalKey);
  const allDistinct = sol => new Set(sol.map(p => p.canonicalKey)).size === sol.length;
  const mingleShapeOk = sol => everyAdjacentPair(sol, (a,b) => a.canonicalKey !== b.canonicalKey);
  const mingleAreaOk = sol => everyAdjacentPair(sol, (a,b) => pieceSize(a) !== pieceSize(b));

  check('30 baseline has a non-matching tiling', baseSols.some(s => !sameShape(s)));
  const m = allSolutions(4,4,g,new Map(),[],{...base, match:true});
  check('31 match: solutions exist, all pieces same shape', m.length > 0 && m.every(sameShape));
  check('32 baseline has a non-distinct tiling', baseSols.some(s => !allDistinct(s)));
  const mm = allSolutions(4,4,g,new Map(),[],{...base, mismatch:true});
  check('33 mismatch: solutions exist, all pieces distinct', mm.length > 0 && mm.every(allDistinct));
  check('34 baseline violates mingle shape somewhere', baseSols.some(s => !mingleShapeOk(s)));
  const ms = allSolutions(4,4,g,new Map(),[],{...base, mingleShape:true});
  check('35 mingle shape: solutions exist, adjacent pieces differ in shape', ms.length > 0 && ms.every(mingleShapeOk));
  check('36 baseline violates mingle area somewhere', baseSols.some(s => !mingleAreaOk(s)));
  const ma = allSolutions(4,4,g,new Map(),[],{...base, mingleArea:true});
  check('37 mingle area: solutions exist, adjacent pieces differ in size', ma.length > 0 && ma.every(mingleAreaOk));
  const t = timed(() => allSolutions(6,1,makeGrid(6,1),new Map(),[DOMINO],{precision:2, mismatch:true}));
  check('37b mismatch + one-shape domino bank, 3 pieces -> impossible fast', t.r.length === 0 && t.ms < 100);
}

// ---------- 38-42: area numbers ----------
{
  const area = (...list) => new Map(list.map(([c,r,v]) => [cellKeyOf(c,r), v]));
  const a = allSolutions(4,1,makeGrid(4,1),new Map(),[],{}, {areaNumbers: area([0,0,2])});
  check('38 area 2 at (0,0) -> that piece has size 2', a.length > 0 && a.every(s => pieceSize(pieceAt(s,0,0)) === 2));
  check('39 area 5 on 4 cells impossible', allSolutions(4,1,makeGrid(4,1),new Map(),[],{}, {areaNumbers: area([0,0,5])}).length === 0);
  check('40 area 4 vs tromino-only bank impossible', allSolutions(6,1,makeGrid(6,1),new Map(),[TROMINO_I],{}, {areaNumbers: area([0,0,4])}).length === 0);
  const f = allSolutions(15,1,makeGrid(15,1),new Map(),[],{}, {areaNumbers: area([0,0,12])});
  check('41 15x1 area 12 at (0,0) -> piece size 12', f.length > 0 && f.every(s => pieceSize(pieceAt(s,0,0)) === 12));
  const t = timed(() => runSolver(10,10,makeGrid(10,10),new Map(),[],1,{}, {areaNumbers: area([4,4,3])}));
  check('42 10x10 area 3 -> found in <2s', t.r.solutions.length === 1 && t.ms < 2000);
}

// ---------- 43-47: forced pair ----------
{
  const area = (...list) => new Map(list.map(([c,r,v]) => [cellKeyOf(c,r), v]));
  const g = makeGrid(10,10);
  let t = timed(() => runSolver(10,10,g,new Map(),[],1,{}, {areaNumbers: area([0,0,51],[9,9,51])}));
  check('43 10x10 two area-51 corners -> solves <2s, piece size 51 containing (9,9)',
    t.r.solutions.length === 1 && t.ms < 2000 && pieceSize(pieceAt(t.r.solutions[0],0,0)) === 51 && covers(pieceAt(t.r.solutions[0],0,0),9,9));
  t = timed(() => runSolver(10,10,g,new Map(),[],1,{}, {areaNumbers: area([0,0,10],[9,9,10])}));
  check('44 two area-10 cells still solves', t.r.solutions.length === 1);
  const walls = wallsFromList([['v',8,9],['h',9,8]]);
  t = timed(() => runSolver(10,10,g,walls,[],1,{}, {areaNumbers: area([0,0,51],[9,9,51])}));
  check('45 forced pair walled apart -> impossible fast', t.r.solutions.length === 0 && !t.r.exceeded && t.ms < 5000);
  t = timed(() => runSolver(20,1,makeGrid(20,1),new Map(),[],1,{}, {areaNumbers: area([0,0,11],[19,0,11])}));
  check('46 20x1 areas 11 at both ends -> impossible fast', t.r.solutions.length === 0 && t.ms < 2000);
}

// ---------- 48-53: solitude ----------
{
  const stampDomino = new Map([[cellKeyOf(0,0), { cells: [[0,0],[1,0]], canonicalKey: canonicalShapeKey([[0,0],[1,0]]) }]]);
  const area = (...list) => new Map(list.map(([c,r,v]) => [cellKeyOf(c,r), v]));
  const s = allSolutions(6,1,makeGrid(6,1),new Map(),[],{solitude:true}, {polyominoes: stampDomino, areaNumbers: area([2,0,4])});
  check('48 solitude: domino stamp + area 4 on 1x6 -> exactly 2 pieces', s.length > 0 && s.every(sol => sol.length === 2));
  const t = timed(() => allSolutions(4,1,makeGrid(4,1),new Map(),[],{solitude:true}));
  check('49 solitude with zero symbols -> impossible fast', t.r.length === 0 && t.ms < 50);
  const one = allSolutions(5,1,makeGrid(5,1),new Map(),[],{solitude:true}, {areaNumbers: area([0,0,5])});
  check('50 single area-5 mark on 1x5 -> unique whole region', one.length === 1 && one[0].length === 1);
  const both = new Map([[cellKeyOf(0,0), { cells: [[0,0],[1,0]], canonicalKey: canonicalShapeKey([[0,0],[1,0]]) }]]);
  check('51 one tile with two symbols (solitude) -> impossible', allSolutions(2,1,makeGrid(2,1),new Map(),[],{solitude:true}, {polyominoes: both, areaNumbers: area([0,0,2])}).length === 0);
  const roses = new Map([[cellKeyOf(0,0),1],[cellKeyOf(2,0),1]]);
  const r2 = allSolutions(4,1,makeGrid(4,1),new Map(),[],{solitude:true}, {roses});
  check('52 two same-type roses on 1x4 solitude -> 2 pieces', r2.length > 0 && r2.every(sol => sol.length === 2));
}

// =====================================================================
// NEW: boxy / non-boxy
// =====================================================================

// -- isRectangular unit tests
check('B1 isRectangular single cell', isRectangular([[3,3]]));
check('B2 isRectangular domino', isRectangular([[0,0],[1,0]]));
check('B3 isRectangular 2x3', isRectangular([[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]));
check('B4 isRectangular L-tromino is not', !isRectangular([[0,0],[0,1],[1,1]]));
check('B5 isRectangular T-tetromino is not', !isRectangular([[0,0],[1,0],[2,0],[1,1]]));
check('B6 isRectangular offset (not at origin)', isRectangular([[5,7],[6,7],[5,8],[6,8]]));
check('B7 isRectangular S-tetromino is not', !isRectangular([[1,0],[2,0],[0,1],[1,1]]));

// -- enumerateRectanglesContaining unit tests
{
  const valid = (c,r) => c>=0 && r>=0 && c<6 && r<6, openEdge = () => true;
  const count = (c,r,n) => [...enumerateRectanglesContaining(c,r,n,valid,openEdge)].length;
  check('B8 rectangles of size 1 through a cell = 1', count(2,2,1) === 1);
  check('B9 size-2 rects through interior cell = 4 (2 horiz + 2 vert)', count(2,2,2) === 4);
  check('B10 size-4 rects through (2,2) on 6x6: 1x4(3)+4x1(3)+2x2(4) = 10', count(2,2,4) === 10);
  check('B11 size-2 rects through a corner = 2', count(0,0,2) === 2);
  check('B12 prime size 5 on a 3-wide grid: only 1x5 / 5x1 shapes fit', [...enumerateRectanglesContaining(1,1,5,(c,r)=>c>=0&&r>=0&&c<3&&r<3,openEdge)].length === 0);
  // every yielded rectangle contains the target and is rectangular
  let allGood = true;
  for(let n = 1; n <= 12; n++)
    for(const cells of enumerateRectanglesContaining(2,3,n,valid,openEdge)){
      if(!cells.some(([c,r]) => c===2 && r===3) || !isRectangular(cells) || cells.length !== n) allGood = false;
    }
  check('B13 every rectangle contains the target, is rectangular, has the right size', allGood);
  // walls inside a rectangle exclude it
  const blockInner = (c1,r1,c2,r2) => !(r1 === r2 && Math.min(c1,c2) === 0 && r1 === 0);   // v:0,0 blocked
  const withWall = [...enumerateRectanglesContaining(0,0,2,valid,blockInner)].map(cs => cs.map(x => x.join(',')).join('|'));
  check('B14 wall between the two cells excludes the horizontal domino', withWall.length === 1 && withWall[0] === '0,0|0,1');
  // no duplicates
  const keys = [...enumerateRectanglesContaining(3,3,6,valid,openEdge)].map(cs => cs.map(x=>x.join(',')).sort().join('|'));
  check('B15 no duplicate rectangles', new Set(keys).size === keys.length);
}

// -- full-solver: 4x4 free-form min2/max4
{
  const g = makeGrid(4,4), base = {min:2, max:4};
  const baseSols = allSolutions(4,4,g,new Map(),[],base);
  check('B16 baseline contains a tiling with a non-rectangular piece', baseSols.some(s => s.some(p => !isRectangular(p.cells))));
  const boxy = allSolutions(4,4,g,new Map(),[],{...base, boxy:true});
  check('B17 boxy: solutions exist', boxy.length > 0);
  check('B18 boxy: every piece in every solution is a rectangle', boxy.every(s => s.every(p => isRectangular(p.cells))));
  check('B19 boxy: fewer solutions than baseline', boxy.length < baseSols.length);
  // cross-check the fast path against brute-force filtering of the baseline
  const sig = s => s.map(p => p.cells.map(x => x.join(',')).sort().join('|')).sort().join('/');
  const brute = new Set(baseSols.filter(s => s.every(p => isRectangular(p.cells))).map(sig));
  const fast = new Set(boxy.map(sig));
  check('B20 boxy fast path == baseline filtered by "all pieces rectangular" (same set)', brute.size === fast.size && [...brute].every(k => fast.has(k)));

  const nb = allSolutions(4,4,g,new Map(),[],{...base, nonBoxy:true});
  check('B21 non-boxy: solutions exist (fixture check)', nb.length > 0);
  check('B22 non-boxy: no piece in any solution is a rectangle', nb.every(s => s.every(p => !isRectangular(p.cells))));
  const brute2 = new Set(baseSols.filter(s => s.every(p => !isRectangular(p.cells))).map(sig));
  check('B23 non-boxy == baseline filtered by "no piece rectangular"', brute2.size === new Set(nb.map(sig)).size && [...brute2].every(k => new Set(nb.map(sig)).has(k)));

  const both = timed(() => allSolutions(4,4,g,new Map(),[],{...base, boxy:true, nonBoxy:true}));
  check('B24 boxy + non-boxy together -> impossible, instantly', both.r.length === 0 && both.ms < 50);
}

// -- boxy and non-boxy with other rules
{
  // L bank: boxy never uses an L; with only an L in the bank boxy is impossible
  check('B25 boxy with only an L-tromino in bank -> impossible', allSolutions(3,2,makeGrid(3,2),new Map(),[L_TROM],{boxy:true}).length === 0);
  const mixedBank = [L_TROM, DOMINO];
  const bx = allSolutions(4,2,makeGrid(4,2),new Map(),mixedBank,{boxy:true});
  check('B26 boxy with L + domino bank: solutions exist and never use the L', bx.length > 0 && bx.every(s => s.every(p => p.cells.length === 2)));
  check('B27 non-boxy with only dominoes in bank -> impossible', allSolutions(4,2,makeGrid(4,2),new Map(),[DOMINO],{nonBoxy:true}).length === 0);
  const nbL = allSolutions(3,2,makeGrid(3,2),new Map(),[L_TROM, DOMINO],{nonBoxy:true});
  check('B28 non-boxy with L + domino bank on 2x3: only L pieces', nbL.length > 0 && nbL.every(s => s.every(p => p.cells.length === 3)));
  check('B29 non-boxy with max 2 -> impossible instantly', timed(() => allSolutions(4,4,makeGrid(4,4),new Map(),[],{nonBoxy:true,max:2})).r.length === 0);
  check('B30 non-boxy precision 1 -> impossible', allSolutions(2,2,makeGrid(2,2),new Map(),[],{nonBoxy:true,precision:1}).length === 0);
  check('B31 non-boxy precision 4 on 2x2 -> impossible (only the O fits)', allSolutions(2,2,makeGrid(2,2),new Map(),[],{nonBoxy:true,precision:4}).length === 0);
  // boxy 2x2 at precision 2: two tilings (2 horizontal / 2 vertical)
  check('B32 boxy precision 2 on 2x2 -> 2 tilings', allSolutions(2,2,makeGrid(2,2),new Map(),[],{boxy:true,precision:2}).length === 2);
  // boxy + a wall inside a would-be rectangle
  check('B33 boxy 2x2 precision 4 with an interior wall -> impossible', allSolutions(2,2,makeGrid(2,2),wallsFromList([['v',0,0]]),[],{boxy:true,precision:4}).length === 0);
  // boxy + irregular active shape: an L-shaped playfield cannot be tiled by a single rectangle of its full size
  const act = makeGrid(3,2); act[0][1] = 0; act[0][2] = 0;   // active cells: (0,0) on top; (0,1),(1,1),(2,1) on the bottom row
  const lField = allSolutions(3,2,act,new Map(),[],{boxy:true});
  check('B34 boxy on an L-shaped playfield: has solutions, all rectangles, one is the whole-field-as-two-pieces', lField.length > 0 && lField.every(s => s.every(p => isRectangular(p.cells))));
  check('B34b the L-shaped playfield itself is not tileable by ONE piece when boxy', !lField.some(s => s.length === 1));
  // boxy + area number
  const area = new Map([[cellKeyOf(0,0), 3]]);
  const ba = allSolutions(3,2,makeGrid(3,2),new Map(),[],{boxy:true}, {areaNumbers: area});
  check('B35 boxy + area 3 at (0,0) on 3x2: piece is a 1x3 or 3x1 rectangle', ba.length > 0 && ba.every(s => { const p = pieceAt(s,0,0); return p.cells.length === 3 && isRectangular(p.cells); }));
  // boxy + match: all pieces identical rectangles (up to rotation)
  const bm = allSolutions(4,4,makeGrid(4,4),new Map(),[],{boxy:true,match:true,min:2,max:8});
  check('B36 boxy + match: every solution is all one rectangle shape', bm.length > 0 && bm.every(s => s.every(p => p.canonicalKey === s[0].canonicalKey && isRectangular(p.cells))));
  // boxy + mismatch on 4x4 min2 max8
  const bmm = allSolutions(4,4,makeGrid(4,4),new Map(),[],{boxy:true,mismatch:true,min:2,max:8});
  check('B37 boxy + mismatch: rectangles all distinct', bmm.every(s => new Set(s.map(p => p.canonicalKey)).size === s.length && s.every(p => isRectangular(p.cells))));
  // boxy + solitude
  const bs = allSolutions(4,1,makeGrid(4,1),new Map(),[],{boxy:true,solitude:true}, {areaNumbers: new Map([[cellKeyOf(0,0),2],[cellKeyOf(2,0),2]])});
  check('B38 boxy + solitude: two pieces', bs.length === 1 && bs[0].length === 2);
  // boxy + walls (delta / gemini)
  const bd = allSolutions(4,1,makeGrid(4,1),wallsFromList([['v',1,0,'delta']]),[],{boxy:true,precision:2});
  check('B39 boxy + delta between two same-shape dominoes -> impossible', bd.length === 0);
}

// -- boxy performance: fast path should be dramatically cheaper than filtering connected regions
{
  const t = timed(() => runSolver(10,10,makeGrid(10,10),new Map(),[],1,{boxy:true}));
  check('B40 10x10 boxy no size rule -> finds a solution fast (<1s)', t.r.solutions.length === 1 && t.ms < 1000);
  const t2 = timed(() => runSolver(10,10,makeGrid(10,10),new Map(),[],1,{boxy:true, precision:12}));
  check('B41 10x10 boxy precision 12 (does not divide 100) -> instant impossible', t2.r.solutions.length === 0 && t2.ms < 50);
  const t3 = timed(() => allSolutions(10,10,makeGrid(10,10),new Map(),[],{boxy:true, precision:10}));
  check('B42 10x10 boxy precision 10 -> solutions (1x10 and 2x5 strips), only rectangles', t3.r.length > 0 && t3.r.every(s => s.every(p => isRectangular(p.cells) && p.cells.length === 10)));
  check('B43 ... and it is fast (<5s)', t3.ms < 5000);
  const t4 = timed(() => runSolver(20,20,makeGrid(20,20),new Map(),[],2,{boxy:true, precision:40}));
  check('B44 20x20 boxy precision 40 -> 2 solutions quickly (<2s)', t4.r.solutions.length === 2 && t4.ms < 2000);
  console.log(`  (perf: 10x10 boxy any-size first solution ${t.ms}ms; 10x10 boxy p10 all=${t3.r.length} sols in ${t3.ms}ms; 20x20 boxy p40 x2 in ${t4.ms}ms)`);
}

// =====================================================================
// NEW: inequality (lt / gt) and difference (diff0..diff9) walls
// =====================================================================
{
  const bank = [DOMINO, TROMINO_I];
  const g5 = makeGrid(5,1);
  // wall at v:1,0 separates cell 1 and cell 2. Both the wall and the sizes force domino | tromino
  // (left piece 2 cells, right piece 3 cells) only if the wall is at v:1,0 -- cell0,cell1 | cell2,3,4.
  const wall = type => wallsFromList([['v',1,0,type]]);
  const base5 = allSolutions(5,1,g5,wall('wall'),bank);
  check('54-pre 1x5 domino+tromino with a plain wall at v:1,0 -> unique (domino | tromino)', base5.length === 1 && pieceSize(pieceAt(base5[0],0,0)) === 2);
  check('54 lt at v:1,0 (left 2 < right 3) -> unique', allSolutions(5,1,g5,wall('lt'),bank).length === 1);
  check('55 gt at v:1,0 -> impossible', allSolutions(5,1,g5,wall('gt'),bank).length === 0);
  check('56 diff1 -> unique', allSolutions(5,1,g5,wall('diff1'),bank).length === 1);
  check('57 diff2 -> impossible', allSolutions(5,1,g5,wall('diff2'),bank).length === 0);
  check('57b diff0 on unequal pieces -> impossible', allSolutions(5,1,g5,wall('diff0'),bank).length === 0);
  const g22 = makeGrid(2,2), w22 = type => wallsFromList([['v',0,0,type]]);
  check('58 2x2 domino bank, v:0,0 diff0 -> unique (wall splits into two equal pieces)', allSolutions(2,2,g22,w22('diff0'),[DOMINO]).length === 1);
  check('59 same layout, diff1 -> impossible', allSolutions(2,2,g22,w22('diff1'),[DOMINO]).length === 0);
  check('59b diff0 still blocks like a wall: no piece spans it', allSolutions(2,2,g22,w22('diff0'),[DOMINO]).every(s => s.every(p => !(covers(p,0,0) && covers(p,1,0)))));
  check('59c lt/gt/diff are still physical walls (no piece spans them)',
    ['lt','gt','diff3'].every(t => allSolutions(4,1,makeGrid(4,1),wallsFromList([['v',1,0,t]]),[],{min:1,max:3}).every(s => s.every(p => !(covers(p,1,0) && covers(p,2,0))))));

  // direction: lt means piece on the LEFT / TOP cell is smaller
  const left2right = allSolutions(5,1,g5,wall('lt'),[],{min:1,max:4});
  check('60 lt v-wall: every solution has left piece smaller than right piece', left2right.length > 0 && left2right.every(s => pieceSize(pieceAt(s,1,0)) < pieceSize(pieceAt(s,2,0))));
  const gtRes = allSolutions(5,1,g5,wall('gt'),[],{min:1,max:4});
  check('61 gt v-wall: every solution has left piece larger than right piece', gtRes.length > 0 && gtRes.every(s => pieceSize(pieceAt(s,1,0)) > pieceSize(pieceAt(s,2,0))));
  // horizontal walls: lt = TOP smaller. Column of 5, wall h:0,1 between rows 1 and 2.
  const g1x5 = makeGrid(1,5), hwall = type => wallsFromList([['h',0,1,type]]);
  const ltH = allSolutions(1,5,g1x5,hwall('lt'),[],{min:1,max:4});
  check('62 lt h-wall: top piece smaller than bottom piece', ltH.length > 0 && ltH.every(s => pieceSize(pieceAt(s,0,1)) < pieceSize(pieceAt(s,0,2))));
  const gtH = allSolutions(1,5,g1x5,hwall('gt'),[],{min:1,max:4});
  check('63 gt h-wall: top piece larger than bottom piece', gtH.length > 0 && gtH.every(s => pieceSize(pieceAt(s,0,1)) > pieceSize(pieceAt(s,0,2))));
  const eqH = allSolutions(1,5,g1x5,hwall('diff0'),[],{min:1,max:4});
  check('64 lt + gt + diff0 partition the plain-wall solutions exactly',
    allSolutions(1,5,g1x5,hwall('wall'),[],{min:1,max:4}).length === ltH.length + gtH.length + eqH.length && eqH.length > 0 && ltH.length > 0 && gtH.length > 0);

  // difference = exact |a-b|; cross-check against brute-force filter of the plain-wall baseline
  const sig = s => s.map(p => p.cells.map(x => x.join(',')).sort().join('|')).sort().join('/');
  const plain = allSolutions(6,1,makeGrid(6,1),wallsFromList([['v',2,0,'wall']]),[],{min:1,max:5});
  for(const n of [0,1,2,3,4]){
    const exp = new Set(plain.filter(s => Math.abs(pieceSize(pieceAt(s,2,0)) - pieceSize(pieceAt(s,3,0))) === n).map(sig));
    const got = new Set(allSolutions(6,1,makeGrid(6,1),wallsFromList([['v',2,0,'diff'+n]]),[],{min:1,max:5}).map(sig));
    check(`65 diff${n} == baseline filtered by |a-b|==${n} (${exp.size} tilings)`, exp.size === got.size && [...exp].every(k => got.has(k)));
  }
  check('65b fixture: baseline has tilings for several different differences', new Set(plain.map(s => Math.abs(pieceSize(pieceAt(s,2,0)) - pieceSize(pieceAt(s,3,0))))).size >= 3);

  // 2-D cross-check: 4x4 free-form min2/max4 with an lt wall in the middle
  const w44 = wallsFromList([['v',1,1,'lt']]);
  const plain44 = allSolutions(4,4,makeGrid(4,4),wallsFromList([['v',1,1,'wall']]),[],{min:2,max:4});
  const exp44 = new Set(plain44.filter(s => pieceSize(pieceAt(s,1,1)) < pieceSize(pieceAt(s,2,1))).map(sig));
  const got44 = new Set(allSolutions(4,4,makeGrid(4,4),w44,[],{min:2,max:4}).map(sig));
  check('66 4x4 lt wall == baseline filtered (2D cross-check)', exp44.size > 0 && exp44.size === got44.size && [...exp44].every(k => got44.has(k)));
  const exp44g = new Set(plain44.filter(s => pieceSize(pieceAt(s,1,1)) > pieceSize(pieceAt(s,2,1))).map(sig));
  const got44g = new Set(allSolutions(4,4,makeGrid(4,4),wallsFromList([['v',1,1,'gt']]),[],{min:2,max:4}).map(sig));
  check('67 4x4 gt wall == baseline filtered (2D cross-check)', exp44g.size > 0 && exp44g.size === got44g.size && [...exp44g].every(k => got44g.has(k)));
  const hw = wallsFromList([['h',2,1,'diff1']]);
  const plainH = allSolutions(4,4,makeGrid(4,4),wallsFromList([['h',2,1,'wall']]),[],{min:2,max:4});
  const expH = new Set(plainH.filter(s => Math.abs(pieceSize(pieceAt(s,2,1)) - pieceSize(pieceAt(s,2,2))) === 1).map(sig));
  const gotH = new Set(allSolutions(4,4,makeGrid(4,4),hw,[],{min:2,max:4}).map(sig));
  check('68 4x4 diff1 on an h-wall == baseline filtered', expH.size > 0 && expH.size === gotH.size && [...expH].every(k => gotH.has(k)));

  // several walls at once
  const multi = wallsFromList([['v',0,0,'lt'],['v',2,0,'gt']]);   // 1x?: A < B > C
  const ms = allSolutions(6,1,makeGrid(6,1),multi,[],{min:1,max:4});
  check('69 two inequality walls (A<B>C): all solutions satisfy both', ms.length > 0 && ms.every(s => pieceSize(pieceAt(s,0,0)) < pieceSize(pieceAt(s,1,0)) && pieceSize(pieceAt(s,2,0)) > pieceSize(pieceAt(s,3,0))));
  // chain of three pieces A<B<C (cells 0 | 1-2 | 3-5): the only split is 1<2<3
  const strict = allSolutions(6,1,makeGrid(6,1),wallsFromList([['v',0,0,'lt'],['v',2,0,'lt']]),[],{min:1,max:5});
  check('70b A<B<C with walls only at v:0,0 and v:2,0: pieces (cell0)|(cells1-2)|(cells3-5) -> 1<2<3 unique', strict.length === 1);
  // inequality cycle (2x2 ring of four single-cell-pair pieces) can only be reported impossible by search; make sure it terminates
  const cyc = runSolver(2,2,makeGrid(2,2),wallsFromList([['v',0,0,'lt'],['h',1,0,'lt'],['v',0,1,'gt'],['h',0,0,'gt']]),[DOMINO,shape(9,[[0,0]])],0,{});
  check('71 terminating on a cyclic-inequality ring', !cyc.exceeded);

  // interplay with other mechanics
  const withDelta = allSolutions(5,1,g5,wallsFromList([['v',1,0,'lt'],['v',2,0,'wall']]),[DOMINO,TROMINO_I]);
  check('72 lt wall + another plain wall both respected', withDelta.every(s => !pieceAt(s,1,0).cells.some(([c]) => c === 2)));
  const withArea = allSolutions(5,1,g5,wall('lt'),[],{min:1,max:4},{areaNumbers:new Map([[cellKeyOf(0,0),1]])});
  check('73 lt wall + area number 1 on left cell: left piece size 1, right piece size > 1', withArea.length > 0 && withArea.every(s => pieceSize(pieceAt(s,0,0)) === 1));
  const noRoom = allSolutions(5,1,g5,wall('lt'),[],{precision:1});
  check('74 lt wall with all pieces forced to size 1 -> impossible (1 < 1 false)', noRoom.length === 0);
  check('75 diff0 wall with precision forced pieces -> unique tiling', allSolutions(4,1,makeGrid(4,1),wallsFromList([['v',1,0,'diff0']]),[],{precision:2}).length === 1);
  const withMatch = allSolutions(6,1,makeGrid(6,1),wallsFromList([['v',2,0,'lt']]),[],{match:true,min:1,max:5});
  check('76 lt + match: contradiction (matching pieces have equal areas) -> impossible', withMatch.length === 0);
  const withMingleArea = allSolutions(6,1,makeGrid(6,1),wallsFromList([['v',2,0,'diff0']]),[],{mingleArea:true,min:1,max:5});
  check('77 diff0 + mingle area on the same boundary -> impossible', withMingleArea.length === 0);
  const withBoxy = allSolutions(4,2,makeGrid(4,2),wallsFromList([['v',1,0,'lt']]),[],{boxy:true,min:1,max:8});
  check('78 boxy + lt: every piece rectangular and left < right', withBoxy.length > 0 && withBoxy.every(s => s.every(p => isRectangular(p.cells)) && pieceSize(pieceAt(s,1,0)) < pieceSize(pieceAt(s,2,0))));
  const withBank = allSolutions(5,1,g5,wall('diff1'),[DOMINO,TROMINO_I]);
  check('79 bank mode + diff1 works the same as free-form', withBank.length === 1);

  // a wall relation must not leak through the old types: delta/gemini unchanged
  check('80 delta still works through specialEdges', allSolutions(4,1,makeGrid(4,1),wallsFromList([['v',1,0,'delta']]),[DOMINO]).length === 0);
  check('81 gemini still works through specialEdges', allSolutions(4,1,makeGrid(4,1),wallsFromList([['v',1,0,'gemini']]),[DOMINO]).length === 1);
  check('82 solver accepts an omitted specialEdges argument', (() => {
    const puzzle = { w:2, h:1, active: makeGrid(2,1), walls: new Map(), roses:new Map(), polyominoes:new Map(), areaNumbers:new Map() };
    const ctx = buildSolverContext(puzzle, [DOMINO], {});
    let n = 0; for(const ev of solvePuzzle(2,1,ctx,undefined,1000)) if(ev.type==='solution') n++;
    return n === 1;
  })());

  // ---- always-valid pre-checks for area-relation walls
  const instant = (label, res) => check(label, res.r.solutions.length === 0 && !res.r.exceeded && res.ms < 50);
  instant('83 10x10 precision 4 + lt wall (all pieces equal) -> impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt']]),[],1,{precision:4})));
  instant('84 precision 4 + diff2 + lt -> impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt'],['h',7,2,'diff2']]),[],1,{precision:4})));
  instant('85 gt wall + Match rule -> impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'gt']]),[],1,{match:true,min:1,max:8})));
  instant('86 diff3 with bank sizes {2,3} only (no pair 3 apart) -> impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'diff3']]),[DOMINO,TROMINO_I],1,{})));
  instant('87 lt with a one-shape bank (single size) -> impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt']]),[DOMINO],1,{})));
  instant('88 range min3 max4: diff2 impossible instantly',
    timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'diff2']]),[],1,{min:3,max:4})));
  check('89 range min3 max4: diff1 and lt are possible', !!runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'diff1']]),[],1,{min:3,max:4}).solutions.length
        && !!runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt']]),[],1,{min:3,max:4}).solutions.length);
  const ar = (...l) => new Map(l.map(([c,r,v]) => [cellKeyOf(c,r), v]));
  instant('90 lt wall with area 5 left, area 3 right -> impossible instantly',
    timed(() => runSolver(10,1,makeGrid(10,1),wallsFromList([['v',4,0,'lt']]),[],1,{},{areaNumbers: ar([4,0,5],[5,0,3])})));
  check('91 lt wall with area 3 left, area 5 right -> solvable',
    runSolver(10,1,makeGrid(10,1),wallsFromList([['v',4,0,'lt']]),[],1,{},{areaNumbers: ar([4,0,3],[5,0,5])}).solutions.length === 1);
  instant('92 diff0 wall with different area numbers -> impossible instantly',
    timed(() => runSolver(10,1,makeGrid(10,1),wallsFromList([['v',4,0,'diff0']]),[],1,{},{areaNumbers: ar([4,0,3],[5,0,4])})));
  instant('93 diff2 wall with area numbers 3 and 4 -> impossible instantly',
    timed(() => runSolver(10,1,makeGrid(10,1),wallsFromList([['v',4,0,'diff2']]),[],1,{},{areaNumbers: ar([4,0,3],[5,0,4])})));
  check('94 diff1 wall with area numbers 3 and 4 -> solvable',
    runSolver(10,1,makeGrid(10,1),wallsFromList([['v',4,0,'diff1']]),[],1,{},{areaNumbers: ar([4,0,3],[5,0,4])}).solutions.length === 1);

  // ---- pruning (size restriction + forward check) must be sound: solution SETS equal brute-force
  // filtering of the plain-wall baseline, on constrained puzzles with several relation walls at once
  const sig2 = s => s.map(p => p.cells.map(x => x.join(',')).sort().join('|')).sort().join('/');
  const sizeAt = (s,c,r) => pieceSize(pieceAt(s,c,r));
  {
    const plainW = wallsFromList([['v',1,1,'wall'],['h',2,2,'wall'],['v',0,2,'wall']]);
    const rel = wallsFromList([['v',1,1,'lt'],['h',2,2,'diff1'],['v',0,2,'gt']]);
    const plainSols = allSolutions(4,4,makeGrid(4,4),plainW,[],{min:1,max:5});
    const exp = new Set(plainSols.filter(s => sizeAt(s,1,1) < sizeAt(s,2,1) && Math.abs(sizeAt(s,2,2) - sizeAt(s,2,3)) === 1 && sizeAt(s,0,2) > sizeAt(s,1,2)).map(sig2));
    const got = new Set(allSolutions(4,4,makeGrid(4,4),rel,[],{min:1,max:5}).map(sig2));
    check('95 three mixed relation walls on 4x4: solution set == brute-force filter (' + exp.size + ' tilings)', exp.size > 0 && exp.size === got.size && [...exp].every(k => got.has(k)));
  }
  {
    const plainW = wallsFromList([['v',2,0,'wall'],['v',2,1,'wall'],['v',2,2,'wall'],['v',2,3,'wall']]);
    const rel = wallsFromList([['v',2,0,'lt'],['v',2,1,'diff2'],['v',2,2,'gt'],['v',2,3,'diff0']]);
    const plainSols = allSolutions(5,4,makeGrid(5,4),plainW,[DOMINO,TROMINO_I,TROMINO_L,I4,O4],{min:2,max:4});
    const exp = new Set(plainSols.filter(s => sizeAt(s,2,0) < sizeAt(s,3,0) && Math.abs(sizeAt(s,2,1) - sizeAt(s,3,1)) === 2 && sizeAt(s,2,2) > sizeAt(s,3,2) && sizeAt(s,2,3) === sizeAt(s,3,3)).map(sig2));
    const got = new Set(allSolutions(5,4,makeGrid(5,4),rel,[DOMINO,TROMINO_I,TROMINO_L,I4,O4],{min:2,max:4}).map(sig2));
    check('96 bank mode, four relation walls on 5x4: solution set == brute-force filter (' + exp.size + ' tilings)', exp.size > 0 && exp.size === got.size && [...exp].every(k => got.has(k)));
  }
  {
    const plainW = wallsFromList([['v',1,1,'wall'],['v',1,2,'wall']]);
    const rel = wallsFromList([['v',1,1,'lt'],['v',1,2,'diff1']]);
    const rules = {min:2,max:4,mingleShape:true};
    const plainSols = allSolutions(4,4,makeGrid(4,4),plainW,[],rules);
    const exp = new Set(plainSols.filter(s => sizeAt(s,1,1) < sizeAt(s,2,1) && Math.abs(sizeAt(s,1,2) - sizeAt(s,2,2)) === 1).map(sig2));
    const got = new Set(allSolutions(4,4,makeGrid(4,4),rel,[],rules).map(sig2));
    check('97 relation walls + mingle shape: solution set == brute-force filter (' + exp.size + ' tilings)', exp.size === got.size && [...exp].every(k => got.has(k)));
  }

  // ---- performance: constrained puzzles that used to exhaust the search budget
  const tA = timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt'],['v',6,6,'gt'],['h',2,2,'diff1']]),[],2,{min:3,max:4}));
  check('98 10x10 sizes 3-4 with lt + gt + diff1 walls: 2 solutions fast (<2s)', tA.r.solutions.length === 2 && !tA.r.exceeded && tA.ms < 2000);
  const tB = timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'lt']]),[DOMINO,TROMINO_I],2,{}));
  check('99 10x10 domino+tromino bank with an lt wall: 2 solutions fast (<2s)', tB.r.solutions.length === 2 && !tB.r.exceeded && tB.ms < 2000);
  const tC = timed(() => runSolver(10,10,makeGrid(10,10),wallsFromList([['v',4,4,'diff0']]),[],1,{precision:4}));
  check('100 10x10 precision 4 with a diff0 wall (always satisfied): fast (<2s)', tC.r.solutions.length === 1 && tC.ms < 2000);
  console.log(`  (perf: 98 ${tA.ms}ms, 99 ${tB.ms}ms, 100 ${tC.ms}ms)`);
}


// ---------- 101+: solver-only limits (max region size / max region amount) ----------
{
  const sig = s => s.map(p => p.cells.map(x => x.join(',')).sort().join('|')).sort().join('/');
  const maxPiece = s => Math.max(...s.map(pieceSize));
  // solution SET under the limits must equal the unlimited solution set filtered by the same limits
  function crossCheck(label, w, h, walls, bank, rules, extras, hintList){
    const base = allSolutions(w, h, makeGrid(w,h), walls, bank, rules, extras);
    for(const hints of hintList){
      const exp = new Set(base.filter(s => (hints.maxRegionSize == null || maxPiece(s) <= hints.maxRegionSize) &&
                                           (hints.maxRegions == null || s.length <= hints.maxRegions)).map(sig));
      const gotList = runSolver(w, h, makeGrid(w,h), walls, bank, 0, rules, extras, null, hints).solutions;
      const got = new Set(gotList.map(sig));
      check(`${label} ${JSON.stringify(hints)}: set == filtered baseline (${exp.size} of ${base.length}), no duplicates`,
            exp.size === got.size && gotList.length === got.size && [...exp].every(k => got.has(k)));
    }
    return base.length;
  }
  const HL = [{maxRegionSize:3},{maxRegionSize:4},{maxRegions:4},{maxRegions:6},{maxRegionSize:4,maxRegions:5},{maxRegionSize:3,maxRegions:7},{maxRegionSize:1},{maxRegions:1}];
  crossCheck('101 4x3 free-form min2/max4', 4,3, new Map(), [], {min:2,max:4}, {}, HL);
  crossCheck('102 3x3 free-form no size rule', 3,3, new Map(), [], {}, {}, HL);
  crossCheck('103 4x4 Match', 4,4, new Map(), [], {min:2,max:4,match:true}, {}, HL);
  crossCheck('104 4x4 Mismatch', 4,4, new Map(), [], {min:2,max:6,mismatch:true}, {}, HL);
  crossCheck('105 4x3 Mingle Area', 4,3, new Map(), [], {min:2,max:5,mingleArea:true}, {}, HL);
  crossCheck('106 4x4 bank', 4,4, new Map(), [DOMINO,TROMINO_I,TROMINO_L,I4,O4], {min:2,max:4}, {}, HL);
  crossCheck('107 4x4 walls + lt/diff relations', 4,4, wallsFromList([['v',1,1,'lt'],['h',2,2,'diff1'],['v',0,2,'gt']]), [], {min:1,max:5}, {}, HL);
  crossCheck('108 4x3 boxy', 4,3, new Map(), [], {boxy:true}, {}, HL);
  crossCheck('109 4x4 area numbers', 4,4, new Map(), [], {min:2,max:5}, {areaNumbers:new Map([['0,0',3],['3,3',4]])}, HL);
  crossCheck('110 4x3 Match with bank', 4,3, new Map(), [DOMINO,I4,O4], {match:true}, {}, HL);

  // area numbers must respect the size rules (bug fixed alongside the limits)
  check('111 free-form: area 5 under max 3 -> impossible', allSolutions(5,1,makeGrid(5,1),new Map(),[],{max:3},{areaNumbers:new Map([['0,0',5]])}).length === 0);
  check('112 free-form: area 2 under min 3 -> impossible', allSolutions(2,1,makeGrid(2,1),new Map(),[],{min:3},{areaNumbers:new Map([['0,0',2]])}).length === 0);
  check('113 free-form: area 4 under precision 4 still fine', allSolutions(4,1,makeGrid(4,1),new Map(),[],{precision:4},{areaNumbers:new Map([['0,0',4]])}).length === 1);
  check('114 max region size 3 contradicts an area number of 5 -> impossible', runSolver(5,1,makeGrid(5,1),new Map(),[],0,{},{areaNumbers:new Map([['0,0',5]])},null,{maxRegionSize:3}).solutions.length === 0);

  // limits that cannot be met are rejected immediately
  const one = (w,h,bank,rules,hints,extras) => timed(() => runSolver(w,h,makeGrid(w,h),new Map(),bank,0,rules,extras,null,hints));
  { const t = one(6,6,[],{},{maxRegionSize:4,maxRegions:8}); check('115 36 cells, pieces <=4, <=8 pieces -> impossible instantly', t.r.solutions.length === 0 && t.r.nodes === 0 && t.ms < 50); }
  check('116 1x6 dominoes, max 2 regions -> impossible', one(6,1,[DOMINO],{},{maxRegions:2}).r.solutions.length === 0);
  check('117 1x6 dominoes, max 3 regions -> unique', one(6,1,[DOMINO],{},{maxRegions:3}).r.solutions.length === 1);
  check('118 precision 4, max region size 3 -> impossible', one(8,1,[],{precision:4},{maxRegionSize:3}).r.solutions.length === 0);
  check('119 max region size larger than the Maximum rule changes nothing', allSolutions(4,2,makeGrid(4,2),new Map(),[],{max:3}).length === runSolver(4,2,makeGrid(4,2),new Map(),[],0,{max:3},{},null,{maxRegionSize:50}).solutions.length);
  check('120 invalid limits (0, -1, 2.5, NaN, null, undefined) are ignored', [0,-1,2.5,NaN,null,undefined].every(v =>
    one(4,2,[],{max:3},{maxRegionSize:v,maxRegions:v}).r.solutions.length === allSolutions(4,2,makeGrid(4,2),new Map(),[],{max:3}).length));
  check('121 ctx without hints behaves as before', buildSolverContext({w:2,h:2,active:makeGrid(2,2),walls:new Map()},[],{}).maxRegions === null);

  // the limits really prune: far fewer nodes than the unlimited run (counted without storing every solution)
  {
    const countRun = hints => {
      const puzzle = { w:4, h:4, active:makeGrid(4,4), walls:new Map(), roses:new Map(), polyominoes:new Map(), areaNumbers:new Map() };
      const ctx = buildSolverContext(puzzle, [], {min:2,max:4}, hints);
      let nodes = 0, sols = 0;
      for(const ev of solvePuzzle(4, 4, ctx, [], 5e6)){ if(ev.type === 'progress') nodes = ev.nodes; else if(ev.type === 'solution') sols++; }
      return { nodes, sols };
    };
    const free = countRun(null), lim = countRun({ maxRegionSize:3, maxRegions:7 });
    check('122 limits cut the node count on 4x4 min2/max4 (' + lim.nodes + ' vs ' + free.nodes + ')', lim.nodes < free.nodes / 3 && lim.sols > 0);
  }
}

// ---------- 130+: progress estimate ----------
{
  function trace(w, h, rules, bank, opts, hints){
    const puzzle = { w, h, active: makeGrid(w,h), walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() };
    const ctx = buildSolverContext(puzzle, bank || [], rules, hints);
    const ev = [], roots = []; let sols = 0;
    for(const e of solvePuzzle(w, h, ctx, [], 5e7, opts)){
      if(e.type === 'progress') ev.push(e); else if(e.type === 'solution'){ sols++; if(sols >= 2 && opts && opts.stopAt2) break; } else if(e.type === 'root-count') roots.push(e.n);
    }
    return { ev, sols, roots };
  }
  const quick = trace(10, 10, {precision:4}, [], { stopAt2: true });
  check('130 a quick search never reports a fraction (nothing to estimate)', quick.ev.every(e => e.fraction === null));

  const t = trace(4, 4, {min:2,max:4}, [], { probeAfterMs: 0 });
  const withF = t.ev.filter(e => e.fraction !== null);
  check('131 forced probe: estimates are produced', withF.length > 20);
  check('132 every fraction is within [0,1]', t.ev.every(e => e.fraction === null || (e.fraction >= 0 && e.fraction <= 1)));
  const total = t.ev[t.ev.length-1].nodes;
  const err = withF.map(e => Math.abs(e.fraction - e.nodes/total));
  const meanErr = err.reduce((a,b) => a+b, 0) / err.length;
  check('133 mean |estimate - true node fraction| < 0.15 (got ' + meanErr.toFixed(3) + ')', meanErr < 0.15);
  let maxDrop = 0; for(let i = 1; i < withF.length; i++) maxDrop = Math.max(maxDrop, withF[i-1].fraction - withF[i].fraction);
  check('134 estimate almost never goes backwards (max drop ' + maxDrop.toFixed(3) + ')', maxDrop < 0.1);
  check('135 estimate ends near the finish (' + withF[withF.length-1].fraction.toFixed(2) + ')', withF[withF.length-1].fraction > 0.8);

  const t2 = trace(6, 4, {precision:3}, [], { probeAfterMs: 0 });
  const f2 = t2.ev.filter(e => e.fraction !== null);
  const tot2 = t2.ev[t2.ev.length-1].nodes;
  check('136 second puzzle (6x4 precision 3): mean error < 0.2', f2.length > 5 && f2.reduce((a,e) => a + Math.abs(e.fraction - e.nodes/tot2), 0) / f2.length < 0.2);

  // the root count equals the number of viable first pieces
  const rc = trace(4, 4, {min:2,max:4}, [], { rootCountOnly: true });
  let expected = 0;
  for(let sz = 2; sz <= 4; sz++) for(const _ of enumerateConnectedSubsetsContaining([0,0], sz, (c,r) => c>=0&&r>=0&&c<4&&r<4, () => true)) expected++;
  check('137 root count == pieces containing the first cell (' + expected + ')', rc.roots.length === 1 && rc.roots[0] === expected);
  const wide = timed(() => trace(10, 10, {}, [], { rootCountOnly: true }));
  check('138 root count gives up (null) when the root is too wide, quickly', wide.r.roots[0] === null && wide.ms < 1500);
  const lim = trace(6, 6, {min:3,max:4}, [], { rootCountOnly: true }, { maxRegions: 12 });
  check('139 root count respects max regions (smaller or equal)', lim.roots[0] !== null && lim.roots[0] <= trace(6, 6, {min:3,max:4}, [], { rootCountOnly: true }).roots[0]);
  // a real (non-forced) long search gets a probe on its own
  const slow = trace(4, 5, {min:3,max:5}, [], {});
  check('140 a search longer than 150ms probes by itself and reports fractions', slow.ev.some(e => e.fraction !== null));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
