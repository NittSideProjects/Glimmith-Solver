#!/usr/bin/env node
// Clue-removal check on the base-game puzzles (needs dev/game_puzzles_converted, which is not in the repository).
// For each kind of clue, take puzzles that have one, remove ONE clue of that kind (seeded random choice) and solve the reduced puzzle:
//   A = the page's pipeline (deduceSolve, page defaults, stop at two), B = the exact search (solvePuzzle) on its own, both with a time limit.
// What must hold (a clue removed can only add solutions, never remove the stored one):
//   * A finds a solution; if A says "unique", that solution is the stored one;
//   * if A finds two, they differ, the stored one is among them or each one passes the full rule check of the reduced puzzle;
//   * B (when it finishes) gives the same verdict (unique / several).
// Prints one line per case and a table per clue kind (how many stayed unique, how many became non-unique, failures).
//   node tools/clue_removal.js [--per 12] [--seed 1] [--limit-s 60] [--jobs 3] [--kinds roses,areaNumbers,...] [--out file.jsonl]
'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const KINDS = ['roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers', 'wall', 'delta', 'gemini', 'ltgt', 'diff'];

function load(file){
  const j = JSON.parse(fs.readFileSync(file, 'utf8')), pz = j.puzzles[0], st = pz.state, p = st.puzzle, M = a => new Map(a || []);
  return { P: { puzzle: { w: p.w, h: p.h, active: p.active, walls: M(p.walls), roses: M(p.roses), polyominoes: M(p.polyominoes), areaNumbers: M(p.areaNumbers),
    palisades: M(p.palisades), compasses: M(p.compasses), watchtowers: M(p.watchtowers) }, bank: st.shapeBank || [], rules: st.sizeRules, ban: st.banShapes || [] },
    sol: pz.solutionWalls ? new Set(pz.solutionWalls) : null };
}
const wallKind = t => t === 'wall' ? 'wall' : (t === 'lt' || t === 'gt') ? 'ltgt' : t.startsWith('diff') ? 'diff' : t;
function cluesOf(P, kind){
  const z = P.puzzle;
  if(['roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers'].includes(kind)) return [...z[kind].keys()];
  return [...z.walls].filter(([, t]) => wallKind(t) === kind).map(([k]) => k);
}
function removeClue(P, kind, key){
  const z = P.puzzle;
  if(['roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers'].includes(kind)) z[kind].delete(key); else z.walls.delete(key);
}
function sigOfPieces(ps){ return ps.map(p => p.cells.map(c => c.join(',')).sort().join(';')).sort().join('|'); }
function piecesFromWalls(P, sw){
  const { w, h, active } = P.puzzle, id = new Map(), out = [];
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++){
    if(!active[r][c] || id.has(c + ',' + r)) continue;
    const cells = [], st = [[c, r]]; id.set(c + ',' + r, out.length);
    while(st.length){ const [x, y] = st.pop(); cells.push([x, y]);
      for(const [dx, dy, k] of [[1, 0, `v:${x},${y}`], [-1, 0, `v:${x - 1},${y}`], [0, 1, `h:${x},${y}`], [0, -1, `h:${x},${y - 1}`]]){
        const X = x + dx, Y = y + dy; if(X < 0 || Y < 0 || X >= w || Y >= h || !active[Y][X] || sw.has(k) || id.has(X + ',' + Y)) continue; id.set(X + ',' + Y, out.length); st.push([X, Y]); } }
    out.push({ cells });
  }
  return out;
}

// ------------------------------------------------------------------ worker: one case
if(!isMainThread){
  const { file, kind, key, limitMs } = workerData;
  const L = require(path.join(root, 'fuzzlib.js')), S = L.S;
  const { P, sol } = load(file); removeClue(P, kind, key);
  const ctx = S.buildSolverContext(P.puzzle, P.bank, P.rules, null, P.ban), se = L.collectSpecialEdges(P.puzzle.walls);
  const storedSig = sol ? sigOfPieces(piecesFromWalls(P, sol)) : null;
  const t0 = Date.now(), over = () => Date.now() - t0 > limitMs;
  const A = [];
  let aTimeout = false;
  for(const ev of S.deduceSolve(P.puzzle.w, P.puzzle.h, ctx, se, { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true, nodeBudget: 0, stopScan: over, deadline: t0 + limitMs })){
    if(ev.type === 'solution'){ A.push(ev.pieces); if(A.length >= 2) break; }
    else if(ev.type === 'timeout'){ aTimeout = true; break; }
    else if(ev.type === 'impossible-early') break;
    if(over()){ aTimeout = true; break; }
  }
  const aMs = Date.now() - t0;
  const aSigs0 = A.map(sigOfPieces);
  const valid = ps => {                    // the full rule check of the reduced puzzle on a tiling (every edge fixed)
    const W = new Set(), id = new Map(); ps.forEach((p, i) => p.cells.forEach(([c, r]) => id.set(c + ',' + r, i)));
    const links = [];
    for(const [k, i] of id){ const [c, r] = k.split(',').map(Number);
      for(const [dc, dr, ek] of [[1, 0, `v:${c},${r}`], [0, 1, `h:${c},${r}`]]){ const j = id.get((c + dc) + ',' + (r + dr)); if(j === undefined) continue; if(j !== i) W.add(ek); else links.push([c, r, c + dc, r + dr]); } }
    for(const ev of S.solvePuzzle(P.puzzle.w, P.puzzle.h, ctx, se, 0, { extraWalls: W, links })) if(ev.type === 'solution') return true;
    return false;
  };
  const storedOk = sol ? valid(piecesFromWalls(P, sol)) : null;    // false: the removed clue was needed by a rule (Solitude, ...): the stored tiling no longer counts
  {                                          // the page solver's verdict first: kept even if the exact search is killed
    const problems = [];
    if(!aTimeout){
      if(A.length === 0 && storedOk) problems.push('A found no solution (the stored one is still valid)');
      if(A.length === 1 && storedOk && aSigs0[0] !== storedSig) problems.push('A unique but not the stored solution');
      if(A.length === 2){ if(aSigs0[0] === aSigs0[1]) problems.push('A reported the same tiling twice'); for(const ps of A) if(!valid(ps)) problems.push('a tiling of A breaks a rule of the reduced puzzle'); }
    }
    parentPort.postMessage({ partial: true, storedOk, verdictA: aTimeout ? 'TIMEOUT' : A.length >= 2 ? 'SEVERAL' : A.length === 1 ? 'UNIQUE' : 'NONE', aMs, verdictB: 'KILLED', problems });
  }
  const t1 = Date.now(), B = []; let bTimeout = false;
  for(const ev of S.solvePuzzle(P.puzzle.w, P.puzzle.h, ctx, se, 0, { deadline: t1 + limitMs })){
    if(ev.type === 'solution'){ B.push(ev.pieces); if(B.length >= 2) break; }
    else if(ev.type === 'timeout' || ev.type === 'budget-exceeded'){ bTimeout = true; break; }
    if(Date.now() - t1 > limitMs){ bTimeout = true; break; }
  }
  const bMs = Date.now() - t1;
  const aSigs = A.map(sigOfPieces);
  const problems = [];
  if(!aTimeout){
    if(A.length === 0 && storedOk) problems.push('A found no solution (the stored one is still valid)');
    if(A.length === 1 && storedOk && aSigs[0] !== storedSig) problems.push('A unique but not the stored solution');
    if(A.length === 2){
      if(aSigs[0] === aSigs[1]) problems.push('A reported the same tiling twice');
      for(const ps of A) if(!valid(ps)) problems.push('a tiling of A breaks a rule of the reduced puzzle');
    }
  }
  if(!aTimeout && !bTimeout && Math.min(A.length, 2) !== Math.min(B.length, 2)) problems.push(`A says ${A.length}, exact search says ${B.length}`);
  parentPort.postMessage({ storedOk, rules: Object.keys(P.rules || {}).filter(k => P.rules[k]), verdictA: aTimeout ? 'TIMEOUT' : A.length >= 2 ? 'SEVERAL' : A.length === 1 ? 'UNIQUE' : 'NONE', aMs, verdictB: bTimeout ? 'TIMEOUT' : B.length >= 2 ? 'SEVERAL' : B.length === 1 ? 'UNIQUE' : 'NONE', bMs, problems });
  return;
}

// ------------------------------------------------------------------ main
const args = process.argv.slice(2), opt = {};
for(let i = 0; i < args.length; i++) if(args[i].startsWith('--')){ const k = args[i].slice(2); opt[k] = (args[i + 1] !== undefined && !args[i + 1].startsWith('--')) ? args[++i] : true; }
const per = +opt.per || 12, limitMs = 1000 * (+opt['limit-s'] || 60), jobs = +opt.jobs || 3;
let seed = +opt.seed || 1; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const dir = path.join(root, 'game_puzzles_converted'), index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const recs = index.puzzles.filter(r => r.kind === 'game' && r.inCampaign);
const kinds = opt.kinds ? String(opt.kinds).split(',') : KINDS;
const cases = [];
for(const kind of kinds){
  const withKind = recs.filter(r => cluesOf(load(path.join(dir, r.file)).P, kind).length > 0);
  for(let i = withKind.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [withKind[i], withKind[j]] = [withKind[j], withKind[i]]; }
  for(const r of withKind.slice(0, per)){ const ks = cluesOf(load(path.join(dir, r.file)).P, kind); cases.push({ id: r.id, file: path.join(dir, r.file), kind, key: ks[Math.floor(rnd() * ks.length)] }); }
}
console.log(`${cases.length} cases (${kinds.join(', ')}; up to ${per} puzzles per kind), limit ${limitMs / 1000} s per solver, ${jobs} jobs`);
const out = opt.out ? fs.openSync(opt.out, 'w') : null;
const results = []; let next = 0, running = 0;
function launch(){
  while(running < jobs && next < cases.length){
    const c = cases[next++]; running++;
    const w = new Worker(__filename, { workerData: { file: c.file, kind: c.kind, key: c.key, limitMs } });
    let done = false, partial = null;
    const kill = setTimeout(() => { if(!done){ done = true; w.terminate(); finish(c, partial || { verdictA: 'KILLED', verdictB: 'KILLED', problems: [] }); } }, 2 * limitMs + 20000);
    w.on('message', m => { if(done) return; if(m.partial){ partial = m; return; } done = true; clearTimeout(kill); w.terminate(); finish(c, m); });
    w.on('error', e => { if(done) return; done = true; clearTimeout(kill); finish(c, { verdictA: 'ERROR', verdictB: 'ERROR', problems: ['error: ' + e.message] }); });
  }
}
function finish(c, m){
  running--; const r = Object.assign({ id: c.id, kind: c.kind, key: c.key }, m); results.push(r);
  console.log(`${r.problems.length ? 'PROBLEM' : 'ok     '} ${c.kind.padEnd(12)} ${c.id.padEnd(12)} ${String(c.key).padEnd(9)} ${r.storedOk === false ? 'stored tiling breaks a rule now ' : ''}A ${r.verdictA} ${r.aMs != null ? (r.aMs / 1000).toFixed(1) + 's' : ''}  exact ${r.verdictB} ${r.bMs != null ? (r.bMs / 1000).toFixed(1) + 's' : ''} ${r.problems.join('; ')}`);
  if(out) fs.writeSync(out, JSON.stringify(r) + '\n');
  if(results.length === cases.length) report(); else launch();
}
function report(){
  console.log('\n| clue kind | cases | still unique | became non-unique | no solution (stored tiling breaks a rule) | solver timed out | exact search timed out | problems |\n|---|---|---|---|---|---|---|---|');
  for(const k of kinds){ const R = results.filter(r => r.kind === k); if(!R.length) continue;
    console.log(`| ${k} | ${R.length} | ${R.filter(r => r.verdictA === 'UNIQUE').length} | ${R.filter(r => r.verdictA === 'SEVERAL').length} | ${R.filter(r => r.verdictA === 'NONE' && r.storedOk === false).length} | ${R.filter(r => r.verdictA === 'TIMEOUT' || r.verdictA === 'KILLED').length} | ${R.filter(r => r.verdictB === 'TIMEOUT' || r.verdictB === 'KILLED').length} | ${R.filter(r => r.problems.length).length} |`); }
  console.log(`\ntotal ${results.length} cases, ${results.filter(r => r.problems.length).length} with a problem`);
}
launch();
