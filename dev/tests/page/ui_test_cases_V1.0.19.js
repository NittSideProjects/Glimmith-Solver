// V1.0.19: "Show cases" on the proofs by contradiction of the step view.
// node tests/page/ui_test_cases_V1.0.19.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.19.html', pz = path.join(__dirname, '..', '..', 'fixtures', 'colors_V1.0.6.glimmith.json');
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
  check('the button sits beside "Show example"', !!$('stepsCasesBtn') && $('stepsCasesBtn').parentNode === $('stepsExampleBtn').parentNode && $('stepsCasesBtn').textContent === 'Show cases');
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'c.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  let opt = null; for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => /Colour test/.test(o.textContent)); }
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  $('stepsBtn').click(); for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  check('no cases button on the start step', $('stepsCasesBtn').hidden);
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  let withCases = 0, ruleWith = 0, opened = 0;
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(5);
    const tried = /trying the other way|by search/i.test($('stepsViewer').textContent.slice(0, 4000)) && /Checked by/.test(doc.querySelector('.steps-kicker') ? doc.querySelector('.steps-kicker').textContent : '');
    if($('stepsCasesBtn').hidden){ if(tried) check('a step checked by trying the other way has the button', false, i); continue; }
    withCases++;
    if(!tried) ruleWith++;
    if(opened >= 2) continue;
    opened++;
    const title = $('stepsCapTitle').textContent;
    $('stepsCasesBtn').click(); await sleep(30);
    const pop = $('examplePop');
    check(`step ${i}: the pop-up opens`, !!pop && /What the solver tried/.test(pop.querySelector('h3').textContent));
    const cards = pop ? pop.querySelectorAll('.ex-card') : [];
    check(`step ${i}: at least one case, each with a board`, cards.length >= 1 && [...cards].every(c => c.querySelector('svg')), cards.length);
    check(`step ${i}: the tried value is marked on the board`, [...cards].every(c => c.querySelector('svg .ded-probe')));
    check(`step ${i}: what the rules then decide is outlined and listed`, [...cards].every(c => c.querySelector('svg .ded-new') && c.querySelectorAll('.case-list li').length >= 1));
    check(`step ${i}: the case says what was tried`, [...cards].every(c => /^(Case \d+ of \d+\. )?Tried: /.test(c.querySelector('.case-tried').textContent)));
    check(`step ${i}: the case says why it fails`, [...cards].every(c => /This fails/.test(c.querySelector('.case-fail').textContent) && c.querySelector('.case-fail').textContent.length > 25), [...cards].map(c => c.querySelector('.case-fail').textContent));
    check(`step ${i}: no internal rule name in the list`, [...pop.querySelectorAll('.case-list li')].every(li => !/^[a-z]+(-[a-z]+)+:/.test(li.textContent)), [...pop.querySelectorAll('.case-list li')].map(li => li.textContent));
    check(`step ${i}: the step view behind is unchanged`, $('stepsCapTitle').textContent === title);
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    check(`step ${i}: Escape closes it`, !$('examplePop'));
  }
  check('some steps have cases', withCases >= 3, withCases);
  check('rule steps have no cases button', ruleWith === 0, ruleWith);
  $('stepsLast').click(); await sleep(20);
  check('no cases button on the result step', $('stepsCasesBtn').hidden);
  check('no script errors', errors.length === 0, errors);
  console.log(`cases V1.0.19 UI: ${pass} passed, ${fail} failed (steps ${n - 1}, with cases ${withCases})`);
  process.exit(fail ? 1 : 0);
})();
