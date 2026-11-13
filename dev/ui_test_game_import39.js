// v39: the converted game puzzles open in the editor page, and give EXACTLY the state the page's own "Import puzzles..." makes from the original .puz.
// usage (from the project folder, after `npm install`): node ui_test_game_import39.js [../glimmith_solver_V1.0.11.html]
// For one sample per category (+ 1408 and the puzzle with most clue kinds): fresh page A imports the .puz, fresh page B imports the converted .glimmith.json;
// Raw state (debugJson) must be identical, the file's solution must be offered, and the report must have no problem.
const fs = require('fs'), path = require('path'); const { JSDOM } = require('jsdom');
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x).slice(0, 300) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(process.argv[2] || '../glimmith_solver_V1.0.11.html', 'utf8');
function boot(){
  const store = new Map(), dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }), { window } = dom;
  window.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return {}; }, delete: async () => ({}), list: async () => ({ keys: [] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return { x: this.x, y: this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  window.TextDecoder = require('util').TextDecoder;
  window.errors = []; window.addEventListener('error', e => window.errors.push(String(e.message)));
  return window;
}
const $ = (w, id) => w.document.getElementById(id);
async function give(w, name, content){
  const inp = $(w, 'importFile'); Object.defineProperty(inp, 'files', { value: [new w.File([content], name)], configurable: true });
  inp.dispatchEvent(new w.Event('change'));
  for(let i = 0; i < 200; i++){ await sleep(25); if(/imported|already|problem|failed/i.test($(w, 'importLogSummary').textContent || '') ) break; }
  await sleep(30);
}
(async () => {
  const idx = JSON.parse(fs.readFileSync('game_puzzles_converted/index.json', 'utf8')).puzzles.filter(r => r.kind === 'game');
  const pick = new Map();
  for(const r of idx){ const k = r.zone + '/' + r.category; const cur = pick.get(k); if(!cur || (r.inCampaign && !cur.inCampaign) || (r.inCampaign === cur.inCampaign && r.features.length > cur.features.length && r.activeTiles < 150)) pick.set(k, r); }
  const sample = [...pick.values()];
  const rich = idx.slice().sort((a, b) => b.features.length - a.features.length || a.activeTiles - b.activeTiles)[0];
  [rich, idx.find(r => r.id === 'Zone3/1408')].forEach(r => { if(r && !sample.includes(r)) sample.push(r); });
  console.log('sampling', sample.length, 'puzzles (one per category + extras)');
  for(const rec of sample){
    const A = boot(), B = boot(); await sleep(250);
    const puz = fs.readFileSync(path.join('game_puzzles', rec.source), 'utf8');
    const json = fs.readFileSync(path.join('game_puzzles_converted', rec.file), 'utf8');
    await give(A, path.basename(rec.source), puz);
    await give(B, path.basename(rec.file), json);
    const ra = JSON.parse($(A, 'debugJson').textContent), rb = JSON.parse($(B, 'debugJson').textContent);
    const same = ['puzzle', 'sizeRules', 'shapeBank', 'solverLimits'].every(k => JSON.stringify(ra[k]) === JSON.stringify(rb[k]));
    check(`${rec.id} (${rec.category}): .puz and converted json give the same page state`, same);
    check(`${rec.id}: converted json imported without problems`, /1 puzzle imported/.test($(B, 'importLogSummary').textContent) && !/problem/.test($(B, 'importLogSummary').textContent), $(B, 'importLogSummary').textContent);
    check(`${rec.id}: file solution offered iff the file has one`, $(B, 'showFileSolutionBtn').hidden === !rec.hasSolution, $(B, 'showFileSolutionBtn').hidden);
    check(`${rec.id}: grid size`, ra.puzzle.w === rec.w && ra.puzzle.h === rec.h);
    check(`${rec.id}: no script errors`, A.errors.length === 0 && B.errors.length === 0, [A.errors, B.errors]);
    A.close(); B.close();
  }
  console.log(fail ? `${fail} FAILED, ${pass} passed` : `all ${pass} checks passed`);
  process.exit(fail ? 1 : 0);
})();
