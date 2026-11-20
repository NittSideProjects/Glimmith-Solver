# Rule explanations (bottom of the page)

The "Rules with improved deduction logic" list and what each i button opens.

Left here: 0 to write, 0 to check again, 34 notes, 15 to put on the page. Done: 97.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0128
- what: text · #improvedFooter
- now: Base truth for speedups
- new: Base truth for speedups

### T0129
- what: text · #improvedFooter
- now: Every rule has some ground truth that can be used by the solver to save time on the edge by edge deciding phase. They are tested every time a new edge gets decided and are almost always instantaneous.
- new: =

### T0923
- what: text · #allExamplesBtn
- now: Show all examples
- new: =

### T0130
- what: text · #improvedFooter
- now: Walls
- new: =

### T0131
- what: text · #improvedFooter
- now: Delta
- new: =

### T0134
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_delta · Shows when you click the i next to this rule.
- now: <b>Not the same shape.</b> If a link would make both sides of the delta the same shape (two identical polyominoes for example), it makes it impossible. This means it should be walled. This is also true if we know what shape a side would be without knowing its position (an area number 2 is always a domino, no matter where it goes).
- new: <b>Not the same shape.</b> If a link would make both side of the delta the same shape (two identical polyominoes for exemple), it makes it impossible. This means it should be walled. this is also true if we know what shape a side would be without knowing it's position (an area number 2 is always a domino, no matter where it goes).

### T0135
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_delta · Shows when you click the i next to this rule.
- now: <b>Must grow.</b> If one side of the delta is decided and the other side matches it currently, we know it must grow at least one more tile.
- new: <b>Must grow.</b> If one side of the delta is decided and the other side matches it currently, we know it must grow at least one more tile.

### T0136
- what: text · #improvedFooter
- now: Gemini
- new: =

### T0139
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Same size.</b> If a side is known to be size 4, then the other side is size 4 as well. This check is also used to know what the maximum size for a shape next to a gemini can be, if the total area is 8 then that shape will be size 4 at best.
- new: <b>Same size.</b> if a side is known to be size 4, then the other side is size 4 as well. this check is also used to know what the maximum size for a shape next to a gemini can be, if the total area is 8 then that shape will be size 4 at best.

### T0140
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Same shape.</b> A polyomino on one side gives its shape to the other side. This also applies if the shape isn't finished : a shape on one side contains a 1x4? the other side needs one too.
- new: <b>Same shape.</b> A polyomino on one side gives its shape to the other side. This also apply if the shape isn't finished : a shape on one side contains a 1x4? the other side needs one too.

### T0141
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_gemini · Shows when you click the i next to this rule.
- now: <b>Same shape advanced.</b> When a side is known to contain a unique shape (for example it has a 2x3 and it won't be able to make another one), if the other side also contains that shape we know it is exactly that instance. We can then test rotations/symmetry using this point as the common point, which is fast to test as there are at most 8.
- new: <b>Shape shape advanced.</b> When a side is known to contain a unique shape (for exemple it has a 2x3 and it won't be able to make another one), if the other side also contain that shape we know it is exactly that instance. we can then test rotations/symetry using this point as the common point, which is fast to test as there are at most 8.

### T0142
- what: text · #improvedFooter
- now: Inequality
- new: =

### T1161
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_inequality · Shows when you click the i next to this rule.
- now: <b>Sizes push each other.</b> Since the smallest size is 1, the big size of an inequality is always at least two. Chains like a < b < c will make c at least 3. This also means if c is known to be size 3, then b is size 2 and a is size 1.
- new: 

### T1162
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_inequality · Shows when you click the i next to this rule.
- now: <b>Loops can't exist.</b> A link that would make a loop of a < b < a is impossible, so the solver puts a wall there. This is also true with bigger loops like a < b < c < a.
- new: 

### T0146
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_inequality · Shows when you click the i next to this rule.
- now: <b>Room for whole chains.</b> When a chain of inequality exists, we know the area it will take will be at least n(n+1)/2 (1+2+3...+n). If the area needed to hold it is too small it would break, so we can't place wall in places that would force a chain to be too restrained.
- new: <b>Room for whole chains.</b> When a chain of inequality exists, we know the area it will take will be at least n(n+1)/2 (1+2+3...+n). if the area needed to hold it is too small it would break, so we can't place wall in places that would force a chain to be too restrained.

### T0147
- what: text · #improvedFooter
- now: Difference
- new: =

### T0150
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Size across the wall.</b> Since size needs to be strictly positive, a known 2 next to a difference 2 makes the other side size 4. We don't even need for exact size to use this idea, if a shape is known to be between size 2 and 4 and it hits a difference 5, the other side must be between size 7 and 9.
- new: <b>Size across the wall.</b> Since size needs to be strickly positive, a known 2 next to a difference 2 makes the other side size 4. We don't even need for exact size to use this idea, if a shape is known to be between size 2 and 4 and it hits a difference 5, the other side must be between size 7 and 9.

### T0151
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Odd and even.</b> An odd difference makes one side odd and the other even and an even difference makes both sides odd or both sides even. We can use this idea to eliminate links that would create parity issue without having to check for all possible sizes.
- new: <b>Odd and even.</b> An odd difference makes one side odd and the other even and an even difference makes both sides odd or both sides even. We can use this idea to eliminate links that would create parity issue without having to check for all possible sizes.

### T0152
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_difference · Shows when you click the i next to this rule.
- now: <b>Two numbers, two pieces.</b> If a piece touches two difference walls with one being 2 and the other being 4, the other side of those walls can never connect, no matter what the original piece does.
- new: <b>Two numbers, two pieces.</b> If a piece touches two difference wall with one being 2 and the other being 4, the other side of those walls can never connect, no matter what the original piece do.

### T0153
- what: text · #improvedFooter
- now: Clues
- new: =

### T0154
- what: text · #improvedFooter
- now: Area number
- new: =

### T0157
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>Grow to the number.</b> A piece grows toward its number and stops at it, and the walls next to it pass the size on.
- new: A piece with an area number must grow until that number is satisfied, and be fully walled of when it is. Any tile it passes through lets the solver know of it's size, so if there is a difference/inequality/ect they know the size on one side.

### T0158
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>The numbers must fit.</b> Adding numbers up should always be lower than the total area. if a wall would make that area too small it is a link. For example a 6 and a 4 can't be inside a size 8. This is also used to know that two area numbers with the same number must connect if their sum is bigger than the total area (two 5 must be together in an area 9).
- new: <b>The numbers must fit.</b> adding numbers up should always be lower then the total area. if a wall would make that area too small it is a link. for exemple a 6 and a 4 can't be inside a size 8. this is also used to know that two area number with the same number must connect if their sum is bigger than the total area (two 5 must be together in an area 9).

### T0159
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_area · Shows when you click the i next to this rule.
- now: <b>No tile left over.</b> In a similar idea, if the sum of all the numbers is EXACTLY equal to the area (with no way to merge two number together), then every tile must link to an area number. this is especially useful for far away tiles, since we now know they must connect to one of the area numbers.
- new: <b>No tile left over.</b> In a similar idea, if the sum of all the numbers is EXACTLY equal to the area (with no way to merge two number together), then every tile must link to an area number. this is especially useful for far away tiles, since we now know they must connect to one of the area numbers

### T0160
- what: text · #improvedFooter
- now: Rose
- new: =

### T0163
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Counting.</b> Since every type appears once per piece, two pieces with a rose in common are walled off instantly. Uneven counts are impossible so a wall that would force uneven count is a link. This also makes puzzle with global uneven count get rejected instantly.
- new: <b>Counting.</b> Since every type appears once per piece, two piece with a rose in common are walled of instantly. Uneven counts are impossible so a wall that would force uneven count is a link. this also makes puzzle with global uneven count get rejected instantly

### T0164
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Reaching a rose.</b> A group missing a type must still reach one, so a wall that would cut it off from every rose of that type is a link.
- new: <b>Reaching a rose.</b> if a shape has only one way out and it is missing a rose type, it must grow no matter what. This is also true if it has multiple ways out but only one of them leads to a rose it needs.

### T0165
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Counting Advanced.</b> The extension of the uneven counting, narrow passages must be passed through if they would leave uneven count, this also works for slightly bigger passages if the difference of rose amount is bigger to the same degree. A 2 wide passage with three red one blue on the left and three blue one red on the right must have the passage linked to allow the connection for 2 shapes.
- new: <b>Counting Advanced</b> The extension of the uneven counting, narrow passages must be passed through if they would leave uneven count, this also works for slightly bigger passages if the different of rose amount is bigger to the same degree. a 2 wide passage with three red one blue on the left and three blue one red on the right must have the passage linked to allow the connection for 2 shapes.

### T0166
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_rose · Shows when you click the i next to this rule.
- now: <b>Who goes with whom.</b> Similarly to a Flow puzzle, the solver lists every way to group the remaining roses into pieces. Pretty useful when puzzle has a lot of different roses in small packs.
- new: <b>Who goes with whom.</b> Similarely to a Flow puzzle, the solver lists every way to group the remaining roses into pieces. Pretty useful when puzzle has a lot of different roses in small packs

### T0167
- what: text · #improvedFooter
- now: Polyomino
- new: =

### T0170
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_polyomino · Shows when you click the i next to this rule.
- now: <b>Must fit the shape.</b> The piece has the polyomino's size, it is also considered like an area number. Also tiles already together must fit in the shape. So if a shape has no line of length 3, two tiles in a row instantly get a wall at both ends.
- new: <b>Must fit the shape.</b> The piece has the polyomino's size, it is also considered like an area number. Also tiles already together must fit in the shape. So if a shape has no line of length 3, two tiles in a row instantly get a wall at both ends.

### T0171
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_polyomino · Shows when you click the i next to this rule.
- now: <b>Where the polyomino can go.</b> The solver tests each place the shape can go over the polyomino, if in every universe two shapes must be linked they are linked (same with walls). This helps identify that two identical polyominoes where the merge causes all possible tiling to fail must be different pieces.
- new: <b>Where the polyomino can go.</b> The solver tests each place the shape can go over the polyomino, if in every universe two shapes must be linked they are linked (same with walls). This helps identify that two identical polyominoes where the merge causes all possible tiling to fail must be different pieces.

### T0172
- what: text · #improvedFooter
- now: Watchtower
- new: =

### T0175
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>1 and 4.</b> A 1 links all the tiles round the corner, a 4 walls them all. Pretty trivial :)
- new: <b>1 and 4.</b> A 1 links all the tiles round the corner, a 4 walls them all. Pretty trivial :)

### T0176
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>2 and 3.</b> A 2 is exactly two walls, either in a bend or a straight line. So if two walls or two links are decided we know the other two states. A 3 is more tricky, as it can be three walls, or four if one piece wraps around the corner. When no piece can wrap (too small, or no way round), a 3 with three walls known links the fourth.
- new: <b>2 and 3.</b> A 2 is exactly two walls, either in a bend or a straight line. So if two walls or two links are decided we know the other two state. A 3 is more tricky, as it can be three walls, or four if one piece wraps around the corner. When no piece can wrap (too small, or no way round), a 3 with three walls known links the fourth.

### T0177
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_watchtower · Shows when you click the i next to this rule.
- now: <b>Edges of puzzle.</b> A 1 or a 2 at the edge of the puzzle is respectively a link or a wall. Similarly a 1 or a 3 at an inward corner is two links or two walls. And more is impossible. (this is also true for walls the solver discovers midway)
- new: <b>Edges of puzzle.</b> A 1 or a 2 at the edge of the puzzle is respectively a link or a wall. Similarely a 1 or a 3 at an inward corner is two links or two walls. And more is impossible. (this is also true for walls the solvers discover midway)

### T0178
- what: text · #improvedFooter
- now: Palisade
- new: =

### T0181
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Count the sides.</b> If a palisade has already enough links or walls known, the solver can instantly input the rest. With a straight 2 palisade with a wall already known bottom of it, the solver puts the wall on the opposite side, and two links on the left and right directly.
- new: <b>Count the sides.</b> If a palisade has already enough links or walls known, the solver can instantly input the rest. With a straight 2 palisade with a wall already known bottom of it, the solver put the wall on the opposite side, and two link on the left and right directly.

### T1163
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Size of the piece.</b> A tile with k open sides is in a piece of at least k + 1 tiles, 0 needs 5 tiles, 1 needs 4... So if a 1 Palisade has an area number 3 neighboring, it can't link.
- new: 

### T1164
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Fake walls.</b> A piece can't pass directly through a bend palisade or a dead end palisade. If a bunch of dead end palisades are in a row the solver knows a piece can't pass through it. (two bends are an exception)
- new: 

### T0183
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Palisades together.</b> Palisade can have some interesting interaction when next to each other, or when diagonally adjacent. Most famous example of that is the 1 palisade and 2 palisade diagonally adjacent forces the 1 to have two links outwards. There are other cases specially with solitude that the solver can use.
- new: <b>Palisades together.</b> Palisade can have some interesting interaction when next to each other, or when diagonally adjacent. most famous exemple of that is the 1 palisade and 2 palisade diagonaly adjacent forces the 1 to have two link outwards. there are other cases specially with solitude that the solver can use.

### T0184
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Inside a known shape.</b> A polyomino, a bank shape or a rectangle must give each palisade inside it the right count: with Boxy a 0 can only be an inner tile of a rectangle.
- new: <b>Inside a known shape.</b> Reduced shape possibility (from a polymino, a shape bank or even boxy) in combination with palissade can really decrease possible placements, or force more growing. for exemple a 0 palisade must be at least a 3x3 with boxy.

### T0185
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_palisade · Shows when you click the i next to this rule.
- now: <b>Only two pieces.</b> When a puzzle is known to have EXACTLY two shapes in total, palisades become a very good tool to find coloring reasoning. For example no matter the orientation, the opposite side of a straight line palisade will always be the same piece/color.
- new: <b>Only two pieces.</b> When a puzzle is known to have EXACTLY two shapes in total, palisade become a very good tool to find coloring reasoning. for exemple no matter the orientation, the opposite side of a straight line palisade will always be the same piece/color.

### T0186
- what: text · #improvedFooter
- now: Compass
- new: =

### T0189
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>A count is a limit.</b> With a 2 east compass, nothing three columns or more to the east can join the compass. This also walls off 0 compasses instantly. If walls force a detour, it can also reduce the "reachable" even more.
- new: <b>A count is a limit.</b> With a 2 east compass, nothing three columns or more to the east can join the compass. This also walls off 0 compasses instantly. if walls forces a detour, it can also reduce the "reachable" even more.

### T0190
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>The only way.</b> If a compass needs a lot of tiles and one of them is a choke point that leads to the count being possible, it must be linked. This is very important to know when a compass has to "wrap around". Similarly to polyomino, if in every possible compass shape two tiles are linked/walled, we can add that. (this is mostly useful for compass with all 4 direction inputted)
- new: <b>The only way.</b> If a compass needs a lot of tiles and one of them is a choke point that leads to the count being possible, it must be linked. This is very important to know when a compass has to "wrap around". Similarely to polymino, if in every possible compass shape two tiles are link/walled, we can add that. (this is mostly useful for compass with all 4 direction inputted)

### T0191
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>Size.</b> Size of compasses are ranges, but we can find some easy truths : A compass with four numbers cap the piece at 1 + N + E + S + W tiles. And any compass also gives a smallest size at "biggest number + 1" (the compass tile itself).
- new: <b>Size.</b> Size of compasses are ranges, but we can find some easy truths : A compass with four numbers cap the piece at 1 + N + E + S + W tiles. And any compass also give a smallest size at "biggest numbet + 1" (the compass tile itself)

### T0192
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_compass · Shows when you click the i next to this rule.
- now: <b>Count doesn't match.</b> A compass with north 3 cannot merge with another compass above it if they also have north 3. This logic is also true with the first compass being north 2, or the second compass being further away. In the opposite manner, if a tile needs to be part of two compasses, mostly from size being too big, then the two compasses must be together in the same shape.
- new: <b>Count doesn't match.</b> A compass with north 3 cannot merge with another compass above it if they also have north 3. This logic is also true with the first compass being north 2, or the second compass being further away. In the opposite manner, if a tile needs to be part of two compass, mostly from size being too big, then the two compass must be together in the same shape.

### T0193
- what: text · #improvedFooter
- now: Size limits
- new: =

### T0194
- what: text · #improvedFooter
- now: Precision
- new: =

### T0197
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>The board must divide.</b> 7 tiles with Precision 3 is impossible, and so is every area closed off by walls that is not a multiple. An area of exactly 3 tiles is one piece.
- new: <b>The board must divide.</b> If we know the precision is 5, then no pocket of area can be of size 8, they must be divisible by 5. Any wall that would force the remaining area to fail has to be a link

### T0198
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>Grow and stop.</b> If a shape hasn't satisfied the precision yet, and has only one way out, then it must grow out that way. Similarly if it has already satisfied the precision then it's walled off.
- new: <b>Grow and stop.</b> If a shape hasn't satisified the precision yet, and has only one way out, then it must grows out that way. Similarely if it has already satisifed the precision then it's walled of.

### T0199
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_precision · Shows when you click the i next to this rule.
- now: <b>The board must divide advanced.</b> Knowing that the board must divide everything equally, when a choke point exists we can count to know how many tiles need to be poking out/in. A pocket of size 23 with precision 5 needs to be poking out through its only choke point 2 tiles.
- new: <b>The board must divide advanced.</b> knowing that the board must divide everything equally, when a choke point exist we can count to know how many tiles need to be poking out/in. a pocket of size 23 with precision 5 needs to be poking out through it's only choke point 2 tiles.

### T0200
- what: text · #improvedFooter
- now: Minimum
- new: =

### T0203
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Sizes that fit.</b> An area of size 7 with Minimum 3 can only use pieces of size 3, 4 or 7: a 5 or a 6 would leave 2 or 1 tiles and fail the minimum.
- new: <b>Sizes that fit.</b> An area of size 7 with Minimum 3 can only use pieces of size 3, 4 or 7: a 5 or a 6 would leave 2 or 1 tiles and fail the minimum.

### T0204
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Too small.</b> Similarly to precision, if a shape has only one way out and hasn't satisfied the minimum, it has to grow that way. This also makes us know a closed area with the size strictly under twice the minimum is one piece, two pieces wouldn't fit.
- new: <b>Too small.</b> Similarely to precision, if a shape has only one way out and hasn't satisfied the minimum, it has to grow that way. this also makes us know a closed area with the size strictly under twice the minimum is one piece, two piece wouldn't fit.

### T0205
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minimum · Shows when you click the i next to this rule.
- now: <b>Together with the other bound.</b> A Minimum and a Maximum make a range: Knowing that can help reduce possible size combinations even more, sometimes it can even rule out a size completely. min 4 max 6 in a pocket of 12 can only be 4+4+4 or 6+6.
- new: <b>Together with the other bound.</b> A Minimum and a Maximum make a range: Knowing that can help reduce possible size combinations even more, sometimes it can even rule out a size completely. min 4 max 6 in a pocket of 12 can only be 4+4+4 or 6+6.

### T0206
- what: text · #improvedFooter
- now: Maximum
- new: =

### T0209
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_maximum · Shows when you click the i next to this rule.
- now: <b>Too big together.</b> When adding up two shapes size make a number above the maximum, then those two shapes must be distinct. And in puzzles where the total amount of shape is known or limited (mismatch for example) maximum allows the solver to enumerate all possible shapes and plan accordingly.
- new: <b>Too big together.</b> when adding up two shapes size make a number above the maximum, then those two shapes must be distinct. and in puzzles where the total amount of shape is known or limited (mismatch for exemple) maximum allows the solver to enumerate all possible shapes and plan accordingly

### T0210
- what: text · #improvedFooter
- now: Piece rules
- new: =

### T0211
- what: text · #improvedFooter
- now: Shape bank
- new: =

### T0214
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>Sizes.</b> Since every piece is a shape in the shape bank, they must all have one of their size. If the bank only holds shape of size 2 and 5, a closed area of size 9 forces the 2+2+5 combination.
- new: <b>Sizes.</b> Since every piece is a shape in the shape bank, they must all have one of their size. if the bank only holds shape of size 2 and 5, a closed area of size 9 forces the 2+2+5 combination.

### T0215
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>Where a shape can go.</b> With shape bank every possibility is very restrictive, so testing all possible placement is a good strategy specially with small shape banks.
- new: <b>Where a shape can go.</b> with shape bank every possibility is very restictive, so testing all possible placement is a good strategy specially with small shape banks.

### T0216
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_shapebank · Shows when you click the i next to this rule.
- now: <b>What is in common.</b> If every bank shape contains a 2x2 block, so does every piece. This means a straight corridor must go out in a way that allows it to contain that 2x2. This is also true if every shape doesn't contain a 2x2, but it is taken care of by the point above.
- new: <b>What is in commun.</b> If every bank shape contains a 2x2 block, so does every piece. this means a straight corridor must go out in a way that allows it to contain that 2x2. This is also true of every shape doesn't contain a 2x2, but it is taken care of by the point above.

### T0217
- what: text · #improvedFooter
- now: Mismatch
- new: =

### T0220
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>Enough shapes.</b> Mismatch is a piece amount limitation, since there is 1 domino, 2 trominoes, 5 tetrominoes... so with a size limitation we can easily tell what pieces HAVE to be used, in particular a puzzle which area is equal to the total size of all shapes must have room for every, single, one.
- new: <b>Enough shapes.</b> Mismatch is a piece amount limitation, since there is 1 domino, 2 trominoes, 5 tetrominoes... so with a size limitation we can easily tell what pieces HAVE to be used, in particular a puzzle which are is equal to the total size of all shapes must have room for every, single, one.

### T0221
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>A shape is used once.</b> Since every shape is unique, if they are already drawn, every piece that looks like it must grow to avoid breaking mismatch.
- new: <b>A shape is used once.</b> Since every shape is unique, if they are already drawn, every piece that looks like it must grow to avoid breaking mismatch.

### T0222
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>Room for the neighbour.</b> If an area can be filled with a shape that would leave the remaining hole of that same shape, then it can't happen, as both would be matching and break mismatch.
- new: <b>Room for the neighbour.</b> if an area can be filled with a shape that would leave the remaining hole of that same shape, then it can't happen, as both would be matching and break mismatch.

### T0223
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mismatch · Shows when you click the i next to this rule.
- now: <b>A shape is used once advanced.</b> The solver doesn't need to check if the shape is fully drawn to know if that shape is still available in the rest of the puzzle. If two places need to be of area 3, since there exist only 2 trominoes, the rest of the puzzle can't be either of those and no size 3 can happen.
- new: <b>A shape is used once advanced.</b> The solver doesn't need to check if the shape is fully drawn to know if that shape is still available in the rest of the puzzle. If two place need to be of area 3, since there exist only 2 triomino, the rest of the puzzle can't be either of those and no size 3 can happen.

### T0224
- what: text · #improvedFooter
- now: Match
- new: =

### T0227
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>One size.</b> If the puzzle is one shape, then the puzzle has one size. This means the shape can only be one size that divides the total area of the puzzle. If the puzzle is of size 12, then the shape can't be of size 5.
- new: <b>One size.</b> If the puzzle is one shape, then the puzzle has one size. this means the shape can only be one size that divide the total area of the puzzle. if the puzzle is of size 12, then the shape can't be of size 5.

### T0228
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>One shape for every group.</b> Every part of the puzzle that is known can act as small pocket of knowledge about the shape as a whole. If we know the shape contains a 1x3 and the 2x2 then it must be of size 5 or more.
- new: <b>One shape for every group.</b> Every part of the puzzle that is known can act as small pocket of knowledge about the shape as a whole. if we know the shape contains a 1x3 and the 2x2 then it must be of size 5 or more.

### T0229
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_match · Shows when you click the i next to this rule.
- now: <b>One shape for every group advanced.</b> This idea of pocket of knowledge can be pushed further, if we know from a compass that the shape must fit inside a 5x5 square as a whole, then finding the correct shape can get a lot easier as any shape that breaks that size limit are instantly dismissed without testing the tiling. Combining known sub-shapes that must fit inside the true shape and size limitation from puzzle grid or clue we can go through all possibilities very quickly.
- new: <b>One shape for every group advanced.</b> This idea of pocket of knowledge can be pushed further, if we know from a compass that the shape must fit inside a 5x5 square as a whole, then finding the correct shape can get a lot easier as any shape that break that size limit are instantly dismissed without testing the tiling. Combining known sub-shapes that must fit inside the true shape and size limitation from puzzle grid or clue we can go through all possibility very quickly

### T0230
- what: text · #improvedFooter
- now: Mingle Shape
- new: =

### T0233
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mingleshape · Shows when you click the i next to this rule.
- now: <b>Neighbours lose a shape.</b> When a piece is already decided, every neighbor that looks like it must grow, this is especially useful with small shapes like the 1x1, or with shape bank.
- new: <b>Neighbours lose a shape.</b> When a piece is already decided, every neighbor that looks like it must grow, this is expecially useful with small shapes like the 1x1, or with shape bank.

### T0234
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_mingleshape · Shows when you click the i next to this rule.
- now: <b>Two shapes.</b> And when only two possible shapes are used in the puzzle, we know the solution must always alternate, like a checkerboard pattern. This also makes us know a corner can't have exactly 3 walls.
- new: <b>Two shapes.</b> And when only two possible shapes are used in the puzzle, we know the solution must always alternate, like a checkerboard pattern. this also makes us know a corner can't have exactly 3 walls.

### T0235
- what: text · #improvedFooter
- now: Size Separation
- new: =

### T0238
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minglearea · Shows when you click the i next to this rule.
- now: <b>Neighbours lose a size.</b> Exactly the same idea that mingle shape had, but even more restrictive, if a shape is decided neighbouring shapes of the same size must grow.
- new: <b>Neighbours lose a size.</b> Exactly the same idea that mingle shape had, but even more restrictive, if a shape is decided neighbouring shapes of the same size must grow.

### T0239
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_minglearea · Shows when you click the i next to this rule.
- now: <b>Two sizes.</b> And exactly like mingle shape, with only 2 sizes the solution is also a sort of checkerboard pattern, so all corners of exactly 3 walls are banned.
- new: <b>Two sizes.</b> And exactly like mingle shape, with only 2 size the solution is also a sort of checkerboard pattern, so all corner of exactly 3 walls are banned.

### T0240
- what: text · #improvedFooter
- now: Solitude
- new: =

### T0243
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_solitude · Shows when you click the i next to this rule.
- now: <b>One symbol each.</b> Since N symbols make N pieces, this rule allows us to know the total amount of pieces. Also two neighbouring pieces that each already hold a symbol can't merge and are walled off.
- new: <b>One symbol each.</b> Since N symbols make N pieces, this rules allows us to know the total amount of pieces. Also two neighbouring piece that each already hold a symbol can't merge and are walled off.

### T0244
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_solitude · Shows when you click the i next to this rule.
- now: <b>Reaching a symbol.</b> A group with no symbol must grow to one, so a wall that would cut it off from all of them is a link and a closed area with one symbol needs to be one piece.
- new: <b>Reaching a symbol.</b> A group with no symbol must grow to one, so a wall that would cut it off from all of them is a link and a closed area with one symbol needs to be one piece.

### T0245
- what: text · #improvedFooter
- now: Boxy
- new: =

### T0248
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Fill the box.</b> Tiles known to be one piece need to fill everything in the middle to be a rectangle, so an L tetromino needs to be a 2x3. The solver doesn't need to know the tiles are already linked for that, knowing they will eventually be part of the same shape is enough to fill the whole middle.
- new: <b>Fill the box.</b> tiles known to be one piece needs to fill everything in the middle to be a rectangle, so an L tetromino needs to be a 2x3. The solver doesn't need to know the tiles are already linked for that, knowing they will eventually be part of the same shape is enough to fill the whole middle.

### T0249
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Walls run straight.</b> At every corner, there can never be exactly 2 walls that form a bend, otherwise the other two links would create a bend tromino. This means every corner either runs straight, has 3 walls, or has 4 walls. (or 0)
- new: <b>Walls run straight.</b> At every corner, there can never be exactly 2 wall that formes a bend, otherwise the other two link would create a bend triomino. this means every corner either runs straight, has 3 walls, or has 4 walls. (or 0)

### T0250
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>What placement fits the size.</b> When a piece's size is known, it's very fast to check every placement of it with boxy as the amount of possible rectangles is very small. This is done to know what link is always there and what wall is always there.
- new: <b>What placement fits the size.</b> When a piece's size is known, it's very fast to check every placement of it with boxy as the amount of possible rectangle is very small. this is done to know what link is always there and what wall is always there.

### T0251
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_boxy · Shows when you click the i next to this rule.
- now: <b>Prime sizes.</b> To go further, when the size of a piece is known and is a prime number then the shape is a strip: a size of 7 is always a 1x7, and finding way to fit it into the puzzle often leads to knowing if it is horizontal or vertical.
- new: <b>Prime sizes.</b> To go further, when the size of a piece is known and is a prime number then the shape is a strip: a size of 7 is always a 1x7, and finding way to fit it into the puzzle often lead to knowing if it is horizontal or vertical.

### T0252
- what: text · #improvedFooter
- now: Non-boxy
- new: =

### T0255
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_nonboxy · Shows when you click the i next to this rule.
- now: <b>At least 3 tiles.</b> Title says it all ! The 1x1 and 1x2 are both rectangles, so non boxy is also minimum 3 so minimum logic also applies.
- new: <b>At least 3 tiles.</b> Title says it all ! the 1x1 and 1x2 are both rectangles, so non boxy is also minimum 3 so minimum logic also applies.

### T0256
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_nonboxy · Shows when you click the i next to this rule.
- now: <b>Keep growing.</b> If a shape is currently a rectangle, it has to grow no matter what. And if it only has one way to grow then that needs to be a link.
- new: <b>Keep growing.</b> if a shape is currently a rectangle, it has to grow no matter what. And if it only has one way to grow then that needs to be a link.

### T0257
- what: text · #improvedFooter
- now: Bricky
- new: =

### T0260
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_bricky · Shows when you click the i next to this rule.
- now: <b>Three walls.</b> If we know three walls at a corner, we know the 4th is a link, pretty self explanatory.
- new: <b>Three walls.</b> if we know three walls at a corner, we know the 4th is a link, pretty self explanatory.

### T0261
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_bricky · Shows when you click the i next to this rule.
- now: <b>Poking-in corners.</b> Where two walls meet at a right angle pointing into the board (or from a hole), the tile diagonal to it has to join one of its two neighbours. If it didn't, it would instantly create 4 walls. Two pieces (or holes) with touching corners are impossible. This helps reduce possible placement for polyomino and such.
- new: <b>Poking-in corners.</b> Where two walls meet at a right angle pointing into the board (or from a hole), the tile diagonal to it has to join one of its two neighbours. If it didn't, it would instantly create 4 walls. Two pieces (or holes) with touching corners is impossible. This helps reduce possible placement for polyomino and such.

### T0263
- what: text · #improvedFooter
- now: Loopy
- new: =

### T1165
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>Two colors.</b> Since no corner has exactly three walls (a T), so every corner has 0, 2 or 4 walls. This also makes the final puzzle 2 colorable, with the outside being one of them.
- new: 

### T0266
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>The outline is linked.</b> Every outline tile is walled from the outside, so outline tiles side by side are one piece (the same round holes), and a one-tile piece can never sit there.
- new: <b>The outline is linked.</b> You must always link the outline of a loopy puzzle, putting walls would instantly break loopy.

### T0267
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>Three walls.</b> Three walls at a corner make the fourth a wall.
- new: <b>Three walls.</b> when a corner has three walls already known, the solver adds the 4th wall. Pretty self explanatory.

### T0268
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_loopy · Shows when you click the i next to this rule.
- now: <b>Two colours.</b> A chain of known edges tells whether two tiles have the same colour: same colour gives a link, different a wall. Three pieces that all touch each other are impossible.
- new: [remove this one, change the other two color to : <b>Two colors.</b> Since no corner has exactly three walls (a T), every corner has 0, 2 or 4 walls. This also makes the final puzzle 2 colorable, with the outside being one of them. If a wall or link would force the usage of a 3rd color then it can't be used.]

### T0269
- what: text · #improvedFooter
- now: Combined rules
- new: [Honestly putting combined rules there is just confusing, I'd remove them all]

### T0270
- what: text · #improvedFooter
- now: Mismatch + few shapes
- new: [remove]

### T0272
- what: text · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: With Mismatch and only a few shapes to go round (Boxy, or small pieces), the solver tracks which piece can take which shape.
- new: [remove]

### T0273
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: <b>Shapes taken.</b> Four pieces that can only be the 1x1, 1x2, 1x3 and 1x4 take all four, and every other piece loses them.
- new: [remove]

### T0274
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_fewshapes · Shows when you click the i next to this rule.
- now: <b>Size walls.</b> With few shapes available from the size limits, Difference and Inequality walls become very valuable to tell which small pieces are still available.
- new: [remove]

### T0275
- what: text · #improvedFooter
- now: Match + pocket of knowledge
- new: [remove]

### T0277
- what: text · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: With Match every piece has the same shape, so whatever a clue tells about its own piece holds for every piece.
- new: [remove]

### T0278
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: <b>Small facts, big picture.</b> Testing every shape of a size one by one is too slow. Instead the solver gathers small facts about the piece from the clues and lets each one cut the list: one fact allows only straight pieces, another needs a tile with all four neighbours in the piece, and together no shape is left.
- new: [remove]

### T0279
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchclues · Shows when you click the i next to this rule.
- now: <b>Reducing size.</b> Some facts keep the piece in a small area, which caps its size: a compass with 0 west close to the east wall forces the shape to be thin.
- new: [remove]

### T0280
- what: text · #improvedFooter
- now: Match + holes
- new: [remove]

### T0282
- what: text · #impInfo_combo_matchhole · Shows when you click the i next to this rule.
- now: With Match a piece can't surround another piece: if the piece contains a hole, it would need to be a hole of the puzzle.
- new: [remove]

### T0283
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_matchhole · Shows when you click the i next to this rule.
- now: <b>A hole for every piece.</b> When tiles known to be one piece close a ring around empty tiles, the shape has a hole of that shape. A board with fewer holes than the minimum number of pieces would fail. A link that would create such a scenario is decided to be a wall. This is the reason the O heptomino can't tile a plane.
- new: [remove]

### T0284
- what: text · #improvedFooter
- now: Compass + Boxy
- new: [remove]

### T0286
- what: text · #impInfo_combo_compassboxy · Shows when you click the i next to this rule.
- now: A Boxy compass counts whole rows and columns.
- new: [remove]

### T0287
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_compassboxy · Shows when you click the i next to this rule.
- now: <b>Corners of the rectangle.</b> A compass with a non-0 number to the west and to the north must reach the tile directly west, directly north and diagonally north-west.
- new: [remove]

### T0288
- what: text · #improvedFooter
- now: Compass + Roses
- new: [remove]

### T0290
- what: text · #impInfo_combo_compassrose · Shows when you click the i next to this rule.
- now: A compass piece has only so many tiles on each side, and still has to reach every rose type.
- new: [remove]

### T0291
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_compassrose · Shows when you click the i next to this rule.
- now: <b>The way to a rose.</b> A rose that can only be reached through more tiles to the north than the north number allows is out of reach for that piece.
- new: [remove]

### T0292
- what: text · #improvedFooter
- now: Area numbers + Roses
- new: [remove]

### T0294
- what: text · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: An area number fixes the size, the roses fix what the piece must hold.
- new: [remove]

### T0295
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: <b>Every place of the piece.</b> With few pieces the solver lists every place of the numbered piece; the rest of the board must still hold full rose sets.
- new: [remove]

### T0296
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_arearose · Shows when you click the i next to this rule.
- now: <b>Close enough.</b> A rose only counts as reachable when the piece plus the way there fits in the number.
- new: [remove]

### T0297
- what: text · #improvedFooter
- now: Gemini + Delta
- new: [remove]

### T0299
- what: text · #impInfo_combo_gemdelta · Shows when you click the i next to this rule.
- now: Gemini says same shape, Delta says different shape.
- new: [remove]

### T0300
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_gemdelta · Shows when you click the i next to this rule.
- now: <b>Never the same two pieces.</b> If one piece touches both a Gemini and a Delta wall, the pieces across them are different.
- new: [remove]

### T0301
- what: text · #improvedFooter
- now: One symbol per piece
- new: [remove]

### T0303
- what: text · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: With Solitude, roses, or all-different area numbers that fill the board, every tile belongs to exactly one symbol's piece.
- new: [remove]

### T0304
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>Who each tile belongs to.</b> Two touching tiles that can not belong to the same symbol get a wall; two that can only belong to the same one get a link. A tile too far from a symbol for its size can not belong to it.
- new: [remove]

### T0305
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>Minimums fill the board.</b> When the smallest pieces of all symbols add up to the board, every piece is that small: 20 compasses that each need 5 tiles on 100 tiles make every piece 5.
- new: [remove]

### T0306
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_combo_labels · Shows when you click the i next to this rule.
- now: <b>With Boxy.</b> Every rectangle a piece can still be must hold what it needs: a strip along the edge that does not reach all the roses it needs must grow wider to reach them. With Solitude, a rectangle with no symbol is dropped.
- new: [remove]

### T0307
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Custom
- new: =

### T0308
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Omits
- new: =

### T0310
- what: text · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: No piece may contain a banned shape (turned or flipped).
- new: No piece may contain a banned shape, this includes the banned shape itself.

### T0311
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Contains means inside.</b> Banning the 2x2 bans the P pentomino too. Two groups whose union would hold a banned shape get a wall: with a banned domino every edge is a wall.
- new: <b>Never create the shape.</b> If a link would create a banned shape then it is a wall. This is also true for two shapes which merging would create a banned shape.

### T0312
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_ban · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Biggest allowed piece.</b> If every shape of some size holds a banned shape, no piece can be that big: a banned domino makes every piece one tile. Bank shapes and polyominoes that hold one can not be used.
- new: <b>Biggest allowed piece.</b> Since banning a piece also bans every bigger piece that contains it. If every shape of some size holds a banned shape, no piece can be that big. banning the 1x3 and the W pentomino bans every piece of size 5, so every shape is size 4 or less.

### T0313
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Wally
- new: =

### T0315
- what: text · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: Every tile needs at least 2 neighbours that are not in its piece; the board edge and holes count as such neighbours. That is the same as: no piece may contain a T tetromino.
- new: Every tile needs at least 2 neighbours that are not in its piece and the board edge and holes count as such neighbours.

### T0316
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>At most 2 neighbours inside.</b> A tile can have at most 2 neighbours in its own piece, so once it has 2 links, its other sides are walls. Pieces stay thin: no T, no plus, no 2x2 with a tile sticking out.
- new: =

### T0317
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Placements.</b> A polyomino, bank shape or rectangle that holds a T is dropped: with Boxy every piece is a strip or a 2x2 block.
- new: [remove]

### T0318
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Gemini lines.</b> The two pieces of a Gemini wall have the same straight lines. If one side holds 4 tiles in a line and the other side can not get a new line of 4 anywhere (every try is refuted), the 4 must be the twin of a line the other side already has: next to a closed line of 5, it grows by exactly one tile.
- new: [this feels like a gemini rule, not a wally rule, it's mentioned in "same shape advanced"]

### T0319
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_wally · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Two ends per piece.</b> Every piece is a path with two ends (a tile with 3 walls), a ring, or a single tile. A piece never gets a third end, and once both its ends are known every other tile goes through. With two rose types and every rose a dead end (or Solitude with dead-end symbols), the ends are all used up: every piece starts and ends at its roses.
- new: <b>Two ends per piece.</b> Every piece is either a ring, or has two dead ends. If we know the amount of total pieces and the amount of dead ends is exactly twice that then no other place in the puzzle can be a dead end, and any wall that would make one is a link.

### T0320
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Heterogeneous
- new: =

### T0322
- what: text · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: Every piece has a different size.
- new: Every piece has a different size. A strickter kind of mismatch.

### T0323
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Fewer pieces.</b> Different sizes add up fast: 4 pieces need at least 1 + 2 + 3 + 4 = 10 tiles, so a board of 9 tiles has at most 3 pieces. A board that can not be split into different sizes (6 tiles with Precision 3) is impossible.
- new: <b>Fewer pieces.</b> Different sizes add up VERY fast, if a puzzle is of size 20 we know it will at most have 5 pieces as 1+2+3+4+5+6=21. anything mismatch does is done here but amplified, once a piece is done the size is removed from the pool.

### T0324
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_hetero · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>A size is used once.</b> Once a piece is finished, no other piece can have its size. Touching pieces differ in size too, so everything Size Separation finds applies as well.
- new: [remove]

### T0325
- what: text · #improvedFooter · Only shows when custom rules are on (button at the bottom of the page).
- now: Links
- new: =

### T0327
- what: text · #impInfo_links · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: A link joins two tiles: they are in the same piece. It is the opposite of a wall.
- new: A link just joins two tiles, it's a very basic mechanic that can be used in a lot of ways.

### T0328
- what: text (keep the <b>/<i> tags or drop them) · #impInfo_links · Shows when you click the i next to this rule. Only shows when custom rules are on (button at the bottom of the page).
- now: <b>Known from the start.</b> Linked tiles are one group before the solver starts, so every other rule uses that right away: two roses of the same type linked together are impossible, and a linked group already as big as the size limit is walled all round.
- new: <b>Simply known.</b> Linked tiles are one group before the solver starts, and that's basically it for that mechanic.
