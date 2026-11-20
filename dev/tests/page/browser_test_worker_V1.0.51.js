#!/usr/bin/env node
// V1.0.51: the solver runs in a Web Worker. Real browser test (Playwright + Chromium, page opened as a file:// URL, like a user does):
//   * the Solve run uses a worker and still finds the same answer and step count as without one (window.Worker removed);
//   * the page keeps painting: the longest gap between two 10 ms timer ticks stays small during the solve;
//   * every edge the status counts is drawn at once, even when the solver then runs long without an event (a synthetic 19x19 Solitude
//     board with blank compasses: the first pass decides walls in one go, then the probes run for a long time);
//   * Cancel ends a worker run at once.
// Needs the playwright package and its Chromium (not part of npm install here).   node tests/page/browser_test_worker_V1.0.51.js [page.html]
'use strict';
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require('playwright');
const page_ = path.resolve(process.argv[2] || path.join(__dirname, '../../../glimmith_solver_V1.0.51.html'));
let pass = 0, fail = 0;
const check = (ok, what, info) => { if(ok) pass++; else { fail++; console.log('FAIL:', what, info !== undefined ? '-> ' + JSON.stringify(info) : ''); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'glw-'));
function puzzleFile(name, w, h, sizeRules, compasses){
  const f = path.join(tmp, name + '.glimmith.json');
  const rules = Object.assign({ precision: null, min: null, max: null, mismatch: false, match: false, mingleShape: false, mingleArea: false, solitude: false, boxy: false, nonBoxy: false, bricky: false, loopy: false, wally: false, heterogeneous: false }, sizeRules);
  fs.writeFileSync(f, JSON.stringify({ format: 'glimmith-puzzle', version: 1, puzzles: [{ name, state: { puzzle: { w, h, active: Array.from({ length: h }, () => Array(w).fill(1)), walls: [], roses: [], polyominoes: [],
    areaNumbers: [], palisades: [], compasses, watchtowers: [] }, shapeBank: [], banShapes: [], sizeRules: rules, solverLimits: { maxRegions: null, maxRegionSize: null } } }] }));
  return f;
}
const small = path.join(__dirname, '../../fixtures/compass_V1.0.17.glimmith.json');
// synthetic big board: blank compasses on a fixed pseudo-random set of tiles, Solitude, Maximum 7
const cmps = []; { let s = 12345; const R = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; const used = new Set();
  while(cmps.length < 70){ const k = `${Math.floor(R() * 19)},${Math.floor(R() * 19)}`; if(used.has(k)) continue; used.add(k); cmps.push([k, { n: null, e: null, s: null, w: null }]); } }
const big = puzzleFile('synthetic solitude', 19, 19, { solitude: true, max: 7 }, cmps);

async function open(b, noWorker){
  const p = await (await b.newContext()).newPage();
  if(noWorker) await p.addInitScript(() => { delete window.Worker; });
  const info = { workers: 0, errors: [] }; p.on('worker', () => info.workers++); p.on('pageerror', e => info.errors.push(e.message));
  await p.goto('file://' + page_);
  return { p, info };
}
const status = p => p.evaluate(() => document.getElementById('solverStatus').textContent);
async function solve(p, file){
  await p.setInputFiles('#importFile', file); await p.waitForTimeout(600);
  await p.evaluate(() => { window.__gap = 0; let last = performance.now(); clearInterval(window.__iv); window.__iv = setInterval(() => { const n = performance.now(); window.__gap = Math.max(window.__gap, n - last); last = n; }, 10); });
  await p.click('#solveBtn');
  await p.waitForFunction(() => /Unique|Not unique|Impossible/.test(document.getElementById('solverStatus').textContent), null, { timeout: 120000, polling: 100 });
  await p.click('#stepsBtn'); await p.waitForTimeout(800);
  return p.evaluate(() => ({ status: document.getElementById('solverStatus').textContent.slice(0, 30), steps: document.getElementById('stepsCounter').textContent, gap: window.__gap }));
}
(async () => {
  const b = await chromium.launch();
  try {
    const A = await open(b, false), B = await open(b, true);
    const ra = await solve(A.p, small), rb = await solve(B.p, small);
    check(A.info.workers >= 1, 'the Solve run uses a worker', A.info);
    check(B.info.workers === 0, 'without window.Worker the page solves on its own thread', B.info);
    check(ra.status === rb.status && ra.steps === rb.steps, 'same answer and steps with and without the worker', { ra, rb });
    check(ra.gap < 250, 'the page keeps painting during a worker run', ra.gap);
    check(!A.info.errors.length && !B.info.errors.length, 'no page errors', [A.info.errors, B.info.errors]);
    // every counted edge is drawn, while the solver works on
    const C = await open(b, false);
    await C.p.setInputFiles('#importFile', big); await C.p.waitForTimeout(600);
    await C.p.click('#solveBtn'); await C.p.waitForTimeout(4000);
    const d = await C.p.evaluate(() => { const m = /(\d+) walls, (\d+) same-piece/.exec(document.getElementById('solverStatus').textContent);
      return { walls: m ? +m[1] : -1, links: m ? +m[2] : -1, drawnW: document.querySelectorAll('.ded-walls > *').length, drawnL: document.querySelectorAll('.ded-links > *').length, st: document.getElementById('solverStatus').textContent.slice(0, 50) }; });
    check(d.walls > 0 && d.drawnW === d.walls && d.drawnL === d.links, 'every wall and link the status counts is drawn', d);
    const t0 = Date.now(); await C.p.click('#cancelSolveBtn');
    await C.p.waitForFunction(() => /Cancelled/.test(document.getElementById('solverStatus').textContent), null, { timeout: 30000, polling: 20 });
    check(Date.now() - t0 < 1000, 'Cancel ends a worker run at once', Date.now() - t0);
  } finally { await b.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
  console.log(`worker V1.0.51 browser: ${pass} passed, ${fail} failed`);
})();
