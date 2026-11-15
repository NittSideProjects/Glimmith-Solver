#!/usr/bin/env python3
"""Core v116 (release V1.0.33): Gemini shares the shape list across its walls (refactoring step 2 of 8, the last rule).

User: the bank, a polyomino, Mismatch, Mingle Shape, Gemini and Delta should all narrow one list of the shapes each tile's piece can
still be. Since v108 the bank and polyominoes read it (pieceInfo), Mingle Shape, Mismatch and Delta write to it (excludeShape); Gemini
did not take part. A Gemini wall means the same shape on both sides, so now:
  * a shape ruled out on one side is ruled out on the other (the union of the two lists, on both groups);
  * the same for the sizes (tile size sets of v106: each side keeps only the sizes the other can still have).
Sound: both pieces have the same shape, hence the same size.
Usage: python3 patch_core116.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v115 (V1.0.33)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v116 (V1.0.33) = v115 + Gemini shares the shape list across its walls; v115 (V1.0.33)", 'banner')
    src = rep(src, I("""          if(kx !== null) excludeShape(y, kx);
        }
      }
"""), I("""          if(kx !== null) excludeShape(y, kx);
        }
      }
      for(const ge of gdAll){                                                        // v116: Gemini = the same shape: the two lists are shared
        if(!ge.gem) continue;
        const ra = find(ge.a), rb = find(ge.b); if(ra === rb) continue;
        const ma = members.get(ra), mb = members.get(rb);
        const na = notOfIds(ma), nb = notOfIds(mb);
        if(nb) for(const k of nb) excludeShape(ra, k);
        if(na) for(const k of na) excludeShape(rb, k);
        const sa = setOfIds(ma), sb = setOfIds(mb);
        if(sb !== -1) keepOnly(ra, sb);
        if(sa !== -1) keepOnly(rb, sa);
      }
"""), 'gemini')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
