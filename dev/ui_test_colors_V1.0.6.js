// V1.0.6 page: tiles known to be in one piece share a colour in the step-by-step view (replaces the v94 letters).
// Runs on a synthetic rose puzzle (fixtures/colors_V1.0.6.glimmith.json) whose steps include a label join (core v98) and a split cut,
// then checks the colour pool itself (25 colours, reuse only when all are held, a finished piece gives its colour back).
// node ui_test_colors_V1.0.6.js [page.html]
const { JSDOM } = require('jsdom'); const fs = require('fs'); const path = require('path');
const file = process.argv[2] || '../glimmith_solver_V1.0.9.html', pz = path.join(__dirname, 'fixtures', 'colors_V1.0.6.glimmith.json');
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

  // ---- the real flow: import, solve, step through ----
  const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([fs.readFileSync(pz)], 'colors.glimmith.json')], configurable: true });
  inp.dispatchEvent(new window.Event('change'));
  let opt = null;
  for(let i = 0; i < 200 && !opt; i++){ await sleep(25); opt = [...$('puzzleSelect').options].find(o => /Colour test/.test(o.textContent)); }
  check('puzzle imported', !!opt);
  $('puzzleSelect').value = opt.value; $('puzzleSelect').dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('solved', /^(Unique|Not unique)/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('stepsBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  check('start text explains the colours', /share a colour/.test($('stepsCapText').textContent), $('stepsCapText').textContent);
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  const tileColour = () => { const m = new Map(); doc.querySelectorAll('#stepsGrid rect[data-color]').forEach(r => m.set(`${Math.round(+r.getAttribute('x'))},${Math.round(+r.getAttribute('y'))}`, r.getAttribute('data-color'))); return m; };
  let firstFact = null, groupBefore = 0, labelStep = 0, splitStep = 0, letters = 0, colourKept = true, ringedSame = true, maxGroups = 0;
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(5);
    const title = $('stepsCapTitle').textContent, groups = doc.querySelectorAll('#stepsGrid rect.step-group'), cols = tileColour();
    letters += doc.querySelectorAll('#stepsGrid text.step-letter').length;
    const isFact = /Only one piece it can be in|The only way to connect|Far apart, but one piece/.test(title);
    if(/Only one piece it can be in/.test(title)) labelStep++;
    if(/The only way to connect/.test(title)) splitStep++;
    if(isFact){
      if(!/same colour/.test($('stepsCapText').textContent)) ringedSame = false;
      // the ringed tiles of this step all carry one colour
      const rings = [...doc.querySelectorAll('#stepsGrid rect.step-fact')].map(r => `${Math.round(+r.getAttribute('x') - 2 + 1)},${Math.round(+r.getAttribute('y') - 2 + 1)}`);
      const rc = new Set(rings.map(k => cols.get(k)));
      if(rc.size !== 1 || rc.has(undefined)) ringedSame = false;
      if(!firstFact) firstFact = { i, cols: new Map([...cols].filter(([k]) => rings.includes(k))) };
    } else if(!firstFact) groupBefore += groups.length;
    if(firstFact && i > firstFact.i) for(const [k, c] of firstFact.cols) if(cols.get(k) !== c) colourKept = false;
    maxGroups = Math.max(maxGroups, new Set([...groups].map(g => g.getAttribute('data-color'))).size);
    if(process.env.SHOW) console.log(i, title, '| groups', groups.length);
  }
  check('a label-join step ("Only one piece it can be in")', labelStep >= 1, labelStep);
  check('a split-cut step ("The only way to connect")', splitStep >= 1, splitStep);
  check('no colour group before the first fact step', groupBefore === 0, groupBefore);
  check('the ringed tiles of each fact step share one colour and the text says so', ringedSame);
  check('the first group keeps its colour on every later step (also once finished)', colourKept);
  check('no letters anywhere', letters === 0, letters);
  $('stepsLast').click(); await sleep(20);
  check('last step is the result', /Result/.test($('stepsCounter').textContent), $('stepsCounter').textContent);
  check('no group colours on the final tiling', doc.querySelectorAll('#stepsGrid rect.step-group').length === 0);

  // ---- the pool: 25 colours, reuse only when all are held, a finished piece gives its colour back ----
  // the page's code runs in a closure: take markGroupColors and GROUP_COLORS from the page source and run them here
  const html = fs.readFileSync(file, 'utf8');
  const fnSrc = html.slice(html.indexOf('  function markGroupColors(list){'), html.indexOf('\n  }\n', html.indexOf('  function markGroupColors(list){')) + 4);
  const colSrc = /const GROUP_COLORS = (\[[^\]]*\]);/.exec(html)[1];
  const pool = new Function(`const GROUP_COLORS = ${colSrc};
    const puzzle = { w: 60, h: 1, active: [Array(60).fill(1)], walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() };
    ${fnSrc}
    return (() => {
    const fact = i => ({ edges: [], facts: [{ a: [2 * i, 0], b: [2 * i + 1, 0] }], closed: [] });
    // A: 26 groups at once
    const A = []; for(let i = 0; i < 26; i++) A.push(fact(i));
    markGroupColors(A);
    const ta = A[25].groupTint, cols = [...Array(26).keys()].map(i => ta.get((2 * i) + ',0'));
    // B: 25 groups, group 3 is finished, then a new group: it must get group 3's colour (the only free one)
    const B = []; for(let i = 0; i < 25; i++) B.push(fact(i));
    B.push({ edges: [], facts: [], closed: [{ cells: [[6, 0], [7, 0]], color: '#000' }] });
    B.push(fact(27));
    markGroupColors(B);
    const c3 = B[24].groupTint.get('6,0');
    const res = { poolSize: GROUP_COLORS.length, distinct25: new Set(cols.slice(0, 25)).size, twentySixthReused: cols.slice(0, 25).includes(cols[25]),
      finishedKeeps: B[25].closed[0].color === c3, finishedNotTinted: !B[25].groupTint.has('6,0'), freedReused: B[26].groupTint.get('54,0') === c3 && c3 !== cols[0] };
    return JSON.stringify(res);
  })();`)();
  const P = JSON.parse(pool);
  check('pool has 25 colours', P.poolSize === 25, P);
  check('25 groups get 25 different colours', P.distinct25 === 25, P);
  check('the 26th group reuses a colour', P.twentySixthReused, P);
  check('a finished piece keeps its group colour', P.finishedKeeps, P);
  check('a finished piece is drawn as a piece, not as an open group', P.finishedNotTinted, P);
  check('the colour of a finished piece goes back to the pool', P.freedReused, P);
  check('no script errors', errors.length === 0, errors);
  console.log(`colors V1.0.6 UI: ${pass} passed, ${fail} failed (steps ${n}, label-join steps ${labelStep}, split-cut steps ${splitStep}, most open groups at once ${maxGroups})`);
  process.exit(fail ? 1 : 0);
})();
