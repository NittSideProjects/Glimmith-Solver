const L = require('./fuzzlib.js');
const N = parseInt(process.argv[2] || '1500', 10);
const rich = process.argv[3] === 'rich';
const seed0 = parseInt(process.argv[4] || '1', 10);
const planted = process.argv[5] === 'planted';
const BUD = 20000;
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 400, restart: 'first', order: 'clues', useWitness: false, focusMode: 'first' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
  { testNodes: 150, restart: 'first', order: 'scan', useWitness: true, stopAtTwo: false, nearShare: 0.7 },
  { testNodes: 30, restart: 'continue', order: 'scan', useWitness: true, nearShare: 0 },
];
let checked = 0, skipped = 0, bad = 0;
const verdict = s => s.length === 0 ? 'none' : s.length === 1 ? 'unique' : 'multi';
const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const P = planted ? L.plantedPuzzle(seed0 * 100000 + i, { rich }) : L.randomPuzzle(seed0 * 100000 + i, { rich, maxW: rich ? 3 : 4, maxH: rich ? 3 : 4 });
  const a = L.exact(P, 2, BUD);
  if(a.exceeded){ skipped++; continue; }
  tally[verdict(a.sols)]++;
  const full = L.exact(P, 151, BUD);
  const fullOk = !full.exceeded && full.sols.length <= 150;
  for(const [oi, o] of optSets.entries()){
    const b = L.deduce(P, o, o.stopAtTwo === false ? 151 : 2, BUD);
    if(b.exceeded){ skipped++; continue; }
    checked++;
    let ok;
    if(o.stopAtTwo === false){
      // all solutions: sets must be equal (only when the puzzle has few enough to enumerate)
      if(!fullOk){ continue; }
      const sa = new Set(full.sols.map(L.sig)), sb = new Set(b.sols.map(L.sig));
      ok = sa.size === sb.size && [...sa].every(x => sb.has(x));
    } else {
      ok = verdict(a.sols) === verdict(b.sols);
      if(ok && a.sols.length === 1) ok = L.sig(a.sols[0]) === L.sig(b.sols[0]);
      if(ok && b.sols.length === 2) ok = L.sig(b.sols[0]) !== L.sig(b.sols[1]) && (!fullOk || (full.sols.some(s => L.sig(s) === L.sig(b.sols[0])) && full.sols.some(s => L.sig(s) === L.sig(b.sols[1]))));
    }
    if(!ok){
      bad++;
      if(bad <= 5) console.log('MISMATCH seed', seed0 * 100000 + i, 'optset', oi, 'A', a.sols.length, 'full', full.sols.length, 'B', b.sols.length, JSON.stringify(P.rules));
    }
  }
}
console.log(`puzzles ${N} (${JSON.stringify(tally)}), comparisons ${checked}, skipped ${skipped}, mismatches ${bad}`);
process.exit(bad ? 1 : 0);
