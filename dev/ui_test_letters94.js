// v94 page: far-apart tiles known to be one piece get a step of their own and a small letter on every tile of that piece.
// node ui_test_letters94.js ../glimmith_solver_V1.0.12.html /path/to/Open-Traveling-Salesman.glimmith.json
const { JSDOM } = require('jsdom'); const fs = require('fs');
const file = process.argv[2] || '../glimmith_solver_V1.0.12.html', pz = process.argv[3];
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
  check('solver info says all', /on all of them in under a minute/.test($('solverPctLine').textContent), $('solverPctLine').textContent);
  check('no roadblock puzzle auto-imported', ![...$('puzzleSelect').options].some(o => /1434|Roadblock/i.test(o.textContent)), [...$('puzzleSelect').options].map(o => o.textContent));
  const give = async files => { const inp = $('importFile'); Object.defineProperty(inp, 'files', { value: files, configurable: true }); inp.dispatchEvent(new window.Event('change')); for(let i=0;i<200;i++){ await sleep(50); if($('importBtn').textContent === 'Import puzzles…' && !$('importBtn').disabled) break; } await sleep(50); };
  await give([new window.File([fs.readFileSync(pz)], 'p.glimmith.json')]);
  const sel = $('puzzleSelect'), opt = [...sel.options].find(o => new RegExp(process.argv[4] || 'Salesman').test(o.textContent));
  check('puzzle imported', !!opt);
  sel.value = opt.value; sel.dispatchEvent(new window.Event('change')); await sleep(100);
  $('solveBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('solveBtn').disabled && /^(Unique|Not unique|Impossible)/.test($('solverStatus').textContent)) break; }
  check('solved: unique', /^Unique/.test($('solverStatus').textContent), $('solverStatus').textContent);
  $('stepsBtn').click();
  for(let i = 0; i < 1500; i++){ await sleep(100); if(!$('stepsViewer').hidden) break; }
  const n = +(/(\d+) step/.exec($('stepsCounter').textContent) || [0, 0])[1];
  let factSteps = 0, firstLetters = null, maxLetters = 0, rings = 0, lettersBeforeFact = 0, seenFact = false;
  for(let i = 1; i < n; i++){
    $('stepsNext').click(); await sleep(5);
    const title = $('stepsCapTitle').textContent, L = [...doc.querySelectorAll('#stepsGrid text.step-letter')];
    if(/Far apart, but one piece/.test(title)){ factSteps++; seenFact = true; if(!firstLetters){ firstLetters = L.map(t => t.textContent); rings = doc.querySelectorAll('#stepsGrid rect.step-fact').length; } }
    else if(!seenFact) lettersBeforeFact += L.length;
    if(L.length > maxLetters) maxLetters = L.length;
    if(process.env.SHOW) console.log(i, title, '|', $('stepsCapText').textContent.slice(0, 110), '| letters', L.length);
  }
  check('a "Far apart, but one piece" step exists', factSteps >= 1, factSteps);
  check('no letter before the first such step', lettersBeforeFact === 0, lettersBeforeFact);
  check('the first one marks tiles with A (ringed pair)', firstLetters && firstLetters.length >= 2 && firstLetters.every(x => x === 'A') && rings >= 2, { firstLetters, rings });
  check('letters stay on the tiles of the piece', maxLetters >= 8, maxLetters);
  $('stepsLast').click(); await sleep(20);
  check('last step is the result', /Result/.test($('stepsCounter').textContent), $('stepsCounter').textContent);
  const last = doc.querySelectorAll('#stepsGrid text.step-letter').length;
  check('no letters on the final tiling', last === 0, last);
  check('no script errors', errors.length === 0, errors);
  console.log(`letters94 UI: ${pass} passed, ${fail} failed (steps ${n}, fact steps ${factSteps}, most letters ${maxLetters})`);
  process.exit(fail ? 1 : 0);
})();
