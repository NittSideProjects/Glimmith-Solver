#!/usr/bin/env python3
"""Core v100 (release V1.0.17): the experimental guess layer is removed.

The "buffer guess layer" (v38) was an experiment for compass puzzles: it drew many random pieces per compass, turned what most of
them agreed on into red "rough guesses", and searched with those guesses as branching hints (sketchRun, guessSolve, guessLayerRun,
plus the joint sketch test jointAttempt and the sampler cmpSampler they used). Since then the compass rules, the far joins (global
links) and the exact search made it pointless, and nothing but its own button used it. Removed:
  * the whole SKETCH block (cmpSampler, sketchRun, jointAttempt, guessSolve, guessLayerRun);
  * the options that started it in deduceSolve (sketch, guessLayer, jointTest);
  * lastPass / sketchCapture, which only kept the last propagation pass for the sketch.
Nothing else changes: no deduction, no order, no event of a normal run.
Usage: python3 patch_core100.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v99 (V1.0.9) = v98 + same-piece links at once, facts in order;",
        "// ================= SOLVER CORE (pure, unit-tested separately; v100 (V1.0.17) = v99 without the experimental guess layer (sketch, guessLayer, jointTest); v99 (V1.0.9) = v98 + same-piece links at once, facts in order;", 'banner')
    # the block
    a = src.index(I("  // ============================================================================================================\n  // SKETCH (rough shapes)"))
    b = src.index(I("  // ---- shape bank ----\n  const BANK_MAX_CAND"))
    if not (0 < a < b) or src[a:b].count('function') < 5: raise SystemExit('sketch block not found')
    src = src[:a] + src[b:]
    # its starters
    src = rep(src, I("  if(opts.sketch && !ended){ yield* sketchRun(opts); return; }\n"), '', 'sketch start')
    src = rep(src, I("  if(opts.guessLayer && !ended){ yield* guessLayerRun(opts); return; }\n"), '', 'guess start')
    i = src.index(I("  if(opts.jointTest && !ended){ yield { type: 'joint-test',")); j = src.index("\n", i) + 1
    if 'jointAttempt' not in src[i:j]: raise SystemExit('joint-test line')
    src = src[:i] + src[j:]
    # the pass kept for the sketch
    i = src.index(I("  let lastPass = null, sketchCapture = false;")); j = src.index("\n", i) + 1
    src = src[:i] + src[j:]
    i = src.index(I("    if(!inProbe || sketchCapture) lastPass = { need, capOf, maskOf, dmap };")); j = src.index("\n", i) + 1
    src = src[:i] + src[j:]
    for w in ('sketchRun', 'guessLayerRun', 'guessSolve', 'jointAttempt', 'cmpSampler', 'lastPass', 'sketchCapture', '__SKETCH', 'opts.sketch', 'opts.guess', '_guessOut'):
        if w in src.split('SOLVER CORE', 1)[1].split('\n', 1)[1]: raise SystemExit('left over: ' + w)
    return src

if __name__ == '__main__':
    ind = ' ' * int(sys.argv[3]) if len(sys.argv) > 3 else ''
    src = open(sys.argv[1], encoding='utf8').read()
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind))
    print('ok', sys.argv[2])
