// V1.0.8: Delete / Backspace on a wall spot removes a wall rule (delta, gemini, inequality, difference, link); a plain wall stays.
// node ui_test_delwall_V1.0.8.js [page.html]
const fs = require('fs');
const { JSDOM } = require('jsdom');
const file = process.argv[2] || '../glimmith_solver_V1.0.12.html';

let pass = 0, fail = 0;
const check = (name, cond, extra) => { if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  const store = new Map();
  window.storage = {
    get: async k => store.has(k) ? { key:k, value: store.get(k) } : null,
    set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; },
    list: async () => ({ keys: [...store.keys()] })
  };
  // jsdom has no SVG geometry: make client coords == svg coords
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  $('exactOnlyChk').checked = true;   // these suites exercise the exact solver, which is now behind the 'Exact solver only' tuning option

  const raw = () => JSON.parse($('debugJson').textContent);
  const walls = () => Object.fromEntries(raw().puzzle.walls);
  const syms = () => ({ roses: Object.fromEntries(raw().puzzle.roses), polys: Object.fromEntries(raw().puzzle.polyominoes), areas: Object.fromEntries(raw().puzzle.areaNumbers) });

  const move = (x, y) => $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointermove', { clientX:x, clientY:y, bubbles:true }));
  const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true }));
  const CS = 42;                                    // 10x10 grid -> 42px cells
  const seamV = (c, r) => move((c+1)*CS + 0.5, r*CS + CS/2);
  const seamH = (c, r) => move(c*CS + CS/2, (r+1)*CS + 0.5);
  const cell = (c, r) => move(c*CS + CS/2, r*CS + CS/2);
  check('page loaded without script errors', errors.length === 0, errors);

  // every wall rule: placed with its key, removed with Delete or Backspace
  const cases = [['d', 'delta', 'v', 'Delete'], ['g', 'gemini', 'v', 'Backspace'], ['ArrowLeft', 'lt', 'v', 'Delete'], ['ArrowDown', 'gt', 'h', 'Backspace'], ['7', 'diff7', 'h', 'Delete'], ['0', 'diff0', 'v', 'Delete']];
  cases.forEach(([k, kind, o, del], i) => {
    const at = o === 'v' ? () => seamV(2, i) : () => seamH(3, i), wk = o === 'v' ? `v:2,${i}` : `h:3,${i}`;
    at(); key(k);
    check(`${kind} placed`, walls()[wk] === kind, walls());
    key(del);
    check(`${del} removes ${kind}`, !(wk in walls()), walls());
  });
  // link (custom rule): show custom rules first
  $('customToggleBtn').click(); await sleep(20);
  seamV(5, 5); key('l');
  check('link placed', walls()['v:5,5'] === 'link', walls());
  key('Delete');
  check('Delete removes a link', !('v:5,5' in walls()), walls());
  // a plain wall stays
  $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointerdown', { clientX: 7*CS + 0.5, clientY: 7*CS + CS/2, bubbles:true }));
  window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles:true })); await sleep(10);
  check('click places a plain wall', walls()['v:6,7'] === 'wall', walls());
  seamV(6, 7); key('Delete'); key('Backspace');
  check('Delete / Backspace leave a plain wall alone', walls()['v:6,7'] === 'wall', walls());
  // an empty spot: nothing happens, nothing breaks
  seamH(8, 8); const n0 = Object.keys(walls()).length; key('Delete');
  check('Delete on an empty spot changes nothing', Object.keys(walls()).length === n0);
  // the other rule walls are untouched by a Delete elsewhere
  seamV(0, 9); key('g'); seamV(1, 9); key('d'); seamV(0, 9); key('Delete');
  check('only the wall under the mouse is removed', !('v:0,9' in walls()) && walls()['v:1,9'] === 'delta', walls());
  // tiles still work as before
  cell(4, 4); key('r');
  check('rose placed', Object.fromEntries(raw().puzzle.roses)['4,4'] !== undefined);
  key('Delete');
  check('Delete on a tile still removes the symbol', Object.fromEntries(raw().puzzle.roses)['4,4'] === undefined);
  check('no script errors', errors.length === 0, errors);
  console.log(`delwall V1.0.8 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
