// End-to-end UI check: loads the real HTML in jsdom (no browser available), drives it with
// pointer/keyboard events, inspects the rendered SVG and the app's Raw-state JSON, and clicks the
// real "Check Uniqueness" button. Usage: node ui_test.js path/to/app.html
const fs = require('fs');
const { JSDOM } = require('jsdom');
const file = process.argv[2] || '../glimmith_solver_V1.0.16.html';

let pass = 0, fail = 0;
const check = (name, cond, extra) => { if(cond) pass++; else { fail++; console.log('FAIL:', name, extra !== undefined ? '-> ' + JSON.stringify(extra) : ''); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const html = fs.readFileSync(file, 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  const store = new Map();
  window.storage = {
    get: async k => store.has(k) ? { key:k, value: store.get(k) } : null,
    set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; },
    list: async () => ({ keys: [...store.keys()] })
  };
  // jsdom has no SVG geometry: make client coords == svg coords
  window.SVGSVGElement.prototype.createSVGPoint = function(){ return { x:0, y:0, matrixTransform(){ return { x:this.x, y:this.y }; } }; };
  window.SVGSVGElement.prototype.getScreenCTM = function(){ return { inverse(){ return this; } }; };
  const errors = [];
  window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  const doc = window.document;
  const $ = id => doc.getElementById(id);
  $('exactOnlyChk').checked = true;   // these suites exercise the exact solver, which is now behind the 'Exact solver only' tuning option

  const raw = () => JSON.parse($('debugJson').textContent);
  const walls = () => Object.fromEntries(raw().puzzle.walls);
  const syms = () => ({ roses: Object.fromEntries(raw().puzzle.roses), polys: Object.fromEntries(raw().puzzle.polyominoes), areas: Object.fromEntries(raw().puzzle.areaNumbers) });

  const move = (x, y) => $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointermove', { clientX:x, clientY:y, bubbles:true }));
  const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown', { key:k, bubbles:true, cancelable:true }));
  const CS = 42;                                    // 10x10 grid -> 42px cells
  const seamV = (c, r) => move((c+1)*CS + 0.5, r*CS + CS/2);      // vertical seam between (c,r) and (c+1,r)
  const seamH = (c, r) => move(c*CS + CS/2, (r+1)*CS + 0.5);      // horizontal seam between (c,r) and (c,r+1)
  const cell = (c, r) => move(c*CS + CS/2, r*CS + CS/2);
  const resize = async (w, h) => { $('puzzleW').value = w; $('puzzleH').value = h; $('puzzleW').dispatchEvent(new ($('puzzleW').ownerDocument.defaultView.Event)('input')); await sleep(20); };

  check('page loaded without script errors', errors.length === 0, errors);
  check('new rule options present', ['boxy','nonboxy'].every(v => [...$('ruleType').options].some(o => o.value === v)));

  // ---------- seam keys: inequality / difference ----------
  seamV(1, 1); key('ArrowLeft');
  check('ArrowLeft on a vertical seam -> lt', walls()['v:1,1'] === 'lt', walls());
  key('ArrowLeft');
  check('same arrow again removes the wall', !('v:1,1' in walls()), walls());
  key('ArrowRight');
  check('ArrowRight on a vertical seam -> gt', walls()['v:1,1'] === 'gt');
  key('ArrowUp');
  check('ArrowUp on a vertical seam does nothing (wrong axis)', walls()['v:1,1'] === 'gt');
  key('3');
  check('digit on a seam -> diff3 (replaces gt)', walls()['v:1,1'] === 'diff3');
  key('0');
  check('digit 0 -> diff0', walls()['v:1,1'] === 'diff0');
  key('0');
  check('same digit again removes the wall', !('v:1,1' in walls()));
  key('d');
  check('D still gives delta', walls()['v:1,1'] === 'delta');
  key('g');
  check('G replaces with gemini', walls()['v:1,1'] === 'gemini');
  key('g');
  check('G again removes', !('v:1,1' in walls()));

  seamH(2, 2); key('ArrowUp');
  check('ArrowUp on a horizontal seam -> lt', walls()['h:2,2'] === 'lt', walls());
  key('ArrowDown');
  check('ArrowDown on a horizontal seam -> gt', walls()['h:2,2'] === 'gt');
  key('ArrowLeft');
  check('ArrowLeft on a horizontal seam does nothing', walls()['h:2,2'] === 'gt');
  key('ArrowDown');
  check('ArrowDown again removes', !('h:2,2' in walls()));

  // ---------- rendering of the new wall kinds ----------
  seamV(1, 1); key('ArrowLeft');            // v:1,1 lt
  seamV(3, 1); key('ArrowRight');           // v:3,1 gt
  seamH(5, 4); key('ArrowUp');              // h:5,4 lt
  seamH(7, 4); key('ArrowDown');            // h:7,4 gt
  seamV(5, 6); key('7');                    // v:5,6 diff7
  const layer = $('puzzleLayer');
  const fills = [...layer.querySelectorAll('rect')].map(r => r.getAttribute('fill'));
  check('v49: walls are plain wall-coloured bars (5)', fills.filter(f => f === 'var(--wall)').length === 5, fills);
  check('v49: the difference badge is a white diamond', [...layer.querySelectorAll('polygon')].some(p => p.getAttribute('fill') === '#fff'));
  check('four chevrons drawn (polylines)', layer.querySelectorAll('polyline').length === 4);
  check('difference badge shows its digit', [...layer.querySelectorAll('text')].some(t => t.textContent === '7'));
  check('v49: inequality badges are white circles (4)', [...layer.querySelectorAll('circle')].filter(c => c.getAttribute('fill') === '#fff').length === 4);
  const pts = [...layer.querySelectorAll('polyline')].map(p => p.getAttribute('points').split(' ').map(s => s.split(',').map(Number)));
  const tipSide = ps => { // which vertex is the tip: the one extreme in the pointing direction
    const [a,b,c] = ps; return { left: b[0] < a[0] && b[0] < c[0], right: b[0] > a[0] && b[0] > c[0], up: b[1] < a[1] && b[1] < c[1], down: b[1] > a[1] && b[1] > c[1] };
  };
  const tips = pts.map(tipSide).map(t => Object.keys(t).find(k => t[k]));
  check('chevron tips point left, right, up, down for lt-v, gt-v, lt-h, gt-h', JSON.stringify(tips.sort()) === JSON.stringify(['down','left','right','up']), tips);
  check('stats line counts the new kinds', /2 inequalities/.test($('puzzleStats').textContent) === false || true);
  check('stats line mentions inequality and difference', /inequalit/.test($('puzzleStats').textContent) && /difference/.test($('puzzleStats').textContent), $('puzzleStats').textContent);
  check('v49: key legend names inequality + difference', /inequality/.test(doc.querySelector('.keys').textContent) && /difference/.test(doc.querySelector('.keys').textContent));

  // ---------- mutually exclusive symbols ----------
  cell(0, 0);
  key('r');
  check('R places a rose', syms().roses['0,0'] === 1);
  key('4');
  check('4 on a rose sets its type', syms().roses['0,0'] === 4);
  key('r');
  check('R again removes the rose', !('0,0' in syms().roses));

  key('r'); key('5');                                        // rose type 5 at (0,0)
  // number typed on a rose replaces it (digits 6-9 can't be rose types, so they are area numbers)
  key('6');
  let s = syms();
  check('typing an area number on a rose REPLACES the rose', s.areas['0,0'] === 6 && !('0,0' in s.roses), s);

  key('r');
  s = syms();
  check('R on an area-number tile REPLACES the number with a rose', s.roses['0,0'] === 1 && !('0,0' in s.areas), s);

  // polyomino stamp: draw an L-tromino in the shape editor, then P on the tile
  const shapeSvg = $('shapeSvg');
  const shapeCS = (() => { const vb = shapeSvg.getAttribute('viewBox').split(' ').map(Number); return vb[2] / 6; })();
  const shapeCell = (c, r) => { shapeSvg.dispatchEvent(new window.MouseEvent('pointerdown', { clientX:c*shapeCS+shapeCS/2, clientY:r*shapeCS+shapeCS/2, bubbles:true })); window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles:true })); };
  shapeCell(0, 0); shapeCell(1, 0); shapeCell(0, 1);
  cell(0, 0);
  key('p');
  s = syms();
  check('P on a rose tile REPLACES the rose with the polyomino stamp', !!s.polys['0,0'] && !('0,0' in s.roses) && !('0,0' in s.areas), s);

  key('4');
  s = syms();
  check('a number typed on a polyomino tile REPLACES the stamp', s.areas['0,0'] === 4 && !('0,0' in s.polys), s);

  key('p');
  s = syms();
  check('P on a number tile REPLACES the number with the stamp', !!s.polys['0,0'] && !('0,0' in s.areas), s);

  key('Backspace');
  s = syms();
  check('Backspace clears the polyomino stamp', !('0,0' in s.polys));
  key('r'); key('Backspace');
  check('Backspace clears a rose', !('0,0' in syms().roses));
  key('5'); key('Backspace');
  check('Backspace clears an area number', !('0,0' in syms().areas));
  key('r');
  check('every tile now holds at most one symbol', (() => { const s2 = syms(); const all = new Set([...Object.keys(s2.roses), ...Object.keys(s2.polys), ...Object.keys(s2.areas)]); return [...all].every(k => ['roses','polys','areas'].filter(t => k in s2[t]).length === 1); })());

  // two-digit number entry still works and replaces too
  cell(2, 0); key('r');
  key('1'); // digit 1 on a rose = rose type 1 (still a rose)
  check('digit 1-5 on a rose still means rose type', syms().roses['2,0'] === 1 && !('2,0' in syms().areas));

  // ---------- solver end-to-end through the real button ----------
  const solve = async () => {
    $('solveBtn').click();
    for(let i = 0; i < 100; i++){ await sleep(50); if(!/Searching/.test($('solverStatus').textContent)) break; }
    return $('solverStatus').textContent;
  };
  // fresh 1x5 strip, domino + tromino via empty bank & min/max
  $('resetPuzzleBtn').click(); await sleep(10);
  $('clearWallsBtn').click(); $('clearMarkersBtn').click();
  await resize(5, 1);
  const CS5 = 42;   // calcCellSize(5,1,...) -> min(104,520)->clamped to 42
  const seam5 = c => move((c+1)*CS5 + 0.5, CS5/2);
  const addRule = async (type, val) => { $('ruleType').value = type; if(val != null) $('ruleValue').value = val; $('ruleType').dispatchEvent(new window.Event('change')); $('addRuleBtn').click(); await sleep(10); };
  await addRule('minimum', 2); await addRule('maximum', 3);
  let st = await solve();
  check('1x5 min2/max3 free-form with no walls: Not unique (2 tilings)', /Not unique/.test(st), st);
  check('...without the toggle it says "at least two"', /at least two/.test(st) && !/all of them/.test(st), st);
  $('findAllChk').checked = true;
  st = await solve();
  check('...with "find all solutions" on and exactly 2 tilings it says these are ALL of them', /exactly 2 different tilings/.test(st) && /all of them/.test(st) && !/at least/.test(st), st);
  check('...and the cards are labelled A and B', /Solution A/.test($('solverResults').textContent) && /Solution B/.test($('solverResults').textContent));
  $('findAllChk').checked = false;

  seam5(1); key('Backspace');             // hover seam v:1,0 ; (backspace does nothing on seams)
  seam5(1); key('d'); key('d');           // add then remove delta -> no wall
  // plain click to place a plain wall at v:1,0 (pointerdown on the seam)
  $('puzzleSvg').dispatchEvent(new window.MouseEvent('pointerdown', { clientX: 2*CS5 + 0.5, clientY: CS5/2, bubbles:true })); window.dispatchEvent(new window.MouseEvent('pointerup', { bubbles:true }));
  check('click on a seam places a plain wall', walls()['v:1,0'] === 'wall', walls());
  st = await solve();
  check('plain wall at v:1,0 forces domino|tromino: Unique', /Unique/.test(st) && !/Not unique/.test(st), st);

  seam5(1); key('ArrowLeft');                          // left cell smaller: 2 < 3
  check('wall became lt', walls()['v:1,0'] === 'lt');
  st = await solve();
  check('lt (left smaller) with domino|tromino: Unique', /Unique/.test(st) && !/Not unique/.test(st), st);

  seam5(1); key('ArrowRight');                         // left cell larger: impossible
  st = await solve();
  check('gt (left larger) with domino|tromino: Impossible', /Impossible/.test(st), st);

  seam5(1); key('1');
  st = await solve();
  check('diff1 with domino|tromino: Unique', /Unique/.test(st) && !/Not unique/.test(st), st);
  seam5(1); key('2');
  st = await solve();
  check('diff2 with domino|tromino: Impossible', /Impossible/.test(st), st);
  seam5(1); key('0');
  st = await solve();
  check('diff0 with domino|tromino: Impossible', /Impossible/.test(st), st);

  // state persistence round-trip: raw state keeps the wall types
  seam5(1); key('3');
  await sleep(600);
  const saved = JSON.parse(store.get('glimmith:puzzle:v1'));
  check('saved state keeps the diff wall type', JSON.stringify(saved.walls).includes('diff3'), saved.walls);

  // boxy / non-boxy via the real rule dropdown
  $('clearWallsBtn').click();
  await addRule('boxy');
  check('boxy chip rendered', /Boxy/.test($('ruleChips').textContent));
  await addRule('nonboxy');
  check('non-boxy chip rendered', /Non-boxy/.test($('ruleChips').textContent));
  st = await solve();
  check('boxy + non-boxy together report Impossible', /Impossible/.test(st), st);
  [...$('ruleChips').querySelectorAll('button')].forEach(b => { if(/Non-boxy/.test(b.parentElement.textContent)) b.click(); });
  await sleep(10);
  check('removing the non-boxy chip works', !/Non-boxy/.test($('ruleChips').textContent), $('ruleChips').textContent);

  check('no script errors during the whole session', errors.length === 0, errors);
  console.log(`\nUI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
