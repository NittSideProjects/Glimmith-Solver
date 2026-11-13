const L = require('../fuzzlib.js');
const N = parseInt(process.argv[2] || '1500', 10);
const rich = process.argv[3] === 'rich';
const seed0 = parseInt(process.argv[4] || '1', 10);
const planted = process.argv[5] === 'planted';
const BUD = 60000;
const optSets = [          // v40: every option set uses the EDGE search as the final stage (deduceSolve default) or stresses it
  { },                                                       // the page's default pipeline: instant + probes + edge search (act branching, box skip)
  { finalOnly: true },                                       // edge search straight after the root propagation (no probes)
  { finalOnly: true, edgePick: 'mindeg', edgeFirst: 'wall' },
  { finalOnly: true, edgePick: 'focus', edgeLite: false },
  { finalOnly: true, edgePick: 'clue', edgeFull: true },
  { areaSumSlack: 99 },                                      // every slack the area-sum rule can use
  { areaSumSlack: 0, finalOnly: true },
  { exact: 'old', testNodes: 30, restart: 'continue', order: 'scan', useWitness: true },   // the old final search stays correct
  { finalOnly: true, sliceEdgeMs: 1, sliceOldMs: 1 },         // portfolio: both first slices are cut off mid-search; the third must start from the restored state
  { finalOnly: true, sliceEdgeMs: 0, sliceOldMs: 3, stopAtTwo: false },
  { slices: 'e0.001,s0.2,o0.001,e0.001,o0.001,e' },            // every slice cut off, scan in the middle (not finalOnly: the full slice plan)
  { slices: 's0.3,o0.001,e' },                               // scan first, old slice cut off
  { slices: 'e,s1' },                                        // edge search alone finishes before the scan
  { finalOnly: true, portfolio: false },
  { finalOnly: true, stopAtTwo: false, edgePick: 'act' },    // ALL solutions: sets must be equal
  // v41: RESUMABLE edge search. edgePauseNodes = pause every k nodes (test hook), so the DFS is suspended and resumed many times,
  // with the scan / old search running on the root state in between
  { slices: 'e1,s0.05,o0.001,e1,o0.001,e', edgePauseNodes: 1 },
  { slices: 'e1,s0.05,o0.001,e1,o0.001,e', edgePauseNodes: 2, stopAtTwo: false },
  { slices: 'e1,e1,e1,e1,e', edgePauseNodes: 3, stopAtTwo: false },
  { slices: 'e1,o0.002,e1,o0.002,e1,e', edgePauseNodes: 2, edgePick: 'mindeg', edgeFirst: 'wall' },
  { slices: 'e1,s0.1,e', edgePauseNodes: 1, edgeLite: false },
];
let checked = 0, skipped = 0, bad = 0;
const verdict = s => s.length === 0 ? 'none' : s.length === 1 ? 'unique' : 'multi';
const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const P = planted ? L.plantedPuzzle(seed0 * 100000 + i, { rich }) : L.randomPuzzle(seed0 * 100000 + i, { rich, maxW: rich ? 4 : 5, maxH: rich ? 3 : 4 });
  P.rules.match = true; P.rules.mismatch = false; P.rules.mingleShape = false; P.rules.mingleArea = false; if(i % 2) P.rules.precision = null;   // force Match (v43 size split)
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
