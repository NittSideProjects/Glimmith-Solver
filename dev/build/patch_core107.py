#!/usr/bin/env python3
"""Core v107 (release V1.0.27): two small changes, no new deduction.

1. Tile size sets (v106) keep sizes 1..15 one by one (was 1..30); 16 tiles and more are kept as a range only (bit 16 = "16 or
   more"). User: 30 is already a lot; holes come from small sizes.
2. Non-boxy is a Minimum of 3, written once. Every piece of 1 or 2 tiles is a rectangle, so Non-boxy means "at least 3 tiles".
   This was added by hand in seven places (`nonBoxyRule ? 3 : 1`); it now raises sizeLo once, where Minimum / Maximum / Precision
   set it, and all the size logic (forced growth, reach, closed-in areas, the counts) reads it from there, as for a Minimum. The
   places that added it again are gone. The solver decides the same: sizeLo was already >= 3 under Non-boxy (the size range of a
   board is narrowed once with the 3 folded in), so this only removes duplicates. Not changed: the area-number step's own list of
   allowed sizes, which on purpose looks at the rules only (not at the narrowed range), keeps its own `>= 3`; Non-boxy's own
   steps (a group that is still a rectangle keeps growing, ...) stay as they are.
Usage: python3 patch_core107.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v106 (V1.0.26)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v107 (V1.0.27) = v106 with size sets up to 15 and Non-boxy as a Minimum of 3 written once; v106 (V1.0.26)", 'banner')
    # ---- 1. the cap ----
    src = rep(src, I("""  // v106: the sizes the piece of the tile can still have, as a 32-bit mask: bit s = size s for 1..30, bit 31 = "31 tiles or more"
"""), I("""  // v106: the sizes the piece of the tile can still have, as a 32-bit mask: bit s = size s for 1..15 (v107; 1..30 in v106), bit 16 = "16 tiles or more"
"""), 'comment')
    src = rep(src, I("""  const TS_BIG = 1 << 31;
  const tsBit = z => z >= 31 ? TS_BIG : (1 << z);
  const tsRange = (lo, hi) => { if(hi < lo) return 0; let m = 0; const top = Math.min(hi, 30); for(let z = Math.max(lo, 0); z <= top; z++) m |= 1 << z; if(hi >= 31) m |= TS_BIG; return m; };
  const tsLoBit = m => 31 - Math.clz32(m & -m);       // 31 = only "31 or more" left
  const tsHiBit = m => 31 - Math.clz32(m);            // 31 = "31 or more" still possible
"""), I("""  const TS_CAP = 15, TS_BIG = 1 << 16;                 // v107: sizes up to TS_CAP one by one, bit 16 = the bigger ones
  const tsBit = z => z > TS_CAP ? TS_BIG : (1 << z);
  const tsRange = (lo, hi) => { if(hi < lo) return 0; let m = 0; const top = Math.min(hi, TS_CAP); for(let z = Math.max(lo, 0); z <= top; z++) m |= 1 << z; if(hi > TS_CAP) m |= TS_BIG; return m; };
  const tsLoBit = m => { m &= TS_BIG | (TS_BIG - 1); return 31 - Math.clz32(m & -m); };       // > TS_CAP = only the big sizes left
  const tsHiBit = m => { m &= TS_BIG | (TS_BIG - 1); return 31 - Math.clz32(m); };            // > TS_CAP = a big size still possible
"""), 'helpers')
    src = rep(src, "  const tsFromBig = d => (Number(d & 0x7fffffffn) | ((d >> 31n) !== 0n ? TS_BIG : 0)) | 0;     // a BigInt size list -> mask",
                   "  const tsFromBig = d => (Number(d & 0xffffn) | ((d >> 16n) !== 0n ? TS_BIG : 0)) | ~(TS_BIG | (TS_BIG - 1));     // a BigInt size list -> mask (bits above 16 stay set)", 'from big')
    src = rep(src, "  const tsToBig = m => BigInt(m & 0x7fffffff) | (m & TS_BIG ? ~0x7fffffffn : 0n);              // a mask -> BigInt (all big sizes when bit 31)",
                   "  const tsToBig = m => BigInt(m & 0xffff) | (m & TS_BIG ? ~0xffffn : 0n);                      // a mask -> BigInt (all big sizes when bit 16)", 'to big')
    src = rep(src, I("""        if(a < 31) nd = Math.max(nd, a); else nd = Math.max(nd, 31);
        if(b < 31) cp = Math.min(cp, b);
"""), I("""        if(a <= TS_CAP) nd = Math.max(nd, a); else nd = Math.max(nd, TS_CAP + 1);
        if(b <= TS_CAP) cp = Math.min(cp, b);
"""), 'snap')
    src = rep(src, "for(const it of d.items) if(it.size <= 30 && !(sm & (1 << it.size)))", "for(const it of d.items) if(it.size <= TS_CAP && !(sm & (1 << it.size)))", 'mingle items')
    src = rep(src, "const top = Math.min(d.whi, 30); for(let z = d.wlo; z <= top; z++) if(!(sm & (1 << z)))", "const top = Math.min(d.whi, TS_CAP); for(let z = d.wlo; z <= top; z++) if(!(sm & (1 << z)))", 'mingle window')
    src = rep(src, "if(area && d.ex) for(const z of d.ex) if(z <= 30) wm &= ~(1 << z);", "if(area && d.ex) for(const z of d.ex) if(z <= TS_CAP) wm &= ~(1 << z);", 'mingle keep')
    src = rep(src, "          if(k <= 30) keepOnly(y, ~(1 << k));", "          if(k <= TS_CAP) keepOnly(y, ~(1 << k));", 'delta')
    # ---- 2. Non-boxy = Minimum 3, once ----
    src = rep(src, I("""    sizeLo = (rules && rules.min != null) ? rules.min : 1;
    sizeHi = (rules && rules.max != null) ? rules.max : activeSet.size;
  }
"""), I("""    sizeLo = (rules && rules.min != null) ? rules.min : 1;
    sizeHi = (rules && rules.max != null) ? rules.max : activeSet.size;
  }
  if(rules && rules.nonBoxy) sizeLo = Math.max(sizeLo, 3);                  // v107: every piece of 1 or 2 tiles is a rectangle: Non-boxy is a Minimum of 3
"""), 'nonboxy min')
    src = rep(src, "lo2 = Math.max(sizeLo, 1, (rules && rules.nonBoxy) ? 3 : 1)", "lo2 = Math.max(sizeLo, 1)", 'range cover lo')
    src = rep(src, "rangeCover(activeSet.size, Math.max(nlo, (rules && rules.nonBoxy) ? 3 : 1), nhi, bankSizes)", "rangeCover(activeSet.size, nlo, nhi, bankSizes)", 'count rebuild')
    src = rep(src, I("  const lo = Math.max(1, ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1), hi = Math.min(ctx.sizeHi, T);\n  if(lo > hi) return { ok: false };\n"),
                   I("  const lo = Math.max(1, ctx.sizeLo), hi = Math.min(ctx.sizeHi, T);\n  if(lo > hi) return { ok: false };\n"), 'count pass')
    src = rep(src, I("  if(ctx.nonBoxyRule) lo = Math.max(lo, 3);                  // every piece of 1 or 2 cells is a rectangle\n"), "", 'match sizes')
    src = rep(src, I("  let lo = Math.max(ctx.sizeLo, 1); const hi = Math.min(ctx.sizeHi, T);\n  if(ctx.nonBoxyRule) lo = Math.max(lo, 3);\n  if(lo > hi) return { ok: false, sizes: null };\n"),
                   I("  let lo = Math.max(ctx.sizeLo, 1); const hi = Math.min(ctx.sizeHi, T);\n  if(lo > hi) return { ok: false, sizes: null };\n"), 'mismatch sizes')
    src = rep(src, "lo = Math.max(1, ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1), hi = Math.min(ctx.sizeHi, T);", "lo = Math.max(1, ctx.sizeLo), hi = Math.min(ctx.sizeHi, T);", 'deduce range')
    src = rep(src, "Math.min(ctx.sizeHi, ctx.totalActive) - Math.max(ctx.sizeLo, ctx.nonBoxyRule ? 3 : 1) + 1", "Math.min(ctx.sizeHi, ctx.totalActive) - Math.max(ctx.sizeLo, 1) + 1", 'mingle universe')
    src = rep(src, "if(area) return mkDom([], Math.max(lo, ctx.nonBoxyRule ? 3 : 1), hi);", "if(area) return mkDom([], Math.max(lo, ctx.sizeLo), hi);", "mingle domain")
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
