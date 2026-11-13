# Rule explanations (bottom of the page)

The "Rules with improved deduction logic" list and what each i button opens.

Left here: 167 to write, 0 to check again, 0 notes, 0 to put on the page. Done: 0.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0128
- what: text · #improvedFooter
- now: Rules with improved deduction logic
- new: 

### T0129
- what: text · #improvedFooter
- now: Every rule has some ground truth that can be used by the solver to save time on the edge by edge deciding phase. They are tested every time a new edge gets decided and are almost always instantaneous.
- new: 

### T0923
- what: text · #allExamplesBtn
- now: Show all examples
- new: 

### T0130
- what: text · #improvedFooter
- now: Walls
- new: 

### T0131
- what: text · #improvedFooter
- now: Delta
- new: 

### T0133
- what: text · #impInfo_delta · Shows when you click the i next to this rule.
- now: A Delta wall says the two pieces have different shapes.
- new: 

### T0134
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_delta · Shows when you click the i next to this rule.
- now: <b>Not the same shape.</b> If both sides can only be the same shape (two identical polyominoes, or two small pieces that can only be a domino), it is impossible. A side left with one possible shape takes that shape away from the other side.
- new: 

### T0135
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_delta · Shows when you click the i next to this rule.
- now: <b>Must grow.</b> If one side is already a finished piece and the other side matches its shape right now, the other side can not stop there: it has to grow.
- new: 

### T0136
- what: text · #improvedFooter
- now: Gemini
- new: 

### T0138
- what: text · #impInfo_gemini · Shows when you click the i next to this rule.
- now: A Gemini wall says the two pieces have the same shape, so also the same size.
- new: 

### T0139
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Same size.</b> A 4 on one side makes the other side a 4, and so on down a line of Gemini walls. Two same-size pieces sharing an area of 9 tiles are 4 tiles or fewer each.
- new: 

### T0140
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Same shape.</b> A polyomino on one side gives its shape to the other side. If the shape on one side contains a 1x4, the other side needs one too.
- new: 

### T0141
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Lines anchor the copy.</b> When both sides have a closed straight line of the same length and one side can not make a second one, the copy must send line onto line: only 4 ways are left (two directions, two mirrors). The solver copies the known tiles and walls across each way, and the ways that break are dropped.
- new: 

### T0142
- what: text · #improvedFooter
- now: Inequality
- new: 

### T0144
- what: text · #impInfo_inequality · Shows when you click the i next to this rule.
- now: An Inequality wall says the piece the arrow points at is smaller.
- new: 

### T0145
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_inequality · Shows when you click the i next to this rule.
- now: <b>Sizes push each other.</b> A piece smaller than a 3 is 1 or 2 tiles. A chain a < b < c < d makes d at least 4 tiles (5 with a Minimum of 2). A loop a < b < c < a is impossible.
- new: 

### T0146
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_inequality · Shows when you click the i next to this rule.
- now: <b>Room for the whole chain.</b> Pieces on a chain all have different sizes, so they need at least 1 + 2 + 3 + ... tiles: a closed area of 5 tiles can not hold a chain of 3 walls. Three touching pieces that can each only be 1 or 2 tiles can not all differ.
- new: 

### T0147
- what: text · #improvedFooter
- now: Difference
- new: 

### T0149
- what: text · #impInfo_difference · Shows when you click the i next to this rule.
- now: A Difference wall of N says the two pieces differ by exactly N tiles.
- new: 

### T0150
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Size across the wall.</b> A known 2 next to a Difference 2 makes the other side exactly 4 (0 is not a size). A tile closed in by walls is a known 1.
- new: 

### T0151
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Odd and even.</b> An odd N makes one side odd and the other even; an even N makes both sides odd or both even. Three pieces that all touch through odd Differences are impossible.
- new: 

### T0152
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Two numbers, two pieces.</b> The pieces across a Difference 2 and a Difference 3 of the same piece can never have the same size, so they are different pieces.
- new: 

### T0153
- what: text · #improvedFooter
- now: Clues
- new: 

### T0154
- what: text · #improvedFooter
- now: Area number
- new: 

### T0156
- what: text · #impInfo_area · Shows when you click the i next to this rule.
- now: An area number gives the size of its piece (a polyomino does too).
- new: 

### T0157
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>Grow to the number.</b> A piece grows toward its number and stops at it, and the walls next to it pass the size on.
- new: 

### T0158
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>The numbers must fit.</b> Every number needs a whole piece of its size: a 6 and a 4 do not fit on 9 tiles. Two touching 3s with room for only one piece of 3 are linked; if each needs its own piece, there is a wall.
- new: 

### T0159
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>No tile left over.</b> When the numbers of an area sum up to its size, every tile must end up in a numbered piece, so a group with no number has to grow to one it can still reach.
- new: 

### T0160
- what: text · #improvedFooter
- now: Rose
- new: 

### T0162
- what: text · #impInfo_rose · Shows when you click the i next to this rule.
- now: Every piece holds exactly one rose of each type.
- new: 

### T0163
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Counting.</b> Every type appears once per piece, so uneven counts are impossible. Two roses of the same type are never one piece: neighbouring ones get a wall.
- new: 

### T0164
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Reaching a rose.</b> A group missing a type must still reach one, so a wall that would cut it off from every rose of that type is a link.
- new: 

### T0165
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Narrow passages.</b> If a narrow passage splits the roses into uneven counts, the extra roses on one side must join the extra roses on the other side through it. An area closed off with one rose of each type is a single piece.
- new: 

### T0166
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Who goes with whom.</b> Like the ends of a Flow puzzle, the solver lists every way to group the roses into pieces. Two roses that are never grouped are different pieces.
- new: 

### T0167
- what: text · #improvedFooter
- now: Polyomino
- new: 

### T0169
- what: text · #impInfo_polyomino · Shows when you click the i next to this rule.
- now: A polyomino makes its piece exactly that shape (turned or flipped).
- new: 

### T0170
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_polyomino · Shows when you click the i next to this rule.
- now: <b>Must fit the shape.</b> The piece has the polyomino's size, and the tiles already together must fit in the shape: with a shape that has no line of 3, two tiles in a row get a wall at both ends.
- new: 

### T0171
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_polyomino · Shows when you click the i next to this rule.
- now: <b>Where the polyomino can go.</b> The solver tests each place the shape can go over the polyomino: tiles every place covers are linked, edges on the border of every place are walls. Two identical polyominoes too far apart for one place are different pieces.
- new: 

### T0172
- what: text · #improvedFooter
- now: Watchtower
- new: 

### T0174
- what: text · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: A watchtower on a corner gives how many different pieces touch that corner.
- new: 

### T0175
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>1 and 4.</b> A 1 links all the tiles round the corner, a 4 walls them all.
- new: 

### T0176
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>2 and 3.</b> A 2 is exactly two walls. A 3 is three walls, or four if one piece wraps round the corner; when no piece can wrap (too small, or no way round), a 3 with three walls known links the fourth.
- new: 

### T0177
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>Outline and inward corners.</b> Only two tiles touch an outline corner: a 1 links them, a 2 walls them, a 3 or 4 is impossible. Three tiles touch an inward corner (next to a hole or a notch in the board): a 3 there is three walls.
- new: 

### T0178
- what: text · #improvedFooter
- now: Palisade
- new: 

### T0180
- what: text · #impInfo_palisade · Shows when you click the i next to this rule.
- now: A palisade gives how many of its tile's four sides are walls (0 to 4, a 2 straight or bent). The board edge and empty tiles count as walls.
- new: 

### T0181
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Count the sides.</b> Once enough sides are known the rest follow: a 1 with its wall found links the other three, a 1 on the outline links its three inner sides.
- new: 

### T0182
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Size of the piece.</b> A tile with k open sides is in a piece of at least k + 1 tiles: a 0 needs 5, so a 0 with Maximum 4 is impossible. A tile with one open side can end a piece but never let it pass through.
- new: 

### T0183
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Palisades together.</b> Palisades side by side or corner to corner are solved together: a 0 next to a 3 makes their shared side the 3's only opening, so its other three sides are walls.
- new: 

### T0184
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Inside a known shape.</b> A polyomino, a bank shape or a rectangle must give each palisade inside it the right count: with Boxy a 0 can only be an inner tile of a rectangle.
- new: 

### T0185
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Only two pieces.</b> When only two pieces can exist, a straight 2 puts the tiles on its two walled sides in the same piece, and a bent 2 puts the tiles on its opposite sides in different pieces.
- new: 

### T0186
- what: text · #improvedFooter
- now: Compass
- new: 

### T0188
- what: text · #impInfo_compass · Shows when you click the i next to this rule.
- now: A compass gives how many tiles of its piece lie north, east, south and west of it (over the whole piece, not just its row or column).
- new: 

### T0189
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>A count is a limit.</b> With 2 east, nothing three columns or more to the east can join, and a 0 closes its side. A detour round a wall costs tiles too, so a tile the piece can not afford to reach gets a wall.
- new: 

### T0190
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>The only way.</b> If the piece can only get enough tiles on a side through one tile, that tile joins. Tiles in every piece that fits all the numbers are linked, tiles in none are walled off.
- new: 

### T0191
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>Size.</b> Four numbers cap the piece at 1 + N + E + S + W tiles, and the numbers also give a smallest size: one number k needs k + 1 tiles.
- new: 

### T0192
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>Two compasses.</b> An upper compass with 3 north and a lower one with 1 north can not be one piece: everything north of the upper one is also north of the lower one. Two compasses that would need more tiles apart than the board has on one side are one piece.
- new: 

### T0193
- what: text · #improvedFooter
- now: Size limits
- new: 

### T0194
- what: text · #improvedFooter
- now: Precision
- new: 

### T0196
- what: text · #impInfo_precision · Shows when you click the i next to this rule.
- now: Every piece has exactly this many tiles.
- new: 

### T0197
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>The board must divide.</b> 7 tiles with Precision 3 is impossible, and so is every area closed off by walls that is not a multiple. An area of exactly 3 tiles is one piece.
- new: 

### T0198
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>Grow and stop.</b> A group under the size with one way out takes it, and a group at the size is walled all round: on a 1x9 strip with Precision 3 both walls are found at once.
- new: 

### T0199
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>One connection.</b> Where part of the board hangs on a single edge, counting decides it: 24 tiles behind one edge with Precision 5 need a piece to cross it, so the edge is a link. This works for every size rule.
- new: 

### T0200
- what: text · #improvedFooter
- now: Minimum
- new: 

### T0202
- what: text · #impInfo_minimum · Shows when you click the i next to this rule.
- now: Every piece has at least this many tiles.
- new: 

### T0203
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Sizes that fit.</b> 7 tiles with Minimum 3 can only use pieces of 3, 4 or 7: a 5 or a 6 would leave 2 or 1 tiles.
- new: 

### T0204
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Too small.</b> A group under the Minimum with one way out takes it, and one that can not reach enough tiles is impossible. A closed area under twice the Minimum is one piece.
- new: 

### T0205
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Together with the other bound.</b> A Minimum and a Maximum make a range: 13 tiles with pieces of 4 to 6 can only use 4s and 5s, and a 2x3 board with pieces of 3 to 5 is two pieces of 3.
- new: 

### T0206
- what: text · #improvedFooter
- now: Maximum
- new: 

### T0208
- what: text · #impInfo_maximum · Shows when you click the i next to this rule.
- now: Every piece has at most this many tiles. On its own it says little; it matters with walls, clues or a Minimum.
- new: 

### T0209
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_maximum · Shows when you click the i next to this rule.
- now: <b>Too big together.</b> Two groups that would be too big together get a wall. A closed area needs at least (tiles / Maximum) pieces: 10 tiles with Maximum 5 and only two groups make each group its own piece.
- new: 

### T0210
- what: text · #improvedFooter
- now: Piece rules
- new: 

### T0211
- what: text · #improvedFooter
- now: Shape bank
- new: 

### T0213
- what: text · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: Every piece is one of the bank's shapes (turned or flipped).
- new: 

### T0214
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>Sizes.</b> Only the bank's sizes count: straight trominoes on 7 tiles is impossible, and a domino and a pentomino on 9 tiles is only 2 + 2 + 5. The same holds for every closed area.
- new: 

### T0215
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>Where a shape can go.</b> The solver lists every placement that holds each group, and what they share is decided: straight trominoes on a 1x6 strip find the wall after the third tile.
- new: 

### T0216
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>What every shape has.</b> If every bank shape contains a 2x2 block, so does every piece: a tile with no room for a 2x2 around it is impossible. The same goes for a bend.
- new: 

### T0217
- what: text · #improvedFooter
- now: Mismatch
- new: 

### T0219
- what: text · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: Every piece has a different shape.
- new: 

### T0220
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>Enough shapes.</b> There is 1 domino, 2 trominoes, 5 tetrominoes... A board that can not be covered with different shapes is impossible, and sizes that can not be used are dropped.
- new: 

### T0221
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>A shape is used once.</b> Once a piece is the domino, no other piece can be. Two pieces that can only be the two trominoes take both, even before knowing which is which. Two touching area numbers 2 are one piece (there is a single domino).
- new: 

### T0222
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>Room for the neighbour.</b> A place is dropped if it leaves a neighbour room only for the same shape: a 1x4 gap can not be filled with 1x2s.
- new: 

### T0223
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>Sizes used up.</b> Once both trominoes are used no other piece has 3 tiles, and Inequality and Difference walls carry that further.
- new: 

### T0224
- what: text · #improvedFooter
- now: Match
- new: 

### T0226
- what: text · #impInfo_match · Shows when you click the i next to this rule.
- now: Every piece has the same shape.
- new: 

### T0227
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>One size.</b> The size divides the board and every area closed by walls: 12 tiles allow 1, 2, 3, 4, 6 or 12. With one size left, groups grow to it and stop, and a tile that is the only way into a part of the board takes exactly what is left after whole pieces.
- new: 

### T0228
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>One shape for every group.</b> Every group known to be one piece must fit in the shape: a bent group of 3 and a straight group of 3 rule out size 3. With one shape left, every group needs a place for it, like a polyomino.
- new: 

### T0229
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>Every tile needs the shape.</b> Every tile of the board must be covered by some placement of the shape: a size where no shape can reach every tile (a dead end at the end of a 1-wide arm, a 2x2 pocket) is dropped.
- new: 

### T0230
- what: text · #improvedFooter
- now: Mingle Shape
- new: 

### T0232
- what: text · #impInfo_mingleshape · Shows when you click the i next to this rule.
- now: Pieces that touch have different shapes.
- new: 

### T0233
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mingleshape · Shows when you click the i next to this rule.
- now: <b>Neighbours lose a shape.</b> A piece known to be a shape takes it from every piece across a wall: with a bank of a domino and two trominoes, the piece next to a domino has 3 tiles. Two touching pieces known to be the same shape are one piece.
- new: 

### T0234
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mingleshape · Shows when you click the i next to this rule.
- now: <b>Two shapes.</b> With only two possible shapes, neighbours alternate like a chessboard: an odd loop of walls is impossible, and no corner has exactly three walls.
- new: 

### T0235
- what: text · #improvedFooter
- now: Size Separation
- new: 

### T0237
- what: text · #impInfo_minglearea · Shows when you click the i next to this rule.
- now: Pieces that touch have different sizes.
- new: 

### T0238
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minglearea · Shows when you click the i next to this rule.
- now: <b>Neighbours lose a size.</b> With sizes 2 to 4, the piece next to a 2 has at least 3 tiles. Two touching area numbers 2 are one piece.
- new: 

### T0239
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minglearea · Shows when you click the i next to this rule.
- now: <b>Two sizes.</b> With only two possible sizes, neighbours alternate like a chessboard: an odd loop of walls is impossible, and no corner has exactly three walls.
- new: 

### T0240
- what: text · #improvedFooter
- now: Solitude
- new: 

### T0242
- what: text · #impInfo_solitude · Shows when you click the i next to this rule.
- now: Every piece holds exactly one symbol (watchtowers do not count).
- new: 

### T0243
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_solitude · Shows when you click the i next to this rule.
- now: <b>One symbol each.</b> N symbols make N pieces, and two symbols never share one: neighbouring symbols get a wall.
- new: 

### T0244
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_solitude · Shows when you click the i next to this rule.
- now: <b>Reaching a symbol.</b> A group with no symbol must grow to one, so a wall that would cut it off from all of them is a link. A closed area with one symbol is one piece.
- new: 

### T0245
- what: text · #improvedFooter
- now: Boxy
- new: 

### T0247
- what: text · #impInfo_boxy · Shows when you click the i next to this rule.
- now: Every piece is a rectangle.
- new: 

### T0248
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Fill the box.</b> Tiles of one piece fill the box round them: two tiles at opposite corners of a 2x3 link all six.
- new: 

### T0249
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Walls run straight.</b> A wall can not stop in the open or turn a corner: at each inner corner it runs straight, makes a T or a cross.
- new: 

### T0250
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Where the rectangle can go.</b> For a piece of known size the solver lists every rectangle that fits, and what they share is decided. A group already shut on one side (wall, hole, board edge) can not grow past it.
- new: 

### T0251
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Prime sizes.</b> However the size is known (an area number, Difference or Inequality walls, ...), a prime size is a strip: a piece of 7 is a 1x7, and where 7 tiles do not fit across, it runs up and down.
- new: 

### T0252
- what: text · #improvedFooter
- now: Non-boxy
- new: 

### T0254
- what: text · #impInfo_nonboxy · Shows when you click the i next to this rule.
- now: No piece is a rectangle.
- new: 

### T0255
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_nonboxy · Shows when you click the i next to this rule.
- now: <b>At least 3 tiles.</b> A single tile and a domino are rectangles, so every piece has 3 tiles or more.
- new: 

### T0256
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_nonboxy · Shows when you click the i next to this rule.
- now: <b>Keep growing.</b> A group that is a rectangle so far is not finished: with one way out, that edge is a link. A closed strip or a small closed box is impossible.
- new: 

### T0257
- what: text · #improvedFooter
- now: Bricky
- new: 

### T0259
- what: text · #impInfo_bricky · Shows when you click the i next to this rule.
- now: No corner has four walls meeting (a cross).
- new: 

### T0260
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_bricky · Shows when you click the i next to this rule.
- now: <b>Three walls.</b> Three walls at a corner make the fourth a link.
- new: 

### T0261
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_bricky · Shows when you click the i next to this rule.
- now: <b>Poking-in corners.</b> Where two walls meet at a right angle pointing into the board (next to a hole), the tile diagonal to it must join one of its two neighbours: it can never be a one-tile piece. Two pieces (or holes) touching only at a corner are impossible.
- new: 

### T0262
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_bricky · Shows when you click the i next to this rule.
- now: <b>Placements.</b> A polyomino, bank shape or rectangle that would leave a cross somewhere is dropped.
- new: 

### T0263
- what: text · #improvedFooter
- now: Loopy
- new: 

### T0265
- what: text · #impInfo_loopy · Shows when you click the i next to this rule.
- now: No corner has exactly three walls (a T). So every corner has 0, 2 or 4 walls, and the pieces can be coloured with two colours, the outside being one of them.
- new: 

### T0266
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>The outline is linked.</b> Every outline tile is walled from the outside, so outline tiles side by side are one piece (the same round holes), and a one-tile piece can never sit there.
- new: 

### T0267
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>Three walls.</b> Three walls at a corner make the fourth a wall.
- new: 

### T0268
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>Two colours.</b> A chain of known edges tells whether two tiles have the same colour: same colour gives a link, different a wall. Three pieces that all touch each other are impossible.
- new: 

### T0269
- what: text · #improvedFooter
- now: Combined rules
- new: 

### T0270
- what: text · #improvedFooter
- now: Mismatch + few shapes
- new: 

### T0272
- what: text · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: With Mismatch and only a few shapes to go round (Boxy, or small pieces), the solver tracks which piece can take which shape.
- new: 

### T0273
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: <b>Shapes taken.</b> Four pieces that can only be the 1x1, 1x2, 1x3 and 1x4 take all four, and every other piece loses them.
- new: 

### T0274
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: <b>Size walls.</b> With few shapes available from the size limits, Difference and Inequality walls become very valuable to tell which small pieces are still available.
- new: 

### T0275
- what: text · #improvedFooter
- now: Match + pocket of knowledge
- new: 

### T0277
- what: text · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: With Match every piece has the same shape, so whatever a clue tells about its own piece holds for every piece.
- new: 

### T0278
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: <b>Small facts, big picture.</b> Testing every shape of a size one by one is too slow. Instead the solver gathers small facts about the piece from the clues and lets each one cut the list: one fact allows only straight pieces, another needs a tile with all four neighbours in the piece, and together no shape is left.
- new: 

### T0279
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: <b>Reducing size.</b> Some facts keep the piece in a small area, which caps its size: a compass with 0 west close to the east wall forces the shape to be thin.
- new: 

### T0280
- what: text · #improvedFooter
- now: Match + holes
- new: 

### T0282
- what: text · #impInfo_combo_matchhole · Shows when you click the i next to this rule.
- now: With Match a piece can't surround another piece: if the piece contains a hole, it would need to be a hole of the puzzle.
- new: 

### T0283
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchhole · Shows when you click the i next to this rule.
- now: <b>A hole for every piece.</b> When tiles known to be one piece close a ring around empty tiles, the shape has a hole of that shape. A board with fewer holes than the minimum number of pieces would fail. A link that would create such a scenario is decided to be a wall. This is the reason the O heptomino can't tile a plane.
- new: 

### T0284
- what: text · #improvedFooter
- now: Compass + Boxy
- new: 

### T0286
- what: text · #impInfo_combo_compassboxy · Shows when you click the i next to this rule.
- now: A Boxy compass counts whole rows and columns.
- new: 

### T0287
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_compassboxy · Shows when you click the i next to this rule.
- now: <b>Corners of the rectangle.</b> A compass with a non-0 number to the west and to the north must reach the tile directly west, directly north and diagonally north-west.
- new: 

### T0288
- what: text · #improvedFooter
- now: Compass + Roses
- new: 

### T0290
- what: text · #impInfo_combo_compassrose · Shows when you click the i next to this rule.
- now: A compass piece has only so many tiles on each side, and still has to reach every rose type.
- new: 

### T0291
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_compassrose · Shows when you click the i next to this rule.
- now: <b>The way to a rose.</b> A rose that can only be reached through more tiles to the north than the north number allows is out of reach for that piece.
- new: 

### T0292
- what: text · #improvedFooter
- now: Area numbers + Roses
- new: 

### T0294
- what: text · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: An area number fixes the size, the roses fix what the piece must hold.
- new: 

### T0295
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: <b>Every place of the piece.</b> With few pieces the solver lists every place of the numbered piece; the rest of the board must still hold full rose sets.
- new: 

### T0296
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: <b>Close enough.</b> A rose only counts as reachable when the piece plus the way there fits in the number.
- new: 

### T0297
- what: text · #improvedFooter
- now: Gemini + Delta
- new: 

### T0299
- what: text · #impInfo_combo_gemdelta · Shows when you click the i next to this rule.
- now: Gemini says same shape, Delta says different shape.
- new: 

### T0300
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_gemdelta · Shows when you click the i next to this rule.
- now: <b>Never the same two pieces.</b> If one piece touches both a Gemini and a Delta wall, the pieces across them are different.
- new: 

### T0301
- what: text · #improvedFooter
- now: One symbol per piece
- new: 

### T0303
- what: text · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: With Solitude, roses, or all-different area numbers that fill the board, every tile belongs to exactly one symbol's piece.
- new: 

### T0304
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>Who each tile belongs to.</b> Two touching tiles that can not belong to the same symbol get a wall; two that can only belong to the same one get a link. A tile too far from a symbol for its size can not belong to it.
- new: 

### T0305
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>Minimums fill the board.</b> When the smallest pieces of all symbols add up to the board, every piece is that small: 20 compasses that each need 5 tiles on 100 tiles make every piece 5.
- new: 

### T0306
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>With Boxy.</b> Every rectangle a piece can still be must hold what it needs: a strip along the edge that does not reach all the roses it needs must grow wider to reach them. With Solitude, a rectangle with no symbol is dropped.
- new: 

### T0307
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Custom
- new: 

### T0308
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Omits
- new: 

### T0310
- what: text · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: No piece may contain a banned shape (turned or flipped).
- new: 

### T0311
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Contains means inside.</b> Banning the 2x2 bans the P pentomino too. Two groups whose union would hold a banned shape get a wall: with a banned domino every edge is a wall.
- new: 

### T0312
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Biggest allowed piece.</b> If every shape of some size holds a banned shape, no piece can be that big: a banned domino makes every piece one tile. Bank shapes and polyominoes that hold one can not be used.
- new: 

### T0313
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Wally
- new: 

### T0315
- what: text · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: Every tile needs at least 2 neighbours that are not in its piece; the board edge and holes count as such neighbours. That is the same as: no piece may contain a T tetromino.
- new: 

### T0316
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>At most 2 neighbours inside.</b> A tile can have at most 2 neighbours in its own piece, so once it has 2 links, its other sides are walls. Pieces stay thin: no T, no plus, no 2x2 with a tile sticking out.
- new: 

### T0317
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Placements.</b> A polyomino, bank shape or rectangle that holds a T is dropped: with Boxy every piece is a strip or a 2x2 block.
- new: 

### T0318
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Gemini lines.</b> The two pieces of a Gemini wall have the same straight lines. If one side holds 4 tiles in a line and the other side can not get a new line of 4 anywhere (every try is refuted), the 4 must be the twin of a line the other side already has: next to a closed line of 5, it grows by exactly one tile.
- new: 

### T0319
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Two ends per piece.</b> Every piece is a path with two ends (a tile with 3 walls), a ring, or a single tile. A piece never gets a third end, and once both its ends are known every other tile goes through. With two rose types and every rose a dead end (or Solitude with dead-end symbols), the ends are all used up: every piece starts and ends at its roses.
- new: 

### T0320
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Heterogeneous
- new: 

### T0322
- what: text · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: Every piece has a different size.
- new: 

### T0323
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Fewer pieces.</b> Different sizes add up fast: 4 pieces need at least 1 + 2 + 3 + 4 = 10 tiles, so a board of 9 tiles has at most 3 pieces. A board that can not be split into different sizes (6 tiles with Precision 3) is impossible.
- new: 

### T0324
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>A size is used once.</b> Once a piece is finished, no other piece can have its size. Touching pieces differ in size too, so everything Size Separation finds applies as well.
- new: 

### T0325
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Links
- new: 

### T0327
- what: text · #impInfo_links · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: A link joins two tiles: they are in the same piece. It is the opposite of a wall.
- new: 

### T0328
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_links · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Known from the start.</b> Linked tiles are one group before the solver starts, so every other rule uses that right away: two roses of the same type linked together are impossible, and a linked group already as big as the size limit is walled all round.
- new: 
