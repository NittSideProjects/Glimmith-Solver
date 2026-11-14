#!/usr/bin/env python3
"""Core v103 (release V1.0.20): more checks say where they fail (markAt), for "Show cases".

v102 ringed the tiles where a case breaks for a few checks only; on a sample of puzzles one proof by contradiction in six had a
place. These checks now note theirs too: a group with no shape left (Mingle Shape / Size Separation / Mismatch clashes), no place
left for an area number, a polyomino, a bank shape, a rectangle or a hall candidate, a closed-in area that whole pieces can not
cover (range / bank region), a rectangle that can not grow (Non-boxy), sizes ruled out by the walls that compare sizes, and a
watchtower that sees too many or too few pieces. markAt only records tiles.

And opts.explain with { apart } or { join } now lets the full rules run on the assumption, as the solver's own check of a far join
does (v102 used the lighter probe pass, which often found no contradiction there). A normal run is unchanged.
Usage: python3 patch_core103.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v102 (V1.0.19) = v101 + opts.explain",
        "// ================= SOLVER CORE (pure, unit-tested separately; v103 (V1.0.20) = v102 + more checks say where they fail (markAt); v102 (V1.0.19) = v101 + opts.explain", 'banner')
    # trying two groups apart (or together) is checked as the solver checks it: with the full rules, not the lighter probe pass
    src = rep(src, I("    const run = () => { inProbe = true; try { return propagate(); } finally { inProbe = false; } };\n"),
                   I("    const run = () => { inProbe = !!x.edge; try { return propagate(); } finally { inProbe = false; } };       // v103: full rules for apart / join\n"), 'explain run')
    for old, new, what in (
        ("        if(domEmpty(dy, area)){ why = T + '-clash'; return null; }\n", "        if(domEmpty(dy, area)){ why = T + '-clash'; markAt(why, members.get(y)); return null; }\n", 'mingle clash'),
        ("      if(V.length === 0){ why = 'area-place'; return null; }\n", "      if(V.length === 0){ why = 'area-place'; markAt(why, mem); return null; }\n", 'area place'),
        ("      if(V.length === 0){ why = 'stamp-place'; return null; }\n", "      if(V.length === 0){ why = 'stamp-place'; markAt(why, members.get(rep)); return null; }\n", 'stamp place'),
        ("          if(rb === ra || regOf[rb] === regOf[ra] || !domHas(db, p.k, p.size, false)) continue;\n          domRemove(db, p.k, p.size, false); changed = true;\n          if(domEmpty(db, false)){ why = 'mismatch-clash'; return null; }\n",
         "          if(rb === ra || regOf[rb] === regOf[ra] || !domHas(db, p.k, p.size, false)) continue;\n          domRemove(db, p.k, p.size, false); changed = true;\n          if(domEmpty(db, false)){ why = 'mismatch-clash'; markAt(why, members.get(rb)); return null; }\n", 'mismatch clash 2'),
        ("          if(!db || !domHas(db, p.k, p.size, false)) continue;\n          domRemove(db, p.k, p.size, false); changed = true;\n          if(domEmpty(db, false)){ why = 'mismatch-clash'; return null; }\n",
         "          if(!db || !domHas(db, p.k, p.size, false)) continue;\n          domRemove(db, p.k, p.size, false); changed = true;\n          if(domEmpty(db, false)){ why = 'mismatch-clash'; markAt(why, members.get(rb)); return null; }\n", 'mismatch clash 3'),
        ("      if(!RI.reach[s]){ why = regionTag; return null; }\n", "      if(!RI.reach[s]){ why = regionTag; markAt(why, tiles); return null; }\n", 'region 1'),
        ("      if(!zlo){ why = regionTag; return null; }\n", "      if(!zlo){ why = regionTag; markAt(why, tiles); return null; }\n", 'region 2'),
        ("      if(reps.length < RI.minN[s]){ why = regionTag; return null; }", "      if(reps.length < RI.minN[s]){ why = regionTag; markAt(why, tiles); return null; }", 'region 3'),
        ("      if(reps.length === 1) { if(members.get(reps[0]).length > zhi){ why = regionTag; return null; } }", "      if(reps.length === 1) { if(members.get(reps[0]).length > zhi){ why = regionTag; markAt(why, tiles); return null; } }", 'region 4'),
        ("      if(capOf.get(rep) <= len){ why = 'nonbox-fit'; return null; }\n", "      if(capOf.get(rep) <= len){ why = 'nonbox-fit'; markAt(why, mem); return null; }\n", 'nonbox'),
        ("    for(const P of placementsAt(X, members.get(rep)[0])) if(placementOk(P, rep, dmap)) V.push(P);\n    if(V.length === 0){ why = tag; return null; }\n", "    for(const P of placementsAt(X, members.get(rep)[0])) if(placementOk(P, rep, dmap)) V.push(P);\n    if(V.length === 0){ why = tag; markAt(why, members.get(rep)); return null; }\n", 'place step'),
        ("    for(const d0 of dom.values()) if(d0 === 0n){ why = 'area-rel'; return null; }\n", "    for(const [r0, d0] of dom) if(d0 === 0n){ why = 'area-rel'; markAt(why, members.get(r0) || []); return null; }\n", 'area-rel extra'),
        ("if(d === 0n){ why = tag; return false; } dom.set(rep, d); changed = true; return true; };", "if(d === 0n){ why = tag; markAt(why, members.get(rep) || []); return false; } dom.set(rep, d); changed = true; return true; };", 'setDom'),
        ("      if(T > k || T < 1){ why = 'tower-count'; return null; }\n", "      if(T > k || T < 1){ why = 'tower-count'; markAt(why, act.map(q => ids[q])); return null; }\n", 'tower count'),
        ("        if(ok && boxPlacementOk(P, rep, dmap)) V.push(P);\n      }\n      if(V.length === 0){ why = tag; return null; }\n", "        if(ok && boxPlacementOk(P, rep, dmap)) V.push(P);\n      }\n      if(V.length === 0){ why = tag; markAt(why, members.get(rep)); return null; }\n", 'box place'),
        ("      if(V === null) continue;\n      if(V.length === 0){ why = tag; return null; }\n", "      if(V === null) continue;\n      if(V.length === 0){ why = tag; markAt(why, mem); return null; }\n", 'hall'),
        ("      if(fail){ why = 'mingle-area-place'; return null; }\n", "      if(fail){ why = 'mingle-area-place'; markAt(why, smem); return null; }\n", 'mingle area place'),
        ("        if(members.get(rep).length > capOf.get(rep) || need.get(rep) > capOf.get(rep)){ why = regionTag; return null; }", "        if(members.get(rep).length > capOf.get(rep) || need.get(rep) > capOf.get(rep)){ why = regionTag; markAt(why, members.get(rep)); return null; }", 'region 5'),
    ):
        if old.startswith(' '): old, new = I(old), I(new)                  # a whole line (the others are pieces of a line)
        src = rep(src, old, new, 'at ' + what)
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
