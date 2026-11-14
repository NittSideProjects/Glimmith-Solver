// V1.0.17: the experimental guess layer is gone. A puzzle with a compass shows no guess button, no red legend, solves as usual,
// and neither the page nor its embedded solver holds anything of the layer.
// node tests/page/ui_test_noguess_V1.0.17.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.19.html', pz = path.join(__dirname, '..', '..', 'fixtures', 'compass_V1.0.17.glimmith.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
(async () => {
  const html = fs.readFileSync(file, 'utf8');
  const code = html.split('\n').filter(l => !/RULE_EXAMPLES = |SOLVER CORE \(pure/.test(l)).join('\n');     // not the data line, not the version history
  for(const w of ['guessBtn', 'guessRow', 'runGuessLayer', 'guessLayer', 'guessSolve', 'sketchRun', 'jointAttempt', 'cmpSampler', 'dedAddRed', 'redEls', 'swatch-dedred', 'buffer guess'])
    check('nothing left of the layer: ' + w, !code.includes(w));
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win){ win.TextDecoder = TextDecoder; win.TextEncoder = TextEncoder; win.HTMLCanvasElement.prototype.getContext = () => null; } });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; }, list: async () => ({ keys: [...store.keys()] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const doc = window.document, $ = id => doc.getElementById(id);
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'c.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  let opt = null; for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => /Compass test/.test(o.textContent)); }
  check('the compass puzzle is imported', !!opt);
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  check('no guess button with a compass on the board', !$('guessBtn') && !$('guessRow') && ![...doc.querySelectorAll('button')].some(b => /guess/i.test(b.textContent)));
  check('the legend has no guess entries', !/guess/i.test($('deduceLegend').textContent));
  $('solveBtn').click();
  for(let i = 0; i < 600; i++){ await sleep(50); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('the puzzle solves', /^(Unique|Not unique)/.test($('solverStatus').textContent), $('solverStatus').textContent.slice(0, 80));
  check('the solve button works again afterwards', !$('solveBtn').disabled);
  $('stepsBtn').click(); for(let i = 0; i < 400; i++){ await sleep(50); if(!$('stepsViewer').hidden) break; }
  check('the step view opens', !$('stepsViewer').hidden);
  check('no script errors', errors.length === 0, errors);
  console.log(`no guess layer V1.0.17 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
