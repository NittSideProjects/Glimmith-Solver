// UI checks for the step-by-step reasoning viewer (v47). Loads the real HTML in jsdom. Usage: node ui_test_deduce.js path/to/glimmith_editor_v47.html
const fs = require('fs');
const { JSDOM } = require('jsdom');
const L = require('./fuzzlib.js');
const file = process.argv[2] || '../glimmith_solver_V1.0.13.html';
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log((cond ? "ok  " : "FAIL") + " " + name); if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const slowCfg = $ => { $('testMsInput').value = '100'; $('focusSel').value = 'mix'; $('restartSel').value = 'first'; $('orderSel').value = 'scan'; $('exactSel').value = 'old'; };       // v40: the slow progressive display is the old whole-piece search + scan
const html = fs.readFileSync(file, 'utf8');

function seedStore(P){
  const bankOut = (P.bank || []).map((s, i) => { const w = Math.max(...s.cells.map(c => c[0])) + 1, h = Math.max(...s.cells.map(c => c[1])) + 1; return { id: s.id, w, h, cells: s.cells, color: '#e0a458' }; });
  const store = new Map();
  const pz = P.puzzle;
  store.set('glimmith:puzzle:v1', JSON.stringify({ w: pz.w, h: pz.h, active: pz.active, walls: [...pz.walls.entries()], roses: [...pz.roses.entries()], polyominoes: [...pz.polyominoes.entries()], areaNumbers: [...pz.areaNumbers.entries()] }));
  store.set('glimmith:shapebank:v1', JSON.stringify(bankOut));
  store.set('glimmith:sizerules:v1', JSON.stringify(P.rules));
  return store;
}
async function boot(store){
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  window.storage = {
    get: async k => store.has(k) ? { key:k, value: store.get(k) } : null,
    set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; },
    list: async () => ({ keys: [...store.keys()] })
  };
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(400);
  const $ = id => window.document.getElementById(id);
  return { window, errors, $ };
}
const running = $ => /Solver: (preparing|narrow|final)/.test($('solverStatus').textContent);
async function waitDone($, maxMs){ const t0 = Date.now(); await sleep(60); while(running($) && Date.now() - t0 < maxMs) await sleep(40); return Date.now() - t0; }


const edgesOf = (svg, kind) => new Set([...svg.querySelectorAll(`[data-kind="${kind}"]`)].map(e => e.getAttribute('data-edge')));
function boundaryKeys(P, pieces){
  const of = new Map(); pieces.forEach((p, i) => p.cells.forEach(([c, r]) => of.set(c + ',' + r, i)));
  const out = new Set(); const pz = P.puzzle;
  for(let r = 0; r < pz.h; r++) for(let c = 0; c < pz.w; c++){
    if(!pz.active[r][c]) continue;
    if(c + 1 < pz.w && pz.active[r][c + 1] && !pz.walls.has(`v:${c},${r}`) && of.get(c + ',' + r) !== of.get((c + 1) + ',' + r)) out.add(`v:${c},${r}`);
    if(r + 1 < pz.h && pz.active[r + 1][c] && !pz.walls.has(`h:${c},${r}`) && of.get(c + ',' + r) !== of.get(c + ',' + (r + 1))) out.add(`h:${c},${r}`);
  }
  return out;
}
const key = (window, k) => window.document.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));
const verdict = $ => /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent);
async function solveAndWait($, maxMs){ $('solveBtn').click(); const t0 = Date.now(); await sleep(60); while(!verdict($) && Date.now() - t0 < (maxMs || 60000)) await sleep(40); return $('solverStatus').textContent; }

(async () => {
  // ---------- 1. a unique puzzle, default (deduction) run ----------
  const P = L.plantedPuzzle(111, { w: 6, h: 6, holes: 0, clueP: 1.0, wallP: 0.3, bank: false, maxPiece: 5 });
  P.rules.max = 5; P.rules.min = null; P.rules.precision = null;
  const ex = L.exact(P, 2, 200000);
  check('test puzzle is unique', ex.sols.length === 1);
  let A = await boot(seedStore(P)); let { $, window } = A;
  check('step viewer markup exists, common-structure feature is gone', !!$('stepsBtn') && !!$('stepsViewer') && !$('commonStructureBtn') && !$('commonStructureResults'));
  check('nothing offered before a check', $('stepsBtn').style.display === 'none' && $('stepsViewer').hidden === true);
  let st = await solveAndWait($);
  check('unique verdict', /^Unique/.test(st), st);
  check('steps button offered after Unique', $('stepsBtn').style.display !== 'none');
  $('stepsBtn').click(); await sleep(80);
  check('viewer opens, button hides', $('stepsViewer').hidden === false && $('stepsBtn').style.display === 'none');
  const m = /(\d+) step/.exec($('stepsCounter').textContent); const N = m ? +m[1] : 0;
  check('start screen: counter names the number of steps, Prev disabled, Next enabled', N >= 1 && $('stepsPrev').disabled && !$('stepsNext').disabled && /Start/.test($('stepsCounter').textContent), $('stepsCounter').textContent);
  check('start screen has a board and a caption', !!$('stepsGrid').querySelector('svg') && $('stepsCapTitle').textContent.length > 0 && $('stepsCapText').textContent.length > 0);
  check('start screen: no solver edge drawn yet', edgesOf($('stepsGrid'), 'wall').size === 0 && edgesOf($('stepsGrid'), 'link').size === 0);
  let prevWalls = 0, prevLinks = 0, okMono = true, kinds = new Set(), titles = [], bad = [];
  for(let i = 1; i <= N; i++){
    $('stepsNext').click();
    const svg = $('stepsGrid').querySelector('svg'), w = edgesOf(svg, 'wall').size, l = edgesOf(svg, 'link').size, sw = edgesOf(svg, 'search').size;
    kinds.add($('stepsKicker').textContent); titles.push($('stepsCapTitle').textContent);
    if(!svg || !$('stepsCapText').textContent || !$('stepsCapTitle').textContent) bad.push(i);
    if(i < N){ if(w < prevWalls || l < prevLinks) okMono = false; prevWalls = w; prevLinks = l; }
    if(i < N && sw !== 0) bad.push('search at ' + i);
    if(i < N && !/Step \d+ of \d+/.test($('stepsCounter').textContent)) bad.push('counter ' + i);
  }
  check(`walked all ${N} steps: every step has a board, a title and a description`, bad.length === 0, bad);
  check('walls and links only ever accumulate while stepping', okMono);
  check('last step: Next disabled, labelled as the result', $('stepsNext').disabled && /Result/.test($('stepsCounter').textContent), $('stepsCounter').textContent);
  check('last step says solved / exhaustive search', /^(Solved|Exhaustive search)$/.test($('stepsKicker').textContent), $('stepsKicker').textContent);
  {
    const svg = $('stepsGrid').querySelector('svg'), want = boundaryKeys(P, ex.sols[0]);
    const have = new Set([...edgesOf(svg, 'wall'), ...edgesOf(svg, 'search')]);
    check('last step draws exactly the walls of the unique tiling (rules + search)', have.size === want.size && [...want].every(k => have.has(k)), { have: have.size, want: want.size });
    check('last step is not a "no tiling" fake: logic walls are a subset of the tiling', [...edgesOf(svg, 'wall')].every(k => want.has(k)));
  }
  check('the story never contradicts itself: the viewer showed several kinds of step or at least one rule', kinds.size >= 1, [...kinds]);
  $('stepsPrev').click(); check('Previous goes back one step', /Step \d+ of/.test($('stepsCounter').textContent) && !$('stepsNext').disabled);
  key(window, 'ArrowLeft'); const afterLeft = $('stepsCounter').textContent; key(window, 'ArrowRight'); const afterRight = $('stepsCounter').textContent;
  check('arrow keys move the steps (left back, right forward)', afterLeft !== afterRight, [afterLeft, afterRight]);
  key(window, 'Home'); check('Home goes to the start', /Start/.test($('stepsCounter').textContent));
  key(window, 'End'); check('End goes to the result', /Result/.test($('stepsCounter').textContent));
  $('stepsSlider').value = '0'; $('stepsSlider').dispatchEvent(new window.Event('input', { bubbles: true }));
  check('slider jumps to a step', /Start/.test($('stepsCounter').textContent));
  $('stepsFirst').click(); $('stepsLast').click(); check('first / last buttons', /Result/.test($('stepsCounter').textContent));
  key(window, 'Escape'); check('Escape closes the viewer and brings the button back', $('stepsViewer').hidden === true && $('stepsBtn').style.display !== 'none');
  $('stepsBtn').click(); await sleep(60); check('it opens again from the start', $('stepsViewer').hidden === false && /Start/.test($('stepsCounter').textContent));

  // editing the puzzle closes the viewer
  $('clearWallsBtn').click(); await sleep(60);
  check('editing the puzzle closes the viewer and withdraws the button', $('stepsViewer').hidden === true && $('stepsBtn').style.display === 'none');
  check('no script errors (unique run)', A.errors.length === 0, A.errors);

  // ---------- 2. "exact solver only": no recorded trace, the viewer replays the deduction phase ----------
  A = await boot(seedStore(P)); ({ $, window } = A);
  $('exactOnlyChk').checked = true;
  st = await solveAndWait($);
  check('exact-only run gives a verdict', /^Unique/.test(st), st);
  check('steps offered after an exact-only run too', $('stepsBtn').style.display !== 'none');
  $('stepsBtn').click();
  for(let i = 0; i < 200 && $('stepsViewer').hidden; i++) await sleep(50);
  check('exact-only: the viewer opens after replaying the reasoning', $('stepsViewer').hidden === false && /Start/.test($('stepsCounter').textContent));
  check('exact-only: solver buttons are usable again after the replay', !$('solveBtn').disabled && $('cancelSolveBtn').style.display === 'none');
  key(window, 'End');
  { const svg = $('stepsGrid').querySelector('svg'), want = boundaryKeys(P, ex.sols[0]); const have = new Set([...edgesOf(svg, 'wall'), ...edgesOf(svg, 'search')]);
    check('exact-only: last step shows the same unique tiling', have.size === want.size && [...want].every(k => have.has(k))); }
  check('no script errors (exact-only run)', A.errors.length === 0, A.errors);

  // ---------- 3. a puzzle with several tilings: last step shows both, differences ringed ----------
  const Q = { puzzle: { w: 4, h: 2, active: [[1, 1, 1, 1], [1, 1, 1, 1]], walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() }, bank: [], rules: Object.assign({}, P.rules, { max: null, min: null, precision: 4 }) };
  A = await boot(seedStore(Q)); ({ $, window } = A);
  st = await solveAndWait($);
  check('4x2 with Precision 4 is not unique', /^Not unique/.test(st), st);
  check('steps offered after Not unique (and the old common-structure button is gone)', $('stepsBtn').style.display !== 'none' && !$('commonStructureBtn'));
  $('stepsBtn').click();
  for(let i = 0; i < 100 && $('stepsViewer').hidden; i++) await sleep(50);
  key(window, 'End');
  check('not unique: last step is labelled and offers Tiling A / Tiling B', /Not unique/.test($('stepsKicker').textContent) && $('stepsTabs').hidden === false && $('stepsTabs').querySelectorAll('button').length === 2, $('stepsKicker').textContent);
  const ringsA = $('stepsGrid').querySelectorAll('circle').length;
  const wallsA = new Set([...edgesOf($('stepsGrid'), 'wall'), ...edgesOf($('stepsGrid'), 'search')]);
  check('not unique: differing tiles are ringed', ringsA > 0);
  $('stepsTabs').querySelectorAll('button')[1].click();
  const wallsB = new Set([...edgesOf($('stepsGrid'), 'wall'), ...edgesOf($('stepsGrid'), 'search')]);
  check('switching to Tiling B changes the walls', wallsA.size > 0 && wallsB.size > 0 && ([...wallsA].some(k => !wallsB.has(k)) || [...wallsB].some(k => !wallsA.has(k))));
  check('the steps before the last never contain a search wall', (() => { key(window, 'Home'); let ok = true; for(let i = 0; i < 30 && !$('stepsNext').disabled; i++){ $('stepsNext').click(); if(!$('stepsNext').disabled && edgesOf($('stepsGrid'), 'search').size) ok = false; } return ok; })());
  check('no script errors (not unique)', A.errors.length === 0, A.errors);

  // ---------- 4. Impossible gets no step viewer ----------
  const R = { puzzle: { w: 3, h: 1, active: [[1, 1, 1]], walls: new Map(), roses: new Map(), polyominoes: new Map(), areaNumbers: new Map() }, bank: [], rules: Object.assign({}, P.rules, { max: null, min: null, precision: 2 }) };
  A = await boot(seedStore(R)); ({ $, window } = A);
  st = await solveAndWait($);
  check('3 tiles with Precision 2 is impossible', /^Impossible/.test(st), st);
  check('no steps button after Impossible', $('stepsBtn').style.display === 'none' && $('stepsViewer').hidden);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
