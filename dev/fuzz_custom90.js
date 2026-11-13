// END-TO-END FUZZ (v90 Links / Heterogeneous): the whole solver against the brute-force oracle on small planted boards.
// The oracle knows neither rule: it gets the puzzle without links, and its tilings are filtered here with independent checks
// (linked tiles in one piece; all piece sizes different). Wally, Boxy, Size Separation, palisades, area numbers, holes mixed in.
// node fuzz_custom90.js N seed        (MODE=links | hetero | both, default both; VALID=1: planted tiling satisfies Heterogeneous)
const L = require('./fuzzlib.js'), O = require('./oracle.js'), S = require(process.env.GLIMMITH_CORE || './reference/solver-core.v98.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, MODE = process.env.MODE || 'both', VALID = !!process.env.VALID;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ownerOf = pieces => { const m = new Map(); pieces.forEach((p, k) => p.forEach(([c, r]) => m.set(c + ',' + r, k))); return m; };
function wallyOk(owner){
  for(const [key, me] of owner){ const [c, r] = key.split(',').map(Number); let n = 0;
    for(const [dc, dr] of [[0, -1], [1, 0], [0, 1], [-1, 0]]){ const o = owner.get((c + dc) + ',' + (r + dr)); if(o !== me) n++;   /* v91: the outline and empty tiles count (no T tetromino) */ }
    if(n < 2) return false; }
  return true;
}
const heteroOk = pieces => new Set(pieces.map(p => p.length)).size === pieces.length;
let bad = 0, ran = 0, uniq = 0, multi = 0, none = 0, ms = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(4), h = 2 + pick(3);
  if(w * h > 12) continue;
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 1 + pick(7), rich: R() < 0.5, noSpecials: true, clueP: [0, 0.1, 0.3][pick(3)], wallP: [0, 0.2][pick(2)], bank: false, holes: [0, 0.1][pick(2)] });
  const owner = ownerOf(P0.planted);
  if(owner.size === 0) continue;
  const doHet = MODE !== 'links', doLinks = MODE !== 'hetero';
  if(VALID && doHet && !heteroOk(P0.planted)) continue;
  const rules = Object.assign({}, P0.rules, { heterogeneous: doHet });
  const x = R(); if(x < 0.1) rules.wally = true; else if(x < 0.2) rules.boxy = true; else if(x < 0.3) rules.mingleArea = true;
  const walls = new Map(P0.puzzle.walls), links = [];
  if(doLinks){                                              // links between planted neighbours (true ones) and a few random ones
    for(const key of owner.keys()){
      const [c, r] = key.split(',').map(Number);
      for(const [o, k2] of [['v', (c + 1) + ',' + r], ['h', c + ',' + (r + 1)]]){
        if(!owner.has(k2)) continue;
        const wk = `${o}:${c},${r}`; if(walls.has(wk)) continue;
        const same = owner.get(key) === owner.get(k2);
        if((same && R() < 0.25) || R() < 0.04){ walls.set(wk, 'link'); links.push(key + '|' + k2); }
      }
    }
  }
  const Q = { puzzle: Object.assign({}, P0.puzzle, { walls, palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P0.bank, rules };
  const Qo = { puzzle: Object.assign({}, Q.puzzle, { walls: new Map([...walls].filter(([k, t]) => t !== 'link')) }), bank: Q.bank, rules: Object.assign({}, rules, { heterogeneous: false, wally: false }) };
  const all = O.oracle(Qo, 200000); if(all === null || all.length >= 200000) continue;
  const truth = all.filter(p => { const ow = ownerOf(p);
    if(rules.heterogeneous && !heteroOk(p)) return false;
    if(rules.wally && !wallyOk(ow)) return false;
    for(const l of links){ const [a, b] = l.split('|'); if(ow.get(a) !== ow.get(b)) return false; }
    return true; });
  ran++;
  const t0 = Date.now();
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []); let n = 0, imp = false;
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), { stopAtTwo: true, testNodes: 20 })){ if(ev.type === 'solution') n++; if(ev.type === 'impossible-early'){ imp = true; break; } }
  // the plain exact search too (no deduction)
  let n2 = 0; for(const ev of S.solvePuzzle(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), 0)){ if(ev.type === 'solution' && ++n2 >= 2) break; }
  ms += Date.now() - t0;
  const want = Math.min(truth.length, 2), got = imp ? 0 : Math.min(n, 2);
  if(want === 0) none++; else if(want === 1) uniq++; else multi++;
  if(want !== got || want !== Math.min(n2, 2)){ bad++; console.log('MISMATCH seed', seed, 'oracle', truth.length, 'deduce', got, 'exact', n2, JSON.stringify([w, h, Q.puzzle.active, [...walls], rules, [...Q.puzzle.areaNumbers]])); }
}
console.log(`fuzz_custom90 (${MODE}${VALID ? ', valid' : ''}): ${ran} puzzles (${uniq} unique, ${multi} several, ${none} none), ${bad} mismatches, solver ${ms} ms`);
process.exit(bad ? 1 : 0);
