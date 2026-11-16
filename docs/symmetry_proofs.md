# Symmetry of tilings by equal pieces (work in progress)

Notation. R = a finite set of grid tiles (the board), symmetric under the half turn sigma about its centre c. A tiling of R by k
pieces "of one shape" (Match) = R split into k connected sets, each the image of the first by a motion of the grid (shift, turn by
90/180/270 degrees, mirror in a horizontal / vertical / diagonal line, glide = mirror then shift along the line).

## Claim 1 (2 pieces): if R = A u B, A and B disjoint, connected and of one shape, then B = sigma(A).

Status: proved except one sub-case (a quarter turn about a point other than c, with A having no other symmetry).

### Lemma 0 (neither piece is half-turn symmetric about c)
If sigma(A) = A then sigma(B) = B, so both bounding boxes are centred on c. Same box shape: the boxes coincide; A connects
the box's left and right sides, B its top and bottom, and on the square grid such two 4-connected paths share a tile:
impossible. Boxes turned a quarter (cross): the same happens in the rectangle where they overlap. So sigma(A) != A.

### Reduction
Let phi be any motion with phi(A) = B. If A has a mirror or a quarter-turn symmetry s, then phi*s is also a motion with
(phi*s)(A) = B, and composing a quarter turn with a mirror gives a mirror or glide, with a quarter turn a half turn or shift.
So it is enough to prove the claim when phi is a shift, a half turn, a mirror, a glide, or (last case) a quarter turn while
A has no mirror and no quarter-turn symmetry.

Write a = indicator of A, psi = sigma*phi. From 1_R = a + a o phi^-1 = 1_R o sigma:
  a - a o psi^-1 = -(a - a o psi) o phi^-1.                                                         (*)

### Half turn about q
Centre of mass: m(R) = c = (m(A) + m(B))/2 and m(B) = 2q - m(A), so q = c and phi = sigma. Proved.

### Shift by t != 0
psi = sigma*shift is a half turn, so psi^-1 = psi and (*) gives T = -T o phi^-1 with T = a - a o psi, hence T = T o (shift by
-2t): T repeats under a non-zero shift and has finite support, so T = 0: psi(A) = A, i.e. sigma(B) = A. Proved.

### Glide (mirror in a line L, then shift s != 0 along L)
First, L passes through c: count tiles along the direction across L (rows for a horizontal L, ...). The glide maps that count
to its mirror about L's position, sigma about c's; if they differ the equation forces |A| = 0. Then psi = sigma*phi is a
mirror (an involution) and (*) gives T = -T o phi^-1, so T = T o phi^-2 = T o (shift by -2s): T = 0. Proved.

### Mirror in a line L (no shift)
L passes through c (same count). A tile on L is its own mirror image, so it would be in A and in B: no tile lies on L (for a
diagonal L through a tile corner, mirroring does not map tiles to tiles, so L goes through tile centres). A crossing of L by A
would need two tiles facing each other across L, i.e. a tile of A and its mirror image, which is in B. So A lies on one side of
L and is exactly that half of R. R is symmetric under sigma and the mirror, hence also under the mirror nu in the perpendicular
line through c, and nu maps that half to itself: sigma(A) = mirror(nu(A)) = mirror(A) = B. Proved.

### Quarter turn about q
q = c: then rho^2 = sigma, and from A u rho(A) = R = sigma(R) = rho^2(A) u rho^3(A) with rho^2(A) disjoint from rho(A) we get
rho^2(A) = A, i.e. sigma(A) = A: impossible by Lemma 0.
q != c: OPEN. Counting alone can not decide it: there are counterexamples when A may be disconnected (e.g. A = {(1,0),(1,1),
(2,1),(0,2)} turned a quarter about (0.5,1.5)); with connected pieces none was found (brute force, all small boards, and about
307,000 two-piece tilings of random half-turn symmetric boards up to 26 tiles).

## Claim 2 (4 pieces on a square board): every tiling is quarter-turn symmetric, or its pieces form two pairs, each pair
## half-turn symmetric about its own centre.

Status: not proved. Holds on every square board checked (4x4, 6x6, 5x5 and 6x6 with symmetric holes: 293 tilings). False
on non-square boards: a 4x3 rectangle cut into four straight 3-tile pieces (three across, one down the right edge) is
neither (it only has an up-down mirror).
