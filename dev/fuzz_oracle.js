// A and B (all option sets) against the independent oracle. usage: node fuzz_oracle.js N seed mode(random|planted) rich(0|1)
const L = require('./fuzzlib.js');
const O = require('./oracle.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, mode = process.argv[4] || 'random', rich = process.argv[5] === '1';
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 400, restart: 'first', order: 'clues', useWitness: false, focusMode: 'first' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
  { testNodes: 30, restart: 'continue', order: 'scan', useWitness: true, nearShare: 0 },
];
const verdict = k => k === 0 ? 'none' : k === 1 ? 'unique' : 'multi';
let bad = 0, checked = 0, unsupported = 0; const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const o = { rich, noSpecials: true, maxW: 3, maxH: 3 };
  const P = mode === 'planted' ? L.plantedPuzzle(seed0 * 100000 + i, Object.assign({ w: 3 + (i % 2), h: 3 + ((i >> 1) % 2), maxPiece: 5 }, o)) : L.randomPuzzle(seed0 * 100000 + i, o);
  if(P.puzzle.w * P.puzzle.h > 16) continue;
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
    if(!ok){ bad++; if(bad <= 6) console.log('MISMATCH', name, 'seed', seed0 * 100000 + i, 'oracle', truth.length, 'got', r.sols.length, JSON.stringify(P.rules)); }
  }
}
console.log(`oracle fuzz ${mode}${rich ? '+rich' : ''}: puzzles ${N} ${JSON.stringify(tally)} unsupported ${unsupported}, checks ${checked}, mismatches ${bad}`);
process.exit(bad ? 1 : 0);
