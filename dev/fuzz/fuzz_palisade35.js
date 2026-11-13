// END-TO-END (v35): the full solve (propagation + search, 5 option sets) of small boards with palisades must find exactly the tilings of the brute-force oracle.
// Boards up to 12 tiles, planted palisades + mutants + hand walls + holes + Precision / Minimum / Maximum / Boxy / 2 roses. usage: node fuzz_palisade35.js N seed
const L = require('../fuzzlib.js'), O = require('../oracle.js');
const N = +process.argv[2] || 200, seed0 = +process.argv[3] || 1;
const rng = s => () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const optSets = [
  { testNodes: 15, restart: 'first', order: 'scan', useWitness: true },
  { testNodes: 60, restart: 'continue', order: 'clues', useWitness: true, focusMode: 'near' },
  { testNodes: 400, restart: 'first', order: 'clues', useWitness: false, focusMode: 'first' },
  { testNodes: 8, restart: 'continue', order: 'scan', useWitness: false, focusMode: 'none' },
  { testNodes: 30, restart: 'continue', order: 'scan', useWitness: true, nearShare: 0 },
];
function palType(owner, c, r){
  const me = owner.get(c + ',' + r), sd = [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => owner.get((c + dc) + ',' + (r + dr)) === me ? 0 : 1);
  const n = sd[0] + sd[1] + sd[2] + sd[3];
  return n === 2 ? ((sd[0] + sd[2] === 2 || sd[1] + sd[3] === 2) ? '2s' : '2c') : String(n);
}
let bad = 0, checked = 0, unsupported = 0, skipped = 0; const tally = { none: 0, unique: 0, multi: 0 };
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = rng(seed), pick = n => Math.floor(R() * n);
  const w = 2 + pick(3), h = 2 + pick(2);
  const P0 = L.plantedPuzzle(seed, { w, h, maxPiece: 2 + pick(5), rich: false, clueP: 0, wallP: R() < 0.5 ? 0.2 : 0, bank: false, holes: R() < 0.3 ? 0.1 : 0 });
  if(w * h > 12){ skipped++; continue; }
  const P = { puzzle: Object.assign({}, P0.puzzle, { palisades: new Map(), compasses: new Map(), watchtowers: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() }), bank: [], rules: Object.assign({}, P0.rules, { mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false, precision: null, min: null, max: null }) };
  const planted = P0.planted, sz = planted.map(p => p.length);
  const v = pick(6); if(v === 0) P.rules.min = Math.min(...sz); else if(v === 1) P.rules.max = Math.max(...sz); else if(v === 2 && sz.every(x => x === sz[0])) P.rules.precision = sz[0];
  const owner = new Map(); planted.forEach((p, k) => p.forEach(([c, r]) => owner.set(c + ',' + r, k)));
  const pP = [0.3, 0.6, 0.9][pick(3)];
  for(const key of owner.keys()){ if(R() >= pP) continue; const [c, r] = key.split(',').map(Number); P.puzzle.palisades.set(key, palType(owner, c, r)); }
  if(P.puzzle.palisades.size === 0){ skipped++; continue; }
  if(R() < 0.35){ const ks = [...P.puzzle.palisades.keys()], k = ks[pick(ks.length)]; P.puzzle.palisades.set(k, ['0', '1', '2s', '2c', '3', '4'][pick(6)]); }
  const truth = O.oracle(P, 3);
  if(truth === null){ unsupported++; continue; }
  tally[truth.length === 0 ? 'none' : truth.length === 1 ? 'unique' : 'multi']++;
  const checks = [['A', L.exact(P, 2, 200000)]];
  for(const [oi, op] of optSets.entries()) checks.push(['B' + oi, L.deduce(P, op, 2, 200000)]);
  for(const [name, r] of checks){
    if(r.exceeded) continue; checked++;
    const want = Math.min(truth.length, 2); let ok = r.sols.length === want;
    if(ok && truth.length === 1) ok = L.sig(r.sols[0]) === O.sigCells(truth[0]);
    if(ok && want === 2){ const all = new Set(O.oracle(P, 100000).map(O.sigCells)); ok = r.sols.every(s => all.has(L.sig(s))) && L.sig(r.sols[0]) !== L.sig(r.sols[1]); }
    if(!ok){ bad++; console.log('MISMATCH', name, 'seed', seed, w + 'x' + h, 'truth', truth.length, 'got', r.sols.length, JSON.stringify([...P.puzzle.palisades]), JSON.stringify(P.rules)); }
  }
}
console.log('palisade end-to-end fuzz: puzzles', N, JSON.stringify(tally), 'skipped', skipped, 'unsupported', unsupported, 'checks', checked, 'mismatches', bad);
process.exit(bad ? 1 : 0);
