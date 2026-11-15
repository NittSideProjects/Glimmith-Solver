#!/usr/bin/env python3
"""Core v121 (release V1.0.37): a far join is only reported when the two groups really do not touch.

Author: on a compass puzzle the step-by-step said "Far apart, but one piece" about two tiles that touch through a third one already
linked to the first (a compass tile). union(a, b) logged a fact whenever the two TILES a and b were not side by side (v93), even
when their GROUPS were: the edge between the groups is then linked by the same step (v99: same-piece links at once) and shows as a
plain link of that rule, so the fact only confused. Now the fact is logged only when no tile of one group is beside a tile of the
other.
Usage: python3 patch_core121.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v120 (V1.0.36)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v121 (V1.0.37) = v120 + far joins only between groups that do not touch; v120 (V1.0.36)", 'banner')
    src = rep(src, I("""    if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1) factLog.push([a, b, factTag || 'far-join', propPos]);       // v93, v98 tag, v99 position
"""), I("""    if(factRec && Math.abs(a % w - b % w) + Math.abs(((a - a % w) - (b - b % w)) / w) !== 1 && !groupsTouch(ra, rb)) factLog.push([a, b, factTag || 'far-join', propPos]);       // v93, v98 tag, v99 position, v121 groups apart
"""), 'union')
    src = rep(src, I("""  function union(a, b){
    let ra = find(a), rb = find(b);
"""), I("""  function groupsTouch(ra, rb){                          // v121: a tile of one group is beside a tile of the other
    const A = members.get(ra), B = members.get(rb), small = A.length <= B.length ? A : B, other = small === A ? rb : ra;
    for(const id of small){ const x = id % w, y = (id - x) / w; for(const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const nx = x + dx, ny = y + dy; if(nx >= 0 && ny >= 0 && nx < w && ny < h && find(ny * w + nx) === other) return true; } }
    return false;
  }
  function union(a, b){
    let ra = find(a), rb = find(b);
"""), 'groupsTouch')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
