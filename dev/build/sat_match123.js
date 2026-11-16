// ---- v123: SAT final search for Match (see build/patch_core123.py) ----
// satNew(): a small CDCL SAT solver (two watched literals, VSIDS, phase saving, 1UIP learning with local minimisation,
// Luby restarts, learnt clause deletion by LBD). Literals are DIMACS style (+v / -v, v >= 1).
//   s.newVar() -> v        s.addClause([l1, l2, ...]) -> false when the formula became unsatisfiable
//   s.solve(maxConflicts) -> 1 satisfiable (s.value(v) reads the model), -1 unsatisfiable, 0 budget used up (call again)
// Clauses can be added between calls (the solver is back at level 0 after every call); learnt clauses are kept.
function satNew(){
  let nv = 0, cap = 0, ok = true;
  let assign = new Int8Array(0), level = new Int32Array(0), reason = [], act = new Float64Array(0), pol = new Uint8Array(0), seen = new Uint8Array(0);
  let heap = [], hIdx = new Int32Array(0), trail = new Int32Array(0), tLen = 0, qhead = 0;
  const trailLim = [], watches = [], learnts = [], model = [];
  let varInc = 1, claInc = 1, conflicts = 0, lubyI = 0, nextRestart = 100, nextReduce = 4000;
  function grow(n){
    if(n <= cap) return;
    let c = Math.max(16, cap * 2); while(c < n) c *= 2;
    const cp = (A, T) => { const B = new T(c); B.set(A); return B; };
    assign = cp(assign, Int8Array); level = cp(level, Int32Array); act = cp(act, Float64Array); pol = cp(pol, Uint8Array); seen = cp(seen, Uint8Array);
    const hi = new Int32Array(c).fill(-1); hi.set(hIdx); hIdx = hi; trail = cp(trail, Int32Array);
    cap = c;
  }
  const lit = l => l > 0 ? 2 * (l - 1) : 2 * (-l - 1) + 1;            // DIMACS -> 2v / 2v+1 (v 0-based)
  const val = li => { const a = assign[li >> 1]; return (li & 1) ? -a : a; };
  function hUp(i){ const v = heap[i]; while(i > 0){ const p = (i - 1) >> 1; if(act[heap[p]] >= act[v]) break; heap[i] = heap[p]; hIdx[heap[i]] = i; i = p; } heap[i] = v; hIdx[v] = i; }
  function hDown(i){ const v = heap[i], n = heap.length;
    for(;;){ let c = 2 * i + 1; if(c >= n) break; if(c + 1 < n && act[heap[c + 1]] > act[heap[c]]) c++; if(act[heap[c]] <= act[v]) break; heap[i] = heap[c]; hIdx[heap[i]] = i; i = c; }
    heap[i] = v; hIdx[v] = i; }
  function hPush(v){ if(hIdx[v] >= 0) return; heap.push(v); hIdx[v] = heap.length - 1; hUp(heap.length - 1); }
  function hPop(){ const v = heap[0], last = heap.pop(); hIdx[v] = -1; if(heap.length){ heap[0] = last; hIdx[last] = 0; hDown(0); } return v; }
  function bumpVar(v){ if((act[v] += varInc) > 1e100){ for(let i = 0; i < nv; i++) act[i] *= 1e-100; varInc *= 1e-100; } if(hIdx[v] >= 0) hUp(hIdx[v]); }
  function bumpCla(c){ if((c.act += claInc) > 1e20){ for(const d of learnts) d.act *= 1e-20; claInc *= 1e-20; } }
  function newVar(){ grow(nv + 1); const v = nv++; assign[v] = 0; level[v] = 0; reason[v] = null; act[v] = 0; pol[v] = 1; hIdx[v] = -1; watches.push([], []); hPush(v); return nv; }
  const dl = () => trailLim.length;
  function enqueue(li, from){ const v = li >> 1; assign[v] = (li & 1) ? -1 : 1; level[v] = dl(); reason[v] = from; trail[tLen++] = li; }
  function attach(c){ watches[c.lits[0]].push(c); watches[c.lits[1]].push(c); }
  function propagate(){
    while(qhead < tLen){
      const fl = trail[qhead++] ^ 1, ws = watches[fl]; let i = 0, j = 0;
      const n = ws.length;
      for(; i < n; i++){
        const c = ws[i];
        if(c.del) continue;
        const L = c.lits;
        if(L[0] === fl){ L[0] = L[1]; L[1] = fl; }
        const f = L[0];
        if(val(f) === 1){ ws[j++] = c; continue; }
        let k = 2;
        for(; k < L.length; k++) if(val(L[k]) !== -1) break;
        if(k < L.length){ L[1] = L[k]; L[k] = fl; watches[L[1]].push(c); continue; }
        ws[j++] = c;
        if(val(f) === -1){ for(i++; i < n; i++) ws[j++] = ws[i]; ws.length = j; qhead = tLen; return c; }
        enqueue(f, c);
      }
      ws.length = j;
    }
    return null;
  }
  function cancelUntil(lv){
    if(dl() <= lv) return;
    const stop = trailLim[lv];
    for(let c = tLen - 1; c >= stop; c--){ const li = trail[c], v = li >> 1; assign[v] = 0; reason[v] = null; pol[v] = li & 1; hPush(v); }
    tLen = stop; qhead = stop; trailLim.length = lv;
  }
  function analyze(confl){
    const out = [0]; let pathC = 0, p = -1, idx = tLen - 1; const cur = dl();
    do {
      if(confl.learnt) bumpCla(confl);
      const L = confl.lits;
      for(let j = (p === -1 ? 0 : 1); j < L.length; j++){
        const q = L[j], v = q >> 1;
        if(!seen[v] && level[v] > 0){ bumpVar(v); seen[v] = 1; if(level[v] >= cur) pathC++; else out.push(q); }
      }
      while(!seen[trail[idx] >> 1]) idx--;
      p = trail[idx]; idx--; confl = reason[p >> 1]; seen[p >> 1] = 0; pathC--;
    } while(pathC > 0);
    out[0] = p ^ 1;
    const all = out.slice(1); let j = 1;                             // local minimisation: drop a literal implied by the others
    for(let i = 1; i < out.length; i++){
      const v = out[i] >> 1, r = reason[v];
      if(r === null){ out[j++] = out[i]; continue; }
      let keep = false;
      for(let k = 1; k < r.lits.length; k++){ const u = r.lits[k] >> 1; if(!seen[u] && level[u] > 0){ keep = true; break; } }
      if(keep) out[j++] = out[i];
    }
    out.length = j;
    for(const q of all) seen[q >> 1] = 0;
    let bt = 0, bi = 1;
    for(let i = 1; i < out.length; i++){ const lv = level[out[i] >> 1]; if(lv > bt){ bt = lv; bi = i; } }
    if(out.length > 1){ const t = out[1]; out[1] = out[bi]; out[bi] = t; }
    const lv = new Set(); for(const q of out) lv.add(level[q >> 1]);
    return { lits: out, bt, lbd: lv.size };
  }
  function luby(i){ let size = 1, seq = 0; while(size < i + 1){ seq++; size = 2 * size + 1; } let x = i; while(size - 1 !== x){ size = (size - 1) >> 1; seq--; x = x % size; } return Math.pow(2, seq); }
  function reduceDB(){
    learnts.sort((a, b) => (a.lbd - b.lbd) || (b.act - a.act));
    const keep = [], half = learnts.length >> 1;
    for(let i = 0; i < learnts.length; i++){
      const c = learnts[i], v = c.lits[0] >> 1;
      const locked = reason[v] === c && val(c.lits[0]) === 1;
      if(i < half || c.lbd <= 2 || locked) keep.push(c); else c.del = true;
    }
    learnts.length = 0; for(const c of keep) learnts.push(c);
  }
  function addClause(ls){
    if(!ok) return false;
    cancelUntil(0);
    const seenL = new Map(), L = [];
    for(const l of ls){
      const li = lit(l); grow((li >> 1) + 1);
      if(seenL.has(li ^ 1)) return true;                               // tautology
      if(seenL.has(li)) continue;
      const vv = val(li);
      if(vv === 1) return true;                                        // already true at level 0
      if(vv === -1) continue;                                          // false at level 0
      seenL.set(li, 1); L.push(li);
    }
    if(L.length === 0){ ok = false; return false; }
    if(L.length === 1){ enqueue(L[0], null); if(propagate()){ ok = false; return false; } return true; }
    attach({ lits: L, learnt: false, lbd: 0, act: 0, del: false });
    return true;
  }
  function solve(maxConf){
    if(!ok) return -1;
    cancelUntil(0);
    if(propagate()){ ok = false; return -1; }
    let used = 0;
    for(;;){
      const confl = propagate();
      if(confl){
        conflicts++; used++;
        if(dl() === 0){ ok = false; return -1; }
        const { lits: L, bt, lbd } = analyze(confl);
        cancelUntil(bt);
        if(L.length === 1) enqueue(L[0], null);
        else { const c = { lits: L, learnt: true, lbd, act: 0, del: false }; attach(c); learnts.push(c); bumpCla(c); enqueue(L[0], c); }
        varInc /= 0.95; claInc /= 0.999;
        if(conflicts >= nextRestart){ lubyI++; nextRestart = conflicts + 100 * luby(lubyI); cancelUntil(0); }
        if(conflicts >= nextReduce){ nextReduce = conflicts + 4000 + 300 * Math.floor(conflicts / 4000); reduceDB(); }
        continue;
      }
      if(used >= maxConf){ cancelUntil(0); return 0; }
      let v = -1;
      while(heap.length){ const x = hPop(); if(assign[x] === 0){ v = x; break; } }
      if(v < 0){ for(let i = 0; i < nv; i++) model[i] = assign[i] > 0; cancelUntil(0); return 1; }
      trailLim.push(tLen); enqueue(2 * v + pol[v], null);
    }
  }
  return { newVar, addClause, solve, value: v => !!model[v - 1], get conflicts(){ return conflicts; }, get vars(){ return nv; } };
}

// satMatchCases(T): the Match search over one tiling. Every piece is a motion of piece 0 (the piece of the first tile): one
// selector per orientation and per tile the first tile lands on. What the encoding holds exactly: tiles split into K = T/d pieces,
// piece 0 connected (the others are its images, so they are too), the walls and links already proved, palisades, area numbers
// (only in the size case they name). Everything else (and these again) is checked on each tiling by the exact checker `check`
// (a wrong tiling is blocked and the search goes on), so a tiling is reported only when it is a real solution.
// T = { tiles: [[c, r]], adj: [[i, j, key]], walls: Set(key), links: [[i, j]], pal: Map(i -> allowed side masks N1 E2 S4 W8),
//       side: (i, dir) -> j | -1, area: Map(i -> n), sizes: [d], check: wallSet -> pieces | null, deadline, maxClauses }
// yields { type: 'progress' } now and then, { type: 'solution', pieces } for each real solution, { type: 'timeout' };
// returns 'done' | 'too-big' (nothing was searched: the caller uses its own search).
function* satMatchCases(T){
  const n = T.tiles.length, ORI = [[1, 0, 0, 1], [0, -1, 1, 0], [-1, 0, 0, -1], [0, 1, -1, 0], [-1, 0, 0, 1], [1, 0, 0, -1], [0, 1, 1, 0], [0, -1, -1, 0]];
  const at = new Map(); T.tiles.forEach(([c, r], i) => at.set(c + ',' + r, i));
  const sizes = T.sizes.filter(d => d >= 1 && n % d === 0);
  for(const d of sizes){ const K = n / d; if(K > 1 && (K - 1) * 16 * n * n > (T.maxClauses || 4e6)) return 'too-big'; }
  const [c0, r0] = T.tiles[0];
  const maps = [];                                                  // maps[o * n + t] = Int32Array: tile s -> its image (-1 off the board)
  for(let o = 0; o < 8; o++){ const [a, b, cc, dd] = ORI[o];
    for(let t = 0; t < n; t++){ const [ct, rt] = T.tiles[t], m = new Int32Array(n);
      for(let s = 0; s < n; s++){ const dx = T.tiles[s][0] - c0, dy = T.tiles[s][1] - r0, j = at.get((ct + a * dx + b * dy) + ',' + (rt + cc * dx + dd * dy)); m[s] = j === undefined ? -1 : j; }
      maps.push(m); } }
  let found = 0;
  for(const d of sizes){
    const K = n / d;
    if([...T.area.values()].some(a => a !== d)) continue;           // an area number names the size of every piece
    const s = satNew(), X = [];
    for(let i = 0; i < n; i++){ const row = []; for(let k = 0; k < K; k++) row.push(s.newVar()); X.push(row); }
    for(let i = 0; i < n; i++){                                       // exactly one piece per tile
      s.addClause(X[i].slice());
      if(K <= 6){ for(let a = 0; a < K; a++) for(let b = a + 1; b < K; b++) s.addClause([-X[i][a], -X[i][b]]); }
      else { let prev = X[i][0]; for(let k = 1; k < K; k++){ const q = s.newVar(); s.addClause([-prev, q]); s.addClause([-X[i][k], q]); s.addClause([-prev, -X[i][k]]); prev = q; } }
    }
    s.addClause([X[0][0]]);
    if(K > 2){                                                        // pieces numbered by their first tile
      const P = []; for(let i = 0; i < n; i++){ const row = [0]; for(let k = 1; k < K; k++) row.push(s.newVar()); P.push(row); }
      for(let i = 0; i < n; i++) for(let k = 1; k < K; k++){
        const p = P[i][k];
        s.addClause([-X[i][k], p]); if(i > 0){ s.addClause([-P[i - 1][k], p]); s.addClause([-p, P[i - 1][k], X[i][k]]); } else s.addClause([-p, X[i][k]]);
        if(k + 1 < K){ if(i > 0) s.addClause([-P[i][k + 1], P[i - 1][k]]); else s.addClause([-P[i][k + 1]]); }
      }
    }
    const D = new Map();                                              // D(key) <=> the two tiles are in different pieces
    for(const [i, j, key] of T.adj){
      const e = s.newVar(); D.set(key, e);
      for(let k = 0; k < K; k++){ s.addClause([-e, -X[i][k], -X[j][k]]); s.addClause([e, -X[i][k], X[j][k]]); s.addClause([e, X[i][k], -X[j][k]]); }
      if(T.walls.has(key)) s.addClause([e]);
    }
    for(const [i, j] of T.links){ const key = T.adj.find(a => (a[0] === i && a[1] === j) || (a[0] === j && a[1] === i)); if(key) s.addClause([-D.get(key[2])]); else for(let k = 0; k < K; k++){ s.addClause([-X[i][k], X[j][k]]); s.addClause([X[i][k], -X[j][k]]); } }
    for(const [i, masks] of T.pal){                                   // palisades: the sides with a wall form one of the allowed masks
      const lits = [];
      for(let dir = 0; dir < 4; dir++){ const j = T.side(i, dir); if(j < 0) lits.push(true); else { const key = T.adj.find(a => (a[0] === i && a[1] === j) || (a[0] === j && a[1] === i))[2]; lits.push(D.get(key)); } }
      for(let m = 0; m < 16; m++){
        if(masks.includes(m)) continue;
        const cl = []; let possible = true;
        for(let dir = 0; dir < 4; dir++){ const want = (m >> dir) & 1, L = lits[dir];
          if(L === true){ if(!want){ possible = false; break; } continue; }
          cl.push(want ? -L : L); }
        if(possible) s.addClause(cl);
      }
    }
    if(K > 1){                                                        // piece 0 connected: reach layers from tile 0
      const nb = Array.from({ length: n }, () => []);
      for(const [i, j, key] of T.adj) if(!T.walls.has(key)){ nb[i].push(j); nb[j].push(i); }
      let prev = new Int32Array(n); for(let i = 0; i < n; i++){ prev[i] = s.newVar(); s.addClause(i === 0 ? [prev[i]] : [-prev[i]]); }
      for(let step = 1; step < d; step++){
        const cur = new Int32Array(n);
        for(let i = 0; i < n; i++){ cur[i] = s.newVar(); s.addClause([-cur[i], X[i][0]]); s.addClause([-cur[i], prev[i]].concat(nb[i].map(j => prev[j]))); }
        prev = cur;
      }
      for(let i = 0; i < n; i++) s.addClause([-X[i][0], prev[i]]);
    }
    for(let k = 1; k < K; k++){                                       // piece k = a motion of piece 0
      const sel = [];
      for(let mi = 0; mi < maps.length; mi++){
        const m = maps[mi], t = m[0]; if(t < 0) continue;
        const v = s.newVar(); sel.push(v);
        const pre = new Int32Array(n).fill(-1); for(let q = 0; q < n; q++) if(m[q] >= 0) pre[m[q]] = q;
        for(let q = 0; q < n; q++){
          if(m[q] < 0) s.addClause([-v, -X[q][0]]); else s.addClause([-v, -X[q][0], X[m[q]][k]]);
          if(pre[q] < 0) s.addClause([-v, -X[q][k]]); else s.addClause([-v, -X[q][k], X[pre[q]][0]]);
        }
      }
      s.addClause(sel);
      if(T.deadline != null && Date.now() > T.deadline){ yield { type: 'timeout' }; return 'done'; }
      yield { type: 'progress', nodes: 0, leaves: 0, fraction: null };
    }
    let bud = 100;                                                    // conflicts per slice, kept near 100 ms so the page stays responsive
    for(;;){
      if(T.deadline != null && Date.now() > T.deadline){ yield { type: 'timeout' }; return 'done'; }
      const t0 = Date.now(), r = s.solve(bud), dt = Date.now() - t0;
      if(dt < 50) bud = Math.min(bud * 2, 100000); else if(dt > 200) bud = Math.max(10, bud >> 1);
      if(r === 0){ yield { type: 'progress', nodes: s.conflicts, leaves: 0, fraction: null }; continue; }
      if(r < 0) break;
      const W = new Set(), block = [];
      for(const [, , key] of T.adj){ const e = D.get(key); if(s.value(e)){ W.add(key); block.push(-e); } else block.push(e); }
      const pieces = T.check(W);
      if(pieces){ found++; yield { type: 'solution', pieces }; if(T.stopAtTwo !== false && found >= 2) return 'done'; }
      if(!s.addClause(block)) break;
    }
  }
  return 'done';
}
