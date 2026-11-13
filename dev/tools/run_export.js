#!/usr/bin/env node
// Run every puzzle of a glimmith-puzzle export (e.g. workshop_wally/wally_workshop_21.glimmith.json) through deduceSolve, one child
// process per puzzle (hard kill at limit + 5 s).   node tools/run_export.js <file.json> [limitS=60] [jobs=2] [> results.jsonl]
// Per puzzle: verdict, ms, edges decided before the first narrow search (pure deduction, no search) out of the open edges, wrong edges
// against the stored solution, and the rules that decided them. A table goes to stderr.   env GLIMMITH_CORE: another core.
'use strict';
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
if(process.argv[2] === '--one'){
  const L = require('../fuzzlib.js'), S = L.S, [file, idx, lim] = [process.argv[3], +process.argv[4], +process.argv[5]];
  const pz = JSON.parse(fs.readFileSync(file, 'utf8')).puzzles[idx], st = pz.state, p = st.puzzle, M = a => new Map(a || []);
  const P = { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers), palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) };
  const sol = new Set(pz.solutionWalls || []), hasSol = sol.size > 0, t0 = Date.now(), dl = t0 + lim;
  const ctx = S.buildSolverContext(P, st.shapeBank || [], st.sizeRules, null, st.banShapes || []);
  let verdict = null, sols = 0, spots = null, before = null, wrong = 0, phase = 'deduce'; const rc = {}; let n = 0;
  for(const ev of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(P.walls), { stopAtTwo: true, testMs: 100, deadline: dl, stopScan: () => Date.now() > dl })){
    if(ev.type === 'plan') spots = ev.spots;
    else if(ev.type === 'deduce'){ if(phase === 'deduce'){ n++; rc[ev.rule] = (rc[ev.rule] || 0) + 1; } if(hasSol && ev.source !== 'search' && (ev.value === 'wall') !== sol.has(ev.spot.key)) wrong++; }
    else if(ev.type === 'testing' || ev.type === 'stage'){ if(phase === 'deduce'){ phase = 'search'; before = n; } }
    else if(ev.type === 'solution') sols++;
    else if(ev.type === 'impossible-early'){ verdict = 'IMPOSSIBLE'; break; }
    else if(ev.type === 'timeout'){ verdict = 'TIMEOUT'; break; }
  }
  if(!verdict) verdict = Date.now() > dl ? 'TIMEOUT' : sols === 1 ? 'UNIQUE' : sols >= 2 ? 'NOT-UNIQUE' : 'NONE';
  process.stdout.write(JSON.stringify({ name: pz.name, workshopId: pz.workshopId, size: p.w + 'x' + p.h, rules: Object.keys(st.sizeRules).filter(k => st.sizeRules[k]),
    verdict, ms: Date.now() - t0, spots, noSearch: before === null ? n : before, wrong, rules_used: rc }) + '\n');
  process.exit(0);
}
const file = process.argv[2], limS = +process.argv[3] || 60, jobs = +process.argv[4] || 2;
const ALL = JSON.parse(fs.readFileSync(file, 'utf8')).puzzles, N = ALL.length, out = new Array(N);
let next = 0, running = 0;
const start = () => {
  while(running < jobs && next < N){
    const i = next++; running++; let buf = '';
    const ch = spawn(process.execPath, [__filename, '--one', file, String(i), String(limS * 1000)], { env: process.env });
    const kill = setTimeout(() => ch.kill('SIGKILL'), (limS + 5) * 1000);
    ch.stdout.on('data', d => buf += d);
    ch.on('exit', () => { clearTimeout(kill); running--; out[i] = buf.trim() ? JSON.parse(buf.trim()) : { name: ALL[i].name, workshopId: ALL[i].workshopId, size: ALL[i].state.puzzle.w + 'x' + ALL[i].state.puzzle.h, verdict: 'TIMEOUT', killed: true, ms: (limS + 5) * 1000 };
      process.stdout.write(JSON.stringify(out[i]) + '\n'); if(next >= N && running === 0) table(); else start(); });
  }
};
const table = () => { for(const r of out) process.stderr.write(`${String(r.name || r.index).padEnd(26)} ${String(r.size || '').padEnd(6)} ${String(r.verdict).padEnd(10)} ${String(r.ms).padStart(6)} ms  pure deduction ${r.killed ? '(killed in the final search)' : r.noSearch + '/' + r.spots}${r.wrong ? '  WRONG ' + r.wrong : ''}\n`); };
start();
