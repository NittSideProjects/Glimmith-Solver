# Page text and the rewrite list

The author rewrites every text the page shows. The list he works on is the folder `rewrite/` at the top of the repository (see
`rewrite/README.md`): he edits those files and pushes them himself. The tools here keep that folder in step with the page.

| File | What |
|---|---|
| `extract.js` | Every user-visible string of a page version (markup text, tooltips, menu options, JS strings with `{1}` marks for the values the code fills in), with its exact source position. `node extract.js <page.html> <out strings.json>` |
| `clean.js` | Drops noise, merges duplicates, groups by where the text shows (page order), adds a "where it shows" note and keeps the IDs of the previous list. `node clean.js <page.html> texts_ids.json <strings.json> <out dir>` |
| `texts_ids.json` | Every text of the current page with its ID. IDs must stay stable: always build the next list from this one, then save the new `texts.json` here. |
| `gen_rewrites.js` | Turns the author's saved rewrites into exact, position-checked source replacements for a patch script (see `dev/build/patch_ui_V1.0.10.py` and `rewrites_V1.0.10.json`). |

## The list in the repository: `rewrite/`

One file per part of the page, each text with `- now:` (the page) and `- new:` (his answer: empty = to do, `=` = keep, `[..]` = a note for Claude).
He edits and pushes it himself. `repo.js` keeps it in step with the page:

| Command | What |
|---|---|
| `node repo.js write texts_ids.json sections.json <answers dir or -> ../../../rewrite` | Rewrites the files from the texts of the page. Answers already in the files stay; a text without one takes the answer of the claude.ai page, if a dump of its database is given. A text that changed under an answer gets a `- was:` line. |
| `node repo.js read ../../../rewrite <out dir>` | The answers as `<out dir>/rewrites/<id>.json`, the form `gen_rewrites.js` reads. |
| `node repo.js status ../../../rewrite` | What is left. Exit code 1 while anything is: no V1.1 before it says nothing is left (see CLAUDE.md). |

When a change adds or changes text: build the release, `git pull`, `extract.js` + `clean.js` on the new page with `texts_ids.json`,
save the new `texts.json` as `texts_ids.json` (and `sections.json`), then `repo.js write`. Commit `rewrite/` with the release.

## The former claude.ai page

Until V1.0.16 the list was a private claude.ai page (https://claude.ai/artifact/8zkhz8jRG1qYJM5ET2k6e2) with its own database
(collection `rewrites`, one document per text ID: `{ text, kept, source, updatedAt }`). Its answers were carried over into `rewrite/`
and the page is no longer rebuilt (its template and builder were removed). If the author ever answers there again, dump the database
with the ArtifactData tool (`list`, collection `rewrites`, limit 1000, `out_dir`) and pass that folder to `repo.js write`: a text
without an answer in the files takes the one from the dump.
