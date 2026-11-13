// END-TO-END FUZZ (core v94 / V1.0.1, wally-line): gemini walls between neighbouring planted pieces of the same shape (now and then a wrong
// one), part of the planted borders as plain walls, Wally on (MODE=wally, planted tiling valid for Wally) or off with opts.gemLine = true
// (MODE=any). The oracle does not know gemini walls or Wally: it gets them as plain walls and its tilings are filtered here. Checks:
// (1) verdict 0 / 1 / 2+ equal, (2) every deduction made before the search holds in EVERY tiling. opts.gemLineMin 2 (more lines tried).
//   node fuzz_wallyline94.js N seed
// env: GLIMMITH_CORE; MODE=wally | any; EARLY=1 the line stage also runs before any probe (opts.gemLineEarly); JOIN=p tiles side by side
//      in one planted piece given as joined with probability p (opts.preJoin: groups with lines from the start); TWIN=1 two copies of one
//      random shape with a line side by side (the line step fires far more often); PLANTED=1 no oracle (boards up to MAXT tiles, sides
//      3 .. 2+SPAN): no deduction may contradict the planted tiling and the verdict is never 'impossible'.
// Used for V1.0.1: oracle runs (MODE wally / any, JOIN 0.6, EARLY) 0 mismatches; PLANTED TWIN MAXT=49 SPAN=5 (about 2 000 boards, 160
// line deductions) 0 mismatches.
const L = require('./fuzzlib.js'), O = require('./oracle.js'), S = require(process.env.GLIMMITH_CORE || './reference/solver-core.v99.js');
const N = +process.argv[2] || 300, seed0 = +process.argv[3] || 1, MODE = process.env.MODE || 'wally';
const ck = S.canonicalShapeKey, PL = !!process.env.PLANTED;   // PLANTED=1: no oracle, bigger boards: no deduction may contradict the planted tiling, never 'impossible'
const ownerOf = pieces => { const m = new Map(); pieces.forEach((p, k) => p.forEach(([c, r]) => m.set(c + ',' + r, k))); return m; };
function wallyOk(owner){
  for(const [key, me] of owner){ const [c, r] = key.split(',').map(Number); let n = 0;
    for(const [dc, dr] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) if(owner.get((c + dc) + ',' + (r + dr)) !== me) n++;
    if(n < 2) return false; }
  return true;
}
// TWIN=1: two copies of one random shape with a straight line (the second turned / mirrored) side by side, the rest random pieces
const T8 = [(x, y) => [x, y], (x, y) => [-x, y], (x, y) => [x, -y], (x, y) => [-x, -y], (x, y) => [y, x], (x, y) => [-y, x], (x, y) => [y, -x], (x, y) => [-y, -x]];
function twinPlanted(w, h, R){
  const pick = n => Math.floor(R() * n);
  for(let tries = 0; tries < 50; tries++){
    // the shape: a line of 2..4, then 0..3 tiles grown at random
    const len = 2 + pick(3), cells = []; for(let i = 0; i < len; i++) cells.push([i, 0]);
    const extra = pick(4);
    for(let k = 0; k < extra; k++){ const [x, y] = cells[pick(cells.length)], [dx, dy] = [[1, 0], [-1, 0], [0, 1], [0, -1]][pick(4)]; if(!cells.some(c => c[0] === x + dx && c[1] === y + dy)) cells.push([x + dx, y + dy]); }
    const place = (t, ox, oy) => cells.map(([x, y]) => { const [a, b] = T8[t](x, y); return [a + ox, b + oy]; });
    const own = new Map(), ok = cs => cs.every(([x, y]) => x >= 0 && y >= 0 && x < w && y < h && !own.has(x + ',' + y));
    const A = place(pick(8), pick(w), pick(h)); if(!ok(A)) continue; A.forEach(([x, y]) => own.set(x + ',' + y, 0));
    let B = null;
    for(let k = 0; k < 60 && !B; k++){ const c = place(pick(8), pick(w), pick(h)); if(!ok(c)) continue;
      if(c.some(([x, y]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => own.get((x + dx) + ',' + (y + dy)) === 0))) B = c; }
    if(!B) continue; B.forEach(([x, y]) => own.set(x + ',' + y, 1));
    const pieces = [A, B];
    const free = []; for(let y = 0; y < h; y++) for(let x = 0; x < w; x++) if(!own.has(x + ',' + y)) free.push([x, y]);
    for(let i = free.length - 1; i > 0; i--){ const j = pick(i + 1); [free[i], free[j]] = [free[j], free[i]]; }
    for(const [x0, y0] of free){ if(own.has(x0 + ',' + y0)) continue; const id = pieces.length, pc = [[x0, y0]]; own.set(x0 + ',' + y0, id); const tgt = 1 + pick(4);
      while(pc.length < tgt){ const cand = []; for(const [x, y] of pc) for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = x + dx, ny = y + dy; if(nx >= 0 && ny >= 0 && nx < w && ny < h && !own.has(nx + ',' + ny)) cand.push([nx, ny]); }
        if(!cand.length) break; const [nx, ny] = cand[pick(cand.length)]; own.set(nx + ',' + ny, id); pc.push([nx, ny]); }
      pieces.push(pc); }
    const active = Array.from({ length: h }, () => Array(w).fill(1));
    return { planted: pieces, puzzle: { w, h, active, walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() }, bank: [], rules: { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false } };
  }
  return null;
}
let nAnchor = 0, bad = 0, ran = 0, uniq = 0, multi = 0, none = 0, ms = 0, lineDed = 0, lineBoards = 0;
for(let i = 0; i < N; i++){
  const seed = seed0 * 100000 + i, R = L.rng(seed ^ 0x51ed27), pick = n => Math.floor(R() * n);
  const w = 3 + pick(+process.env.SPAN || 3), h = 3 + pick(+process.env.SPAN || 3); if(w * h > (+process.env.MAXT || 16)) continue;
  const P = process.env.TWIN ? twinPlanted(w, h, R) : L.plantedPuzzle(seed, { w, h, maxPiece: 3 + pick(4), rich: false, noSpecials: true, clueP: 0, wallP: [0.3, 0.6, 0.85][pick(3)], bank: false, holes: [0, 0.08][pick(2)] });
  if(!P) continue;
  const pm = new Map(); P.planted.forEach((c, k) => c.forEach(([x, y]) => pm.set(x + ',' + y, k)));
  // walls: the planted borders, each kept with probability keep (gemini between same shapes), the rest open
  const keep = [0.35, 0.55, 0.75][pick(3)], gem = [], walls0 = new Map();
  for(let y = 0; y < h; y++) for(let x = 0; x < w; x++){
    for(const [o, x2, y2] of [['v', x + 1, y], ['h', x, y + 1]]){
      const a = pm.get(x + ',' + y), b = pm.get(x2 + ',' + y2); if(a === undefined || b === undefined) continue;
      const key = `${o}:${x},${y}`;
      if(a !== b && ck(P.planted[a]) === ck(P.planted[b]) && R() < 0.8) gem.push(key);
      else if(!PL && R() < 0.02) gem.push(key);                                   // a wrong one now and then (impossible / other tilings)
      else if(a !== b && R() < keep) walls0.set(key, 'wall');
    }
  }
  P.puzzle.walls = walls0;
  // JOIN=p: tiles side by side in one planted piece are given as joined with probability p (opts.preJoin), so groups with lines exist early
  const preJoin = [], pj = process.env.JOIN != null ? +process.env.JOIN : 0;
  if(pj > 0) for(const [k, x] of pm){ const [c, r] = k.split(',').map(Number);
    for(const [c2, r2] of [[c + 1, r], [c, r + 1]]) if(pm.get(c2 + ',' + r2) === x && R() < pj) preJoin.push([c, r, c2, r2]); }
  if(!gem.length) continue;
  if(MODE === 'wally' && !process.env.ANY && !wallyOk(ownerOf(P.planted))) continue;     // planted tiling valid for Wally (ANY=1: not checked)
  const walls = new Map(P.puzzle.walls); for(const k of gem) walls.set(k, 'gemini');
  const rules = Object.assign({}, P.rules, { wally: MODE === 'wally' });
  const Q = { puzzle: Object.assign({}, P.puzzle, { walls, palisades: new Map(), compasses: new Map(), watchtowers: new Map() }), bank: P.bank, rules };
  const plainWalls = new Map(walls); for(const k of gem) plainWalls.set(k, 'wall');
  const Qo = { puzzle: Object.assign({}, Q.puzzle, { walls: plainWalls }), bank: P.bank, rules: Object.assign({}, P.rules) };
  const all = PL ? [P.planted] : O.oracle(Qo, 300000); if(all === null || all.length >= 300000) continue;
  const gemPairs = gem.map(k => { const [o, rest] = k.split(':'), [c, r] = rest.split(',').map(Number); return [c + ',' + r, o === 'v' ? (c + 1) + ',' + r : c + ',' + (r + 1)]; });
  const truth = all.filter(p => { const own = ownerOf(p); if(rules.wally && !wallyOk(own)) return false;
    for(const [a, b] of gemPairs){ const pa = own.get(a), pb = own.get(b); if(pa === pb || ck(p[pa]) !== ck(p[pb])) return false; }
    for(const [c, r, c2, r2] of preJoin) if(own.get(c + ',' + r) !== own.get(c2 + ',' + r2)) return false;
    return true; });
  ran++;
  const t0 = Date.now();
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, []);
  let n = 0, imp = false, dedBad = 0, sol1 = null, nl = 0; const ded = [];
  const opts = { stopAtTwo: true, testNodes: 20, deadline: PL ? Date.now() + 3000 : undefined, gemLine: MODE === 'wally' ? undefined : true, gemLineMin: 2, gemLineEarly: !!process.env.EARLY, preJoin };
  for(const ev of S.deduceSolve(w, h, ctx, L.collectSpecialEdges(Q.puzzle.walls), opts)){
    if(ev.type === 'deduce'){ ded.push(ev); if(/-line$|gemini-anchor/.test(ev.rule)) nl++; if(ev.rule === 'gemini-anchor') nAnchor++; }
    if(ev.type === 'solution') n++;
    if(ev.type === 'impossible-early'){ imp = true; break; }
  }
  ms += Date.now() - t0; lineDed += nl; if(nl) lineBoards++;
  const want = PL ? (imp ? 1 : Math.min(n, 2) || 1) : Math.min(truth.length, 2), got = imp ? 0 : PL ? (Math.min(n, 2) || 1) : Math.min(n, 2);   // PLANTED: only 'impossible' is wrong (search may stop early)
  if(want === 0) none++; else if(want === 1) uniq++; else multi++;
  // every deduction made before the search must hold in EVERY tiling (not only with a unique answer)
  const owners = truth.slice(0, 5000).map(ownerOf);
  for(const ev of ded){ if(ev.source === 'search') continue; const s = ev.spot;
    for(const own of owners){ const same = own.get(s.c1 + ',' + s.r1) === own.get(s.c2 + ',' + s.r2); if((ev.value === 'same') !== same){ dedBad++; if(/-line$/.test(ev.rule)) console.log('  bad line deduction', s.key, ev.value); break; } } }
  if(want !== got || dedBad){ bad++; console.log('MISMATCH seed', seed, 'oracle', truth.length, 'solver', got, 'bad deductions', dedBad, JSON.stringify([w, h, Q.puzzle.active, [...walls], rules])); }
}
console.log(`fuzz_wallyline94 [${MODE}]: ${ran} puzzles (${uniq} unique, ${multi} several, ${none} none), ${bad} mismatches, line + anchor deductions ${lineDed} on ${lineBoards} boards (gemini-anchor ${nAnchor}), solver ${ms} ms`);
process.exit(bad ? 1 : 0);
