// One puzzle, one configuration -> one JSON line.   node tools/exact_one.js <id> <mode> [limitS] [k=v ...]
//   modes: raw-old   solvePuzzle on the puzzle as drawn (no deduction at all)
//          raw-edge  deduceSolve with finalOnly + exact:'edge' (root propagation, then the edge search; no probes, no scan)
//          pipe-old  deduceSolve as the page runs it (probes, scan, old final search)
//          pipe-edge deduceSolve (probes, scan, EDGE final search)
//   k=v options: core=reference/solver-core.v101.js  euler=0 colour=0 matchsplit=0 matchiso=0 (switch a v42-v46 rule off)  pick=mindeg|clue  first=same|wall  full=1  testMs=100  area=0 ...
// Checks every tiling it finds against the game's stored solution. Hard time limit = limitS (cooperative: the search deadline; the caller may also kill).
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const kv = {}; for(const a of process.argv.slice(5)){ const i = a.indexOf('='); if(i > 0) kv[a.slice(0, i)] = a.slice(i + 1); }
const CORE = kv.core ? path.join(root, kv.core) : require(path.join(root, 'corepath.js')).corePath();
const S = require(CORE);
const L = require(path.join(root, 'fuzzlib.js'));
const id = process.argv[2], mode = process.argv[3], limitS = +(process.argv[4] || 60);
const ix = JSON.parse(fs.readFileSync(path.join(root, 'game_puzzles_converted/index.json'), 'utf8')).puzzles;
const rec = ix.find(p => p.id === id); if(!rec){ console.log(JSON.stringify({ id, mode, error: 'unknown id' })); process.exit(1); }
const j = JSON.parse(fs.readFileSync(path.join(root, 'game_puzzles_converted', rec.file), 'utf8')).puzzles[0], st = j.state, p = st.puzzle, M = a => new Map(a || []);
const P = { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] };
const w = p.w, h = p.h, sw = new Set(j.solutionWalls || []);
function partition(pieces){ const o = new Int32Array(w * h).fill(-1); pieces.forEach((pc, i) => pc.cells.forEach(([c, r]) => { o[r * w + c] = i; })); return o; }
function sig(pieces){ const o = partition(pieces), out = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){ if(!p.active[r][c]) continue;
  if(c + 1 < w && p.active[r][c + 1] && o[r * w + c] !== o[r * w + c + 1]) out.push(`v:${c},${r}`);
  if(r + 1 < h && p.active[r + 1][c] && o[r * w + c] !== o[(r + 1) * w + c]) out.push(`h:${c},${r}`); } return out.sort().join(' '); }
const storedSig = (() => { const arr = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){ if(!p.active[r][c]) continue;
  if(c + 1 < w && p.active[r][c + 1] && sw.has(`v:${c},${r}`)) arr.push(`v:${c},${r}`);
  if(r + 1 < h && p.active[r + 1][c] && sw.has(`h:${c},${r}`)) arr.push(`h:${c},${r}`); } return arr.sort().join(' '); })();
const now = () => performance.now();
const t0 = now(), deadline = t0 + limitS * 1000;
const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
const R = { id, mode, core: path.basename(CORE), opts: kv, solutions: 0, verdict: null, nodes: null, leaves: null, ms: null, stage: {} };
const sigs = []; let timeout = false, impossible = null, lastNodes = null;
function feed(ev){
  if(ev.type === 'solution'){ R.solutions++; if(R.firstMs == null) R.firstMs = Math.round(now() - t0); sigs.push(sig(ev.pieces)); }
  else if(ev.type === 'timeout') timeout = true;
  else if(ev.type === 'progress') lastNodes = ev.nodes;
  else if(ev.type === 'edge-done'){ R.nodes = ev.nodes; R.leaves = ev.leaves; R.badLeaves = ev.badLeaves; }
  else if(ev.type === 'impossible-early') impossible = ev.reason;
  else if(ev.type === 'stage'){ R.stage.final = Math.round(now() - t0); R.openAtFinal = ev.counts.open; }
}
try {
  if(mode === 'raw-old'){
    for(const ev of S.solvePuzzle(w, h, ctx, se, 0, { deadline })){ feed(ev); if(R.solutions >= 2 || timeout) break; }
  } else {
    const o = { testMs: +(kv.testMs || 100), exact: (mode === 'raw-edge' || mode === 'pipe-edge') ? 'edge' : 'old', finalOnly: mode === 'raw-edge',
      deadline, edgeDone: true, stopScan: () => now() > deadline, edgePick: kv.pick, edgeFirst: kv.first, edgeFull: kv.full === '1', noScan: kv.noscan === '1', edgeLite: kv.lite === '0' ? false : undefined, scan: kv.scan === '1', actGrow: kv.actgrow, actNb: kv.actnb === '1', areaSumSlack: kv.slack, slices: kv.slices, portfolio: kv.portfolio === '0' ? false : undefined,
    ...Object.fromEntries(Object.entries(kv).filter(([k]) => k.startsWith('o.')).map(([k, v]) => [k.slice(2), v === 'true' ? true : v === 'false' ? false : (v !== '' && !isNaN(+v)) ? +v : (v[0] === '[' ? JSON.parse(v) : v)])),   // v48: o.name=value passes any option
    euler: kv.euler === '0' ? false : undefined, colour: kv.colour === '0' ? false : undefined, matchSplit: kv.matchsplit === '0' ? false : undefined, matchIso: kv.matchiso === '0' ? false : undefined };   // v46 switches: euler=0 colour=0 matchsplit=0 matchiso=0
    for(const ev of S.deduceSolve(w, h, ctx, se, o)){ feed(ev); if(R.solutions >= 2 || timeout || impossible) break; if(now() > deadline + 5000){ timeout = true; break; } }
  }
} catch(e){ if(e && e.timeout) timeout = true; else { R.error = String(e && e.stack || e).slice(0, 300); } }
R.ms = Math.round(now() - t0);
if(R.nodes == null) R.nodes = lastNodes;
if(R.error) R.verdict = 'ERROR';
else if(impossible) R.verdict = 'IMPOSSIBLE';
else if(R.solutions >= 2) R.verdict = 'NOT-UNIQUE';
else if(timeout || R.ms > limitS * 1000) R.verdict = 'TIMEOUT' + (R.solutions ? '(1 found)' : '');
else if(R.solutions === 1) R.verdict = sigs[0] === storedSig ? 'UNIQUE' : 'UNIQUE-BUT-DIFFERENT';
else R.verdict = 'NO-SOLUTION';
if(R.solutions >= 1 && sigs[0] !== storedSig && !/NOT-UNIQUE/.test(R.verdict)) R.firstIsStored = false; else if(R.solutions >= 1) R.firstIsStored = sigs[0] === storedSig;
console.log(JSON.stringify(R));
