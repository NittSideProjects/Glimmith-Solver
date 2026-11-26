#!/usr/bin/env node
// V1.0.52: solve marks. Real browser test (Playwright + Chromium, page opened as a file:// URL), on the synthetic fixture
// fixtures/compass_V1.0.17.glimmith.json (one solution; the marks are taken from that solution, found here by the reference solver):
//   * Solve marks mode: a click on a wall spot puts a wall mark, L a link mark, a second click removes a mark, a click on a tile
//     changes nothing; the hint shows while the mode is on;
//   * Check Uniqueness takes the marks as given (right marks: still unique, and the result says how many it took as given; a wrong
//     mark: no longer the same unique answer);
//   * the step-by-step draws the marks; the export leaves them out; they stay with their puzzle when another puzzle is opened;
//   * Clear solve marks removes them; with the mode off a click edits the puzzle again.
// Needs the playwright package and its Chromium.   node tests/page/browser_test_solvemarks_V1.0.52.js [page.html]
'use strict';
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const page_ = path.resolve(process.argv[2] || require('../../pagepath.js')());
const fixture = path.join(__dirname, '../../fixtures/compass_V1.0.17.glimmith.json');
let pass = 0, fail = 0;
const check = (ok, what, info) => { if(ok) pass++; else { fail++; console.log('FAIL:', what, info !== undefined ? '-> ' + JSON.stringify(info) : ''); } };

// the fixture's solution: which wall spots are walls and which are links
const L = require(path.join(__dirname, '../../fuzzlib.js'));
const st = JSON.parse(fs.readFileSync(fixture, 'utf8')).puzzles[0].state, pz = st.puzzle, M = a => new Map(a || []);
const sol = L.deduce({ puzzle: { w: pz.w, h: pz.h, active: pz.active, walls: new Map(), roses: M(pz.roses), polyominoes: new Map(), areaNumbers: M(pz.areaNumbers),
  palisades: new Map(), compasses: M(pz.compasses), watchtowers: new Map() }, bank: [], rules: st.sizeRules, ban: [] }, { stopAtTwo: false }, 3, 0).sols;
const pieceOf = new Map(); sol[0].forEach((p, i) => p.cells.forEach(([c, r]) => pieceOf.set(c + ',' + r, i)));
const spots = []; for(let r = 0; r < pz.h; r++) for(let c = 0; c < pz.w; c++){ if(c + 1 < pz.w) spots.push(['v', c, r, pieceOf.get(c + ',' + r) !== pieceOf.get((c + 1) + ',' + r)]);
  if(r + 1 < pz.h) spots.push(['h', c, r, pieceOf.get(c + ',' + r) !== pieceOf.get(c + ',' + (r + 1))]); }
const wallSpot = spots.find(s => s[3]), linkSpot = spots.find(s => !s[3]), otherSpot = spots.find(s => s !== wallSpot && s !== linkSpot);

(async () => {
  check(sol.length === 1, 'the fixture has one solution', sol.length);
  const b = await chromium.launch();
  try {
    const p = await (await b.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 2000 } })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + page_); await p.setInputFiles('#importFile', fixture); await p.waitForTimeout(700);
    const cs = await p.evaluate(() => document.querySelector('#puzzleLayer rect').getAttribute('width') * 1 + 2);
    const at = ([o, c, r]) => p.evaluate(([x, y]) => { const s = document.getElementById('puzzleSvg'), vb = s.viewBox.baseVal, R = s.getBoundingClientRect();
      return [R.left + (x - vb.x) * R.width / vb.width, R.top + (y - vb.y) * R.height / vb.height]; }, o === 'v' ? [(c + 1) * cs, (r + 0.5) * cs] : [(c + 0.5) * cs, (r + 1) * cs]);
    const click = async s => { const [x, y] = await at(s); await p.mouse.click(x, y); await p.waitForTimeout(50); };
    const key = async (s, k) => { const [x, y] = await at(s); await p.mouse.move(x - 1, y); await p.mouse.move(x, y); await p.keyboard.press(k); await p.waitForTimeout(50); };
    const marks = () => p.evaluate(() => document.querySelectorAll('#puzzleLayer .solve-mark').length);
    const puzzleWalls = () => p.evaluate(() => document.querySelectorAll('#puzzleLayer rect[fill="var(--wall)"]').length);
    const solve = async () => { await p.click('#solveBtn');
      await p.waitForFunction(() => /Unique|Not unique|Impossible/.test(document.getElementById('solverStatus').textContent), null, { timeout: 60000, polling: 50 });
      return p.evaluate(() => document.getElementById('solverStatus').textContent); };
    const plain = await solve();
    check(/^Unique/.test(plain) && !/solve mark/.test(plain), 'without marks: unique, no note', plain);

    await p.click('#solveModeBtn');
    check(await p.evaluate(() => !document.getElementById('solveHint').hidden && document.getElementById('solveModeBtn').getAttribute('aria-pressed') === 'true'), 'solve mode on: hint shown');
    await click(wallSpot); await key(linkSpot, 'l'); await click(otherSpot);
    check(await marks() === 3, 'a click puts a wall mark, L a link mark', await marks());
    await click(otherSpot);
    check(await marks() === 2, 'a second click removes the mark', await marks());
    const tiles0 = await p.evaluate(() => document.querySelectorAll('#puzzleLayer rect[fill="var(--empty)"]').length);
    { const [x, y] = await p.evaluate(([x, y]) => { const s = document.getElementById('puzzleSvg'), vb = s.viewBox.baseVal, R = s.getBoundingClientRect(); return [R.left + (x - vb.x) * R.width / vb.width, R.top + (y - vb.y) * R.height / vb.height]; }, [cs / 2, cs / 2]);
      await p.mouse.click(x, y); }
    check(await p.evaluate(() => document.querySelectorAll('#puzzleLayer rect[fill="var(--empty)"]').length) === tiles0 && await puzzleWalls() === 0, 'in solve mode a tile click changes nothing');

    const withMarks = await solve();
    check(/^Unique/.test(withMarks) && /Your 2 solve marks were taken as given/.test(withMarks), 'right marks: unique, the note says 2 marks', withMarks);
    await p.click('#stepsBtn'); await p.waitForTimeout(700);
    check(await p.evaluate(() => document.querySelectorAll('#stepsGrid .solve-mark').length) === 2, 'the step-by-step draws the marks');

    const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#exportBtn')]);
    const txt = fs.readFileSync(await dl.path(), 'utf8');
    check(!/solveMarks/.test(txt) && /"walls":\[\]/.test(txt.replace(/\s/g, '')), 'the export leaves the marks out');

    const opts = await p.evaluate(() => [...document.getElementById('puzzleSelect').options].map(o => o.value));
    const mine = await p.evaluate(() => document.getElementById('puzzleSelect').value);
    await p.selectOption('#puzzleSelect', opts.find(v => v !== mine)); await p.waitForTimeout(400);
    const elsewhere = await marks();
    await p.selectOption('#puzzleSelect', mine); await p.waitForTimeout(400);
    check(elsewhere === 0 && await marks() === 2, 'marks stay with their puzzle', [elsewhere, await marks()]);

    await p.click('#clearSolveMarksBtn');
    check(await marks() === 0, 'Clear solve marks removes them');
    await key(wallSpot, 'l');                                    // a link where the solution has a wall
    const wrong = await solve();
    check(!/^Unique/.test(wrong) && /Your solve mark was taken as given/.test(wrong), 'a wrong mark: not the unique answer, the note says 1 mark', wrong);
    await p.click('#clearSolveMarksBtn');

    await p.click('#solveModeBtn'); await click(wallSpot);
    check(await p.evaluate(() => document.getElementById('solveModeBtn').getAttribute('aria-pressed')) === 'false' && await puzzleWalls() === 1 && await marks() === 0, 'mode off: a click edits the puzzle again');
    check(!errs.length, 'no page errors', errs);
  } finally { await b.close(); }
  console.log(`solve marks V1.0.52 browser: ${pass} passed, ${fail} failed`);
})();
