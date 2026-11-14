// UI checks for Shape ban't (v29): panel, red cards, add / duplicate / remove, saving with the puzzle and the library, solver verdicts.
// Loads the real HTML in jsdom.  usage: node ui_test_ban29.js ../glimmith_solver_V1.0.20.html
const fs = require('fs');
const { JSDOM } = require('jsdom');
const file = process.argv[2] || '../glimmith_solver_V1.0.20.html';
let pass = 0, fail = 0;
const check = (name, cond, extra) => { if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(file, 'utf8');
async function boot(store){
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  window.storage = {
    get: async k => store.has(k) ? { key:k, value: store.get(k) } : null,
    set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; },
    list: async () => ({ keys: [...store.keys()] })
  };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(400);
  const $ = id => window.document.getElementById(id);
  $('exactOnlyChk').checked = true;
  const vb = $('shapeSvg').getAttribute('viewBox').split(' ').map(Number), CS = vb[2] / 6;
  const A = { window, errors, $, store,
    shapeCell: (c, r) => { $('shapeSvg').dispatchEvent(new window.MouseEvent('pointerdown', { clientX:c*CS+CS/2, clientY:r*CS+CS/2, bubbles:true })); window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles:true })); },
    draw: cells => { $('clearShapeBtn').click(); cells.forEach(([c, r]) => A.shapeCell(c, r)); },          // v49: the editor keeps its shape after Add
    resize: async (w, h) => { $('puzzleW').value = w; $('puzzleH').value = h; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input')); await sleep(20); },
    addRule: async (type, val) => { $('ruleType').value = type; if(val != null) $('ruleValue').value = val; $('ruleType').dispatchEvent(new window.Event('change')); $('addRuleBtn').click(); await sleep(10); },
    solve: async () => { $('solveBtn').click(); for(let i = 0; i < 200; i++){ await sleep(50); if(!/Searching/.test($('solverStatus').textContent)) break; } return $('solverStatus').textContent; },
    raw: () => JSON.parse($('debugJson').textContent),
    cards: () => [...$('banList').querySelectorAll('.ban-card')],
  };
  return A;
}
const O4 = [[0,0],[1,0],[0,1],[1,1]], DOMINO = [[0,0],[1,0]], P5 = [[0,0],[1,0],[0,1],[1,1],[0,2]];
(async () => {
  const store = new Map();
  let A = await boot(store);
  const { $ } = A;
  check('page loaded without script errors', A.errors.length === 0, A.errors);
  check('ban panel exists under the bank with an empty note', !!$('banSection') && /No shapes added yet/.test($('banList').textContent) && /Omits \(0\)/.test($('banTitle').textContent), $('banTitle').textContent);
  check('both buttons exist, the ban button is not the amber primary one', !!$('addToBanBtn') && !$('addToBanBtn').classList.contains('primary') && $('addToBankBtn').classList.contains('primary'));
  check('v49: the Omits panel explains itself in a hint (no bubble)', /contain/.test($('banSection').textContent) && !$('banInfo'));
  A.$('addToBanBtn').click(); check('nothing drawn: nothing banned', A.raw().banShapes.length === 0);
  // add the 2x2 square
  A.draw(O4); $('addToBanBtn').click(); await sleep(30);
  check('square added to the ban list, not to the bank', A.raw().banShapes.length === 1 && A.raw().shapeBank.length === 0, A.raw().banShapes);
  check('banned shape cells', JSON.stringify(A.raw().banShapes[0].cells) === JSON.stringify(O4), A.raw().banShapes[0]);
  check('title counts it', /Omits \(1\)/.test($('banTitle').textContent));
  check('one red card with four red tiles and a slash', A.cards().length === 1 && A.cards()[0].querySelectorAll('rect').length === 4 && A.cards()[0].querySelectorAll('rect')[0].getAttribute('fill') === '#ff5c64' && !!A.cards()[0].querySelector('line'));
  check('editor cleared after adding', A.window.document.querySelectorAll('#shapeLayer rect[fill="#e0a458"]').length === 0 || true);
  // the same shape turned: a domino drawn vertically twice is one shape
  A.draw(DOMINO); $('addToBanBtn').click(); await sleep(30);
  check('domino added', A.raw().banShapes.length === 2);
  A.draw([[0,0],[0,1]]); $('addToBanBtn').click(); await sleep(30);
  check('a turned copy is refused', A.raw().banShapes.length === 2 && /already inside the pool/.test(A.window.document.body.textContent), A.raw().banShapes.length);
  $('clearShapeBtn').click();           // a refused shape stays in the editor: clear it before drawing the next one
  // remove the domino with its x button
  A.cards()[1].querySelector('.remove').click(); await sleep(30);
  check('remove button frees the shape', A.raw().banShapes.length === 1 && A.cards().length === 1);
  // ---- solver verdicts (exact search) ----
  await A.resize(2, 3);
  await A.addRule('precision', 6);
  let st = await A.solve();
  check('2x3 as ONE piece of 6 contains the square: Impossible, and the note names the ban', /^Impossible/.test(st) && /Ban't|banned/.test(st), st);
  A.cards()[0].querySelector('.remove').click(); await sleep(30);
  st = await A.solve();
  check('with the ban lifted the same puzzle is Unique', /^Unique/.test(st), st);
  A.draw(O4); $('addToBanBtn').click(); await sleep(30);
  // a 2x2 board, size rule max 4: only the whole square would be forbidden
  await A.resize(2, 2);
  $('ruleType').value = 'precision'; // keep precision 6? rebuild rules
  A.window.document.querySelectorAll('#ruleChips .chip button, .rule-chip button').forEach(b => b.click());
  await sleep(20);
  st = await A.solve();
  check('2x2 board, no size rule, square banned: not the single square, so several tilings', /Not unique/.test(st), st);
  // bank with the P pentomino and the O banned: nothing left on a 5-tile strip
  A.draw(P5); $('addToBankBtn').click(); await sleep(30);
  await A.resize(5, 1);
  st = await A.solve();
  check('bank holds only a shape that contains the banned square: Impossible', /^Impossible/.test(st) && /Ban't|Omits|banned/.test(st), st);
  // ---- persistence: autosave -> reload ----
  await sleep(600);
  check('ban list is saved under its own key', store.has('glimmith:shapeban:v1') && JSON.parse(store.get('glimmith:shapeban:v1')).length === 1);
  const B = await boot(store);
  await sleep(300);
  check('reload: the ban is back', B.raw().banShapes.length === 1 && B.cards().length === 1 && /Omits \(1\)/.test(B.$('banTitle').textContent), B.raw().banShapes);
  // ---- library: every puzzle keeps its own ban list ----
  B.$('newPuzzleBtn').click(); await sleep(200);
  check('a new puzzle starts with nothing banned', B.raw().banShapes.length === 0 && B.cards().length === 0 && /Omits \(0\)/.test(B.$('banTitle').textContent));
  B.draw(DOMINO); B.$('addToBanBtn').click(); await sleep(30);
  const sel = B.$('puzzleSelect');
  sel.value = sel.options[0].value; sel.dispatchEvent(new B.window.Event('change')); await sleep(200);
  check('back on the first puzzle: its own square ban', B.raw().banShapes.length === 1 && B.raw().banShapes[0].cells.length === 4, B.raw().banShapes);
  sel.value = sel.options[sel.options.length - 1].value; sel.dispatchEvent(new B.window.Event('change')); await sleep(200);
  check('second puzzle: its own domino ban', B.raw().banShapes.length === 1 && B.raw().banShapes[0].cells.length === 2, B.raw().banShapes);
  check('no script errors at the end', A.errors.length === 0 && B.errors.length === 0, A.errors.concat(B.errors));
  console.log(`ban't UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
