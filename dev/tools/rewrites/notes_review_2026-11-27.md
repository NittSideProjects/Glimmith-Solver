# Your `[...]` notes on the rewrite list (27 Nov 2026)

143 of your answers hold a `[...]` note. **57 are on texts that are no longer on the page** (the old guess layer, the region limits,
the search-limit messages, the old range texts, the old Fast import "folder blocked" box): nothing to do, they are gone already.
The other **86** are below, grouped by what they need.

## `[explain]`: what the solver does

### Wall budget (T0612 title, T0613 text)

It counts the walls. Picture the finished puzzle: the walls are lines inside the board. Count:

* every wall that touches the board's outline (an end on the outline), **1 each**;
* every inner corner where 3 walls meet (a T), **1 each**;
* every inner corner where 4 walls meet (a cross), **2 each**.

On a board in one piece with no holes, that total is always exactly **2 × (number of pieces − 1)**. A straight wall from one
side of the board to the other makes 2 pieces and has 2 ends on the outline (2 = 2 × 1). A T on that wall adds a new wall that cuts
one more piece off: one more end on the outline and one T (2 more = one more piece). The rule holds for every tiling.

So when the rules cap the number of pieces (Precision on a board of known size, the rose count, Solitude...), the walls have a
budget. The solver counts what the walls already placed use. If the budget is fully used, any open edge whose wall would add a new end on the
outline, or a new T, would go over it. That edge is a link. (Holes in the board and separate parts change the budget a little,
and the solver adds them in.)

Example: 16 tiles with Precision 4 is exactly 4 pieces, so the budget is 6. Two walls from border to border already use 4, and a T
uses 1 more. Only 1 is left, so an edge whose wall would cost 2 (a new end on the outline and a new T, or two new T's) is a link.

### Match: equal pieces (T0616 title, T0617 text)

It is only used when Match leaves exactly **two pieces**, inside the final search. The two pieces are the same shape, so one is the
other one turned, flipped and moved. The solver tries each possible move in turn: each turn and flip (8 of them), with each shift
that sends the board's tiles onto the board in pairs. For one such move, tile X of the first piece lands on tile Y of the second.
Then every edge and its image under the move must be the same: a wall stays a wall, a link stays a link. So once one of them is known, the other is copied. If no
move works, the puzzle has no two-piece solution.

The current text ("a wall inside one piece has its copy in the other") is too vague. Something closer: "With only two pieces of the
same shape, one is the other turned or flipped and moved. For the move being tried, this edge is the copy of an edge already known,
so it is the same."

### Bricky: tiles that touch at a corner (T0685 title, T0686 text)

At one corner of the grid there are four tiles: top-left, top-right, bottom-left, bottom-right. Say top-left and bottom-right (they only touch
at the corner) are already known to be in the same piece (joined some other way). If top-right and bottom-left were both in
other pieces, the four edges around that corner would all be walls: a cross, which Bricky forbids. So **at least one of the
other two tiles belongs to that piece**. When one of them is already walled off from it, the other one must join: its two
edges at that corner are links.

The solver does it by trying every way to split the four tiles into pieces, keeping the ones without a cross, and fixing every
edge that is the same in all of them.

## `[where]`: where these texts show

| ID | Text | Where |
|---|---|---|
| T0018 | Choose which puzzle to work on | Not on screen: what a screen reader says for the puzzle list at the top of the page. |
| T0025 | Choose or forget the folder Fast import reads | Tooltip of the **Folder…** button next to Fast import (only once Fast import is set up). |
| T0026 | Folder… | That button. |
| T0044 | Forget folder | Button in the box that **Folder…** opens, next to "Import now" and "Close". |
| T0047, T0048 | One less / One more | Not on screen: what a screen reader says for the − and + buttons beside the width and height boxes. |
| T0834 | Your browser can't remember folders… | In the Fast import setup box, on Firefox / Safari (only Chrome and Edge can remember a folder). |
| T1180 | Name steps by logic | The checkbox at the right of the step controls in the step-by-step view. |

## Clear instructions: done in the next text release

* **`[remove]`** (36 texts): they go.
* **Merges**: the step keeps its own rule inside the solver, but shows the same title and text as the one you name:
  * Forced growth (Minimum) → your Forced growth text (T0567, T0568),
  * Reach (Minimum) → your Reach text (T0571, T0572),
  * Roses: the way to a missing rose → your "Missing a rose" (T0575, T0898),
  * Solitude: the way to a symbol → your "Missing a symbol" (T0648, T0899),
  * Mismatch: same shape, one piece → your "Never different" (T0632, T0633),
  * Loopy: poking-in corner → your "Can't have 3 walls" (T0693, T0694),
  * Closed-in area: whole pieces only and Match: closed-in area → your "Closed in" (T0610, T0611, T0621, T0622).
* **Wally: two ends** (T0675, T0676): the two other wordings of that step take your T0674 text.
* **Loopy info** (T0265, T0268): your "Two colors" text becomes the point, and the old "Two colours" point goes.
* **Combined rules** (T0269): the whole "Combined rules" part of the rules footer goes (Compass + Boxy, Area numbers + Roses, Compass +
  Roses, Gemini + Delta, Match + holes, Match + pocket of knowledge, Mismatch + few shapes). Only the explanations go, not the solver's logic.
* **Gemini lines in the Wally info** (T0318): it goes from the Wally list; it is covered by "same shape advanced" under Gemini.

## Questions you asked

* **T0680, T0681 "no explanation?"**: they have one. The rewrite list shows a text only once. "Gemini: lines of the same length" uses
  the same explanation as T0678 / T0679, and "Wally: only two pieces" uses the same as "Palisade: only two pieces" (T0669). Your
  rewrite of those covers them.
* **T0495 "obsolete? should be range"**: still shown. It is the rule chip when a puzzle has both a Minimum and a Maximum ("Minimum
  3 and Maximum 5: every piece has 3 to 5 tiles"). Calling it a range is fine: rewrite it that way.
* **T0819 "duplicate with T0818?"**: no. T0818 is for one puzzle ("“X” says Wally in its description, so we assumed…"); T0819 is
  the heading when several puzzles do, followed by their list.
* **T0838 "duplicate with T0837?"**: same meaning, two places: T0837 after "Import now" when none of the chosen folders holds a
  puzzle, T0838 when you pick a folder in the setup. Keep one wording and I will use it for both.
* **T0677 to T0679 "this doesn't need Wally"**: right. "Lines of the same length" is pure Gemini logic (the two pieces have the same
  shape, so the same straight lines), and it is sound without Wally. Today it only runs when Wally is on, because it has a time budget
  of up to 4 s per solve. Turning it on for every Gemini wall is a solver change: I can measure what it costs and gains on the campaign
  first.

## "Useless / redundant?": each rule switched off on the 1225 campaign puzzles

Deduction phase (everything before the final search), each rule off in turn, compared with all on. Zone3/1085a moves by ±1 to 3
edges with machine load in every run (time-limited probes), so it counts as noise.

| Rule (your note) | Edges left open without it | Time without it |
|---|---|---|
| Palisade: only two pieces (T0668, T0669, "redundant with colour count") | **158 more on Zone3/1249**: it is needed | 84 s slower |
| Palisades side by side (T0666, T0667, "redundant with the palisade rule") | none | 12 s slower (noise level) |
| Two polyominoes of the same shape, two pieces (T0586, T0587, "covered by every placement") | none | 14 s faster (noise level) |
| Must still fit the shape (T0588, T0589, "covered by every placement") | none | same |

So on the campaign, "Palisades side by side", "Two polyominoes of the same shape" and "Must still fit the shape" never decide
anything that the other rules do not decide anyway: you are right that they are covered. "Palisade: only two pieces" is not: one
puzzle needs it. Removing the three is your call: they may still matter on hand-made or workshop puzzles (the fuzzers would tell,
and I would run them before removing anything).
