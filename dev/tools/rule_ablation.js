#!/usr/bin/env node
// Which deduction rules matter? (needs dev/game_puzzles_converted, which is not in the repository)
// For each switch (an opts.X that turns a rule off), every campaign puzzle is solved up to the final search (the steps and the probes,
// page defaults) with that rule off, and compared with the same run with every rule on:
//   * open  = edges still undecided when the final search would start (more = the rule decided something the others could not);
//   * ms    = time of the deduction phase.
// A rule that never leaves an edge open when it is off, on any puzzle, adds nothing to the base game's deductions (it may still matter
// for custom rules / user puzzles, or as a speed-up of the final search, which this tool does not measure).
//   node tools/rule_ablation.js [--switches a,b,c] [--jobs 3] [--limit-s 30] [--ids Zone1/0001,...] [--out file.jsonl]
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');

function load(file){
  const j = JSON.parse(fs.readFileSync(file, 'utf8')), pz = j.puzzles[0], st = pz.state, p = st.puzzle, M = a => new Map(a || []);
  return { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
    palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] };
}

if(!isMainThread){
  const { file, opts, limitMs } = workerData;
  const L = require(path.join(root, 'fuzzlib.js')), S = L.S;
  const P = load(file);
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
  const t0 = Date.now(); let open = null, how = 'final';
  try {
    for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, se, Object.assign({ testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4,
        useWitness: true, stopAtTwo: true, nodeBudget: 0, deadline: t0 + limitMs, stopScan: () => Date.now() - t0 > limitMs }, opts))){
      if(ev.type === 'stage'){ open = ev.counts ? ev.counts.open : null; break; }
      if(ev.type === 'solution'){ open = 0; how = 'solved'; break; }
      if(ev.type === 'impossible-early'){ how = 'impossible'; break; }
      if(ev.type === 'timeout'){ how = 'timeout'; break; }
    }
  } catch(e){ how = 'error: ' + e.message; }
  parentPort.postMessage({ open, how, ms: Date.now() - t0 });
  return;
}

const args = process.argv.slice(2), opt = {};
for(let i = 0; i < args.length; i++) if(args[i].startsWith('--')){ const k = args[i].slice(2); opt[k] = (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) ? args[++i] : true; }
const jobs = +opt.jobs || 3, limitMs = 1000 * (+opt['limit-s'] || 30);
const dir = path.join(root, 'game_puzzles_converted'), index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
let recs = index.puzzles.filter(r => r.kind === 'game' && r.inCampaign);
if(opt.ids){ const want = new Set(String(opt.ids).split(',')); recs = recs.filter(r => want.has(r.id)); }
const switches = ['(all on)'].concat(opt.switches ? String(opt.switches).split(',') : []);
const out = opt.out ? fs.openSync(opt.out, 'a') : null;

const tasks = []; for(const sw of switches) for(const r of recs) tasks.push({ sw, r });
const res = new Map(); for(const sw of switches) res.set(sw, new Map());
let next = 0, running = 0, done = 0;
function launch(){
  while(running < jobs && next < tasks.length){
    const t = tasks[next++]; running++;
    const opts = t.sw === '(all on)' ? {} : Object.fromEntries(t.sw.split('+').map(s => [s, false]));
    const w = new Worker(__filename, { workerData: { file: path.join(dir, t.r.file), opts, limitMs } });
    let fin = false;
    const kill = setTimeout(() => { if(!fin){ fin = true; w.terminate(); finish(t, { open: null, how: 'killed', ms: limitMs }); } }, limitMs + 15000);
    w.on('message', m => { if(fin) return; fin = true; clearTimeout(kill); w.terminate(); finish(t, m); });
    w.on('error', e => { if(fin) return; fin = true; clearTimeout(kill); finish(t, { open: null, how: 'error: ' + e.message, ms: 0 }); });
  }
}
function finish(t, m){
  running--; done++;
  res.get(t.sw).set(t.r.id, m);
  if(out) fs.writeSync(out, JSON.stringify({ sw: t.sw, id: t.r.id, ...m }) + '\n');
  if(done % 500 === 0) process.stderr.write(`${done}/${tasks.length}\n`);
  if(done === tasks.length) report(); else launch();
}
function report(){
  const base = res.get('(all on)');
  const sumMs = m => [...m.values()].reduce((s, x) => s + x.ms, 0);
  console.log(`${recs.length} puzzles, deduction phase only, limit ${limitMs / 1000} s`);
  console.log('| switch off | puzzles with more open edges | edges lost in all | puzzles with fewer open edges | other outcome changes | time (s) | vs all on |');
  console.log('|---|---|---|---|---|---|---|');
  for(const sw of switches){
    const m = res.get(sw); let worse = 0, lost = 0, better = 0, other = 0; const ex = [];
    for(const [id, b] of base){ const x = m.get(id); if(!x) continue;
      if(x.how !== b.how){ other++; if(ex.length < 3) ex.push(`${id} ${b.how}->${x.how}`); continue; }
      if(x.open != null && b.open != null){ if(x.open > b.open){ worse++; lost += x.open - b.open; if(ex.length < 3) ex.push(`${id} +${x.open - b.open}`); } else if(x.open < b.open) better++; } }
    console.log(`| ${sw} | ${worse} | ${lost} | ${better} | ${other} | ${(sumMs(m) / 1000).toFixed(0)} | ${sw === '(all on)' ? '' : ((sumMs(m) - sumMs(base)) / 1000).toFixed(0)} | ${ex.join('; ')}`);
  }
}
launch();
