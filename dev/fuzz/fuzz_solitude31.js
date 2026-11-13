// Solitude end to end: planted one-symbol-per-piece puzzles + mutants, the exact search and 5 deduce option sets against the independent oracle.
// node fuzz_solitude31.js [N=80] [seed=1]
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 80, seed0 = +process.argv[3] || 1;
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 400, restart: 'first', order: 'clues', useWitness: false, focusMode: 'first' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
  { testNodes: 30, restart: 'continue', order: 'scan', useWitness: true, nearShare: 0 },
];
const verdict = k => k === 0 ? 'none' : k === 1 ? 'unique' : 'multi';
let bad = 0, checked = 0; const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i;
  const P = L.plantedPuzzle(seed, { w: 3 + (i % 2), h: 3 + ((i >> 1) % 2), maxPiece: 5, rich: false, clueP: 0, wallP: 0.3, bank: false, holes: 0.03 });
  const R = L.rng(seed + 7), pick = n => Math.floor(R() * n);
  const roses = new Map(), poly = new Map(), areas = new Map(), comps = new Map(), EC = { n: null, e: null, s: null, w: null }, mode = pick(4);   // 3 = empty compasses only
  P.planted.forEach(cells => {
    const [c, r] = cells[pick(cells.length)], k = c + ',' + r;
    if(mode === 2) roses.set(k, 1);
    else if(mode === 3 || (mode === 1 && R() < 0.25)) comps.set(k, EC);
    else if(mode === 1 && R() < 0.4){ const mx = Math.min(...cells.map(q => q[0])), my = Math.min(...cells.map(q => q[1])); poly.set(k, { cells: cells.map(([x, y]) => [x - mx, y - my]), canonicalKey: L.S.canonicalShapeKey(cells) }); }
    else areas.set(k, cells.length);
  });
  const m = pick(5);                                         // mutants: drop / add / double a symbol
  if(m === 1){ const t = mode === 2 ? roses : mode === 3 ? comps : areas, ks = [...t.keys()]; if(ks.length) t.delete(ks[pick(ks.length)]); }
  else if(m === 2 && mode !== 2){ const cs = P.planted[pick(P.planted.length)]; const [c, r] = cs[pick(cs.length)]; areas.set(c + ',' + r, 1 + pick(4)); }
  P.puzzle.roses = roses; P.puzzle.polyominoes = poly; P.puzzle.areaNumbers = areas; P.puzzle.compasses = comps; P.puzzle.palisades = new Map();
  P.rules.solitude = true;
  if(P.puzzle.w * P.puzzle.h > 16) continue;
  const truth = O.oracle(P, 3); if(truth === null) continue;
  tally[verdict(truth.length)]++;
  const checks = [['A', L.exact(P, 2, 200000)]];
  for(const [oi, op] of optSets.entries()) checks.push(['B' + oi, L.deduce(P, op, 2, 200000)]);
  for(const [name, r] of checks){
    if(r.exceeded) continue;
    checked++;
    const want = Math.min(truth.length, 2);
    let ok = r.sols.length === want;
    if(ok && truth.length === 1) ok = L.sig(r.sols[0]) === O.sigCells(truth[0]);
    if(!ok){ bad++; if(bad <= 6) console.log('MISMATCH', name, 'seed', seed, 'oracle', truth.length, 'got', r.sols.length); }
  }
}
console.log(`solitude fuzz: puzzles ${N} ${JSON.stringify(tally)}, checks ${checked}, mismatches ${bad}`);
process.exit(bad ? 1 : 0);
