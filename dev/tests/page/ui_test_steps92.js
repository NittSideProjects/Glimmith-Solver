// v92 page: big steps are split (at most one finished piece per step), and a letter key over the grid never goes to a dropdown.
// node ui_test_steps92.js ../glimmith_solver_V1.0.21.html /path/to/The-Wall-of-Opportunity.glimmith.json
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.21.html', pz = process.argv[3];
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
(async () => {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win){ win.TextDecoder = TextDecoder; win.TextEncoder = TextEncoder; win.HTMLCanvasElement.prototype.getContext = () => null; } });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; }, list: async () => ({ keys: [...store.keys()] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const doc = window.document, $ = id => doc.getElementById(id);
  const give = async files => { const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: files, configurable: true }); inp.dispatchEvent(new window.Event('change')); for(let i=0;i<200;i++){ await sleep(50); if($('importBtn').textContent === 'Import puzzles…' && !$('importBtn').disabled) break; } await sleep(50); };
  await give([new window.File([fs.readFileSync(pz)], 'opp.glimmith.json')]);
  const sel = $('puzzleSelect'), opt = [...sel.options].find(o => /Opportunity/.test(o.textContent));
  check('puzzle imported', !!opt);
  sel.value = opt.value; sel.dispatchEvent(new window.Event('change')); await sleep(100);
  // letter over the grid while the dropdown has focus
  sel.focus();
  check('dropdown has the focus', doc.activeElement === sel);
  const raw = () => JSON.parse($('debugJson').textContent);
  const nPoly = raw().puzzle.polyominoes.length;
  $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointerenter', { bubbles:false }));
  $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointermove', { clientX: 42 * 0.5, clientY: 42 * 0.5, bubbles:true }));
  check('pointer over the grid takes the focus off the dropdown', doc.activeElement !== sel);
  sel.focus();
  const ev = new window.KeyboardEvent('keydown', { key:'p', bubbles:true, cancelable:true }); sel.dispatchEvent(ev);
  check('P typed while the dropdown still has focus (pointer over grid): not taken by the dropdown', ev.defaultPrevented && doc.activeElement !== sel && sel.value === opt.value);
  await sleep(50);
  check('same puzzle still loaded', /Opportunity/.test(sel.options[sel.selectedIndex].textContent));
  // steps
  $('solveBtn').click();
  for(let i = 0; i < 600; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('solved: unique', /^Unique/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('stepsBtn').click();
  for(let i = 0; i < 600; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  check('steps viewer open', !$('stepsViewer').hidden);
  const counter = $('stepsCounter').textContent, n = +(/(\d+) step/.exec(counter) || [0, 0])[1];
  check('more than one step now (was 1 + result)', n > 3, counter);
  let parts = 0, maxNew = 0, prevClosed = 0;
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(10);
    const title = doc.querySelector('#stepsViewer').textContent;
    if(/part \d+ of \d+/.test(title)) parts++;
    if(process.env.SHOW) console.log(i, $('stepsCapTitle').textContent, '|', $('stepsCapMeta').textContent);
  }
  check('split parts shown with "part k of n"', parts >= 2, parts);
  check('no script errors', errors.length === 0, errors);
  console.log(`steps92 UI: ${pass} passed, ${fail} failed (steps: ${n})`);
  process.exit(fail ? 1 : 0);
})();
