// Turns the rewrites saved on the rewrite page into exact source replacements for a page version.
// node gen_rewrites.js <page.html> <strings-with-positions.json> <texts.json> <rewrites.json> <out.json>
// out: [{ id, start, end, old, new }] sorted by start; every old is the exact source slice at [start, end).
'use strict';
const fs = require('fs');
const [, , pagePath, stringsPath, textsPath, rwPath, outPath] = process.argv;
const H = fs.readFileSync(pagePath, 'utf8');
const S = JSON.parse(fs.readFileSync(stringsPath, 'utf8'));
const T = new Map(JSON.parse(fs.readFileSync(textsPath, 'utf8')).map(t => [t.id, t]));
const R = JSON.parse(fs.readFileSync(rwPath, 'utf8'));
const key = x => x.kind + '\u0000' + x.text + '\u0000' + JSON.stringify(x.slots || []);
const byKey = new Map(); for(const s of S){ const k = key(s); if(!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(s); }

const ALLOWED = /^<\/?(b|i|em|strong|code|kbd|sub|sup|small)>$|^<br\s*\/?>$/i;
const escHtml = t => t.replace(/<[^>]*>|[<>]|&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, m => ALLOWED.test(m) ? m : m === '&' ? '&amp;' : m.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
const escAttr = t => t.replace(/&(?![a-zA-Z]+;|#\d+;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const jsTemplate = (t, slots) => {
  let out = '`';
  for(const part of t.split(/(\{\d+\})/)){
    const m = /^\{(\d+)\}$/.exec(part);
    if(m){ const e = slots[+m[1] - 1]; if(e === undefined) throw new Error('unknown mark ' + part + ' in: ' + t); out += '${' + e + '}'; }
    else out += part.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  }
  return out + '`';
};

// fixes agreed after reading the rewrites (reported to the author): id -> function on the new text, or null to skip for now
const FIX = {
  T0852: t => t.replace('vertical walls', 'horizontal walls'),   // the message is for horizontal walls
  T0546: t => t.replace(/^,\s*/, ', '),                         // ",all" -> ", all"
  T0345: null,                                                   // unfinished sentence: left for the author
};
const out = [], problems = [];
for(const r of R){
  if(r.kept || !r.text || !r.text.trim() || /\[.*\]/.test(r.text)) continue;
  const t = T.get(r.id);
  if(!t){ problems.push(`${r.id}: not in the list`); continue; }
  const occ = byKey.get(key(t)) || [];
  if(!occ.length){ problems.push(`${r.id}: "${t.text.slice(0, 50)}" not found in this page version`); continue; }
  let nt = r.text.trim();
  if(r.id in FIX){ if(FIX[r.id] === null){ problems.push(`${r.id}: skipped (unfinished)`); continue; } nt = FIX[r.id](nt); problems.push(`${r.id}: fixed to "${nt.slice(0, 60)}"`); }
  for(const s of occ){
    const p = s.pos, old = H.slice(p.start, p.end);
    let rep;
    if(p.mode === 'attr') rep = `${p.attr}="${escAttr(nt)}"`;
    else if(p.mode === 'inner' || p.mode === 'textnode'){ const lead = /^\s*/.exec(old)[0], trail = /\s*$/.exec(old)[0]; rep = lead + escHtml(nt) + trail; }
    else if(p.mode === 'js'){
      const used = new Set((nt.match(/\{\d+\}/g) || []).map(x => +x.slice(1, -1)));
      (s.slots || []).forEach((e, i) => { if(!used.has(i + 1)) problems.push(`${r.id}: note, {${i + 1}} (${e.slice(0, 40)}) is not used in the new text`); });
      // keep the spaces a joined string starts or ends with (it is glued to other text), unless the new text starts with punctuation
      let jt = nt;
      const lead = (/^['"`](\s+)/.exec(old) || [])[1], trail = (/(\s+)['"`]$/.exec(old) || [])[1];
      if(lead && !/^\s/.test(jt) && !/^[,.;:!?)]/.test(jt)) jt = lead + jt;
      if(trail && !/\s$/.test(jt)) jt = jt + trail;
      rep = jsTemplate(jt, s.slots || []);
    } else { problems.push(`${r.id}: unknown position mode ${p.mode}`); continue; }
    out.push({ id: r.id, start: p.start, end: p.end, old, new: rep });
  }
}
out.sort((a, b) => a.start - b.start);
for(let i = 1; i < out.length; i++) if(out[i].start < out[i - 1].end) problems.push(`overlap: ${out[i - 1].id} and ${out[i].id}`);
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(out.length, 'replacements from', new Set(out.map(o => o.id)).size, 'rewrites');
for(const p of problems) console.log('NOTE', p);
