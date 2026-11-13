#!/usr/bin/env python3
"""Page V1.0.6 -> V1.0.7 (page only, core stays v98): a way past "can't open this folder because it contains system files".

Chrome and Edge refuse showDirectoryPicker() (the folder access that can be remembered) for some system folders, and both game folders
are among them: the Steam workshop folder is under Program Files (x86) and the game's own puzzles are under %LOCALAPPDATA%. The
browser only offers "Choose a different folder" or "Cancel", and the page just sees a cancelled picker.

V1.0.7:
* When the picker gives no folder (blocked or cancelled: the page can not tell which), the Fast import box shows a help block. A
  "Folder blocked?" link opens it before that too.
* The help block has a "Read once" button per folder. It uses the classic folder upload (<input webkitdirectory>, the path other
  browsers already use): the folder is chosen each time and is not remembered. The browser may call it an upload, but the page reads the
  files locally, as with every other import.
* It also gives the two ways that always work: copy the folder somewhere else (Documents) and choose the copy, or zip it and use
  Import puzzles….
Usage: python3 patch_ui_V1.0.7.py glimmith_solver_V1.0.6.html glimmith_solver_V1.0.7.html"""
import sys

def rep(src, old, new):
    c = src.count(old)
    if c != 1: raise SystemExit(f'anchor found {c} times: {old[:120]}')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()

# ---- markup: the help block and the link that opens it ----
src = rep(src, """        <p class="hint" style="margin:6px 0 0;">Tip: paste the path into the address bar of the folder window. Puzzles already in the list are skipped.</p>
""", """        <p class="hint" style="margin:6px 0 0;">Tip: paste the path into the address bar of the folder window. Puzzles already in the list are skipped. <button type="button" class="link-btn" id="fastBlockedLink">Folder blocked?</button></p>
        <div class="fast-blocked" id="fastBlocked" hidden>
          <p><b>Did your browser say it "can't open this folder because it contains system files"?</b> Chrome and Edge do not let a page remember folders inside Program Files or AppData, and both game folders are there. You can still read them once: the browser asks for the folder each time, and it may say it will upload the files, but they stay on your computer.</p>
          <div class="fast-actions"><button type="button" class="subtle" id="fastOnce_steam">Read the workshop folder once</button><button type="button" class="subtle" id="fastOnce_own">Read your own puzzles once</button></div>
          <p class="hint" style="margin:8px 0 0;">If that is blocked too: copy the folder somewhere else (for example into Documents) and choose the copy, or zip it and open the zip with Import puzzles…</p>
        </div>
""")
src = rep(src, "  .fast-actions{ display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }\n",
"""  .fast-actions{ display:flex; gap:8px; margin-top:10px; flex-wrap:wrap; }
  .fast-blocked{ margin-top:10px; padding:10px 12px; border:1px solid var(--amber); border-radius:8px; background: var(--panel); }
  .fast-blocked p{ margin:0; }
  .link-btn{ background:none; border:none; padding:0; font:inherit; color: var(--accent); text-decoration:underline; cursor:pointer; }
""")

# ---- the picker: no folder -> show the help ----
src = rep(src, """      let hd; try{ hd = await window.showDirectoryPicker({ id: 'glimmith-' + slot, mode: 'read' }); } catch(e){ return; }      // closed the dialog""",
"""      let hd; try{ hd = await window.showDirectoryPicker({ id: 'glimmith-' + slot, mode: 'read' }); }
      catch(e){ document.getElementById('fastBlocked').hidden = false; return; }      // closed the dialog, or the browser blocked the folder (V1.0.7: the page can not tell)""")
src = rep(src, """    document.getElementById('fastForgetBtn').addEventListener('click', async () => {""",
"""    // V1.0.7: blocked folders (Program Files, AppData): read once through the classic folder upload
    document.getElementById('fastBlockedLink').addEventListener('click', () => { const b = document.getElementById('fastBlocked'); b.hidden = !b.hidden; });
    for(const slot of FAST_SLOTS) document.getElementById('fastOnce_' + slot).addEventListener('click', () => { if(solverRunning){ showToast('Wait for the solver to finish (or cancel it) first'); return; } fastPickSlot = slot; document.getElementById('fastDirInput').click(); });
    document.getElementById('fastForgetBtn').addEventListener('click', async () => {""")

open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
