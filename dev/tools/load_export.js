// turns a page "Raw state" export (JSON) into the P object the solver tests use
const L = require('../fuzzlib.js');
function load(json){
  const j = typeof json === 'string' ? JSON.parse(json) : json, p = j.puzzle, sr = j.sizeRules || {};
  const M = a => new Map(a || []);
  const P = { puzzle: { w:p.w, h:p.h, active:p.active, walls:M(p.walls), roses:M(p.roses), polyominoes:M(p.polyominoes), areaNumbers:M(p.areaNumbers),
      palisades:M(p.palisades), compasses:M(p.compasses), watchtowers:M(p.watchtowers) },
    rules: Object.assign({ precision:null,min:null,max:null,mismatch:false,match:false,mingleShape:false,mingleArea:false,solitude:false,boxy:false,nonBoxy:false,bricky:false,loopy:false }, sr),
    bank: (j.shapeBank || []), ban: (j.banShapes || []), hints: j.solverLimits ? { maxRegionSize: j.solverLimits.maxRegionSize, maxRegions: j.solverLimits.maxRegions } : null };
  return P;
}
function run(P, dopts, label){
  const S = L.S, ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, P.hints, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
  const t0 = Date.now(), ded = [], tests = { n:0, contradiction:0, timeout:0, solution:0 }; let sols = [], stage = null, exceeded = false, early = null;
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, se, Object.assign({ nodeBudget: 3000000 }, dopts))){
    if(ev.type === 'deduce') ded.push(ev); else if(ev.type === 'tested'){ tests.n++; tests[ev.outcome]++; }
    else if(ev.type === 'solution') sols.push(ev.pieces); else if(ev.type === 'stage') stage = ev.counts;
    else if(ev.type === 'budget-exceeded') exceeded = true; else if(ev.type === 'impossible-early') early = ev.reason;
    if(sols.length >= 2) break;
  }
  return { ded, tests, sols, stage, exceeded, early, ms: Date.now() - t0 };
}
module.exports = { load, run };
