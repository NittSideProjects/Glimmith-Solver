#!/usr/bin/env python3
"""Page V1.0.5 -> V1.0.6: same-piece colours in the step-by-step view, replacing the v94 letters; embedded core v98 (label-join,
see patch_core98.py).

Colours: tiles the solver knows are in one piece share a colour from the moment it knows it, also when they do not touch yet.
* A group gets a colour when a step joins tiles that do not touch (a "fact" step: far join, clue grouping, the only way to connect,
  and from core v98 the label join: "this rose can only go with that rose"). Every tile joined to it later (links, more facts)
  takes the same colour. Two coloured groups that meet keep the older colour.
* The colours come from a pool of 25 (GROUP_COLORS). A finished piece keeps its colour and gives it back to the pool; only when all
  25 are held by unfinished groups is one used twice.
* Groups that only ever grew through neighbouring links get no colour (the blue links show them), as before with the letters.
Step text: the fact steps say the tiles now share a colour; the new label-join step has its own title and text; the start step
explains the colours.
Usage: python3 patch_ui_V1.0.6.py glimmith_solver_V1.0.5.html glimmith_solver_V1.0.6.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core98 import patch as core_patch

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]

# ---- the colour pool ----
src = rep(src, "  const PALETTE = ['#e0a458','#6fb8ac','#c97b84','#8ab6d6','#b98cc7','#9fc169','#e0956f','#7c9bd8','#d6b45c','#5fbfa0'];\n",
"""  const PALETTE = ['#e0a458','#6fb8ac','#c97b84','#8ab6d6','#b98cc7','#9fc169','#e0956f','#7c9bd8','#d6b45c','#5fbfa0'];
  // V1.0.6: the 25 colours of the step view's same-piece groups (see markGroupColors)
  const GROUP_COLORS = ['#e6194b','#3cb44b','#4363d8','#f58231','#911eb4','#42d4f4','#f032e6','#bfef45','#469990','#9a6324',
                        '#ffe119','#800000','#808000','#000075','#ff6f91','#2ec4b6','#7b2cbf','#ff9f1c','#1982c4','#8ac926',
                        '#c1121f','#e9c46a','#264653','#b5838d','#6d597a'];
""")

# ---- letters -> colours ----
s0 = src.index('  // v94: letters. A piece known through a fact')
s1 = src.index('  // ---- the words ----')
src = src[:s0] + """  // V1.0.6: colours instead of the v94 letters. Tiles known to be in one piece share a colour from the step the solver knows it,
  // also when they do not touch yet. A group gets a colour when a fact joins tiles that do not touch; every tile joined to it later
  // (links, more facts) takes it; two coloured groups that meet keep the older colour. A finished piece keeps its colour and gives it
  // back to the pool; a colour is used twice only when all GROUP_COLORS are held by unfinished groups.
  // st.groupTint: 'c,r' -> colour for the tiles of unfinished coloured groups; st.closed[i].color is the group's colour when it had one.
  function markGroupColors(list){
    const par = new Map(), grp = new Map(), held = new Array(GROUP_COLORS.length).fill(0); let born = 0;
    const find = k => { let r = k; while(par.has(r) && par.get(r) !== r) r = par.get(r); let c = k; while(par.has(c) && par.get(c) !== r){ const n = par.get(c); par.set(c, r); c = n; } return r; };
    const take = () => { let best = 0; for(let i = 0; i < held.length; i++){ if(!held[i]) return i; if(held[i] < held[best]) best = i; } return best; };
    const join = (a, b, birth) => {
      const ra = find(a), rb = find(b);
      if(ra === rb) return;
      const ga = grp.get(ra), gb = grp.get(rb);
      par.set(ra, rb); grp.delete(ra);
      let g = ga && gb ? (ga.born <= gb.born ? ga : gb) : (ga || gb);
      if(ga && gb){ const lost = g === ga ? gb : ga; if(!lost.closed) held[lost.c]--; }
      if(!g && birth){ const c = take(); held[c]++; g = { c, born: born++, closed: false }; }
      if(g) grp.set(rb, g); else grp.delete(rb);
    };
    const tiles = key => { const [o, rest] = key.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tiles(k); join(a, b, false); }
    for(const st of list){
      for(const f of (st.facts || [])) join(f.a.join(','), f.b.join(','), true);
      for(const e of st.edges) if(e.value !== 'wall'){ const [a, b] = tiles(e.spot.key); join(a, b, false); }
      for(const p of (st.closed || [])){
        const g = grp.get(find(p.cells[0].join(',')));
        if(!g) continue;
        if(!g.closed){ g.closed = true; held[g.c]--; }
        p.color = GROUP_COLORS[g.c];
      }
      const m = new Map();
      for(let r = 0; r < puzzle.h; r++) for(let c = 0; c < puzzle.w; c++){
        if(!puzzle.active[r][c]) continue;
        const g = grp.get(find(`${c},${r}`)); if(g && !g.closed) m.set(`${c},${r}`, GROUP_COLORS[g.c]);
      }
      st.groupTint = m;
    }
  }
""" + src[s1:]
src = rep(src, "    markLetters(stepsList);                                             // v94\n",
               "    markGroupColors(stepsList);                                         // V1.0.6 (was the v94 letters)\n")
src = rep(src, "    const view = { letters: (stepsList[isFinal ? n - 2 : stepsIdx] || {}).letters || null, ",
               "    const view = { groupTint: (stepsList[isFinal ? n - 2 : stepsIdx] || {}).groupTint || null, ")

# ---- drawing: the group colour on the tile, no letters ----
src = rep(src, """      const tint = pieceColor.get(k) || shapeColor.get(k);
      if(active && tint) svgEl('rect', { x: c * cs + 1, y: r * cs + 1, width: cs - 2, height: cs - 2, fill: tint, 'fill-opacity': v.pieces ? 0.6 : 0.5 }, svg);
""", """      const tint = pieceColor.get(k) || shapeColor.get(k);
      if(active && tint) svgEl('rect', { x: c * cs + 1, y: r * cs + 1, width: cs - 2, height: cs - 2, fill: tint, 'fill-opacity': v.pieces ? 0.6 : 0.5, 'data-color': tint }, svg);
      else if(active && !v.pieces && v.groupTint && v.groupTint.has(k))     // V1.0.6: known to be in one piece, not finished yet
        svgEl('rect', { x: c * cs + 1, y: r * cs + 1, width: cs - 2, height: cs - 2, fill: v.groupTint.get(k), 'fill-opacity': 0.5, class: 'step-group', 'data-color': v.groupTint.get(k) }, svg);
""")
l0 = src.index("    if(v.letters && !v.pieces) for(const [k, L] of v.letters){")
l1 = src.index("    if(v.factTiles && !v.pieces){", l0)
src = src[:l0] + src[l1:]

# ---- words ----
src = rep(src, """      const L = (st.letters && st.letters.get(st.facts[0].a.join(','))) || '', n = st.facts.length;
      const mark = L ? ` Every tile known to be in that piece is marked ${L}.` : '';
""", """      const n = st.facts.length;
      const mark = ' Every tile known to be in that piece now has the same colour.';           // V1.0.6 (was a letter)
      if(st.rule === 'label-join'){                                      // V1.0.6: core v98
        const what = sizeRules.solitude ? 'one symbol' : (puzzle.roses && puzzle.roses.size ? 'one rose of each type' : 'one of the area numbers');
        return { kicker: 'Rule', title: 'Only one piece it can be in',
          text: `Every piece holds exactly ${what}. The ringed tiles can not end up in any other piece, so they are in one piece, even though they do not touch yet.${mark}`, meta };
      }
""")
src = rep(src, "Teal bars are walls it has proven, blue links mean \"these two tiles are in one piece\". Everything it proves holds in every tiling.",
               "Teal bars are walls it has proven, blue links mean \"these two tiles are in one piece\", and tiles that share a colour are proven to be in one piece even before they touch. Everything it proves holds in every tiling.")

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
