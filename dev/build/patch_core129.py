#!/usr/bin/env python3
"""Core v129 (release V1.0.50): two more steps go, matchCover and reachCompass.

The rule ablation (results/rule_ablation_v127.md) found each of them deciding a few edges on a single campaign puzzle and nothing
elsewhere: matchCover 1 edge on one puzzle, reachCompass 2 edges on another. Solved in full without them, both puzzles are still
unique in the same time (rerun twice), so the author chose to remove them for simplicity:
  matchCover    (v70, v74: a Match size is only kept if some shape of that size can cover every active tile; matchCoverOk)
  reachCompass  (v67b: the reach count does not pass through a compass group that can not join the growing group; rcJoin)
Removing a step can only leave more to the later steps and the final search (which re-checks every tiling with the full rule
checker), so no answer can become wrong. No page text belongs to them.
Usage: python3 patch_core129.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def cut(src, start, end, new, what):
    """Replace from `start` (found exactly once) up to and including the first `end` after it."""
    c = src.count(start)
    if c != 1: raise SystemExit(f'{what}: start anchor found {c} times')
    a = src.index(start); b = src.find(end, a + len(start))
    if b < 0: raise SystemExit(f'{what}: end anchor not found')
    return src[:a] + new + src[b + len(end):]

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v128 (V1.0.49)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v129 (V1.0.50) = v128 - matchCover, reachCompass; v128 (V1.0.49)", 'banner')
    # matchCover
    src = cut(src, I("""  // v70: can some shape of n tiles cover every active tile (each tile in one of its placements)?"""),
        I("""    return false;
  }
  // v82: match-compass"""), I("""  // v82: match-compass"""), 'matchCoverOk')
    src = rep(src, I("""    if(opts.matchCover !== false && matchS0.length > 1) matchS0 = matchS0.filter(z => z > (opts.matchCoverMax || 10) || matchCoverOk(z));   // v70
"""), '', 'matchCover call')
    # reachCompass
    src = cut(src, I("""        if(hasCompass && opts.reachCompass !== false){                         // v67b: a compass group that can not join this one"""),
        I("""            if(!ok) continue;
          }
        }
"""), '', 'reachCompass')
    src = rep(src, I("""  const rcJoin = new Map();
  let rpSplit"""), I("""  let rpSplit"""), 'rcJoin decl')
    src = rep(src, I("""    const tick = ++rcTick; let qn = 0;
    rcJoin.clear();
"""), I("""    const tick = ++rcTick; let qn = 0;
"""), 'rcJoin clear')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
