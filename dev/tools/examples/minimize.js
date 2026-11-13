// Candidates of tiny.js -> the page's examples. Every candidate is stripped of all it does not need: a rule, a clue, a wall, a bank
// shape, a compass number or a tile goes whenever the solver still uses the example's rule without it. What is left names the case
// (its mechanics and the result), and a rule keeps its simplest cases: only the ones with the fewest mechanics, at most four.
// node minimize.js <core.js> <fuzzlib.js> <cand1.json,cand2.json> <out.json> [top candidates per rule, default 10]
'use strict';
const fs = require('fs');
const [, , corePath, libPath, inPaths, outPath, topArg] = process.argv;
const S = require(corePath), L = require(libPath), X = require('./lib.js');
const TOP = +topArg || 10, clone = o => JSON.parse(JSON.stringify(o));
const MAIN = require.main === module, all = {};
if(MAIN) for(const f of inPaths.split(',')){ const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  for(const [k, sigs] of Object.entries(d)){ const slot = all[k] || (all[k] = []); for(const c of Object.values(sigs)) slot.push(c); } }
function connected(active){
  const h = active.length, w = active[0].length, t = []; for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(active[r][c]) t.push([c, r]);
  if(t.length < 2) return false;
  const seen = new Set([t[0].join()]), q = [t[0]];
  for(const [c, r] of q) for(const [dc, dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const x = c + dc, y = r + dr; if(x >= 0 && y >= 0 && x < w && y < h && active[y][x] && !seen.has(`${x},${y}`)){ seen.add(`${x},${y}`); q.push([x, y]); } }
  return q.length === t.length;
}
// every one-step simplification of a puzzle
function* smaller(rec){
  const p = rec.puzzle;
  for(const [k, v] of Object.entries(rec.rules || {})) if(v !== null && v !== false){ const n = clone(rec); n.rules[k] = typeof v === 'boolean' ? false : null; yield n; }
  if(rec.bank && rec.bank.length){ const n = clone(rec); n.bank = []; yield n; if(rec.bank.length > 1) for(let i = 0; i < rec.bank.length; i++){ const m = clone(rec); m.bank.splice(i, 1); yield m; } }
  if(rec.ban && rec.ban.length){ const n = clone(rec); n.ban = []; yield n; }
  for(const f of X.FIELDS) for(let i = 0; i < (p[f] || []).length; i++){ const n = clone(rec); n.puzzle[f].splice(i, 1); yield n; }
  for(let i = 0; i < (p.compasses || []).length; i++) for(const d of ['n', 'e', 's', 'w']) if(p.compasses[i][1][d] !== null && Object.values(p.compasses[i][1]).filter(v => v !== null).length > 1){
    const n = clone(rec); n.puzzle.compasses[i][1][d] = null; yield n; }
  // a tile without a clue becomes a hole (walls and towers that touch it go too)
  const held = new Set(); for(const f of ['roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses']) for(const [k] of p[f] || []) held.add(k);
  for(let r = 0; r < p.h; r++) for(let c = 0; c < p.w; c++){
    if(!p.active[r][c] || held.has(`${c},${r}`)) continue;
    const n = clone(rec); n.puzzle.active[r][c] = 0; if(!connected(n.puzzle.active)) continue;
    const gone = new Set([`v:${c},${r}`, `h:${c},${r}`, `v:${c - 1},${r}`, `h:${c},${r - 1}`]);
    n.puzzle.walls = n.puzzle.walls.filter(([k]) => !gone.has(k));
    yield n;
  }
}
// rows and columns that are all holes go; everything shifts
function trim(rec){
  const p = rec.puzzle; let c0 = 0, r0 = 0;
  while(p.active.every(row => !row[c0])) c0++;
  while(!p.active[r0].some(Boolean)) r0++;
  let c1 = p.w - 1, r1 = p.h - 1; while(p.active.every(row => !row[c1])) c1--; while(!p.active[r1].some(Boolean)) r1--;
  if(!c0 && !r0 && c1 === p.w - 1 && r1 === p.h - 1) return rec;
  const n = clone(rec), q = n.puzzle; q.w = c1 - c0 + 1; q.h = r1 - r0 + 1; q.active = p.active.slice(r0, r1 + 1).map(row => row.slice(c0, c1 + 1));
  const mv = k => { const [c, r] = k.split(',').map(Number); return `${c - c0},${r - r0}`; };
  for(const f of X.FIELDS) q[f] = (p[f] || []).map(([k, v]) => f === 'walls' ? [k.slice(0, 2) + mv(k.slice(2)), v] : [mv(k), v]);
  return n;
}
function score(rec, res, key){
  const f = res.firstAt.get(key), before = res.events.slice(0, f.at).filter(e => e.t === 'd' && e.r !== key).length;
  return X.mechanics(rec).length * 100 + X.tiles(rec) * 3 + X.count(rec) * 2 + before * 2 + (res.sols === 1 ? 0 : 6);
}
function minimize(rec, key, valid){                                   // valid(rec): an extra condition the example has to keep
  let res = X.run(S, L, rec); if(!res || !res.firstAt.has(key)) return null;
  let cur = rec, sc = score(cur, res, key);
  for(let round = 0; round < 40; round++){
    let better = null;
    for(const n of smaller(cur)){ if(valid && !valid(n)) continue; const r = X.run(S, L, n, 800); if(!r || !r.firstAt.has(key)) continue; const s = score(n, r, key); if(s < sc && (!better || s < better.s)) better = { n, r, s }; }
    if(!better) break;
    cur = better.n; res = better.r; sc = better.s;
  }
  cur = trim(cur); res = X.run(S, L, cur); if(!res || !res.firstAt.has(key)) return null;
  const f = res.firstAt.get(key), mech = X.mechanics(cur);
  // the whole step: the rule's decisions that follow at once
  let end = f.at + 1; while(end < res.events.length && (res.events[end].t !== 'd' || (res.events[end].r === key && res.events[end].p === res.events[f.at].p))) end++;
  const vals = [...new Set(res.events.slice(f.at, end).filter(e => e.t === 'd' && e.r === key).map(e => e.v))].sort();
  return { rec: cur, score: score(cur, res, key), mech, sig: mech.join('+') + '|' + (vals.join('+') || 'fact'), unique: res.sols === 1, tiles: X.tiles(cur), events: res.events.slice(0, end + 2), at: f.at };
}
const HOME = [[/^min-/, 'min'], [/^rose-/, 'roses'], [/^stamp-|^shape-fit/, 'stamp'], [/^bank-/, 'bank'], [/^ban-/, 'ban'], [/^match-/, 'match'], [/^mismatch-/, 'mismatch'],
  [/^mingle-area/, 'mingleArea'], [/^mingle-shape/, 'mingleShape'], [/^solitude/, 'solitude'], [/^box/, 'boxy'], [/^nonbox/, 'nonBoxy'], [/^pal-/, 'palisade'], [/^wally/, 'wally'],
  [/^gemini-line|^gemini-anchor/, 'gemini'], [/^bri-/, 'bricky'], [/^loo-/, 'loopy'], [/^tower/, 'tower'], [/^cmp|^compass/, 'compass'], [/^diff-/, 'diff'], [/^hetero/, 'heterogeneous']];
if(!MAIN) module.exports = { minimize, score };
else {
const out = {}, t0 = Date.now();
for(const key of Object.keys(all).sort()){
  const cands = all[key].sort((a, b) => a.score - b.score), done = new Map(), seen = new Set();
  let tried = 0;
  for(const c of cands){
    const id = JSON.stringify(c.rec); if(seen.has(id)) continue; seen.add(id);
    if(tried++ >= TOP) break;
    const m = minimize(c.rec, key); if(!m) continue;
    const old = done.get(m.sig); if(!old || m.score < old.score) done.set(m.sig, m);
  }
  let list = [...done.values()].sort((a, b) => a.score - b.score); if(!list.length) continue;
  // a rule named after a mechanic is shown with that mechanic ("Reach (Minimum)" with a Minimum, not with Non-boxy)
  const home = (HOME.find(([re]) => re.test(key)) || [])[1];
  if(home && list.some(m => m.mech.includes(home))) list = list.filter(m => m.mech.includes(home));
  const fewest = Math.min(...list.map(m => m.mech.length));
  // with no mechanic at all (area numbers only), the cases that need one size rule are worth showing too
  const SIZE = ['precision', 'min', 'max'];
  // other cases: another single mechanic (a Difference wall, an Inequality wall, ...), or the same mechanics with another result;
  // with two mechanics, a case that only swaps the helper teaches nothing
  const same = m => m.mech.join() === list[0].mech.join();
  // a simple size rule shows a general rule best (a few points are not worth a stranger mechanic)
  list.forEach(m => { m.rank = m.score + (m.mech.every(x => SIZE.includes(x)) ? 0 : 4); }); list.sort((a, b) => a.rank - b.rank);
  const WALLS = ['diff', 'ineq', 'gemini', 'delta'], looks = new Set();
  const keep = list.filter((m, i) => {
    if(!(same(m) || (fewest === 1 && m.mech.length === 1) || (fewest === 0 && m.mech.length === 1 && SIZE.includes(m.mech[0]))) || m.score > list[0].score + 130) return false;
    // another mechanic on a board that looks the same adds nothing, unless it is another kind of wall
    const look = m.tiles + '|' + m.sig.split('|')[1] + '|' + (fewest === 0 || WALLS.includes(m.mech[0]) ? m.mech.join() : '');
    if(looks.has(look)) return false; looks.add(look); return true;
  }).slice(0, 4);
  out[key] = keep;
  console.log(key.padEnd(22), keep.map(m => `${m.sig} t${m.tiles}${m.unique ? 'u' : ''}`).join('   '));
}
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(Object.keys(out).length, 'rules in', ((Date.now() - t0) / 1000).toFixed(0), 's');
}
