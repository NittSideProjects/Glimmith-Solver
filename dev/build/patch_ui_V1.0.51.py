#!/usr/bin/env python3
"""Page V1.0.50 -> V1.0.51: the solver runs in a Web Worker, so the page no longer freezes while it works.

Until now the solver ran on the page's own thread in slices (SLICE_MS): the page painted between two solver events. One solver step
that takes long (a propagation pass, the probes, a SAT block, a final-search node) gave no event for that long, and the page froze:
no progress, no Cancel. Now the Solve run and the step-by-step replay run the same solver in a worker (its own thread):
  * the worker is made from this page's own SOLVER CORE text (read from the page's script at load, between the SOLVER CORE and
    IMPORT CORE markers) plus a small loop (solverWorkerMain), as a blob: no other file, no network, and the page and the worker run
    the very same core;
  * the worker runs the solver in 40 ms slices and sends each slice's events in one message; between slices it reads the page's
    messages (Skip the narrow searches);
  * Cancel ends the worker at once (terminate), even in the middle of a long step;
  * where a worker can not be made (no Worker, as in jsdom; a browser that refuses a blob worker; an error before the first
    message) the solver runs on the page exactly as before (solverSource falls back on its own).
The solver core does not change (still core v129); the events are the same objects (copied by the browser), so the step-by-step and
the result do not change. No page text is added or changed.
Usage: python3 patch_ui_V1.0.51.py glimmith_solver_V1.0.50.html glimmith_solver_V1.0.51.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()

# ---- the worker and the event source, after nextPaint (top level of the page script: document.currentScript is still set there)
src = rep(src, """  const nextPaint = () => new Promise(res => { let done = false; const fin = () => { if(!done){ done = true; res(); } }; requestAnimationFrame(() => setTimeout(fin, 0)); setTimeout(fin, 60); });
""", """  const nextPaint = () => new Promise(res => { let done = false; const fin = () => { if(!done){ done = true; res(); } }; requestAnimationFrame(() => setTimeout(fin, 0)); setTimeout(fin, 60); });
  // V1.0.51: the solver runs in a Web Worker (its own thread), so the page keeps painting while one solver step runs long. The worker is
  // made from this page's own SOLVER CORE text (no other file, no network), so page and worker run the same core. Where no worker can
  // be made (jsdom, a browser that refuses a blob worker, an error before its first message) the solver runs on the page as before.
  const SOLVER_CORE_SRC = (() => {
    try {
      const t = document.currentScript ? document.currentScript.textContent : '', bar = '='.repeat(17);
      const a = t.indexOf('  // ' + bar + ' SOLVER CORE (pure'), b = t.indexOf('  // ' + bar + ' IMPORT CORE (pure');
      return a >= 0 && b > a ? t.slice(a, b) : '';
    } catch(e){ return ''; }
  })();
  function solverWorkerMain(){                     // runs inside the worker, after the core: 40 ms slices, one message of events per slice
    let gen = null, skip = false;
    const tick = new MessageChannel();
    const run = () => {
      const t0 = Date.now(), events = [];
      try {
        while(Date.now() - t0 < 40){
          const r = gen.next();
          if(r.done){ postMessage({ events, done: true }); return; }
          if(r.value) events.push(r.value);
        }
      } catch(err){ postMessage({ events, error: String(err && err.stack || err) }); return; }
      postMessage({ events });
      tick.port2.postMessage(0);                   // the next slice, after the page's messages (Skip) have been read
    };
    tick.port1.onmessage = run;
    self.onmessage = e => {
      const m = e.data;
      if(m.type === 'skip'){ skip = true; return; }
      if(m.type !== 'start') return;
      try {
        const ctx = buildSolverContext(m.puzzle, m.bank, m.rules, m.hints, m.ban);
        gen = deduceSolve(m.w, m.h, ctx, m.special, Object.assign({}, m.opts, { stopScan: () => skip }));
      } catch(err){ postMessage({ events: [], error: String(err && err.stack || err) }); return; }
      run();
    };
  }
  // a source of solver events: next() -> { value, done } | null (none yet: wait), wait(ms), skip() (stop the narrow searches), stop()
  function solverSource(job, pageOpts){
    const onPage = () => {
      const gen = deduceSolve(job.w, job.h, buildSolverContext(job.puzzle, job.bank, job.rules, job.hints, job.ban), job.special, Object.assign({}, job.opts, pageOpts));
      return { thread: 'page', next: () => gen.next(), wait: () => Promise.resolve(), skip(){}, stop(){ try { gen.return(); } catch(e){} } };
    };
    if(typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof MessageChannel === 'undefined' || !SOLVER_CORE_SRC || !(URL && URL.createObjectURL)) return onPage();
    let worker, url;
    try {
      url = URL.createObjectURL(new Blob([SOLVER_CORE_SRC + '\\n(' + solverWorkerMain.toString() + ')();\\n'], { type: 'text/javascript' }));
      worker = new Worker(url);
      worker.postMessage(Object.assign({ type: 'start' }, job));
    } catch(e){ try { if(worker) worker.terminate(); } catch(_){} if(url) URL.revokeObjectURL(url); return onPage(); }
    let q = [], qi = 0, done = false, failed = null, heard = false, waiter = null, fallback = null;
    const wake = () => { if(waiter){ const f = waiter; waiter = null; f(); } };
    worker.onmessage = e => {
      const m = e.data;
      if(!heard){ heard = true; URL.revokeObjectURL(url); }
      for(const ev of m.events) q.push(ev);
      if(m.done) done = true;
      if(m.error) failed = m.error;
      wake();
    };
    worker.onerror = e => {
      if(e && e.preventDefault) e.preventDefault();
      if(!heard && !fallback){ try { worker.terminate(); } catch(_){} URL.revokeObjectURL(url); fallback = onPage(); }     // the worker never started: on the page
      else if(!failed) failed = (e && e.message) || 'worker-error';
      wake();
    };
    const src = {
      get thread(){ return fallback ? 'page' : 'worker'; },
      next(){
        if(fallback) return fallback.next();
        if(qi < q.length){ const value = q[qi++]; if(qi > 4096){ q = q.slice(qi); qi = 0; } return { value, done: false }; }
        if(failed) throw new Error(failed);
        if(done) return { value: undefined, done: true };
        return null;
      },
      wait(ms){ if(fallback || qi < q.length || done || failed) return Promise.resolve(); return new Promise(res => { waiter = res; setTimeout(wake, ms); }); },
      skip(){ if(fallback) fallback.skip(); else worker.postMessage({ type: 'skip' }); },
      stop(){ if(fallback) fallback.stop(); else try { worker.terminate(); } catch(e){} }
    };
    return src;
  }
""", 'worker + source')

# ---- runDeduce
src = rep(src, """    const ctx = buildSolverContext(puzzle, bankShapesData, sizeRules, limits.hints, banShapesData());
    const specialEdges = collectSpecialEdges();
    const gen = deduceSolve(puzzle.w, puzzle.h, ctx, specialEdges, {
""", """    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle, bank: bankShapesData, rules: sizeRules, hints: limits.hints, ban: banShapesData(), special: collectSpecialEdges(), opts: {   // V1.0.51
""", 'runDeduce source')
src = rep(src, """
      stopScan: () => solverCancelled || skipScanRequested
    });
""", """
    } }, { stopScan: () => solverCancelled || skipScanRequested });
    lastSolverThread = src.thread;
    let skipSent = false;
""", 'runDeduce opts end')
src = rep(src, """      while(performance.now() - sliceStart < SLICE_MS){
        const { value, done } = gen.next();
        if(done){ outcome = 'exhausted'; break outer; }
""", """      let starved = false;
      if(skipScanRequested && !skipSent){ skipSent = true; src.skip(); }
      while(performance.now() - sliceStart < SLICE_MS){
        const nx = src.next();
        if(nx === null){ starved = true; break; }                      // V1.0.51: the worker has sent nothing more yet
        const { value, done } = nx;
        if(done){ outcome = 'exhausted'; break outer; }
""", 'runDeduce next')
src = rep(src, """      if(paintNow){ await nextPaint(); lastPaint = performance.now(); }
      else await new Promise(res => setTimeout(res, 0));
""", """      if(paintNow){ await nextPaint(); lastPaint = performance.now(); }
      else if(starved) await src.wait(100);
      else await new Promise(res => setTimeout(res, 0));
""", 'runDeduce wait')
src = rep(src, """    const totalMs = performance.now() - startTime;
    if(stage === 'scan') scanMs = totalMs;
""", """    src.stop();
    const totalMs = performance.now() - startTime;
    if(stage === 'scan') scanMs = totalMs;
""", 'runDeduce stop')
src = rep(src, """  let dedDrawnKeys = new Set(), dedShapeCells = new Set();
""", """  let dedDrawnKeys = new Set(), dedShapeCells = new Set();
  let lastSolverThread = null;                                      // V1.0.51: 'worker' | 'page' (read by the tests)
""", 'lastSolverThread')

# ---- replayDeductionTrace
src = rep(src, """    const ctx = buildSolverContext(puzzle, bankShapesData, sizeRules, stepsCtx.hints || { maxRegions: null, maxRegionSize: null }, banShapesData());
    const gen = deduceSolve(puzzle.w, puzzle.h, ctx, collectSpecialEdges(), { testMs: cfg.testMs, restart: cfg.restart, order: cfg.order, focusMode: cfg.focusMode, nearShare: cfg.nearShare,
      useWitness: cfg.useWitness, stopAtTwo: true, nodeBudget: NODE_BUDGET, exact: 'edge', slices: 's18,e', fullScan: !document.getElementById('quickFinalChk').checked, stopScan: () => solverCancelled });
""", """    const src = solverSource({ w: puzzle.w, h: puzzle.h, puzzle, bank: bankShapesData, rules: sizeRules, hints: stepsCtx.hints || { maxRegions: null, maxRegionSize: null }, ban: banShapesData(),   // V1.0.51
      special: collectSpecialEdges(), opts: { testMs: cfg.testMs, restart: cfg.restart, order: cfg.order, focusMode: cfg.focusMode, nearShare: cfg.nearShare,
      useWitness: cfg.useWitness, stopAtTwo: true, nodeBudget: NODE_BUDGET, exact: 'edge', slices: 's18,e', fullScan: !document.getElementById('quickFinalChk').checked } }, { stopScan: () => solverCancelled });
    lastSolverThread = src.thread;
""", 'replay source')
src = rep(src, """      while(performance.now() - t0 < SLICE_MS){
        const { value, done } = gen.next();
        if(done) break outer;
""", """      let starved = false;
      while(performance.now() - t0 < SLICE_MS){
        const nx = src.next();
        if(nx === null){ starved = true; break; }
        const { value, done } = nx;
        if(done) break outer;
""", 'replay next')
src = rep(src, """      await new Promise(res => setTimeout(res, 0));
    }
    try { gen.return(); } catch(e){}
""", """      if(starved) await src.wait(100); else await new Promise(res => setTimeout(res, 0));
    }
    src.stop();
""", 'replay stop')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
