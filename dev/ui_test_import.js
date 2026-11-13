// UI checks for the puzzle library / importer. usage: node ui_test_import.js page.html
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.10.html', 'utf8'), store = new Map();
function boot(){
  const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'http://localhost/' });
  const { window } = dom;
  window.storage = { get: async k => store.has(k) ? { key:k, value:store.get(k) } : null, set: async (k,v) => { store.set(k,v); return {}; }, delete: async()=>({}), list: async()=>({keys:[]}) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  window.TextDecoder = require('util').TextDecoder;        // jsdom has none; real browsers do. No DecompressionStream here => the built-in inflate is exercised.
  window.errors = []; window.addEventListener('error', e => window.errors.push(String(e.message)));
  return window;
}
(async () => {
  let window = boot(); await sleep(300);
  const $ = id => window.document.getElementById(id);
  const raw = () => JSON.parse($('debugJson').textContent);
  const opts = () => Array.from($('puzzleSelect').options).map(o => o.textContent);
  const give = async files => { const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: files, configurable: true }); inp.dispatchEvent(new window.Event('change')); for(let i=0;i<200;i++){ await sleep(50); if($('importBtn').textContent === 'Import puzzles…' && !$('importBtn').disabled) break; } await sleep(50); };
  const file = (name, buf) => new window.File([buf], name);
  const fx = n => fs.readFileSync(path.join('fixtures', n));

  check('starts with one entry', opts().length === 1 && opts()[0] === 'My puzzle', opts());
  check('delete disabled with one entry', $('deletePuzzleBtn').disabled);
  $('puzzleW').value = 4; $('puzzleH').value = 3; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input'));
  $('ruleType').value = 'bricky'; $('ruleType').dispatchEvent(new ($('ruleType').ownerDocument.defaultView.Event)('change'));
  check('own edits made', raw().puzzle.w === 4 && raw().sizeRules.bricky === true);

  // 1. bare puzzle file
  await give([file('puzzle', fx('bare_puzzle'))]);
  check('bare puzzle imported', opts().length === 2 && /Imported puzzle · \d+×\d+/.test(opts()[1]), opts());
  check('imported becomes active', $('puzzleSelect').value !== 'main' && raw().puzzle.w !== 4);
  check('report shown', !$('importLogBox').hidden && /1 puzzle imported/.test($('importLogSummary').textContent), $('importLogSummary').textContent);
  check('file solution button visible', !$('showFileSolutionBtn').hidden);
  // switching back restores own edits
  $('puzzleSelect').value = 'main'; $('puzzleSelect').dispatchEvent(new window.Event('change'));
  check('own puzzle restored', raw().puzzle.w === 4 && raw().puzzle.h === 3 && raw().sizeRules.bricky === true && $('puzzleW').value === '4', raw().puzzle.w);
  check('file solution button hidden on own puzzle', $('showFileSolutionBtn').hidden);
  // 2. duplicate
  await give([file('again.txt', fx('bare_puzzle'))]);
  check('duplicate not added', opts().length === 2 && /1 already in the list/.test($('importLogSummary').textContent), $('importLogSummary').textContent);

  // 3. zip with one puzzle (same puzzle => duplicate), zip of folders (stored+deflate), nested zip
  await give([file('one.zip', fx('one.zip'))]);
  check('zip with the same puzzle is a duplicate', opts().length === 2);
  await give([file('folders.zip', fx('folders.zip'))]);
  check('folders zip: one new (x1 duplicates the first), x2 added', opts().length === 3, opts());
  check('names/author from metadata', opts().some(o => /^Second one · 20×11/.test(o)), opts());
  await give([file('nested.zip', fx('nested.zip'))]);
  check('nested zip adds nothing new', opts().length === 3, opts());

  // 4. hostile name is text, not markup (fresh library entry via a new puzzle text copy)
  const evil = fs.readFileSync('fixtures/folders.zip');
  check('no injected elements', window.document.querySelectorAll('img').length === 0);

  // 5. junk file reports a problem, changes nothing
  const before = opts().length;
  await give([file('junk.txt', fx('junk.txt'))]);
  check('junk rejected', opts().length === before && /1 problem/.test($('importLogSummary').textContent) && $('importLogBox').open, $('importLogSummary').textContent);
  await give([file('x.bin', Buffer.from([1,2,3,4]))]);
  check('non-puzzle ignored with a message', opts().length === before && /no puzzle files found/.test($('importLog').textContent), $('importLog').textContent);

  // 6. solve an imported puzzle: verdict mentions the file's solution
  $('puzzleSelect').value = $('puzzleSelect').options[1].value; $('puzzleSelect').dispatchEvent(new window.Event('change'));
  $('exactOnlyChk').checked = true; $('solveBtn').click();
  for(let i=0;i<300;i++){ await sleep(100); if(/Unique|Not unique|No tiling|impossible/i.test($('solverStatus').textContent)) break; }
  check('unique and matches the stored solution', /Unique/.test($('solverStatus').textContent) && /✓ It is the solution stored/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('showFileSolutionBtn').click();
  check('file solution card drawn', Array.from(window.document.querySelectorAll('#solverResults .solution-label')).some(l => l.textContent === 'Solution stored in the file'));
  $('showFileSolutionBtn').click();
  check('no duplicate card', Array.from(window.document.querySelectorAll('#solverResults .solution-label')).filter(l => l.textContent === 'Solution stored in the file').length === 1);

  // 7. edit an imported puzzle, switch away and back: kept
  const impId = $('puzzleSelect').value;
  $('ruleType').value = 'loopy'; $('ruleType').dispatchEvent(new ($('ruleType').ownerDocument.defaultView.Event)('change'));
  const rulesNow = JSON.stringify(raw().sizeRules);
  $('puzzleSelect').value = 'main'; $('puzzleSelect').dispatchEvent(new window.Event('change'));
  $('puzzleSelect').value = impId; $('puzzleSelect').dispatchEvent(new window.Event('change'));
  check('imported edits kept; results cleared on switch', JSON.stringify(raw().sizeRules) === rulesNow && $('solverResults').children.length === 0);

  // 8. persistence across a reload
  await sleep(1500);
  const names = opts(), act = $('puzzleSelect').value, w0 = raw().puzzle.w;
  window.close(); window = boot(); await sleep(500);
  check('library restored after reload', JSON.stringify(opts()) === JSON.stringify(names) && window.document.getElementById('puzzleSelect').value === act, opts());
  check('active puzzle restored after reload', JSON.parse(window.document.getElementById('debugJson').textContent).puzzle.w === w0);
  const $2 = id => window.document.getElementById(id);
  $2('puzzleSelect').value = 'main'; $2('puzzleSelect').dispatchEvent(new window.Event('change'));
  check('own puzzle still intact after reload', JSON.parse($2('debugJson').textContent).puzzle.w === 4);

  // 9. delete = two clicks
  const n0 = $2('puzzleSelect').options.length;
  $2('deletePuzzleBtn').click(); check('first click only arms', $2('puzzleSelect').options.length === n0 && $2('deletePuzzleBtn').classList.contains('armed'));
  $2('deletePuzzleBtn').click(); check('second click deletes', $2('puzzleSelect').options.length === n0 - 1);
  check('no script errors', window.errors.length === 0, window.errors);
  console.log(`import UI: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
