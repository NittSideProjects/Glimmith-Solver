// V1.0.40: in the step-by-step, consecutive steps of the same rule are numbered as one run ("part 1 of N" .. "part N of N"), across
// the solver's passes. Synthetic boards: planted tilings with Gemini walls between same-shape pieces and plain walls elsewhere (a
// puzzle solved by "walls that compare sizes" pass after pass, the author's case).
//   node tests/page/ui_test_stepruns_V1.0.40.js [page.html]
const fs = require('fs'); const { JSDOM } = require('jsdom'); const L = require('../../fuzzlib.js'), S = L.S;
const file = process.argv[2] || '../glimmith_solver_V1.0.42.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0; const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
function board(seed, mp, wp, W = 6, H = 4){                         // planted tiling, Gemini between same-shape neighbours, some plain walls
  const P0 = L.plantedPuzzle(seed, { w: W, h: H, maxPiece: mp, rich: false, noSpecials: true, clueP: 0, wallP: 0, bank: false, holes: 0 });
  const own = new Map(); P0.planted.forEach((p, k) => p.forEach(([c, r]) => own.set(c + ',' + r, k)));
  const keys = P0.planted.map(p => S.canonicalShapeKey(p)), walls = []; let z = seed * 7919 + mp; const R = () => { z = (z * 1103515245 + 12345) >>> 0; return z / 4294967296; };
  for(const [k, a] of own){ const [c, r] = k.split(',').map(Number);
    for(const [o, dc, dr] of [['v', 1, 0], ['h', 0, 1]]){ const b = own.get((c + dc) + ',' + (r + dr)); if(b === undefined || b === a) continue;
      if(keys[a] === keys[b]) walls.push([`${o}:${c},${r}`, 'gemini']); else if(R() < wp) walls.push([`${o}:${c},${r}`, 'wall']); } }
  const pz = { w: W, h: H, active: P0.puzzle.active, walls, roses: [], polyominoes: [], areaNumbers: [], palisades: [], compasses: [], watchtowers: [] };
  const rules = { precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false, bricky: false, loopy: false, wally: false, heterogeneous: false };
  return JSON.stringify({ format: 'glimmith-puzzle', version: 1, puzzles: [{ name: 'runs ' + seed, state: { puzzle: pz, shapeBank: [], banShapes: [], sizeRules: rules, solverLimits: { maxRegions: null, maxRegionSize: null } } }] });
}
// ---- 1. the numbering itself, on hand-made step lists (the function is taken from the page) ----
{
  const html = fs.readFileSync(file, 'utf8'), a = html.indexOf('  function chainRuleRuns(steps){'), b = html.indexOf('\n  }\n', a);
  check('the page has chainRuleRuns', a > 0 && b > a);
  const chainRuleRuns = new Function(html.slice(a, b + 4) + '; return chainRuleRuns;')();
  const R = (rule, pass, part, parts, extra) => Object.assign({ kind: 'rule', rule, pass }, parts ? { part, parts } : {}, extra || {});
  // the author's case: one rule, pass after pass, some passes split into one part per finished piece
  const st = chainRuleRuns([{ kind: 'start' }, R('area-rel', 0, 1, 3, { finishes: true }), R('area-rel', 0, 2, 3, { finishes: true }), R('area-rel', 0, 3, 3, { finishes: true }),
    R('area-rel', 1, 1, 2, { finishes: true }), R('area-rel', 1, 2, 2, { finishes: true }), R('area-rel', 2), { kind: 'probe', rule: 'area-rel' }, R('area-rel', 3), R('size', 3), R('size', 4)]);
  const label = x => x.parts ? x.part + '/' + x.parts : '-';
  check('one run 1..6 across three passes', st.slice(1, 7).map(label).join(' ') === '1/6 2/6 3/6 4/6 5/6 6/6', st.slice(1, 7).map(label));
  check('a probe ends the run; a lone step after it has no part number', label(st[7]) === '-' && label(st[8]) === '-', [label(st[7]), label(st[8])]);
  check('another rule makes its own run', label(st[9]) === '1/2' && label(st[10]) === '2/2', [label(st[9]), label(st[10])]);
  check('a part from a new pass is marked as applied again, a piece of the same split is not', st[4].again === true && st[5].again === false && st[6].again === true && st[2].again === false);
  check('an unsplit step in a run does not claim to finish a piece', st[6].finishes === false && st[1].finishes === true);
}
(async () => {
  let runs = 0, longest = 0;
  for(const [seed, mp, wp, W, H] of [[64, 2, 0.6, 7, 5], [44, 2, 0.6, 6, 4], [13, 2, 0.6, 6, 4]]){      // seed 64 (7x5): one rule over two passes of 3+ edges each (found by search)
    const store = new Map(), dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' }), { window } = dom;
    window.storage = { get: async k => store.has(k) ? { key: k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return {}; }, delete: async () => ({}), list: async () => ({ keys: [] }) };
    window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x: 0, y: 0, matrixTransform(){ return { x: this.x, y: this.y }; } }; };
    window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
    window.TextDecoder = require('util').TextDecoder;
    const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
    await sleep(300);
    const $ = id => window.document.getElementById(id);
    const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: [new window.File([board(seed, mp, wp, W, H)], 'b.glimmith.json')], configurable: true }); inp.dispatchEvent(new window.Event('change'));
    await sleep(800);
    $('solveBtn').click();
    for(let t = 0; t < 600; t++){ await sleep(100); if($('cancelSolveBtn').style.display === 'none') break; }
    $('stepsBtn').click();
    for(let t = 0; t < 600; t++){ await sleep(100); if($('stepsCapTitle').textContent && $('cancelSolveBtn').style.display === 'none') break; }
    const titles = [], texts = []; let last = '';
    for(let i = 0; i < 80; i++){ const c = $('stepsCounter').textContent; if(c === last) break; last = c; titles.push($('stepsCapTitle').textContent); texts.push($('stepsCapText').textContent); $('stepsNext').click(); await sleep(10); }
    // every "(part k of N)" is followed by "(part k+1 of N)" with the same title, until k = N; no run restarts at part 1 under the same title
    let ok = true, prevBase = null, prevK = 0, prevN = 0;
    titles.forEach((t, i) => {
      const m = /^(.*) \(part (\d+) of (\d+)\)$/.exec(t);
      if(m){ const base = m[1], k = +m[2], n = +m[3];
        if(k === 1){ if(prevBase === base && prevK === prevN && prevN > 0) ok = false; runs++; longest = Math.max(longest, n); }
        else if(!(prevBase === base && prevK === k - 1 && prevN === n)) ok = false;
        if(k > 1 && !/same deduction/i.test(texts[i])) ok = false;
        prevBase = base; prevK = k; prevN = n;
      } else { if(prevK && prevK !== prevN) ok = false; if(prevBase === t && prevK === prevN && prevN > 0) ok = false; prevBase = t; prevK = 0; prevN = 0; }
    });
    if(process.env.SHOW) console.log(seed, titles.join(' | '));
    check(`board ${seed}: parts numbered 1..N, one run per rule in a row`, ok, titles);
    check(`board ${seed}: no script errors`, errors.length === 0, errors);
    window.close();
  }
  check('boards with a run of several parts were seen', runs >= 1 && longest >= 3, { runs, longest });
  console.log(`step runs V1.0.40 UI: ${pass} passed, ${fail} failed (runs ${runs}, longest ${longest})`);
  process.exit(fail ? 1 : 0);
})();
