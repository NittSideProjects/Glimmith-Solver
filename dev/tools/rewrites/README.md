# Page text and the rewrite list

The author rewrites every text the page shows on a private claude.ai page, the **rewrite list**
(https://claude.ai/artifact/8zkhz8jRG1qYJM5ET2k6e2). It stores what the author writes in its own database, collection `rewrites`, one
document per text ID (`{ text, kept, source, updatedAt }`; `kept: true` = "keep as is"; a text with `[...]` in it is a note for
Claude, not a rewrite). Read it with the ArtifactData tool (`list`, collection `rewrites`, limit 1000).

| File | What |
|---|---|
| `extract.js` | Every user-visible string of a page version (markup text, tooltips, menu options, JS strings with `{1}` marks for the values the code fills in), with its exact source position. `node extract.js <page.html> <out strings.json>` |
| `clean.js` | Drops noise, merges duplicates, groups by where the text shows (page order), adds a "where it shows" note and keeps the IDs of the previous list. `node clean.js <page.html> texts_ids.json <strings.json> <out dir>` |
| `texts_ids.json` | Every text of the current page with its ID. IDs must stay stable: always build the next list from this one, then save the new `texts.json` here. |
| `gen_rewrites.js` | Turns the author's saved rewrites into exact, position-checked source replacements for a patch script (see `dev/build/patch_ui_V1.0.10.py` and `rewrites_V1.0.10.json`). |
| `template.html` | The rewrite list page; `__DATA__` = the texts to show, `__SECTIONS__` = `sections.json`. |

## When a change adds or changes text on the page

1. Build the release as usual.
2. `node extract.js` + `node clean.js` on the new page with `texts_ids.json`: new text gets new IDs (`isNew`), changed text keeps its ID
   (`changedFrom`).
3. Read the rewrite list's database. Show on the page only what is still to write: texts with no answer, texts new or changed since the
   author's answer, and unfinished answers. Leave out what the author wrote or kept, `[...]` notes, and text that is never on screen
   (hidden settings, screen-reader labels).
4. Fill `template.html`, publish it to the same artifact URL (keeps the database), and save the new `texts.json` as `texts_ids.json`.
