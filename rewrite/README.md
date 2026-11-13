# The rewrite list (copy)

Every text the page shows, one file per part of the page, with the author's own wording. **The author writes his answers on the
rewrite page, https://claude.ai/artifact/8zkhz8jRG1qYJM5ET2k6e2 (private), not here.** These files are a copy of that page that
Claude refreshes whenever it works on texts (`dev/tools/rewrites/repo.js`, see `dev/tools/rewrites/README.md`): they keep the
answers in the repository and give the count below. A change made by hand in these files is lost at the next refresh.

**Left before V1.1: 735** (695 to write, 0 to check again, 40 notes for Claude, 0 written but not on the page yet).
Done: 273 of 1008. The rewrite page lists fewer: it leaves out the notes for Claude.

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

## How to read an entry

```
### T0123
- what: where the text shows
- now: the text on the page today
- new: the author's answer
```

- `- new:` empty = not answered yet; `=` = keep the text as it is (or the text is already the author's own wording).
- Anything with `[..]` in it is a note for Claude ("[remove this]", "[where is this shown?]"): it is never put on the page.
- `{1}`, `{2}` are values the page fills in (a number, a name).
- A `- was:` line means the page text changed after the answer was written (`was` is the old text): the rewrite page shows that
  text again as changed.
