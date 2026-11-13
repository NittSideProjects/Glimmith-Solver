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
| `build_list.js` | Builds the rewrite list page from `texts.json`, the saved answers and `template.html`, showing only what is still to write. `node build_list.js <texts.json> <sections.json> <answers dir> template.html <out.html> [ids to keep]` |
| `template.html` | The rewrite list page; `__DATA__` = the texts to show, `__SECTIONS__` = `sections.json`. |

## The list in the repository: `rewrite/`

Since the files were put in order, the list the author works on is the folder `rewrite/` at the top of the repository: one file per
part of the page, each text with `- now:` (the page) and `- new:` (his answer: empty = to do, `=` = keep, `[..]` = a note for Claude).
He edits and pushes it himself. `repo.js` keeps it in step with the page:

| Command | What |
|---|---|
| `node repo.js write texts_ids.json sections.json <answers dir or -> ../../../rewrite` | Rewrites the files from the texts of the page. Answers already in the files stay; a text without one takes the answer of the claude.ai page, if a dump of its database is given. A text that changed under an answer gets a `- was:` line. |
| `node repo.js read ../../../rewrite <out dir>` | The answers as `<out dir>/rewrites/<id>.json`, the form `gen_rewrites.js` and `build_list.js` read. |
| `node repo.js status ../../../rewrite` | What is left. Exit code 1 while anything is: no V1.1 before it says nothing is left (see CLAUDE.md). |

When a change adds or changes text: build the release, `git pull`, `extract.js` + `clean.js` on the new page with `texts_ids.json`,
save the new `texts.json` as `texts_ids.json` (and `sections.json`), then `repo.js write`. Commit `rewrite/` with the release.

## The older way: the claude.ai page

### When a change adds or changes text on the page

1. Build the release as usual.
2. `node extract.js` + `node clean.js` on the new page with `texts_ids.json`: new text gets new IDs (`isNew`), changed text keeps its ID
   (`changedFrom`).
3. Read the rewrite list's database (ArtifactData `list`, collection `rewrites`, limit 1000, `out_dir`), then `node build_list.js`: it
   shows only what is still to write (no answer yet, new, or changed since the author's answer, plus ids you pass as unfinished) and
   leaves out what the author wrote or kept, `[...]` notes, and text that is never on screen.
4. Publish the page to the same artifact URL (keeps the database), and save the new `texts.json` as `texts_ids.json`.
