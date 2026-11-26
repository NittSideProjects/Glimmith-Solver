// one puzzle: every top-level pass where other rules would also have decided something
const fs = require('fs'), L = require('/home/user/Glimmith-Solver/dev/fuzzlib.js'), S = L.S, M = a => new Map(a || []);
const [id, file] = process.argv.slice(2);
const st = JSON.parse(fs.readFileSync(file, 'utf8')).puzzles[0].state, p = st.puzzle;
const pz = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
const ctx = S.buildSolverContext(pz, st.shapeBank || [], st.sizeRules, { maxRegions: null, maxRegionSize: null }, st.banShapes || []);
const altLog = [], t0 = Date.now(); let step = 0;
for(const e of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(pz.walls), { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 0, exact: 'edge', altLog, deadline: t0 + 120000, stopScan: () => Date.now() - t0 > 120000 })){
  if(e.type === 'deduce') step++;
  if(e.type === 'stage' || e.type === 'solution' || e.type === 'impossible-early') break;
}
const out = altLog.map((x, i) => ({ id, i, ...x })).filter(x => x.alts.length >= 2);
console.log(JSON.stringify({ id, ms: Date.now() - t0, passes: altLog.length, multi: out.length, rec: out }));
