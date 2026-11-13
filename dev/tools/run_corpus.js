#!/usr/bin/env node
// Batch runner: how long does the page's solver (deduceSolve, the page's default settings) need for each base-game puzzle, does it finish, and WHERE does it
// decide the edges?   One record per puzzle, appended to a .jsonl file as soon as the puzzle is done (restartable), plus a .csv and a .summary.md at the end.
//
//   node tools/run_corpus.js                              the 1,225 campaign puzzles, 60 s hard limit each, results/corpus_run_v39.{jsonl,csv,summary.md}
//   node tools/run_corpus.js --zone Zone2 --difficulty 3  a slice          (also: --category 6-compass  --ids Zone3/0373,Zone3/1408  --all  --dev)
//   node tools/run_corpus.js --resume                     skip the puzzles that already have a record in the output file (after Ctrl-C / a crash / a new slice)
//   node tools/run_corpus.js --resume --redo TIMEOUT,ERROR --limit-s 300     run the failed ones again with another limit (the new record replaces the old one)
//   node tools/corpus_report.js results/corpus_run_v39.jsonl                 rebuild the .csv / .summary.md from a .jsonl (also merges several: pass several files)
//
// Options: --limit-s 60 (hard limit per puzzle) --grace-s 3 (a worker still busy this long after the limit is killed) --jobs 1 (parallel workers; timings get noisier
//   when > 1: use jobs <= physical cores - 1) --test-ms 100 (page default: ms per narrow search) --out results/corpus_run_v39 (path without extension)
//   --max-old-mb 3072 (memory cap per worker) --list (only print the selection) --quiet --no-report
//
// THE THREE PHASES (the numbers asked for): every edge that is not fixed by a hand-drawn wall ("spot") is decided by exactly one of
//   instant   the first propagation pass, before anything is assumed (no search at all)
//   probe     look-ahead: assume wall / same, propagate, contradiction => the other value. Still only propagation, no search (this is deduceSolve's probeLoop)
//   scan      "wall per wall": a narrow exact search per edge (testMs each); a contradiction decides the edge. The edges that follow from it by propagation
//             and look-ahead are counted here too (scanDirect = only the edges the search itself proved)
//   left      edges still open when the exact solver takes over for the final stage (what it has to settle by search)
// instant + probe + scan + left = spots. A puzzle with left = 0 never needed the final exact search for edges (it still runs it once to prove uniqueness).
//
// A worker thread per puzzle (fresh JIT state each time, killable): soft limit inside the worker, hard kill from here limit + grace. A killed puzzle gets verdict
// TIMEOUT with the numbers of its last heartbeat (killed: true).
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');
const root = path.resolve(__dirname, '..');

// ================================================================== the worker: one puzzle
function wallSig(ps, w, h){          // wall keys of a tiling given as pieces [{cells:[[c,r]...]}]
  const id = new Map(); ps.forEach((p, i) => p.cells.forEach(([c, r]) => id.set(`${c},${r}`, i))); const keys = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    const a = id.get(`${c},${r}`); if(a === undefined) continue;
    const b = id.get(`${c + 1},${r}`); if(b !== undefined && a !== b) keys.push(`v:${c},${r}`);
    const d = id.get(`${c},${r + 1}`); if(d !== undefined && a !== d) keys.push(`h:${c},${r}`);
  }
  return keys.sort().join('|');
}
function piecesFromWalls(active, w, h, sw){   // components of active tiles not separated by a solution wall
  const seen = Array.from({ length: h }, () => Array(w).fill(false)), out = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c] || seen[r][c]) continue;
    const cells = [], st = [[c, r]]; seen[r][c] = true;
    while(st.length){ const [x, y] = st.pop(); cells.push([x, y]);
      for(const [nx, ny, key] of [[x + 1, y, `v:${x},${y}`], [x - 1, y, `v:${x - 1},${y}`], [x, y + 1, `h:${x},${y}`], [x, y - 1, `h:${x},${y - 1}`]]){
        if(nx < 0 || ny < 0 || nx >= w || ny >= h || !active[ny][nx] || seen[ny][nx] || sw.has(key)) continue; seen[ny][nx] = true; st.push([nx, ny]); } }
    out.push({ cells });
  }
  return out;
}

function workerMain(){
  const { rec, dir, limitMs, solverOpts } = workerData;
  const { performance } = require('perf_hooks');
  const t0 = performance.now(), el = () => performance.now() - t0, r1 = x => Math.round(x * 10) / 10;
  const send = m => parentPort.postMessage(m);
  const bucketNew = () => ({ n: 0, walls: 0, links: 0 });
  const R = {
    id: rec.id, zone: rec.zone, category: rec.category, number: rec.number, stem: rec.stem, difficulty: rec.difficulty, kind: rec.kind, inCampaign: rec.inCampaign,
    w: rec.w, h: rec.h, activeTiles: rec.activeTiles, features: rec.features, rules: rec.rules, counts: rec.counts, wallKinds: rec.wallKinds, hasSolution: rec.hasSolution,
    verdict: null, endedIn: null, timedOutIn: null, killed: false, error: null, reason: null,
    lastTest: null, overLimit: false,
    totalMs: null, ctxMs: null, instantMs: null, probeMs: null, scanMs: null, finalMs: null, firstSolutionMs: null,
    edges: { spots: null, fixed: null, instant: bucketNew(), probe: bucketNew(), scan: Object.assign(bucketNew(), { direct: 0 }), left: null },
    ruleCounts: { instant: {}, probe: {}, scan: {} },
    scan: { tests: 0, contradictions: 0, timeouts: 0, solutionsSeen: 0, testMs: 0 }, probes: null, probeDeductions: null,
    final: { nodes: null, fraction: null }, solutions: 0, authorAmongTwo: null, wrongEdges: 0, wrongExamples: [],
  };
  const ORDER = ['init', 'probe', 'scan', 'final'];
  let phase = 'init'; const stamp = {};
  const goto = p => { const t = el(); for(let i = ORDER.indexOf(phase) + 1; i <= ORDER.indexOf(p); i++) stamp[ORDER[i]] = t; if(ORDER.indexOf(p) > ORDER.indexOf(phase)) phase = p; };
  let lastOpen = null, lastSnap = 0;
  function durations(end){
    const out = {}; ORDER.forEach((p, i) => {
      if(stamp[p] === undefined){ out[p] = (i === 0) ? null : 0; return; }
      let e = end; for(let j = i + 1; j < ORDER.length; j++) if(stamp[ORDER[j]] !== undefined){ e = stamp[ORDER[j]]; break; }
      out[p] = r1(e - stamp[p]);
    });
    return out;
  }
  function fill(end){
    const d = durations(end);
    R.instantMs = d.init; R.probeMs = d.probe; R.scanMs = d.scan; R.finalMs = d.final; R.totalMs = r1(end);
    R.edges.left = R.edges.left != null ? R.edges.left : lastOpen;
    R.phaseAtEnd = phase;
  }
  const snap = () => { lastSnap = el(); const copy = JSON.parse(JSON.stringify(R)); fillCopy(copy); send({ type: 'snap', rec: copy }); };
  function fillCopy(c){            // same as fill() but on a copy (heartbeat; the real record is only filled at the end)
    const end = el(), d = durations(end);
    c.instantMs = d.init; c.probeMs = d.probe; c.scanMs = d.scan; c.finalMs = d.final; c.totalMs = r1(end); c.edges.left = c.edges.left != null ? c.edges.left : lastOpen; c.phaseAtEnd = phase;
  }
  const finish = () => { fill(el()); send({ type: 'done', rec: R }); };

  try {
    const L = require(path.join(root, 'fuzzlib.js')), S = L.S;
    const j = JSON.parse(fs.readFileSync(path.join(dir, rec.file), 'utf8')), pz = j.puzzles[0], st = pz.state, p = st.puzzle, M = a => new Map(a || []);
    const P = { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
                          palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] };
    const sw = pz.solutionWalls ? new Set(pz.solutionWalls) : null, w = p.w, h = p.h;
    const authorSig = sw ? wallSig(piecesFromWalls(p.active, w, h, sw), w, h) : null;
    const tCtx0 = el();
    const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
    R.ctxMs = r1(el() - tCtx0);
    stamp.init = el();
    snap();                          // first heartbeat: if the very first propagation never returns, the killed record still has its skeleton
    const over = () => el() > limitMs;
    const gen = S.deduceSolve(w, h, ctx, se, Object.assign({}, solverOpts, {
      stopScan: () => { if(phase === 'init') goto('probe'); if(el() - lastSnap > 1000) snap(); return over(); },
    }));
    const sigs = []; let timedOut = false, impossible = null, sawStage = false;
    for(;;){
      const { value: ev, done } = gen.next();
      if(done) break;
      if(!ev) continue;
      switch(ev.type){
        case 'plan': R.edges.spots = ev.spots; R.edges.fixed = ev.fixedWalls; lastOpen = ev.spots; snap(); break;
        case 'deduce': {
          const b = phase === 'init' ? 'instant' : phase === 'probe' ? 'probe' : 'scan', E = R.edges[b];
          E.n++; if(ev.value === 'wall') E.walls++; else E.links++;
          if(b === 'scan' && ev.source === 'search') E.direct++;
          R.ruleCounts[b][ev.rule] = (R.ruleCounts[b][ev.rule] || 0) + 1;
          lastOpen = ev.open;
          if(sw){ const want = sw.has(ev.spot.key) ? 'wall' : 'same';
            if(ev.value !== want){ R.wrongEdges++; if(R.wrongExamples.length < 5) R.wrongExamples.push(`${ev.spot.key}=${ev.value} (${b}:${ev.rule})`); } }
          break; }
        case 'testing': if(phase === 'init' || phase === 'probe') goto('scan'); R.lastTest = `${ev.spot.key} assume ${ev.assume} (open ${ev.open})`; break;
        case 'tested': R.scan.tests++; R.scan.testMs += ev.ms || 0;
          if(ev.outcome === 'contradiction') R.scan.contradictions++; else if(ev.outcome === 'timeout') R.scan.timeouts++; else R.scan.solutionsSeen++; break;
        case 'stage': goto('final'); sawStage = true; R.edges.left = ev.counts.open; lastOpen = ev.counts.open;
          R.probes = ev.stats.probes != null ? ev.stats.probes : null; R.probeDeductions = ev.stats.probeDeductions != null ? ev.stats.probeDeductions : null;
          snap(); break;                // heartbeat NOW: the final search can run a long time without yielding any event
        case 'progress': R.final.nodes = ev.nodes; R.final.fraction = ev.fraction != null ? Math.round(ev.fraction * 1e4) / 1e4 : null; break;
        case 'solution': R.solutions++; if(R.firstSolutionMs == null) R.firstSolutionMs = r1(el()); sigs.push(wallSig(ev.pieces, w, h)); break;
        case 'impossible-early': impossible = { reason: ev.reason, why: ev.why }; break;
        case 'budget-exceeded': R.final.nodes = ev.nodes; timedOut = true; R.reason = 'node budget'; break;
        default: break;
      }
      if(impossible || timedOut) break;
      if(R.solutions >= 2) break;
      if(over()){ timedOut = true; break; }
      if(el() - lastSnap > 1000) snap();
    }
    R.reason = R.reason || null;
    // ---- verdict
    if(timedOut){ R.verdict = 'TIMEOUT'; R.timedOutIn = phase; }
    else if(impossible){ R.verdict = sw ? 'IMPOSSIBLE' : 'NO-SOLUTION'; R.reason = impossible.reason + (impossible.why ? ' / ' + impossible.why : ''); R.endedIn = phase; }
    else if(R.solutions >= 2){ R.verdict = 'NOT-UNIQUE'; R.authorAmongTwo = authorSig ? sigs.includes(authorSig) : null; R.endedIn = sawStage ? 'final' : phase; }
    else if(R.solutions === 1){ R.verdict = !authorSig ? 'UNIQUE-NO-STORED' : (sigs[0] === authorSig ? 'UNIQUE' : 'UNIQUE-BUT-DIFFERENT'); R.endedIn = 'final'; }
    else { R.verdict = sw ? 'IMPOSSIBLE' : 'NO-SOLUTION'; R.reason = 'search finished without any tiling'; R.endedIn = phase; }
    if(R.verdict === 'UNIQUE' || R.verdict === 'UNIQUE-NO-STORED') R.endedIn = 'final';
    R.overLimit = R.verdict !== 'TIMEOUT' && el() > limitMs;      // finished, but only after the limit (the soft check only runs between solver events)
    finish();
  } catch(e){
    R.verdict = 'ERROR'; R.error = String(e && e.stack || e).slice(0, 600);
    try { fill(el()); } catch(_){}
    send({ type: 'done', rec: R });
  }
}

// ================================================================== the orchestrator
function mainMain(){
  const args = process.argv.slice(2), opt = {};
  for(let i = 0; i < args.length; i++){ if(args[i].startsWith('--')){ const k = args[i].slice(2); opt[k] = (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) ? args[++i] : true; } }
  const dir = path.resolve(opt.dir || path.join(root, 'game_puzzles_converted'));
  const limitS = Number(opt['limit-s'] || 60), graceS = Number(opt['grace-s'] || 3), jobs = Math.max(1, Number(opt.jobs || 1)), testMs = Number(opt['test-ms'] || 100);
  const maxOldMb = Number(opt['max-old-mb'] || 3072);
  const outBase = path.resolve(opt.out || path.join(root, 'results', 'corpus_run_v39')).replace(/\.(jsonl|json|csv|md)$/, '');
  const jsonl = outBase + '.jsonl';
  const solverOpts = { testMs, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 0 };   // = the page's defaults
  if(process.env.GLIMMITH_OPTS) Object.assign(solverOpts, JSON.parse(process.env.GLIMMITH_OPTS));          // v53: extra solver options for experiments, e.g. '{"roseCut":false}'

  const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
  let recs = index.puzzles.filter(r => opt.dev ? true : r.kind === 'game');
  if(!opt.all && !opt.dev) recs = recs.filter(r => r.inCampaign);
  if(opt.zone) recs = recs.filter(r => r.zone === opt.zone);
  if(opt.difficulty) { const ds = new Set(String(opt.difficulty).split(',').map(Number)); recs = recs.filter(r => ds.has(r.difficulty)); }
  if(opt.category) recs = recs.filter(r => r.category.includes(opt.category));
  if(opt.ids){ const s = new Set(String(opt.ids).split(',')); recs = recs.filter(r => s.has(r.id)); }
  recs.sort((a, b) => a.zone.localeCompare(b.zone) || a.difficulty - b.difficulty || (a.number || 0) - (b.number || 0) || a.id.localeCompare(b.id));

  // resume: the latest record of an id wins
  const have = new Map();
  if(fs.existsSync(jsonl)) for(const line of fs.readFileSync(jsonl, 'utf8').split('\n')){ if(!line.trim()) continue; try { const o = JSON.parse(line); if(o.id) have.set(o.id, o); } catch(_){} }
  const redo = new Set(opt.redo ? String(opt.redo).split(',') : []);
  let queue = recs;
  if(opt.resume || opt.redo) queue = recs.filter(r => { const h = have.get(r.id); return !h || redo.has(h.verdict); });
  console.log(`selected ${recs.length} puzzle(s), ${queue.length} to run (limit ${limitS} s hard, +${graceS} s grace to kill, ${jobs} job(s), narrow search ${testMs} ms) -> ${path.relative(process.cwd(), jsonl)}`);
  if(opt.list){ for(const r of queue) console.log(r.id, 'd' + r.difficulty, r.category, `${r.w}x${r.h}`); return; }
  if(!queue.length){ console.log('nothing to do'); if(!opt['no-report']) require('./corpus_report.js').writeReports([jsonl], outBase); return; }

  fs.mkdirSync(path.dirname(jsonl), { recursive: true });
  const corePathUsed = require(path.join(root, 'corepath.js')).corePath();   // the core the workers load (GLIMMITH_CORE or the newest)
  const coreFile = path.basename(corePathUsed);
  const coreSha1 = crypto.createHash('sha1').update(fs.readFileSync(corePathUsed)).digest('hex').slice(0, 12);
  const runId = new Date().toISOString();
  const meta = { runId, solverCore: coreFile, coreSha1, node: process.version, platform: `${os.platform()} ${os.arch()}`, cpu: os.cpus()[0] && os.cpus()[0].model, cores: os.cpus().length,
                 jobs, limitS, graceS, solverOpts, selected: recs.length, toRun: queue.length, args: process.argv.slice(2).join(' ') };
  fs.appendFileSync(jsonl, JSON.stringify({ _meta: meta }) + '\n');

  const tally = {}; let done = 0, nextIdx = 0, running = 0, finished = false; const startedAt = Date.now(); const live = new Set();
  const pct = (n, tot) => tot ? Math.round(100 * n / tot) + '%' : '-';
  function record(rec){
    rec.runId = runId; rec.limitS = limitS;
    fs.appendFileSync(jsonl, JSON.stringify(rec) + '\n');
    done++; tally[rec.verdict] = (tally[rec.verdict] || 0) + 1;
    if(!opt.quiet){
      const E = rec.edges || {}, sp = E.spots;
      const split = sp ? `instant ${pct(E.instant.n, sp)} probe ${pct(E.probe.n, sp)} scan ${pct(E.scan.n, sp)} left ${pct(E.left || 0, sp)}` : '';
      const flag = rec.verdict === 'UNIQUE' ? '' : '  <== ' + rec.verdict + (rec.verdict === 'TIMEOUT' ? ` in ${rec.timedOutIn}${rec.killed ? ' (killed)' : ''}` : '');
      const elapsed = (Date.now() - startedAt) / 1000, eta = done ? elapsed / done * (queue.length - done) : 0;
      console.log(`[${String(done).padStart(String(queue.length).length)}/${queue.length}] ${rec.id.padEnd(14)} d${rec.difficulty} ${String(rec.category).padEnd(24)} ${`${rec.w}x${rec.h}`.padEnd(6)} ${((rec.totalMs || 0) / 1000).toFixed(2).padStart(6)} s  ${split}${flag}${rec.wrongEdges ? '  WRONG-EDGES ' + rec.wrongEdges : ''}  (eta ${Math.round(eta / 60)} min)`);
    }
  }
  function launch(r){
    running++;
    const spawnT = Date.now(); let last = null, finishedRec = null, killed = false;
    const worker = new Worker(__filename, { workerData: { rec: r, dir, limitMs: limitS * 1000, solverOpts }, resourceLimits: { maxOldGenerationSizeMb: maxOldMb } });
    live.add(worker);
    const timer = setTimeout(() => { killed = true; worker.terminate(); }, (limitS + graceS) * 1000);
    let settled = false;
    const settle = rec => { if(settled) return; settled = true; clearTimeout(timer); live.delete(worker); running--; record(rec); pump(); };
    worker.on('message', m => { if(m.type === 'snap') last = m.rec; else if(m.type === 'done') finishedRec = m.rec; });
    worker.on('error', e => {
      const base = last || { id: r.id, zone: r.zone, category: r.category, difficulty: r.difficulty, w: r.w, h: r.h, activeTiles: r.activeTiles, features: r.features, rules: r.rules, hasSolution: r.hasSolution };
      settle(Object.assign({}, base, { verdict: 'ERROR', error: (e && e.code ? e.code + ': ' : '') + String(e && e.message || e).slice(0, 300), totalMs: Date.now() - spawnT }));
    });
    worker.on('exit', () => {
      if(settled) return;
      if(finishedRec) return settle(finishedRec);
      if(killed){
        const base = last || { id: r.id, zone: r.zone, category: r.category, difficulty: r.difficulty, w: r.w, h: r.h, activeTiles: r.activeTiles, features: r.features, rules: r.rules, hasSolution: r.hasSolution };
        const wall = Date.now() - spawnT, key = { init: 'instantMs', probe: 'probeMs', scan: 'scanMs', final: 'finalMs' }[base.phaseAtEnd];
        if(key && base[key] != null && base.totalMs != null) base[key] = Math.round((base[key] + Math.max(0, wall - base.totalMs)) * 10) / 10;   // the time since the last heartbeat belongs to the phase it was in
        return settle(Object.assign({}, base, { verdict: 'TIMEOUT', killed: true, timedOutIn: base.phaseAtEnd || 'unknown', totalMs: wall, note: 'worker killed after the limit; counts are from its last heartbeat, the time since then is added to the phase it was in' }));
      }
      settle({ id: r.id, zone: r.zone, category: r.category, difficulty: r.difficulty, w: r.w, h: r.h, activeTiles: r.activeTiles, verdict: 'ERROR', error: 'worker exited without a result', totalMs: Date.now() - spawnT });
    });
  }
  function pump(){
    while(running < jobs && nextIdx < queue.length) launch(queue[nextIdx++]);
    if(running === 0 && nextIdx >= queue.length && !finished){ finished = true; finalize(); }
  }
  function finalize(){
    const mins = ((Date.now() - startedAt) / 60000).toFixed(1);
    console.log(`\nfinished ${done} puzzle(s) in ${mins} min: ${JSON.stringify(tally)}`);
    if(!opt['no-report']){ try { require('./corpus_report.js').writeReports([jsonl], outBase); } catch(e){ console.log('report failed:', e.message); } }
  }
  process.on('SIGINT', () => {
    console.log('\ninterrupted: stopping workers, writing the report of what is done (use --resume to continue)');
    for(const w of live) w.terminate();
    setTimeout(() => { if(!opt['no-report']){ try { require('./corpus_report.js').writeReports([jsonl], outBase); } catch(_){} } process.exit(130); }, 300);
  });
  pump();
}

if(isMainThread) mainMain(); else workerMain();
