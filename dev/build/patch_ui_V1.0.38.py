#!/usr/bin/env python3
"""Page V1.0.37 -> V1.0.38: Fast import in one click, also for the game's blocked folders (page only).

Author: Fast import never remembered his folders (Chrome and Edge refuse to remember folders inside Program Files and AppData, and both
game folders are there), so every import meant pasting both paths again. A folder of links (junctions) outside those places is
accepted (tested by the author in Chrome). So:
1. "Download the setup file" writes glimmith-setup.bat. Run from any folder, it makes "Glimmith puzzles" NEXT TO ITSELF with two links,
   "downloaded" (the Steam workshop folder) and "made" (the player's own puzzles), for each of them that exists. Junctions need no
   administrator rights; nothing is copied or moved, and deleting the folder deletes only the links. The page explains all this.
2. A third folder slot, "Glimmith puzzles" (both): choosing that one folder once makes later Fast imports read both in one click
   (the reading goes into subfolders, so one folder holding both works).
3. Honest texts: the one-click promise only where the browser can remember folders; in other browsers (the VS Code one, Firefox) the
   box says the folders are read each time; the "Folder blocked?" help points to the setup.
Usage: python3 patch_ui_V1.0.38.py glimmith_solver_V1.0.37.html glimmith_solver_V1.0.38.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
# ---- the box: the one-click setup on top ----
src = rep(src, """        <p id="fastImportIntro"></p>
""", """        <p id="fastImportIntro"></p>
        <div class="fast-setup" id="fastSetup">
          <p><b>One-click import.</b> Chrome and Edge can remember a folder, but not the game's own folders (they are inside Program Files and AppData). The setup file gets around that: put it in any folder you like (Documents, for example) and double-click it. It makes a folder <code>Glimmith puzzles</code> next to itself, holding two links: <code>downloaded</code> leads to the puzzles you downloaded from the workshop, <code>made</code> to the puzzles you made. A link only points to the game's folder: nothing is copied or moved, the game works as before, new puzzles show up in it by themselves, and deleting <code>Glimmith puzzles</code> deletes only the links. It needs no administrator rights. Windows may warn that the file comes from the internet: choose "More info", then "Run anyway". You can open it in Notepad first, it is a few lines.</p>
          <p>Then choose the <code>Glimmith puzzles</code> folder once. After that, Fast import reads both kinds of puzzles in one click.</p>
          <div class="fast-row" data-slot="both">
            <div><b>The folder the setup made</b> <code>Glimmith puzzles</code><span class="fast-status" id="fastStatus_both"></span></div>
            <span><button type="button" class="subtle" id="fastSetupBtn">Download the setup file</button> <button type="button" class="subtle" id="fastPick_both">Choose folder…</button></span>
          </div>
          <p class="hint" style="margin:6px 0 0;">Steam somewhere else than <code>C:\\Program Files (x86)\\Steam</code>? Open the setup file in Notepad and change that line.</p>
        </div>
""", 'setup block')
src = rep(src, """          <p class="hint" style="margin:8px 0 0;">If that is blocked too: copy the folder somewhere else (for example into Documents) and choose the copy, or zip it and open the zip with Import puzzles…</p>""",
"""          <p class="hint" style="margin:8px 0 0;">To read them in one click every time, use the setup file above. If reading once is blocked too: copy the folder somewhere else (for example into Documents) and choose the copy, or zip it and open the zip with Import puzzles…</p>""", 'blocked help')
# ---- the slots ----
src = rep(src, "  const FAST_SLOTS = ['steam', 'own'], FAST_MAX_FILES = 20000, FAST_MAX_BYTES = 2000000;\n  const fastDirs = { steam: null, own: null };",
               "  const FAST_SLOTS = ['steam', 'own', 'both'], FAST_MAX_FILES = 20000, FAST_MAX_BYTES = 2000000;      // V1.0.38: 'both' = the folder of links the setup file makes\n  const fastDirs = { steam: null, own: null, both: null };", 'slots')
src = rep(src, """    document.getElementById('fastImportIntro').textContent = remember
      ? `Choose each folder once. After that, Fast import reads both in one click (if your browser is compatible).`
      : `Choose your folder to import the puzzles. Your browser can't remember folders (Chrome and Edge can), so you will need to pick it each time.`;""",
"""    document.getElementById('fastImportIntro').textContent = remember                                          // V1.0.38
      ? `Fast import reads the folders you choose here. A folder your browser accepts is remembered, so the next imports take one click.`
      : `Choose your folder to import the puzzles. Your browser can't remember folders (Chrome and Edge can), so you will need to pick it each time.`;
    document.getElementById('fastSetup').hidden = !remember;""", 'intro')
src = rep(src, "    document.getElementById('fastRunBtn').hidden = !remember || !(fastDirs.steam || fastDirs.own);\n    document.getElementById('fastForgetBtn').hidden = !remember || !(fastDirs.steam || fastDirs.own);\n    document.getElementById('fastFoldersBtn').hidden = !(remember && (fastDirs.steam || fastDirs.own));",
               "    const anyDir = FAST_SLOTS.some(s => fastDirs[s]);\n    document.getElementById('fastRunBtn').hidden = !remember || !anyDir;\n    document.getElementById('fastForgetBtn').hidden = !remember || !anyDir;\n    document.getElementById('fastFoldersBtn').hidden = !(remember && anyDir);", 'render')
src = rep(src, "    if(fastCanRemember()){ await fastLoad(); if(fastDirs.steam || fastDirs.own){ fastShowBox(false); await fastRun(); return; } }",
               "    if(fastCanRemember()){ await fastLoad(); if(FAST_SLOTS.some(s => fastDirs[s])){ fastShowBox(false); await fastRun(); return; } }", 'button')
src = rep(src, "    for(const slot of FAST_SLOTS) document.getElementById('fastOnce_' + slot).addEventListener(",
               "    for(const slot of FAST_SLOTS) if(document.getElementById('fastOnce_' + slot)) document.getElementById('fastOnce_' + slot).addEventListener(", 'once')
# ---- the setup file ----
BAT = r'''@echo off
rem Glimmith solver: one-click import setup.
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
js_bat = BAT.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${').replace('\n', '\\r\\n')
src = rep(src, "  let fastPickSlot = null;\n",
"""  let fastPickSlot = null;
  // V1.0.38: the setup file (Windows): a folder "Glimmith puzzles" next to it with junctions to the game's two puzzle folders
  const FAST_SETUP_BAT = `""" + js_bat + """`;
  function fastSetupDownload(){
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([FAST_SETUP_BAT], { type: 'application/octet-stream' })); a.download = 'glimmith-setup.bat';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
""", 'bat')
src = rep(src, "    document.getElementById('fastRunBtn').addEventListener('click', fastRun);\n",
               "    document.getElementById('fastRunBtn').addEventListener('click', fastRun);\n    document.getElementById('fastSetupBtn').addEventListener('click', fastSetupDownload);       // V1.0.38\n", 'listener')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
