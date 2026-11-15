#!/usr/bin/env python3
"""Core v114 (release V1.0.31): the shared step of every rule tag ('RULE_FAMILY', refactoring step 8 of 8, core part only).

User: with the shared steps, the step-by-step could show one name per step and say which rule supplied the fact ("Forced growth,
from the roses"). That changes the step texts on the author's rewrite list, so it waits for his approval: this core only adds the
table the page would use, and changes nothing the page shows.
  RULE_FAMILY[tag] = [family, source]
    family: 'grow' (forced growth), 'reach', 'region' (closed-in area count), 'place' (placement), 'corner' (corner / tile pattern)
    source: the rule that supplied the fact ('size', 'minimum', 'roses', 'solitude', 'non-boxy', 'compasses', 'match', ...)
Exported for the tests and the page.
Usage: python3 patch_core114.py <in.js> <out.js> [indent]"""
import sys

FAM = {
  'grow':   [('grow', 'size'), ('min-grow', 'minimum'), ('rose-grow', 'roses'), ('solitude-grow', 'solitude'), ('nonbox-grow', 'non-boxy')],
  'reach':  [('reach', 'size'), ('min-reach', 'minimum'), ('rose-reach', 'roses'), ('solitude-reach', 'solitude'), ('cmp-reach', 'compasses')],
  'region': [('range-region', 'size'), ('bank-region', 'bank'), ('rose-region', 'roses'), ('solitude-region', 'solitude'), ('match-region', 'match'),
             ('piece-region', 'piece-count'), ('region-apart', 'region-count'), ('area-region', 'area-numbers'), ('nonbox-region', 'non-boxy')],
  'place':  [('stamp-place', 'polyomino'), ('bank-place', 'bank'), ('match-place', 'match'), ('mismatch-place', 'mismatch'), ('boxy-place', 'boxy'),
             ('gemini-place', 'gemini'), ('area-place', 'area-numbers'), ('cmp-place', 'compasses'), ('cmp-box', 'compasses'), ('mingle-area-place', 'mingle-area')],
  'corner': [('bri-three', 'bricky'), ('bri-pinch', 'bricky'), ('bri-vertex', 'bricky'), ('loo-three', 'loopy'), ('loo-corner', 'loopy'), ('loo-outline', 'loopy'),
             ('pal-wall', 'palisades'), ('pal-link', 'palisades'), ('wally-wall', 'wally'), ('wally-link', 'wally')],
}

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v113 (V1.0.31)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v114 (V1.0.31) = v113 + the shared step of every rule tag (RULE_FAMILY); v113 (V1.0.31)", 'banner')
    body = ', '.join(f"'{t}': ['{f}', '{s}']" for f, L in FAM.items() for t, s in L)
    a = src.index('const RULE_TAGS = new Set([')
    a = src.rfind('\n', 0, a) + 1
    src = src[:a] + ind + "// v114: the shared step each rule tag belongs to, and the rule that supplied the fact (for one step name per shared step: needs the author's approval)\n" + ind + "const RULE_FAMILY = {" + body + "};\n" + src[a:]
    if 'module.exports = {' in src:
        src = rep(src, "module.exports = { normalizeCells,", "module.exports = { RULE_FAMILY, normalizeCells,", 'export')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
