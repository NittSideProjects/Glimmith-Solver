#!/usr/bin/env python3
"""Core v132 (release V1.0.55): the reach cap of the size-comparing walls uses the v131 group-size check too.

reachCap (v101: with walls that compare sizes - lt / gt / diffN / gemini / delta - a piece stays inside the tiles its group can still
reach, so its largest size is that count) called reachCount without the size cap, so the walk still went into groups that would make
the piece too big (the v131 check stayed off there). It now passes the group's cap: the count can only get smaller, which is sound
for the same reason as in v131 (no piece of this group can hold a tile of such a group), and gives tighter size limits.
Usage: python3 patch_core132.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v131 (V1.0.54)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v132 (V1.0.55) = v131 + the reach cap of size-comparing walls uses the group-size check; v131 (V1.0.54)", 'banner')
    src = rep(src, "const n = reachCount(rep, members.get(rep), dmap.get(rep) || none, null, lim);",
                   "const n = reachCount(rep, members.get(rep), dmap.get(rep) || none, null, lim, cap);      // v132: with the cap", 'reachCap call')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
