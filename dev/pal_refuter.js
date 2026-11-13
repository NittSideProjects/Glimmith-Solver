// Independent pruned refuter for palisade puzzles (shares nothing with solver-core). tiling(Q, force?, cap?) -> true / false (throws 'refuter-cap' past `cap` nodes).
// Models: holes, hand walls, roses, Precision / Minimum / Maximum, Boxy, palisades. Returns null-ish not supported: other rules must not be set.
// ---- independent refuter: is there ANY tiling (optionally with one edge forced) that follows every rule of the puzzle? ----
// edges are assigned wall / link, palisade tiles and the forced edge first; pruned by: palisade counts, a wall can not have its two tiles joined by links,
// a piece never grows past the size limit. Leaf: connected pieces, size rules, roses, Boxy.
function tiling(Q, force, cap){
  const { w, h, active, walls, roses, palisades } = Q.puzzle, R = Q.rules, id = (c, r) => r * w + c;
  const act = (c, r) => c >= 0 && r >= 0 && c < w && r < h && active[r][c];
  const E = [], eKey = new Map();
  for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(act(c, r)){
    if(act(c + 1, r)){ eKey.set(`v:${c},${r}`, E.length); E.push([id(c, r), id(c + 1, r), walls.has(`v:${c},${r}`) ? 1 : -1]); }
    if(act(c, r + 1)){ eKey.set(`h:${c},${r}`, E.length); E.push([id(c, r), id(c, r + 1), walls.has(`h:${c},${r}`) ? 1 : -1]); }
  }
  const val = E.map(e => e[2]);
  if(force){ const i = eKey.get(force.key); if(val[i] !== -1 && val[i] !== force.v) return false; val[i] = force.v; }
  const side = (c, r) => [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([dc, dr]) => act(c + dc, r + dr) ? (dr ? eKey.get(`h:${c},${Math.min(r, r + dr)}`) : eKey.get(`v:${Math.min(c, c + dc)},${r}`)) : -1);
  const pal = [...palisades].map(([k, t]) => { const [c, r] = k.split(',').map(Number); return { c, r, t: String(t), s: side(c, r) }; });
  const palOk = p => { const wl = p.s.map(e => e < 0 ? 1 : val[e]); if(wl.includes(-1)) return true; const n = wl[0] + wl[1] + wl[2] + wl[3];
    return p.t === '0' ? n === 0 : p.t === '1' ? n === 1 : p.t === '3' ? n === 3 : p.t === '4' ? n === 4 : p.t === '2c' ? (n === 2 && wl[0] + wl[2] === 1) : (n === 2 && (wl[0] + wl[2] === 2 || wl[1] + wl[3] === 2)); };
  const hi = R.precision || R.max || 1e9, lo = R.precision || R.min || 1;
  const order = []; const seen = new Set();
  const addE = i => { if(i >= 0 && !seen.has(i)){ seen.add(i); order.push(i); } };
  if(force) addE(eKey.get(force.key));
  pal.forEach(p => p.s.forEach(addE));
  for(let i = 0; i < E.length; i++) addE(i);
  const vars = order.filter(i => val[i] === -1);
  const par = new Int32Array(w * h), sz = new Int32Array(w * h);
  const build = () => { for(let i = 0; i < w * h; i++){ par[i] = i; sz[i] = 1; }
    const f = x => { while(par[x] !== x){ par[x] = par[par[x]]; x = par[x]; } return x; };
    for(let i = 0; i < E.length; i++) if(val[i] === 0){ const a = f(E[i][0]), b = f(E[i][1]); if(a !== b){ par[a] = b; sz[b] += sz[a]; if(sz[b] > hi) return null; } }
    for(let i = 0; i < E.length; i++) if(val[i] === 1 && f(E[i][0]) === f(E[i][1])) return null;
    return f; };
  const leaf = f => {
    const comp = new Map(); for(let r = 0; r < h; r++) for(let c = 0; c < w; c++) if(act(c, r)){ const k = f(id(c, r)); if(!comp.has(k)) comp.set(k, []); comp.get(k).push([c, r]); }
    const rtypes = new Set(roses.values());
    for(const cells of comp.values()){
      if(cells.length < lo || cells.length > hi) return false;
      if(R.boxy){ const cs = cells.map(x => x[0]), rs = cells.map(x => x[1]); if((Math.max(...cs) - Math.min(...cs) + 1) * (Math.max(...rs) - Math.min(...rs) + 1) !== cells.length) return false; }
      for(const t of rtypes) if(cells.filter(([c, r]) => roses.get(c + ',' + r) === t).length !== 1) return false;
    }
    return true; };
  let nodes = 0;
  const rec = k => {
    if(cap && ++nodes > cap) throw new Error('refuter-cap');
    const f = build(); if(!f) return false;
    for(const p of pal) if(!palOk(p)) return false;
    if(k === vars.length) return leaf(f);
    for(const x of [0, 1]){ val[vars[k]] = x; if(rec(k + 1)) { val[vars[k]] = -1; return true; } }
    val[vars[k]] = -1; return false; };
  return rec(0);
}
module.exports = { tiling };
