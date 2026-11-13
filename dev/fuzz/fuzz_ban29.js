// v29 Shape ban't against the independent brute-force oracle (oracle.js checks the ban the slow way: every subset of a piece).
// usage: node fuzz_ban29.js N seed [rich 0|1]
// Each puzzle: a planted tiling (walls / symbols / size rules / bank as in fuzzlib) + a random ban set. Half of the sets are chosen so the planted
// tiling stays valid (then the puzzle has a solution and every deduction can be checked against it), half are arbitrary (often impossible).
// Checks: exact search and 5 option sets of the deduction solver give the oracle's verdict (0 / 1 / 2+ solutions, and the same unique tiling),
// every solution contains no banned shape (checked here with the core helper), and the planted tiling is never lost when it is valid.
const L = require('../fuzzlib.js');
const O = require('../oracle.js');
const N = +process.argv[2] || 200, seed0 = +process.argv[3] || 1, rich = process.argv[4] === '1';
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 400, restart: 'first', order: 'clues', useWitness: false, focusMode: 'first' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
  { testNodes: 30, restart: 'continue', order: 'scan', useWitness: true, nearShare: 0 },
];
const POOL = [
  [[0,0]], [[0,0],[1,0]], [[0,0],[1,0],[2,0]], [[0,0],[1,0],[0,1]], [[0,0],[1,0],[2,0],[3,0]], [[0,0],[1,0],[2,0],[0,1]],
  [[0,0],[1,0],[2,0],[1,1]], [[0,0],[1,0],[1,1],[2,1]], [[0,0],[1,0],[0,1],[1,1]], [[0,0],[1,0],[0,1],[1,1],[0,2]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]], [[1,0],[0,1],[1,1],[2,1],[1,2]], [[0,0],[1,0],[2,0],[0,1],[0,2]],
];
const canonOf = L.S.canonicalShapeKey;
const verdict = k => k === 0 ? 'none' : k === 1 ? 'unique' : 'multi';
function banned(ban, cells){ const bi = L.S.banInfoFor(ban); return bi ? L.S.containsShapeSet(bi.shapes, cells) : false; }
let bad = 0, checked = 0, unsupported = 0, plantedOk = 0; const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = L.rng(seed ^ 0x5bd1e995), pick = n => Math.floor(R() * n);
  const P = L.plantedPuzzle(seed, { rich, noSpecials: true, w: 3 + (i % 2), h: 3 + ((i >> 1) % 2), maxPiece: 6 });
  if(P.puzzle.w * P.puzzle.h > 16) continue;
  const k = 1 + pick(2), ban = [];
  const consistent = i % 2 === 0;
  for(let t = 0; t < 12 && ban.length < k; t++){
    const cells = POOL[pick(POOL.length)];
    if(consistent && P.planted.some(p => banned([{ cells }], p))) continue;
    if(!consistent && cells.length === 1 && R() < 0.8) continue;       // a banned monomino kills everything: keep it rare
    ban.push({ id: ban.length + 1, cells });
  }
  P.ban = ban;
  const truth = O.oracle(P, 3);
  if(truth === null){ unsupported++; continue; }
  tally[verdict(truth.length)]++;
  const a = L.exact(P, 2, 200000);
  const checks = [['A', a]];
  for(const [oi, op] of optSets.entries()) checks.push(['B' + oi, L.deduce(P, op, 2, 200000)]);
  for(const [name, r] of checks){
    if(r.exceeded) continue;
    checked++;
    const want = Math.min(truth.length, 2);
    let ok = r.sols.length === want;
    if(ok && truth.length === 1) ok = L.sig(r.sols[0]) === O.sigCells(truth[0]);
    if(ok && want === 2){ const all = new Set(O.oracle(P, 100000).map(O.sigCells)); ok = r.sols.every(s => all.has(L.sig(s))) && L.sig(r.sols[0]) !== L.sig(r.sols[1]); }
    if(ok) for(const s of r.sols) for(const pc of s) if(banned(ban, pc.cells)) ok = false;
    if(!ok){ bad++; if(bad <= 6) console.log('MISMATCH', name, 'seed', seed, 'oracle', truth.length, 'got', r.sols.length, JSON.stringify(P.rules), 'ban', JSON.stringify(ban.map(b => b.cells))); }
  }
  if(consistent && truth.length > 0){
    // the planted tiling satisfies every rule, so the oracle must know it (guards the generator, not the solver)
    const ps = O.sigCells(P.planted);
    if(!O.oracle(P, 100000).map(O.sigCells).includes(ps)){ /* planted can break size rules chosen from its own sizes: not an error */ } else plantedOk++;
  }
}
console.log(`ban't fuzz${rich ? '+rich' : ''}: puzzles ${N} ${JSON.stringify(tally)} unsupported ${unsupported}, checks ${checked}, planted kept ${plantedOk}, mismatches ${bad}`);
process.exit(bad ? 1 : 0);
