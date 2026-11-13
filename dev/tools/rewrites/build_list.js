// Builds the rewrite list page: only what the author still has to write.
// node build_list.js <texts.json from clean.js> <sections.json> <answers dir> <template.html> <out page.html> [keep ids,comma separated]
//   <answers dir>: the rewrite list's database saved by ArtifactData (list, collection "rewrites", out_dir): <dir>/rewrites/<id>.json
// A text is listed when it is on screen and
//   - nobody answered it yet, or
//   - it was answered for an older wording (the answer's `source` differs) and the current wording is not the author's own text, or
//   - its id is in the keep list (an unfinished answer, for example).
// Left out: texts the author wrote or kept, [notes], the author's own wording now on the page, and text that is never on screen.
'use strict';
const fs = require('fs'), path = require('path');
const [, , textsPath, sectionsPath, answersDir, templatePath, outPath, keepArg] = process.argv;
const all = JSON.parse(fs.readFileSync(textsPath, 'utf8'));
const dir = path.join(answersDir, 'rewrites');
const answers = new Map(fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => { const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); return [f.slice(0, -5), d.data || d]; }));
const keepIds = new Set((keepArg || '').split(',').filter(Boolean));
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
const authorTexts = new Set([...answers.values()].filter(a => !a.kept && a.text && !/\[.*\]/.test(a.text)).map(a => norm(a.text)));
const onScreen = t => !/Never shown|Not shown on screen/.test(t.note || '');
const out = [], why = {};
for(const t of all){
  if(!onScreen(t)) continue;
  const a = answers.get(t.id), answered = a && (a.kept || norm(a.text));
  let reason = null;
  if(keepIds.has(t.id)) reason = 'unfinished';
  else if(authorTexts.has(norm(t.text))) reason = null;
  else if(!answered) reason = t.isNew ? 'new' : t.changedFrom ? 'changed' : 'todo';
  else if(a.source && norm(a.source) !== norm(t.text) && !/\[.*\]/.test(a.text || '')){ reason = 'changed'; if(!t.changedFrom) t.changedFrom = a.source; }
  if(!reason) continue;
  why[reason] = (why[reason] || 0) + 1;
  const { id, area, kind, where, lines, text, slots, note, isNew, changedFrom } = t;
  out.push({ id, area, kind, where, lines, text, slots, note, isNew, changedFrom, reason });
}
const enc = x => JSON.stringify(x).replace(/</g, '\\u003c');
const sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'));
fs.writeFileSync(outPath, fs.readFileSync(templatePath, 'utf8').replace('__DATA__', () => enc(out)).replace('__SECTIONS__', () => enc(sections)));
const byArea = {}; for(const x of out) byArea[x.area] = (byArea[x.area] || 0) + 1;
console.log(out.length, 'texts listed', why); console.log(byArea);
