#!/usr/bin/env python3
"""Page V1.0.10 -> V1.0.11 (page only, core stays v99): the step-by-step text, rewritten.

Every rule step now says what the rule is (when the reader needs it), what the solver checked, and what that gives, in that order, and
nothing more. No double negatives. Rule texts that end on "That decides this edge" now get the result added by the page: "So the
outlined edge is a wall.", "So the outlined edge is open: the two tiles are in one piece.", or the counts when a step decides both.
STEP_INFO entries: [title, text for any result (the page adds the result), text when the step only places walls, text when it only
links tiles]. This is a first attempt for the author to check on the rewrite list.
Usage: python3 patch_ui_V1.0.11.py glimmith_solver_V1.0.10.html glimmith_solver_V1.0.11.html"""
import sys, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

N = None
STEP_INFO = {
  'basic': ['Follows from what is known', N,
    'These two groups already have a wall between them somewhere else, so they are different pieces: every edge between them is a wall.',
    'These two tiles are already known to be in one piece, so the edge between them is open.'],
  'size': ['Too big for the size rules', N, 'Joined, these two groups would have more tiles than the size rules allow, so there is a wall between them.', N],
  'grow': ['Forced growth', N, N, 'This group is too small to be a whole piece yet, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.'],
  'min-grow': ['Forced growth (Minimum)', N, N, 'This group has fewer tiles than the Minimum, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.'],
  'reach': ['Reach', N, N, 'This group needs this edge to reach enough tiles for a piece of an allowed size, so the two tiles are in one piece.'],
  'min-reach': ['Reach (Minimum)', N, N, 'This group needs this edge to reach the Minimum number of tiles, so the two tiles are in one piece.'],
  'rose-grow': ['Roses: keep growing', N, N, 'This group still misses a rose type, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.'],
  'rose-reach': ['Roses: the way to a missing rose', N, N, 'This group still misses a rose type, and every rose of that type it can reach within the size limit is through this edge. So the two tiles are in one piece.'],
  'rose-pair': ['Roses: one of each type per piece', N, 'Each side holds a rose of the same type, and a piece holds only one rose of each type. So they are different pieces, with a wall between them.', N],
  'rose-cut': ['Roses: narrow passage', 'A few tiles are the only way into one part of the board. The roses in that part need as many different pieces to leave it as the passage has tiles, so each passage tile belongs to its own one of those pieces, and each of those pieces gets the roses it needs inside the part.', N, N],
  'rose-region': ['Roses: closed-in area', 'An area closed in by walls holds, for each rose type, one rose per piece. So its roses give the number of pieces in it: with one rose of each type it is a single piece.', N, N],
  'stamp-place': ['Stamp: every place the shape fits', N,
    "The solver listed every place where the stamp's shape still fits. This edge is outside all of them, so it is a wall.",
    "The solver listed every place where the stamp's shape still fits. This edge is inside all of them, so the two tiles are in one piece."],
  'stamp-size': ['Stamp: size', N, "Joined, these two groups would have more tiles than the stamp's shape, so there is a wall between them.", N],
  'stamp-shape': ['Stamp: shape', N, "Joined, these two groups would fit no turn or flip of the stamp's shape, so there is a wall between them.", N],
  'stamp-pair': ['Stamps of the same shape, far apart', N, 'Two stamps of the same shape share a piece only when one placement of the shape covers both. Every placement leaves one of them out, so they are different pieces, with a wall between them.', N],
  'shape-fit': ['Must still fit the shape', N, "Joined, these two groups would no longer fit inside the stamp's shape, so there is a wall between them.", N],
  'bank-fit': ['Must still fit a bank shape', N, 'Joined, these two groups would fit in none of the bank shapes (in any turn or flip), so there is a wall between them.', N],
  'bank-place': ['Shape bank: every place a shape fits', N,
    'The solver listed every placement of every bank shape (all turns and flips) that still fits around this group. This edge is outside all of them, so it is a wall.',
    'The solver listed every placement of every bank shape (all turns and flips) that still fits around this group. This edge is inside all of them, so the two tiles are in one piece.'],
  'bank-region': ['Shape bank: closed-in area', 'An area closed in by walls is covered by whole pieces with the sizes of the bank shapes, and only one way to do that is left.', N, N],
  'bank-bend': ['Shape bank: every shape has a bend', 'Every bank shape has a bend, so every piece has one.', N, N],
  'bank-block': ['Shape bank: every shape has a 2x2 block', 'Every bank shape contains a 2x2 block, so every piece contains one.', N, N],
  'bridge-count': ['One connection between two sides', N,
    'The board is held together here by a single connection. With one piece crossing it, the tiles left on each side could only be covered by pieces of sizes the rules forbid. So it is a wall.',
    'The board is held together here by a single connection. With a wall here, each side would need to be covered by whole pieces on its own, and its number of tiles makes that impossible. So one piece crosses it: the two tiles are in one piece.'],
  'area-sum': ['Area numbers cover every tile', 'The area numbers of this region add up to all its tiles, so every tile belongs to a numbered piece.', N, N],
  'area-region': ['Area numbers in a closed-in area', 'This area is closed in by walls, and its area numbers fit in it in only one way.', N, N],
  'area-rel': ['Walls that compare sizes', 'The walls that compare sizes (<, >, ±N, same) leave only some sizes for the pieces on each side.', N, N],
  'range-region': ['Closed-in area: whole pieces only', 'An area closed in by walls is covered by whole pieces of the allowed sizes, and only one choice for this edge allows that.', N, N],
  'euler-count': ['Wall budget', N, N, 'Few pieces are allowed, and that limits the walls: every wall end on the outline and every corner where walls branch costs one, and the walls already placed use the whole budget. A wall here would cost one more, so the two tiles are in one piece.'],
  'colour-count': ['Colour count', 'Few pieces are allowed, so the groups can be coloured with that many colours, with different colours for groups known to be different pieces. Two groups that always get the same colour are one piece; two that always get different colours have a wall between them.', N, N],
  'match-iso': ['Match: equal pieces', 'Every piece has the same shape, so a wall inside one piece has its copy in the other.', N, N],
  'match-place': ['Match: every place the shape fits', N,
    'Every piece has the same shape, and one shape is left. The solver listed every place it still fits around this group. This edge is outside all of them, so it is a wall.',
    'Every piece has the same shape, and one shape is left. The solver listed every place it still fits around this group. This edge is inside all of them, so the two tiles are in one piece.'],
  'match-region': ['Match: closed-in area', N, N, 'Every piece has the same size, and this area closed in by walls holds exactly that many tiles. So it is a single piece, and every edge inside it is open.'],
  'match-fit': ['Match: one shape for every group', N, 'Every piece has the same shape, so that shape has to fit every group. Joined, these two groups would leave no shape that fits all the groups, so there is a wall between them.', N],
  'match-mismatch': ['Match and Mismatch together', N, N, 'Match makes every piece the same and Mismatch makes every piece different. Both hold only with a single piece, so the whole board is one piece.'],
  'mismatch-place': ['Mismatch: every place for the only shape left', N,
    'This group can only become one shape. The solver listed every place where that shape still fits. This edge is outside all of them, so it is a wall.',
    'This group can only become one shape. The solver listed every place where that shape still fits. This edge is inside all of them, so the two tiles are in one piece.'],
  'mismatch-stamp': ['Mismatch: same stamp, one piece', N, N, 'No two pieces share a shape, and these two stamps have the same shape, so they are in one piece.'],
  'mismatch-link': ['Mismatch: same shape, one piece', N, N, 'No two pieces share a shape, and these two groups can only become the same shape, so they are one piece.'],
  'mingle-area-link': ['Size Separation: same size side by side', N, N, 'Touching pieces always have different sizes. The pieces of these two neighbouring tiles are both pinned to the same size, so they are one piece.'],
  'mingle-shape-link': ['Mingle Shape: same shape side by side', N, N, 'Touching pieces always have different shapes. The pieces of these two neighbouring tiles are both pinned to the same shape, so they are one piece.'],
  'mingle-area-merge': ['Size Separation: different sizes', N, 'These two groups can only end up with different sizes, so they are different pieces, with a wall between them.', N],
  'mingle-shape-merge': ['Mingle Shape: different shapes', N, 'These two groups can only end up with different shapes, so they are different pieces, with a wall between them.', N],
  'mingle-area-parity': ['Size Separation: two sizes alternate', 'Only two sizes are possible, and touching pieces have different sizes, so the sizes alternate across every wall like a chessboard. Counting the walls on the chain between these tiles shows whether their pieces have the same size.', N, N],
  'mingle-shape-parity': ['Mingle Shape: two shapes alternate', 'Only two shapes are possible, and touching pieces have different shapes, so the shapes alternate across every wall like a chessboard. Counting the walls on the chain between these tiles shows whether their pieces have the same shape.', N, N],
  'solitude-grow': ['Solitude: keep growing', N, N, 'This group has no symbol yet, and this edge is its only way out. The piece grows through it, so the two tiles are in one piece.'],
  'solitude-reach': ['Solitude: the way to a symbol', N, N, 'Every symbol this group can still reach is through this edge, so the two tiles are in one piece.'],
  'solitude-pair': ['Solitude: one symbol per piece', N, 'Each piece holds exactly one symbol, so these two symbols are in different pieces, with a wall between them.', N],
  'solitude-region': ['Solitude: closed-in area', 'Each piece holds exactly one symbol, so an area closed in by walls has as many pieces as symbols: with one symbol it is a single piece.', N, N],
  'boxy-place': ['Boxy: every rectangle that fits', N,
    "Every piece is a rectangle. The solver listed every rectangle of an allowed size that holds this group's tiles. This edge is outside all of them, so it is a wall.",
    "Every piece is a rectangle. The solver listed every rectangle of an allowed size that holds this group's tiles. This edge is inside all of them, so the two tiles are in one piece."],
  'boxy-line': ['Boxy: a prime size is a strip', 'Every piece is a rectangle, and a rectangle with a prime number of tiles is a straight strip. These tiles are already in a row, so their strip runs along that row.', N, N],
  'boxy-corner': ['Boxy: walls run straight', 'Every piece is a rectangle, so at every inner corner the walls run straight through, make a T or a cross, or there are none. The walls already at this corner leave one choice.', N, N],
  'boxy-fill': ['Boxy: fill the rectangle', N, N, 'Every piece is a rectangle, so everything inside the smallest rectangle around these tiles belongs to their piece.'],
  'nonbox-grow': ['Non-boxy: keep growing', N, N, 'No piece is a rectangle. This group is still a rectangle, and this edge is its only way out, so the piece grows through it: the two tiles are in one piece.'],
  'pal-wall': ['Palisade', N, 'The solver tried every way to give this palisade its number of walls, with the walls and links already known. In all of them this side is a wall.', N],
  'pal-link': ['Palisade', N, N, 'The solver tried every way to give this palisade its number of walls, with the walls and links already known. In all of them this side is open, so the two tiles are in one piece.'],
  'pal-pair': ['Palisades side by side', 'Two palisades side by side share one side, which counts for both numbers. Counting both numbers together leaves one choice for this edge.', N, N],
  'pal-two': ['Palisade: only two pieces', 'Only two pieces can exist, so every wall has the same two pieces on its sides. Counting the walls around the tiles with that in mind leaves one choice for this edge.', N, N],
  'wally-wall': ['Wally: no T shape', N, 'With Wally no piece contains a T. This tile already has 2 neighbours in its piece (or keeps 2 walls), and a third neighbour would make a T, so this side is a wall.', N],
  'wally-link': ['Wally: no T shape', N, N, 'With Wally no piece contains a T. The solver tried every way this tile keeps at most 2 neighbours in its piece. In all of them this side is open, so the two tiles are in one piece.'],
  'wally-ends': ['Wally: two ends per piece',
    'With Wally every piece is a path with two ends (an end is a tile with 3 walls), a ring, or a single tile. So a piece has at most two ends, a piece whose two ends are known runs straight through all its other tiles, and when every rose (or Solitude symbol) is a dead end, the pieces start and end at them.',
    'With Wally every piece is a path with two ends. The piece on one side already has both its ends, so joining the other side would give it a third end (or the piece is already whole). So this is a wall.',
    'With Wally every piece is a path with two ends. All the ends are known already, so this tile is a middle tile: it has two ways on and takes both.'],
  'wally-line': ['Wally + Gemini: lines of the same length', N,
    'The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line ends here, so this edge is a wall.',
    'The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line goes on through this edge, so the two tiles are in one piece.'],
  'gemini-line': ['Gemini: lines of the same length', N,
    'The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line ends here, so this edge is a wall.',
    'The two pieces of a Gemini wall have the same shape, so a straight line in one has a twin of the same length in the other. The solver checked every place where the twin could still have a line that long. The lengths left say this line goes on through this edge, so the two tiles are in one piece.'],
  'wally-two': ['Wally: only two pieces', 'Only two pieces can exist, so every wall has the same two pieces on its sides. Counting the walls around the tiles with that in mind leaves one choice for this edge.', N, N],
  'pal-size': ['Palisade: how big the piece is', N, 'The open sides of this tile put it in a piece of at least a certain size. Joined, these two groups would break a size limit, so there is a wall between them.', N],
  'bri-three': ['Bricky: three walls, the fourth is open', N, N, 'With Bricky, four walls never meet at a corner. Three of the four segments at this corner are walls, so the fourth is open: the two tiles are in one piece.'],
  'bri-pinch': ['Bricky: tiles that touch at a corner', 'Two tiles that meet only at a corner are in one piece, so one of the other two tiles at that corner joins them.', N, N],
  'bri-vertex': ['Bricky: no four walls at a corner', 'With Bricky, four walls never meet at a corner. The solver tried every way to split the four tiles around this corner into pieces, and in all of them this edge is the same.', N, N],
  'loo-outline': ['Loopy: the outline is linked', N, N, 'Every tile on the outline has a wall to the outside, so two outline tiles side by side are one piece.'],
  'loo-three': ['Loopy: three walls, the fourth is a wall', N, 'With Loopy an even number of walls meets at every corner. Three of the four segments at this corner are walls, so the fourth is a wall too.', N],
  'loo-corner': ['Loopy: poking-in corner', 'At a corner where an empty tile pokes in, two walls are already there, so the other two segments are both walls or both open. One of them is known, so the other is the same.', N, N],
  'loo-color': ['Loopy: two colours', 'With Loopy the tiles get two colours: a wall changes the colour and an open edge keeps it. The chain of decided edges between these two tiles shows whether they have the same colour.', N, N],
  'tower-wall': ['Watchtower', N, 'The number on the watchtower at this corner is how many walls meet there (a 4 needs four walls, a 2 exactly two). This edge has to be one of them, so it is a wall.', N],
  'tower-link': ['Watchtower', N, N, 'The number on the watchtower at this corner is how many walls meet there (a 1 joins all the tiles around its corner). This edge has to be open, so the two tiles are in one piece.'],
  'tower-wrap': ['Watchtower: no wrapping round the corner', 'Pieces stay on one side of a watchtower corner: none wraps around it.', N, N],
  'compass': ['Compass: reach', N, N, 'The compass piece needs this edge to reach enough tiles on one of its sides, so the two tiles are in one piece.'],
  'cmp-block': ['Compass: out of reach', N, "The tile across this edge is out of the compass piece's reach, so there is a wall between them.", N],
  'cmp-budget': ['Compass: the way to a rose', 'A compass number is exact, so the piece has only that many tiles on that side. Every way from the compass to a rose it still needs goes through tiles on that side, and each one uses up the count. Only the ways through this edge stay within the numbers.', N, N],
  'diff-clash': ['Difference: two numbers, two pieces', 'One piece touches two Difference walls with different numbers (a Gemini wall counts as 0). The pieces across them differ from it by different amounts, so they are two different pieces.', N, N],
  'diff-small': ['Difference: the few small pieces', 'Every Difference wall of N has a piece of at most (Maximum − N) tiles on one side. With Mismatch every shape is used once, so there are only a few such small pieces. The solver tried every way to place them so that each of those walls has one on a side, and in all of them this edge is the same.', N, N],
  'rose-cover': ['Roses: who goes with whom', 'Every piece holds one rose of each type. The solver listed every way to split the groups of roses into such pieces. In all of them these two groups are in different pieces.', N, N],
  'label': ['Which piece each tile belongs to', 'Every piece holds exactly one symbol (Solitude), one rose of each type, or one of the area numbers that fill the board, so every tile belongs to the piece of one of them. For each tile the solver keeps the ones it can still belong to, taking away those cut off by walls, Inequality and Difference walls, or distance. These two tiles have no symbol left in common (a wall) or the same single one (open).', N, N],
  'box-hall': ['Boxy + Mismatch: shapes taken', 'Every piece is a different rectangle. Some pieces can only be a few rectangles, and when there are as many such pieces as rectangles they take all of them (for example four pieces that can only be 1x1 to 1x4). The other pieces lose those rectangles, and the rectangles left for this piece all agree on this edge.', N, N],
  'mismatch-hall': ['Mismatch: few shapes, all taken', 'Every piece has a different shape and the pieces are small, so there are only a few shapes. Some pieces can only be a few of them, and when there are as many such pieces as shapes they take all of them. The other pieces lose those shapes, and the shapes left for this piece all agree on this edge.', N, N],
  'cmp-box': ['Compass + Boxy: the rectangle', 'The piece is a rectangle, so each compass number counts whole rows or columns on that side. The solver listed every rectangle that fits all the numbers, and they all agree on this edge.', N, N],
  'gemini-anchor': ['Gemini: the one line that can match', N,
    'Both pieces of the Gemini wall have a closed straight line of the same length, and one of them has room for only that one. So the turn or mirror that copies one shape onto the other sends line onto line. Of those few ways, the ones that still fit after copying the known tiles across all have a wall here.',
    'Both pieces of the Gemini wall have a closed straight line of the same length, and one of them has room for only that one. So the turn or mirror that copies one shape onto the other sends line onto line. Of those few ways, the ones that still fit after copying the known tiles across all have these two tiles in one piece.'],
  'gemini-place': ['Gemini / Delta: the shapes on both sides', 'The solver listed every piece each side of the wall can still become. Across a Gemini wall both sides have the same shape, so each side keeps only the shapes the other side can have too (across a Delta wall, a side left with one shape takes that shape away from the other). The shapes left for this side all agree on this edge.', N, N],
  'region-merge': ['Two groups, one piece', 'An area closed in by walls has only so many tiles. The solver tried every way to split its big groups into pieces with the sizes the Inequality walls ask for, and in every way that fits these two groups are in the same piece. So they are one piece, even where they do not touch yet.', N, N],
  'size-cut': ['One size, one narrow tile', 'Every piece has the same size here. This tile is the only way into a part of the board, so only its own piece reaches in from outside, and it takes exactly what is left of that part after whole pieces: nothing (a wall) or some tiles (open).', N, N],
  'cmp-wrap': ['Compass: the piece has to go this way', N, N, 'The compass piece needs this tile (or edge) to have enough tiles on some side, or in total, so it is part of the piece.'],
  'cmp-place': ['Compass: every way the piece can be', N,
    'The solver listed every piece that fits all the compass numbers, the size and the walls already decided. Every one of them leaves this tile out, so there is a wall.',
    'The solver listed every piece that fits all the compass numbers, the size and the walls already decided. Every one of them holds this tile, so the two tiles are in one piece.'],
  'cmp-crowd': ['Compass: room for every compass', 'The compasses here each need tiles for their pieces, and there are only so many tiles. Only one choice for this edge leaves enough for all of them.', N, N],
  'cmp-excl': ['Compass: this tile stays out', 'Putting this tile in the compass piece breaks a rule, so it belongs to another piece.', N, N],
  'hetero-size': ['Heterogeneous: a size is used once', 'With Heterogeneous each size is used once, and a finished piece already has this size.', N, N],
}

src = open(sys.argv[1], encoding='utf8').read()

# ---- 1. the table, replaced whole ----
a = src.index("  const STEP_INFO = {\n"); b = src.index("\n  };\n", a) + len("\n  };\n")
old_keys = [l.strip().split("'")[1] for l in src[a:b].split('\n') if l.startswith("    '") and "': [" in l]
missing = [k for k in old_keys if k not in STEP_INFO]
if missing: raise SystemExit(f'STEP_INFO entries without new text: {missing}')
lines = ["  const STEP_INFO = {                                                 // V1.0.11: [title, any result (the page adds it), walls only, links only]"]
for k, v in STEP_INFO.items():
    lines.append("    " + json.dumps(k) + ": [" + ", ".join(json.dumps(x, ensure_ascii=False) if x is not None else 'null' for x in v) + "],")
lines.append("  };\n")
src = src[:a] + "\n".join(lines) + src[b:]

src = rep(src, """  STEP_INFO['clue-apart'] = ['Two clues, two pieces', null, 'These two clues are in different pieces (the solver tried them in one piece, and the rules could not all be met that way), so there is a wall between their groups.', null];
  STEP_INFO['pair-apart'] = ['Two groups, two pieces', null, 'These two groups are in different pieces (the solver tried them as one piece, and the rules could not all be met that way), so there is a wall between them.', null];""",
"""  STEP_INFO['clue-apart'] = ['Two clues, two pieces', null, 'The solver tried these two clues in one piece, and the rules could not all be met that way. So they are in different pieces, with a wall between their groups.', null];
  STEP_INFO['pair-apart'] = ['Two groups, two pieces', null, 'The solver tried these two groups as one piece, and the rules could not all be met that way. So they are different pieces, with a wall between them.', null];""")

# ---- 2. a rule text that does not say the result gets it from the page ----
src = rep(src, """    let body = null;
    if(info){
      if(onlyWalls) body = info[2] || info[1]; else if(onlyLinks) body = info[3] || info[1];
      if(!body) body = info[1] || [info[2], info[3]].filter(Boolean).join(' ') || null;
    }""", """    let body = null, addResult = false;                                // V1.0.11: info[1] says why; the result is added here
    if(info){
      if(onlyWalls) body = info[2]; else if(onlyLinks) body = info[3];
      if(!body && info[1]){ body = info[1]; addResult = true; }
      if(!body) body = [info[2], info[3]].filter(Boolean).join(' ') || null;
    }""")
src = rep(src, """    if(info && nWall === 0 && nLink === 0 && info[3]) body = info[3];""",
"""    if(info && nWall === 0 && nLink === 0 && info[3]){ body = info[3]; addResult = false; }
    if(addResult && (nWall || nLink)){
      const res = nWall && nLink ? `This decides the outlined edges: ${plural(nWall, 'wall', 'walls')} and ${plural(nLink, 'open edge', 'open edges')}.`
        : nWall ? (nWall === 1 ? 'So the outlined edge is a wall.' : `So the ${nWall} outlined edges are walls.`)
        : (nLink === 1 ? 'So the outlined edge is open: the two tiles are in one piece.' : `So the ${nLink} outlined edges are open: their tiles are in one piece.`);
      body = `${body} ${res}`;
    }""")

# ---- 3. the other step texts ----
src = rep(src, """        text: hasLogic ? 'Step through to see what the solver can prove, one deduction at a time. Teal bars are walls it has proven, blue links mean "these two tiles are in one piece", and tiles that share a colour are proven to be in one piece even before they touch. Everything it proves holds in every tiling.'
                       : 'The solver\\u2019s rules could not decide any edge on their own for this puzzle, so everything is left to the exhaustive search in the last step.',""",
"""        text: hasLogic ? 'Step through to see what the solver proves, one deduction at a time. Each step outlines the edges it decides. Teal bars are walls, blue links join two tiles of one piece, and tiles that share a colour are in one piece even before they touch. Everything proven here holds in every tiling.'
                       : 'For this puzzle the solver\\u2019s rules decide no edge on their own, so the last step does all the work with an exhaustive search.',""")
src = rep(src, """        text: `The rules already used show that the ringed tiles are in one piece, even though they do not touch yet.${mark}`, meta };""",
"""        text: `The rule steps so far put the ringed tiles in one piece, even though they do not touch yet.${mark}`, meta };""")

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
