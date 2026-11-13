// Minimum + Maximum are shown as ONE "Range X-Y" chip.   node ui_test_range26.js ../glimmith_solver_V1.0.8.html
const fs = require('fs'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.8.html', 'utf8'), { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/' });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value:store.get(k) } : null, set: async (k,v) => { store.set(k,v); return {}; }, delete: async()=>({}), list: async()=>({keys:[]}) };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const $ = id => window.document.getElementById(id);
  const raw = () => JSON.parse($('debugJson').textContent);
  const chips = () => [...$('ruleChips').querySelectorAll('.rule-chip')].map(c => c.querySelector('span').textContent);
  const add = (type, v) => { $('ruleType').value = type; if(v != null) $('ruleValue').value = v; $('addRuleBtn').click(); };
  const rm = label => { const c = [...$('ruleChips').querySelectorAll('.rule-chip')].find(c => c.querySelector('span').textContent === label); c.querySelector('button').click(); };

  add('minimum', 3);
  check('only a Minimum: its own chip', JSON.stringify(chips()) === '["Minimum = 3"]', chips());
  add('maximum', 6);
  check('Minimum + Maximum: ONE chip "Range 3–6"', JSON.stringify(chips()) === '["Range 3\u20136"]', chips());
  check('the saved rules are still min and max', raw().sizeRules.min === 3 && raw().sizeRules.max === 6 && raw().sizeRules.precision === null, raw().sizeRules);
  const chip = $('ruleChips').querySelector('.rule-chip');
  check('chip has an explaining tooltip', /Minimum 3 and Maximum 6/.test(chip.title), chip.title);
  check('a toast tells what happened', /Range 3\u20136/.test($('toast') ? $('toast').textContent : ''), $('toast') && $('toast').textContent);
  // changing one bound updates the chip
  add('maximum', 8);
  check('changing the Maximum updates the chip', JSON.stringify(chips()) === '["Range 3\u20138"]', chips());
  add('minimum', 2);
  check('changing the Minimum updates the chip', JSON.stringify(chips()) === '["Range 2\u20138"]', chips());
  // the x removes both
  rm('Range 2\u20138');
  check('x on the range removes Minimum and Maximum', raw().sizeRules.min === null && raw().sizeRules.max === null && /No rules/.test($('ruleChips').textContent), [raw().sizeRules, chips()]);
  // order does not matter, other rules stay
  add('maximum', 5); check('only a Maximum: its own chip', JSON.stringify(chips()) === '["Maximum = 5"]', chips());
  add('boxy'); add('minimum', 2);
  check('Range chip next to other rules', JSON.stringify(chips()) === '["Range 2\u20135","Boxy"]', chips());
  rm('Boxy'); check('removing Boxy keeps the range', JSON.stringify(chips()) === '["Range 2\u20135"]' && raw().sizeRules.min === 2 && raw().sizeRules.max === 5, chips());
  // same value, and empty range
  add('minimum', 5); check('Minimum = Maximum shows Range 5–5', JSON.stringify(chips()) === '["Range 5\u20135"]', chips());
  add('minimum', 7);
  check('Minimum above Maximum: range chip marked as empty', JSON.stringify(chips()) === '["Range 7\u20135"]' && $('ruleChips').querySelector('.rule-chip-bad') !== null && /empty/.test($('ruleChips').querySelector('.rule-chip').title));
  rm('Range 7\u20135');
  // Precision can not mix, as before
  add('precision', 4); add('minimum', 2);
  check('Precision still refuses a Minimum', JSON.stringify(chips()) === '["Precision = 4"]' && raw().sizeRules.min === null, chips());
  rm('Precision = 4');
  // the solver still sees min / max: a 3x3 board with range 4-5 has the one covering 4+5
  $('puzzleW').value = 3; $('puzzleH').value = 3; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input'));
  add('minimum', 4); add('maximum', 5);
  $('exactOnlyChk').checked = true; $('solveBtn').click();
  for(let i = 0; i < 120; i++){ await sleep(50); if(i > 2 && !/Searching|Solver:/.test($('solverStatus').textContent)) break; }
  check('solver runs with the range (status is not an error)', !/rror/.test($('solverStatus').textContent), $('solverStatus').textContent);
  check('no script errors', errors.length === 0, errors);
  console.log(`range chip UI tests: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
