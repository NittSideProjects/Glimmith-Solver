// EXPORT button (v32): a puzzle file written by this page is read back by a FRESH page (empty storage = another machine) and gives the same puzzle.
// usage: node ui_test_export32.js ../glimmith_solver_V1.0.14.html
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.14.html', 'utf8');
function boot(){   // a new page with its own empty storage
  const store = new Map(), dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }), { window } = dom;
  window.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return {}; }, delete: async () => ({}), list: async () => ({ keys: [] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return { x: this.x, y: this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  window.TextDecoder = require('util').TextDecoder;
  window.downloads = [];                                           // what the export button hands to the browser
  window.URL.createObjectURL = blob => { window.downloads.push({ blob }); return 'blob:test/' + window.downloads.length; };
  window.URL.revokeObjectURL = () => {};
  window.HTMLAnchorElement.prototype.click = function(){ if(this.download){ const d = window.downloads[window.downloads.length - 1]; d.name = this.download; } };
  window.errors = []; window.addEventListener('error', e => window.errors.push(String(e.message)));
  return window;
}
const readBlob = (window, blob) => new Promise((res, rej) => { const fr = new window.FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsText(blob); });
(async () => {
  const A = boot(); await sleep(300);
  const $ = (w, id) => w.document.getElementById(id);
  const raw = w => JSON.parse($(w, 'debugJson').textContent);
  const opts = w => Array.from($(w, 'puzzleSelect').options).map(o => o.textContent);
  const give = async (w, files) => { const inp = $(w, 'importFile'); Object.defineProperty(inp, 'files', { value: files, configurable: true }); inp.dispatchEvent(new w.Event('change')); for(let i = 0; i < 200; i++){ await sleep(50); if($(w, 'importBtn').textContent === 'Import puzzles…' && !$(w, 'importBtn').disabled) break; } await sleep(50); };
  const file = (w, name, content) => new w.File([content], name);
  check('export buttons exist', !!$(A, 'exportBtn') && !!$(A, 'exportAllBtn') && $(A, 'exportBtn').textContent === 'Export puzzle');
  // a puzzle with clues, walls, a shape bank entry and rules: the game's own bare puzzle, plus Boxy and Precision from the page
  await give(A, [file(A, 'puzzle', fs.readFileSync(path.join('fixtures', 'bare_puzzle')))]);
  $(A, 'ruleType').value = 'boxy'; $(A, 'addRuleBtn').click(); await sleep(50);
  const before = raw(A);
  check('setup: imported puzzle with Boxy', opts(A).length === 2 && before.sizeRules.boxy === true && before.puzzle.w > 4, [opts(A), before.sizeRules]);
  // ---- export the open puzzle ----
  $(A, 'exportBtn').click(); await sleep(50);
  check('one download', A.downloads.length === 1, A.downloads.length);
  const d = A.downloads[0], text = await readBlob(A, d.blob), o = JSON.parse(text);
  check('file name ends .glimmith.json and has the size', /\.glimmith\.json$/.test(d.name) && new RegExp(`-${before.puzzle.w}x${before.puzzle.h}\\.glimmith\\.json$`).test(d.name), d.name);
  check('format, version and one puzzle', o.format === 'glimmith-puzzle' && o.version === 1 && Array.isArray(o.puzzles) && o.puzzles.length === 1 && typeof o.exported === 'string', Object.keys(o));
  const st = o.puzzles[0].state;
  check('state holds grid, clues, rules', st.puzzle.w === before.puzzle.w && JSON.stringify(st.puzzle.walls) === JSON.stringify(before.puzzle.walls) && JSON.stringify(st.puzzle.active) === JSON.stringify(before.puzzle.active) && st.sizeRules.boxy === true, st.sizeRules);
  check('the imported solution travels with it', Array.isArray(o.puzzles[0].solutionWalls) && o.puzzles[0].solutionWalls.length > 0);
  check('toast says what was exported', /Exported/.test($(A, 'toast') ? $(A, 'toast').textContent : A.document.querySelector('.toast, #toast').textContent));
  // ---- another machine: a fresh page imports the file ----
  const B = boot(); await sleep(300);
  check('fresh page has only its own puzzle', opts(B).length === 1);
  await give(B, [file(B, d.name, text)]);
  const after = raw(B);
  check('fresh page: the puzzle was added and opened', opts(B).length === 2 && $(B, 'puzzleSelect').value !== 'main', opts(B));
  check('same grid, walls, clues, rules', JSON.stringify(after.puzzle) === JSON.stringify(before.puzzle) && JSON.stringify(after.sizeRules) === JSON.stringify(before.sizeRules) && JSON.stringify(after.shapeBank) === JSON.stringify(before.shapeBank), [after.sizeRules, before.sizeRules]);
  check('size inputs follow', $(B, 'puzzleW').value === String(before.puzzle.w) && $(B, 'puzzleH').value === String(before.puzzle.h));
  check('report says one imported', /1 puzzle imported/.test($(B, 'importLogSummary').textContent), $(B, 'importLogSummary').textContent);
  check('file solution button is there', !$(B, 'showFileSolutionBtn').hidden);
  check('delete works for the new (own) entry', !$(B, 'deletePuzzleBtn').disabled);
  // importing the same file again adds nothing
  await give(B, [file(B, d.name, text)]);
  check('same file again: already in the list', opts(B).length === 2 && /already in the list/.test($(B, 'importLogSummary').textContent), [opts(B), $(B, 'importLogSummary').textContent]);
  // a puzzle that was exported from page B itself (own entry) is also recognised when page A imports it back
  await give(A, [file(A, d.name, text)]);
  check('page A: its own puzzle is already in the list', opts(A).length === 2 && /already in the list/.test($(A, 'importLogSummary').textContent), [opts(A), $(A, 'importLogSummary').textContent]);
  // ---- export all ----
  $(B, 'puzzleSelect').value = 'main'; $(B, 'puzzleSelect').dispatchEvent(new B.Event('change')); await sleep(50);
  $(B, 'puzzleW').value = 5; $(B, 'puzzleH').value = 4; $(B, 'puzzleW').dispatchEvent(new B.window.Event('input')); await sleep(50);
  $(B, 'exportAllBtn').click(); await sleep(50);
  const all = B.downloads[B.downloads.length - 1], allText = await readBlob(B, all.blob), ao = JSON.parse(allText);
  check('export all: both puzzles in one file', ao.puzzles.length === 2 && /glimmith-2-puzzles\.glimmith\.json$/.test(all.name), [ao.puzzles.length, all.name]);
  check('export all: the edit made a moment ago is in it', ao.puzzles.some(p => p.state.puzzle.w === 5 && p.state.puzzle.h === 4), ao.puzzles.map(p => p.state.puzzle.w + 'x' + p.state.puzzle.h));
  const C = boot(); await sleep(300);
  await give(C, [file(C, all.name, allText)]);
  check('fresh page: both added', opts(C).length === 3 && /2 puzzles imported/.test($(C, 'importLogSummary').textContent), [opts(C), $(C, 'importLogSummary').textContent]);
  // ---- bad files are reported, nothing is added, the game's files still work ----
  const bad = JSON.parse(text); bad.puzzles[0].state.puzzle.active = [[1]];
  await give(C, [file(C, 'bad.glimmith.json', JSON.stringify(bad))]);
  check('bad grid: reported, nothing added', opts(C).length === 3 && /problem/.test($(C, 'importLogSummary').textContent), [opts(C), $(C, 'importLogSummary').textContent]);
  await give(C, [file(C, 'empty.glimmith.json', JSON.stringify({ format: 'glimmith-puzzle', version: 1, puzzles: [] }))]);
  check('empty file: reported', opts(C).length === 3 && /problem/.test($(C, 'importLogSummary').textContent));
  await give(C, [file(C, 'puzzle', fs.readFileSync(path.join('fixtures', 'bare_puzzle')))]);
  check("the game's own file still imports", opts(C).length === 4, opts(C));
  check('no script errors on any page', A.errors.length + B.errors.length + C.errors.length === 0, [A.errors, B.errors, C.errors]);
  console.log(`export UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
