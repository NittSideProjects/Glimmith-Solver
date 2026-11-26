// one puzzle: deduction phase with opts.blockStats; prints JSON {id, ms, stats, events}
const fs = require('fs'), L = require('/home/user/Glimmith-Solver/dev/fuzzlib.js'), S = L.S, M = a => new Map(a || []);
const [id, file, order] = process.argv.slice(2);
const st = JSON.parse(fs.readFileSync(file, 'utf8')).puzzles[0].state, p = st.puzzle;
const pz = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
const ctx = S.buildSolverContext(pz, st.shapeBank || [], st.sizeRules, { maxRegions: null, maxRegionSize: null }, st.banShapes || []);
const blockStats = {}, t0 = Date.now(); let n = 0, sol = 0; const seq = [];
for(const e of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(pz.walls), { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 0, blockStats, ruleOrder: order, deadline: t0 + 120000 })){
  if(e.type === 'deduce'){ n++; seq.push(e.spot.key + e.value[0] + e.rule); }
  if(e.type === 'solution') sol++;
}
console.log(JSON.stringify({ id, ms: Date.now() - t0, sol, n, stats: blockStats, h: require('crypto').createHash('sha1').update(seq.join('|')).digest('hex').slice(0, 10) }));
