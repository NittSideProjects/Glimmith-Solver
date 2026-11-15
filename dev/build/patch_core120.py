#!/usr/bin/env python3
"""Core v120 (release V1.0.36): the page gets the nested-pass fix of v105 that only the reference core had.

Bug (author's report: a puzzle whose file solution is valid was said impossible, "compass"): in v105 each propagate() call was
to keep the bounds of its own pass (passFrames), so that a nested propagate (a step that runs one, e.g. a probe) can not hand its
bounds to the outer pass. That fix went into dev/reference/solver-core.v105.js but the page patch (patch_ui_V1.0.25.py) still
carried the first version (passNeed / passCap shared by all calls): from V1.0.25 to V1.0.35 the page could narrow tile sizes with
the bounds of an inner pass and call a valid puzzle impossible. The tests run the reference core, so they did not see it.
This patch turns the old code into the fixed one (it does nothing on a core that already has it), and from now on the reference
core is taken from the page itself (tests/page/ui_test_core_sync.js checks they are the same code).
Usage: python3 patch_core120.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v119 (V1.0.35)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v120 (V1.0.36) = v119 + the page gets the nested-pass fix of v105; v119 (V1.0.35)", 'banner')
    if 'passFrames' in src: return src                       # already fixed (the reference core)
    src = rep(src, I("""        const part = propagateOnce();
        if(part === null){ failTrace = all; return null; }               // v102: what was decided before the contradiction
        if(tsOn && passNeed) keepSizes();                                // v105
"""), I("""        const fr = { n: null, c: null }; passFrames.push(fr);
        let part; try { part = propagateOnce(); } finally { passFrames.pop(); }
        if(part === null){ failTrace = all; return null; }               // v102: what was decided before the contradiction
        if(tsOn && fr.n) keepSizes(fr.n, fr.c);                          // v105
"""), 'loop')
    src = rep(src, I("""  let passNeed = null, passCap = null;                  // v105: need / capOf of the pass that just ran
  function keepSizes(){
"""), I("""  const passFrames = [];                                // v105: one frame per propagate() call: need / capOf of the pass that just ran
  function keepSizes(passNeed, passCap){
"""), 'decl')
    src = rep(src, I("""      if(hi < tHi[rep]) tHi[rep] = hi;
    }
    passNeed = passCap = null;
  }
"""), I("""      if(hi < tHi[rep]) tHi[rep] = hi;
    }
  }
"""), 'keep end')
    src = rep(src, I("""    tsDirty = false;
    passNeed = passCap = null;
"""), I("""    tsDirty = false;
"""), 'reset')
    src = rep(src, I("""    passNeed = need; passCap = capOf;                                                    // v105
"""), I("""    if(passFrames.length){ const fr = passFrames[passFrames.length - 1]; fr.n = need; fr.c = capOf; }   // v105: this pass's bounds (its own frame: a step may run a nested propagate)
"""), 'set')
    if 'passNeed = ' in src or 'passCap =' in src: raise SystemExit('old code left')
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
