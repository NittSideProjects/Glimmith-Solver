#!/usr/bin/env python3
"""Core v128 (release V1.0.49): once the final search has a solution, the narrow searches stop sooner when they all time out.

The final stage runs its searches in time slices (default 'e2,s18,o5,e12,o12,e': the edge search 2 s, then the narrow per-edge
searches, then the old search, ...). Many puzzles are solved by the edge search in about 2 s; on a slower machine (or with a few
more rules per node) it ends just after its first slice, and the narrow searches then ran until 60 tests in a row had timed out
(6 s) before the edge search could finish. A base-game puzzle took 1.8 s on the author's PC and 19 s here with the very same search.
Now, once a solution has been reported (what is left is proving there is no second one), the narrow searches stop after 10
timeouts in a row (opts.scanTimeoutStopSol; before a solution, 60 as before). A narrow search that keeps finding contradictions
goes on as before (a contradiction resets the count). For the same reason the two-piece split (v78, a late deduction stage
after the first slices) gets at most 1.5 s instead of 8 s once a solution is in hand (opts.twoPieceMsSol): on the same puzzle it
took 7.6 s and decided nothing. Only the order of the searches changes, so the answers are the same.
Usage: python3 patch_core128.py <in.js> <out.js> [indent]"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def patch(src, ind):
    I = lambda t: ''.join((ind + l if l.strip() else l) for l in t.splitlines(True))
    src = rep(src, "// ================= SOLVER CORE (pure, unit-tested separately; v127 (V1.0.48)",
        "// ================= SOLVER CORE (pure, unit-tested separately; v128 (V1.0.49) = v127 + with a solution in hand the narrow searches stop after 10 timeouts in a row; v127 (V1.0.48)", 'banner')
    src = rep(src, "  const stopScan = () => nowMs() > scanCapAt || (!opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= (opts.scanTimeoutStop || 60))",
        "  const scanStopAt = () => (portSeen.size >= 1 && opts.scanTimeoutStopSol !== 0) ? Math.min(opts.scanTimeoutStop || 60, opts.scanTimeoutStopSol || 10) : (opts.scanTimeoutStop || 60);   // v128\n" + ind +
        "  const stopScan = () => nowMs() > scanCapAt || (!opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= scanStopAt())", 'stop')
    src = rep(src, "if(preDone && !opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= (opts.scanTimeoutStop || 60)) post =",
        "if(preDone && !opts.fullScan && opts.scanTimeoutStop !== 0 && scanTimeoutRun >= scanStopAt()) post =", 'post')
    src = rep(src, "const T = activeIds.length, t0 = nowMs(), maxMs = opts.twoPieceMs != null ? +opts.twoPieceMs : 8000,",
        "const T = activeIds.length, t0 = nowMs(), maxMs = Math.min(opts.twoPieceMs != null ? +opts.twoPieceMs : 8000, portSeen.size >= 1 ? (opts.twoPieceMsSol != null ? +opts.twoPieceMsSol : 1500) : Infinity),   // v128: 1.5 s once a solution is in hand\n" + ind + "     ", 'two-piece cap')
    return src

if __name__ == '__main__':
    src = open(sys.argv[1], encoding='utf8').read()
    ind = sys.argv[3] if len(sys.argv) > 3 else ''
    open(sys.argv[2], 'w', encoding='utf8').write(patch(src, ind)); print('ok', sys.argv[2])
