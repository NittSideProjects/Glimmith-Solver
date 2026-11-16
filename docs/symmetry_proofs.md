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
q != c: OPEN. What is known:
- If the claim holds here, then B = sigma(A) = rho(A), so A = psi(A) with psi = sigma*rho, a quarter turn about another point:
  the case to exclude is "A ⊔ rho(A) half-turn symmetric about c != q, A connected, A without quarter-turn symmetry".
- Extreme tiles: take any direction theta and the board's extreme tile in theta, theta+90, theta+180, theta+270. Each lies in
  A or in B. The pattern A,B,A,B (or B,A,B,A) is impossible: it gives rho(t) = rho'(t) for one tile t, rho and rho' quarter turns
  about q and 2c - q, which differ by a non-zero shift. The other patterns only say that A's extreme tiles (its outline) behave
  as if A were quarter-turn symmetric, which does not yet give A = psi(A).
- Exhaustive check (not a proof): every connected piece A up to 11 tiles (185,416 polyominoes), every quarter turn putting rho(A)
  next to A: 5,276,488 placements, 136 give a half-turn symmetric board, none is a counterexample. Counting alone can not decide it: there are counterexamples when A may be disconnected (e.g. A = {(1,0),(1,1),
(2,1),(0,2)} turned a quarter about (0.5,1.5)); with connected pieces none was found (brute force, all small boards, and about
307,000 two-piece tilings of random half-turn symmetric boards up to 26 tiles).

## Claim 2 (4 pieces on a full n x n square): every tiling is quarter-turn symmetric, or its pieces form two pairs, each pair
## half-turn symmetric about its own centre.

Status: proved when two neighbouring corners are in one piece (the band case) and, in the four-corner case, when the motions
match the corners; the rest of the four-corner case is open by hand (checked by computer up to 16 x 16, see below). Boards
with holes are not covered (the argument uses the four corner tiles). False on non-square boards: a 4x3 rectangle cut into
four straight 3-tile pieces (three across, one down the right edge) is neither (it only has an up-down mirror).

The square has n^2 tiles, so n is even and each piece has n^2/4 tiles. rho = quarter turn about the centre c taking the
top-left corner TL to the top-right corner TR, sigma = rho^2, nu / mu = mirror in the vertical / horizontal middle line,
tau = mirror in the diagonal through TR and BL.

### Tools
- Crossing lemma (general form): two 4-connected paths in the square whose end tiles are on the border, the four ends taking
  turns around the border (a, c, b, d in that order for paths a-b and c-d), share a tile. Lemma 0's "left-right path meets
  top-bottom path" is the special case.
- Mirror lemma: if a mirror m whose line runs between tiles swaps two disjoint pieces P and m(P), P lies on one side of the
  line (a crossing of the line by P needs two facing tiles, which are m-images of each other, so one would be in m(P)).
- Claim 1 in its proved cases (shift, half turn, mirror, glide), applied to a half of the square.

### Lemma 2.1 (no piece reaches across both ways)
If a piece's bounding box is n x n, every piece's is (a motion keeps the box's sides). Then one piece holds a left-right path
and another one a top-bottom path, and they share a tile: impossible. In particular, opposite corners are in different
pieces. So either two neighbouring corners share a piece (band case), or the four corners are in four pieces.

### Band case: TL and TR in one piece P1. Proved.
1. Every box is n wide and h < n tall: P1 reaches across, so every box is n x h or h x n with h < n (2.1). An h x n piece would
   hold a top-bottom path, which meets P1's left-right path.
2. The whole top row is in P1: a tile t of the top row in another piece Q gives a path of Q from t to the left side (Q
   reaches across), below TL; with P1's path TL -> TR the ends take turns (TL, t, TR, then the left side): they meet.
3. Every piece has a full row: its motion from P1 keeps the box upright (n x h, h < n), so the full top row of P1's box goes
   to the top or bottom row of the piece's box, n tiles wide.
4. Four pieces, four different full rows. A full row cuts the square in two, and each other piece (connected, outside that
   row) lies on one side of it. Call P2 the piece whose full row r2 comes second from the top. P3, P4 hold lower full rows,
   so they lie below r2; P1 holds row 0, so it lies above r2. Hence rows 0..r2 contain only P1 and P2.
5. If r2 is the bottom row of P2's box, P2 lies in rows <= r2, so P1 u P2 = rows 0..r2 = the top half (area). If it is the
   top row, rows < r2 hold only P1, which is then a full-width rectangle: all pieces are full-width strips n/4 rows tall, and
   again P1 u P2 = top half. So P1 u P2 and P3 u P4 are the two halves.
6. In each half (an n x n/2 rectangle, half-turn symmetric) the motion between its two pieces keeps the boxes upright, so it
   is a shift, half turn, mirror or glide: Claim 1 (proved cases) gives P2 = half turn of P1 about the top half's centre, and
   P4 = half turn of P3 about the bottom half's centre. Two half-turn pairs.

### Four-corner case: A at TL, B at TR, C at BR, D at BL.
1. No piece reaches across: if one does, all reach across the same way (as in the band case, step 1). A path of A from TL to
   the right side and a path of B from TR to the left side have ends TL, TR, (right side), (left side): they meet.
2. Each piece meets the border in one run on each side of its own corner, and nowhere else (its box misses the far sides by
   1; a gap with a tile u of another piece X between two border tiles of A is impossible: A's path from its corner to the
   farther tile and X's path from u to X's corner take turns).
3. Motions that match the corners. Say the motion from A to X sends A's corner tile to X's corner tile, for X = B, C, D. A's box
   lies right of and below TL, X's box lies inward from X's corner, so the motion is one of the two symmetries of the square
   taking TL to X's corner: B in {rho A, nu A}, C in {sigma A, tau A}, D in {rho^3 A, mu A}.
   - B = nu A: A in the left half, B in the right half (mirror lemma). If C = sigma A, C is in the right half, so B u C is the
     right half. If C = tau A and D = rho^3 A, both lie in the bottom half (tau and rho^3 take the left half there), so C u D
     is the bottom half. If D = mu A, A is also in the top half, so A is the top-left quarter: four squares.
   - D = mu A: the same with rows and columns swapped.
   - B = rho A, D = rho^3 A: D = sigma B. If C = sigma A the tiling is rho-symmetric. If C = tau A, then A u C is the
     complement of B u sigma B, half-turn symmetric, and C is a mirror image of A: Claim 1 (mirror case) gives C = sigma A.
   So the tiling is quarter-turn symmetric, or the pieces form two halves. In two halves, Claim 1 applies to each half: a
   quarter turn between the two pieces of an n x n/2 half would need both boxes to fit as n/2 x n/2 squares, so the pieces
   are squares and a mirror also works (proved case).
4. A half turn sending A's lower-left box corner to TR (A's left run is its full height h): then A and B lie in rows < h, and
   row h - 1 is A's bottom run [0, n - a) plus B's image of A's top run [n - a, n): a full row of A u B. C and D lie below it,
   so A u B = rows 0..h-1 = the top half. Two halves.
5. OPEN: the other ways a motion can send another box corner of A to B's (or C's, D's) corner. Computer evidence (SAT, full
   square, four corners in four pieces, looking for a tiling that is neither two halves nor half-turn symmetric):
   UNSAT for n = 4, 6, 8, 10, 12 (12: 227 s; dev/tools/proofs/sat_four_corner_case.py). Only the open part, with the proved
   facts added (boxes smaller than n, border runs) and exact connectivity layers (dev/tools/proofs/sat_four_corner_open.py):
   UNSAT for n = 4 to 16 (14: 20 s, 16: 120 s). Enumerating every four-corner tiling (13, 107, 2055 for
   n = 4, 6, 8): each is two halves or quarter-turn symmetric. The odd corner matchings (a diagonal mirror, or A's lower-right
   box corner) only occur when the piece has a symmetry of its own, and then a matching motion also exists.

Brute force on square boards (before this proof): holds on 4x4, 6x6, and 5x5 and 6x6 with symmetric holes (293 tilings).
