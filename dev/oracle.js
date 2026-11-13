// Independent brute-force oracle for small puzzles: enumerates EVERY partition into connected pieces with its own
// subset enumeration and its own rule checks (nothing shared with solver-core.js). Supports plain walls, holes,
// area numbers, polyominoes, roses, bank, size rules, mismatch/match/mingle/solitude/boxy/nonBoxy.
// Returns null when the puzzle uses something it does not model (special relation walls).
function canon(cells){
  const T = [(x,y)=>[x,y],(x,y)=>[-x,y],(x,y)=>[x,-y],(x,y)=>[-x,-y],(x,y)=>[y,x],(x,y)=>[-y,x],(x,y)=>[y,-x],(x,y)=>[-y,-x]];
  let best = null;
  for(const t of T){
    const pts = cells.map(([x,y]) => t(x,y));
    const mx = Math.min(...pts.map(p=>p[0])), my = Math.min(...pts.map(p=>p[1]));
    const k = pts.map(([x,y]) => (x-mx)+','+(y-my)).sort().join(';');
    if(best === null || k < best) best = k;
  }
  return best;
}
function oracle(P, cap){
  const { w, h, active, walls, roses, polyominoes, areaNumbers } = P.puzzle;
  for(const t of walls.values()) if(t !== 'wall') return null;
  const R = P.rules;
  const cells = []; const id = new Map();
  for(let r=0;r<h;r++) for(let c=0;c<w;c++) if(active[r][c]){ id.set(c+','+r, cells.length); cells.push([c,r]); }
  const n = cells.length;
  const blocked = (a, b) => { const [c1,r1] = cells[a], [c2,r2] = cells[b]; return r1===r2 ? walls.has(`v:${Math.min(c1,c2)},${r1}`) : walls.has(`h:${c1},${Math.min(r1,r2)}`); };
  const adj = Array.from({length:n}, () => []);
  for(let a=0;a<n;a++) for(const [dc,dr] of [[1,0],[0,1]]){
    const [c,r] = cells[a]; const b = id.get((c+dc)+','+(r+dr));
    if(b !== undefined){ adj[a].push(b); adj[b].push(a); }
  }
  const roseTypes = new Set(roses.values());
  const banKeys = (P.ban || []).map(s => ({ size: s.cells.length, key: canon(s.cells) }));
  const bankKeys = P.bank.length ? new Set(P.bank.map(s => canon(s.cells))) : null;
  let sizeLo = 1, sizeHi = n;
  if(R.precision != null){ sizeLo = sizeHi = R.precision; } else { if(R.min != null) sizeLo = R.min; if(R.max != null) sizeHi = R.max; }
  const pal = P.puzzle.palisades || new Map(), comp = P.puzzle.compasses || new Map(), tow = P.puzzle.watchtowers || new Map();
  const symCount = k => (roses.has(k)?1:0) + (polyominoes.has(k)?1:0) + (areaNumbers.has(k)?1:0) + (pal.has(k)?1:0) + (comp.has(k)?1:0);
  function isRectangle(cs){ const xs = cs.map(q=>q[0]), ys = cs.map(q=>q[1]); return cs.length === (Math.max(...xs)-Math.min(...xs)+1)*(Math.max(...ys)-Math.min(...ys)+1); }
  function pieceOk(ids){
    const cs = ids.map(i => cells[i]); const size = cs.length;
    if(size < sizeLo || size > sizeHi) return false;
    // connected through unblocked adjacency, and no blocked adjacency inside the piece
    const set = new Set(ids);
    for(const a of ids) for(const b of adj[a]) if(set.has(b) && blocked(a,b)) return false;
    const seen = new Set([ids[0]]); const st = [ids[0]];
    while(st.length){ const a = st.pop(); for(const b of adj[a]) if(set.has(b) && !seen.has(b)){ seen.add(b); st.push(b); } }
    if(seen.size !== size) return false;
    const key = canon(cs);
    if(bankKeys && !bankKeys.has(key)) return false;
    for(const [c,r] of cs){
      const k = c+','+r;
      if(areaNumbers.has(k) && areaNumbers.get(k) !== size) return false;
      if(polyominoes.has(k) && canon(polyominoes.get(k).cells) !== key) return false;
    }
    for(const t of roseTypes){ let cnt = 0; for(const [c,r] of cs) if(roses.get(c+','+r) === t) cnt++; if(cnt !== 1) return false; }
    for(const [c,r] of cs){
      const cp = comp.get(c+','+r); if(!cp) continue;
      const cnt = { n: cs.filter(q => q[1] < r).length, s: cs.filter(q => q[1] > r).length, e: cs.filter(q => q[0] > c).length, w: cs.filter(q => q[0] < c).length };
      for(const d of ['n','e','s','w']) if(cp[d] != null && cp[d] !== cnt[d]) return false;
    }
    if(R.solitude){ let tot = 0; for(const [c,r] of cs) tot += symCount(c+','+r); if(tot !== 1) return false; }
    if(R.boxy && !isRectangle(cs)) return false;
    if(R.nonBoxy && isRectangle(cs)) return false;
    // Shape ban't (v29), checked the slow independent way: no connected subset of the piece with a banned shape's size has the banned shape
    for(const bs of banKeys){
      const k = bs.size; if(k > size) continue;
      const pick = [];
      const rec2 = (from) => {
        if(pick.length === k){
          const sub = pick.map(i => cs[i]);
          if(canon(sub) === bs.key) return true;
          return false;
        }
        for(let i = from; i < size; i++){ pick.push(i); if(rec2(i + 1)){ pick.pop(); return true; } pick.pop(); }
        return false;
      };
      if(rec2(0)) return false;
    }
    return true;
  }
  const out = []; const pieces = []; const covered = new Array(n).fill(false);
  function finalOk(){
    const infos = pieces.map(ids => ({ size: ids.length, key: canon(ids.map(i => cells[i])) }));
    if(R.mismatch){ const s = new Set(infos.map(i => i.key)); if(s.size !== infos.length) return false; }
    if(R.match){ if(new Set(infos.map(i => i.key)).size > 1) return false; }
    const pieceOf = new Array(n); pieces.forEach((ids, pi) => ids.forEach(i => { pieceOf[i] = pi; }));
    const at = (c,r) => id.has(c+','+r) ? pieceOf[id.get(c+','+r)] : undefined;
    const wallBetween = (c1,r1,c2,r2) => at(c1,r1) !== at(c2,r2);   // both tiles active here
    if(R.bricky || R.loopy){
      for(let y=0;y<=h;y++) for(let x=0;x<=w;x++){
        const k = [wallBetween(x-1,y-1,x,y-1), wallBetween(x,y-1,x,y), wallBetween(x-1,y,x,y), wallBetween(x-1,y-1,x-1,y)].filter(Boolean).length;
        if(R.bricky && k === 4) return false;
        if(R.loopy && k === 3) return false;
      }
    }
    for(const [k, want] of tow){
      const [x,y] = k.split(',').map(Number);
      const set = new Set(); for(const [c,r] of [[x-1,y-1],[x,y-1],[x-1,y],[x,y]]) if(at(c,r) !== undefined) set.add(at(c,r));
      if(set.size !== want) return false;
    }
    for(const [k, type] of pal){
      const [c,r] = k.split(',').map(Number);
      const s = [[0,-1],[1,0],[0,1],[-1,0]].map(([dc,dr]) => (at(c+dc,r+dr) !== at(c,r)) ? 1 : 0);
      const cnt = s[0]+s[1]+s[2]+s[3];
      const ok = type==='0' ? cnt===0 : type==='1' ? cnt===1 : type==='3' ? cnt===3 : type==='4' ? cnt===4
        : type==='2c' ? (cnt===2 && s[0]+s[2]===1) : (cnt===2 && (s[0]+s[2]===2 || s[1]+s[3]===2));
      if(!ok) return false;
    }
    if(R.mingleShape || R.mingleArea){
      for(let a=0;a<n;a++) for(const b of adj[a]){
        if(pieceOf[a] === pieceOf[b]) continue;
        const A = infos[pieceOf[a]], B = infos[pieceOf[b]];
        if(R.mingleShape && A.key === B.key) return false;
        if(R.mingleArea && A.size === B.size) return false;
      }
    }
    return true;
  }
  function rec(){
    if(out.length >= cap) return;
    let low = covered.indexOf(false);
    if(low < 0){ if(finalOk()) out.push(pieces.map(ids => ids.map(i => cells[i]))); return; }
    const rest = []; for(let i=low+1;i<n;i++) if(!covered[i]) rest.push(i);
    const total = 1 << rest.length;
    for(let m = 0; m < total; m++){
      const ids = [low]; for(let b=0;b<rest.length;b++) if(m & (1<<b)) ids.push(rest[b]);
      if(ids.length > sizeHi) continue;
      if(!pieceOk(ids)) continue;
      ids.forEach(i => { covered[i] = true; }); pieces.push(ids);
      rec();
      pieces.pop(); ids.forEach(i => { covered[i] = false; });
      if(out.length >= cap) return;
    }
  }
  rec();
  return out;
}
const sigCells = sol => sol.map(cs => cs.map(([c,r]) => c+','+r).sort().join(';')).sort().join('|');
module.exports = { oracle, sigCells, canon };
