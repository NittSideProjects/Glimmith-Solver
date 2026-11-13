# Why something is impossible

Short reasons the solver gives. They show in the solver result ("Impossible: …") and inside step-by-step explanations ("this breaks: …").

Left here: 109 to write, 0 to check again, 2 notes, 1 to put on the page. Done: 12.

Write after `- new:`. Leave it empty = not done yet. `=` = keep the text as it is. `[..]` anywhere = a note for Claude. `{1}`, `{2}` stand for values the page fills in: keep them.

### T0330
- what: message · WHY_TEXT › rose-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: rose windows are uneven, there are more of one type.
- new: rose windows are uneven, there are more of one type.

### T0331
- what: message · WHY_TEXT › rose-pair · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two roses of the same type are forced to be in one piece
- new: two roses of the same type are forced to be in one piece

### T0990
- what: message · WHY_TEXT › rose-grow · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece cannot reach a rose it still needs
- new: 

### T0991
- what: message · WHY_TEXT › rose-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a region closed in by walls has the wrong number of roses
- new: 

### T0332
- what: message · WHY_TEXT › rose-cut · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: more rose pieces must squeeze through a narrow passage than that passage has tiles
- new: more rose pieces must squeeze through a narrow passage than that passage has tiles

### T0333
- what: message · WHY_TEXT › area-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: an area number has no place left to satisfy it's size
- new: an area number has no place left to satisfy it's size

### T0992
- what: message · WHY_TEXT › gd-clash · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a gemini wall and a delta wall end up between the same two pieces
- new: 

### T0334
- what: message · WHY_TEXT › diff-clash · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two piece are forced to go over two difference walls, and those two have different numbers
- new: two piece are forced to go over two difference walls, and those two have different numbers

### T0335
- what: message · WHY_TEXT › diff-small · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the few small pieces (one per shape) can not reach every difference wall
- new: [explain]

### T0336
- what: message · WHY_TEXT › rose-cover · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the rose groups can't be split into pieces with one rose of every type
- new: the rose groups can't be split into pieces with one rose of every type

### T0337
- what: message · WHY_TEXT › label · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: some tile can not belong to the piece of any symbol / number
- new: [explain]

### T0338
- what: message · WHY_TEXT › box-hall · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: There is a group of n tiles that can only hold n-1 possible rectangle shapes, one of them will break
- new: There is a group of n tiles that can only hold n-1 possible rectangle shapes, one of them will break

### T0339
- what: message · WHY_TEXT › box-all · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the total puzzle area tells us every rectangle that can be used must be used, but one of them has no placement left
- new: the total puzzle area tells us every rectangle that can be used must be used, but one of them has no placement left

### T0340
- what: message · WHY_TEXT › place-probe · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: an area number (or its copy across a gemini) has no possible way to be placed
- new: an area number (or its copy across a gemini) has no possible way to be placed

### T0341
- what: message · WHY_TEXT › two-piece · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: knowing the puzzle is exaclty 2 shapes, there isn't a way to group the tiles and fit the clues.
- new: knowing the puzzle is exaclty 2 shapes, there isn't a way to group the tiles and fit the clues.

### T0342
- what: message · WHY_TEXT › mismatch-hall · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: There is a group of n tiles that can only hold n-1 possible shapes, one of them will break
- new: There is a group of n tiles that can only hold n-1 possible shapes, one of them will break

### T0343
- what: message · WHY_TEXT › cmp-box · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: no rectangle fits the numbers of a compass
- new: =

### T0993
- what: message · WHY_TEXT › gemini-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a shape near a gemini is a shape that the other side can't be, or a delta that the other side must be
- new: 

### T0345
- what: message · WHY_TEXT › region-merge · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two groups must be one piece: as two pieces they would need more tiles than their closed-in region has
- new: two groups that needs to merge can't merge due to the

### T0994
- what: message · WHY_TEXT › size-cut · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a part cut off by one tile can not be covered by pieces of the one size every piece has
- new: 

### T0995
- what: message · WHY_TEXT › stamp-size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a polyomino stamp does not fit the size rules or another symbol
- new: 

### T0346
- what: message · WHY_TEXT › stamp-shape · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two different stamps end up in one piece
- new: 

### T0996
- what: message · WHY_TEXT › shape-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece can no longer be the shape of its stamp
- new: 

### T0997
- what: message · WHY_TEXT › bank-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece can no longer be any shape of the bank
- new: 

### T0347
- what: message · WHY_TEXT › ban-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: tiles that must share a piece already contain a banned shape
- new: 

### T0348
- what: message · WHY_TEXT › solitude-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Solitude every piece holds exactly one symbol, and the symbols on the grid do not allow that
- new: 

### T0349
- what: message · WHY_TEXT › solitude-pair · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two symbols end up in one piece, but Solitude allows one symbol per piece
- new: 

### T0998
- what: message · WHY_TEXT › solitude-grow · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece has no symbol yet and cannot reach one
- new: 

### T0999
- what: message · WHY_TEXT › solitude-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a region closed in by walls does not hold one symbol per piece
- new: 

### T0350
- what: message · WHY_TEXT › area-hall · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: pieces that must differ in size (or share one size) need more tiles than their region has
- new: 

### T0351
- what: message · WHY_TEXT › boxy-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Boxy the tiles that must share a piece need a rectangle around them, and it has a hole or a wall in it
- new: 

### T0352
- what: message · WHY_TEXT › boxy-corner · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Boxy walls run straight: at an inner corner no wall may end in the open or turn a corner
- new: 

### T1000
- what: message · WHY_TEXT › boxy-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece that must be a rectangle has no rectangle left to be
- new: 

### T0353
- what: message · WHY_TEXT › boxy-line · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Boxy a piece of a prime number of tiles can only be a 1 x n strip, and there is no room for one
- new: 

### T0354
- what: message · WHY_TEXT › nonbox-grow · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Non-boxy a group that is a rectangle so far must grow, and it has no way to
- new: 

### T0355
- what: message · WHY_TEXT › nonbox-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Non-boxy a group that is a rectangle so far is already as big as a piece can be
- new: 

### T0356
- what: message · WHY_TEXT › nonbox-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with Non-boxy a region closed in by walls can only hold rectangles (a straight strip, or one piece that is a rectangle)
- new: 

### T0357
- what: message · WHY_TEXT › box-both · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: Boxy and Non-boxy together: every piece would have to be a rectangle and not be one
- new: 

### T1001
- what: message · WHY_TEXT › tower-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a watchtower counts more pieces than it can touch, or the walls and links decided round it leave no way to count its number
- new: 

### T0358
- what: message · WHY_TEXT › tower-wall · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the pieces round a watchtower that must all be different were forced together
- new: 

### T0359
- what: message · WHY_TEXT › tower-link · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the tiles round a watchtower that must be one piece were separated
- new: 

### T1002
- what: message · WHY_TEXT › tower-wrap · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a watchtower can only reach its number if one piece wraps round the corner, and no piece can be that big or find the way
- new: 

### T0360
- what: message · WHY_TEXT › bank-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the board can not be covered by pieces with the sizes of the shapes in the bank
- new: 

### T1003
- what: message · WHY_TEXT › bank-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a region closed in by walls can not be covered by pieces with the sizes of the shapes in the bank
- new: 

### T1004
- what: message · WHY_TEXT › bank-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece has no placement of any bank shape left
- new: 

### T0361
- what: message · WHY_TEXT › bank-block · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: every shape of the bank holds a 2 x 2 block, and a tile has none within reach
- new: 

### T0362
- what: message · WHY_TEXT › bank-bend · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: every shape of the bank has a bend, and a tile has none within reach
- new: 

### T1005
- what: message · WHY_TEXT › pal-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a palisade can not get its number of walls from the sides it has left
- new: 

### T0363
- what: message · WHY_TEXT › pal-pair · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: palisades next to each other can not all get their number of walls
- new: 

### T1006
- what: message · WHY_TEXT › pal-size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a palisade needs a bigger piece than the size rules allow (or a 4 that is not alone)
- new: 

### T0364
- what: message · WHY_TEXT › pal-two · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with only two pieces the walls round a palisade do not add up
- new: 

### T1007
- what: message · WHY_TEXT › wally-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a tile would get 3 neighbours in its own piece (Wally: no T tetromino)
- new: 

### T0365
- what: message · WHY_TEXT › wally-two · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with only two pieces the walls round a tile do not add up (Wally)
- new: 

### T0366
- what: message · WHY_TEXT › gemini-anchor · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the two pieces of a gemini wall each have one straight line of that length, so the copy sends one onto the other: of the few ways that do, the others fail
- new: 

### T1008
- what: message · WHY_TEXT › wally-ends · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece is a path with two ends (Wally): it can not get a third end, or the ends already known use up every end the pieces can have
- new: 

### T0367
- what: message · WHY_TEXT › wally-line · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the two pieces of a gemini wall have the same straight lines: this line can only end with a length its twin can have
- new: 

### T0368
- what: message · WHY_TEXT › clue-join · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two clues can not be in different pieces
- new: 

### T0369
- what: message · WHY_TEXT › clue-apart · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two clues can not be in the same piece
- new: 

### T0370
- what: message · WHY_TEXT › hetero-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the board can not be split into pieces of all different sizes (Heterogeneous)
- new: 

### T0371
- what: message · WHY_TEXT › hetero-size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two pieces would need the same size (Heterogeneous)
- new: 

### T0372
- what: message · WHY_TEXT › bri-vertex · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: four walls would meet at one corner (Bricky)
- new: 

### T0373
- what: message · WHY_TEXT › loo-parity · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: an odd number of walls would meet at one corner (Loopy: the pieces must be two-colourable)
- new: 

### T1009
- what: message · WHY_TEXT › cmp-reach · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a compass piece could not reach enough tiles on one of its sides (or enough tiles at all)
- new: 

### T0374
- what: message · WHY_TEXT › cmp-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: no way is left for a compass piece to have all its numbers
- new: 

### T0375
- what: message · WHY_TEXT › cmp-crowd · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the compasses want more tiles than the board has for them (however they are split into pieces)
- new: 

### T1010
- what: message · WHY_TEXT › cmp-excl · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a tile can not be in the piece of a compass (assuming it is breaks something)
- new: 

### T0376
- what: message · WHY_TEXT › gemini-shape · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two different stamp shapes are pinned on the two sides of a same-shape wall
- new: 

### T0377
- what: message · WHY_TEXT › delta-shape · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the same stamp shape is pinned on both sides of a different-shape wall
- new: 

### T0378
- what: message · WHY_TEXT › ban-size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: every shape of a size the rules need contains a banned shape
- new: 

### T0379
- what: message · WHY_TEXT › stamp-pair · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two stamps that cannot share a piece are forced together
- new: 

### T1011
- what: message · WHY_TEXT › stamp-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a polyomino stamp has nowhere left to go
- new: 

### T0380
- what: message · WHY_TEXT › mingle-area-single · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: only one piece size is possible, so no two pieces may touch
- new: 

### T1012
- what: message · WHY_TEXT › mingle-area-clash · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece has no size left that differs from all its neighbours
- new: 

### T0381
- what: message · WHY_TEXT › mingle-area-pocket · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: tiles closed in by pieces of known size are too few for a piece of their own, and joining any of those pieces breaks Mingle Area
- new: 

### T1013
- what: message · WHY_TEXT › mingle-area-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece of known size has no place left where it touches no other piece of that size
- new: 

### T0382
- what: message · WHY_TEXT › mingle-area-connect · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the tiles that share the one big piece can no longer be joined up
- new: 

### T0383
- what: message · WHY_TEXT › gemini-iso · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the two pieces of a gemini wall can no longer be the same shape
- new: 

### T0384
- what: message · WHY_TEXT › mingle-area-none · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: no piece can have an allowed size
- new: 

### T0385
- what: message · WHY_TEXT › mingle-area-link · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two neighbouring tiles must have the same size, so they must be one piece
- new: 

### T0386
- what: message · WHY_TEXT › mingle-area-merge · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two groups that cannot have the same size are forced into one piece
- new: 

### T0387
- what: message · WHY_TEXT › mingle-area-parity · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with two sizes only, the neighbouring pieces cannot alternate
- new: 

### T0388
- what: message · WHY_TEXT › mingle-area-corner · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with two sizes only, three pieces cannot meet at a corner
- new: 

### T0389
- what: message · WHY_TEXT › mingle-shape-single · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: only one piece shape is possible, so no two pieces may touch
- new: 

### T1014
- what: message · WHY_TEXT › mingle-shape-clash · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece has no shape left that differs from all its neighbours
- new: 

### T0390
- what: message · WHY_TEXT › mingle-shape-none · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: no piece can have an allowed shape
- new: 

### T0391
- what: message · WHY_TEXT › mingle-shape-link · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two neighbouring tiles must have the same shape, so they must be one piece
- new: 

### T0392
- what: message · WHY_TEXT › mingle-shape-merge · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two groups that cannot have the same shape are forced into one piece
- new: 

### T0393
- what: message · WHY_TEXT › mingle-shape-parity · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with two shapes only, the neighbouring pieces cannot alternate
- new: 

### T0394
- what: message · WHY_TEXT › mingle-shape-corner · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with two shapes only, three pieces cannot meet at a corner
- new: 

### T0395
- what: message · WHY_TEXT › match-size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: every piece must have the same size, and no size works for the whole board
- new: 

### T0396
- what: message · WHY_TEXT › match-fit · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: no single shape fits every group of tiles that belongs together
- new: 

### T1015
- what: message · WHY_TEXT › match-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a region closed in by walls holds exactly one piece
- new: 

### T0397
- what: message · WHY_TEXT › match-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the one shape every piece must have has no place left
- new: 

### T0398
- what: message · WHY_TEXT › match-compass · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: every piece must have the same shape, and no shape can be the piece of every compass
- new: 

### T1016
- what: message · WHY_TEXT › match-hole · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece that closes around empty cells gives every piece that hole, and the board has too few such holes
- new: 

### T0399
- what: message · WHY_TEXT › cross · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two pieces must each join two parts, and the parts lie round the free area in the order A, B, A, B: the links would cross
- new: 

### T0400
- what: message · WHY_TEXT › pair-apart · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the tile joining that group leads to a contradiction, so they are different pieces
- new: 

### T0401
- what: message · WHY_TEXT › pair-join · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the two groups as different pieces lead to a contradiction, so they are one piece
- new: 

### T0402
- what: message · WHY_TEXT › mismatch-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: there are not enough different shapes to cover the board
- new: 

### T0403
- what: message · WHY_TEXT › mismatch-stamp · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two stamps of the same shape must be one piece, because no two pieces may share a shape
- new: 

### T0404
- what: message · WHY_TEXT › mismatch-link · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: two groups that can only be the same shape must be one piece, because no two pieces may share a shape
- new: 

### T1017
- what: message · WHY_TEXT › mismatch-clash · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece has no shape left that the other pieces do not already use
- new: 

### T0405
- what: message · WHY_TEXT › mismatch-place · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the one shape this piece must have has no place left
- new: 

### T0406
- what: message · WHY_TEXT › mismatch-pair · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: pieces that must all differ have fewer shapes between them than there are pieces
- new: 

### T0407
- what: message · WHY_TEXT › match-mismatch · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: Match and Mismatch together allow only one piece, so the whole board is one piece
- new: 

### T0408
- what: message · WHY_TEXT › range-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the board can not be covered by pieces of the allowed sizes
- new: 

### T1018
- what: message · WHY_TEXT › range-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a region closed in by walls can not be covered by pieces of the allowed sizes
- new: 

### T1019
- what: message · WHY_TEXT › min-grow · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece is smaller than the minimum and has only one way to grow
- new: 

### T1020
- what: message · WHY_TEXT › min-reach · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece can not reach as many tiles as the minimum asks for
- new: 

### T0409
- what: message · WHY_TEXT › area-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the numbered pieces do not fit into the tiles of a region closed in by walls
- new: 

### T0410
- what: message · WHY_TEXT › area-sum · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the area numbers leave no (or too few) tiles for a piece without a number
- new: 

### T0411
- what: message · WHY_TEXT › bridge-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the tiles behind a single connection cannot be covered by whole pieces any other way
- new: 

### T0412
- what: message · WHY_TEXT › euler-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the walls reaching the border or branching would make more pieces than the puzzle has
- new: 

### T0413
- what: message · WHY_TEXT › colour-count · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: with so few pieces the walls colour the groups, and two groups of one colour have to be one piece
- new: 

### T0414
- what: message · WHY_TEXT › match-iso · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the equal pieces are mirror images / rotations of each other, which fixes which tile belongs to which piece
- new: 

### T0415
- what: message · WHY_TEXT › area-region · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the numbered pieces of a region closed in by walls leave no other way
- new: 

### T0416
- what: message · WHY_TEXT › area-rel · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the walls that compare sizes leave a piece no size it can have
- new: 

### T0417
- what: message · WHY_TEXT › area-chain · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the pieces on a chain of walls that compare sizes need more tiles than their region has
- new: 

### T0418
- what: message · WHY_TEXT › area-parity · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: the walls that differ by N need an odd and an even number of tiles on the same piece
- new: 

### T1021
- what: message · WHY_TEXT › size · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a piece can not have a size the size rules allow
- new: 

### T1022
- what: message · WHY_TEXT › wall-inside · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a wall runs inside one piece
- new: 

### T0419
- what: message · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: {1} (Heterogeneous: touching pieces differ in size too)
- new: 

### T0420
- what: message · deduceSolve › reason · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: contradictory walls
- new: 

### T1023
- what: message · deduceSolve › reason · Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.
- now: a deduction contradicted an earlier one{1}
- new: 
