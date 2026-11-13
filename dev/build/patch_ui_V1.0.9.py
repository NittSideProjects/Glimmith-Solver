#!/usr/bin/env python3
"""Page V1.0.8 -> V1.0.9: embedded core v99 (see patch_core99.py): two neighbouring tiles known to be in one piece are linked at
once, and a far join is reported just before the decisions that followed it. In the step view the links that follow a join now
show on that join's step, instead of on a later, unrelated step.
Step view: a link between two tiles the steps already showed to be in one piece (joined by earlier links or facts) is part of the step
on screen, whichever rule the solver names for it (a compass step that joins two groups also decides the edges between them: those
links now show with the join, not one step later). Before, only links the solver tagged 'basic' were treated that way.
Usage: python3 patch_ui_V1.0.9.py glimmith_solver_V1.0.8.html glimmith_solver_V1.0.9.html"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_core99 import patch as core_patch
src = open(sys.argv[1], encoding='utf8').read()
a = src.index('  // ================= SOLVER CORE (pure'); b = src.index('  // ================= IMPORT CORE (pure')
src = src[:a] + core_patch(src[a:b], '  ') + src[b:]

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = rep(src, """    const steps = [start];
    let cur = null;
    for(const e of events){
      if(e.type === 'shape'){ (cur || start).shapes.push(e.cells); continue; }
      if(e.type === 'fact'){                                             // v94: only "one piece" facts make a step
        if(e.kind !== 'join') continue;""", """    const steps = [start];
    let cur = null;
    // V1.0.9: tiles the steps so far have shown to be in one piece (links and facts), to spot links that say nothing new
    const par = new Map(), find = k => { while(par.has(k) && par.get(k) !== k) k = par.get(k); return k; }, join = (a, b) => { a = find(a); b = find(b); if(a !== b) par.set(a, b); };
    const tilesOf = key => { const [o, rest] = key.split(':'), [c, r] = rest.split(',').map(Number); return [`${c},${r}`, o === 'v' ? `${c + 1},${r}` : `${c},${r + 1}`]; };
    for(const [k, t] of puzzle.walls) if(t === 'link'){ const [a, b] = tilesOf(k); join(a, b); }
    for(const e of events){
      if(e.type === 'shape'){ (cur || start).shapes.push(e.cells); continue; }
      if(e.type === 'fact'){                                             // v94: only "one piece" facts make a step
        if(e.kind !== 'join') continue;
        join(e.a.join(','), e.b.join(','));""")
src = rep(src, """      if(e.via === 'probe' || e.via === 'search'){ cur = newStep(e.via, e); steps.push(cur); continue; }
      const trivial = e.rule === 'basic' && e.value === 'same';            // the edge lies inside a group the solver already joined: no new information""",
"""      let known = false;
      if(e.value === 'same'){ const [a, b] = tilesOf(e.spot.key); known = find(a) === find(b); join(a, b); }
      if(e.via === 'probe' || e.via === 'search'){ cur = newStep(e.via, e); steps.push(cur); continue; }
      const trivial = (e.rule === 'basic' && e.value === 'same') || known;   // the edge lies inside a group the steps already joined: no new information (V1.0.9: whatever rule it names)""")
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
