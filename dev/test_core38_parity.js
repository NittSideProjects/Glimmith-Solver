// v38 PARITY: a puzzle without a compass must run exactly the v37 code. Planted boards with every other mechanic (area numbers, roses, polyominoes, palisades, watchtowers,
// hand walls, holes, size and relation rules), propagation only: the set of decided edges (value and rule) must be identical in v37 and v38.
// usage: node test_core38_parity.js [N] [seed]
const L = require('./fuzzlib.js');
const S38 = require('./reference/solver-core.v99.js'), S37 = require('./reference/solver-core.v99.js');
const N = +process.argv[2] || 80, seed0 = +process.argv[3] || 1;
function decide(Core, P){
  const ctx = Core.buildSolverContext(P.puzzle, P.bank, P.rules, null, []), out = new Map(); let imp = null;
  for(const ev of Core.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { testNodes: 1, restart: 'first', order: 'scan' })){
    if(ev.type === 'deduce') out.set(ev.spot.key, ev.value + ':' + ev.rule + ':' + ev.source);
    else if(ev.type === 'impossible-early'){ imp = ev.why || ev.reason; break; }
    else if(ev.type === 'testing' || ev.type === 'stage' || ev.type === 'solution' || ev.type === 'budget-exceeded') break;
  }
  return { out, imp };
}
let n = 0, bad = 0, edges = 0;
for(let i = 0; i < N; i++){
  const P = L.plantedPuzzle(seed0 * 1000 + i, { w: 4 + (i % 4), h: 4 + (i % 3), maxPiece: 3 + (i % 6), rich: i % 2 === 0, noSpecials: false, clueP: 0.35, wallP: 0.2, bank: i % 3 === 0, holes: i % 5 === 0 ? 0.08 : 0 });
  if(P.puzzle.compasses && P.puzzle.compasses.size) P.puzzle.compasses = new Map();
  const a = decide(S38, P), b = decide(S37, P);
  n++; edges += b.out.size;
  const same = a.imp === b.imp && a.out.size === b.out.size && [...b.out].every(([k, v]) => a.out.get(k) === v);
  if(!same){ bad++; console.log('DIFFERENT on board', i, 'v37', b.out.size, b.imp, 'v38', a.out.size, a.imp); }
}
console.log('core38 parity (no compass): boards', n, '| edges compared', edges, '| different', bad);
process.exit(bad ? 1 : 0);
