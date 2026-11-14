// V1.0.4 / V1.0.5 page: a workshop Wally puzzle (game files + metadata, as Fast import / Import puzzles read them) comes in with Wally on, a
// workshop puzzle that does not name Wally does not; Doubt & Certainty then gets 116+ edges before the final solve; no test edge is drawn.
// node ui_test_wallyimport_V1.0.5.js [page]
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.18.html';
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
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync('workshop_wally/workshop_sample.zip')], 'workshop_sample.zip')], configurable: true }); inp.dispatchEvent(new window.Event('change'));
  for(let i = 0; i < 200; i++){ await sleep(50); if($('importBtn').textContent === 'Import puzzles…' && !$('importBtn').disabled) break; }
  await sleep(100);
  const pop = $('assumedPop');
  check('pop-up after the import names the custom rules (V1.0.5)', !!pop && /Doubt/.test(pop.textContent) && /Wally/.test(pop.textContent) && /Hetero Test: Heterogeneous/.test(pop.textContent), pop && pop.textContent);
  check('Links are not read from a description', !!pop && !/Links/.test(pop.textContent.replace(/Also uses Links/, '')));
  if(pop){ $('assumedPopOk').click(); await sleep(50); }
  check('OK closes the pop-up', !$('assumedPop'));
  const sel = $('puzzleSelect'), pickP = re => { const o = [...sel.options].find(o => re.test(o.textContent)); if(o){ sel.value = o.value; sel.dispatchEvent(new window.Event('change')); } return !!o; };
  check('Doubt & Certainty imported', pickP(/Doubt/)); await sleep(100);
  check('Doubt & Certainty: Wally on (named in its description)', JSON.parse($('debugJson').textContent).sizeRules.wally === true);
  check('Hetero Test: Heterogeneous on', pickP(/Hetero Test/) && (await sleep(100), JSON.parse($('debugJson').textContent).sizeRules.heterogeneous === true));
  const other = [...sel.options].find(o => !/Doubt|Exemple|My puzzle|Hetero Test/.test(o.textContent));
  check('the other workshop puzzle imported', !!other);
  if(other){ sel.value = other.value; sel.dispatchEvent(new window.Event('change')); await sleep(100); check('the other one: Wally off', JSON.parse($('debugJson').textContent).sizeRules.wally !== true, other.textContent); }
  pickP(/Doubt/); await sleep(100);
  $('solveBtn').click();
  let probeDrawn = 0;
  const decided = () => { const t = $('solverStatus').textContent, a = /(\d+) of (\d+) edges decided/.exec(t), b = /\((\d+) edges left open\)/.exec(t); return a ? +a[1] : b ? 206 - +b[1] : 0; };
  for(let i = 0; i < 600 && !/^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent); i++){ await sleep(100); if(doc.querySelector('.ded-probe')) probeDrawn++; }
  for(let i = 0; i < 20; i++){ await sleep(100); if(doc.querySelector('.ded-probe')) probeDrawn++; }
  check('Doubt & Certainty solved: unique (Wally used; V1.0.5 gemini-anchor)', /^Unique/.test($('solverStatus').textContent), $('solverStatus').textContent.slice(0, 160));
  check('no test edge drawn while solving (no blinking)', probeDrawn === 0, probeDrawn);
  $('stepsBtn').click();
  for(let i = 0; i < 300; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const nSteps = +((/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1]); const titles = new Set();
  for(let i = 1; i < nSteps; i++){ $('stepsNext').click(); await sleep(2); titles.add($('stepsCapTitle').textContent); }
  check('step viewer works on the solved puzzle (Gemini steps among them)', nSteps > 10 && [...titles].some(t => /Gemini/.test(t)), [...titles]);
  if(process.env.SHOW) console.log(nSteps, 'steps', [...titles].join(' | '));
  check('no script errors', errors.length === 0, errors);
  console.log(`wallyimport V1.0.5 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
