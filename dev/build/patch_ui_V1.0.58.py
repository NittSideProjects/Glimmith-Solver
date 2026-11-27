#!/usr/bin/env python3
"""Page V1.0.57 -> V1.0.58: the step view shows two colours when the puzzle has two (the author's idea).

With Loopy, and in a puzzle that can have only two pieces, every tile is one of two colours (Loopy: the walls form loops, so the
tiles take two colours, the outside being one of them; two pieces: each piece is a colour). A wall between two tiles changes the
colour, a link keeps it. The solver uses that (loo-color, colour-count); the step view now shows it: instead of one colour per
group, a tile gets one of the two colours as soon as a chain of known walls and links ties it to a tile whose colour is fixed (with
Loopy: the outline, next to the outside; with two pieces: the first group the steps colour). A tile not tied yet stays plain.
Start-step text and a line under the board say what the two colours mean (new texts: rewrite list).
No solver change (core v134).
Usage: python3 patch_ui_V1.0.58.py glimmith_solver_V1.0.57.html glimmith_solver_V1.0.58.html"""
import sys

src = open(sys.argv[1], encoding='utf8').read()
def rep(old, new, what):
    global src
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    src = src.replace(old, new)

rep("""      st.groupTint = m;
    }
  }
  // ---- the words ----
""", """      st.groupTint = m;
    }
    if(typeof twoColourTints === 'function') twoColourTints(list);   // V1.0.58 (the guard: tests run this function alone)
  }
  // V1.0.58: Loopy, or a puzzle with two pieces at most: every tile is one of two colours (a wall changes it, a link keeps it). Each
  // step then colours the tiles tied by known walls / links to a tile of known colour (Loopy: the outside; two pieces: the first group).
  const TWO_COLOURS = ['#3f8fd2', '#e39a3b'];
  let twoColourMode = null;                                             // 'loopy' | 'two' | null (set by twoColourTints, read by the start text)
  function twoColourTints(list){
    twoColourMode = null;
    if(sizeRules && sizeRules.loopy) twoColourMode = 'loopy';
    else {
      let cap = null;
      try { cap = buildSolverContext(solverPuzzle(), bank.map(s => ({ id: s.id, cells: s.cells, color: s.color })), sizeRules, (stepsCtx && stepsCtx.hints) || { maxRegions: null, maxRegionSize: null }, banShapesData()).pieceCapMax; } catch(e){ cap = null; }
      if(cap === 2) twoColourMode = 'two';
    }
    if(!twoColourMode) return;
    const sp = solverPuzzle(), W = puzzle.w, H = puzzle.h, OUT = 'out';
    const act = (c, r) => c >= 0 && r >= 0 && c < W && r < H && !!puzzle.active[r][c];
    const par = new Map(), rel = new Map();                             // union-find with the colour difference to the parent (0 same, 1 other)
    const find = k => { let p = k, x = 0; while(par.has(p) && par.get(p) !== p){ x ^= rel.get(p); p = par.get(p); } return [p, x]; };
    const join = (a, b, d) => {                                         // colour(a) xor colour(b) = d
      const [ra, xa] = find(a), [rb, xb] = find(b);
      if(ra === rb) return;
      par.set(ra, rb); rel.set(ra, xa ^ xb ^ d); if(!par.has(rb)){ par.set(rb, rb); rel.set(rb, 0); }
    };
    const tiles = key => { const [o, rest] = key.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
    let anchor = null;                                                  // the tile or node whose colour is fixed (colour 0)
    if(twoColourMode === 'loopy'){
      anchor = OUT;
      for(let r = 0; r < H; r++) for(let c = 0; c < W; c++){
        if(!act(c, r)) continue;
        if(!act(c - 1, r) || !act(c + 1, r) || !act(c, r - 1) || !act(c, r + 1)) join(`${c},${r}`, OUT, 1);   // the outline: a wall to the outside
      }
    }
    const edgeAt = (key, wall) => { const [a, b] = tiles(key); if(!act(...a.split(',').map(Number)) || !act(...b.split(',').map(Number))) return; if(anchor === null) anchor = a; join(a, b, wall ? 1 : 0); };
    for(const [k, t] of sp.walls) edgeAt(k, t !== 'link');              // walls of every kind change the colour, the author's links keep it
    for(const st of list){
      for(const f of (st.facts || [])){ if(anchor === null) anchor = f.a.join(','); join(f.a.join(','), f.b.join(','), 0); }
      for(const e of st.edges) edgeAt(e.spot.key, e.value === 'wall');
      if(anchor === null) continue;
      const [ra, xa] = find(anchor), m = new Map();
      const flip = twoColourMode === 'loopy' ? 1 : 0;                  // Loopy: the outside is orange, the outline blue
      const colourOf = k => { const [r, x] = find(k); return r === ra ? TWO_COLOURS[(x ^ xa ^ flip) & 1] : null; };
      for(let r = 0; r < H; r++) for(let c = 0; c < W; c++){
        if(!act(c, r)) continue;
        const col = colourOf(`${c},${r}`); if(col) m.set(`${c},${r}`, col);
      }
      for(const p of (st.closed || [])){ const col = colourOf(p.cells[0].join(',')); p.color = col || undefined; }
      st.groupTint = m;
    }
  }
  // ---- the words ----
""", 'twoColourTints')

rep("        text: hasLogic ? 'Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, blue links join two tiles of one piece, and tiles that share a colour are in one piece even before they touch. Everything proven here holds in every tiling.'", "        text: hasLogic ? (!twoColourMode ? 'Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, blue links join two tiles of one piece, and tiles that share a colour are in one piece even before they touch. Everything proven here holds in every tiling.'\n                         : twoColourMode === 'loopy' ? 'With Loopy the walls form loops, so every tile is one of two colours: blue for the tiles next to the outside, orange for the others. A wall changes the colour, a link keeps it. A tile is coloured as soon as a chain of known walls and links ties it to the outline. Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, and blue links join two tiles of one piece. Everything proven here holds in every tiling.'\n                         : 'This puzzle has two pieces at most, so every tile belongs to the blue piece or the orange one. A wall changes the colour, a link keeps it. A tile is coloured as soon as a chain of known walls and links ties it to the first coloured group. Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, blue links join two tiles of one piece, and tiles that share a colour are in one piece even before they touch. Everything proven here holds in every tiling.')", 'start text')       # V1.0.58: three whole texts (one ID each on the rewrite list)

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
