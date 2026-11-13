// V1.0.12: rule examples. "Show all examples" (bottom of the page) draws every example; a rule step of the step view has a
// "Show example" button that opens its example; Escape and Close shut the pop-up.
// node ui_test_examples_V1.0.12.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.12.html', pz = path.join(__dirname, 'fixtures', 'colors_V1.0.6.glimmith.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
(async () => {
  const html = fs.readFileSync(file, 'utf8');
  const nEx = (html.match(/const RULE_EXAMPLES = (\{.*\});/) || [])[1];
  const keys = nEx ? Object.keys(JSON.parse(nEx.replace(/<\\\//g, '</'))) : [];
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
  check('the page has examples', keys.length >= 60, keys.length);
  check('"Show all examples" is in the rules footer', !!$('allExamplesBtn') && $('improvedFooter').contains($('allExamplesBtn')));
  $('allExamplesBtn').click();
  for(let i = 0; i < 100; i++){ await sleep(30); if(doc.querySelectorAll('#examplePop .ex-card').length >= keys.length) break; }
  const cards = doc.querySelectorAll('#examplePop .ex-card');
  check('every example is drawn', cards.length === keys.length, { cards: cards.length, keys: keys.length });
  check('each card has a board, a title and a text', [...cards].every(c => c.querySelector('svg') && c.querySelector('.ex-title').textContent && c.querySelector('.ex-text').textContent.length > 20));
  check('no card shows an internal rule name', [...doc.querySelectorAll('#examplePop .ex-title')].every(t => !/^Rule: /.test(t.textContent)));
  check('every board outlines the edges its step decides', [...cards].every(c => c.querySelector('svg .ded-new')));
  check('every card says what is in its puzzle', [...cards].every(c => c.querySelector('.ex-has') && /In this puzzle/i.test(c.querySelector('.ex-has').textContent)));
  const exData = nEx ? JSON.parse(nEx.replace(/<\\\//g, '</')) : {};
  const bankKeys = keys.filter(k => exData[k].b && exData[k].b.length);
  const bankCards = [...cards].filter(c => /Shape bank \(\d+\)/.test(c.querySelector('.ex-has').textContent));
  check('every example with a shape bank lists it and draws its shapes', bankCards.length === bankKeys.length && bankCards.every(c => c.querySelectorAll('.ex-shapes svg').length >= 1), { bankCards: bankCards.length, bankKeys: bankKeys.length });
  const rulesKeys = keys.filter(k => exData[k].r && Object.keys(exData[k].r).length);
  check('rules that are on are named with their meaning', [...cards].filter(c => /:\s+\S/.test(c.querySelector('.ex-has li') ? c.querySelector('.ex-has li').textContent : 'x: y')).length === cards.length, rulesKeys.length);
  window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('Escape closes the pop-up', !$('examplePop'));
  // a step with a rule
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'c.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  let opt = null; for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => /Colour test/.test(o.textContent)); }
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  $('stepsBtn').click(); for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  check('no example button on the start step', $('stepsExampleBtn').hidden);
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  let shown = 0, opened = false;
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(5);
    if($('stepsExampleBtn').hidden) continue;
    shown++;
    if(!opened){
      opened = true; const title = $('stepsCapTitle').textContent;
      $('stepsExampleBtn').click(); await sleep(20);
      check('the step button opens its example', !!$('examplePop') && doc.querySelectorAll('#examplePop svg').length === 1 && $('examplePop').textContent.includes(title), title);
      $('examplePopClose').click();
      check('Close shuts it', !$('examplePop'));
    }
  }
  check('rule steps show the button', shown > 0, shown);
  $('stepsLast').click(); await sleep(20);
  check('no example button on the result step', $('stepsExampleBtn').hidden);
  check('no script errors', errors.length === 0, errors);
  console.log(`examples V1.0.12 UI: ${pass} passed, ${fail} failed (examples ${keys.length}, steps with the button ${shown} of ${n - 1})`);
  process.exit(fail ? 1 : 0);
})();
