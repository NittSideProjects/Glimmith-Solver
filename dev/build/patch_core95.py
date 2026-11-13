#!/usr/bin/env python3
"""Core v95 (release V1.0.2): propagation steps reordered, fastest first (user).

Timings: dev/results/step_timing_v94.md (average time of one run of each step in the puzzles where it is active, 1,225 campaign puzzles
+ dev/user_puzzles, 5 s each). Three blocks, each sorted on its own (user: never across blocks):
  block 1 (walls and "kept apart" only): item 6-9 stay (pinned polyomino, Match + Mismatch, the Match shape list, walls -> kept apart:
          the rest needs them), then euler-count, colour-count, match-iso, rose-cut, gd-clash, cross, match-hole, gemini-iso, match-iso (K),
          diff-clash, rose-cover, label, diff-small.
  block 2 (piece sizes): unchanged.
  block 3 (rules using the sizes): fastest first, except that four steps compute sizes / "kept apart" facts the later steps of the SAME
          pass read (Mingle, size relations, range-region, area-count; Mismatch). They keep their order (Mingle -> relations -> range ->
          area -> Mismatch), and every step that came after one of them still comes after it (else it would never see what they found:
          those facts are thrown away at the end of the pass). Steps with nothing to wait for move freely.
Usage: python3 patch_core95.py <in.js> <out.js> [indent]
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
    rep("// ================= SOLVER CORE (pure, unit-tested separately; v94 (V1.0.1) = v93 + wally-line;",
        "// ================= SOLVER CORE (pure, unit-tested separately; v95 (V1.0.2) = v94 + propagation steps fastest first; v94 (V1.0.1) = v93 + wally-line;")

    def reorder(start, end, anchors, order, extra=None):
        nonlocal src
        s = src.index(I(start)); e = src.index(I(end), s)
        seg = src[s:e]
        pos = []
        for k, a in anchors:
            alts = a if isinstance(a, tuple) else (a,)                       # the page's copy words a few comments differently
            hit = [x for x in alts if seg.count(I(x)) == 1]
            if len(hit) != 1: raise SystemExit(f'segment anchor {k} not found once')
            pos.append((seg.index(I(hit[0])), k))
        pos.sort()
        if pos[0][0] != 0: raise SystemExit('segment does not start at the first anchor')
        parts = {}
        for i, (p, k) in enumerate(pos):
            q = pos[i + 1][0] if i + 1 < len(pos) else len(seg)
            parts[k] = seg[p:q]
        if extra: extra(parts)
        if sorted(order) != sorted(parts): raise SystemExit(f'order mismatch {set(order) ^ set(parts)}')
        src = src[:s] + ''.join(parts[k] for k in order) + src[e:]

    # ---- block 1 ----
    reorder("    if(eulerBudget !== null){ const eu = eulerStep();",
            "    const changes = [];\n    // every group must still be able to be a piece",
            [('euler', "    if(eulerBudget !== null){ const eu"), ('iso', "    if(isoCase){"), ('isoK', "    if(isoK){"),
             ('dc', "    if(dcPairs.length > 0){"), ('gd', "    if(gdPairs.length > 0){"), ('gi', "    if(gemIso){"),
             ('col', "    { const cl = colourStep"), ('lb', "    if(lbOn &&"), ('rcv', "    if(rcvOn &&"), ('ds', "    if(dsOn &&"),
             ('rc', "    if(rcOn){"), ('mh', "    if(ruleMatch && opts.matchHole"), ('cross', "    if(opts.crossCheck !== false")],
            ['euler', 'col', 'iso', 'rc', 'gd', 'cross', 'mh', 'gi', 'isoK', 'dc', 'rcv', 'lb', 'ds'])

    # ---- block 3 ----
    def split3(p):
        # Boxy rectangles again (after the size relations) becomes a step of its own
        rel = p['rel']
        a = I("      if(boxOn && !searchLite && opts.boxAfterRel !== false){                  // v86a: the rectangles again, with area-rel's sizes\n")
        b = I("        if(p2.length > 0) return p2;\n      }\n")
        i = rel.index(a); j = rel.index(b, i) + len(b)
        inner = rel[i:j]
        p['rel'] = rel[:i] + rel[j:]
        p['boxagain'] = I("    if(relOn && boxOn && !searchLite && opts.boxAfterRel !== false){        // v86a: the rectangles again, with area-rel's sizes (v95: own step, after the relations)\n"
                          "      const p2 = boxPlaceStep(need, capOf, dmap);\n      if(p2 === null){ failWhy = why; return null; }\n      if(p2.length > 0) return p2;\n    }\n")
        if 'boxPlaceStep(need, capOf, dmap)' not in inner: raise SystemExit('box again')
        # shape bank: block / bend check and placements become two steps
        old = I("    if(bankOn){\n      if(bankAllBlock || bankAllBend){ if(bankBlockStep(capOf, dmap) === null){ failWhy = why; return null; } }\n      const bp = bankPlaceStep(need, capOf, dmap);\n      if(bp === null){ failWhy = why; return null; }\n      if(bp.length > 0) return bp;\n    }\n")
        if p['bank'] != old: raise SystemExit('bank segment')
        p['bank'] = I("    if(bankOn && (bankAllBlock || bankAllBend)){ if(bankBlockStep(capOf, dmap) === null){ failWhy = why; return null; } }      // v95: own step\n")
        p['bankplace'] = I("    if(bankOn){\n      const bp = bankPlaceStep(need, capOf, dmap);\n      if(bp === null){ failWhy = why; return null; }\n      if(bp.length > 0) return bp;\n    }\n")
        # the shared "watchtowers, shape bank" comment stays with the watchtowers
    reorder("    if(mhOn && !inProbe && !searchLite){",
            "    return changes;\n  }\n\n  // ---- pieces that are finished",
            [('mh', "    if(mhOn && !inProbe"), ('pal', "    // v35: palisades"), ('bri', "    // v36: bricky"), ('loo', "    // v37: loopy"),
             ('cmp', "    // v38: compass\n"), ('tower', "    // v33: watchtowers, shape bank"), ('bank', "    if(bankOn){"),
             ('box', "    // v32: Boxy / Non-boxy"), ('mingle', ("    // Mingle Area / Mingle Shape", "    // Size Separation / Mingle Shape")), ('rel', "    // v27: walls that compare sizes"),
             ('sizecut', "    { const sc = sizeCutStep()"), ('gp', "    if(gpOn && !inProbe"),
             ('range', "    // v26: regions closed in by walls must"), ('area', "    // v27: area numbers (and stamps)"), ('mism', "    // Mismatch: all pieces differ"),
             ('mreg', "    if(ruleMatch){\n      const mr"), ('stamp', "    // stamps: where can each one still go?"), ('aplace', "    if(areaOn && apSmallK"),
             ('mplace', "    // Match with one shape left"), ('rreg', "    // roses: regions closed in by walls"), ('rcd', "    if(rcDyn &&"),
             ('asum', "    // v40: area numbers that exactly fill"), ('bridge', "    { const br = bridgeStep();"), ('split', "    // v66b: a group in several parts"),
             ('splitcut', "    // v92c: split-cut."), ('forced', "    // forced growth:"), ('reach', "    // reachability look-ahead"),
             ('cplace', "    if(hasCompass && (!inProbe || globalThis.__CMP_PROBE))")],
            ['bri', 'sizecut', 'rreg', 'mreg', 'loo', 'bridge',            # fast, nothing to wait for
             'tower', 'mingle', 'rel', 'range', 'area',                   # the size chain (watchtowers: 95 us, before Mingle 97 us)
             'split', 'splitcut', 'asum', 'stamp', 'pal', 'bank', 'mism',  # after area-count's facts / then Mismatch
             'forced', 'reach', 'mplace', 'box', 'rcd', 'gp', 'mh', 'cmp', 'bankplace', 'boxagain', 'cplace', 'aplace'],
            extra=split3)
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
