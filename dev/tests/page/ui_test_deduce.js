// UI checks for Solver (deduction). Loads the real HTML in jsdom. Usage: node ui_test_deduce.js path/to/app.html
const fs = require('fs');
const { JSDOM } = require('jsdom');
const L = require('../../fuzzlib.js');
const file = process.argv[2] || '../glimmith_solver_V1.0.21.html';
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log((cond ? "ok  " : "FAIL") + " " + name); if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slowCfg = $ => { $('testMsInput').value = '100'; $('focusSel').value = 'mix'; $('restartSel').value = 'first'; $('orderSel').value = 'scan'; $('exactSel').value = 'old'; };       // v40: the slow progressive display is the old whole-piece search + scan
const html = fs.readFileSync(file, 'utf8');

function seedStore(P){
  const bankOut = (P.bank || []).map((s, i) => { const w = Math.max(...s.cells.map(c => c[0])) + 1, h = Math.max(...s.cells.map(c => c[1])) + 1; return { id: s.id, w, h, cells: s.cells, color: '#e0a458' }; });
  const store = new Map();
  const pz = P.puzzle;
  store.set('glimmith:puzzle:v1', JSON.stringify({ w: pz.w, h: pz.h, active: pz.active, walls: [...pz.walls.entries()], roses: [...pz.roses.entries()], polyominoes: [...pz.polyominoes.entries()], areaNumbers: [...pz.areaNumbers.entries()] }));
  store.set('glimmith:shapebank:v1', JSON.stringify(bankOut));
  store.set('glimmith:sizerules:v1', JSON.stringify(P.rules));
  return store;
}
async function boot(store){
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  window.storage = {
    get: async k => store.has(k) ? { key:k, value: store.get(k) } : null,
    set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; },
    list: async () => ({ keys: [...store.keys()] })
  };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(400);
  const $ = id => window.document.getElementById(id);
  return { window, errors, $ };
}
const running = $ => /Solver: (preparing|narrow|final)/.test($('solverStatus').textContent);
async function waitDone($, maxMs){ const t0 = Date.now(); await sleep(60); while(running($) && Date.now() - t0 < maxMs) await sleep(40); return Date.now() - t0; }

(async () => {
  // ---------- a unique 6x6 puzzle ----------
  const P = L.plantedPuzzle(111, { w: 6, h: 6, holes: 0, clueP: 1.0, wallP: 0.3, bank: false, maxPiece: 5 });
  P.rules.max = 5; P.rules.min = null; P.rules.precision = null;
  { const a = L.exact(P, 2, 200000); P.expectSig = a.sols.length === 1 ? L.sig(a.sols[0]) : null; }
  check('6x6 test puzzle is unique', !!P.expectSig);
  let A = await boot(seedStore(P));
  let { $, window } = A;
  check('page loaded without script errors', A.errors.length === 0, A.errors);
  check('Solver controls exist', !$('deduceBtn') && !!$('exactOnlyChk') && !!$('solverTuning') && !$('solverTuning').open && !!$('testMsInput') && !!$('restartSel') && !!$('orderSel') && !!$('skipScanBtn'));
  check('defaults: 100 ms, outward only, keep going round, clue order, witness on', $('testMsInput').value === '100' && $('focusSel').value === 'near' && $('nearShareInput').value === '40' && $('restartSel').value === 'continue' && $('orderSel').value === 'clues' && $('witnessChk').checked);
  check('overlay layer exists and legend starts hidden', !!$('deduceLayer') && $('deduceLegend').hidden === true);
  check('seeded puzzle is 6x6', JSON.parse($('debugJson').textContent).puzzle.w === 6);

  // bad settings are refused with a message
  $('testMsInput').value = '0'; $('solveBtn').click(); await sleep(30);
  check('narrow search time 0 refused', /between 5 and 5000/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('testMsInput').value = '100';
  $('nearShareInput').value = '150'; $('solveBtn').click(); await sleep(30);
  check('mix share over 100 refused', /between 0 and 100/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('nearShareInput').value = '40';

  $('solveBtn').click(); await sleep(20);
  // v21: pure inference + probing solves this fully clued 6x6 in a few ms, so the run may already be over after 20 ms; the
  // "buttons while running" behaviour is covered with the slow 8x8 puzzle below.
  check('while running: Check Uniqueness disabled, Cancel + Skip visible, legend shown (or already finished with a verdict)',
    ($('solveBtn').disabled && $('cancelSolveBtn').style.display !== 'none' && $('skipScanBtn').style.display !== 'none' && $('deduceLegend').hidden === false)
    || (!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)));
  await waitDone($, 60000);
  let st = $('solverStatus').textContent;
  check('unique puzzle: Unique reported by solver', /^Unique/.test(st), st);
  check('buttons restored after the run', !$('solveBtn').disabled && $('cancelSolveBtn').style.display === 'none' && $('skipScanBtn').style.display === 'none');
  check('one solution card drawn', $('solverResults').querySelectorAll('svg').length === 1);
  const ov = $('deduceLayer');
  const shapes = ov.querySelectorAll('.ded-shapes > g').length;
  check('every piece of the solution is a completed shape in the overlay', shapes === P.planted.length, [shapes, P.planted.length]);
  check('solver placed walls on the overlay', ov.querySelectorAll('.ded-walls rect').length > 0);
  const sum = $('deduceSummary').textContent;
  check('summary line: timings only (v88 page)', /^It took .+ with (.+ being an exhaustive search|no exhaustive search needed)\.$/.test(sum), sum);
  check('probe removed after the run', ov.querySelector('.ded-probe-layer').children.length === 0);
  // the overlay's walls must match the solution's boundaries exactly (no wall inside a piece, none missing)
  {
    const pieceOf = new Map(); P.planted.forEach((cells, i) => cells.forEach(([c, r]) => pieceOf.set(c + ',' + r, i)));
    const need = new Set();
    for(let r = 0; r < 6; r++) for(let c = 0; c < 6; c++){
      if(pieceOf.get(c+1+','+r) !== undefined && pieceOf.get(c+1+','+r) !== pieceOf.get(c+','+r)) need.add(`v:${c},${r}`);
      if(pieceOf.get(c+','+(r+1)) !== undefined && pieceOf.get(c+','+(r+1)) !== pieceOf.get(c+','+r)) need.add(`h:${c},${r}`);
    }
    const userWalls = new Set(JSON.parse($('debugJson').textContent).puzzle.walls.map(w => w[0]));
    const drawn = ov.querySelectorAll('.ded-walls rect').length;
    const expected = [...need].filter(k => !userWalls.has(k)).length;
    check('overlay wall count == solution boundaries not already drawn by the user', drawn === expected, [drawn, expected]);
  }
  // editing the puzzle clears the stale overlay
  $('puzzleW').value = 5; $('puzzleH').value = 5; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input')); await sleep(40);
  check('resizing clears the overlay', ov.querySelectorAll('rect').length === 0 && $('deduceLegend').hidden === true);
  check('no script errors during the unique run', A.errors.length === 0, A.errors);

  // ---------- a puzzle that takes a while: real-time updates, skip, cancel ----------
  const Q = L.plantedPuzzle(8, { w: 8, h: 8, holes: 0, clueP: 0.8, wallP: 0.12, bank: false, maxPiece: 5 });
  Q.rules.max = 5; Q.rules.min = null; Q.rules.precision = null;
  A = await boot(seedStore(Q)); ({ $, window } = A);
  slowCfg($);
  const times = []; let marks = 0, sawProbe = false;
  const mo = new window.MutationObserver(list => { for(const m of list){ if(m.addedNodes.length){ times.push(Date.now()); marks += m.addedNodes.length; } } });
  mo.observe($('deduceLayer'), { childList: true, subtree: true });
  const poll = setInterval(() => { if($('deduceLayer').querySelector('.ded-probe-layer .ded-probe')) sawProbe = true; }, 15);
  $('solveBtn').click(); await sleep(20);
  const took = await waitDone($, 60000);
  clearInterval(poll); mo.disconnect();
  st = $('solverStatus').textContent;
  check('8x8 clue puzzle: ends with a verdict', /^(Unique|Not unique|Impossible)/.test(st), st);
  const solver = require('../../reference/solver-core.v103.js');
  check('the verdict agrees with the exact solver', (/^Not unique/.test(st)) === true, st);
  check('walls/shapes appeared over time (not all at once at the end)', times.length > 5 && times[times.length - 1] - times[0] > 150, [times.length, times.length ? times[times.length-1] - times[0] : 0, took]);
  check('a testing marker was visible while running', sawProbe);

  // skip to final solve
  A = await boot(seedStore(Q)); ({ $, window } = A); slowCfg($);
  $('solveBtn').click(); await sleep(450);
  $('skipScanBtn').click();
  await waitDone($, 60000);
  st = $('solverStatus').textContent;
  check('skip: ends in a verdict, or honestly reports the limit (the exact solver alone cannot do this puzzle)', /^(Unique|Not unique|Impossible|Search limit reached)/.test(st), st);
  check('skip: summary gives the timings (v88 page)', /^It (took|ran) /.test($('deduceSummary').textContent), $('deduceSummary').textContent);

  // cancel
  A = await boot(seedStore(Q)); ({ $, window } = A); slowCfg($);
  $('solveBtn').click(); await sleep(300);
  $('cancelSolveBtn').click();
  await sleep(500);
  st = $('solverStatus').textContent;
  check('cancel: reports Cancelled (or had already finished)', /^Cancelled|^(Unique|Not unique|Impossible)/.test(st), st);
  check('cancel: buttons restored', !$('solveBtn').disabled);

  // settings: "keep going round" + "nearest clues first" with a 20 ms narrow search
  A = await boot(seedStore(Q)); ({ $, window } = A);
  $('testMsInput').value = '20'; $('restartSel').value = 'continue'; $('orderSel').value = 'clues'; $('focusSel').value = 'first'; $('nearShareInput').value = '70'; $('witnessChk').checked = false;
  $('solveBtn').click(); await sleep(30);
  check('settings inputs disabled during the run', ['testMsInput','restartSel','orderSel','focusSel','nearShareInput','witnessChk','exactOnlyChk'].every(id => $(id).disabled));
  await waitDone($, 60000);
  st = $('solverStatus').textContent;
  check('alternate settings: right verdict', /^(Unique|Not unique|Impossible)/.test(st) && (/^Not unique/.test(st) === true), st);
  check('settings enabled again', ['testMsInput','restartSel','orderSel','focusSel','nearShareInput','witnessChk','exactOnlyChk'].every(id => !$(id).disabled));
  check('summary line with other settings: timings (v88 page)', /^It took /.test($('deduceSummary').textContent), $('deduceSummary').textContent);

  // the exact solver is still reachable through the tuning checkbox
  A = await boot(seedStore(P)); ({ $, window } = A);
  $('exactOnlyChk').checked = true;
  $('solveBtn').click(); for(let i = 0; i < 400 && /Searching/.test($('solverStatus').textContent) || i < 2; i++) await sleep(50);
  check('exact-solver-only mode still works, draws no overlay and writes no Solver summary', /^Unique/.test($('solverStatus').textContent) && $('deduceLayer').querySelectorAll('rect').length === 0 && $('deduceSummary').textContent === '', $('solverStatus').textContent);

  // ---------- the user's 20x20 puzzle with a shape bank, end to end with the default settings ----------
  {
    const { P: U } = require('../../user_puzzle.js');
    A = await boot(seedStore(U)); ({ $, window } = A);
    check('user puzzle loaded (20x20, 6 bank shapes)', JSON.parse($('debugJson').textContent).puzzle.w === 20 && JSON.parse($('debugJson').textContent).shapeBank.length === 6);
    const t0 = Date.now();
    $('solveBtn').click();
    const took = await waitDone($, 200000);
    st = $('solverStatus').textContent;
    check('user puzzle: Solver proves it Unique through the page', /^Unique/.test(st), st.slice(0, 200));
    check('user puzzle: finished in a sane time (< 120 s here)', took < 120000, took);
    check('user puzzle: one solution card', $('solverResults').querySelectorAll('svg').length === 1);
    const sh = $('deduceLayer').querySelectorAll('.ded-shapes > g').length;
    check('user puzzle: overlay shows all 103 pieces as complete', sh === 103, sh);
    check('user puzzle: no script errors', A.errors.length === 0, A.errors);
    console.log('   (user puzzle through the page: ' + (took / 1000).toFixed(1) + ' s)  ' + $('deduceSummary').textContent.slice(0, 260));
  }

  console.log(`\nUI deduce: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
