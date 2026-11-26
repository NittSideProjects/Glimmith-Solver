#!/usr/bin/env python3
"""Page V1.0.52 -> V1.0.53: clearer "Show cases".

* core v130 (see patch_core130.py): a closed-in area of a wrong size rings the smallest failing area, whole (it rang 60 tiles of the
  first area in board order, usually the top-left corner, far from the tried wall).
* The choice the solver tries is drawn as what it is: a red wall where it tries a wall, a red link where it tries "one piece". The
  yellow outline of its two tiles and the pulsing dashed ghost are gone (they stayed on every frame and hid the board).
No page text changes.
Usage: python3 patch_ui_V1.0.53.py glimmith_solver_V1.0.52.html glimmith_solver_V1.0.53.html [--reference dev/reference/solver-core.v130.js]"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core130 import patch as core_patch, rep

src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
core = core_patch(src[a:b], '  ')
src = src[:a] + core + src[b:]
src = rep(src, """    for(const pb of v.probes || (v.probe ? [v.probe] : [])){              // V1.0.19: several tried values (the cases)
      const key = pb.key, [orient, rest] = key.split(':'), [c, r] = rest.split(',').map(Number), g = svgEl('g', {}, svg);
      g.setAttribute('class', 'ded-probe');
      for(const [cc, rr] of stepCells(key)) svgEl('rect', { x: cc * cs + 2, y: rr * cs + 2, width: cs - 4, height: cs - 4, rx: Math.max(2, cs * 0.08), fill: 'none', stroke: '#ffcf70', 'stroke-width': 2.2 }, g);
      const ghost = { fill: 'rgba(229,83,75,.25)', stroke: '#e5534b', 'stroke-dasharray': '3 2' };
      if(pb.assume === 'wall'){
        const geo = wallBarGeometry(cs, orient, c, r), t = Math.max(4, cs * 0.16);
        svgEl('rect', Object.assign({ x: geo.x - 1, y: geo.y - 1, width: geo.width + 2, height: geo.height + 2, rx: t / 2 + 1, 'stroke-width': 1.6 }, ghost), g);
      } else {
        const cx = orient === 'v' ? (c + 1) * cs : c * cs + cs / 2, cy = orient === 'v' ? r * cs + cs / 2 : (r + 1) * cs;
        svgEl('circle', Object.assign({ cx, cy, r: Math.max(5, cs * 0.2), 'stroke-width': 1.6 }, ghost), g);
      }
    }""", """    for(const pb of v.probes || (v.probe ? [v.probe] : [])){              // V1.0.19: several tried values (the cases)
      const key = pb.key, [orient, rest] = key.split(':'), [c, r] = rest.split(',').map(Number), g = svgEl('g', {}, svg);
      g.setAttribute('class', 'case-try');                               // V1.0.53: the tried choice itself, in red: a wall or a link
      if(pb.assume === 'wall'){
        const geo = wallJoinGeometry(cs, orient, c, r, stepHasWall);
        svgEl('rect', { x: geo.x, y: geo.y, width: geo.width, height: geo.height, rx: geo.rx, fill: '#e5534b' }, g);
      } else {
        const len = cs * 0.56, th = Math.max(4, cs * 0.17);
        const at = orient === 'v' ? { x: (c + 1) * cs - len / 2, y: r * cs + cs / 2 - th / 2, width: len, height: th } : { x: c * cs + cs / 2 - th / 2, y: (r + 1) * cs - len / 2, width: th, height: len };
        svgEl('rect', Object.assign(at, { rx: th / 2, fill: '#e5534b', stroke: '#7a1f1a', 'stroke-width': 1 }), g);
      }
    }""", 'tried edge in red')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
if '--reference' in sys.argv:
    out = sys.argv[sys.argv.index('--reference') + 1]
    open(out, 'w', encoding='utf8').write(''.join(l[2:] if l.startswith('  ') else l for l in core.splitlines(True))); print('ok', out)
