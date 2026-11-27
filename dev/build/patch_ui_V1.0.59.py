#!/usr/bin/env python3
"""Page V1.0.58 -> V1.0.59: core v135 (see patch_core135.py): the three steps the author found redundant are removed
(Palisades side by side, Two polyominoes of the same shape, Must still fit the shape).
Page text: their step titles / explanations (STEP_INFO) and their "Show example" boards (RULE_EXAMPLES) go with them, and the
reasons pal-pair / stamp-pair (WHY_TEXT, in the core). The example numbers after them move up (3 fewer rules).
Also (the author, after trying V1.0.58): the two-colour step view colours a tile only once a link puts it in a group; the group
then takes blue or orange when known walls / links tie it to the outline (Loopy) or to the first group (two pieces). Its two
start texts say so (they are new since V1.0.58 and not rewritten yet).
Usage: python3 patch_ui_V1.0.59.py glimmith_solver_V1.0.58.html glimmith_solver_V1.0.59.html [--reference dev/reference/solver-core.v135.js]"""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core135 import patch as core_patch

GONE = ['stamp-pair', 'shape-fit', 'pal-pair']
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
for k in GONE:                                                     # STEP_INFO lines
    lines = [l for l in src.split('\n') if l.startswith(f'    "{k}": [')]
    if len(lines) != 1: raise SystemExit(f'STEP_INFO {k}: {len(lines)}')
    src = src.replace(lines[0] + '\n', '', 1)
i = src.index('  const RULE_EXAMPLES = '); j = src.index('\n', i)
body = src[i + len('  const RULE_EXAMPLES = '):j]
js = body.rstrip(';').rstrip(); d = json.loads(js)
if json.dumps(d, separators=(',', ':'), ensure_ascii=False) != js: raise SystemExit('RULE_EXAMPLES does not round-trip')
for k in GONE:
    if k not in d: raise SystemExit(f'RULE_EXAMPLES {k} missing')
    del d[k]
src = src[:i] + '  const RULE_EXAMPLES = ' + json.dumps(d, separators=(',', ':'), ensure_ascii=False) + ';' + src[j:]

# V1.0.59 (the author, after trying V1.0.58): no colours before anything is known. A tile is coloured only once a link (or a fact)
# puts it in a group, as on every puzzle; the group then takes the right one of the two colours when known walls / links tie it to
# the outline (Loopy) or to the first group (two pieces), and a colour of its own until then.
def rep(old, new, what):
    global src
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    src = src.replace(old, new)
rep("""      if(anchor === null) continue;
      const [ra, xa] = find(anchor), m = new Map();
      const flip = twoColourMode === 'loopy' ? 1 : 0;                  // Loopy: the outside is orange, the outline blue
      const colourOf = k => { const [r, x] = find(k); return r === ra ? TWO_COLOURS[(x ^ xa ^ flip) & 1] : null; };
      for(let r = 0; r < H; r++) for(let c = 0; c < W; c++){
        if(!act(c, r)) continue;
        const col = colourOf(`${c},${r}`); if(col) m.set(`${c},${r}`, col);
      }
      for(const p of (st.closed || [])){ const col = colourOf(p.cells[0].join(',')); p.color = col || undefined; }
      st.groupTint = m;
""", """      if(anchor === null) continue;
      const [ra, xa] = find(anchor), m = new Map();
      const flip = twoColourMode === 'loopy' ? 1 : 0;                  // Loopy: the outside is orange, the outline blue
      const colourOf = k => { const [r, x] = find(k); return r === ra ? TWO_COLOURS[(x ^ xa ^ flip) & 1] : null; };
      for(const [k, c0] of (st.groupTint || new Map())) m.set(k, colourOf(k) || c0);     // V1.0.59: only tiles already in a group
      for(const p of (st.closed || [])){ const col = colourOf(p.cells[0].join(',')); if(col) p.color = col; }
      st.groupTint = m;
""", 'two colours: groups only')
rep("A tile is coloured as soon as a chain of known walls and links ties it to the outline.",
    "A group of linked tiles turns blue or orange as soon as known walls and links tie it to the outline; until then it has a colour of its own.", 'loopy text')
rep("A tile is coloured as soon as a chain of known walls and links ties it to the first coloured group.",
    "A group of linked tiles turns blue or orange as soon as known walls and links tie it to the first group that got a colour; until then it has a colour of its own.", 'two text')

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
