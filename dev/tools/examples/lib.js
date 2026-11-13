// Shared by tiny.js and minimize.js: solve one recorded puzzle as the page does and say which rules its steps would show.
'use strict';
const PAGE_OPTS = { testMs: 100, restart: 'continue', order: 'clues', focusMode: 'near', nearShare: 0.4, useWitness: true, stopAtTwo: true,
  nodeBudget: 200000, exact: 'portfolio', slices: 's18,e', fullScan: true };
const FIELDS = ['walls', 'roses', 'polyominoes', 'areaNumbers', 'palisades', 'compasses', 'watchtowers'];
const compact = ev => ev.type === 'deduce' ? { t: 'd', k: ev.spot.key, v: ev.value, r: ev.rule, via: ev.via, c: ev.cause, p: ev.pass, y: ev.why || '' }
  : ev.type === 'fact' ? { t: 'f', kind: ev.kind, a: ev.a, b: ev.b, r: ev.rule, c: ev.cause } : { t: 's', cells: ev.cells };
const tilesOf = key => { const [o, rest] = key.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
// rec = { puzzle (clue lists as arrays of [key, value]), rules, bank, ban } -> null (no solution / too slow) or { sols, events, firstAt }
function run(S, L, rec, maxMs){
  const p = rec.puzzle, puzzle = { w: p.w, h: p.h, active: p.active };
  for(const f of FIELDS) puzzle[f] = new Map(p[f] || []);
  let ctx; try { ctx = S.buildSolverContext(puzzle, rec.bank || [], rec.rules, null, rec.ban || []); } catch(e){ return null; }
  const events = [], firstAt = new Map(); let sols = 0; const start = Date.now();
  // as the page's step view: a link between tiles already known to be in one piece belongs to the step on screen, not to its rule
  const par = new Map(), find = k => { while(par.has(k) && par.get(k) !== k) k = par.get(k); return k; }, join = (x, y) => { x = find(x); y = find(y); if(x !== y) par.set(x, y); };
  for(const [k, t] of puzzle.walls) if(t === 'link'){ const [x, y] = tilesOf(k); join(x, y); }
  try {
    for(const ev of S.deduceSolve(p.w, p.h, ctx, L.collectSpecialEdges(puzzle.walls), PAGE_OPTS)){
      if(ev.type === 'solution') sols++;
      if(ev.type === 'impossible-early') return null;
      if(ev.type === 'deduce' || ev.type === 'fact' || ev.type === 'shape'){
        events.push(compact(ev));
        let key = null, known = false;
        if(ev.type === 'deduce' && ev.value === 'same'){ const [x, y] = tilesOf(ev.spot.key); known = find(x) === find(y); join(x, y); }
        if(ev.type === 'fact' && ev.kind === 'join') join(ev.a.join(','), ev.b.join(','));
        if(ev.type === 'deduce' && ev.via === 'rule' && !known) key = ev.rule;
        if(ev.type === 'fact' && ev.kind === 'join') key = 'fact:' + ev.rule;
        if(key && !firstAt.has(key)) firstAt.set(key, { at: events.length - 1, v: ev.value || 'fact' });
      }
      if(Date.now() - start > (maxMs || 1500)) return null;
    }
  } catch(e){ return null; }
  return sols ? { sols, events, firstAt } : null;
}
// the mechanics a puzzle uses (area numbers, plain walls and holes are free helpers)
function mechanics(rec){
  const m = [], r = rec.rules || {}, p = rec.puzzle;
  for(const [k, v] of Object.entries(r)) if(v !== null && v !== false && v !== undefined) m.push(k);
  if(rec.bank && rec.bank.length) m.push('bank');
  if(rec.ban && rec.ban.length) m.push('ban');
  for(const [f, name] of [['roses', 'roses'], ['polyominoes', 'stamp'], ['palisades', 'palisade'], ['compasses', 'compass'], ['watchtowers', 'tower']]) if(p[f] && p[f].length) m.push(name);
  for(const t of new Set((p.walls || []).map(([, t]) => /^diff/.test(t) ? 'diff' : t === 'gt' ? 'lt' : t))) if(t !== 'wall') m.push(t === 'lt' ? 'ineq' : t);
  return m.sort();
}
const count = rec => { const p = rec.puzzle; return FIELDS.reduce((n, f) => n + (p[f] || []).length, 0) + (rec.bank || []).length + (rec.ban || []).length; };
const tiles = rec => rec.puzzle.active.flat().filter(Boolean).length;
module.exports = { PAGE_OPTS, FIELDS, run, mechanics, count, tiles };
