// Soundness check of the DEDUCTIONS (instant + probes, no scan, no final search): every edge decided must agree with the game's stored solution.
//   node tools/check_deductions.js [--core reference/solver-core.v100.js] [--ids a,b | --area | --all] [--capS 8]
// Prints per puzzle only when something is wrong; at the end the totals and the rule counts (so a new rule can be seen firing).
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const a = process.argv.slice(2), opt = {}; for(let i = 0; i < a.length; i++) if(a[i].startsWith('--')){ opt[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true; }
const S = require(opt.core ? path.join(root, opt.core) : require(path.join(root, 'corepath.js')).corePath()), L = require(path.join(root, 'fuzzlib.js'));
const ix = JSON.parse(fs.readFileSync(path.join(root, 'game_puzzles_converted/index.json'), 'utf8')).puzzles.filter(p => p.kind === 'game' && p.inCampaign);
let list = ix;
if(opt.ids) list = ix.filter(p => opt.ids.split(',').includes(p.id));
else if(opt.area) list = ix.filter(p => (p.counts.areaNumbers || 0) > 0);
const capMs = +(opt.capS || 8) * 1000, M = x => new Map(x || []);
let wrong = 0, checked = 0, decided = 0, openLeft = 0; const rules = {}, t0 = Date.now();
for(const rec of list){
  const j = JSON.parse(fs.readFileSync(path.join(root, 'game_puzzles_converted', rec.file), 'utf8')).puzzles[0], st = j.state, p = st.puzzle;
  const P = { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] };
  const sw = new Set(j.solutionWalls || []);
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
  const t1 = Date.now(); let bad = 0, n = 0;
  for(const ev of S.deduceSolve(p.w, p.h, ctx, se, { testMs: 0, stopScan: () => true, noScan: true, areaSumSlack: opt.slack })){
    if(ev.type === 'deduce'){ n++; const want = sw.has(ev.spot.key) ? 'wall' : 'same'; rules[ev.rule] = (rules[ev.rule] || 0) + 1; if(ev.rule === 'bridge-count') (global.__br = global.__br || new Set()).add(rec.id);
    if(ev.value !== want){ bad++; console.log('WRONG', rec.id, ev.spot.key, ev.value, ev.rule); } }
    if(ev.type === 'stage'){ openLeft += ev.counts.open; break; }
    if(ev.type === 'impossible-early'){ bad++; console.log('IMPOSSIBLE-EARLY (wrong)', rec.id, ev.reason); break; }
    if(ev.type === 'solution') break;
    if(Date.now() - t1 > capMs) break;
  }
  wrong += bad; decided += n; checked++;
}
if(global.__br) console.log('bridge-count fired in', global.__br.size, 'puzzles:', [...global.__br].slice(0, 40).join(' '));
console.log(JSON.stringify({ checked, decided, openLeftAtFinal: openLeft, wrongEdges: wrong, sec: Math.round((Date.now() - t0) / 1000), areaSum: rules['area-sum'] || 0, bridgeCount: rules['bridge-count'] || 0 }));
