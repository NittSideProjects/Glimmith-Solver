// v123: the SAT final search for Match against the old final search, the exact search and the independent oracle.
// Every solution is asked for (stopAtTwo: false), so the whole solution SETS are compared, not only "unique or not".
// usage: node fuzz/fuzz_matchsat123.js N seed [rich] [planted]
const L = require('../fuzzlib.js');
const O = require('../oracle.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, rich = process.argv.includes('rich'), planted = process.argv.includes('planted');
const BUD = 200000, CAP = 400;
const optSets = [
  { stopAtTwo: false },                                       // the page's pipeline, every solution
  { stopAtTwo: false, finalOnly: true },                      // SAT straight after the root propagation (almost nothing proved yet)
  { stopAtTwo: false, finalOnly: true, matchSatClauses: 1 },  // the SAT search says "too big": the old final search must run
  { },                                                        // stop at two (the page's use)
  { finalOnly: true },
];
let bad = 0, checked = 0, skipped = 0, orChecked = 0; const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const sd = seed0 * 100000 + i;
  const P = planted ? L.plantedPuzzle(sd, { rich, w: 3 + (i % 3), h: 3 + ((i >> 1) % 2), maxPiece: 6 }) : L.randomPuzzle(sd, { rich, maxW: rich ? 4 : 5, maxH: rich ? 3 : 4 });
  P.rules.match = true; P.rules.mismatch = false; P.rules.mingleShape = false; P.rules.mingleArea = false; if(i % 2) P.rules.precision = null;
  const ref = L.deduce(P, { stopAtTwo: false, matchSat: false, finalOnly: true }, CAP, BUD);   // the old final search
  const ex = L.exact(P, CAP, BUD);
  if(ref.exceeded || ex.exceeded || ex.sols.length >= CAP){ skipped++; continue; }
  const all = new Set(ex.sols.map(L.sig));
  tally[ex.sols.length === 0 ? 'none' : ex.sols.length === 1 ? 'unique' : 'multi']++;
  const refSet = new Set(ref.sols.map(L.sig));
  if(refSet.size !== all.size || [...all].some(x => !refSet.has(x))){ bad++; if(bad <= 6) console.log('OLD SEARCH DIFFERS', sd, all.size, refSet.size); }
  if(P.puzzle.w * P.puzzle.h <= 16){
    const truth = O.oracle(P, 100000);
    if(truth !== null && truth.length < 100000){
      orChecked++;
      const ts = new Set(truth.map(O.sigCells));
      if(ts.size !== all.size || [...ts].some(x => !all.has(x))){ bad++; if(bad <= 6) console.log('ORACLE DIFFERS', sd, ts.size, all.size); }
    }
  }
  for(const [oi, o] of optSets.entries()){
    const b = L.deduce(P, o, o.stopAtTwo === false ? CAP : 2, BUD);
    if(b.exceeded){ skipped++; continue; }
    checked++;
    const bs = b.sols.map(L.sig);
    let ok = new Set(bs).size === bs.length && bs.every(x => all.has(x));
    if(o.stopAtTwo === false) ok = ok && bs.length === all.size;
    else ok = ok && bs.length === Math.min(2, all.size);
    if(!ok){ bad++; if(bad <= 6) console.log('MISMATCH seed', sd, 'optset', oi, 'want', all.size, 'got', bs.length, JSON.stringify(P.rules)); }
  }
}
console.log(`matchsat fuzz${rich ? ' rich' : ''}${planted ? ' planted' : ''}: puzzles ${N} ${JSON.stringify(tally)}, oracle-checked ${orChecked}, comparisons ${checked}, skipped ${skipped}, mismatches ${bad}`);
process.exit(bad ? 1 : 0);
