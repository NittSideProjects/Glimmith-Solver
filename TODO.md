# To do

## Rule order from a human point of view (not started)

The step-by-step (and maybe the solver) should fire the rules in the order a person would find them. How: the author goes through
the step-by-step of many puzzles; every time the solver takes a step A while he sees an easier step B, we note "B before A". Those
notes become a priority order for the rules (in the step-by-step, and in the solver's propagation if it does not cost speed).
Notes so far:
- Done in V1.0.43: "known to be different" before a watchtower wall (the watchtower took the credit); two equal area numbers that do
  not fit side by side in a closed-in area before trying the other way (new step "Two area numbers, one piece").
- Open: a Match puzzle with a symmetric board (12x12, four pieces of 35 tiles) takes more than 15 minutes. The author's idea "the
  solution is rotation- or mirror-symmetric" is not sound in general (its clues are not symmetric, and equal pieces can tile a
  symmetric board without symmetry). Sound options: when the WHOLE puzzle (board, walls, clues) is symmetric, copy every proven edge to
  its mirror image; for Match, use the four-piece structure (placements of one shape) more strongly. To look into.
- Symmetry checked by brute force (every tiling of small symmetric boards by equal pieces):
  * 6 or more equal pieces: tilings with no symmetry at all exist (6x4 board, six L tetrominoes: 36 of 47 tilings).
  * 4 equal pieces: NOT "quarter-turn or a mirror": many tilings have only the half turn (6x6, four pieces of 9: 44 of 139), and some
    have no symmetry at all (8x4, four pieces of 8: 40 of 98).
  * 2 equal pieces on a board with half-turn symmetry: every tiling found is half-turn symmetric (all small boards, plus ~37,000
    random boards up to 26 tiles, ~307,000 tilings). Not proved. Options: a hard rule (copy each clue to its half-turned spot; wrong
    if the claim ever fails), a search order only (symmetric solutions first; always correct), or the hard rule plus a final check.
    Waiting for the author's choice.

**Reminder:** bring this up when the author asks what to add next, and before any V1.1: it is not done yet.

## Rule examples to review (the "Show example" / "Show all examples" pop-ups)

Numbers as the page shows them (`exampleNumber`: the order of `RULE_EXAMPLES` in the page; 92 examples in V1.0.40).
- **Approved by the author:** 1-9, 11-15.
- **To change:** 10 "Polyomino: size". Its board (a strip with a 2-tile and a 3-tile polyomino, step 2) only walls off a piece that
  is already finished, which the other checks do anyway. The rule's own case is a polyomino group that is NOT finished next to a group
  big enough that the two together would be bigger than the shape (a 3-tile polyomino whose group has 2 tiles, beside a group of 2
  tiles: joined they would be 4): a wall although neither piece is finished. Find such a board (`dev/tools/examples/find.js`).
- **Not reviewed yet:** 16-92.

When a rule gains or loses its example the numbers after it move: update this list then.
