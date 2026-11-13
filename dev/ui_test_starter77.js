// v77: starter puzzles load with the page; the info line is empty except for the roadblocks' notes.
// usage: node ui_test_starter77.js ../glimmith_solver_V1.0.6.html
const fs = require('fs'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.6.html', 'utf8');
function boot(store){
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }), { window } = dom;
  window.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return {}; }, delete: async () => ({}), list: async () => ({ keys: [] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return { x: this.x, y: this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  window.TextDecoder = require('util').TextDecoder;
  window.downloads = [];
  window.URL.createObjectURL = blob => { window.downloads.push({ blob }); return 'blob:test/' + window.downloads.length; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function(){ if(this.download){ const d = window.downloads[window.downloads.length - 1]; d.name = this.download; } };
  window.errors = []; window.addEventListener('error', e => window.errors.push(String(e.message)));
  return window;
}
const readBlob = (w, blob) => new Promise((res, rej) => { const fr = new w.FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsText(blob); });
(async () => {
  const store = new Map();
  let W = boot(store); await sleep(400);
  let $ = id => W.document.getElementById(id);
  const opts = () => Array.from($('puzzleSelect').options).map(o => o.textContent);
  const pick = name => { const o = Array.from($('puzzleSelect').options).find(o => o.textContent.startsWith(name)); $('puzzleSelect').value = o.value; $('puzzleSelect').dispatchEvent(new W.Event('change')); };
  const raw = () => JSON.parse($('debugJson').textContent);
  check('fresh page: My puzzle, then the two starters, then the roadblocks', opts()[0] === 'My puzzle' && opts()[1] === 'Exemple Puzzle Unique' && opts()[2] === 'Exemple Puzzle Non Unique' && opts().slice(3).every(t => t.startsWith('Roadblock ')), opts().slice(0, 4));
  check('My puzzle stays the open one', $('puzzleSelect').selectedIndex === 0);
  check('no description box', !$('puzzleDesc'));
  check('info line empty for My puzzle', $('libraryInfo').textContent === '', $('libraryInfo').textContent);
  pick('Exemple Puzzle Unique');
  check('starter Unique opens 14x7 with Min 6', raw().puzzle.w === 14 && raw().puzzle.h === 7 && raw().sizeRules.min === 6, [raw().puzzle.w, raw().puzzle.h, raw().sizeRules.min]);
  check('info line empty for a starter', $('libraryInfo').textContent === '', $('libraryInfo').textContent);
  pick('Exemple Puzzle Non Unique');
  check('starter Non Unique opens 20x7 with Precision 3', raw().puzzle.w === 20 && raw().puzzle.h === 7 && raw().sizeRules.precision === 3, [raw().puzzle.w, raw().puzzle.h]);
  if(opts().some(t => t.startsWith('Roadblock '))){                    // v94: the roadblock list is empty since 1434 is solved
    pick('Roadblock ');
    check('a roadblock still shows its note', /userpass3:/.test($('libraryInfo').textContent), $('libraryInfo').textContent);
  } else check('no roadblock left in the list', true);
  await sleep(1500);
  W.close(); W = boot(store); await sleep(400); $ = id => W.document.getElementById(id);
  check('reload: no duplicate starters', opts().filter(t => t.startsWith('Exemple Puzzle')).length === 2, opts().length);
  pick('Exemple Puzzle Unique');
  $('deletePuzzleBtn').click(); $('deletePuzzleBtn').click(); await sleep(1500);
  W.close(); W = boot(store); await sleep(400); $ = id => W.document.getElementById(id);
  check('reload after delete: the starter stays deleted', !opts().includes('Exemple Puzzle Unique') && opts().includes('Exemple Puzzle Non Unique'), opts().slice(0, 3));
  check('no page errors', W.errors.length === 0, W.errors);
  console.log(`starter77 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
