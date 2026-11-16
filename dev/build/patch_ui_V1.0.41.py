#!/usr/bin/env python3
"""Page V1.0.40 -> V1.0.41: "Show more" in the contradiction viewer (page only).

Author: the "Show cases" pop-up (what the solver tried, and why it fails) is decent but needs more detail in some spots: a "Show more"
button opens a second step-by-step that leads to the impossible moment.
Every case card gets a "Show more" button. It opens, inside the card, a small step-by-step of that case:
  frame 0       what was tried (the position before the step, the tried choices marked in red);
  frames 1..k   the rules that fired from there, in their order, one frame per run of the same rule: the rule's title and its own
                explanation (as in the main step-by-step), the edges it decides outlined, everything before it drawn;
  last frame    "Impossible here": why it fails, with the tiles ringed in red when the check knows them.
Previous / Next buttons and a counter, like the main step-by-step. No solver change: it shows the trace the case already holds.
Usage: python3 patch_ui_V1.0.41.py glimmith_solver_V1.0.40.html glimmith_solver_V1.0.41.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, "  .example-pop .case-fail b{ color:#e5534b; }\n",
"""  .example-pop .case-fail b{ color:#e5534b; }
  .example-pop .case-more{ margin:8px 0 0; }
  .example-pop .case-walk{ margin:8px 0 0; padding:8px; border:1px solid var(--line, #ccc); border-radius:6px; }
  .example-pop .case-walk .cw-nav{ display:flex; gap:6px; align-items:center; margin:0 0 6px; flex-wrap:wrap; }
  .example-pop .case-walk .cw-title{ margin:4px 0 2px; font-size:13px; font-weight:600; }
  .example-pop .case-walk .cw-text{ margin:2px 0 0; font-size:13px; line-height:1.5; }
""", 'css')
src = rep(src, """    card.appendChild(f);
    return card;
  }
  function openCasesPop(idx){""", """    card.appendChild(f);
    if(c.trace.length || !c.open){                                     // V1.0.41: a step-by-step of this case, up to the impossible moment
      const more = document.createElement('button'); more.type = 'button'; more.classList.add('subtle', 'case-more'); more.textContent = 'Show more';
      let walk = null;
      more.addEventListener('click', () => {
        if(walk){ walk.hidden = !walk.hidden; more.textContent = walk.hidden ? 'Show more' : 'Show less'; return; }
        walk = caseWalk(st, idx, c, fact); card.appendChild(walk); more.textContent = 'Show less';
      });
      card.appendChild(more);
    }
    return card;
  }
  // V1.0.41: the frames of one case: what was tried, each run of one rule in order, then the moment it fails
  function caseWalk(st, idx, c, fact){
    const state = stateAfter(idx - 1), prev = stepsList[idx - 1] || {};
    const frames = [{ title: 'What was tried', text: 'The solver tries the choice marked in red' + (c.assume.length > 1 ? ', and the other marked choices' : '') + ', then lets the rules work from there.', edges: [] }];
    for(const [k, v, r] of c.trace){
      const last = frames[frames.length - 1];
      if(frames.length > 1 && last.rule === r){ last.edges.push([k, v]); continue; }
      frames.push({ rule: r, edges: [[k, v]] });
    }
    for(const fr of frames) if(fr.rule){
      const info = STEP_INFO[fr.rule], nW = fr.edges.filter(e => e[1] === 'wall').length, nL = fr.edges.length - nW;
      fr.title = (info && info[0]) || fr.rule;
      let body = info ? ((nW && !nL) ? info[2] : (nL && !nW) ? info[3] : null) || info[1] || [info[2], info[3]].filter(Boolean).join(' ') : '';
      if(!body) body = stepWhyText(fr.rule);
      fr.text = body + ' (' + [nW ? plural(nW, 'wall', 'walls') : '', nL ? plural(nL, 'link', 'links') : ''].filter(Boolean).join(' and ') + ')';
    }
    if(!c.open){
      let why = stepWhyText(c.why).trim().replace(/\\.+$/, ''); if(/^[A-Z][a-z]/.test(why)) why = why[0].toLowerCase() + why.slice(1);
      frames.push({ title: 'Impossible here', text: (c.at ? 'At the tiles ringed in red, ' : 'Now ') + (why || 'the rules can not all be met') + '. So the choice tried first is wrong.', edges: [], fail: true });
    } else frames.push({ title: 'No rule is broken yet', text: 'After these choices the rules still hold: the solver needed a longer search here.', edges: [] });
    const box = document.createElement('div'); box.className = 'case-walk';
    const nav = document.createElement('div'); nav.className = 'cw-nav';
    const prevB = document.createElement('button'); prevB.type = 'button'; prevB.className = 'subtle'; prevB.textContent = '\\u25C0'; prevB.title = 'Previous step'; prevB.setAttribute('aria-label', 'Previous step');
    const nextB = document.createElement('button'); nextB.type = 'button'; nextB.className = 'subtle'; nextB.textContent = '\\u25B6'; nextB.title = 'Next step'; nextB.setAttribute('aria-label', 'Next step');
    const count = document.createElement('span'); count.className = 'cw-count';
    nav.append(prevB, count, nextB);
    const title = document.createElement('p'); title.className = 'cw-title';
    const board = document.createElement('div'); board.className = 'ex-board';
    const text = document.createElement('p'); text.className = 'cw-text';
    box.append(nav, title, board, text);
    let at = 0;
    const show = () => {
      const fr = frames[at], walls = new Set(state.walls), links = new Set(state.links), fresh = new Set();
      for(let i = 1; i <= at; i++) for(const [k, v] of frames[i].edges){ (v === 'wall' ? walls : links).add(k); if(i === at) fresh.add(k); }
      board.replaceChildren(renderStepSVG({ groupTint: prev.groupTint || null, factTiles: fact ? [fact.a, fact.b] : null, walls, links, shapes: prev.closed || [], fresh,
        probes: c.assume.map(([key, assume]) => ({ key, assume })), failTiles: fr.fail ? (c.at || null) : null, pieces: null, searchWalls: null, diff: null, label: 'Case' }));
      title.textContent = fr.title; text.textContent = fr.text;
      count.textContent = `${at + 1} / ${frames.length}`;
      prevB.disabled = at === 0; nextB.disabled = at === frames.length - 1;
    };
    prevB.addEventListener('click', () => { if(at > 0){ at--; show(); } });
    nextB.addEventListener('click', () => { if(at < frames.length - 1){ at++; show(); } });
    show();
    return box;
  }
  function openCasesPop(idx){""", 'walk')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
