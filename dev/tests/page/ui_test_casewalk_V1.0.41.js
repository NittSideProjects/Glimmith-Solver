// V1.0.41: "Show more" in the contradiction viewer: a step-by-step of one case, from what was tried to the moment it fails.
// node tests/page/ui_test_casewalk_V1.0.41.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.41.html', pz = path.join(__dirname, '..', '..', 'fixtures', 'colors_V1.0.6.glimmith.json');
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
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'c.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  let opt = null; for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => /Colour test/.test(o.textContent)); }
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  $('stepsBtn').click(); for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  let walked = 0;
  for(let i = 1; i < n && walked < 2; i++){
    $('stepsNext').click(); await sleep(5);
    if($('stepsCasesBtn').hidden) continue;
    $('stepsCasesBtn').click(); await sleep(30);
    const pop = $('examplePop'), card = pop && [...pop.querySelectorAll('.ex-card')].find(c => /This fails/.test(c.querySelector('.case-fail').textContent));
    if(!card){ window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); continue; }
    walked++;
    const runs = card.querySelectorAll('.case-list li').length;
    const more = card.querySelector('button.case-more');
    check(`step ${i}: every failing case has a "Show more" button`, !!more && more.textContent === 'Show more');
    more.click(); await sleep(20);
    const walk = card.querySelector('.case-walk');
    check(`step ${i}: it opens a step-by-step inside the case`, !!walk && !walk.hidden && more.textContent === 'Show less');
    const cnt = () => walk.querySelector('.cw-count').textContent, title = () => walk.querySelector('.cw-title').textContent, [prevB, nextB] = walk.querySelectorAll('.cw-nav button');
    const total = +cnt().split(' / ')[1];
    check(`step ${i}: what was tried, one frame per rule run, then the impossible moment`, total === runs + 2 && cnt() === '1 / ' + total, [cnt(), runs]);
    check(`step ${i}: frame 1 shows what was tried, marked`, title() === 'What was tried' && !!walk.querySelector('svg .ded-probe') && !walk.querySelector('svg .ded-new') && prevB.disabled);
    const titles = [title()]; let outlined = true;
    for(let k = 1; k < total; k++){ nextB.click(); await sleep(5); titles.push(title()); if(k < total - 1 && !walk.querySelector('svg .ded-new')) outlined = false; }
    check(`step ${i}: each rule frame outlines what that rule decides`, outlined);
    check(`step ${i}: the rule frames have the rules' names, as in the list`, titles.slice(1, -1).every((t, k) => card.querySelectorAll('.case-list li')[k].textContent.startsWith(t + ':')), titles);
    check(`step ${i}: the last frame is the impossible moment, with the reason`, titles[titles.length - 1] === 'Impossible here' && /choice tried first is wrong/.test(walk.querySelector('.cw-text').textContent) && nextB.disabled);
    prevB.click(); await sleep(5);
    check(`step ${i}: back one frame`, cnt() === (total - 1) + ' / ' + total);
    more.click(); await sleep(5);
    check(`step ${i}: "Show less" folds it`, walk.hidden && more.textContent === 'Show more');
    window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  }
  check('cases were walked through', walked >= 1, walked);
  check('no script errors', errors.length === 0, errors);
  console.log(`case walk V1.0.41 UI: ${pass} passed, ${fail} failed (cases walked ${walked})`);
  process.exit(fail ? 1 : 0);
})();
