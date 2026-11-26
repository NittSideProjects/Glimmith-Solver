// node stress.js <list file> <block> <first|last> : every puzzle of the list solved with that block moved; wrong deductions / impossible / crashes
const fs = require('fs');
const [list, block, where] = process.argv.slice(2);
const src = fs.readFileSync(process.env.GLIMMITH_CORE, 'utf8');
const names = JSON.parse(src.match(/const STEP_NAMES = (\[[^\]]*\])/)[1]);
const rest = names.filter(n => n !== block);
globalThis.__ORDER = block === 'none' ? names : where === 'first' ? [block, ...rest] : [...rest, block];
const L = require('/home/user/Glimmith-Solver/dev/fuzzlib.js'), S = L.S, M = a => new Map(a || []);
let bad = [];
for(const line of fs.readFileSync(list, 'utf8').trim().split('\n')){
  const [id, file] = line.split(' ');
  const J = JSON.parse(fs.readFileSync(file, 'utf8')).puzzles[0], st = J.state, p = st.puzzle, sw = new Set(J.solutionWalls);
  const pz = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
  try {
    const ctx = S.buildSolverContext(pz, st.shapeBank || [], st.sizeRules, { maxRegions: null, maxRegionSize: null }, st.banShapes || []);
    let sol = 0, end = '';
    for(const e of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(pz.walls), { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 0, exact: 'edge', deadline: Date.now() + 30000 })){
      if(e.type === 'deduce' && sw.has(e.spot.key) !== (e.value === 'wall')){ bad.push(`${id} WRONG ${e.spot.key} ${e.rule}`); break; }
      if(e.type === 'solution') sol++;
      if(e.type === 'impossible-early' || e.type === 'impossible'){ end = 'IMPOSSIBLE ' + (e.why || ''); }
      if(e.type === 'timeout') end = 'timeout';
    }
    if(end.startsWith('IMPOSSIBLE')) bad.push(`${id} ${end}`); else if(sol > 1) bad.push(`${id} two solutions`);
  } catch(err){ bad.push(`${id} CRASH ${err.message}`); }
}
console.log(`${block} ${where}: ${bad.length ? bad.slice(0, 4).join('; ') : 'ok'}`);
