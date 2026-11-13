// strings.json (extract.js) -> texts.json: noise dropped, duplicates merged, grouped by where they show on the page (page order),
// with a "where it shows" note, and the IDs of the previous list kept for the same text (new text gets the next free ID).
// node clean.js <page.html> <previous ids list (texts_ids.json)> <strings.json from extract.js> <out dir>
//   writes <out dir>/texts.json (every text, with id, sec, area, note, isNew, changedFrom) and <out dir>/sections.json
const fs = require('fs');
const page = process.argv[2];
const H = fs.readFileSync(page, 'utf8'), HL = H.split('\n');
const path = require('path');
const s = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const OUT = process.argv[5] || '.';
const lineOf = needle => { const i = HL.findIndex(l => l.includes(needle)); if(i < 0) throw new Error('marker not found: ' + needle); return i + 1; };

const drop = x => {
  if(x.src !== 'js') return false;
  const bare = x.text.replace(/\{[^}]*\}/g, '');
  if(!/ /.test(bare) && /^[\w{}\[\]'().-]*-[\w{}]*$/.test(x.text) && !/^[A-Z]/.test(x.text)) return true;   // tags like {1}-clash
  if(/^(MF|MC|diff|rule-chip|glimmith-\{)/.test(x.text)) return true;
  if(/^\{.*\}px$/.test(x.text)) return true;
  if(/^deep (join|apart)$/.test(x.text)) return true;
  if(x.context === 'IMPORT_TEXT_RULES') return true;
  if(/monospace|^ded-new|prefers-color-scheme|^no indexedDB$|^Glimmith editor v\d+$/.test(x.text)) return true;   // never on screen
  return false;
};

// ---- sections, in page order ----
const SECTIONS = [
  ['top', 'Top of the page', 'The title, the save status and the buttons in the top bar.'],
  ['credits', 'Credits window', 'Opens with the Credits button.'],
  ['library', 'Puzzle list, import and export', 'The puzzle list at the top of the Puzzle Grid panel, its buttons, the Fast import box, the import report and the messages an import or export can show.'],
  ['grid', 'Grid size, tools and key', 'Width and height, the clear buttons, the grid itself and the key of what each key draws.'],
  ['shapes', 'Shape editor, Shape Bank and Omits', 'The side panel next to the grid.'],
  ['rules', 'Rules', 'The Rules panel: adding a rule and the rule chips (including what it says when there are no rules).'],
  ['solver', 'Solver', 'The Solver panel: buttons, options, progress and the result after a solve.'],
  ['steps', 'Step-by-step reasoning', 'The step-by-step view: step titles, explanations and captions.'],
  ['why', 'Why something is impossible', 'Short reasons the solver gives. They show in the solver result ("Impossible: …") and inside step-by-step explanations ("this breaks: …").'],
  ['footer', 'Rule explanations (bottom of the page)', 'The "Rules with improved deduction logic" list and what each i button opens.'],
  ['custom', 'Custom rules button', 'The button at the very bottom of the page.'],
  ['other', 'Other messages', 'Messages that are not tied to one place on the page.'],
];
const ORDER = new Map(SECTIONS.map(([k], i) => [k, i]));
const B = {
  credits: lineOf('<dialog id="creditsDialog"'), library: lineOf('<section class="panel" id="puzzlePanel"'), grid: lineOf('<label for="puzzleW">') - 2,
  shapes: lineOf('<aside class="panel" id="shapePanel"'), rules: lineOf('id="rulesPanel"'), solver: lineOf('<section class="panel solver-panel"'),
  steps: lineOf('<section class="steps-viewer"'), footer: lineOf('<footer class="improved-footer"'), custom: lineOf('<div class="custom-bar">'),
  core0: lineOf('// ================= SOLVER CORE (pure'), import0: lineOf('// ================= IMPORT CORE (pure'), import1: lineOf('// ================= END IMPORT CORE'),
};
const FN = {
  top: ['setSavedIndicator', 'isDark', 'paintThemeBtn'],
  library: ['collectPuzzles', 'FILE_SOLUTION_LABEL', 'library', 'STARTER_PUZZLES', 'switchPuzzle', 'item', 'newPuzzle', 'renderLibrary', 'join', 'showAssumedRules',
            'importFiles', 'bits', 'fastRender', 'fastRun', 'fastPick', 'attachFastImport', 'normalizeState', 'exportPuzzles', 'readOwnExport', 'deleteActivePuzzle', 'name'],
  grid: ['handlePolyominoKey', 'attachEvents'],
  shapes: ['addShapeToBank', 'addShapeToBan', 'renderBan', 'renderBank'],
  rules: ['BOOLEAN_RULE_LABELS', 'addSizeRule', 'renderRuleChips'],
  solver: ['parseLimitInput', 'n', 's', 'readSolverLimits', 'fmtDuration', 'createProgressTracker', 'updateSlowNote', 'pctNote', 'runSolver', 'readDeduceSettings', 'runDeduce',
           'underLimits', 'assuming', 'finishSolver', 'note', 'capNote', 'runGuessLayer', 'exp', 'fileSolutionNote'],
  steps: ['STEP_INFO', 'STEP_WHY_EXTRA', 'out', 'stepTexts', 'stepTextsBase', 'meta', 'mark', 'what', 'lead', 'concl', 'title', 'other', 'makeFinalStep', 'view', 'renderStepsView', 'replayDeductionTrace'],
  custom: ['setCustomRules'],
};
const fnSection = new Map(); for(const [k, fs_] of Object.entries(FN)) for(const f of fs_) fnSection.set(f, k);
const sectionOf = x => {
  if(x.src === 'html'){
    const l = x.line;
    if(l < B.credits) return 'top';
    if(l < B.library) return 'credits';
    if(l < B.grid) return 'library';
    if(l < B.shapes) return 'grid';
    if(l < B.rules) return 'shapes';
    if(l < B.solver) return 'rules';
    if(l < B.steps) return 'solver';
    if(l < B.footer) return 'steps';
    if(l < B.custom) return 'footer';
    return 'custom';
  }
  if(x.line >= B.core0 && x.line < B.import0) return 'why';
  if(x.line >= B.import0 && x.line <= B.import1) return 'library';
  const f = (x.context || '').split(' › ')[0];
  if(!f && /STEP_INFO\[/.test(HL[x.line - 1] || '')) return 'steps';
  return fnSection.get(f) || 'other';
};
const KIND_NOTE = {
  'tooltip': 'Tooltip: shows when you hover over it.',
  'screen-reader label': 'Not shown on screen: read out by screen readers (it names the control for them).',
  'placeholder': 'Grey hint text inside an empty box.',
  'browser tab title': 'The name in the browser tab.',
  'menu option': 'An option in a drop-down menu.',
  'error message': 'An error message, shown when something goes wrong (often in the import report).',
};
const jsNote = (x, sec) => {
  if(sec === 'why') return 'Reason shown after "Impossible:" in the solver result and inside step-by-step explanations.';
  if(/^STEP_INFO/.test(x.context)) return 'Title or explanation of a step in the step-by-step view.';
  if(sec === 'library' && x.line >= B.import0 && x.line <= B.import1) return 'Shown in the import report when a file can not be read as expected.';
  return 'Built by the page while it runs, so it only shows in some situations.';
};

// ---- merge duplicates ----
const groups = new Map();
for(const x of s){
  if(drop(x)) continue;
  const k = x.kind + '\u0000' + x.text + '\u0000' + JSON.stringify(x.slots || []);
  if(!groups.has(k)) groups.set(k, { ...x, lines: [x.line] }); else groups.get(k).lines.push(x.line);
}
let items = [...groups.values()].map(x => {
  const sec = sectionOf(x);
  const note = [x.note || '', KIND_NOTE[x.kind] || '', x.src === 'js' && !KIND_NOTE[x.kind] ? jsNote(x, sec) : ''].filter(Boolean).join(' ');
  return { sec, area: SECTIONS[ORDER.get(sec)][1], kind: x.kind, where: x.context, lines: x.lines, text: x.text, slots: x.slots || [], note };
});

// ---- keep the old IDs ----
const old = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const key = t => t.kind + '\u0000' + t.text + '\u0000' + JSON.stringify(t.slots || []);
const oldByKey = new Map(old.map(t => [key(t), t.id]));
const used = new Set();
for(const it of items){ const id = oldByKey.get(key(it)); if(id && !used.has(id)){ it.id = id; used.add(id); } }
// a text that changed in place (same code spot and kind): keep its ID, so a rewrite stays attached (the page flags the change)
const oldFree = old.filter(t => !used.has(t.id));
for(const it of items.filter(i => !i.id)){
  const m = oldFree.find(t => !used.has(t.id) && t.kind === it.kind && t.where && t.where === it.where && (it.kind !== 'text' || it.where));
  if(m){ it.id = m.id; used.add(m.id); it.changedFrom = m.text; }
}
let next = Math.max(...old.map(t => +t.id.slice(1))) + 1;
for(const it of items.sort((a, b) => a.lines[0] - b.lines[0])) if(!it.id){ it.id = 'T' + String(next++).padStart(4, '0'); it.isNew = true; }
const gone = old.filter(t => !used.has(t.id));

// ---- page order: section, then line ----
items.sort((a, b) => ORDER.get(a.sec) - ORDER.get(b.sec) || a.lines[0] - b.lines[0]);
fs.writeFileSync(path.join(OUT, 'texts.json'), JSON.stringify(items, null, 1));
fs.writeFileSync(path.join(OUT, 'sections.json'), JSON.stringify(SECTIONS.map(([k, name, desc]) => ({ key: k, name, desc }))));
const c = {}; for(const x of items) c[x.area] = (c[x.area] || 0) + 1;
console.log(items.length, 'texts;', items.filter(x => x.isNew).length, 'new;', items.filter(x => x.changedFrom).length, 'changed in place;', gone.length, 'gone');
console.log(c);
for(const x of items.filter(x => x.isNew || x.changedFrom)) console.log(x.isNew ? 'NEW' : 'CHANGED', x.id, x.sec, '|', x.text.slice(0, 90), x.changedFrom ? '  <- was: ' + x.changedFrom.slice(0, 60) : '');
for(const g of gone) console.log('GONE', g.id, '|', g.text.slice(0, 90));
