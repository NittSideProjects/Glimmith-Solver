#!/usr/bin/env python3
"""SAT check of the 2-piece claim, quarter-turn case (docs/symmetry_proofs.md).

Claim: a board R with half-turn symmetry (centre c), cut into two connected pieces A and B of one shape, has B = sigma(A).
Proved by hand for every motion A -> B except a quarter turn rho about a point q != c. This script searches that case
exhaustively for boards up to W x W: it looks for A with
  * A and B = rho(A) disjoint, both inside the W x W window centred on c,
  * R = A u B half-turn symmetric about c,
  * A connected (lazily: a disconnected answer adds a separator clause and the solver is asked again; after 200 such rounds
    the case switches to an exact encoding: one root tile in A, reachability layers, every tile of A reached),
  * B != sigma(A).
UNSAT for every c (4 classes up to a shift) and every q != c means: no counterexample on boards up to W x W.
Coordinates are doubled: tile centres are (even, even).
Usage: python3 sat_two_pieces.py W [--no-connect]"""
import sys, time
from pysat.solvers import Cadical153
from pysat.card import CardEnc, EncType

W = int(sys.argv[1]); CONNECT = '--no-connect' not in sys.argv; FORCE = None

def window(cx, cy):
    # tiles (X, Y) (doubled, even) whose centre is at most W/2 - 1/2 from c on each axis: any half-turn symmetric board of
    # width and height <= W around c lies in it
    r = W - 1                                                     # in doubled units: |X - cx| <= W - 1
    xs = [X for X in range(cx - r - 2, cx + r + 3) if X % 2 == 0 and abs(X - cx) <= r]
    ys = [Y for Y in range(cy - r - 2, cy + r + 3) if Y % 2 == 0 and abs(Y - cy) <= r]
    return [(X, Y) for X in xs for Y in ys]

def solve(cx, cy, qx, qy):
    cells = window(cx, cy); idx = {z: i + 1 for i, z in enumerate(cells)}
    rot = lambda X, Y: (qx - (Y - qy), qy + (X - qx))            # 90 degrees about q
    rinv = lambda X, Y: (qx + (Y - qy), qy - (X - qx))
    sig = lambda X, Y: (2 * cx - X, 2 * cy - Y)
    a = lambda z: idx.get(z)                                      # None = outside the window: false
    s = Cadical153(); nv = len(cells)
    def new():
        nonlocal nv; nv += 1; return nv
    # b(z) = a(rho^-1 z); r(z) = a(z) or b(z)
    rvar = {}
    for z in cells:
        az, bz = a(z), a(rinv(*z))
        if a(rot(*z)) is None: s.add_clause([-az])               # B must stay in the window
        if bz is not None: s.add_clause([-az, -bz])              # A and B disjoint
        rz = new(); rvar[z] = rz
        lits = [az] + ([bz] if bz is not None else [])
        s.add_clause([-rz] + lits)
        for l in lits: s.add_clause([rz, -l])
    for z in cells:                                               # R half-turn symmetric
        w = sig(*z)
        if w not in rvar: s.add_clause([-rvar[z]])
        else: s.add_clause([-rvar[z], rvar[w]])
    # B != sigma(A): some z in A with sigma(z) not in B, i.e. a(z) and not a(rho^-1 sigma z)
    ds = []
    for z in cells:
        d = new(); ds.append(d); s.add_clause([-d, a(z)])
        t = a(rinv(*sig(*z)))
        if t is not None: s.add_clause([-d, -t])
    if "--allow-good" not in sys.argv: s.add_clause(ds)
    if FORCE is not None:                                         # sanity check: does this exact A satisfy every clause?
        F = set(FORCE); ok = s.solve(assumptions=[idx[z] if z in F else -idx[z] for z in cells]); s.delete(); return ok, 0
    rounds = 0
    while True:
        if not s.solve(): s.delete(); return None, rounds
        m = set(l for l in s.get_model() if l > 0)
        A = [z for z in cells if idx[z] in m]
        if not CONNECT: s.delete(); return A, rounds
        comps, seen = [], set()
        for z in A:
            if z in seen: continue
            comp, st = [], [z]; seen.add(z)
            while st:
                x, y = st.pop(); comp.append((x, y))
                for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
                    n = (x + dx, y + dy)
                    if n in idx and idx[n] in m and n not in seen: seen.add(n); st.append(n)
            comps.append(comp)
        if len(comps) == 1: s.delete(); return A, rounds
        rounds += 1
        if rounds == 200:                                         # exact connectivity: root + reachability layers
            rt = {z: new() for z in cells}
            s.add_clause(list(rt.values()))
            for cl in CardEnc.atmost(lits=list(rt.values()), bound=1, top_id=nv, encoding=EncType.seqcounter).clauses:
                s.add_clause(cl); nv = max(nv, max(abs(l) for l in cl))
            for z in cells: s.add_clause([-rt[z], idx[z]])
            prev = rt
            for _ in range(len(cells) // 2):
                cur = {z: new() for z in cells}
                for z in cells:
                    x, y = z
                    nb = [prev[w] for w in ((x + 2, y), (x - 2, y), (x, y + 2), (x, y - 2)) if w in prev]
                    s.add_clause([-cur[z], idx[z]]); s.add_clause([-cur[z], prev[z]] + nb)
                prev = cur
            for z in cells: s.add_clause([-idx[z], prev[z]])
            continue
        for i, C in enumerate(comps):                             # separator clauses: x in C, w in another part
            Cs = set(C); N = set()
            for (x, y) in C:
                for dx, dy in ((2, 0), (-2, 0), (0, 2), (0, -2)):
                    n = (x + dx, y + dy)
                    if n in idx and n not in Cs: N.add(n)
            x0 = C[0]
            for D in comps[:i] + comps[i + 1:]:
                s.add_clause([-idx[x0], -idx[D[0]]] + [idx[n] for n in N])

def main():
    if '--case' in sys.argv:                                      # one case: --case cx cy qx qy (doubled coordinates)
        i = sys.argv.index('--case'); cx, cy, qx, qy = map(int, sys.argv[i + 1:i + 5])
        A, r = solve(cx, cy, qx, qy); print('case', (cx, cy, qx, qy), 'solution' if A else 'none', sorted((x // 2, y // 2) for x, y in A) if A else ''); return
    t0 = time.time(); total = 0; found = 0; maxr = 0
    for cx, cy in ((0, 0), (1, 0), (0, 1), (1, 1)):             # c at a tile centre, an edge middle (two ways), a corner
        R = 2 * W
        for qx in range(cx - R, cx + R + 1):
            for qy in range(cy - R, cy + R + 1):
                if (qx - qy) % 2: continue                       # q at a tile centre (even, even) or a corner (odd, odd)
                if (qx, qy) == (cx, cy): continue
                total += 1
                A, r = solve(cx, cy, qx, qy); maxr = max(maxr, r)
                if A is not None:
                    found += 1
                    if found <= 3: print('SOLUTION c', (cx / 2, cy / 2), 'q', (qx / 2, qy / 2), 'A', sorted((x // 2, y // 2) for x, y in A))
    print(f'W={W} connect={CONNECT}: {total} (c, q) cases, {found} with a solution, max connectivity rounds {maxr}, {time.time() - t0:.0f} s')

main()
