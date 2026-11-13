#!/usr/bin/env python3
"""Core v94 (release V1.0.1): wally-line.

User ("Doubt & Certainty", 10x12, Wally): the two pieces of a gemini wall have the same shape, so they have the same straight runs
(rotations / mirrors only swap rows and columns). The lower piece already holds 4 tiles in a line; the upper piece can not get a NEW
line of 4 (every place for one is refuted), so the lower line must be the twin of the upper piece's closed line of 5: it grows by
exactly one tile.

The step (a probe stage after place-probe, Wally puzzles only; opts.gemLine true = every puzzle with a gemini wall, false = off):
  for every gemini wall, both ways round (X = piece with the line, Y = its twin):
  * every known straight run r of X (k >= 3 tiles in a line, opts.gemLineMin) that can still grow;
  * the lengths r can end with: every interval of the line holding r whose tiles can all join X (no wall, no piece kept apart from X)
    and whose two outside tiles can stay out of X;
  * the lengths a run of k+ tiles of Y can have: every k tiles in a line that could all be in Y. Already in Y: the lengths its run can
    end with (as above). Not yet: assume them in Y and propagate (as a probe); refuted -> dropped, else the lengths its run can end with
    in the assumed state;
  * r keeps only the intervals whose length Y can have. None -> contradiction. An edge of the line inside all of them -> same piece,
    on the end of all of them -> wall.
Usage: python3 patch_core94.py <in.js> <out.js> [indent]   (indent 2 = the copy embedded in the page)
"""
import sys

def patch(src, ind):
    def rep(old, new, count=1, mid=False):
        nonlocal src
        o = old if mid else '\n'.join((ind + l) if l else l for l in old.split('\n'))
        n = new if mid else '\n'.join((ind + l) if l else l for l in new.split('\n'))
        c = src.count(o)
        if c != count: raise SystemExit(f'anchor found {c} times (want {count}):\n{old[:300]}')
        src = src.replace(o, n)

    # header
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v93 = v92 + fact events;",
        "// ================= SOLVER CORE (pure, unit-tested separately; v94 (V1.0.1) = v93 + wally-line; v93 = v92 + fact events;")

    # tags / texts
    rep("  'wally-two': 'with only two pieces the walls round a tile do not add up (Wally)',",
        "  'wally-two': 'with only two pieces the walls round a tile do not add up (Wally)',\n"
        "  'wally-line': 'the two pieces of a gemini wall have the same straight lines: this line can only end with a length its twin can have',\n"
        "  'gemini-line': 'the two pieces of a gemini wall have the same straight lines: this line can only end with a length its twin can have',")
    rep("'wally-two', 'bri-three'", "'wally-two', 'wally-line', 'gemini-line', 'bri-three'", mid=True)

    # the stage itself, right after the place-probe stage
    rep("""  // ---- the scan ----
  let ended = null;                         // 'impossible' | 'two' | null
""",
"""  // ---- v94 (V1.0.1): wally-line (see build/patch_core94.py) ----
  // A gemini wall: same shape on both sides, so a straight run of m tiles in one piece (a maximal one) has a twin of m tiles in the
  // other. A known run r of X that can still grow can only end with a length the twin Y can have for a run of that many tiles.
  const glGems = gdAll.filter(g => g.gem);
  const glOn = glGems.length > 0 && (opts.gemLine === true || (!!ctx.wallyRule && opts.gemLine !== false));
  const glTag = ctx.wallyRule ? 'wally-line' : 'gemini-line';
  const glTried = new Map();
  function glDmap(){                                    // groups kept apart: walls and forbidden pairs
    const dm = new Map(), add = (a, b) => { if(!dm.has(a)) dm.set(a, new Set()); dm.get(a).add(b); };
    for(const e of edges){ if(e.state !== 1) continue; const a = find(e.a), b = find(e.b); if(a !== b){ add(a, b); add(b, a); } }
    for(const [fa, fb] of forbidden){ const a = find(fa), b = find(fb); if(a !== b){ add(a, b); add(b, a); } }
    return dm;
  }
  const glTile = (x, y) => (x >= 0 && y >= 0 && x < w && y < h && ctx.isActive(x, y)) ? cid(x, y) : -1;
  const glEdge = (a, b) => { for(const { e, o } of adjE[a]) if(o === b) return e; return null; };
  // the lengths the run of X through tiles p0 .. p0+(k-1)d (all in X) can end with: [{ s, t, len }] (positions on the line, 0 = p0)
  function glIntervals(X, x0, y0, dx, dy, k, dm){
    const apart = dm.get(X) || new Set();
    const at = t => glTile(x0 + t * dx, y0 + t * dy);
    // how far the line may reach: stop at the board, a wall or a group kept apart from X (the groups met on the way must not be apart either)
    const reach = dir => {
      const ids = [], start = dir > 0 ? k - 1 : 0;
      let prev = at(start);
      for(let t = start + dir; ; t += dir){
        const id = at(t); if(id < 0) break;
        const e = glEdge(prev, id); if(!e || e.state === 1) break;
        const g = find(id); if(g !== X && apart.has(g)) break;
        ids.push(id); prev = id;
      }
      return ids;
    };
    const lo = reach(-1), hi = reach(1);
    const out = [];
    for(let a = 0; a <= lo.length; a++) for(let b = 0; b <= hi.length; b++){
      const s = -a, t = k - 1 + b;
      // every tile of the interval joins X: their groups must not be apart from each other
      const gs = new Set([X]); let ok = true;
      for(let i = 0; i < a && ok; i++){ const g = find(lo[i]); if(!gs.has(g)){ for(const q of gs) if((dm.get(g) || new Set()).has(q)){ ok = false; break; } gs.add(g); } }
      for(let i = 0; i < b && ok; i++){ const g = find(hi[i]); if(!gs.has(g)){ for(const q of gs) if((dm.get(g) || new Set()).has(q)){ ok = false; break; } gs.add(g); } }
      if(!ok) continue;
      // the tiles just outside must be able to stay out (not in X, not in a group joining it)
      const endOk = (outT, inT) => { const o = at(outT); if(o < 0) return true; const e = glEdge(at(inT), o); if(!e || e.state === 1) return true; return !gs.has(find(o)); };
      if(!endOk(s - 1, s) || !endOk(t + 1, t)) continue;
      out.push({ s, t, len: t - s + 1 });
    }
    return out;
  }
  function glRunsOf(X){                                 // known maximal runs of X: [{ x, y, dx, dy, k }]
    const mem = members.get(X), inX = new Set(mem), out = [];
    for(const id of mem){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const pv = glTile(x - dx, y - dy); if(pv >= 0 && inX.has(pv)) continue;
        let k = 1; while(true){ const nx = glTile(x + k * dx, y + k * dy); if(nx < 0 || !inX.has(nx)) break; k++; }
        out.push({ x, y, dx, dy, k });
      }
    }
    return out;
  }
  // the lengths a run of k+ tiles of Y can end with (null = over the time budget)
  function glTwinLens(Yt, k, need, deadline){
    const dm0 = glDmap(), Y = find(Yt), apartY = dm0.get(Y) || new Set();
    // tiles Y can still reach (no wall, no group kept apart)
    const seen = new Uint8Array(N), q = [];
    for(const id of members.get(Y)){ seen[id] = 1; q.push(id); }
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]){ if(seen[o] || e.state === 1 || apartY.has(find(o))) continue; seen[o] = 1; q.push(o); }
    const lens = new Set(); let probes = 0;
    const done = () => { for(const L of need) if(!lens.has(L)) return false; return true; };
    const segs = [];
    for(const id of q){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const P = [id]; let ok = true;
        for(let i = 1; i < k && ok; i++){ const nx = glTile(x + i * dx, y + i * dy); if(nx < 0 || !seen[nx]){ ok = false; break; } const e = glEdge(P[i - 1], nx); if(!e || e.state === 1){ ok = false; break; } P.push(nx); }
        if(!ok) continue;
        const gs = new Set([Y]);
        for(const t of P){ const g = find(t); if(gs.has(g)) continue; for(const o of gs) if((dm0.get(g) || new Set()).has(o)){ ok = false; break; } if(!ok) break; gs.add(g); }
        if(!ok) continue;
        segs.push({ x, y, dx, dy, P, known: P.every(t => find(t) === Y) });
      }
    }
    segs.sort((a, b) => (b.known - a.known));                                  // the runs Y already has first (no probe)
    for(const sg of segs){
      if(done()) break;
      if(sg.known){ for(const iv of glIntervals(Y, sg.x, sg.y, sg.dx, sg.dy, k, dm0)) lens.add(iv.len); continue; }
      if(nowMs() > deadline) return null;
      const sn = snapshot();
      for(const t of sg.P) union(t, Yt);
      inProbe = true; let ok = propagate() !== null; inProbe = false;
      probes++;
      if(ok){ const Y2 = find(Yt), dm2 = glDmap(); const ivs = glIntervals(Y2, sg.x, sg.y, sg.dx, sg.dy, k, dm2); if(!ivs.length) ok = false; for(const iv of ivs) lens.add(iv.len); }
      restore(sn);
    }
    stats.gemLineProbes = (stats.gemLineProbes || 0) + probes;
    return lens;
  }
  function gemLineStep(deadline){                       // null = impossible, [] = nothing, else [{ e, value }]
    const kMin = opts.gemLineMin != null ? +opts.gemLineMin : 3;
    for(const g of glGems){
      for(const [p, q] of [[g.a, g.b], [g.b, g.a]]){
        const X = find(p), Y = find(q); if(X === Y) continue;
        const dm = glDmap();
        for(const r of glRunsOf(X)){
          if(r.k < kMin) continue;
          const ivs = glIntervals(X, r.x, r.y, r.dx, r.dy, r.k, dm);
          if(ivs.length === 1 && ivs[0].len === r.k) continue;                 // closed at both ends already
          const need = new Set(ivs.map(iv => iv.len));
          const gk = g.a + ':' + g.b + ':' + p + ':' + r.x + ',' + r.y + ',' + r.dx + ',' + r.k;
          const sig = spots.map(e => e.state).join('');
          if(glTried.get(gk) === sig) continue;
          if(nowMs() > deadline) return [];
          const lens = glTwinLens(q, r.k, need, deadline);
          if(lens === null) return [];
          glTried.set(gk, sig);
          const keep = ivs.filter(iv => lens.has(iv.len));
          if(keep.length === ivs.length) continue;
          if(!keep.length){ why = glTag; failWhy = glTag; return null; }
          // decide the edges of the line that are the same in every interval kept
          const out = [], s0 = Math.min(...keep.map(iv => iv.s)) - 1, t0 = Math.max(...keep.map(iv => iv.t)) + 1;
          for(let t = s0; t < t0; t++){
            const a = glTile(r.x + t * r.dx, r.y + t * r.dy), b = glTile(r.x + (t + 1) * r.dx, r.y + (t + 1) * r.dy);
            if(a < 0 || b < 0) continue;
            const e = glEdge(a, b); if(!e || e.state !== 0) continue;
            const inside = iv => t >= iv.s && t + 1 <= iv.t, onEnd = iv => (t === iv.s - 1) || (t === iv.t);
            if(keep.every(inside)) out.push({ e, value: 'same' });
            else if(keep.every(onEnd)) out.push({ e, value: 'wall' });
          }
          if(out.length) return out;
        }
      }
    }
    return [];
  }
  function* glStage(){                                  // false = impossible
    if(!glOn || !spots.some(e => e.state === 0)) return true;
    const glDeadline = nowMs() + (opts.gemLineMs != null ? +opts.gemLineMs : 4000);
    for(let round = 0; round < 40 && nowMs() < glDeadline; round++){
      const gl = gemLineStep(glDeadline);
      if(gl === null) return false;
      if(gl.length === 0) break;
      for(const d of gl){
        if(d.e.state !== 0) continue;
        if(!(yield* apply(d.e, d.value, 'inference', glTag, glTag))) return false;
      }
      if((yield* probeLoop()) === 'impossible') return false;
    }
    return true;
  }
  // ---- the scan ----
  let ended = null;                         // 'impossible' | 'two' | null
  if(opts.gemLineEarly && !finalOnly && !(yield* glStage())) ended = 'impossible';     // v94: tests only (before any probe)
""")
    rep("""  // ---- v87b: pair probes (see patch_core87.py) ----
  function* applyFact(kind, a, b, rule){""",
"""  if(!finalOnly && !ended && !(yield* glStage())) ended = 'impossible';      // v94 (V1.0.1): wally-line
  // ---- v87b: pair probes (see patch_core87.py) ----
  function* applyFact(kind, a, b, rule){""")
    return src

if __name__ == '__main__':
    inp, outp = sys.argv[1], sys.argv[2]
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(inp, encoding='utf8').read()
    open(outp, 'w', encoding='utf8').write(patch(src, ind))
    print('ok', outp)
