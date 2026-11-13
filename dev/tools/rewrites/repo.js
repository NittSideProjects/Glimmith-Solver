// The rewrite list as files in the repository (folder rewrite/ at the top): the author edits them and pushes, Claude pulls.
//   node repo.js write <texts.json from clean.js> <sections.json> <answers dir or -> <rewrite dir>
//       (re)writes one file per page section. An answer already in the files wins; a text without one takes the answer saved on
//       the claude.ai rewrite list (<answers dir>/rewrites/<id>.json), if any. When the page text changed since an answer was
//       written, the entry gets a "- was:" line and counts as to do until the author removes that line.
//   node repo.js read <rewrite dir> <out dir>
//       the answers as <out dir>/rewrites/<id>.json ({ text, kept, source }), the form gen_rewrites.js and build_list.js read.
//   node repo.js status <rewrite dir>
//       the counts; exit code 1 while something is left to write, to check again, to apply or noted with [..].
// An entry:   ### T0123 / - what: ... / - now: the text on the page / - new: the author's text
//   new empty = to do,  "=" = keep as it is,  text with [..] = a note for Claude,  anything else = the rewrite.
'use strict';
const fs = require('fs'), path = require('path');
const [, , cmd, ...args] = process.argv;
const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
const onScreen = t => !/Never shown|Not shown on screen/.test(t.note || '');
function parse(dir){
  const out = new Map(); if(!fs.existsSync(dir)) return out;
  for(const f of fs.readdirSync(dir).filter(f => /^\d\d-.*\.md$/.test(f))){
    let cur = null;
    for(const line of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')){
      const h = /^### (T\d+)\s*$/.exec(line);
      if(h){ cur = { now: '', new: '', was: null }; out.set(h[1], cur); continue; }
      if(!cur) continue;
      const m = /^- (now|new|was):(.*)$/.exec(line); if(m) cur[m[1]] = m[2].trim();
    }
  }
  return out;
}
const state = e => e.was !== null && e.was !== undefined ? 'check' : !e.new ? 'todo' : e.new === '=' ? 'keep' : /\[.*\]/.test(e.new) ? 'note' : norm(e.new) === norm(e.now) ? 'done' : 'apply';
const LABEL = { todo: 'to write', check: 'to check again (the page text changed)', note: 'notes for Claude [..]', apply: 'written, not on the page yet', done: 'written and on the page', keep: 'kept as it is' };
function counts(entries){ const c = { todo: 0, check: 0, note: 0, apply: 0, done: 0, keep: 0 }; for(const e of entries) c[state(e)]++; return c; }
if(cmd === 'write'){
  const [textsPath, sectionsPath, answersDir, dir] = args;
  const texts = JSON.parse(fs.readFileSync(textsPath, 'utf8')).filter(onScreen), sections = JSON.parse(fs.readFileSync(sectionsPath, 'utf8'));
  const old = parse(dir), db = new Map();
  if(answersDir !== '-'){ const d = path.join(answersDir, 'rewrites'); for(const f of fs.readdirSync(d).filter(f => f.endsWith('.json'))){ const x = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); db.set(f.slice(0, -5), x.data || x); } }
  fs.mkdirSync(dir, { recursive: true });
  for(const f of fs.readdirSync(dir).filter(f => /^\d\d-.*\.md$/.test(f))) fs.unlinkSync(path.join(dir, f));
  const rows = [], total = [];
  sections.forEach((sec, i) => {
    const list = texts.filter(t => t.sec === sec.key); if(!list.length) return;
    const entries = list.map(t => {
      const e = { id: t.id, t, now: t.text, new: '', was: null }, o = old.get(t.id), a = db.get(t.id);
      if(o && o.new){
        e.new = o.new; e.was = o.was;
        if(e.was === null && norm(o.now) !== norm(t.text) && norm(o.new) !== norm(t.text) && !/\[.*\]/.test(o.new)) e.was = o.now;   // the page text changed under an answer
      } else if(a && (a.kept || norm(a.text))){
        e.new = a.kept ? '=' : norm(a.text);
        if(a.source && norm(a.source) !== norm(t.text) && norm(a.text) !== norm(t.text) && !/\[.*\]/.test(a.text || '')) e.was = norm(a.source);
      }
      if(e.was !== null && norm(e.new) === norm(e.now)) e.was = null;                    // the author's own text is on the page
      return e;
    });
    const c = counts(entries), name = String(i + 1).padStart(2, '0') + '-' + sec.key + '.md';
    const body = [`# ${sec.name}`, '', sec.desc, '', `Left here: ${c.todo} to write, ${c.check} to check again, ${c.note} notes, ${c.apply} to put on the page. Done: ${c.done + c.keep}.`,
      '', 'Write after `- new:`. Leave it empty = not done yet. `=` = keep the text as it is. `[..]` anywhere = a note for Claude. `{1}`, `{2}` stand for values the page fills in: keep them.', ''];
    for(const e of entries){
      const t = e.t, what = [t.kind, t.where, t.note].filter(Boolean).join(' · ');
      body.push(`### ${e.id}`, `- what: ${what}`, `- now: ${norm(e.now)}`);
      if(e.was !== null) body.push(`- was: ${e.was}`);
      body.push(`- new: ${e.new}`.trimEnd() + (e.new ? '' : ' '), '');
    }
    fs.writeFileSync(path.join(dir, name), body.join('\n'));
    rows.push(`| [${sec.name}](${name}) | ${c.todo} | ${c.check} | ${c.note} | ${c.apply} | ${c.done + c.keep} |`); total.push(...entries);
  });
  const c = counts(total), left = c.todo + c.check + c.note + c.apply;
  fs.writeFileSync(path.join(dir, 'README.md'), `# The rewrite list

Every text the page shows, one file per part of the page, with room for the author's own wording. The author edits these files and
pushes them; Claude pulls, puts the finished rewrites on the page in the next version and refreshes the files
(\`dev/tools/rewrites/repo.js\`, see \`dev/tools/rewrites/README.md\`).

**Left before V1.1: ${left}** (${c.todo} to write, ${c.check} to check again, ${c.note} notes for Claude, ${c.apply} written but not on the page yet).
Done: ${c.done + c.keep} of ${total.length}.

| Part of the page | To write | To check again | Notes | To put on the page | Done |
|---|---|---|---|---|---|
${rows.join('\n')}

## How to fill it in

\`\`\`
### T0123
- what: where the text shows
- now: the text on the page today
- new: your text
\`\`\`

- Write your text after \`- new:\`, on one line. Leave it empty while it is not done.
- \`- new: =\` keeps the text as it is.
- Anything with \`[..]\` in it is a note for Claude ("[remove this]", "[where is this shown?]"): it is never put on the page.
- \`{1}\`, \`{2}\` are values the page fills in (a number, a name). Keep them in your text.
- A \`- was:\` line means the page text changed after you wrote your answer (\`was\` is the old text). Check your answer against
  \`now\`, then delete the \`- was:\` line.
- Do not change the \`###\`, \`- what:\` and \`- now:\` lines: they are rewritten from the page every version.
`);
  console.log(total.length, 'texts in', rows.length, 'files;', JSON.stringify(c));
} else if(cmd === 'read'){
  const [dir, out] = args, d = path.join(out, 'rewrites'); fs.mkdirSync(d, { recursive: true }); let n = 0;
  for(const [id, e] of parse(dir)){ if(!e.new) continue; n++;
    fs.writeFileSync(path.join(d, id + '.json'), JSON.stringify({ kept: e.new === '=', text: e.new === '=' ? '' : e.new, source: e.was !== null ? e.was : e.now })); }
  console.log(n, 'answers');
} else if(cmd === 'status'){
  const c = counts([...parse(args[0]).values()]), left = c.todo + c.check + c.note + c.apply;
  for(const k of Object.keys(LABEL)) console.log(String(c[k]).padStart(5), LABEL[k]);
  console.log(left ? `${left} left: no V1.1 yet` : 'nothing left: the rewrite is done and on the page');
  process.exit(left ? 1 : 0);
} else { console.error('node repo.js write|read|status ... (see the header)'); process.exit(2); }
