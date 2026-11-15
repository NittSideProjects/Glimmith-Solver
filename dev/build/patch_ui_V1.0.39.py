#!/usr/bin/env python3
"""Page V1.0.38 -> V1.0.39: Fast import has one way, the setup file (page only).

Author: "let's make the .bat file the only fast import, remove the other ways; I am on Windows but it should also work on Linux".
* Fast import reads one folder, "Glimmith puzzles", made by a setup file the page gives: glimmith-setup.bat (Windows, junctions) or
  glimmith-setup.sh (Linux, symbolic links). Both make the folder NEXT TO THEMSELVES with the links "downloaded" (the Steam workshop
  puzzles) and "made" (the player's own puzzles), for each of them that exists. Nothing is copied or moved.
* Gone: the two rows for the game's own folders (Steam workshop / AppData), the "Read once" buttons and the "Folder blocked?" help.
* Chrome / Edge remember the chosen folder (one click from then on); a browser that can not remember folders asks for the same
  folder each time (the classic folder dialog), and the box says so.
* Linux: the game runs through Steam's Proton, so the own puzzles are in the game's Proton prefix
  (steamapps/compatdata/4160210/pfx/drive_c/users/steamuser/AppData/Local/Geri/Saved/workshop); the script looks in the usual Steam
  places (~/.local/share/Steam, ~/.steam/steam, the Flatpak one) and says what it did not find.
Usage: python3 patch_ui_V1.0.39.py glimmith_solver_V1.0.38.html glimmith_solver_V1.0.39.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

def between(src, start, end, new, what):
    i = src.find(start); j = src.find(end, i)
    if i < 0 or j < 0 or src.count(start) != 1: raise SystemExit(what + ': anchors')
    return src[:i] + new + src[j:]

src = open(sys.argv[1], encoding='utf8').read()
# ---- the box ----
src = between(src, '      <div id="fastImportBox" class="fast-import" hidden>', '      <div class="stats" id="libraryInfo"></div>', """      <div id="fastImportBox" class="fast-import" hidden>
        <p id="fastImportIntro"></p>
        <div class="fast-setup" id="fastSetup">
          <p><b>Set up once.</b> Fast import reads one folder, <code>Glimmith puzzles</code>, that a small setup file makes for you. Put the setup file in any folder you like (Documents, for example) and run it: it makes <code>Glimmith puzzles</code> next to itself, holding two links. <code>downloaded</code> leads to the puzzles you downloaded from the workshop, <code>made</code> to the puzzles you made. A link only points to the game's folder: nothing is copied or moved, the game works as before, new puzzles show up in it by themselves, and deleting <code>Glimmith puzzles</code> deletes only the links. It needs no administrator rights.</p>
          <p><b>Windows:</b> double-click <code>glimmith-setup.bat</code>. Windows may warn that the file comes from the internet: choose "More info", then "Run anyway". You can open it in Notepad first, it is a few lines.<br><b>Linux:</b> in a terminal, in the folder where you put it, run <code>sh glimmith-setup.sh</code>. It looks for Steam in the usual places (the Flatpak one too).</p>
          <p>Then choose the <code>Glimmith puzzles</code> folder below.</p>
          <div class="fast-row" data-slot="both">
            <div><b>The folder the setup made</b> <code>Glimmith puzzles</code><span class="fast-status" id="fastStatus_both"></span></div>
            <span><button type="button" class="subtle" id="fastSetupBtn">Setup file for Windows</button> <button type="button" class="subtle" id="fastSetupShBtn">Setup file for Linux</button> <button type="button" class="subtle" id="fastPick_both">Choose folder…</button></span>
          </div>
          <p class="hint" style="margin:6px 0 0;">Steam installed somewhere else? Open the setup file in a text editor and change the line with the Steam folder.</p>
          <p class="hint" id="fastRefused" style="margin:6px 0 0;" hidden>Your browser refused that folder. Choose the <code>Glimmith puzzles</code> folder the setup file made, not the game's own folders.</p>
        </div>
        <div class="fast-actions"><button type="button" id="fastRunBtn">Import now</button><button type="button" class="subtle" id="fastForgetBtn">Forget folder</button><button type="button" class="subtle" id="fastCloseBtn">Close</button></div>
      </div>
""", 'box')
src = rep(src, 'title="Choose or forget the folders Fast import reads">Folders…</button>', 'title="Choose or forget the folder Fast import reads">Folder…</button>', 'folders btn')
# ---- one slot ----
src = rep(src, "  const FAST_SLOTS = ['steam', 'own', 'both'], FAST_MAX_FILES = 20000, FAST_MAX_BYTES = 2000000;      // V1.0.38: 'both' = the folder of links the setup file makes\n  const fastDirs = { steam: null, own: null, both: null };",
               "  const FAST_SLOTS = ['both'], FAST_MAX_FILES = 20000, FAST_MAX_BYTES = 2000000;      // V1.0.39: only the folder of links the setup file makes\n  const fastDirs = { both: null };", 'slots')
src = rep(src, """    document.getElementById('fastImportIntro').textContent = remember                                          // V1.0.38
      ? `Fast import reads the folders you choose here. A folder your browser accepts is remembered, so the next imports take one click.`
      : `Choose your folder to import the puzzles. Your browser can't remember folders (Chrome and Edge can), so you will need to pick it each time.`;
    document.getElementById('fastSetup').hidden = !remember;""", """    document.getElementById('fastImportIntro').textContent = remember                                          // V1.0.39
      ? `Fast import reads all your puzzles in one click, once the setup below is done.`
      : `Your browser can't remember folders (Chrome and Edge can): after the setup below, it asks for the Glimmith puzzles folder each time.`;""", 'intro')
# ---- picking, the setup files ----
BAT = r'''@echo off
rem Glimmith solver: one-click import setup (Windows).
rem Makes the folder "Glimmith puzzles" next to this file, with two links (junctions) to the game's puzzle folders:
rem   downloaded = the puzzles you downloaded from the Steam workshop, made = the puzzles you made.
rem Nothing is copied or moved. Deleting "Glimmith puzzles" deletes only the links. No administrator rights needed.
setlocal
set "DEST=%~dp0Glimmith puzzles"
set "STEAM=C:\Program Files (x86)\Steam\steamapps\workshop\content\4160210"
set "OWN=%LOCALAPPDATA%\Geri\Saved\workshop"
if not exist "%DEST%" mkdir "%DEST%"
if exist "%STEAM%" if not exist "%DEST%\downloaded" mklink /J "%DEST%\downloaded" "%STEAM%"
if not exist "%STEAM%" echo Not found: the workshop folder "%STEAM%". If Steam is somewhere else, change the STEAM line in this file.
if exist "%OWN%" if not exist "%DEST%\made" mklink /J "%DEST%\made" "%OWN%"
if not exist "%OWN%" echo Not found: your own puzzles folder "%OWN%".
echo.
echo Done. In the Glimmith solver, choose this folder once: "%DEST%"
pause
'''
SH = r'''#!/bin/sh
# Glimmith solver: one-click import setup (Linux).
# Makes the folder "Glimmith puzzles" next to this file, with two links (symbolic links) to the game's puzzle folders:
#   downloaded = the puzzles you downloaded from the Steam workshop, made = the puzzles you made.
# Nothing is copied or moved. Deleting "Glimmith puzzles" deletes only the links. Run it with: sh glimmith-setup.sh
# If Steam is somewhere else, put its folder first in the STEAMS line.
STEAMS="$HOME/.local/share/Steam $HOME/.steam/steam $HOME/.var/app/com.valvesoftware.Steam/.local/share/Steam"
APP=4160210
DEST="$(cd "$(dirname "$0")" && pwd)/Glimmith puzzles"
mkdir -p "$DEST"
link(){ # name, list of places: the first that exists
  name="$1"; shift
  if [ -e "$DEST/$name" ]; then echo "Already there: $DEST/$name"; return; fi
  for p in "$@"; do if [ -d "$p" ]; then ln -s "$p" "$DEST/$name" && echo "Linked $name -> $p"; return; fi; done
  echo "Not found: the $name puzzles (looked in: $*)"
}
W=""; O=""
for s in $STEAMS; do
  W="$W $s/steamapps/workshop/content/$APP"
  O="$O $s/steamapps/compatdata/$APP/pfx/drive_c/users/steamuser/AppData/Local/Geri/Saved/workshop"
done
link downloaded $W
link made $O
echo
echo "Done. In the Glimmith solver, choose this folder once: $DEST"
'''
def js(t, crlf):
    t = t.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    return t.replace('\n', '\\r\\n' if crlf else '\\n')
src = between(src, "  let fastPickSlot = null;\n", "  async function fastButton(){", """  let fastPickSlot = null;
  // V1.0.38 / V1.0.39: the setup files: a folder "Glimmith puzzles" next to them with links to the game's two puzzle folders
  const FAST_SETUP_BAT = `""" + js(BAT, True) + """`;
  const FAST_SETUP_SH = `""" + js(SH, False) + """`;
  function fastSetupDownload(name, text){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function fastPick(slot){
    document.getElementById('fastRefused').hidden = true;
    if(fastCanRemember()){
      let hd; try{ hd = await window.showDirectoryPicker({ id: 'glimmith-' + slot, mode: 'read' }); }
      catch(e){ if(!(e && e.name === 'AbortError')) document.getElementById('fastRefused').hidden = false; return; }     // closed the dialog, or the browser refused the folder
      fastDirs[slot] = hd; await fastStore(slot, hd); fastRender();
      return;
    }
    fastPickSlot = slot; document.getElementById('fastDirInput').click();      // a browser without folder handles: the classic folder dialog, each time
  }
""", 'pick')
src = between(src, "  async function fastButton(){", "  function attachExamples(){", """  async function fastButton(){
    if(solverRunning){ showToast('Wait for the solver to finish (or cancel it) first'); return; }
    if(fastCanRemember()){ await fastLoad(); if(FAST_SLOTS.some(s => fastDirs[s])){ fastShowBox(false); await fastRun(); return; } }
    fastShowBox(document.getElementById('fastImportBox').hidden);
  }
""", 'button')
src = between(src, "  function attachFastImport(){", "  // ---- export / import of our own puzzle files (v32) ----", """  function attachFastImport(){
    document.getElementById('fastImportBtn').addEventListener('click', fastButton);
    attachExamples();
    document.getElementById('fastFoldersBtn').addEventListener('click', () => fastShowBox(document.getElementById('fastImportBox').hidden));
    if(fastCanRemember()) fastLoad().then(fastRender);
    for(const slot of FAST_SLOTS) document.getElementById('fastPick_' + slot).addEventListener('click', () => fastPick(slot));
    document.getElementById('fastRunBtn').addEventListener('click', fastRun);
    document.getElementById('fastSetupBtn').addEventListener('click', () => fastSetupDownload('glimmith-setup.bat', FAST_SETUP_BAT));      // V1.0.38
    document.getElementById('fastSetupShBtn').addEventListener('click', () => fastSetupDownload('glimmith-setup.sh', FAST_SETUP_SH));      // V1.0.39
    document.getElementById('fastCloseBtn').addEventListener('click', () => fastShowBox(false));
    document.getElementById('fastForgetBtn').addEventListener('click', async () => { for(const slot of FAST_SLOTS){ fastDirs[slot] = null; await fastStore(slot, null); } fastRender(); });
    const di = document.getElementById('fastDirInput');
    di.addEventListener('change', async () => { const picked = Array.from(di.files); di.value = ''; if(!picked.length) return; const inputs = await fastInputsFromFiles(picked);
      if(!inputs.length){ showImportReport('Fast import: nothing read', [{ text: 'The folder holds no puzzle files.', bad: true }]); return; } await importFiles([], inputs); });
  }
""", 'attach')
if 'fastBlocked' in src or 'fastOnce_' in src or 'fastPick_steam' in src: raise SystemExit('old way left')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
