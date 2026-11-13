// v90 page: custom rules Links (L on a wall spot) and Heterogeneous (+ Wally from v89): placing, drawing, saving, solving.
// node ui_test_custom90.js ../glimmith_solver_V1.0.16.html
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.16.html';
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
  const raw = () => JSON.parse($('debugJson').textContent), walls = () => Object.fromEntries(raw().puzzle.walls);
  const move = (x, y) => $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointermove', { clientX:x, clientY:y, bubbles:true }));
  const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true }));
  let CS = 42; const seamV = (c, r) => move((c+1)*CS + 0.5, r*CS + CS/2);
  const resize = async (w, h) => { $('puzzleW').value = w; $('puzzleH').value = h; $('puzzleW').dispatchEvent(new window.Event('input')); await sleep(30); };
  const addRule = v => { const s = $('ruleType'); s.value = v; s.dispatchEvent(new window.Event('change')); };
  const solve = async () => { $('solveBtn').click(); for(let i = 0; i < 200; i++){ await sleep(50); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; } return $('solverStatus').textContent; };
  check('page loaded without script errors', errors.length === 0, errors);
  const hetOpt = doc.querySelector('#ruleType option[value="heterogeneous"]');
  check('Heterogeneous option after Wally, hidden at start', hetOpt && hetOpt.previousElementSibling.value === 'wally' && hetOpt.hidden && hetOpt.disabled);
  check('L hint is custom-only and red', !!doc.querySelector('.keys .custom-only.custom-rule kbd'));
  seamV(1, 1); key('l');
  check('L without custom rules places nothing', !('v:1,1' in walls()));
  $('customToggleBtn').click();
  check('custom rules shown: option enabled', !hetOpt.hidden && !hetOpt.disabled);
  seamV(1, 1); key('l');
  check('L on a wall spot -> link', walls()['v:1,1'] === 'link', walls());
  check('link drawn as a link mark in the ink colour', doc.querySelectorAll('#puzzleSvg rect.link-mark').length === 1 && doc.querySelector('#puzzleSvg rect.link-mark').getAttribute('fill') === 'var(--ink)');
  check('stats count the link, not a wall', /1 link/.test($('puzzleStats').textContent) && !/wall/.test($('puzzleStats').textContent), $('puzzleStats').textContent);
  key('d'); check('D replaces the link with a delta', walls()['v:1,1'] === 'delta');
  key('l'); key('l'); check('L twice: link then removed', !('v:1,1' in walls()));
  addRule('heterogeneous');
  const chip = [...doc.querySelectorAll('.rule-chip')].find(c => c.textContent.includes('Heterogeneous'));
  check('Heterogeneous chip, red', !!chip && chip.classList.contains('rule-chip-custom'));
  check('saved in the state', raw().sizeRules.heterogeneous === true, raw().sizeRules);
  // solving: 3x1 board, link between the first two tiles, Heterogeneous: {0,1}{2} or {0,1,2} -> not unique; + wall 1|2 -> unique
  await resize(3, 1); CS = +($('puzzleSvg').getAttribute('viewBox') || '0 0 0 0').split(' ')[2] / 3 || CS;
  seamV(0, 0); key('l');
  check('link on the 3x1 board', walls()['v:0,0'] === 'link', walls());
  let st = await solve();
  check('3x1 + link + Heterogeneous: not unique', /^Not unique/.test(st), st);
  // wall between tiles 1 and 2 via state: place a delta then replace? use D then remove? simplest: a plain wall by clicking
  const W = walls(); seamV(1, 0); $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointerdown', { clientX:(2)*CS + 0.5, clientY:CS/2, bubbles:true })); window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles:true }));
  check('wall placed between tiles 2 and 3', walls()['v:1,0'] === 'wall', walls());
  st = await solve();
  check('+ wall: unique', /^Unique/.test(st), st);
  addRule('minimum'); $('ruleValue').value = '2'; $('addRuleBtn').click(); await sleep(20);
  st = await solve();
  check('+ Minimum 2: impossible (the last tile is alone)', /^Impossible/.test(st), st);
  check('no script errors', errors.length === 0, errors);
  console.log(`custom90 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
