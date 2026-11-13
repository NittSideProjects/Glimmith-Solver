#!/usr/bin/env python3
"""Core v97 (release V1.0.5): gemini-anchor.

User (Doubt & Certainty, gemini wall at (7,3)): the top piece holds a closed straight 5 and can not make another one; the bottom piece holds
a closed straight 5 too (since wally-line) and can not make another one either. So the turn / mirror that copies one shape onto the other
must send one line onto the other: that leaves 4 ways (2 directions x 2 mirrors) instead of 8 x every position. Try each: copy the known
tiles of each side (and the walls round them) through it and propagate; only one works.

The step, for every gemini wall (all puzzles with gemini walls, opts.gemAnchor false = off):
  * a known closed run r of X (k >= 3 tiles in a line, a wall / the board at both ends) and a known closed run s of Y with as many tiles;
  * r is the only run of k tiles X can have: every k tiles in a line X could still get is probed (assume them in X, propagate) and the
    ones left all lie in r (or the same for s in Y: one side is enough). An isometry between the shapes sends maximal runs to maximal
    runs, so it sends s back onto the only closed run of k tiles X can have: r;
  * the 4 isometries that send r onto s: the tiles of X go to tiles of Y and back, a wall / the outline next to a tile of X goes to a
    wall next to its image (and back); propagate. No survivor = contradiction; an edge decided the same way by all survivors is decided.
Runs in the wally-line stage (glStage, after place-probe), budget opts.gemLineMs shared. Tag 'gemini-anchor'.
Usage: python3 patch_core97.py <in.js> <out.js> [indent]
"""
import sys

def patch(src, ind):
    I = lambda t: '\n'.join((ind + l) if l else l for l in t.split('\n'))
    def rep(old, new, mid=False):
        nonlocal src
        o = old if mid else I(old); n = new if mid else I(new)
        c = src.count(o)
        if c != 1: raise SystemExit(f'anchor found {c} times: {old[:200]}')
        src = src.replace(o, n)
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v96 (V1.0.3)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v97 (V1.0.5) = v96 + gemini-anchor; v96 (V1.0.3)")
    rep("  'wally-ends': 'a piece is a path",
        "  'gemini-anchor': 'the two pieces of a gemini wall each have one straight line of that length, so the copy sends one onto the other: of the few ways that do, the others fail',\n  'wally-ends': 'a piece is a path")
    rep("'wally-two', 'wally-ends',", "'wally-two', 'gemini-anchor', 'wally-ends',", mid=True)
    # the anchor step, next to the line step
    rep("""  function* glStage(){                                  // false = impossible
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
""", """  // ---- v97 (V1.0.5): gemini-anchor (see build/patch_core97.py) ----
  const anOn = glGems.length > 0 && opts.gemAnchor !== false;
  const anTried = new Map();
  const ISO8 = [[1, 0, 0, 1], [-1, 0, 0, 1], [1, 0, 0, -1], [-1, 0, 0, -1], [0, 1, 1, 0], [0, -1, 1, 0], [0, 1, -1, 0], [0, -1, -1, 0]];   // (x, y) -> (a x + b y, c x + d y)
  // the k-in-a-line sets the piece of Yt can still hold: every one already in it, and every other one a probe can not refute (null = time out)
  function anSegs(Yt, k, deadline){
    const dm0 = glDmap(), Y = find(Yt), apartY = dm0.get(Y) || new Set();
    const seen = new Uint8Array(N), q = [];
    for(const id of members.get(Y)){ seen[id] = 1; q.push(id); }
    for(let i = 0; i < q.length; i++) for(const { e, o } of adjE[q[i]]){ if(seen[o] || e.state === 1 || apartY.has(find(o))) continue; seen[o] = 1; q.push(o); }
    const out = [];
    for(const id of q){
      const x = id % w, y = (id - x) / w;
      for(const [dx, dy] of [[1, 0], [0, 1]]){
        const P = [id]; let ok = true;
        for(let i = 1; i < k && ok; i++){ const nx = glTile(x + i * dx, y + i * dy); if(nx < 0 || !seen[nx]){ ok = false; break; } const e = glEdge(P[i - 1], nx); if(!e || e.state === 1){ ok = false; break; } P.push(nx); }
        if(!ok) continue;
        const gs = new Set([Y]);
        for(const t of P){ const g = find(t); if(gs.has(g)) continue; for(const o of gs) if((dm0.get(g) || new Set()).has(o)){ ok = false; break; } if(!ok) break; gs.add(g); }
        if(!ok) continue;
        if(P.every(t => find(t) === Y)){ out.push(P); continue; }
        if(nowMs() > deadline) return null;
        const sn = snapshot();
        for(const t of P) union(t, Yt);
        inProbe = true; const alive = propagate() !== null; inProbe = false;
        restore(sn);
        if(alive) out.push(P);
      }
    }
    return out;
  }
  function anClosedRuns(X, dm){                          // known runs with a wall / the board at both ends: [{ x, y, dx, dy, k, P }]
    const out = [];
    for(const r of glRunsOf(X)){
      if(r.k < 3) continue;
      const iv = glIntervals(X, r.x, r.y, r.dx, r.dy, r.k, dm);
      if(iv.length !== 1 || iv[0].len !== r.k) continue;
      const P = []; for(let i = 0; i < r.k; i++) P.push(glTile(r.x + i * r.dx, r.y + i * r.dy));
      out.push(Object.assign({ P }, r));
    }
    return out;
  }
  function gemAnchorStep(deadline){                      // null = impossible, [] = nothing, else [{ e, value }]
    for(const g of glGems){
      const X = find(g.a), Y = find(g.b); if(X === Y) continue;
      const dm = glDmap();
      const RX = anClosedRuns(X, dm), RY = anClosedRuns(Y, dm);
      for(const rx of RX) for(const ry of RY){
        if(rx.k !== ry.k) continue;
        const gk = g.a + ':' + g.b + ':' + rx.P[0] + ',' + rx.dx + ':' + ry.P[0] + ',' + ry.dx + ':' + rx.k, sig = spots.map(e => e.state).join('');
        if(anTried.get(gk) === sig) continue;
        if(nowMs() > deadline) return [];
        // the only run of k tiles each side can have
        const only = (t, run) => { const S = anSegs(t, run.k, deadline); if(S === null) return null; const inR = new Set(run.P); return S.every(P => P.every(id => inR.has(id))); };
        // one side is enough: an isometry sends maximal runs to maximal runs, so the other side's closed run of k tiles comes back onto
        // the only one this side can have
        const ox = only(g.a, rx); if(ox === null) return [];
        if(!ox){ const oy = only(g.b, ry); if(oy === null) return []; if(!oy){ anTried.set(gk, sig); continue; } }
        // the isometries that send rx onto ry
        const xy = id => [id % w, (id - id % w) / w];
        const [p0x, p0y] = xy(rx.P[0]), [q0x, q0y] = xy(ry.P[0]), [qkx, qky] = xy(ry.P[ry.k - 1]);
        const surv = [];
        for(const [a, b, c, d] of ISO8){
          const mx = a * rx.dx + b * rx.dy, my = c * rx.dx + d * rx.dy;
          let tx, ty;
          if(mx === ry.dx && my === ry.dy){ tx = q0x - (a * p0x + b * p0y); ty = q0y - (c * p0x + d * p0y); }
          else if(mx === -ry.dx && my === -ry.dy){ tx = qkx - (a * p0x + b * p0y); ty = qky - (c * p0x + d * p0y); }
          else continue;
          const fw = (x, y) => [a * x + b * y + tx, c * x + d * y + ty];
          const bw = (x, y) => { const u = x - tx, v = y - ty; return [a * u + c * v, b * u + d * v]; };     // the inverse of an orthogonal matrix is its transpose
          if(nowMs() > deadline) return [];
          const sn = snapshot();
          let ok = true;
          const memX = members.get(find(g.a)).slice(), memY = members.get(find(g.b)).slice();
          const copy = (mem, f, into) => {                 // tiles of one side -> tiles of the other side; walls round them -> walls round the images
            for(const id of mem){ const [x, y] = xy(id), [u, v] = f(x, y), t = glTile(u, v); if(t < 0){ ok = false; return; } union(t, into); }
            for(const id of mem){
              const [x, y] = xy(id), [u, v] = f(x, y), t = glTile(u, v);
              for(const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){
                const n = glTile(x + ddx, y + ddy);
                const outside = n < 0 || (() => { const e = glEdge(id, n); return !e || e.state === 1; })();
                if(!outside) continue;
                const [u2, v2] = f(x + ddx, y + ddy), t2 = glTile(u2, v2); if(t2 < 0) continue;
                const e2 = glEdge(t, t2); if(!e2) continue;
                if(e2.state === 2){ ok = false; return; }
                if(e2.state === 0) e2.state = 1;
              }
            }
          };
          copy(memX, fw, g.b); if(ok) copy(memY, bw, g.a);
          if(ok){ inProbe = true; ok = propagate() !== null; inProbe = false; }
          if(ok) surv.push(spots.map(e => e.state));
          restore(sn);
        }
        anTried.set(gk, sig);
        if(surv.length === 0){ why = 'gemini-anchor'; failWhy = 'gemini-anchor'; return null; }
        const out = [];
        spots.forEach((e, i) => { if(e.state !== 0) return; const v = surv[0][i]; if(v === 0) return; for(const s of surv) if(s[i] !== v) return; out.push({ e, value: v === 1 ? 'wall' : 'same' }); });
        if(out.length) return out;
      }
    }
    return [];
  }
  function* glStage(){                                  // false = impossible
    if((!glOn && !anOn) || !spots.some(e => e.state === 0)) return true;
    const glDeadline = nowMs() + (opts.gemLineMs != null ? +opts.gemLineMs : 4000);
    for(let round = 0; round < 40 && nowMs() < glDeadline; round++){
      let gl = glOn ? gemLineStep(glDeadline) : [], tag = glTag;
      if(gl === null) return false;
      if(gl.length === 0 && anOn){ gl = gemAnchorStep(glDeadline); tag = 'gemini-anchor'; if(gl === null) return false; }
      if(gl.length === 0) break;
      for(const d of gl){
        if(d.e.state !== 0) continue;
        if(!(yield* apply(d.e, d.value, 'inference', tag, tag))) return false;
      }
      if((yield* probeLoop()) === 'impossible') return false;
    }
    return true;
  }
""")
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
