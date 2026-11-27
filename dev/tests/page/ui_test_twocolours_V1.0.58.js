// V1.0.58 page: with Loopy, or when the puzzle has two pieces at most, the step view colours every tile with one of two colours (a wall
// changes it, a link keeps it) as soon as known walls / links tie it to a tile of known colour. Two synthetic boards
// (fixtures/twocolours_V1.0.58.glimmith.json: a planted Loopy 5x5, fuzzlib plantedPuzzle seed 1; a 4x3 board with Precision 6).
// node ui_test_twocolours_V1.0.58.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || require('../../pagepath.js')(), pz = path.join(__dirname, '..', '..', 'fixtures', 'twocolours_V1.0.58.glimmith.json');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const BLUE = '#3f8fd2', ORANGE = '#e39a3b';
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
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'twocolours.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  const J = JSON.parse(fs.readFileSync(pz, 'utf8'));
  for(const [name, mode] of [['Two colours: Loopy', 'loopy'], ['Two colours: two pieces', 'two']]){
    let opt = null;
    for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => o.textContent.includes(name)); }
    check(`${mode}: puzzle imported`, !!opt); if(!opt) continue;
    $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
    $('solveBtn').click();
    for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
    check(`${mode}: solved, unique`, /^Unique/.test($('solverStatus').textContent), $('solverStatus').textContent);
    $('stepsBtn').click();
    for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
    check(`${mode}: the start text explains the two colours`, mode === 'loopy' ? /two colours: blue for the tiles next to the outside/.test($('stepsCapText').textContent) : /two pieces at most/.test($('stepsCapText').textContent), $('stepsCapText').textContent.slice(0, 120));
    if(mode === 'loopy') check('loopy: the start text does not say that one colour is one piece', !/share a colour are in one piece/.test($('stepsCapText').textContent));
    const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
    const tiles = () => { const m = new Map(); doc.querySelectorAll('#stepsGrid rect[data-color]').forEach(r => m.set(`${Math.round(+r.getAttribute('x'))},${Math.round(+r.getAttribute('y'))}`, r.getAttribute('data-color'))); return m; };
    let onlyTwo = true, grows = true, prev = 0, most = 0;
    for(let i = 1; i < n; i++){
      $('stepsNext').click(); await sleep(5);
      const t = tiles();
      for(const c of t.values()) if(c !== BLUE && c !== ORANGE) onlyTwo = false;
      if(t.size < prev) grows = false; prev = t.size; most = Math.max(most, t.size);
    }
    check(`${mode}: only the two colours`, onlyTwo);
    check(`${mode}: tiles get coloured, and stay coloured`, most > 0 && grows, { most });
    // the last rule step against the stored tiling: same piece = same colour (two pieces); Loopy: a wall changes the colour, the outline is blue
    const st = J.puzzles.find(p => p.name.includes(name)).state.puzzle, W = st.w, H = st.h;
    const t = tiles(), px = [...t.keys()].map(k => k.split(',').map(Number));
    const xs = [...new Set(px.map(p => p[0]))].sort((a, b) => a - b), ys = [...new Set(px.map(p => p[1]))].sort((a, b) => a - b);
    check(`${mode}: every tile is coloured before the result`, t.size === W * H, t.size);
    if(mode === 'loopy'){
      const col = (c, r) => t.get(`${xs[c]},${ys[r]}`);
      let outlineBlue = true; for(let r = 0; r < H; r++) for(let c = 0; c < W; c++) if((r === 0 || c === 0 || r === H - 1 || c === W - 1) && col(c, r) !== BLUE) outlineBlue = false;
      check('loopy: the outline is blue', outlineBlue);
    }
  }
  check('no script errors', errors.length === 0, errors);
  console.log(`two colours V1.0.58 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
