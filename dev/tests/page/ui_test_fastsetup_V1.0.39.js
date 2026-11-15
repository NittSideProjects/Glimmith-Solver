// V1.0.38 / V1.0.39: Fast import's one-click setup, the only way since V1.0.39. (1) the setup file: glimmith-setup.bat, made next to where it runs, CRLF, junctions only;
// (2) one folder holding both (the folder of links): chosen once, both kinds of puzzles in one click; (3) a browser that can not
// remember folders does not see the setup (it could not use it).
// node ui_test_fastsetup_V1.0.39.js ../glimmith_solver_V1.0.39.html   (needs fixtures/folders.zip and the unzip command)
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path'), cp = require('child_process'), os = require('os');
const file = process.argv[2] || '../glimmith_solver_V1.0.39.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (n, c, x) => { if(c) pass++; else { fail++; console.log('FAIL:', n, x !== undefined ? '-> ' + JSON.stringify(x) : ''); } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fastimp-'));
cp.execFileSync('unzip', ['-q', '-o', path.join(__dirname, '..', '..', 'fixtures', 'folders.zip'), '-d', tmp]);
const rd = p => fs.readFileSync(path.join(tmp, p));
async function page(){
  const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(win){ win.TextDecoder = TextDecoder; win.TextEncoder = TextEncoder; win.HTMLCanvasElement.prototype.getContext = () => null; } });
  const { window } = dom; const store = new Map();
  window.storage = { get: async k => store.has(k) ? { key:k, value: store.get(k) } : null, set: async (k, v) => { store.set(k, v); return { key:k, value:v }; },
    delete: async k => { store.delete(k); return { key:k, deleted:true }; }, list: async () => ({ keys: [...store.keys()] }) };
  const errors = []; window.addEventListener('error', e => errors.push(String(e.message)));
  await sleep(300);
  return { window, doc: window.document, $: id => window.document.getElementById(id), errors };
}
const names = P => [...P.$('puzzleSelect').options].map(o => o.textContent);
const settle = async P => { for(let i = 0; i < 200; i++){ await sleep(50); if(P.$('importBtn').textContent === 'Import puzzles…' && !P.$('importBtn').disabled) break; } await sleep(80); };
(async () => {
  // ---- 1. the setup file ----
  let P = await page();
  P.window.showDirectoryPicker = async () => null;
  let blob = null; P.window.URL.createObjectURL = b => { blob = b; return 'blob:test'; }; P.window.URL.revokeObjectURL = () => {};
  let dlName = null; P.window.HTMLAnchorElement.prototype.click = function(){ dlName = this.download; };
  P.$('fastImportBtn').click(); await sleep(80);
  check('the setup block shows where folders can be remembered', !P.$('fastSetup').hidden && /Glimmith puzzles/.test(P.$('fastSetup').textContent));
  check('the page says what the file does', /next to itself/.test(P.$('fastSetup').textContent) && /nothing is copied or moved/.test(P.$('fastSetup').textContent) && /administrator/.test(P.$('fastSetup').textContent));
  P.$('fastSetupBtn').click(); await sleep(50);
  const bat = blob ? Buffer.from(await blob.arrayBuffer()).toString('utf8') : '';
  check('a file glimmith-setup.bat is downloaded', dlName === 'glimmith-setup.bat' && bat.length > 200, [dlName, bat.length]);
  check('Windows line ends', bat.includes('\r\n') && !/[^\r]\n/.test(bat));
  check('the folder is made next to the file (%~dp0)', /set "DEST=%~dp0Glimmith puzzles"/.test(bat));
  check('two junctions, nothing copied or deleted', (bat.match(/mklink \/J/g) || []).length === 2 && !/\b(copy|xcopy|robocopy|del|rmdir|rd|move)\b/i.test(bat.replace(/^rem .*$/gim, '')));
  check('the workshop and the own puzzles folders', bat.includes('steamapps\\workshop\\content\\4160210') && bat.includes('%LOCALAPPDATA%\\Geri\\Saved\\workshop'));
  check('no ( ) blocks (a path with "(x86)" would end them)', !/\(\s*$/m.test(bat) && !/^\s*\)/m.test(bat));
  blob = null; P.$('fastSetupShBtn').click(); await sleep(50);
  const sh = blob ? Buffer.from(await blob.arrayBuffer()).toString('utf8') : '';
  check('a file glimmith-setup.sh is downloaded (Linux)', dlName === 'glimmith-setup.sh' && sh.startsWith('#!/bin/sh') && !sh.includes('\r'), [dlName, sh.length]);
  check('the Linux folder is made next to the file, with two symbolic links', sh.includes('DEST="$(cd "$(dirname "$0")" && pwd)/Glimmith puzzles"') && (sh.match(/ln -s /g) || []).length === 1 && /link downloaded/.test(sh) && /link made/.test(sh));
  check('Linux: workshop and the Proton prefix, Flatpak Steam too', sh.includes('steamapps/workshop/content/$APP') && sh.includes('compatdata/$APP/pfx/drive_c/users/steamuser/AppData/Local/Geri/Saved/workshop') && sh.includes('com.valvesoftware.Steam'));
  check('Linux: nothing copied or deleted', !/\b(cp|mv|rm|rsync)\b/.test(sh.replace(/^#.*$/gm, '')));
  check('the old ways are gone (game folders, read once, blocked help)', !P.$('fastPick_steam') && !P.$('fastPick_own') && !P.$('fastOnce_steam') && !P.$('fastBlocked') && !/4160210/.test(P.$('fastImportBox').textContent.replace(/setup/g, '')));
  check('the page says how to run each file', /double-click/.test(P.$('fastSetup').textContent) && /sh glimmith-setup\.sh/.test(P.$('fastSetup').textContent));
  check('no script errors (1)', P.errors.length === 0, P.errors);
  // ---- 2. one folder holding both ----
  P = await page();
  const fileH = rel => ({ kind: 'file', name: path.basename(rel), getFile: async () => new P.window.File([rd(rel)], path.basename(rel)) });
  const dirH = (name, kids) => ({ kind: 'directory', name, entries: async function*(){ for(const k of kids) yield [k.name, k]; }, queryPermission: async () => 'granted', requestPermission: async () => 'granted' });
  const both = dirH('Glimmith puzzles', [dirH('downloaded', [dirH('x1', [fileH('x1/puzzle'), fileH('x1/metadata')])]), dirH('made', [dirH('x2', [fileH('x2/puzzle'), fileH('x2/metadata')])])]);
  let picks = 0; P.window.showDirectoryPicker = async () => { picks++; return both; };
  const b0 = names(P).length;
  P.$('fastImportBtn').click(); await sleep(80);
  P.$('fastPick_both').click(); await sleep(80);
  check('the folder of links is chosen and shown', /Glimmith puzzles/.test(P.$('fastStatus_both').textContent) && !P.$('fastRunBtn').hidden, P.$('fastStatus_both').textContent);
  P.$('fastRunBtn').click(); await settle(P);
  check('Import now: the puzzles of both links', names(P).length === b0 + 2 && /2 puzzles imported/.test(P.$('importLogSummary').textContent), [names(P), P.$('importLogSummary').textContent]);
  P.$('fastCloseBtn').click(); await sleep(20);
  const pk = picks; P.$('fastImportBtn').click(); await settle(P);
  check('later: one click, no folder dialog', picks === pk && P.$('fastImportBox').hidden && /already in the list/.test(P.$('importLogSummary').textContent), [picks, pk, P.$('importLogSummary').textContent]);
  P.$('fastFoldersBtn').click(); await sleep(30); P.$('fastForgetBtn').click(); await sleep(80);
  check('Forget folders clears it too', P.$('fastStatus_both').textContent === '' && P.$('fastRunBtn').hidden);
  check('no script errors (2)', P.errors.length === 0, P.errors);
  // ---- 3. a browser that can not remember folders ----
  P = await page();
  P.$('fastImportBtn').click(); await sleep(80);
  check('a browser that can not remember: the same setup, the folder asked for each time', !P.$('fastSetup').hidden && /can't remember/.test(P.$('fastImportIntro').textContent) && /each time/.test(P.$('fastImportIntro').textContent));
  const mk = rel => { const f = new P.window.File([rd(rel)], path.basename(rel)); Object.defineProperty(f, 'webkitRelativePath', { value: 'Glimmith puzzles/' + (rel.startsWith('x1') ? 'downloaded/' : 'made/') + rel }); return f; };
  const b3 = names(P).length, inp = P.$('fastDirInput');
  Object.defineProperty(inp, 'files', { value: [mk('x1/puzzle'), mk('x1/metadata'), mk('x2/puzzle'), mk('x2/metadata')], configurable: true });
  inp.dispatchEvent(new P.window.Event('change')); await settle(P);
  check('the Glimmith puzzles folder read through the classic dialog: 2 puzzles', names(P).length === b3 + 2, [names(P), P.$('importLogSummary').textContent]);
  check('no script errors (3)', P.errors.length === 0, P.errors);
  console.log(`fast setup V1.0.39 UI: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
