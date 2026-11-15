#!/usr/bin/env python3
"""Page V1.0.21 -> V1.0.22 (page only, core stays v103): the author's rewrites from the rewrite page.

1. 62 finished rewrites (rewrites_V1.0.22.json, made by dev/tools/rewrites/gen_rewrites.js from his answers). Before that, only his
   typos were fixed (build/typos_V1.0.22.json: spelling, a missing plural or 's', a capital at the start of a sentence, a missing
   full stop); his phrasing is kept.
   Left out for now: T0267 (Loopy, three walls: still being written), and three whose meaning differs from what the solver does
   (T0164 Reaching a rose, T0184 Inside a known shape, T0197 The board must divide): asked to the author.
2. His notes:
   * [remove]: the one-line rule definitions at the top of the "i" boxes of the rules footer (22 rules), the Bricky point
     "Placements" (explained above it now), the Omits hint in the shape editor, the "Rule" label of the rules panel, "and the
     Omits" in the message when no bank shape fits, and the screen-reader names of the theme button and of the puzzle name box
     (both have a visible label that screen readers read instead).
   * [divide this in multiple points] / [make those two separate points]: Inequality "Sizes push each other" and Palisade "Size of
     the piece" become two points each, with his texts.
   * [make this a point instead]: the Loopy definition becomes the point "Two colors.", first in its box.
   * [useT0500instead]: the remove button of the range chip says "Remove rule", like the others.
Usage: python3 patch_ui_V1.0.22.py glimmith_solver_V1.0.21.html glimmith_solver_V1.0.22.html"""
import sys, os, json

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

here = os.path.dirname(os.path.abspath(__file__))
src = open(sys.argv[1], encoding='utf8').read()

# ---- 1. the rewrites, by position (last first) ----
R = json.load(open(os.path.join(here, 'rewrites_V1.0.22.json'), encoding='utf8'))
for r in sorted(R, key=lambda r: -r['start']):
    if src[r['start']:r['end']] != r['old']: raise SystemExit(f"{r['id']}: the page has changed at {r['start']}: {src[r['start']:r['end']][:80]!r}")
    src = src[:r['start']] + r['new'] + src[r['end']:]

# ---- 2. [remove] ----
LEADS = [
    "A Delta wall says the two pieces have different shapes.",
    "A Gemini wall says the two pieces have the same shape, so also the same size.",
    "An Inequality wall says the piece the arrow points at is smaller.",
    "A Difference wall of N says the two pieces differ by exactly N tiles.",
    "An area number gives the size of its piece (a polyomino does too).",
    "Every piece holds exactly one rose of each type.",
    "A polyomino makes its piece exactly that shape (turned or flipped).",
    "A watchtower on a corner gives how many different pieces touch that corner.",
    "A palisade gives how many of its tile's four sides are walls (0 to 4, a 2 straight or bent). The board edge and empty tiles count as walls.",
    "A compass gives how many tiles of its piece lie north, east, south and west of it (over the whole piece, not just its row or column).",
    "Every piece has exactly this many tiles.",
    "Every piece has at least this many tiles.",
    "Every piece has at most this many tiles. On its own it says little; it matters with walls, clues or a Minimum.",
    "Every piece is one of the bank's shapes (turned or flipped).",
    "Every piece has a different shape.",
    "Every piece has the same shape.",
    "Pieces that touch have different shapes.",
    "Pieces that touch have different sizes.",
    "Every piece holds exactly one symbol (watchtowers do not count).",
    "Every piece is a rectangle.",
    "No piece is a rectangle.",
    "No corner has four walls meeting (a cross).",
]
for t in LEADS: src = rep(src, f'<p class="imp-lead">{t}</p>', '')
src = rep(src, '<li><b>Placements.</b> A polyomino, bank shape or rectangle that would leave a cross somewhere is dropped.</li>', '')
src = rep(src, '        <p class="hint">No piece may contain a banned shape: if some placement of it (turned or flipped) fits completely inside a piece, that piece is not allowed.</p>\n', '')
src = rep(src, '        <label for="ruleType">Rule</label>\n', '')
src = rep(src, """' (No shape in your bank fits the grid under the current size rule(s)' + (banShapes.length ? " and the Omits" : '') + '.)'""",
               """' (No shape in your bank fits the grid under the current size rule(s).)'""")
src = rep(src, ' aria-label="Switch between light and dark mode"', '')
src = rep(src, ' aria-label="Rename this puzzle"', '')

# ---- 3. points ----
src = rep(src, '<li><b>Sizes push each other.</b> A piece smaller than a 3 is 1 or 2 tiles. A chain a &lt; b &lt; c &lt; d makes d at least 4 tiles (5 with a Minimum of 2). A loop a &lt; b &lt; c &lt; a is impossible.</li>',
    '<li><b>Sizes push each other.</b> Since the smallest size is 1, the big size of an inequality is always at least two. Chains like a &lt; b &lt; c will make c at least 3. This also means if c is known to be size 3, then b is size 2 and a is size 1.</li>'
    '<li><b>Loops can\'t exist.</b> A link that would make a loop of a &lt; b &lt; a is impossible, so the solver puts a wall there. This is also true with bigger loops like a &lt; b &lt; c &lt; a.</li>')
src = rep(src, '<li><b>Size of the piece.</b> A tile with k open sides is in a piece of at least k + 1 tiles: a 0 needs 5, so a 0 with Maximum 4 is impossible. A tile with one open side can end a piece but never let it pass through.</li>',
    '<li><b>Size of the piece.</b> A tile with k open sides is in a piece of at least k + 1 tiles, 0 needs 5 tiles, 1 needs 4... So if a 1 Palisade has an area number 3 neighboring, it can\'t link.</li>'
    '<li><b>Fake walls.</b> A piece can\'t pass directly through a bend palisade or a dead end palisade. If a bunch of dead end palisades are in a row the solver knows a piece can\'t pass through it. (two bends are an exception)</li>')
src = rep(src, '<p class="imp-lead">No corner has exactly three walls (a T). So every corner has 0, 2 or 4 walls, and the pieces can be coloured with two colours, the outside being one of them.</p><ol class="imp-checks">',
    '<ol class="imp-checks"><li><b>Two colors.</b> Since no corner has exactly three walls (a T), so every corner has 0, 2 or 4 walls. This also makes the final puzzle 2 colorable, with the outside being one of them.</li>')

# ---- 4. [useT0500instead] ----
src = rep(src, "btn.title = key === 'range' ? 'Remove the range (minimum and maximum)' : 'Remove rule';", "btn.title = 'Remove rule';")

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2], len(R), 'replacements')
