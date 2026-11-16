# To do

## Rule order from a human point of view (not started)

The step-by-step (and maybe the solver) should fire the rules in the order a person would find them. How: the author goes through
the step-by-step of many puzzles; every time the solver takes a step A while he sees an easier step B, we note "B before A". Those
notes become a priority order for the rules (in the step-by-step, and in the solver's propagation if it does not cost speed).
Notes so far: none.

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
