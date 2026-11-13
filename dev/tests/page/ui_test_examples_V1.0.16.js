// V1.0.13: rule examples (tiny boards, one mechanic each). "Show all examples" (bottom of the page) draws every example; a rule step of the step view has a
// "Show example" button that opens its example; Escape and Close shut the pop-up.
// node ui_test_examples_V1.0.16.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.16.html', pz = path.join(__dirname, '..', '..', 'fixtures', 'colors_V1.0.6.glimmith.json');
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
  const exData = nEx ? JSON.parse(nEx.replace(/<\\\//g, '</')) : {};
  const boards = keys.reduce((n, k) => n + exData[k].x.length, 0);
  check('every case of every example is drawn', doc.querySelectorAll('#examplePop .ex-case > svg').length === boards, { drawn: doc.querySelectorAll('#examplePop .ex-case > svg').length, boards });
  check('each card has a title and a one-line explanation', [...cards].every(c => c.querySelector('.ex-title').textContent && c.querySelector('.ex-text').textContent.length > 20 && c.querySelector('.ex-text').textContent.length < 190));
  check('no card shows an internal rule name', [...doc.querySelectorAll('#examplePop .ex-title')].every(t => !/Rule: |^\d+\. [a-z]+-[a-z]+/.test(t.textContent)));
  check('every board outlines the edges its step decides', [...doc.querySelectorAll('#examplePop .ex-case > svg')].every(s => s.querySelector('.ded-new') || s.closest('.ex-card').querySelector('.ex-title').textContent.match(/one piece|connect/i)));
  const nums = [...doc.querySelectorAll('#examplePop .ex-num')].map(n => n.textContent);                 // V1.0.14
  check('every board has its own number (rule.board)', nums.length === boards && new Set(nums).size === boards && nums.every(n => /^\d+\.\d+$/.test(n)), nums.slice(0, 5));
  check('every rule title starts with its number, 1 to N in order', [...doc.querySelectorAll('#examplePop .ex-card > .ex-title')].every((t, i) => t.textContent.startsWith((i + 1) + '. ')));
  check('no list of what is on the board, no step text', !doc.querySelector('#examplePop .ex-has') && !doc.querySelector('#examplePop .ex-step'));
  // the data: tiny boards, one clue per tile, few mechanics
  const CLUES = ['roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses'];
  const all = keys.flatMap(k => exData[k].x.map(c => [k, c]));
  // V1.0.15: curated cases (a chosen step, earlier edges left out) and the word "polyomino"
  check('some examples show a chosen step, some leave earlier edges out', all.some(([, c]) => c.s) && all.some(([, c]) => c.h));
  check('nothing says "stamp"', [...cards].every(c => !/stamp/i.test(c.querySelector('.ex-title').textContent + c.querySelector('.ex-text').textContent)));
  // V1.0.16: the Minimum variants show the example of the plain rule
  const alias = JSON.parse((html.match(/const EXAMPLE_ALIAS = (\{.*?\});/) || [0, '{}'])[1]);
  check('Forced growth (Minimum) and Reach (Minimum) borrow an example', alias['min-grow'] === 'grow' && alias['min-reach'] === 'reach' && !exData['min-grow'] && !exData['min-reach'] && !!exData.grow && !!exData.reach, alias);
  check('a case can drop the piece colours', all.some(([, c]) => c.c));
  check('boards have at most 13 tiles', all.every(([, c]) => c.p.active.flat().filter(Boolean).length <= 13), all.filter(([, c]) => c.p.active.flat().filter(Boolean).length > 13).map(x => x[0]));
  check('one clue per tile, as in the game', all.every(([, c]) => { const ks = CLUES.flatMap(f => (c.p[f] || []).map(([k]) => k)); return new Set(ks).size === ks.length; }));
  const mech = c => Object.keys(c.r || {}).length + (c.b ? 1 : 0) + (c.n ? 1 : 0) + ['roses', 'polyominoes', 'palisades', 'compasses', 'watchtowers'].filter(f => c.p[f]).length
    + new Set((c.p.walls || []).map(([, t]) => /^diff/.test(t) ? 'diff' : t === 'gt' ? 'lt' : t).filter(t => t !== 'wall')).size;
  check('an example uses one or two mechanics at most (area numbers and plain walls are free)', all.every(([, c]) => mech(c) <= 2), all.filter(([, c]) => mech(c) > 2).map(x => x[0]));
  const named = [...doc.querySelectorAll('#examplePop .ex-case')].filter(c => c.querySelector('.ex-names')).length;
  check('rules that are on, the shape bank and the Omits are named under their board', named === all.filter(([, c]) => c.r || c.b || c.n).length, named);
  check('bank shapes are drawn', all.filter(([, c]) => c.b).length === [...doc.querySelectorAll('#examplePop .ex-names')].filter(n => /Shape bank/.test(n.textContent) && n.querySelector('.ex-shapes svg')).length);
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
      check('the step button opens its example', !!$('examplePop') && doc.querySelectorAll('#examplePop .ex-case > svg').length >= 1 && $('examplePop').textContent.includes(title) && /^\d+\. /.test(doc.querySelector('#examplePop h3').textContent), title);
      $('examplePopClose').click();
      check('Close shuts it', !$('examplePop'));
    }
  }
  check('rule steps show the button', shown > 0, shown);
  $('stepsLast').click(); await sleep(20);
  check('no example button on the result step', $('stepsExampleBtn').hidden);
  check('no script errors', errors.length === 0, errors);
  console.log(`examples V1.0.16 UI: ${pass} passed, ${fail} failed (examples ${keys.length}, steps with the button ${shown} of ${n - 1})`);
  process.exit(fail ? 1 : 0);
})();
