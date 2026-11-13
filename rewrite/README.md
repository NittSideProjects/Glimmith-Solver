# The rewrite list

Every text the page shows, one file per part of the page, with room for the author's own wording. The author edits these files and
pushes them; Claude pulls, puts the finished rewrites on the page in the next version and refreshes the files
(`dev/tools/rewrites/repo.js`, see `dev/tools/rewrites/README.md`).

**Left before V1.1: 735** (695 to write, 0 to check again, 40 notes for Claude, 0 written but not on the page yet).
Done: 273 of 1008.

| Part of the page | To write | To check again | Notes | To put on the page | Done |
|---|---|---|---|---|---|
| [Top of the page](01-top.md) | 0 | 0 | 0 | 0 | 12 |
| [Credits window](02-credits.md) | 0 | 0 | 0 | 0 | 5 |
| [Puzzle list, import and export](03-library.md) | 6 | 0 | 6 | 0 | 110 |
| [Grid size, tools and key](04-grid.md) | 0 | 0 | 0 | 0 | 24 |
| [Shape editor, Shape Bank and Omits](05-shapes.md) | 0 | 0 | 2 | 0 | 16 |
| [Rules](06-rules.md) | 0 | 0 | 4 | 0 | 40 |
| [Solver](07-solver.md) | 0 | 0 | 26 | 0 | 50 |
| [Step-by-step reasoning](08-steps.md) | 320 | 0 | 0 | 0 | 0 |
| [Why something is impossible](09-why.md) | 109 | 0 | 2 | 0 | 13 |
| [Rule explanations (bottom of the page)](10-footer.md) | 167 | 0 | 0 | 0 | 0 |
| [Custom rules button](11-custom.md) | 0 | 0 | 0 | 0 | 3 |
| [Other messages](12-other.md) | 93 | 0 | 0 | 0 | 0 |

## How to fill it in

```
### T0123
- what: where the text shows
- now: the text on the page today
- new: your text
```

- Write your text after `- new:`, on one line. Leave it empty while it is not done.
- `- new: =` keeps the text as it is.
- Anything with `[..]` in it is a note for Claude ("[remove this]", "[where is this shown?]"): it is never put on the page.
- `{1}`, `{2}` are values the page fills in (a number, a name). Keep them in your text.
- A `- was:` line means the page text changed after you wrote your answer (`was` is the old text). Check your answer against
  `now`, then delete the `- was:` line.
- Do not change the `###`, `- what:` and `- now:` lines: they are rewritten from the page every version.
