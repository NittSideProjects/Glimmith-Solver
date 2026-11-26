#!/usr/bin/env python3
"""Core v134 (release V1.0.57): the propagation steps run in the author's order.

propagateOnce() ran its steps in one fixed order written in the code (cheap steps first, v95), and returned the first step that
decided something. That order decides which rule the step-by-step shows when several rules could decide something at the same
position. The author compared 235 such positions from the campaign (dev/tools/rule_order, order_2026-11-26.md) and ranked the rules
by how natural they are to see first.

The steps are now numbered blocks inside a loop over STEP_ORDER, so their order is a table, not the layout of the code:
  * the checks that only fail (Boxy + Non-boxy, rose counts, wall inside a group, cross, Match holes, ...), the trivial walls / links
    (basicFirst, sameLinksEarly, author-requested) and the per-pass preparations stay first, unchanged;
  * every deciding step is a block; the per-group bounds (need / cap / rose mask, the Minimum, Match, Gemini / Delta sizes) are worked
    out the first time a block of the pass needs them (ensureNeed), the open exits of each group too (getExits);
  * the order of the blocks is BLOCK_PRIO: each block's place is the author's rank of the rules it decides, weighted by how often it
    decides each of them on the campaign puzzles (the frequency-weighted mean rank of its tags). A block never seen deciding
    anything keeps its old place among its neighbours.
  * opts.ruleOrder === 'old' runs the blocks in the old order (for comparisons and tests); opts.blockStats (an object) counts the
    rule tags each block decides.
Nothing is decided differently: every block is the same code, a pass still returns the first block that decides something, and the
next pass runs them all again, so the solver reaches the same fixed point (the same edges before the probes) in a different order.
Usage: python3 patch_core134.py <in.js> <out.js> [indent]"""
import sys, json, os

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

# block name, start anchor (in the reference text, no extra indent); a block runs up to the next anchor
BLOCKS = [
    ('euler',       "    if(eulerBudget !== null){ const eu = eulerStep();"),
    ('colour',      "    { const cl = colourStep(dmap);"),
    ('iso',         "    if(isoCase){ const io = isoStep();"),
    ('rosecut',     "    if(rcOn){ const rc = roseCutStep(dmap);"),
    ('gdclash',     "    if(gdPairs.length > 0){ const gc = gdClashStep(dmap);"),
    ('__checks',    "    if(opts.crossCheck !== false && !searchLite && !crossOk(dmap))"),
    ('gemiso',      "    if(gemIso){ const gi = gemIsoStep(dmap);"),
    ('isok',        "    if(isoK){ const ik = isoKStep(dmap);"),
    ('diffclash',   "    if(dcPairs.length > 0){ const dc = diffClashStep(dmap);"),
    ('rosecover',   "    if(rcvOn && !inProbe && !searchLite){ const cv = roseCoverStep(dmap);"),
    ('label',       "    if(lbOn && (lbSized ||"),
    ('diffsmall',   "    if(dsOn && !inProbe && !searchLite){ const ds = diffSmallStep(dmap);"),
    ('__need',      "    const changes = [];\n    // every group must still be able to be a piece\n"),
    ('__spots',     "    for(const e of spots){\n      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n      const dk = "),
    ('bricky',      "    // v36: bricky\n"),
    ('sizecut',     "    { const sc = sizeCutStep();"),
    ('areapair',    "    if(areaPairOn){ const ap = areaPairStep(dmap);"),
    ('areacount',   "    // v110: how many pieces each area closed in by walls holds"),
    ('loopy',       "    // v37: loopy\n"),
    ('wallyends',   "    // v96: wally-ends"),
    ('bridge',      "    { const br = bridgeStep();"),
    ('tower',       "    // v33: watchtowers, shape bank\n"),
    ('mingle',      "    // Size Separation / Mingle Shape: neighbouring pieces differ"),
    ('rel',         "    // v27: walls that compare sizes (lt / gt / diffN / gemini)"),
    ('range',       "    // v26: regions closed in by walls must be coverable"),
    ('area',        "    // v27: area numbers (and stamps): how many pieces"),
    ('splitcut',    "    // v92c: split-cut."),
    ('areasum',     "    // v40: area numbers that exactly fill a region"),
    ('stamp',       "    // stamps: where can each one still go?\n"),
    ('palisade',    "    // v35: palisades\n"),
    ('bankblock',   "    if(bankOn && (bankAllBlock || bankAllBend)){"),
    ('mismatch',    "    // Mismatch: all pieces differ"),
    ('grow',        "    // forced growth: a group smaller than the piece it must become"),
    ('reach',       "    // reachability look-ahead"),
    ('matchplace',  "    // Match with one shape left: where can it still go"),
    ('box',         "    // v32: Boxy / Non-boxy\n"),
    ('rosecutdyn',  "    if(rcDyn && (!inProbe || opts.roseCutProbe !== false)"),
    ('gemplace',    "    if(gpOn && !inProbe && !searchLite){ const gp = gemPlaceStep("),
    ('mhall',       "    if(mhOn && !inProbe && !searchLite){ const mh = boxHallStep("),
    ('compass',     "    // v38: compass\n    if(hasCompass){\n"),
    ('bankplace',   "    if(bankOn){\n      const bp = bankPlaceStep("),
    ('compassplace',"    if(hasCompass && (!inProbe || globalThis.__CMP_PROBE)){"),
    ('areaplace',   "    if(areaOn && apSmallK && !searchLite){"),
    ('__end',       "    return changes;\n  }\n"),
]
NEED_FIRST = {'bricky','sizecut','areapair','areacount','loopy','wallyends','bridge','tower','mingle','rel','range','area','splitcut','areasum',
              'stamp','palisade','bankblock','mismatch','grow','reach','matchplace','box','rosecutdyn','gemplace','mhall','compass','bankplace',
              'compassplace','areaplace','sizewall'}

def restructure(body):
    pos = []
    for name, a in BLOCKS:
        c = body.count(a)
        if c != 1: raise SystemExit(f'block {name}: anchor found {c} times')
        pos.append((body.index(a), name))
    if [p for p, _ in pos] != sorted(p for p, _ in pos): raise SystemExit('blocks out of order')
    pre = body[:pos[0][0]]
    parts = {}
    for i, (p, name) in enumerate(pos):
        q = pos[i + 1][0] if i + 1 < len(pos) else len(body)
        parts[name] = body[p:q]
    # the failure-only checks join the prelude
    pre += parts.pop('__checks')
    # the per-group bounds become ensureNeed()
    need = parts.pop('__need')
    need = rep(need, "    const changes = [];\n", "", 'need changes')
    need = rep(need, "    const need = new Map(), capOf = new Map(), maskOf = new Map();\n", "    need = new Map(); capOf = new Map(); maskOf = new Map();\n", 'need decl')
    need = rep(need, "    let needBase = null;\n", "    needBase = null;\n", 'needBase decl')
    need = need.replace("return null;", "return false;")
    need = '\n'.join(('  ' + l if l.strip() else l) for l in need.split('\n'))
    head = ("    const changes = [];\n"
            "    let need = null, capOf = null, maskOf = null, needBase = null, needOk = 0, exits = null;   // v134: worked out when a block first needs them\n"
            "    const ensureNeed = () => {\n"
            "      if(needOk !== 0) return needOk > 0;\n"
            "      needOk = -1;\n" + need.rstrip() + "\n"
            "      needOk = 1; return true;\n"
            "    };\n"
            "    const getExits = () => {                                     // v134: the open edges out of each group (forced growth, reach)\n"
            "      if(exits) return exits;\n"
            "      exits = new Map();\n"
            "      for(const e of spots){\n"
            "        if(e.state !== 0) continue;\n"
            "        const ra = find(e.a), rb = find(e.b);\n"
            "        if(!exits.has(ra)) exits.set(ra, []); exits.get(ra).push(e);\n"
            "        if(!exits.has(rb)) exits.set(rb, []); exits.get(rb).push(e);\n"
            "      }\n"
            "      return exits;\n"
            "    };\n")
    # the spot loop: two blocks (known-different walls / links inside a group, then walls by size)
    sp = parts.pop('__spots')
    old_loop = ("    for(const e of spots){\n      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n      const dk = ra < rb ? ra * N + rb : rb * N + ra;\n"
                "      if(ra === rb){ e.state = 2; changes.push({ e, value: 'same' }); }\n"
                "      else if(diff.has(dk)){ e.state = 1; changes.push({ e, value: 'wall', rule: diffWhy.get(dk) }); }\n"
                "      else if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }\n"
                "    }\n"
                "    if(changes.length > 0) return changes;              // let the new walls spread before looking for forced growth\n")
    if sp != old_loop: raise SystemExit('spot loop changed:\n' + sp)
    parts['diffwall'] = ("    for(const e of spots){                             // v134: links inside a group, walls between groups known to differ\n"
                         "      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n      const dk = ra < rb ? ra * N + rb : rb * N + ra;\n"
                         "      if(ra === rb){ e.state = 2; changes.push({ e, value: 'same' }); }\n"
                         "      else if(diff.has(dk)){ e.state = 1; changes.push({ e, value: 'wall', rule: diffWhy.get(dk) }); }\n"
                         "    }\n"
                         "    if(changes.length > 0) return changes;\n")
    parts['sizewall'] = ("    for(const e of spots){                             // v134: walls between groups that would break a rule together (size, ...)\n"
                         "      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n"
                         "      if(ra === rb || diff.has(ra < rb ? ra * N + rb : rb * N + ra)) continue;\n"
                         "      if(pieceInfo(members.get(ra).concat(members.get(rb))) === null){ e.state = 1; changes.push({ e, value: 'wall', rule: why }); }\n"
                         "    }\n"
                         "    if(changes.length > 0) return changes;              // let the new walls spread before looking for forced growth\n")
    # rel: the root bounds are kept after it (as before: once the pass reaches it)
    parts['rel'] = rep(parts['rel'], "    if(!inProbe && !searchLite){ rootNeed = need; rootCap = capOf; }                                                  // v88b\n", "", 'rootNeed')
    parts['rel'] += "    if(!inProbe && !searchLite){ rootNeed = need; rootCap = capOf; }                                                  // v88b\n"
    # forced growth / reach share the exits
    g = parts['grow']
    g = rep(g, ("    const exits = new Map();\n    for(const e of spots){\n      if(e.state !== 0) continue;\n      const ra = find(e.a), rb = find(e.b);\n"
                "      if(!exits.has(ra)) exits.set(ra, []); exits.get(ra).push(e);\n      if(!exits.has(rb)) exits.set(rb, []); exits.get(rb).push(e);\n    }\n"),
            "    getExits();\n", 'exits')
    parts['grow'] = g
    end = parts.pop('__end')
    names = [n for n, _ in BLOCKS if not n.startswith('__')]
    # diffwall / sizewall take the place of the spot loop, before bricky
    names.insert(names.index('bricky'), 'sizewall'); names.insert(names.index('sizewall'), 'diffwall')
    out = [head, "    for(let bi = 0; bi < STEP_ORDER.length; bi++){                     // v134: the steps in the author's order (see patch_core134.py)\n",
           "      lastBlock = STEP_ORDER[bi];\n      switch(lastBlock){\n"]
    for i, n in enumerate(names):
        txt = parts[n].rstrip('\n')
        txt = '\n'.join(('    ' + l if l.strip() else l) for l in txt.split('\n'))
        guard = "          if(!ensureNeed()) return null;\n" if n in NEED_FIRST else ""
        out.append(f"        case {i}: {{                                                // {n}\n{guard}{txt}\n        }} break;\n")
    out.append("      }\n    }\n")
    return pre, ''.join(out) + end, names

ORDER_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'step_order_V1.0.57.json')

def patch(src, ind):
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v133 (V1.0.56)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v134 (V1.0.57) = v133 + the propagation steps run in the author's order; v133 (V1.0.56)", 'banner')
    de = lambda t: ''.join(l[len(ind):] if l.startswith(ind) else l for l in t.splitlines(True))
    ad = lambda t: ''.join(ind + l if l.strip() else l for l in t.splitlines(True))
    a = src.index(ind + "  function propagateOnce(){\n")
    s0 = src.index(ind + "    if(eulerBudget !== null){ const eu = eulerStep();", a)
    e0 = src.index(ind + "    return changes;\n" + ind + "  }\n", s0) + len(ind + "    return changes;\n" + ind + "  }\n")
    body = de(src[s0:e0])
    pre, rest, names = restructure(body)
    order = json.load(open(ORDER_FILE)) if os.path.exists(ORDER_FILE) else {'order': names}
    want = order['order']
    if sorted(want) != sorted(names): raise SystemExit(f'order file does not name every block: {sorted(set(names) ^ set(want))}')
    idx = {n: i for i, n in enumerate(names)}
    table = ("  // v134: the order of the propagation blocks (numbers = the cases of propagateOnce). STEP_ORDER_OLD is the order of v133.\n"
             f"  const STEP_NAMES = {json.dumps(names)};\n"
             f"  const STEP_ORDER = opts.ruleOrder === 'old' ? {json.dumps(list(range(len(names))))} : {json.dumps([idx[n] for n in want])};\n")
    src = src[:s0] + ad(pre + rest) + src[e0:]
    src = rep(src, ind + "  function propagateOnce(){\n", ad(table + "  let lastBlock = -1;                                   // v134: the block that ended the last pass (-1: the checks before them)\n") + ind + "  function propagateOnce(){\n    lastBlock = -1;\n".replace("\n    lastBlock", "\n" + ind + "    lastBlock"), 'table')
    src = rep(src, ind + "        if(tsOn && fr.n) keepSizes(fr.n, fr.c);                          // v105\n",
              ind + "        if(tsOn && fr.n) keepSizes(fr.n, fr.c);                          // v105\n" +
              ind + "        if(opts.blockStats && !inProbe && !searchLite && part.length){ const bs = opts.blockStats, bn = lastBlock < 0 ? 'checks' : STEP_NAMES[lastBlock]; const o = bs[bn] || (bs[bn] = {}); for(const ch of part){ const t = tagOut(ch.rule) || 'basic'; o[t] = (o[t] || 0) + 1; } }   // v134\n", 'stats')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
