// UI checks for bricky/loopy rules, palisade, compass and watchtower. usage: node ui_test_rules19.js page.html
const fs = require('fs'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.9.html', 'utf8'), { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/' });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value:store.get(k) } : null, set: async (k,v) => { store.set(k,v); return {}; }, delete: async()=>({}), list: async()=>({keys:[]}) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const $ = id => window.document.getElementById(id);
  const raw = () => JSON.parse($('debugJson').textContent);
  const P = () => raw().puzzle;
  const move = (x,y) => $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointermove', { clientX:x, clientY:y, bubbles:true }));
  const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true }));
  const CS = 42;
  const resize = (w,h) => { $('puzzleW').value = w; $('puzzleH').value = h; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input')); };
  const addRule = t => { $('ruleType').value = t; $('ruleType').dispatchEvent(new ($('ruleType').ownerDocument.defaultView.Event)('change')); $('addRuleBtn').click(); };
  const solve = async () => { $('solveBtn').click(); for(let i=0;i<120;i++){ await sleep(50); if(!/Searching|Solver:/.test($('solverStatus').textContent) && !$('cancelSolveBtn').offsetParent && i>2) break; } await sleep(100); return $('solverStatus').textContent; };
  $('exactOnlyChk').checked = true;

  resize(3,3);
  // palisade
  move(1.5*CS, 1.5*CS); key('#');
  check('palisade placed as 0', JSON.stringify(P().palisades) === '[["1,1","0"]]', P().palisades);
  key('1'); check('palisade 1', P().palisades[0][1] === '1');
  key('2'); check('2 once = right angle', P().palisades[0][1] === '2c');
  key('2'); check('2 twice = opposite', P().palisades[0][1] === '2s');
  key('3'); key('4'); check('palisade 4', P().palisades[0][1] === '4');
  check('v49: palisade drawn as dots linked by its dark edges', $('puzzleLayer').querySelectorAll('line[stroke="var(--ink)"]').length >= 1 && $('puzzleLayer').querySelectorAll('circle').length >= 5);
  key('5'); check('5 ignored on palisade', P().palisades[0][1] === '4');
  key('#'); check('# again removes', P().palisades.length === 0);
  // symbols are exclusive
  key('#'); key('r'); check('rose replaces palisade', P().palisades.length === 0 && P().roses.length === 1);
  key('x'); check('compass replaces rose', P().roses.length === 0 && P().compasses.length === 1);
  // compass: north / east triangles, two-digit entry, clear
  move(1.5*CS, 1.15*CS); key('2'); check('compass north = 2', P().compasses[0][1].n === 2, P().compasses);
  move(1.85*CS, 1.5*CS); key('1'); key('2'); check('compass east = 12', P().compasses[0][1].e === 12, P().compasses);
  move(1.5*CS, 1.85*CS); key('0'); check('compass south = 0', P().compasses[0][1].s === 0);
  check('compass numbers drawn', $('puzzleLayer').querySelectorAll('text').length === 3);
  move(1.5*CS, 1.85*CS); key('Backspace'); check('backspace clears one direction', P().compasses[0][1].s === null && P().compasses.length === 1);
  key('Backspace'); check('backspace again removes the compass', P().compasses.length === 0);
  // watchtower on a corner
  move(1*CS + 1, 1*CS - 1); key('3');
  check('watchtower 3 at corner 1,1', JSON.stringify(P().watchtowers) === '[["1,1",3]]', P().watchtowers);
  check('watchtower drawn with 3 pips', $('puzzleLayer').querySelectorAll('circle').length === 4);
  key('9'); check('9 ignored', P().watchtowers[0][1] === 3);
  key('2'); check('different number replaces', P().watchtowers[0][1] === 2);
  key('2'); check('same number removes', P().watchtowers.length === 0);
  key('4'); key('Backspace'); check('backspace removes', P().watchtowers.length === 0);
  check('digit on a seam is still a difference wall', (move(1*CS + 1, 1.5*CS), key('3'), raw().puzzle.walls.length === 1 && raw().puzzle.walls[0][1] === 'diff3'));
  key('3');
  // rules
  addRule('bricky'); addRule('loopy');
  check('bricky + loopy chips and state', raw().sizeRules.bricky === true && raw().sizeRules.loopy === true && /Bricky/.test($('ruleChips').textContent) && /Loopy/.test($('ruleChips').textContent));
  // solving: 2x2 with a watchtower 4 in the middle = four singletons
  $('ruleChips').querySelectorAll('button').forEach(b => b.click());
  resize(2,2); move(1*CS + 1, 1*CS - 1); key('4');
  let t = await solve(); check('2x2 watchtower 4 -> unique', /unique/i.test(t) && !/not unique/i.test(t), t);
  key('1'); t = await solve(); check('2x2 watchtower 1 -> unique (one piece of 4)', /unique/i.test(t) && !/not unique/i.test(t), t);
  addRule('bricky'); key('4'); t = await solve(); check('2x2 bricky + four singletons -> impossible', /impossible|no solution|no way/i.test(t), t);
  // survives save + reload of state
  await sleep(500);
  check('state stored with new fields', [...store.values()].some(v => /watchtowers/.test(v)));
  check('no script errors', errors.length === 0, errors);
  console.log(`\nUI rules19: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
