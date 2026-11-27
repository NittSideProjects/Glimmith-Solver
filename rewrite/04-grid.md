# Grid size, tools and key

Width and height, the clear buttons, the grid itself and the key of what each key draws.

Left here: 0 to write, 0 to check again, 0 notes, 4 to put on the page. Done: 27.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0046
- what: text · #puzzlePanel
- now: Width
- new: =

### T0049
- what: text · #puzzlePanel
- now: Height
- new: =

### T0050
- what: text · #resetPuzzleBtn
- now: Reset grid
- new: =

### T0051
- what: text · #clearWallsBtn
- now: Clear all walls
- new: Clear all walls

### T0052
- what: text · #clearMarkersBtn
- now: Clear all symbols
- new: Clear all symbols

### T1227
- what: tooltip · #solveModeBtn · Tooltip: shows when you hover over it.
- now: Mark walls and links you have already checked yourself. They are not part of the puzzle: Check Uniqueness takes them as given and only checks the rest.
- new: Add your own walls and links to the puzzle. The solver will ALWAYS consider them true.

### T1228
- what: text · #solveModeBtn
- now: Solve marks
- new: =

### T1229
- what: text · #clearSolveMarksBtn
- now: Clear solve marks
- new: =

### T1230
- what: text · #solveHint
- now: Solve marks: click a wall spot to mark a wall, press L on it to mark a link, click a mark again to remove it. Check Uniqueness takes your marks as given and only checks the rest of the puzzle.
- new: Solve marks: On a wall spot, either click or press L to put a wall/link. This new information WILL BE CONSIDERED TRUE by the solver and it's check uniqueness. Use it to either prove obvious wrong path faster, or guide the solver with something you think is true.

### T0053
- what: text · #puzzlePanel
- now: active
- new: =

### T0054
- what: text · #puzzlePanel
- now: empty
- new: =

### T0055
- what: text · #puzzlePanel
- now: wall
- new: =

### T1231
- what: text · #puzzlePanel
- now: solve mark
- new: =

### T0056
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>D</kbd>delta
- new: =

### T0057
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>G</kbd>gemini
- new: =

### T0058
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd>inequality
- new: =

### T0059
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>0–9</kbd>difference
- new: =

### T0060
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>R</kbd><kbd>W</kbd>rose
- new: =

### T0061
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>P</kbd>polyomino
- new: =

### T0062
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>#</kbd>palisade
- new: =

### T0063
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>X</kbd>compass
- new: =

### T0895
- what: text · #puzzlePanel
- now: watchtower
- new: =

### T0065
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>1–99</kbd>area number
- new: =

### T0066
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel
- now: <kbd>Ctrl</kbd>pocket size
- new: =

### T0067
- what: text (keep the <b>/<i> tags or drop them) · #puzzlePanel · Only shows when custom rules are on (button at the bottom of the page).
- now: <kbd>L</kbd>link (on a wall spot)
- new: =

### T1234
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: This spot is part of the puzzle already
- new: This is already a wall/link in the puzzle

### T1235
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: A solve mark goes between two active tiles
- new: No solve mark exist in tiles, only on wall spots

### T0850
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: Links are a custom rule: show custom rules first (bottom of the page)
- new: Links are a custom rule: show custom rules first (bottom of the page)

### T0851
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: ← or → works on vertical walls only
- new: ← or → works on vertical walls only

### T0852
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: ↑ or ↓ works on horizontal walls only
- new: =

### T0856
- what: message · attachEvents · Built by the page while it runs, so it only shows in some situations.
- now: Untitled puzzle
- new: =
