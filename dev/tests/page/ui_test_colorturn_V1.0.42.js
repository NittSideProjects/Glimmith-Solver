// V1.0.42: the step-by-step hands out the group colours in turn, so no colour covers most of the puzzle (the starter example
// "Non Unique": before, the first colour was taken again each time a piece was finished, and most of the puzzle ended red).
//   node tests/page/ui_test_colorturn_V1.0.42.js [page.html]
const fs = require('fs'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0; const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
process.argv[2] = process.argv[2] || '../glimmith_solver_V1.0.44.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const dom = new JSDOM(fs.readFileSync(process.argv[2], 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }), w = dom.window, store = new Map();
  w.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return {}; }, delete: async () => ({}), list: async () => ({ keys: [] }) };
  w.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return this; } }; }; w.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  await sleep(400); const $ = id => w.document.getElementById(id);
  const opt = [...$('puzzleSelect').options].find(o => /Non Unique/.test(o.textContent)); $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new w.Event('change')); await sleep(100);
  $('solveBtn').click(); for(let i = 0; i < 600; i++){ await sleep(100); if($('cancelSolveBtn').style.display === 'none' && !$('solveBtn').disabled) break; }
  $('stepsBtn').click(); for(let i = 0; i < 600; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1]; const fills = []; let mid = '';
  for(let i = 1; i < n; i++){ $('stepsNext').click(); await sleep(5); const f = [...w.document.querySelectorAll('#stepsGrid rect[data-color]')].map(r => r.getAttribute('data-color')); fills.push(...f); if(i === Math.floor(n * 0.7)) mid = new Set(f).size + ' colours on ' + f.length + ' tiles'; }
  const errs = [];
  const cnt = {}; for(const f of fills) cnt[f] = (cnt[f] || 0) + 1;
  const top = Math.max(...Object.values(cnt));
  check('groups are coloured along the way', fills.length > 200, fills.length);
  check('many colours are used', Object.keys(cnt).length >= 10, Object.keys(cnt).length);
  check('no colour covers a third of what was coloured', top < fills.length / 3, [top, fills.length]);
  console.log(`colour turn V1.0.42 UI: ${pass} passed, ${fail} failed (${Object.keys(cnt).length} colours, most used ${top} of ${fills.length})`);
  process.exit(fail ? 1 : 0);
})();
