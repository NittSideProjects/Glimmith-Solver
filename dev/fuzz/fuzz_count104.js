// v104 piece count: the fewest / most pieces (ctx.pieceLo / pieceHi), per size (ctx.pieceMult.mlo / mhi) and the narrowed sizes
// against the brute-force oracle. Small planted boards with area numbers, polyominoes, roses, holes and drawn walls, and on top
// random count rules: Heterogeneous, Match, Mismatch, Solitude, Precision, the user's limit on pieces; some clues are changed so
// that a share of the boards is impossible. Checked: (1) every true tiling has a count, per-size counts and sizes inside the bounds,
// and countInfeasible only when there is none; (2) deduceSolve and solvePuzzle give the oracle's verdict, and every edge the
// deduction decides agrees with every true tiling.
// node fuzz/fuzz_count104.js [N=300] [seed=1]
const L = require('../fuzzlib.js'), O = require('../oracle.js'), S = require(process.env.GLIMMITH_CORE || '../reference/solver-core.v107.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1;
const heteroOk = pieces => new Set(pieces.map(p => p.length)).size === pieces.length;
let ran = 0, bad = 0, boundsChecked = 0, deds = 0, dedBad = 0, tight = 0, infeas = 0, fired = {};
const tally = [0, 0, 0];
for(let i = 0; i < N; i++){
  const seed = seed0 * 100003 + i, R = L.rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(4), h = 2 + pick(3);
  if(w * h > 13) continue;
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 1 + pick(6), rich: R() < 0.6, noSpecials: true, clueP: [0, 0.3, 0.6, 1][pick(4)], wallP: [0, 0.2, 0.5, 0.8][pick(4)], bankP: 0.2, holes: [0, 0.1][pick(2)] });
  if(!P0.planted.length) continue;
  const rules = Object.assign({}, P0.rules);
  const x = R();
  if(x < 0.2) rules.heterogeneous = true;
  else if(x < 0.35){ rules.match = true; rules.mismatch = false; }
  else if(x < 0.5) rules.mismatch = true;
  else if(x < 0.6) rules.solitude = true;
  else if(x < 0.7){ const s = P0.planted[0].length; if(P0.planted.every(p => p.length === s)) rules.precision = s; }
  const puzzle = Object.assign({}, P0.puzzle, { areaNumbers: new Map(P0.puzzle.areaNumbers), roses: new Map(P0.puzzle.roses) });
  if(R() < 0.3 && puzzle.areaNumbers.size){                                    // a wrong number now and then
    const k = [...puzzle.areaNumbers.keys()][pick(puzzle.areaNumbers.size)]; puzzle.areaNumbers.set(k, 1 + pick(6));
  }
  if(R() < 0.3){                                                              // an extra number of a planted size on a free tile
    const p = P0.planted[pick(P0.planted.length)], [c, r] = p[pick(p.length)], k = c + ',' + r;
    if(!puzzle.roses.has(k) && !(puzzle.polyominoes && puzzle.polyominoes.has(k))) puzzle.areaNumbers.set(k, p.length);
  }
  let hints = null;
  if(R() < 0.2) hints = { maxRegions: Math.max(1, P0.planted.length - pick(2)) };
  const P = { puzzle, bank: P0.bank, rules: Object.assign({}, rules, { heterogeneous: false }), hints: null };
  const all = O.oracle(P, 100000); if(all === null || all.length >= 100000) continue;
  const truth = all.filter(p => (!rules.heterogeneous || heteroOk(p)) && (!hints || p.length <= hints.maxRegions));
  ran++; tally[Math.min(truth.length, 2)]++;
  const ctx = S.buildSolverContext(puzzle, P.bank, rules, hints, []);
  const T = ctx.totalActive;
  // (1) the bounds
  if(ctx.countInfeasible){ infeas++; if(truth.length){ bad++; console.log('COUNT SAYS IMPOSSIBLE seed', seed, 'oracle', truth.length); } }
  else if(ctx.pieceLo != null){
    if(ctx.pieceHi < Math.floor(T / Math.max(1, ctx.sizeLo)) || ctx.pieceLo > Math.ceil(T / Math.max(1, ctx.sizeHi))) tight++;
    for(const sol of truth){
      boundsChecked++;
      const per = new Map(); for(const p of sol) per.set(p.length, (per.get(p.length) || 0) + 1);
      let why = '';
      if(sol.length < ctx.pieceLo || sol.length > ctx.pieceHi) why = `count ${sol.length} not in ${ctx.pieceLo}..${ctx.pieceHi}`;
      for(const [k, n] of per){
        if(k < ctx.sizeLo || k > ctx.sizeHi) why = `size ${k} not in ${ctx.sizeLo}..${ctx.sizeHi}`;
        const lo = ctx.pieceMult.mlo[k] || 0, hi = ctx.pieceMult.mhi[k] || 0;
        if(n < lo || n > hi) why = `${n} pieces of ${k} not in ${lo}..${hi}`;
      }
      for(let k = 1; k < ctx.pieceMult.mlo.length; k++) if(ctx.pieceMult.mlo[k] > (per.get(k) || 0)) why = `${per.get(k) || 0} pieces of ${k}, needs ${ctx.pieceMult.mlo[k]}`;
      if(why){ bad++; console.log('BOUND WRONG seed', seed, why, JSON.stringify(rules), JSON.stringify(hints)); break; }
    }
  }
  // (2) verdicts and every deduction
  const sigs = truth.map(O.sigCells), want = Math.min(truth.length, 2);
  const se = L.collectSpecialEdges(puzzle.walls), events = [];
  let n = 0, exceeded = false;
  for(const ev of S.deduceSolve(w, h, ctx, se, { nodeBudget: 300000, stopAtTwo: true, testNodes: 20 })){
    if(ev.type === 'deduce') events.push(ev);
    if(ev.type === 'solution') n++;
    if(ev.type === 'budget-exceeded'){ exceeded = true; break; }
    if(ev.type === 'impossible-early') break;
  }
  let n2 = 0, ex2 = false; for(const ev of S.solvePuzzle(w, h, ctx, se, 300000)){ if(ev.type === 'budget-exceeded'){ ex2 = true; break; } if(ev.type === 'solution' && ++n2 >= 2) break; }
  if((!exceeded && Math.min(n, 2) !== want) || (!ex2 && Math.min(n2, 2) !== want)){ bad++; console.log('VERDICT MISMATCH seed', seed, 'oracle', truth.length, 'deduce', n, 'exact', n2, JSON.stringify(rules)); }
  for(const ev of events){
    deds++; if(/^piece-/.test(ev.rule)) fired[ev.rule] = (fired[ev.rule] || 0) + 1;
    const sp = ev.spot, same = sg => sg.split('|').some(p => { const cs = p.split(';'); return cs.includes(`${sp.c1},${sp.r1}`) && cs.includes(`${sp.c2},${sp.r2}`); });
    for(const sg of sigs) if(same(sg) !== (ev.value === 'same')){ dedBad++; console.log('UNSOUND', ev.value, sp.key, ev.rule, 'seed', seed); break; }
  }
}
console.log(`fuzz_count104: ${ran} puzzles (oracle none/unique/several ${tally.join('/')}), tilings checked against the bounds ${boundsChecked}, boards with a count tighter than size alone ${tight}, said impossible by the count ${infeas}, deductions checked ${deds} ${JSON.stringify(fired)}, wrong ${bad}, unsound ${dedBad}`);
process.exit(bad || dedBad ? 1 : 0);
