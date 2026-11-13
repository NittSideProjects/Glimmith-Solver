// Extracts every user-visible string from the Glimmith solver page.
// node extract.js <page.html> <out.json>
'use strict';
const fs = require('fs');
const acorn = require('acorn');
const walk = require('acorn-walk');
const { JSDOM } = require('jsdom');

const [, , pagePath, outPath] = process.argv;
const html = fs.readFileSync(pagePath, 'utf8');
const lineOf = idx => html.slice(0, idx).split('\n').length;
const out = [];

// ---------------- HTML markup ----------------
{
  const noScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, m => m.replace(/[^\n]/g, ' '));
  const dom = new JSDOM(noScripts, { includeNodeLocations: true });
  const doc = dom.window.document;
  const ctxOf = el => {
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (e.id) return '#' + e.id;
    }
    return '';
  };
  const sectionOf = el => {
    // nearest preceding heading in document order inside the same big section
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const h = e.querySelector && e.querySelector('h1,h2,h3,summary,.steps-heading');
      if (h && h !== el && !el.contains(h)) return h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60);
    }
    return '';
  };
  const ID_NOTES = {
    creditsDialog: 'In the Credits window (opens with the Credits button).',
    fastImportBox: 'In the Fast import box, which opens the first time you click Fast import, or with Folders….',
    importLogBox: 'Under the puzzle list, after an import.',
    solverTuning: 'Never shown: inside the hidden "Solver tuning" settings.',
    deduceLegend: 'Never shown: the page hides this legend.',
    stepsViewer: 'In the step-by-step view (opens with "Show the step-by-step reasoning" after a solve).',
    solverInfo: 'Shows when you click the i next to "Solver".',
    fastFoldersBtn: 'Button that only shows once Fast import has remembered a folder.',
    showFileSolutionBtn: 'Button that only shows for an imported puzzle with a stored solution.',
    ruleValueField: 'Only shows for rules that need a number.',
    cancelSolveBtn: 'Button that only shows while the solver runs.',
    skipScanBtn: 'Button that only shows while the solver runs.',
    guessRow: 'Only shows after some solves.',
    stepsBtn: 'Button that shows after a solve.',
  };
  const noteOf = el => {
    const out = [];
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      if (e.id && ID_NOTES[e.id]) out.push(ID_NOTES[e.id]);
      else if (e.id && /^impInfo_/.test(e.id)) out.push('Shows when you click the i next to this rule.');
      if (e.classList && e.classList.contains('custom-only') && !out.some(x => /custom rules are on/.test(x))) out.push('Only shows when custom rules are on (button at the bottom of the page).');
      if (e.getAttribute && /display:\s*none/.test(e.getAttribute('style') || '') && e.hasAttribute('hidden') && !e.id) out.push('Never shown: this row is hidden.');
    }
    return [...new Set(out)].join(' ');
  };
  const loc = n => { try { const l = dom.nodeLocation(n); return l ? l.startLine : 0; } catch (e) { return 0; } };
  const INLINE = new Set(['B','STRONG','I','EM','CODE','KBD','SUB','SUP','A','SMALL','MARK','U','S','BR','ABBR','Q']);
  const IGNORE = new Set(['INPUT','SELECT','TEXTAREA','SVG','IMG','CANVAS','STYLE','SCRIPT']);
  const inlineOnly = el => [...el.childNodes].every(c => c.nodeType !== 1 || IGNORE.has(c.tagName.toUpperCase()) || (INLINE.has(c.tagName) && inlineOnly(c)));
  const ser = el => [...el.childNodes].map(c => c.nodeType === 3 ? c.textContent : c.nodeType !== 1 || IGNORE.has(c.tagName.toUpperCase()) ? '' : c.tagName === 'BR' ? '<br>' : '<' + c.tagName.toLowerCase() + '>' + ser(c) + '</' + c.tagName.toLowerCase() + '>').join('');
  const attrs = n => {
    for (const a of ['title', 'aria-label', 'placeholder', 'alt']) {
      const v = n.getAttribute && n.getAttribute(a);
      let pos = null; try { const L = dom.nodeLocation(n); if (L && L.attrs && L.attrs[a]) pos = { mode: 'attr', attr: a, start: L.attrs[a].startOffset, end: L.attrs[a].endOffset }; } catch (e) {}
      if (v && /[A-Za-z]/.test(v)) out.push({ src: 'html', line: loc(n), kind: a === 'title' ? 'tooltip' : a === 'aria-label' ? 'screen-reader label' : a, context: ctxOf(n), section: sectionOf(n), note: noteOf(n), text: v.trim(), pos });
    }
  };
  const innerPos = el => {
    try {
      const L = dom.nodeLocation(el); if (!L || !L.startTag || !L.endTag) return null;
      if ([...el.childNodes].some(c => c.nodeType === 1 && IGNORE.has(c.tagName.toUpperCase()))) {      // a label holding an input: only its text
        const tn = [...el.childNodes].filter(c => c.nodeType === 3 && /[A-Za-z]/.test(c.textContent));
        if (tn.length !== 1) return null;
        const T = dom.nodeLocation(tn[0]); return T ? { mode: 'textnode', start: T.startOffset, end: T.endOffset } : null;
      }
      return { mode: 'inner', start: L.startTag.endOffset, end: L.endTag.startOffset };
    } catch (e) { return null; }
  };
  const textPos = n => { try { const T = dom.nodeLocation(n); return T ? { mode: 'textnode', start: T.startOffset, end: T.endOffset } : null; } catch (e) { return null; } };
  const emit = (p, t, line, pos) => {
    t = t.replace(/\s+/g, ' ').trim();
    if (!t || !/[A-Za-z]/.test(t.replace(/<[^>]+>/g, ''))) return;
    const kind = p.tagName === 'OPTION' ? 'menu option' : /<[a-z]/.test(t) ? 'text (keep the <b>/<i> tags or drop them)' : 'text';
    out.push({ src: 'html', line, kind, context: ctxOf(p), section: sectionOf(p), note: noteOf(p), text: t, pos: pos || null });
  };
  const visit = (el) => {
    if (el.nodeType === 1) {
      if (el.tagName === 'SELECT') { attrs(el); [...el.querySelectorAll('option')].forEach(o => { attrs(o); emit(o, o.textContent, loc(o), innerPos(o)); }); return; }
      if (IGNORE.has(el.tagName.toUpperCase())) { attrs(el); return; }
      attrs(el);
      el.querySelectorAll && [...el.querySelectorAll('*')].forEach(d => { if (inlineOnly(el) && d !== el) attrs(d); });
      if (el.tagName === 'TEMPLATE') { [...el.content.childNodes].forEach(visit); return; }
      if (inlineOnly(el)) { emit(el, ser(el), loc(el), innerPos(el)); return; }
    }
    for (const c of el.childNodes) {
      if (c.nodeType === 3) emit(el, c.textContent, loc(c) || loc(el), textPos(c));
      else if (c.nodeType === 1) visit(c);
    }
  };
  const t = doc.querySelector('title');
  if (t) out.push({ src: 'html', line: loc(t), kind: 'browser tab title', context: '', section: '', text: t.textContent.trim(), pos: innerPos(t) });
  [...doc.body.childNodes].forEach(c => c.nodeType === 1 ? visit(c) : c.nodeType === 3 && emit(doc.body, c.textContent, loc(c), textPos(c)));
}

// ---------------- JavaScript strings ----------------
{
  const re = /<script>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const code = m[1], base = m.index + '<script>'.length;
    if (code.length < 2000) continue;            // the tiny theme bootstrap
    const ast = acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'script', locations: false });
    const consumed = new Set();
    const NON_TEXT_CALLS = /^(querySelector(All)?|getElementById|getElementsBy\w+|closest|matches|createElement|createElementNS|addEventListener|removeEventListener|setAttribute|getAttribute|removeAttribute|hasAttribute|toggleAttribute|add|remove|toggle|contains|require|getItem|setItem|removeItem|split|join|replace|replaceAll|startsWith|endsWith|includes|indexOf|lastIndexOf|padStart|padEnd|toFixed|toLocaleString|postMessage|dispatchEvent|CustomEvent|Event|Blob|log|warn|error|info|debug|time|timeEnd|getContext|setProperty|getPropertyValue|fillText|measureText|has|get|set|delete|test|exec|match|charCodeAt|fromCharCode|localeCompare|Map|Set|RegExp|define|scrollIntoView|focus|insertAdjacentHTML|insertAdjacentElement|animate|getPropertyValue)$/;
    const SAFE_TEXT_CALLS = /^(showToast|alert|confirm|prompt|setStatus|status|msg|report|note|say|label|title)$/i;

    // contexts: enclosing named function / const / property key path
    const ancestorsInfo = (ancestors) => {
      let fn = '', decl = '', keys = [];
      for (let i = ancestors.length - 1; i >= 0; i--) {
        const a = ancestors[i];
        if (!fn && (a.type === 'FunctionDeclaration') && a.id) fn = a.id.name;
        if (!fn && a.type === 'VariableDeclarator' && a.init && /Function/.test(a.init.type)) fn = a.id.name;
        if (!decl && a.type === 'VariableDeclarator' && a.id && a.id.name && !/Function/.test((a.init || {}).type || '')) decl = a.id.name;
        if (a.type === 'Property' && a.key && i < ancestors.length - 1 && ancestors[i + 1] === a.value) {
          keys.unshift(a.key.type === 'Identifier' ? a.key.name : String(a.key.value));
        }
      }
      return { fn, decl, keys };
    };

    const exprText = (node) => {
      // flatten a + chain; returns { text, parts } or null if no string involved
      if (node.type === 'Literal' && typeof node.value === 'string') return node.value;
      if (node.type === 'TemplateLiteral') {
        let s = '';
        node.quasis.forEach((q, i) => { s += q.value.cooked; if (node.expressions[i]) s += '\u0001' + code.slice(node.expressions[i].start, node.expressions[i].end).replace(/\s+/g, ' ') + '\u0002'; });
        return s;
      }
      if (node.type === 'BinaryExpression' && node.operator === '+') {
        const l = exprText(node.left), r = exprText(node.right);
        if (l === null && r === null) return null;
        const f = (x, n) => x !== null ? x : '\u0001' + code.slice(n.start, n.end).replace(/\s+/g, ' ') + '\u0002';
        return f(l, node.left) + f(r, node.right);
      }
      return null;
    };
    const markConsumed = (node) => {
      walk.full(node, n => { if (n.type === 'Literal' || n.type === 'TemplateLiteral') consumed.add(n); });
    };

    const looksLikeText = (s) => {
      const t = s.replace(/\u0001[^\u0002]*\u0002/g, ' X ').replace(/<[^>]+>/g, ' ').trim();
      if (!/[A-Za-z]{2}/.test(t)) return false;
      if (/^[#.]?[a-z0-9_-]+$/i.test(t) && !/^[A-Z][a-z]+$/.test(t)) return false;      // ids, classes, keys
      if (/^[a-z][A-Za-z0-9_]*$/.test(t)) return false;                                // identifiers
      if (/^(rgba?|hsla?|var|url|translate|rotate|scale|calc)\(/.test(t)) return false;
      if (/^[\w-]+\s*:\s*[^ ]+;?(\s*[\w-]+\s*:\s*[^;]+;?)*$/.test(t) && !/ [a-z]+ [a-z]+ /.test(t)) return false; // css
      if (/^[\w.#\[\]=":\s>*~+-]+$/.test(t) && /(^|[\s>,])[.#\[][a-z]/i.test(t) && !/ [a-z]{3,} [a-z]{3,}/.test(t)) return false; // selectors
      if (/^(M|L|C|Z|m|l|c|z|A|a)\s*-?\d[\d .,-]*/.test(t)) return false;                 // svg path ("A group ..." is text)
      if (/^(\d+(\.\d+)?(px|em|%|s|ms)?\s*)+$/.test(t)) return false;
      if (/^(application|text|image)\/[\w.+-]+$/.test(t)) return false;
      return true;
    };

    const isNonTextPosition = (node, ancestors) => {
      const parent = ancestors[ancestors.length - 2];
      if (!parent) return false;
      if (parent.type === 'Property' && parent.key === node) return true;
      if (parent.type === 'MemberExpression' && parent.property === node) return true;
      if (parent.type === 'BinaryExpression' && /^(===|!==|==|!=|in|instanceof|<|>|<=|>=)$/.test(parent.operator)) return true;
      if (parent.type === 'SwitchCase') return true;
      if (parent.type === 'ImportExpression') return true;
      // method calls that take keys, selectors, names
      for (let i = ancestors.length - 2; i >= 0; i--) {
        const a = ancestors[i];
        if (a.type === 'CallExpression' || a.type === 'NewExpression') {
          const c = a.callee;
          const name = c.type === 'Identifier' ? c.name : c.type === 'MemberExpression' && c.property.type === 'Identifier' ? c.property.name : '';
          const objName = c.type === 'MemberExpression' && c.object.type === 'Identifier' ? c.object.name : '';
          if (objName === 'console') return true;
          if (name === 'setAttribute' && a.arguments[0] && (a.arguments[1] === ancestors[i + 1] || a.arguments[1] === node)) {
            const attr = a.arguments[0].value;
            return !/^(title|aria-label|placeholder|alt|aria-description)$/.test(attr);
          }
          if (SAFE_TEXT_CALLS.test(name)) return false;
          if (NON_TEXT_CALLS.test(name)) return a.arguments.includes(ancestors[i + 1]) || a.arguments.includes(node);
          break;
        }
        if (/Statement|Declarator|Property|Assignment|Return/.test(a.type)) break;
      }
      return false;
    };

    walk.fullAncestor(ast, (node, _st, ancestors) => {
      const isStr = (node.type === 'Literal' && typeof node.value === 'string') || node.type === 'TemplateLiteral';
      const isChain = node.type === 'BinaryExpression' && node.operator === '+';
      if (!isStr && !isChain) return;
      if (consumed.has(node)) return;
      // only the outermost + chain
      const parent = ancestors[ancestors.length - 2];
      if (parent && parent.type === 'BinaryExpression' && parent.operator === '+' && exprText(parent) !== null) return;
      if (parent && parent.type === 'TaggedTemplateExpression') return;
      const text = exprText(node);
      if (text === null) return;
      if (isNonTextPosition(node, ancestors)) { markConsumed(node); return; }
      if (parent && parent.type === 'NewExpression' && parent.callee.name === 'RegExp') return;
      markConsumed(node);
      if (!looksLikeText(text)) return;
      const info = ancestorsInfo(ancestors);
      // assignment target context (el.textContent = ..., el.title = ...)
      let target = '';
      for (let i = ancestors.length - 2; i >= 0; i--) {
        const a = ancestors[i];
        if (a.type === 'AssignmentExpression' && a.left.type === 'MemberExpression' && a.left.property.type === 'Identifier') { target = a.left.property.name; break; }
        if (/Statement|Declarator/.test(a.type)) break;
      }
      let kind = 'message';
      if (/innerHTML|outerHTML/.test(target) || /<[a-z][^>]*>/i.test(text)) kind = 'message (contains HTML tags: keep them)';
      if (target === 'title') kind = 'tooltip';
      for (let i = ancestors.length - 2; i >= 0; i--) {
        const a = ancestors[i];
        if (a.type === 'ThrowStatement' || (a.type === 'NewExpression' && a.callee.name === 'Error')) { kind = 'error message'; break; }
      }
      const where = [info.decl || info.fn, info.keys.join('.')].filter(Boolean).join(' › ');
      const slots = [];
      const numbered = text.replace(/\u0001([^\u0002]*)\u0002/g, (_, e) => { slots.push(e); return '{' + slots.length + '}'; });
      out.push({ src: 'js', line: lineOf(base + node.start), kind, context: where, section: info.fn || '', text: numbered.replace(/\s+/g, ' ').trim(), slots, pos: { mode: 'js', start: base + node.start, end: base + node.end } });
    });
  }
}

out.sort((a, b) => a.line - b.line);
fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(out.length, 'strings;', out.filter(x => x.src === 'html').length, 'from markup,', out.filter(x => x.src === 'js').length, 'from scripts');
