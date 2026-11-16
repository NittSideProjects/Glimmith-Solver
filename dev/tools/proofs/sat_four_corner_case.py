#!/usr/bin/env python3
"""SAT check of the four-corner case of Claim 2 (docs/symmetry_proofs.md).

Full n x n square cut into four connected pieces of one shape, piece k holding corner k (TL, TR, BR, BL). The solver looks
for a tiling where A u B is not the top half, A u D is not the left half, and the tiling is not half-turn symmetric
(C != sigma A or D != sigma B). UNSAT = every such tiling is two halves or half-turn symmetric.
Usage: python3 sat_four_corner_case.py n"""
import sys, time, itertools
from pysat.solvers import Cadical153
from pysat.card import CardEnc, EncType

n = int(sys.argv[1]); ALLOW_GOOD = '--allow-good' in sys.argv
cells = [(x, y) for y in range(n) for x in range(n)]
inside = lambda z: 0 <= z[0] < n and 0 <= z[1] < n
D4 = [lambda x, y: (x, y), lambda x, y: (n - 1 - y, x), lambda x, y: (n - 1 - x, n - 1 - y), lambda x, y: (y, n - 1 - x),
      lambda x, y: (n - 1 - x, y), lambda x, y: (x, n - 1 - y), lambda x, y: (y, x), lambda x, y: (n - 1 - y, n - 1 - x)]
ORI = [lambda x, y: (x, y), lambda x, y: (-y, x), lambda x, y: (-x, -y), lambda x, y: (y, -x),
       lambda x, y: (-x, y), lambda x, y: (x, -y), lambda x, y: (y, x), lambda x, y: (-y, -x)]

def build():
    s = Cadical153(); top = [0]
    def new():
        top[0] += 1; return top[0]
    r = {z: new() for z in cells}
    X = {(k, z): new() for k in range(4) for z in cells}
    for z in cells:
        for g in D4[1:]: s.add_clause([-r[z], r[g(*z)]])
        ks = [X[(k, z)] for k in range(4)]
        s.add_clause([-r[z]] + ks)
        for k in ks: s.add_clause([r[z], -k])
        for a, b in itertools.combinations(ks, 2): s.add_clause([-a, -b])
    s.add_clause([X[(0, cells[0])]] if False else [X[(0, z)] for z in cells])   # piece 1 not empty
    # motions: piece k = m(piece 1)
    for k in (1, 2, 3):
        sel = []
        for o in ORI:
            for dx in range(-2 * n, 2 * n + 1):
                for dy in range(-2 * n, 2 * n + 1):
                    m = lambda x, y, o=o, dx=dx, dy=dy: (o(x, y)[0] + dx, o(x, y)[1] + dy)
                    # skip shifts that can not map any tile inside
                    img = [m(*z) for z in cells]
                    if not any(inside(w) for w in img): continue
                    sv = new(); sel.append(sv)
                    for z, w in zip(cells, img):
                        if inside(w): s.add_clause([-sv, -X[(0, z)], X[(k, w)]])
                        else: s.add_clause([-sv, -X[(0, z)]])
                    inv = {w: z for z, w in zip(cells, img) if inside(w)}
                    for w in cells:
                        if w in inv: s.add_clause([-sv, -X[(k, w)], X[(0, inv[w])]])
                        else: s.add_clause([-sv, -X[(k, w)]])
        s.add_clause(sel)
        for cl in CardEnc.atmost(lits=sel, bound=1, top_id=top[0], encoding=EncType.seqcounter).clauses:
            s.add_clause(cl); top[0] = max(top[0], max(abs(l) for l in cl))
    for z in cells: s.add_clause([r[z]])
    for k, z in enumerate([(0, 0), (n - 1, 0), (n - 1, n - 1), (0, n - 1)]): s.add_clause([X[(k, z)]])
    h = n // 2
    s.add_clause([X[(0, z)] for z in cells if z[1] >= h] + [X[(1, z)] for z in cells if z[1] >= h])  # not (i): A u B != top half
    s.add_clause([X[(0, z)] for z in cells if z[0] >= h] + [X[(3, z)] for z in cells if z[0] >= h])  # not (ii)
    ds = []
    for k, l in ((0, 2), (1, 3)):
        for z in cells:
            d = new(); ds.append(d); s.add_clause([-d, X[(k, z)]]); s.add_clause([-d, -X[(l, (n - 1 - z[0], n - 1 - z[1]))]])
    s.add_clause(ds)   # not (iii): C != sigma A or D != sigma B
    return s, X

def main():
    t0 = time.time(); s, X = build(); rounds = 0
    while True:
        if not s.solve():
            print(f'n={n}{" (good tilings allowed)" if ALLOW_GOOD else ""}: UNSAT after {rounds} connectivity rounds ({time.time() - t0:.0f} s)'); return
        m = set(l for l in s.get_model() if l > 0)
        P = [z for z in cells if X[(0, z)] in m]
        comps, seen = [], set()
        for z in P:
            if z in seen: continue
            comp, st = [], [z]; seen.add(z)
            while st:
                a = st.pop(); comp.append(a)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    b = (a[0] + dx, a[1] + dy)
                    if inside(b) and X[(0, b)] in m and b not in seen: seen.add(b); st.append(b)
            comps.append(comp)
        if len(comps) == 1:
            grid = [['.'] * n for _ in range(n)]
            for k in range(4):
                for z in cells:
                    if X[(k, z)] in m: grid[z[1]][z[0]] = 'ABCD'[k]
            print(f'n={n}: SOLUTION after {rounds} rounds ({time.time() - t0:.0f} s)'); print('\n'.join(' '.join(r) for r in grid)); return
        rounds += 1
        for i, C in enumerate(comps):
            Cs = set(C); N = set()
            for a in C:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    b = (a[0] + dx, a[1] + dy)
                    if inside(b) and b not in Cs: N.add(b)
            for D in comps[:i] + comps[i + 1:]:
                s.add_clause([-X[(0, C[0])], -X[(0, D[0])]] + [X[(0, b)] for b in N])

main()
