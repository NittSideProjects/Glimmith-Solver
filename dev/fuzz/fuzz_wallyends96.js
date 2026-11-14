// FUZZ (core v96 / V1.0.3, wally-ends): planted tilings valid for Wally; every piece gets roses (1 or 2 types), put on the ends of its
// path most of the time (so the end budget fills up); some ends get a palisade 3, some hand walls. Checks every deduction made before
// the search against EVERY tiling the oracle finds (oracle tilings filtered with Wally and the palisades here), and the verdict.
//   node fuzz_wallyends96.js N seed        PLANTED=1: no oracle, bigger boards (MAXT tiles): no deduction may contradict the planted tiling
const L = require('../fuzzlib.js'), O = require('../oracle.js'), S = require(process.env.GLIMMITH_CORE || '../reference/solver-core.v102.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, PL = !!process.env.PLANTED, MAXT = +process.env.MAXT || (PL ? 42 : 12);
const ownerOf = pieces => { const m = new Map(); pieces.forEach((p, k) => p.forEach(([c, r]) => m.set(c + ',' + r, k))); return m; };
const nb4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const degIn = (own, c, r) => { const me = own.get(c + ',' + r); let d = 0; for(const [dx, dy] of nb4) if(own.get((c + dx) + ',' + (r + dy)) === me) d++; return d; };
const wallyOk = own => { for(const k of own.keys()){ const [c, r] = k.split(',').map(Number); if(degIn(own, c, r) > 2) return false; } return true; };
const palOk = (own, pals) => { for(const [k, t] of pals){ const [c, r] = k.split(',').map(Number); if(4 - degIn(own, c, r) !== +t) return false; } return true; };
let bad = 0, ran = 0, fired = 0, firedBoards = 0, verd = { 0: 0, 1: 0, 2: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = L.rng(seed ^ 0x2545F491), pick = n => Math.floor(R() * n);
  const w = 3 + pick(PL ? 5 : 3), h = 3 + pick(PL ? 5 : 3); if(w * h > MAXT) continue;
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + pick(5), rich: false, noSpecials: true, clueP: 0, wallP: [0, 0.15, 0.3][pick(3)], bank: false, holes: [0, 0.1][pick(2)] });
  const own = ownerOf(P0.planted); if(own.size === 0 || !wallyOk(own)) continue;
  const T = 1 + pick(2), roses = new Map(), pals = new Map();
  let okRoses = true;
  for(const piece of P0.planted){
    const ends = piece.filter(([c, r]) => degIn(own, c, r) <= 1), pool = (R() < 0.8 && ends.length >= Math.min(T, piece.length)) ? ends : piece;
    if(piece.length < T){ okRoses = false; break; }
    const pickFrom = pool.slice(); for(let t = 1; t <= T; t++){ const j = pick(pickFrom.length); const [c, r] = pickFrom.splice(j, 1)[0] || piece[t - 1]; roses.set(c + ',' + r, t); if(!pickFrom.length) pickFrom.push(...piece.filter(([x, y]) => !roses.has(x + ',' + y))); }
    for(const [c, r] of ends) if(R() < 0.3) pals.set(c + ',' + r, String(4 - degIn(own, c, r)));
  }
  if(!okRoses || [...new Set(roses.values())].length !== T) continue;
  const rules = Object.assign({}, P0.rules, { wally: true });
  const Q = { puzzle: Object.assign({}, P0.puzzle, { roses, palisades: pals, compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules };
  let truth;
  if(PL) truth = [P0.planted];
  else { const Qo = { puzzle: Object.assign({}, Q.puzzle, { palisades: new Map() }), bank: Q.bank, rules: P0.rules }; const all = O.oracle(Qo, 200000); if(all === null || all.length >= 200000) continue; truth = all.filter(p => { const o = ownerOf(p); return wallyOk(o) && palOk(o, pals); }); }
  ran++;
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []);
  let n = 0, imp = false, nf = 0; const ded = [];
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true, testNodes: 20, deadline: Date.now() + 4000 })){
    if(ev.type === 'deduce'){ ded.push(ev); if(ev.rule === 'wally-ends') nf++; }
    if(ev.type === 'solution') n++;
    if(ev.type === 'impossible-early'){ imp = true; break; }
  }
  fired += nf; if(nf) firedBoards++;
  const owners = truth.slice(0, 3000).map(ownerOf); let dedBad = 0;
  for(const ev of ded){ if(ev.source === 'search') continue; const s = ev.spot;
    for(const o of owners){ if((ev.value === 'same') !== (o.get(s.c1 + ',' + s.r1) === o.get(s.c2 + ',' + s.r2))){ dedBad++; break; } } }
  const want = PL ? 1 : Math.min(truth.length, 2), got = imp ? 0 : (PL ? 1 : Math.min(n, 2));
  verd[want]++;
  if(want !== got || dedBad){ bad++; console.log('MISMATCH seed', seed, 'truth', truth.length, 'solver', imp ? 'impossible' : n, 'bad deductions', dedBad); }
}
console.log(`fuzz_wallyends96${PL ? ' [planted]' : ''}: ${ran} puzzles (${verd[1]} unique, ${verd[2]} several, ${verd[0]} none), ${bad} mismatches, wally-ends deductions ${fired} on ${firedBoards} boards`);
process.exit(bad ? 1 : 0);
