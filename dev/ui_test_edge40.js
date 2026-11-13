// v40 UI: the "Final search" select. The same real puzzle (Zone3/1397a, unique; the old whole-piece search alone times out on it) is solved in the page
// under each setting; every setting that finishes must say Unique, the new default must finish fast, and the select is locked while a solve runs.
//   usage: NODE_PATH=<dir with jsdom> node ui_test_edge40.js ../glimmith_solver_V1.0.13.html
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const PZ = require('./loadpz.js');
const file = process.argv[2] || '../glimmith_solver_V1.0.13.html';
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log((cond ? 'ok  ' : 'FAIL') + ' ' + name); if(cond) pass++; else { fail++; console.log('   ->', JSON.stringify(extra)); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const html = fs.readFileSync(file, 'utf8');
const ix = JSON.parse(fs.readFileSync('game_puzzles_converted/index.json', 'utf8')).puzzles;
const P = PZ.load('game_puzzles_converted/' + ix.find(p => p.id === 'Zone3/1397a').file);
function seedStore(P){
  const pz = P.puzzle, store = new Map();
  store.set('glimmith:puzzle:v1', JSON.stringify({ w: pz.w, h: pz.h, active: pz.active, walls: [...pz.walls.entries()], roses: [...pz.roses.entries()], polyominoes: [...pz.polyominoes.entries()], areaNumbers: [...pz.areaNumbers.entries()], palisades: [...pz.palisades.entries()], compasses: [...pz.compasses.entries()], watchtowers: [...pz.watchtowers.entries()] }));
  store.set('glimmith:shapebank:v1', JSON.stringify([]));
  store.set('glimmith:sizerules:v1', JSON.stringify(P.rules));
  return store;
}
async function boot(store){
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  window.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key: k, value: v }; }, delete: async k => { store.delete(k); return { key: k, deleted: true }; }, list: async () => ({ keys: [...store.keys()] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return { x: this.x, y: this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(400);
  return { window, errors, $: id => window.document.getElementById(id) };
}
const running = $ => /Solver: (preparing|narrow|final)/.test($('solverStatus').textContent);
(async () => {
  const A = await boot(seedStore(P)), $ = A.$;
  const opts = [...$('exactSel').options].map(o => o.value);
  check('the Final search select exists with 3 settings, the new search is the default', JSON.stringify(opts) === '["portfolio","edge","old"]' && $('exactSel').value === 'portfolio', opts);
  for(const [val, limitMs, mustFinish] of [['portfolio', 15000, true], ['edge', 15000, true], ['old', 4000, false]]){
    $('exactSel').value = val;
    $('solveBtn').click(); await sleep(30);
    if(val === 'portfolio') check('the select is locked while a solve runs', $('exactSel').disabled === true || !running($));
    const t0 = Date.now(); while(running($) && Date.now() - t0 < limitMs) await sleep(40);
    const took = Date.now() - t0, st = $('solverStatus').textContent;
    if(running($)){ $('cancelBtn') && $('cancelBtn').click(); await sleep(300); }
    if(mustFinish) check(`${val}: Unique, ${took} ms`, /^Unique/.test(st) && took < limitMs, st);
    else console.log(`info ${val}: after ${took} ms the page says: ${st.slice(0, 80)}   (not asserted: the whole-piece search alone cannot do this puzzle fast)`);
    await sleep(100);
  }
  check('no script errors', A.errors.length === 0, A.errors);
  console.log(`UI edge40: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
