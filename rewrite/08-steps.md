# Step-by-step reasoning

The step-by-step view: step titles, explanations and captions.

Left here: 315 to write, 0 to check again, 0 notes, 4 to put on the page. Done: 2.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0117
- what: text · #stepsViewer · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve).
- now: Step-by-step reasoning
- new: =

### T0119
- what: tooltip · #stepsFirst · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve). Tooltip: shows when you hover over it.
- now: First step (Home)
- new: First step

### T0121
- what: tooltip · #stepsPrev · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve). Tooltip: shows when you hover over it.
- now: Previous step (left arrow)
- new: Previous step

### T0123
- what: tooltip · #stepsNext · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve). Tooltip: shows when you hover over it.
- now: Next step (right arrow)
- new: Next step

### T0125
- what: tooltip · #stepsLast · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve). Tooltip: shows when you hover over it.
- now: Last step (End)
- new: Last step

### T1136
- what: text · #stepsCasesBtn · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve).
- now: Show cases
- new: 

### T0922
- what: text · #stepsExampleBtn · In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve).
- now: Show example
- new: Show example

### T0560
- what: message · STEP_INFO › basic · Title or explanation of a step in the step-by-step view.
- now: Follows from what is known
- new: 

### T0561
- what: message · STEP_INFO › basic · Title or explanation of a step in the step-by-step view.
- now: These two groups already have a wall between them somewhere else, so they are different pieces: every edge between them is a wall.
- new: 

### T0562
- what: message · STEP_INFO › basic · Title or explanation of a step in the step-by-step view.
- now: These two tiles are already known to be in one piece, so the edge between them is open.
- new: 

### T0563
- what: message · STEP_INFO › size · Title or explanation of a step in the step-by-step view.
- now: Too big for the size rules
- new: 

### T0564
- what: message · STEP_INFO › size · Title or explanation of a step in the step-by-step view.
- now: Joined, these two groups would have more tiles than the size rules allow, so there is a wall between them.
- new: 

### T0565
- what: message · STEP_INFO › grow · Title or explanation of a step in the step-by-step view.
- now: Forced growth
- new: 

### T0566
- what: message · STEP_INFO › grow · Title or explanation of a step in the step-by-step view.
- now: This group is too small to be a whole piece yet, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.
- new: 

### T0567
- what: message · STEP_INFO › min-grow · Title or explanation of a step in the step-by-step view.
- now: Forced growth (Minimum)
- new: 

### T0568
- what: message · STEP_INFO › min-grow · Title or explanation of a step in the step-by-step view.
- now: This group has fewer tiles than the Minimum, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.
- new: 

### T0569
- what: message · STEP_INFO › reach · Title or explanation of a step in the step-by-step view.
- now: Reach
- new: 

### T0570
- what: message · STEP_INFO › reach · Title or explanation of a step in the step-by-step view.
- now: This group needs this edge to reach enough tiles for a piece of an allowed size, so the two tiles are in one piece.
- new: 

### T0571
- what: message · STEP_INFO › min-reach · Title or explanation of a step in the step-by-step view.
- now: Reach (Minimum)
- new: 

### T0572
- what: message · STEP_INFO › min-reach · Title or explanation of a step in the step-by-step view.
- now: This group needs this edge to reach the Minimum number of tiles, so the two tiles are in one piece.
- new: 

### T0573
- what: message · STEP_INFO › rose-grow · Title or explanation of a step in the step-by-step view.
- now: Roses: keep growing
- new: 

### T0574
- what: message · STEP_INFO › rose-grow · Title or explanation of a step in the step-by-step view.
- now: This group still misses a rose type, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.
- new: 

### T0575
- what: message · STEP_INFO › rose-reach · Title or explanation of a step in the step-by-step view.
- now: Roses: the way to a missing rose
- new: 

### T0898
- what: message · STEP_INFO › rose-reach · Title or explanation of a step in the step-by-step view.
- now: This group still misses a rose type, and every rose of that type it can reach within the size limit is through this edge. So the two tiles are in one piece.
- new: 

### T0576
- what: message · STEP_INFO › rose-pair · Title or explanation of a step in the step-by-step view.
- now: Roses: one of each type per piece
- new: 

### T0577
- what: message · STEP_INFO › rose-pair · Title or explanation of a step in the step-by-step view.
- now: Each side holds a rose of the same type, and a piece holds only one rose of each type. So they are different pieces, with a wall between them.
- new: 

### T0578
- what: message · STEP_INFO › rose-cut · Title or explanation of a step in the step-by-step view.
- now: Roses: narrow passage
- new: 

### T1024
- what: message · STEP_INFO › rose-cut · Title or explanation of a step in the step-by-step view.
- now: A few tiles are the only way into one part of the board. The roses in that part need as many different pieces to leave it as the passage has tiles, so each passage tile belongs to its own one of those pieces, and each of those pieces gets the roses it needs inside the part.
- new: 

### T0579
- what: message · STEP_INFO › rose-region · Title or explanation of a step in the step-by-step view.
- now: Roses: closed-in area
- new: 

### T0580
- what: message · STEP_INFO › rose-region · Title or explanation of a step in the step-by-step view.
- now: An area closed in by walls holds, for each rose type, one rose per piece. So its roses give the number of pieces in it: with one rose of each type it is a single piece.
- new: 

### T0581
- what: message · STEP_INFO › stamp-place · Title or explanation of a step in the step-by-step view.
- now: Polyomino: every place the shape fits
- new: 

### T0582
- what: message · STEP_INFO › stamp-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every place where the polyomino's shape still fits. This edge is outside all of them, so it is a wall.
- new: 

### T0583
- what: message · STEP_INFO › stamp-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every place where the polyomino's shape still fits. This edge is inside all of them, so the two tiles are in one piece.
- new: 

### T0584
- what: message · STEP_INFO › stamp-size · Title or explanation of a step in the step-by-step view.
- now: Joined, these two groups would have more tiles than the polyomino's shape, so there is a wall between them.
- new: 

### T0585
- what: message · STEP_INFO › stamp-shape · Title or explanation of a step in the step-by-step view.
- now: Joined, these two groups would fit no turn or flip of the polyomino's shape, so there is a wall between them.
- new: 

### T0586
- what: message · STEP_INFO › stamp-pair · Title or explanation of a step in the step-by-step view.
- now: Two polyominoes of the same shape, two pieces
- new: 

### T0587
- what: message · STEP_INFO › stamp-pair · Title or explanation of a step in the step-by-step view.
- now: Two polyominoes of the same shape share a piece only when one placement of the shape covers both. Every placement leaves one of them out, so they are different pieces, with a wall between them.
- new: 

### T0588
- what: message · STEP_INFO › shape-fit · Title or explanation of a step in the step-by-step view.
- now: Must still fit the shape
- new: 

### T0589
- what: message · STEP_INFO › shape-fit · Title or explanation of a step in the step-by-step view.
- now: Joined, these two groups would no longer fit inside the polyomino's shape, so there is a wall between them.
- new: 

### T0590
- what: message · STEP_INFO › bank-fit · Title or explanation of a step in the step-by-step view.
- now: Must still fit a bank shape
- new: 

### T0591
- what: message · STEP_INFO › bank-fit · Title or explanation of a step in the step-by-step view.
- now: Joined, these two groups would fit in none of the bank shapes (in any turn or flip), so there is a wall between them.
- new: 

### T0592
- what: message · STEP_INFO › bank-place · Title or explanation of a step in the step-by-step view.
- now: Shape bank: every place a shape fits
- new: 

### T0593
- what: message · STEP_INFO › bank-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every placement of every bank shape (all turns and flips) that still fits around this group. This edge is outside all of them, so it is a wall.
- new: 

### T0594
- what: message · STEP_INFO › bank-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every placement of every bank shape (all turns and flips) that still fits around this group. This edge is inside all of them, so the two tiles are in one piece.
- new: 

### T0595
- what: message · STEP_INFO › bank-region · Title or explanation of a step in the step-by-step view.
- now: Shape bank: closed-in area
- new: 

### T0596
- what: message · STEP_INFO › bank-region · Title or explanation of a step in the step-by-step view.
- now: An area closed in by walls is covered by whole pieces with the sizes of the bank shapes, and only one way to do that is left.
- new: 

### T0597
- what: message · STEP_INFO › bank-bend · Title or explanation of a step in the step-by-step view.
- now: Shape bank: every shape has a bend
- new: 

### T0598
- what: message · STEP_INFO › bank-bend · Title or explanation of a step in the step-by-step view.
- now: Every bank shape has a bend, so every piece has one.
- new: 

### T0599
- what: message · STEP_INFO › bank-block · Title or explanation of a step in the step-by-step view.
- now: Shape bank: every shape has a 2x2 block
- new: 

### T0600
- what: message · STEP_INFO › bank-block · Title or explanation of a step in the step-by-step view.
- now: Every bank shape contains a 2x2 block, so every piece contains one.
- new: 

### T0601
- what: message · STEP_INFO › bridge-count · Title or explanation of a step in the step-by-step view.
- now: One connection between two sides
- new: 

### T0602
- what: message · STEP_INFO › bridge-count · Title or explanation of a step in the step-by-step view.
- now: The board is held together here by a single connection. With one piece crossing it, the tiles left on each side could only be covered by pieces of sizes the rules forbid. So it is a wall.
- new: 

### T0603
- what: message · STEP_INFO › bridge-count · Title or explanation of a step in the step-by-step view.
- now: The board is held together here by a single connection. With a wall here, each side would need to be covered by whole pieces on its own, and its number of tiles makes that impossible. So one piece crosses it: the two tiles are in one piece.
- new: 

### T0604
- what: message · STEP_INFO › area-sum · Title or explanation of a step in the step-by-step view.
- now: Area numbers cover every tile
- new: 

### T0605
- what: message · STEP_INFO › area-sum · Title or explanation of a step in the step-by-step view.
- now: The area numbers of this region add up to all its tiles, so every tile belongs to a numbered piece.
- new: 

### T0606
- what: message · STEP_INFO › area-region · Title or explanation of a step in the step-by-step view.
- now: Area numbers in a closed-in area
- new: 

### T0607
- what: message · STEP_INFO › area-region · Title or explanation of a step in the step-by-step view.
- now: This area is closed in by walls, and its area numbers fit in it in only one way.
- new: 

### T0608
- what: message · STEP_INFO › area-rel · Title or explanation of a step in the step-by-step view.
- now: Walls that compare sizes
- new: 

### T0609
- what: message · STEP_INFO › area-rel · Title or explanation of a step in the step-by-step view.
- now: The walls that compare sizes (<, >, ±N, same) leave only some sizes for the pieces on each side.
- new: 

### T0610
- what: message · STEP_INFO › range-region · Title or explanation of a step in the step-by-step view.
- now: Closed-in area: whole pieces only
- new: 

### T0611
- what: message · STEP_INFO › range-region · Title or explanation of a step in the step-by-step view.
- now: An area closed in by walls is covered by whole pieces of the allowed sizes, and only one choice for this edge allows that.
- new: 

### T0612
- what: message · STEP_INFO › euler-count · Title or explanation of a step in the step-by-step view.
- now: Wall budget
- new: 

### T0613
- what: message · STEP_INFO › euler-count · Title or explanation of a step in the step-by-step view.
- now: Few pieces are allowed, and that limits the walls: every wall end on the outline and every corner where walls branch costs one, and the walls already placed use the whole budget. A wall here would cost one more, so the two tiles are in one piece.
- new: 

### T0614
- what: message · STEP_INFO › colour-count · Title or explanation of a step in the step-by-step view.
- now: Colour count
- new: 

### T0615
- what: message · STEP_INFO › colour-count · Title or explanation of a step in the step-by-step view.
- now: Few pieces are allowed, so the groups can be coloured with that many colours, with different colours for groups known to be different pieces. Two groups that always get the same colour are one piece; two that always get different colours have a wall between them.
- new: 

### T0616
- what: message · STEP_INFO › match-iso · Title or explanation of a step in the step-by-step view.
- now: Match: equal pieces
- new: 

### T0617
- what: message · STEP_INFO › match-iso · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same shape, so a wall inside one piece has its copy in the other.
- new: 

### T0618
- what: message · STEP_INFO › match-place · Title or explanation of a step in the step-by-step view.
- now: Match: every place the shape fits
- new: 

### T0619
- what: message · STEP_INFO › match-place · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same shape, and one shape is left. The solver listed every place it still fits around this group. This edge is outside all of them, so it is a wall.
- new: 

### T0620
- what: message · STEP_INFO › match-place · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same shape, and one shape is left. The solver listed every place it still fits around this group. This edge is inside all of them, so the two tiles are in one piece.
- new: 

### T0621
- what: message · STEP_INFO › match-region · Title or explanation of a step in the step-by-step view.
- now: Match: closed-in area
- new: 

### T0622
- what: message · STEP_INFO › match-region · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same size, and this area closed in by walls holds exactly that many tiles. So it is a single piece, and every edge inside it is open.
- new: 

### T0623
- what: message · STEP_INFO › match-fit · Title or explanation of a step in the step-by-step view.
- now: Match: one shape for every group
- new: 

### T0624
- what: message · STEP_INFO › match-fit · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same shape, so that shape has to fit every group. Joined, these two groups would leave no shape that fits all the groups, so there is a wall between them.
- new: 

### T0625
- what: message · STEP_INFO › match-mismatch · Title or explanation of a step in the step-by-step view.
- now: Match and Mismatch together
- new: 

### T0626
- what: message · STEP_INFO › match-mismatch · Title or explanation of a step in the step-by-step view.
- now: Match makes every piece the same and Mismatch makes every piece different. Both hold only with a single piece, so the whole board is one piece.
- new: 

### T0627
- what: message · STEP_INFO › mismatch-place · Title or explanation of a step in the step-by-step view.
- now: Mismatch: every place for the only shape left
- new: 

### T0628
- what: message · STEP_INFO › mismatch-place · Title or explanation of a step in the step-by-step view.
- now: This group can only become one shape. The solver listed every place where that shape still fits. This edge is outside all of them, so it is a wall.
- new: 

### T0629
- what: message · STEP_INFO › mismatch-place · Title or explanation of a step in the step-by-step view.
- now: This group can only become one shape. The solver listed every place where that shape still fits. This edge is inside all of them, so the two tiles are in one piece.
- new: 

### T0630
- what: message · STEP_INFO › mismatch-stamp · Title or explanation of a step in the step-by-step view.
- now: Mismatch: same polyomino, one piece
- new: 

### T0631
- what: message · STEP_INFO › mismatch-stamp · Title or explanation of a step in the step-by-step view.
- now: No two pieces share a shape, and these two polyominoes have the same shape, so they are in one piece.
- new: 

### T0632
- what: message · STEP_INFO › mismatch-link · Title or explanation of a step in the step-by-step view.
- now: Mismatch: same shape, one piece
- new: 

### T0633
- what: message · STEP_INFO › mismatch-link · Title or explanation of a step in the step-by-step view.
- now: No two pieces share a shape, and these two groups can only become the same shape, so they are one piece.
- new: 

### T0634
- what: message · STEP_INFO › mingle-area-link · Title or explanation of a step in the step-by-step view.
- now: Size Separation: same size side by side
- new: 

### T0635
- what: message · STEP_INFO › mingle-area-link · Title or explanation of a step in the step-by-step view.
- now: Touching pieces always have different sizes. The pieces of these two neighbouring tiles are both pinned to the same size, so they are one piece.
- new: 

### T0636
- what: message · STEP_INFO › mingle-shape-link · Title or explanation of a step in the step-by-step view.
- now: Mingle Shape: same shape side by side
- new: 

### T0637
- what: message · STEP_INFO › mingle-shape-link · Title or explanation of a step in the step-by-step view.
- now: Touching pieces always have different shapes. The pieces of these two neighbouring tiles are both pinned to the same shape, so they are one piece.
- new: 

### T0638
- what: message · STEP_INFO › mingle-area-merge · Title or explanation of a step in the step-by-step view.
- now: Size Separation: different sizes
- new: 

### T0639
- what: message · STEP_INFO › mingle-area-merge · Title or explanation of a step in the step-by-step view.
- now: These two groups can only end up with different sizes, so they are different pieces, with a wall between them.
- new: 

### T0640
- what: message · STEP_INFO › mingle-shape-merge · Title or explanation of a step in the step-by-step view.
- now: Mingle Shape: different shapes
- new: 

### T0641
- what: message · STEP_INFO › mingle-shape-merge · Title or explanation of a step in the step-by-step view.
- now: These two groups can only end up with different shapes, so they are different pieces, with a wall between them.
- new: 

### T0642
- what: message · STEP_INFO › mingle-area-parity · Title or explanation of a step in the step-by-step view.
- now: Size Separation: two sizes alternate
- new: 

### T0643
- what: message · STEP_INFO › mingle-area-parity · Title or explanation of a step in the step-by-step view.
- now: Only two sizes are possible, and touching pieces have different sizes, so the sizes alternate across every wall like a chessboard. Counting the walls on the chain between these tiles shows whether their pieces have the same size.
- new: 

### T0644
- what: message · STEP_INFO › mingle-shape-parity · Title or explanation of a step in the step-by-step view.
- now: Mingle Shape: two shapes alternate
- new: 

### T0645
- what: message · STEP_INFO › mingle-shape-parity · Title or explanation of a step in the step-by-step view.
- now: Only two shapes are possible, and touching pieces have different shapes, so the shapes alternate across every wall like a chessboard. Counting the walls on the chain between these tiles shows whether their pieces have the same shape.
- new: 

### T0646
- what: message · STEP_INFO › solitude-grow · Title or explanation of a step in the step-by-step view.
- now: Solitude: keep growing
- new: 

### T0647
- what: message · STEP_INFO › solitude-grow · Title or explanation of a step in the step-by-step view.
- now: This group has no symbol yet, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.
- new: 

### T0648
- what: message · STEP_INFO › solitude-reach · Title or explanation of a step in the step-by-step view.
- now: Solitude: the way to a symbol
- new: 

### T0899
- what: message · STEP_INFO › solitude-reach · Title or explanation of a step in the step-by-step view.
- now: Every symbol this group can still reach is through this edge, so the two tiles are in one piece.
- new: 

### T0649
- what: message · STEP_INFO › solitude-pair · Title or explanation of a step in the step-by-step view.
- now: Solitude: one symbol per piece
- new: 

### T0650
- what: message · STEP_INFO › solitude-pair · Title or explanation of a step in the step-by-step view.
- now: Each piece holds exactly one symbol, so these two symbols are in different pieces, with a wall between them.
- new: 

### T0651
- what: message · STEP_INFO › solitude-region · Title or explanation of a step in the step-by-step view.
- now: Solitude: closed-in area
- new: 

### T0652
- what: message · STEP_INFO › solitude-region · Title or explanation of a step in the step-by-step view.
- now: Each piece holds exactly one symbol, so an area closed in by walls has as many pieces as symbols: with one symbol it is a single piece.
- new: 

### T0653
- what: message · STEP_INFO › boxy-place · Title or explanation of a step in the step-by-step view.
- now: Boxy: every rectangle that fits
- new: 

### T0654
- what: message · STEP_INFO › boxy-place · Title or explanation of a step in the step-by-step view.
- now: Every piece is a rectangle. The solver listed every rectangle of an allowed size that holds this group's tiles. This edge is outside all of them, so it is a wall.
- new: 

### T0655
- what: message · STEP_INFO › boxy-place · Title or explanation of a step in the step-by-step view.
- now: Every piece is a rectangle. The solver listed every rectangle of an allowed size that holds this group's tiles. This edge is inside all of them, so the two tiles are in one piece.
- new: 

### T0656
- what: message · STEP_INFO › boxy-line · Title or explanation of a step in the step-by-step view.
- now: Boxy: a prime size is a strip
- new: 

### T0909
- what: message · STEP_INFO › boxy-line · Title or explanation of a step in the step-by-step view.
- now: Every piece is a rectangle, and a rectangle with a prime number of tiles is a straight strip. These tiles are already in a row, so their strip runs along that row.
- new: 

### T0657
- what: message · STEP_INFO › boxy-corner · Title or explanation of a step in the step-by-step view.
- now: Boxy: walls run straight
- new: 

### T0658
- what: message · STEP_INFO › boxy-corner · Title or explanation of a step in the step-by-step view.
- now: Every piece is a rectangle, so at every inner corner the walls run straight through, make a T or a cross, or there are none. The walls already at this corner leave one choice.
- new: 

### T0659
- what: message · STEP_INFO › boxy-fill · Title or explanation of a step in the step-by-step view.
- now: Boxy: fill the rectangle
- new: 

### T0660
- what: message · STEP_INFO › boxy-fill · Title or explanation of a step in the step-by-step view.
- now: Every piece is a rectangle, so everything inside the smallest rectangle around these tiles belongs to their piece.
- new: 

### T0661
- what: message · STEP_INFO › nonbox-grow · Title or explanation of a step in the step-by-step view.
- now: Non-boxy: keep growing
- new: 

### T0662
- what: message · STEP_INFO › nonbox-grow · Title or explanation of a step in the step-by-step view.
- now: No piece is a rectangle. This group is still a rectangle, and this edge is its only way out, so the piece grows through it: the two tiles are in one piece.
- new: 

### T0663
- what: message · STEP_INFO › pal-wall · Title or explanation of a step in the step-by-step view.
- now: Palisade
- new: 

### T0664
- what: message · STEP_INFO › pal-wall · Title or explanation of a step in the step-by-step view.
- now: The solver tried every way to give this palisade its number of walls, with the walls and links already known. In all of them this side is a wall.
- new: 

### T0665
- what: message · STEP_INFO › pal-link · Title or explanation of a step in the step-by-step view.
- now: The solver tried every way to give this palisade its number of walls, with the walls and links already known. In all of them this side is open, so the two tiles are in one piece.
- new: 

### T0666
- what: message · STEP_INFO › pal-pair · Title or explanation of a step in the step-by-step view.
- now: Palisades side by side
- new: 

### T0667
- what: message · STEP_INFO › pal-pair · Title or explanation of a step in the step-by-step view.
- now: Two palisades side by side share one side, which counts for both numbers. Counting both numbers together leaves one choice for this edge.
- new: 

### T0668
- what: message · STEP_INFO › pal-two · Title or explanation of a step in the step-by-step view.
- now: Palisade: only two pieces
- new: 

### T0669
- what: message · STEP_INFO › pal-two · Title or explanation of a step in the step-by-step view.
- now: Only two pieces can exist, so every wall has the same two pieces on its sides. Counting the walls around the tiles with that in mind leaves one choice for this edge.
- new: 

### T0670
- what: message · STEP_INFO › wally-wall · Title or explanation of a step in the step-by-step view.
- now: Wally: no T shape
- new: 

### T0671
- what: message · STEP_INFO › wally-wall · Title or explanation of a step in the step-by-step view.
- now: With Wally no piece contains a T. This tile already has 2 neighbours in its piece (or keeps 2 walls), and a third neighbour would make a T, so this side is a wall.
- new: 

### T0672
- what: message · STEP_INFO › wally-link · Title or explanation of a step in the step-by-step view.
- now: With Wally no piece contains a T. The solver tried every way this tile keeps at most 2 neighbours in its piece. In all of them this side is open, so the two tiles are in one piece.
- new: 

### T0673
- what: message · STEP_INFO › wally-ends · Title or explanation of a step in the step-by-step view.
- now: Wally: two ends per piece
- new: 

### T0674
- what: message · STEP_INFO › wally-ends · Title or explanation of a step in the step-by-step view.
- now: With Wally every piece is a path with two ends (an end is a tile with 3 walls), a ring, or a single tile. So a piece has at most two ends, a piece whose two ends are known runs straight through all its other tiles, and when every rose (or Solitude symbol) is a dead end, the pieces start and end at them.
- new: 

### T0675
- what: message · STEP_INFO › wally-ends · Title or explanation of a step in the step-by-step view.
- now: With Wally every piece is a path with two ends. The piece on one side already has both its ends, so joining the other side would give it a third end (or the piece is already whole). So this is a wall.
- new: 

### T0676
- what: message · STEP_INFO › wally-ends · Title or explanation of a step in the step-by-step view.
- now: With Wally every piece is a path with two ends. All the ends are known already, so this tile is a middle tile: it has two ways on and takes both.
- new: 

### T0677
- what: message · STEP_INFO › wally-line · Title or explanation of a step in the step-by-step view.
- now: Wally + Gemini: lines of the same length
- new: 

### T0678
- what: message · STEP_INFO › wally-line · Title or explanation of a step in the step-by-step view.
- now: The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line ends here, so this edge is a wall.
- new: 

### T0679
- what: message · STEP_INFO › wally-line · Title or explanation of a step in the step-by-step view.
- now: The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line goes on through this edge, so the two tiles are in one piece.
- new: 

### T0680
- what: message · STEP_INFO › gemini-line · Title or explanation of a step in the step-by-step view.
- now: Gemini: lines of the same length
- new: 

### T0681
- what: message · STEP_INFO › wally-two · Title or explanation of a step in the step-by-step view.
- now: Wally: only two pieces
- new: 

### T0682
- what: message · STEP_INFO › pal-size · Title or explanation of a step in the step-by-step view.
- now: Palisade: how big the piece is
- new: 

### T0910
- what: message · STEP_INFO › pal-size · Title or explanation of a step in the step-by-step view.
- now: The open sides of this tile put it in a piece of at least a certain size. Joined, these two groups would break a size limit, so there is a wall between them.
- new: 

### T0683
- what: message · STEP_INFO › bri-three · Title or explanation of a step in the step-by-step view.
- now: Bricky: three walls, the fourth is open
- new: 

### T0684
- what: message · STEP_INFO › bri-three · Title or explanation of a step in the step-by-step view.
- now: With Bricky, four walls never meet at a corner. Three of the four segments at this corner are walls, so the fourth is open: the two tiles are in one piece.
- new: 

### T0685
- what: message · STEP_INFO › bri-pinch · Title or explanation of a step in the step-by-step view.
- now: Bricky: tiles that touch at a corner
- new: 

### T0686
- what: message · STEP_INFO › bri-pinch · Title or explanation of a step in the step-by-step view.
- now: Two tiles that meet only at a corner are in one piece, so one of the other two tiles at that corner joins them.
- new: 

### T0687
- what: message · STEP_INFO › bri-vertex · Title or explanation of a step in the step-by-step view.
- now: Bricky: no four walls at a corner
- new: 

### T0688
- what: message · STEP_INFO › bri-vertex · Title or explanation of a step in the step-by-step view.
- now: With Bricky, four walls never meet at a corner. The solver tried every way to split the four tiles around this corner into pieces, and in all of them this edge is the same.
- new: 

### T0689
- what: message · STEP_INFO › loo-outline · Title or explanation of a step in the step-by-step view.
- now: Loopy: the outline is linked
- new: 

### T0690
- what: message · STEP_INFO › loo-outline · Title or explanation of a step in the step-by-step view.
- now: Every tile on the outline has a wall to the outside, so two outline tiles side by side are one piece.
- new: 

### T0691
- what: message · STEP_INFO › loo-three · Title or explanation of a step in the step-by-step view.
- now: Loopy: three walls, the fourth is a wall
- new: 

### T0692
- what: message · STEP_INFO › loo-three · Title or explanation of a step in the step-by-step view.
- now: With Loopy an even number of walls meets at every corner. Three of the four segments at this corner are walls, so the fourth is a wall too.
- new: 

### T0693
- what: message · STEP_INFO › loo-corner · Title or explanation of a step in the step-by-step view.
- now: Loopy: poking-in corner
- new: 

### T0694
- what: message · STEP_INFO › loo-corner · Title or explanation of a step in the step-by-step view.
- now: At a corner where an empty tile pokes in, two walls are already there, so the other two segments are both walls or both open. One of them is known, so the other is the same.
- new: 

### T0695
- what: message · STEP_INFO › loo-color · Title or explanation of a step in the step-by-step view.
- now: Loopy: two colours
- new: 

### T0911
- what: message · STEP_INFO › loo-color · Title or explanation of a step in the step-by-step view.
- now: With Loopy the tiles get two colours: a wall changes the colour and an open edge keeps it. The chain of decided edges between these two tiles shows whether they have the same colour.
- new: 

### T0696
- what: message · STEP_INFO › tower-wall · Title or explanation of a step in the step-by-step view.
- now: Watchtower
- new: 

### T0697
- what: message · STEP_INFO › tower-wall · Title or explanation of a step in the step-by-step view.
- now: The number on the watchtower at this corner is how many walls meet there (a 4 needs four walls, a 2 exactly two). This edge has to be one of them, so it is a wall.
- new: 

### T0698
- what: message · STEP_INFO › tower-link · Title or explanation of a step in the step-by-step view.
- now: The number on the watchtower at this corner is how many walls meet there (a 1 joins all the tiles around its corner). This edge has to be open, so the two tiles are in one piece.
- new: 

### T0699
- what: message · STEP_INFO › tower-wrap · Title or explanation of a step in the step-by-step view.
- now: Watchtower: no wrapping round the corner
- new: 

### T0700
- what: message · STEP_INFO › tower-wrap · Title or explanation of a step in the step-by-step view.
- now: Pieces stay on one side of a watchtower corner: none wraps around it.
- new: 

### T0701
- what: message · STEP_INFO › compass · Title or explanation of a step in the step-by-step view.
- now: The compass piece needs this edge to reach enough tiles on one of its sides, so the two tiles are in one piece.
- new: 

### T0702
- what: message · STEP_INFO › cmp-block · Title or explanation of a step in the step-by-step view.
- now: Compass: out of reach
- new: 

### T0900
- what: message · STEP_INFO › cmp-block · Title or explanation of a step in the step-by-step view.
- now: The tile across this edge is out of the compass piece's reach, so there is a wall between them.
- new: 

### T0703
- what: message · STEP_INFO › cmp-budget · Title or explanation of a step in the step-by-step view.
- now: Compass: the way to a rose
- new: 

### T1025
- what: message · STEP_INFO › cmp-budget · Title or explanation of a step in the step-by-step view.
- now: A compass number is exact, so the piece has only that many tiles on that side. Every way from the compass to a rose it still needs goes through tiles on that side, and each one uses up the count. Only the ways through this edge stay within the numbers.
- new: 

### T0704
- what: message · STEP_INFO › diff-clash · Title or explanation of a step in the step-by-step view.
- now: Difference: two numbers, two pieces
- new: 

### T0705
- what: message · STEP_INFO › diff-clash · Title or explanation of a step in the step-by-step view.
- now: One piece touches two Difference walls with different numbers (a Gemini wall counts as 0). The pieces across them differ from it by different amounts, so they are two different pieces.
- new: 

### T0706
- what: message · STEP_INFO › diff-small · Title or explanation of a step in the step-by-step view.
- now: Difference: the few small pieces
- new: 

### T0707
- what: message · STEP_INFO › diff-small · Title or explanation of a step in the step-by-step view.
- now: Every Difference wall of N has a piece of at most (Maximum − N) tiles on one side. With Mismatch every shape is used once, so there are only a few such small pieces. The solver tried every way to place them so that each of those walls has one on a side, and in all of them this edge is the same.
- new: 

### T0708
- what: message · STEP_INFO › rose-cover · Title or explanation of a step in the step-by-step view.
- now: Roses: who goes with whom
- new: 

### T0709
- what: message · STEP_INFO › rose-cover · Title or explanation of a step in the step-by-step view.
- now: Every piece holds one rose of each type. The solver listed every way to split the groups of roses into such pieces. In all of them these two groups are in different pieces.
- new: 

### T0710
- what: message · STEP_INFO › label · Title or explanation of a step in the step-by-step view.
- now: Which piece each tile belongs to
- new: 

### T0711
- what: message · STEP_INFO › label · Title or explanation of a step in the step-by-step view.
- now: Every piece holds exactly one symbol (Solitude), one rose of each type, or one of the area numbers that fill the board, so every tile belongs to the piece of one of them. For each tile the solver keeps the ones it can still belong to, taking away those cut off by walls, Inequality and Difference walls, or distance. These two tiles have no symbol left in common (a wall) or the same single one (open).
- new: 

### T0712
- what: message · STEP_INFO › box-hall · Title or explanation of a step in the step-by-step view.
- now: Boxy + Mismatch: shapes taken
- new: 

### T0713
- what: message · STEP_INFO › box-hall · Title or explanation of a step in the step-by-step view.
- now: Every piece is a different rectangle. Some pieces can only be a few rectangles, and when there are as many such pieces as rectangles they take all of them (for example four pieces that can only be 1x1 to 1x4). The other pieces lose those rectangles, and the rectangles left for this piece all agree on this edge.
- new: 

### T0714
- what: message · STEP_INFO › mismatch-hall · Title or explanation of a step in the step-by-step view.
- now: Mismatch: few shapes, all taken
- new: 

### T0715
- what: message · STEP_INFO › mismatch-hall · Title or explanation of a step in the step-by-step view.
- now: Every piece has a different shape and the pieces are small, so there are only a few shapes. Some pieces can only be a few of them, and when there are as many such pieces as shapes they take all of them. The other pieces lose those shapes, and the shapes left for this piece all agree on this edge.
- new: 

### T0716
- what: message · STEP_INFO › cmp-box · Title or explanation of a step in the step-by-step view.
- now: Compass + Boxy: the rectangle
- new: 

### T0717
- what: message · STEP_INFO › cmp-box · Title or explanation of a step in the step-by-step view.
- now: The piece is a rectangle, so each compass number counts whole rows or columns on that side. The solver listed every rectangle that fits all the numbers, and they all agree on this edge.
- new: 

### T0718
- what: message · STEP_INFO › gemini-anchor · Title or explanation of a step in the step-by-step view.
- now: Gemini: the one line that can match
- new: 

### T0719
- what: message · STEP_INFO › gemini-anchor · Title or explanation of a step in the step-by-step view.
- now: Both pieces of the Gemini wall have a closed straight line of the same length, and one of them has room for only that one. So the turn or mirror that copies one shape onto the other sends line onto line. Of those few ways, the ones that still fit after copying the known tiles across all have a wall here.
- new: 

### T0720
- what: message · STEP_INFO › gemini-anchor · Title or explanation of a step in the step-by-step view.
- now: Both pieces of the Gemini wall have a closed straight line of the same length, and one of them has room for only that one. So the turn or mirror that copies one shape onto the other sends line onto line. Of those few ways, the ones that still fit after copying the known tiles across all have these two tiles in one piece.
- new: 

### T0721
- what: message · STEP_INFO › gemini-place · Title or explanation of a step in the step-by-step view.
- now: Gemini / Delta: the shapes on both sides
- new: 

### T0722
- what: message · STEP_INFO › gemini-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every piece each side of the wall can still become. Across a Gemini wall both sides have the same shape, so each side keeps only the shapes the other side can have too (across a Delta wall, a side left with one shape takes that shape away from the other). The shapes left for this side all agree on this edge.
- new: 

### T0723
- what: message · STEP_INFO › region-merge · Title or explanation of a step in the step-by-step view.
- now: Two groups, one piece
- new: 

### T0724
- what: message · STEP_INFO › region-merge · Title or explanation of a step in the step-by-step view.
- now: An area closed in by walls has only so many tiles. The solver tried every way to split its big groups into pieces with the sizes the Inequality walls ask for, and in every way that fits these two groups are in the same piece. So they are one piece, even where they do not touch yet.
- new: 

### T0725
- what: message · STEP_INFO › size-cut · Title or explanation of a step in the step-by-step view.
- now: One size, one narrow tile
- new: 

### T0726
- what: message · STEP_INFO › size-cut · Title or explanation of a step in the step-by-step view.
- now: Every piece has the same size here. This tile is the only way into a part of the board, so only its own piece reaches in from outside, and it takes exactly what is left of that part after whole pieces: nothing (a wall) or some tiles (open).
- new: 

### T0727
- what: message · STEP_INFO › cmp-wrap · Title or explanation of a step in the step-by-step view.
- now: Compass: the piece has to go this way
- new: 

### T0728
- what: message · STEP_INFO › cmp-wrap · Title or explanation of a step in the step-by-step view.
- now: The compass piece needs this tile (or edge) to have enough tiles on some side, or in total, so it is part of the piece.
- new: 

### T0729
- what: message · STEP_INFO › cmp-place · Title or explanation of a step in the step-by-step view.
- now: Compass: every way the piece can be
- new: 

### T0730
- what: message · STEP_INFO › cmp-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every piece that fits all the compass numbers, the size and the walls already decided. Every one of them leaves this tile out, so there is a wall.
- new: 

### T0731
- what: message · STEP_INFO › cmp-place · Title or explanation of a step in the step-by-step view.
- now: The solver listed every piece that fits all the compass numbers, the size and the walls already decided. Every one of them holds this tile, so the two tiles are in one piece.
- new: 

### T0732
- what: message · STEP_INFO › cmp-crowd · Title or explanation of a step in the step-by-step view.
- now: Compass: room for every compass
- new: 

### T0733
- what: message · STEP_INFO › cmp-crowd · Title or explanation of a step in the step-by-step view.
- now: The compasses here each need tiles for their pieces, and there are only so many tiles. Only one choice for this edge leaves enough for all of them.
- new: 

### T0734
- what: message · STEP_INFO › cmp-excl · Title or explanation of a step in the step-by-step view.
- now: Compass: this tile stays out
- new: 

### T0735
- what: message · STEP_INFO › cmp-excl · Title or explanation of a step in the step-by-step view.
- now: Putting this tile in the compass piece breaks a rule, so it belongs to another piece.
- new: 

### T0736
- what: message · STEP_INFO › hetero-size · Title or explanation of a step in the step-by-step view.
- now: Heterogeneous: a size is used once
- new: 

### T0912
- what: message · STEP_INFO › hetero-size · Title or explanation of a step in the step-by-step view.
- now: With Heterogeneous each size is used once, and a finished piece already has this size.
- new: 

### T0901
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Two clues, two pieces
- new: 

### T0913
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver tried these two clues in one piece, and the rules could not all be met that way. So they are in different pieces, with a wall between their groups.
- new: 

### T0903
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Two groups, two pieces
- new: 

### T0914
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver tried these two groups as one piece, and the rules could not all be met that way. So they are different pieces, with a wall between them.
- new: 

### T0924
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Boxy + Mismatch: every rectangle is used
- new: 

### T0925
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece is a different rectangle, and the board has exactly as many tiles as all the rectangles still possible put together. So each of those rectangles is used once, and each needs a place on the board.
- new: 

### T0926
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Gemini and Delta: never the same two pieces
- new: 

### T1026
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: A Gemini wall has two pieces of the same shape on its sides and a Delta wall two pieces of different shapes, so a Gemini wall and a Delta wall are always between different pairs of pieces.
- new: 

### T0927
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Size Separation: a place for the piece
- new: 

### T0928
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Touching pieces always have different sizes. This piece has a known size, and the solver listed every place it can take where it touches no other piece of that size. They all agree on this edge.
- new: 

### T0929
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Heterogeneous: a place for the piece
- new: 

### T0930
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: With Heterogeneous, touching pieces always have different sizes. This piece has a known size, and the solver listed every place it can take where it touches no other piece of that size. They all agree on this edge.
- new: 

### T0931
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Area number: every place the piece fits
- new: 

### T0932
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver listed every place where the piece of this area number still fits with its size. They all agree on this edge.
- new: 

### T0933
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Size Separation: one size for every piece
- new: 

### T0934
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only one size is possible, and touching pieces always have different sizes, so no two pieces touch: every edge left is open.
- new: 

### T0935
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Mingle Shape: one shape for every piece
- new: 

### T0936
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only one shape is possible, and touching pieces always have different shapes, so no two pieces touch: every edge left is open.
- new: 

### T0937
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Heterogeneous: one size for every piece
- new: 

### T0938
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only one size is possible, and with Heterogeneous touching pieces always have different sizes, so no two pieces touch: every edge left is open.
- new: 

### T0939
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Size Separation: never three walls at a corner
- new: 

### T0940
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only two sizes are possible and touching pieces have different sizes, so three pieces never meet at one corner: a corner never has exactly three walls. The walls already at this corner leave one choice.
- new: 

### T0941
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Mingle Shape: never three walls at a corner
- new: 

### T0942
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only two shapes are possible and touching pieces have different shapes, so three pieces never meet at one corner: a corner never has exactly three walls. The walls already at this corner leave one choice.
- new: 

### T0943
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Heterogeneous: never three walls at a corner
- new: 

### T0944
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only two sizes are possible and with Heterogeneous touching pieces have different sizes, so three pieces never meet at one corner: a corner never has exactly three walls. The walls already at this corner leave one choice.
- new: 

### T0945
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Some of these tiles are already known to be in one piece, and some groups already have a wall between them somewhere else.
- new: 

### T1135
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver listed every place where the polyomino's shape still fits. Edges outside all of them are walls; edges inside all of them are open.
- new: 

### T0947
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver listed every placement of every bank shape (all turns and flips) that still fits around this group. Edges outside all of them are walls; edges inside all of them are open.
- new: 

### T0948
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The board is held together here by a single connection, and only one choice for it leaves each side with a number of tiles whole pieces of the allowed sizes can cover.
- new: 

### T0949
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece has the same shape, and one shape is left. The solver listed every place it still fits around this group. Edges outside all of them are walls; edges inside all of them are open.
- new: 

### T0950
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: This group can only become one shape. The solver listed every place where that shape still fits. Edges outside all of them are walls; edges inside all of them are open.
- new: 

### T0951
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece is a rectangle. The solver listed every rectangle of an allowed size that holds this group's tiles. Edges outside all of them are walls; edges inside all of them are open.
- new: 

### T0952
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long, and the lengths left say where this line ends.
- new: 

### T0953
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Both pieces of the Gemini wall have a closed straight line of the same length, and one of them has room for only that one. So the turn or mirror that copies one shape onto the other sends line onto line. Of those few ways, the ones that still fit after copying the known tiles across all agree on these edges.
- new: 

### T0954
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: The solver listed every piece that fits all the compass numbers, the size and the walls already decided. Tiles that none of them holds are cut off by walls; tiles that all of them hold are joined.
- new: 

### T0955
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Match: one size for every piece
- new: 

### T0956
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece has the same shape, so the same size, and only some sizes still work for the whole board.
- new: 

### T0957
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece has the same shape, so the same size, and only some sizes still work for the whole board. Joined, these two groups would have a size outside those, so there is a wall between them.
- new: 

### T0958
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Mismatch: enough different shapes
- new: 

### T0959
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece has a different shape, and each size has only so many shapes, so only some piece sizes still work for the whole board.
- new: 

### T0960
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Every piece has a different shape, and each size has only so many shapes, so only some piece sizes still work for the whole board. Joined, these two groups would have a size outside those, so there is a wall between them.
- new: 

### T1027
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Omits: never one of those shapes
- new: 

### T1028
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Joined, these two groups would hold a shape of the Omits, so there is a wall between them.
- new: 

### T1029
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Sizes that can fill the board
- new: 

### T1030
- what: message · Built by the page while it runs, so it only shows in some situations.
- now: Only some piece sizes can still cover the whole board. Joined, these two groups would have a size outside those, so there is a wall between them.
- new: 

### T1126
- what: message · STEP_WHY_EXTRA › size · Built by the page while it runs, so it only shows in some situations.
- now: a piece would get a size the size rules do not allow
- new: 

### T1127
- what: message · STEP_WHY_EXTRA › wall-inside · Built by the page while it runs, so it only shows in some situations.
- now: a wall would lie inside one piece
- new: 

### T0737
- what: message · STEP_WHY_EXTRA › forbidden · Built by the page while it runs, so it only shows in some situations.
- now: two tiles that cannot share a piece would be joined
- new: 

### T1128
- what: message · STEP_WHY_EXTRA › no-exit · Built by the page while it runs, so it only shows in some situations.
- now: a group that still has to grow would have no way out
- new: 

### T1129
- what: message · STEP_WHY_EXTRA › reach · Built by the page while it runs, so it only shows in some situations.
- now: a group could not reach enough tiles to become a big enough piece
- new: 

### T1130
- what: message · STEP_WHY_EXTRA › min-reach · Built by the page while it runs, so it only shows in some situations.
- now: a group could not reach the Minimum number of tiles
- new: 

### T1131
- what: message · STEP_WHY_EXTRA › compass · Built by the page while it runs, so it only shows in some situations.
- now: a compass piece could not get all its numbers
- new: 

### T0738
- what: message · out › title · Built by the page while it runs, so it only shows in some situations.
- now: {1} (part {2} of {3})
- new: 

### T0739
- what: message · stepTexts · Built by the page while it runs, so it only shows in some situations.
- now: Same deduction, continued
- new: 

### T0740
- what: message · stepTexts · Built by the page while it runs, so it only shows in some situations.
- now: The same deduction as the steps before also decides these remaining edges.
- new: 

### T0741
- what: message · stepTexts · Built by the page while it runs, so it only shows in some situations.
- now: The same deduction as the step before also settles every edge round this piece, which finishes it.
- new: 

### T0742
- what: message · stepTextsBase › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Start
- new: 

### T0743
- what: message · stepTextsBase › title · Built by the page while it runs, so it only shows in some situations.
- now: The puzzle as given
- new: 

### T0744
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, blue links join two tiles of one piece, and tiles that share a colour are in one piece even before they touch. Everything proven here holds in every tiling.
- new: 

### T0745
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: For this puzzle the solver’s rules decide no edge on their own, so the last step does all the work with an exhaustive search.
- new: 

### T0746
- what: message · meta · Built by the page while it runs, so it only shows in some situations.
- now: same-piece link
- new: 

### T0747
- what: message · meta · Built by the page while it runs, so it only shows in some situations.
- now: same-piece links
- new: 

### T0748
- what: message · meta · Built by the page while it runs, so it only shows in some situations.
- now: edge already inside a joined group
- new: 

### T0749
- what: message · meta · Built by the page while it runs, so it only shows in some situations.
- now: edges already inside a joined group
- new: 

### T0750
- what: message · mark · Built by the page while it runs, so it only shows in some situations.
- now: Every tile known to be in that piece now has the same colour.
- new: 

### T0883
- what: message · what · Built by the page while it runs, so it only shows in some situations.
- now: one symbol
- new: 

### T0884
- what: message · what · Built by the page while it runs, so it only shows in some situations.
- now: one rose of each type
- new: 

### T0885
- what: message · what · Built by the page while it runs, so it only shows in some situations.
- now: one of the area numbers
- new: 

### T0751
- what: message · stepTextsBase › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Rule
- new: 

### T0886
- what: message · stepTextsBase › title · Built by the page while it runs, so it only shows in some situations.
- now: Only one piece it can be in
- new: 

### T0887
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: Every piece holds exactly {1}. The ringed tiles have only one piece left they can belong to, so they are in that piece, even though they do not touch yet.{2}
- new: 

### T0752
- what: message · stepTextsBase › title · Built by the page while it runs, so it only shows in some situations.
- now: The only way to connect
- new: 

### T0753
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: they belong
- new: 

### T0754
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: it belongs
- new: 

### T0755
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: The parts of one piece that do not touch yet still have to meet, and every way to connect them passes through the ringed tile{1}, so {2} to that piece.{3}
- new: 

### T0756
- what: message · stepTextsBase › title · Built by the page while it runs, so it only shows in some situations.
- now: Far apart, but one piece
- new: 

### T0757
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: The rule steps so far put the ringed tiles in one piece, even though they do not touch yet.{1}
- new: 

### T0758
- what: message · stepTextsBase › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Checked by trying the other way
- new: 

### T0759
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: The ringed tiles are in one piece, even though they do not touch yet: the solver tried them in different pieces, and the rules could not all be met that way.{1}
- new: 

### T0905
- what: message · title · Built by the page while it runs, so it only shows in some situations.
- now: These two tiles are in one piece
- new: 

### T0906
- what: message · title · Built by the page while it runs, so it only shows in some situations.
- now: There is a wall here
- new: 

### T0762
- what: message · concl · Built by the page while it runs, so it only shows in some situations.
- now: The two tiles at the outlined edge are in one piece.
- new: 

### T0763
- what: message · concl · Built by the page while it runs, so it only shows in some situations.
- now: There is a wall at the outlined edge.
- new: 

### T1132
- what: message · other · Built by the page while it runs, so it only shows in some situations.
- now: a wall there
- new: 

### T0907
- what: message · other · Built by the page while it runs, so it only shows in some situations.
- now: the two tiles in one piece
- new: 

### T0765
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: the rules could not all be met
- new: 

### T0766
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: {1} The solver tried {2} instead and found that {3}.
- new: 

### T0767
- what: message · stepTextsBase › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Checked by search
- new: 

### T0768
- what: message · stepTextsBase › text · Built by the page while it runs, so it only shows in some situations.
- now: {1} The solver tried every way to go on with {2} instead, and none of them works out. This is a brute-force check, so there is no short rule to quote.
- new: 

### T0769
- what: message · stepTextsBase · Built by the page while it runs, so it only shows in some situations.
- now: These tiles are in one piece: a wall here would break a rule ({1}).
- new: 

### T0770
- what: message · stepTextsBase · Built by the page while it runs, so it only shows in some situations.
- now: These tiles are in one piece.
- new: 

### T0908
- what: message · stepTextsBase · Built by the page while it runs, so it only shows in some situations.
- now: There is a wall between these groups: joining them would break a rule ({1}).
- new: 

### T0771
- what: message · stepTextsBase · Built by the page while it runs, so it only shows in some situations.
- now: This follows from the rules already used.
- new: 

### T0915
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: open edge
- new: 

### T0916
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: open edges
- new: 

### T0917
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: This decides the outlined edges: {1} and {2}.
- new: 

### T0918
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: So the outlined edge is a wall.
- new: 

### T0919
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: So the {1} outlined edges are walls.
- new: 

### T0920
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: So the outlined edge is open: the two tiles are in one piece.
- new: 

### T0921
- what: message · res · Built by the page while it runs, so it only shows in some situations.
- now: So the {1} outlined edges are open: their tiles are in one piece.
- new: 

### T0772
- what: message · stepTextsBase › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Follows from the proof above
- new: 

### T0773
- what: message · makeFinalStep › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Solved
- new: 

### T0774
- what: message · makeFinalStep › title · Built by the page while it runs, so it only shows in some situations.
- now: Every edge is decided
- new: 

### T0775
- what: message · makeFinalStep › text · Built by the page while it runs, so it only shows in some situations.
- now: The rules above settled every edge, and the exact solver confirmed that no other tiling exists.
- new: 

### T0776
- what: message · makeFinalStep › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Exhaustive search
- new: 

### T0777
- what: message · makeFinalStep › title · Built by the page while it runs, so it only shows in some situations.
- now: The rest is found by search
- new: 

### T0778
- what: message · makeFinalStep › text · Built by the page while it runs, so it only shows in some situations.
- now: The rules above settle {1} of {2} edges. For the other {3} the solver switched to an exhaustive search of the remaining possibilities, and exactly one tiling survives (shown). Edges found by search are drawn in purple.
- new: 

### T0779
- what: message · makeFinalStep › kicker · Built by the page while it runs, so it only shows in some situations.
- now: Not unique
- new: 

### T0780
- what: message · makeFinalStep › title · Built by the page while it runs, so it only shows in some situations.
- now: More than one tiling remains
- new: 

### T0781
- what: message · makeFinalStep › text · Built by the page while it runs, so it only shows in some situations.
- now: at least
- new: 

### T0782
- what: message · makeFinalStep › text · Built by the page while it runs, so it only shows in some situations.
- now: Everything above holds in every tiling. For the other {1} of {2} edges the rules could not decide and the solver found {3}two different tilings. They differ at the ringed tiles; switch between them below. Edges found by search are drawn in purple.
- new: 

### T0784
- what: message · view › label · Built by the page while it runs, so it only shows in some situations.
- now: Step {1} of {2}
- new: 

### T0785
- what: message · renderStepsView · Built by the page while it runs, so it only shows in some situations.
- now: Final tiling{1}
- new: 

### T0786
- what: message · renderStepsView · Built by the page while it runs, so it only shows in some situations.
- now: Start · {1} step{2}
- new: 

### T0787
- what: message · renderStepsView · Built by the page while it runs, so it only shows in some situations.
- now: Result · step {1} of {2}
- new: 

### T0788
- what: message · renderStepsView · Built by the page while it runs, so it only shows in some situations.
- now: Tiling A
- new: 

### T0789
- what: message · renderStepsView · Built by the page while it runs, so it only shows in some situations.
- now: Tiling B
- new: 

### T0962
- what: message · miniShapes · Built by the page while it runs, so it only shows in some situations.
- now: shape of {1} tiles
- new: 

### T0983
- what: message · exampleCard · Built by the page while it runs, so it only shows in some situations.
- now: Here are {1} cases.
- new: 

### T0987
- what: message · openExamplePop · Built by the page while it runs, so it only shows in some situations.
- now: Close
- new: 

### T0988
- what: message · openExamplePop · Built by the page while it runs, so it only shows in some situations.
- now: This example could not be drawn.
- new: 

### T0989
- what: message · openExamplePop · Built by the page while it runs, so it only shows in some situations.
- now: A small example of every rule
- new: 

### T1133
- what: message · openExamplePop · Built by the page while it runs, so it only shows in some situations.
- now: The outlined edges are the ones the rule decides.
- new: 

### T0790
- what: message · replayDeductionTrace · Built by the page while it runs, so it only shows in some situations.
- now: Replaying the solver’s reasoning…
- new: 

### T0791
- what: message · replayDeductionTrace · Built by the page while it runs, so it only shows in some situations.
- now: Replaying the solver’s reasoning… {1} of {2} edges decided
- new: 

### T0792
- what: message · replayDeductionTrace · Built by the page while it runs, so it only shows in some situations.
- now: Cancelled.
- new: 

### T0793
- what: message · replayDeductionTrace · Built by the page while it runs, so it only shows in some situations.
- now: The replay stopped early: {1}
- new: 
