// UI checks for the solver limits (max region amount / size), the progress bar and their persistence.
// Loads the real HTML in jsdom. Usage: node ui_test_limits.js path/to/app.html
const fs = require('fs');
const { JSDOM } = require('jsdom');
const file = process.argv[2] || '../glimmith_solver_V1.0.19.html';
let pass = 0, fail = 0;
const check = (name, cond, extra) => { if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(file, 'utf8');

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
  await sleep(300);
  const $ = id => window.document.getElementById(id);
  $('exactOnlyChk').checked = true;   // these suites exercise the exact solver, which is now behind the 'Exact solver only' tuning option
  const api = {
    window, errors, $,
    setLimits: (n, s) => { $('maxRegionCountInput').value = n; $('maxRegionSizeInput').value = s; $('maxRegionCountInput').dispatchEvent(new window.Event('input', { bubbles:true })); },
    resize: async (w, h) => { $('puzzleW').value = w; $('puzzleH').value = h; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input')); await sleep(20); },
    addRule: async (type, val) => { $('ruleType').value = type; if(val != null) $('ruleValue').value = val; $('ruleType').dispatchEvent(new window.Event('change')); $('addRuleBtn').click(); await sleep(10); },
    solve: async () => { $('solveBtn').click(); for(let i = 0; i < 200; i++){ await sleep(50); if(!/Searching/.test($('solverStatus').textContent)) break; } return $('solverStatus').textContent; },
    raw: () => JSON.parse($('debugJson').textContent),
  };
  return api;
}

(async () => {
  const store = new Map();
  let A = await boot(store);
  const { $ } = A;
  check('page loaded without script errors', A.errors.length === 0, A.errors);
  check('both limit boxes exist and start empty', $('maxRegionCountInput').value === '' && $('maxRegionSizeInput').value === '');
  check('labels use the requested names', /Max region amount/.test(html) && /Max region size/.test(html));
  check('progress bar starts hidden', $('solverProgress').hidden === true);

  // ---------- results with and without limits (6x1 strip, size 2..3 -> 2+2+2 or 3+3) ----------
  await A.resize(6, 1);
  await A.addRule('minimum', 2); await A.addRule('maximum', 3);
  let st = await A.solve();
  check('no limits: Not unique', /Not unique/.test(st), st);

  A.setLimits(2, '');
  st = await A.solve();
  check('amount 2 -> Unique, with the assumption spelled out', /^Unique/.test(st) && /assumes your limits \(max region amount 2\) are correct/.test(st), st);
  check('a solution card is drawn for the unique result', $('solverResults').querySelectorAll('svg').length === 1);

  A.setLimits(1, '');
  st = await A.solve();
  check('amount 1 -> Impossible, flagged as limit-dependent', /^Impossible/.test(st) && /Under your limits \(max region amount 1\) only/.test(st), st);

  A.setLimits('', 2);
  st = await A.solve();
  check('size 2 -> Unique (2+2+2), assumption spelled out', /^Unique/.test(st) && /max region size 2/.test(st), st);

  A.setLimits('', 1);
  st = await A.solve();
  check('size 1 under min 2 -> Impossible, flagged', /^Impossible/.test(st) && /max region size 1/.test(st), st);

  A.setLimits(3, 3);
  st = await A.solve();
  check('limits that cut nothing: Not unique, NO caveat (a found pair is always real)', /^Not unique/.test(st) && !/assum|Under your limits/.test(st), st);

  // v47: the step-by-step viewer replaces "common structure" (it replays the unlimited reasoning; the verdict above already carries the limits)
  check('step-by-step button offered after Not unique', $('stepsBtn').style.display !== 'none' && !$('commonStructureBtn'));
  $('stepsBtn').click();
  for(let i = 0; i < 100 && $('stepsViewer').hidden; i++) await sleep(50);
  check('step viewer opens after a limited Not unique run', $('stepsViewer').hidden === false && /Start/.test($('stepsCounter').textContent), $('stepsCounter').textContent);
  $('stepsLast').click();
  check('its last step shows the two tilings', /Not unique/.test($('stepsKicker').textContent) && $('stepsTabs').querySelectorAll('button').length === 2, $('stepsKicker').textContent);
  $('stepsClose').click();

  // ---------- invalid entries are refused, not ignored ----------
  A.setLimits(1, ''); await A.solve();              // leaves a distinctive 'Impossible ... limits' status behind
  const before = $('solverStatus').textContent;
  check('setup: status before the invalid entries is the limit-dependent Impossible', /^Impossible/.test(before), before);
  for(const bad of ['0', '2.5', '-3']){
    A.setLimits(bad, '');
    $('solveBtn').click(); await sleep(60);
    check(`amount "${bad}" refused: status untouched, box flagged, solver not stuck`,
      $('solverStatus').textContent === before && $('maxRegionCountInput').getAttribute('aria-invalid') === 'true' && !$('solveBtn').disabled && !$('maxRegionCountInput').disabled,
      { status: $('solverStatus').textContent });
  }
  A.setLimits('', 'x7');   // browsers drop junk in number boxes; jsdom keeps '' -> treated as empty
  check('typing into a flagged box clears the flag', (() => { A.setLimits(5, ''); return !$('maxRegionCountInput').hasAttribute('aria-invalid'); })());

  // ---------- persistence ----------
  A.setLimits(4, 5);
  await sleep(700);
  check('limits are saved', store.has('glimmith:solverlimits:v1') && JSON.parse(store.get('glimmith:solverlimits:v1')).maxRegions === '4' && JSON.parse(store.get('glimmith:solverlimits:v1')).maxRegionSize === '5', store.get('glimmith:solverlimits:v1'));
  check('Raw state shows the limits for bug reports', A.raw().solverLimits && A.raw().solverLimits.maxRegions === '4' && A.raw().solverLimits.maxRegionSize === '5', A.raw().solverLimits);
  check('no script errors so far', A.errors.length === 0, A.errors);

  const B = await boot(store);
  check('reload restores both limits', B.$('maxRegionCountInput').value === '4' && B.$('maxRegionSizeInput').value === '5');
  const junk = new Map(store); junk.set('glimmith:solverlimits:v1', JSON.stringify({ maxRegions: '-2', maxRegionSize: 'abc' }));
  const C = await boot(junk);
  check('junk in storage is ignored on load', C.$('maxRegionCountInput').value === '' && C.$('maxRegionSizeInput').value === '' && C.errors.length === 0, C.errors);
  const D0 = await boot(new Map());
  check('an old save without limits loads fine', D0.$('maxRegionCountInput').value === '' && D0.errors.length === 0);

  // ---------- live progress on a long search (6x6, size 3..5, Mismatch + Mingle Area: no answer within 20 s) ----------
  const P = await boot(new Map());
  await P.resize(6, 6);
  await P.addRule('minimum', 3); await P.addRule('maximum', 5); await P.addRule('mismatch'); await P.addRule('minglearea');
  P.$('solveBtn').click();
  await sleep(2600);
  let status = P.$('solverStatus').textContent;
  const m1 = status.match(/~(\d+)% \(estimate\)/);
  check('while running: status shows an estimated percentage', !!m1, status);
  check('while running: status shows nodes and elapsed time', /nodes explored/.test(status) && /\d+\.\ds/.test(status), status);
  check('while running: progress bar visible and determinate', P.$('solverProgress').hidden === false && !P.$('solverProgress').classList.contains('indeterminate'));
  check('bar width matches the percentage', m1 && P.$('solverProgressFill').style.width === m1[1] + '%', P.$('solverProgressFill').style.width);
  check('while running: Cancel visible, Check disabled, limit boxes locked', P.$('cancelSolveBtn').style.display !== 'none' && P.$('solveBtn').disabled && P.$('maxRegionCountInput').disabled && P.$('maxRegionSizeInput').disabled);
  await sleep(1500);
  const m2 = P.$('solverStatus').textContent.match(/~(\d+)% \(estimate\)/);
  check('percentage never goes backwards', m1 && m2 && Number(m2[1]) >= Number(m1[1]), [m1 && m1[1], m2 && m2[1]]);
  check('percentage never claims 100% mid-search', Number(m2[1]) <= 99);
  P.$('cancelSolveBtn').click();
  await sleep(400);
  status = P.$('solverStatus').textContent;
  check('Cancel reports where it stopped', /^Cancelled after/.test(status) && /at about \d+% of the estimated search/.test(status), status);
  check('after Cancel: bar hidden, controls restored', P.$('solverProgress').hidden === true && !P.$('solveBtn').disabled && !P.$('maxRegionCountInput').disabled && P.$('cancelSolveBtn').style.display === 'none');

  // the same hopeless search is settled by a tight limit
  P.setLimits('', 4);
  const t0 = Date.now();
  status = await P.solve();
  check('size limit 4 settles it: Impossible (limit-dependent) within seconds', /^Impossible/.test(status) && /max region size 4/.test(status) && Date.now() - t0 < 5000, { status, ms: Date.now() - t0 });
  check('bar hidden after finishing', P.$('solverProgress').hidden === true);

  // ---------- no percentage when the first piece has too many options ----------
  const W = await boot(new Map());
  await W.resize(6, 6);
  await W.addRule('minimum', 3); await W.addRule('maximum', 36); await W.addRule('match'); await W.addRule('mismatch'); await W.addRule('nonboxy');   // Match + Mismatch = one piece = the whole 6x6 board, which is a rectangle: impossible, but only the search can tell (v25 settles the plain version of this - max 30 < 36 tiles - at once by counting)
  W.$('solveBtn').click();
  await sleep(2200);
  status = W.$('solverStatus').textContent;
  check('too-wide root: says why there is no percentage', /no percentage/.test(status) && !/~\d+%/.test(status), status);
  check('too-wide root: bar is indeterminate', W.$('solverProgress').classList.contains('indeterminate'));
  W.$('cancelSolveBtn').click(); await sleep(400);
  check('cancel without an estimate has no percentage note', /^Cancelled after/.test(W.$('solverStatus').textContent) && !/at about/.test(W.$('solverStatus').textContent), W.$('solverStatus').textContent);

  for(const [n, x] of [['A', A], ['B', B], ['P', P], ['W', W]]) check(`no script errors (${n})`, x.errors.length === 0, x.errors);
  console.log(`\nUI limits: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
