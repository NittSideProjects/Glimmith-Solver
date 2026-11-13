// load a glimmith-puzzle .json export -> solver input Q   (node loadpz.js file.json [maxPasses])
const fs = require('fs'), L = require('./fuzzlib.js');
const S = L.S;                                               // same core as fuzzlib (GLIMMITH_CORE or the newest)
function load(file, idx = 0){
  const j = JSON.parse(fs.readFileSync(file, 'utf8')), p = j.puzzles[idx], st = p.state, pz = st.puzzle;
  const M = a => new Map(a || []);
  const Q = { puzzle: { w: pz.w, h: pz.h, active: pz.active, walls: M(pz.walls), roses: M(pz.roses), polyominoes: M(pz.polyominoes), areaNumbers: M(pz.areaNumbers), palisades: M(pz.palisades), compasses: M(pz.compasses), watchtowers: M(pz.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [], sol: new Set(p.solutionWalls || []), name: p.name };
  return Q;
}
function run(Q, opts){
  const ctx = S.buildSolverContext(Q.puzzle, Q.bank, Q.rules, null, Q.ban);
  const dec = new Map(); let imp = null, stage = [];
  for(const ev of S.deduceSolve(Q.puzzle.w, Q.puzzle.h, ctx, L.collectSpecialEdges(Q.puzzle.walls), opts || {})){
    if(ev.type === 'deduce') dec.set(ev.spot.key, ev.value + ':' + ev.rule);
    else if(ev.type === 'impossible-early'){ imp = ev.reason + ' / ' + ev.why; break; }
    else { stage.push(ev.type); if(!opts || !opts.full) break; }
  }
  return { dec, imp, stage };
}
function draw(Q, dec){
  const { w, h, active } = Q.puzzle; const lines = [];
  const ch = (key, sol) => { const d = dec.get(key); if(d) return d.startsWith('wall') ? 'W' : 's'; return '.'; };
  for(let r = 0; r < h; r++){
    let a = '', b = '';
    for(let c = 0; c < w; c++){
      a += active[r][c] ? '#' : ' ';
      if(c < w - 1){ const k = `v:${c},${r}`; a += (active[r][c] && active[r][c + 1]) ? ch(k) : ' '; }
      const k2 = `h:${c},${r}`; b += (r < h - 1 && active[r][c] && active[r + 1][c]) ? ch(k2) : ' '; b += ' ';
    }
    lines.push(a); lines.push(b);
  }
  return lines.join('\n');
}
module.exports = { load, run, draw };
if(require.main === module){
  const Q = load(process.argv[2]); const r = run(Q, { testNodes: +process.argv[3] || 1 });
  console.log(Q.name, Q.puzzle.w + 'x' + Q.puzzle.h, 'impossible:', r.imp, 'decided:', r.dec.size, 'stages:', r.stage.join(','));
  console.log(draw(Q, r.dec));
  const tags = {}; for(const v of r.dec.values()){ const t = v.split(':')[1]; tags[t] = (tags[t] || 0) + 1; } console.log(tags);
}
