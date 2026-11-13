# Page text and the rewrite list

The author rewrites every text the page shows on a private claude.ai page, the **rewrite page**
(https://claude.ai/artifact/8zkhz8jRG1qYJM5ET2k6e2). It stores what he writes in its own database, collection `rewrites`, one
document per text ID (`{ text, kept, source, updatedAt }`; `kept: true` = "keep as is"; a text with `[...]` in it is a note for
Claude, not a rewrite). Read it with the ArtifactData tool (`list`, collection `rewrites`, limit 1000, `out_dir`): **always fetch it
before working on texts**, he writes there at any time. The folder `rewrite/` at the top of the repository is a copy of his answers.

| File | What |
|---|---|
| `extract.js` | Every user-visible string of a page version (markup text, tooltips, menu options, JS strings with `{1}` marks for the values the code fills in), with its exact source position. `node extract.js <page.html> <out strings.json>` |
| `clean.js` | Drops noise, merges duplicates, groups by where the text shows (page order), adds a "where it shows" note and keeps the IDs of the previous list. `node clean.js <page.html> texts_ids.json <strings.json> <out dir>` |
| `build_list.js` | Builds the rewrite page from `texts.json`, the saved answers and `template.html`, showing only what is still to write. `node build_list.js <texts.json> <sections.json> <answers dir> template.html <out.html> [ids to keep]` |
| `template.html` | The mould of the rewrite page (`__DATA__` = the texts to show, `__SECTIONS__` = `sections.json`). Empty when opened as it is: it only works once built and published on claude.ai. |
| `texts_ids.json` | Every text of the current page with its ID. IDs must stay stable: always build the next list from this one, then save the new `texts.json` here. |
| `gen_rewrites.js` | Turns the author's saved rewrites into exact, position-checked source replacements for a patch script (see `dev/build/patch_ui_V1.0.10.py` and `rewrites_V1.0.10.json`). |

## The copy in the repository: `rewrite/`

One file per part of the page, each text with `- now:` (the page) and `- new:` (his answer: empty = to do, `=` = keep, `[..]` = a
note for Claude). It is a copy: a change made by hand there is lost at the next refresh.

| Command | What |
|---|---|
| `node repo.js write texts_ids.json sections.json <dump of the database> ../../../rewrite` | Rewrites the files as a mirror of the page's answers. (`-` instead of a dump keeps the answers already in the files.) A text that changed under an answer gets a `- was:` line. |
| `node repo.js read ../../../rewrite <out dir>` | The answers as `<out dir>/rewrites/<id>.json`, the form `gen_rewrites.js` reads. |
| `node repo.js status ../../../rewrite` | What is left. Exit code 1 while anything is: no V1.1 before it says nothing is left (see CLAUDE.md). It counts the `[..]` notes too, which the page does not list. |

## When a change adds or changes text on the page

1. Build the release as usual.
2. `node extract.js` + `node clean.js` on the new page with `texts_ids.json`: new text gets new IDs (`isNew`), changed text keeps its ID
   (`changedFrom`).
3. Fetch the page's database (ArtifactData `list`, collection `rewrites`, limit 1000, `out_dir`), then `node build_list.js`: it
   shows only what is still to write (no answer yet, new, or changed since the author's answer, plus ids you pass as unfinished) and
   leaves out what the author wrote or kept, `[...]` notes, and text that is never on screen.
4. Publish the page to the same artifact URL (keeps the database), save the new `texts.json` as `texts_ids.json`, and refresh
   `rewrite/` with `repo.js write` from the same dump.
