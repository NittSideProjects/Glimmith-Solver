// END-TO-END FUZZ (v92 clue grouping: clue-pair probes, clue-pair branching in the edge search, split-cut): the whole solver against the
// brute-force oracle on small planted boards rich in clues (roses, area numbers, polyominoes), with far joins (opts.preJoin of two clues of
// one planted piece) on some. node fuzz_clue92.js N seed
const L = require('../fuzzlib.js'), O = require('../oracle.js'), S = require(process.env.GLIMMITH_CORE || '../reference/solver-core.v103.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const OPTS = [{}, { clueBranchFull: true }, { portfolio: false }, { portfolio: false, clueBranchFull: true }, { cluePairInner: true }];
let bad = 0, ran = 0, k = [0, 0, 0];
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(4), h = 2 + pick(3); if(w * h > 12) continue;
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + pick(6), rich: true, noSpecials: true, clueP: [0.3, 0.5, 0.8][pick(3)], wallP: [0, 0.15][pick(2)], bank: false, holes: [0, 0.1][pick(2)] });
  if(!P0.planted.length) continue;
  const Q = { puzzle: Object.assign({}, P0.puzzle, { palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules: P0.rules };
  const truth = O.oracle(Q, 100000); if(truth === null || truth.length >= 100000) continue;
  ran++; const want = Math.min(truth.length, 2); k[want]++;
  for(const o of OPTS){
    const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []); let n = 0, imp = false;
    for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), Object.assign({ stopAtTwo: true, testNodes: 20 }, o))){ if(ev.type === 'solution') n++; if(ev.type === 'impossible-early'){ imp = true; break; } }
    const got = imp ? 0 : Math.min(n, 2);
    if(want !== got){ bad++; if(bad < 6) console.log('MISMATCH seed', seed, JSON.stringify(o), 'oracle', truth.length, 'solver', got); }
  }
}
console.log(`fuzz_clue92: ${ran} puzzles (none/unique/several ${k.join('/')}), ${OPTS.length} option sets each, ${bad} mismatches`);
process.exit(bad ? 1 : 0);
