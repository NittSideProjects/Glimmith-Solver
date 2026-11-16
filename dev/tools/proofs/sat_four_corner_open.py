#!/usr/bin/env python3
"""SAT check of the part of Claim 2 (docs/symmetry_proofs.md) that is open by hand.

Full n x n square cut into four connected pieces of one shape, piece k holding corner k (TL, TR, BR, BL). Proved by hand: if
each motion from A sends A's corner tile to the other piece's corner tile (then it is one of the two symmetries of the square
taking TL there), the tiling is quarter-turn symmetric or two halves; two halves satisfy the claim. So a counterexample must:
  * not be two halves (A u B != top half, A u D != left half);
  * have a piece X in {B, C, D} that is neither of the two square symmetries' images of A that put A's corner on X's corner.
Also proved by hand and added to cut the search: every piece's box is smaller than n both ways, and a piece meets the border
only in one run along each side from its own corner.
Connectivity of A: reachability layers from the corner tile (A(z) -> reached within |A| - 1 steps), no lazy loop.
UNSAT = the open part holds for this n.
Usage: python3 sat_four_corner_open.py n"""
import sys, time, itertools
from pysat.solvers import Cadical153
from pysat.card import CardEnc, EncType

n = int(sys.argv[1]); m = n * n // 4
cells = [(x, y) for y in range(n) for x in range(n)]
inside = lambda z: 0 <= z[0] < n and 0 <= z[1] < n
ORI = [lambda x, y: (x, y), lambda x, y: (-y, x), lambda x, y: (-x, -y), lambda x, y: (y, -x),
       lambda x, y: (-x, y), lambda x, y: (x, -y), lambda x, y: (y, x), lambda x, y: (-y, -x)]
corn = [(0, 0), (n - 1, 0), (n - 1, n - 1), (0, n - 1)]
N1 = n - 1
rho = lambda z: (N1 - z[1], z[0]); sig = lambda z: (N1 - z[0], N1 - z[1]); rho3 = lambda z: (z[1], N1 - z[0])
nu = lambda z: (N1 - z[0], z[1]); mu = lambda z: (z[0], N1 - z[1]); tau = lambda z: (N1 - z[1], N1 - z[0])
MATCH = {1: (rho, nu), 2: (sig, tau), 3: (rho3, mu)}

def main():
    t0 = time.time(); s = Cadical153(); top = [0]
    def new():
        top[0] += 1; return top[0]
    def card_eq(lits, k):
        for cl in CardEnc.equals(lits=lits, bound=k, top_id=top[0], encoding=EncType.seqcounter).clauses:
            s.add_clause(cl); top[0] = max(top[0], max(abs(l) for l in cl))
    X = {(k, z): new() for k in range(4) for z in cells}
    for z in cells:
        ks = [X[(k, z)] for k in range(4)]; s.add_clause(ks)
        for a, b in itertools.combinations(ks, 2): s.add_clause([-a, -b])
    for k in range(4): s.add_clause([X[(k, corn[k])]]); card_eq([X[(k, z)] for z in cells], m)
    # hand facts: piece k meets the border only in runs from its corner (rotate the picture so the corner is TL)
    for k in range(4):
        R = lambda z, k=k: z
        for _ in range(k): R = (lambda f: (lambda z: rho(f(z))))(R)
        for i in range(n):
            top_t, left_t = R((i, 0)), R((0, i))
            if i > 0:
                s.add_clause([-X[(k, top_t)], X[(k, R((i - 1, 0)))]]); s.add_clause([-X[(k, left_t)], X[(k, R((0, i - 1)))]])
            s.add_clause([-X[(k, R((N1, i)))]]) if i > 0 else None      # far right side (except its own top corner run)
            s.add_clause([-X[(k, R((i, N1)))]]) if i > 0 else None      # far bottom side
    # connectivity of A: layers from TL
    L = [{z: (X[(0, z)] if z == corn[0] else None) for z in cells}]
    prev = {z: new() for z in cells}
    for z in cells:
        if z == corn[0]: s.add_clause([prev[z]])
        else: s.add_clause([-prev[z]])
    for d in range(1, m):
        cur = {z: new() for z in cells}
        for z in cells:
            nb = [prev[(z[0] + dx, z[1] + dy)] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)) if inside((z[0] + dx, z[1] + dy))]
            s.add_clause([-cur[z], X[(0, z)]]); s.add_clause([-cur[z], prev[z]] + nb)
        prev = cur
    for z in cells: s.add_clause([-X[(0, z)], prev[z]])
    # pieces 2..4 are motions of A
    for k in (1, 2, 3):
        sel = []
        for o in ORI:
            for dx in range(-2 * n, 2 * n + 1):
                for dy in range(-2 * n, 2 * n + 1):
                    img = [(o(*z)[0] + dx, o(*z)[1] + dy) for z in cells]
                    if not any(inside(w) for w in img): continue
                    if not inside(img[0]): continue                    # A's corner tile TL is in A: its image must be on the board
                    sv = new(); sel.append(sv)
                    inv = {}
                    for z, w in zip(cells, img):
                        if inside(w): s.add_clause([-sv, -X[(0, z)], X[(k, w)]]); inv[w] = z
                        else: s.add_clause([-sv, -X[(0, z)]])
                    for w in cells:
                        if w in inv: s.add_clause([-sv, -X[(k, w)], X[(0, inv[w])]])
                        else: s.add_clause([-sv, -X[(k, w)]])
        s.add_clause(sel)
    # not two halves
    h = n // 2
    s.add_clause([X[(0, z)] for z in cells if z[1] >= h] + [X[(1, z)] for z in cells if z[1] >= h])
    s.add_clause([X[(0, z)] for z in cells if z[0] >= h] + [X[(3, z)] for z in cells if z[0] >= h])
    # some piece X is not one of its two matching images of A
    un = []
    for k in (1, 2, 3):
        u = new(); un.append(u)
        for g in MATCH[k]:
            ds = []
            for z in cells:
                d = new(); ds.append(d); s.add_clause([-d, X[(0, z)]]); s.add_clause([-d, -X[(k, g(z))]])
            s.add_clause([-u] + ds)
    s.add_clause(un)
    res = s.solve()
    if not res:
        print(f'n={n}: UNSAT ({time.time() - t0:.0f} s)'); return
    mod = set(l for l in s.get_model() if l > 0)
    print(f'n={n}: SOLUTION ({time.time() - t0:.0f} s)')
    print('\n'.join(' '.join('ABCD'[k] for x in range(n) for k in range(4) if X[(k, (x, y))] in mod) for y in range(n)))

main()
