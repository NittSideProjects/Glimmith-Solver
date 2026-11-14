// V1.0.1 page: "Doubt & Certainty" (10x12, Wally): the solver finds the gemini-line step (the 4-line under the gemini wall grows by one).
// node ui_test_wallyline_V1.0.1.js ../glimmith_solver_V1.0.18.html /path/to/Doubt-Certainty-10x12.glimmith.json
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.18.html', pz = process.argv[3] || 'user_puzzles/Doubt-Certainty-10x12.glimmith.json';
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
  const sel = $('puzzleSelect'), opt = [...sel.options].find(o => /Doubt/.test(o.textContent));
  check('puzzle imported', !!opt);
  sel.value = opt.value; sel.dispatchEvent(new window.Event('change')); await sleep(100);
  check('Wally on', JSON.parse($('debugJson').textContent).sizeRules.wally === true);
  // the rule info: Wally entry has the gemini-line point
  check('rule info: Wally explains Gemini lines', /Gemini lines\./.test(($('impInfo_wally') || {}).textContent || ''));
  $('solveBtn').click();
  const decided = () => { const t = $('solverStatus').textContent, a = /(\d+) of (\d+) edges decided/.exec(t), b = /\((\d+) edges left open\)/.exec(t);
    return a ? +a[1] : b ? 206 - +b[1] : 0; };                                  // 206 open edges at the start
  for(let i = 0; i < 600 && decided() < 116 && !/edges left open/.test($('solverStatus').textContent); i++) await sleep(100);
  check('the line step is found (V1 stops at 113 edges before its search)', decided() >= 116, $('solverStatus').textContent);
  $('cancelSolveBtn').click();
  for(let i = 0; i < 100 && $('solveBtn').disabled; i++) await sleep(100);
  await sleep(200);
  let seen = false;
  if($('stepsBtn').style.display !== 'none' && !$('stepsBtn').disabled){
    $('stepsBtn').click();
    for(let i = 0; i < 300; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
    const n = +((/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1]);
    if(process.env.SHOW) console.log('viewer:', $('stepsViewer').hidden, $('stepsCounter').textContent, $('solverStatus').textContent.slice(0, 120));
    for(let i = 1; i < n && !seen; i++){ $('stepsNext').click(); await sleep(5); if(/Wally \+ Gemini/.test($('stepsCapTitle').textContent)){ seen = true; if(process.env.SHOW) console.log(i, $('stepsCapTitle').textContent, '|', $('stepsViewer').textContent.slice(0, 600)); } }
    check('step viewer shows "Wally + Gemini: lines of the same length"', seen);
  } else console.log('(no step viewer after Cancel: step text checked in the table only)');
  check('step text for wally-line in the page', fs.readFileSync(file, 'utf8').includes("'wally-line': ['Wally + Gemini: lines of the same length'"));
  check('no script errors', errors.length === 0, errors);
  console.log(`wallyline V1.0.1 UI: ${pass} passed, ${fail} failed `);
  process.exit(fail ? 1 : 0);
})();
