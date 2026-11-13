// Step timing (V1.0.2 order).  python3 instrument.py ../../reference/solver-core.vNN.js /tmp/core-prof.js
//   node run.js shard nShards limitMs out.json [/tmp/core-prof.js]   (one process per shard)   then   node report.js out0.json out1.json ...
const fs = require('fs'), path = require('path');
const dev = path.resolve(__dirname, '../..'), PROF = path.resolve(process.argv[6] || '/tmp/core-prof.js');
process.env.GLIMMITH_CORE = PROF;
const L = require(dev + '/fuzzlib.js'), S = require(PROF);
const [shard, nSh, lim, out] = [+process.argv[2], +process.argv[3], +process.argv[4], process.argv[5]];
const idx = require(dev + '/game_puzzles_converted/index.json');
let files = idx.puzzles.filter(p => p.inCampaign).map(p => path.join(dev, 'game_puzzles_converted', p.file));
for(const f of fs.readdirSync(dev + '/user_puzzles')) if(f.endsWith('.json')) files.push(path.join(dev, 'user_puzzles', f));
files = files.filter((f, i) => i % nSh === shard);
const res = [];
for(const f of files){
  let j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch(e){ continue; }
  for(const pz of j.puzzles.slice(0, 1)){
    const st = pz.state, p = st.puzzle, M = a => new Map(a || []);
    const P = { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] };
    const P0 = globalThis.__PROF; P0.t = {}; P0.n = {}; P0.cur = null; P0.probe = { t: {}, n: {} };
    const t0 = performance.now(), dl = t0 + lim;
    try {
      const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban);
      const gen = S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(P.puzzle.walls), { stopAtTwo: true, testMs: 100, deadline: dl, stopScan: () => performance.now() > dl });
      for(const ev of gen){ if(performance.now() > dl + 2000) break; if(ev.type === 'impossible-early') break; }
    } catch(e){ }
    res.push({ f: path.relative(dev, f), tiles: p.active.flat().filter(Boolean).length, ms: performance.now() - t0, top: { t: P0.t, n: P0.n }, probe: P0.probe });
  }
}
fs.writeFileSync(out, JSON.stringify(res));
console.log('shard', shard, res.length, 'puzzles');
