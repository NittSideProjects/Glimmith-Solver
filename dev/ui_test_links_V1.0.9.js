// V1.0.9 (core v99): on every step of the step-by-step view, two neighbouring tiles shown in the same group colour (known to be in
// one piece) have the link between them drawn: the link comes with the join, not on a later step.
// node ui_test_links_V1.0.9.js [page.html] [puzzle export file]   (default: the synthetic rose puzzle fixtures/colors_V1.0.6.glimmith.json)
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.16.html', pz = process.argv[3] || path.join(__dirname, 'fixtures', 'colors_V1.0.6.glimmith.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
(async () => {
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win){ win.TextDecoder = TextDecoder; win.TextEncoder = TextEncoder; win.HTMLCanvasElement.prototype.getContext = () => null; } });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; }, list: async () => ({ keys: [...store.keys()] }) };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const doc = window.document, $ = id => doc.getElementById(id);
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'p.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  const pzName = JSON.parse(fs.readFileSync(pz, 'utf8')).puzzles[0].name;
  let opt = null;
  for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => o.textContent.includes(pzName)); }
  check('puzzle imported', !!opt);
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 3000; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('solved', /^(Unique|Not unique)/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('stepsBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  let missing = 0, stepsWithGroups = 0, pairsChecked = 0; const bad = [];
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(5);
    const tints = [...doc.querySelectorAll('#stepsGrid rect.step-group')];
    if(!tints.length) continue;
    stepsWithGroups++;
    const cs = +tints[0].getAttribute('width') + 2, col = new Map();
    for(const r of tints) col.set(`${Math.round((+r.getAttribute('x') - 1) / cs)},${Math.round((+r.getAttribute('y') - 1) / cs)}`, r.getAttribute('data-color'));
    const links = new Set([...doc.querySelectorAll('#stepsGrid rect[data-kind="link"]')].map(r => r.getAttribute('data-edge')));
    for(const [k, c0] of col){
      const [c, r] = k.split(',').map(Number);
      for(const [nk, ek] of [[`${c + 1},${r}`, `v:${c},${r}`], [`${c},${r + 1}`, `h:${c},${r}`]]){
        if(col.get(nk) !== c0) continue;
        pairsChecked++;
        if(!links.has(ek)){ missing++; if(bad.length < 8) bad.push({ step: i, title: $('stepsCapTitle').textContent, edge: ek }); }
      }
    }
  }
  check('some steps show group colours', stepsWithGroups > 0, stepsWithGroups);
  check('every pair of same-colour neighbours is linked on that step', missing === 0, { missing, pairsChecked, bad });
  check('no script errors', errors.length === 0, errors);
  console.log(`links V1.0.9 UI: ${pass} passed, ${fail} failed (steps ${n}, steps with colours ${stepsWithGroups}, neighbour pairs checked ${pairsChecked}, missing links ${missing})`);
  process.exit(fail ? 1 : 0);
})();
