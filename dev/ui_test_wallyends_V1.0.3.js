// V1.0.3 page: Gems O'Plenty with its two open roses made dead ends (hand walls from the stored solution): wally-ends solves it with no search.
// node ui_test_wallyends_V1.0.3.js [page]
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.6.html', pz = process.argv[3] || 'workshop_wally/gems_all_roses_dead_ends.glimmith.json';
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
  await give([new window.File([fs.readFileSync(pz)], 'dc.glimmith.json')]);
  const sel = $('puzzleSelect'), opt = [...sel.options].find(o => /all roses dead ends/.test(o.textContent));
  check('puzzle imported', !!opt);
  sel.value = opt.value; sel.dispatchEvent(new window.Event('change')); await sleep(100);
  check('Wally on', JSON.parse($('debugJson').textContent).sizeRules.wally === true);
  // the rule info: Wally entry has the gemini-line point
  check('rule info: Wally explains two ends per piece', /Two ends per piece\./.test(($('impInfo_wally') || {}).textContent || ''));
  $('solveBtn').click();
  for(let i = 0; i < 900; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('solved: unique', /^Unique/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('stepsBtn').click();
  for(let i = 0; i < 300; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const n = +((/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1]); let seen = 0;
  for(let i = 1; i < n; i++){ $('stepsNext').click(); await sleep(2); if(/Wally: two ends per piece/.test($('stepsCapTitle').textContent)) seen++; }
  check('step viewer shows "Wally: two ends per piece"', seen > 0, seen);
  if(process.env.SHOW) console.log('steps', n, 'two-ends steps', seen);
  check('no script errors', errors.length === 0, errors);
  console.log(`wallyends V1.0.3 UI: ${pass} passed, ${fail} failed `);
  process.exit(fail ? 1 : 0);
})();
