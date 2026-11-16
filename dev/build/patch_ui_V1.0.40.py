#!/usr/bin/env python3
"""Page V1.0.39 -> V1.0.40: the step-by-step numbers a run of the same rule as one deduction (page only).

Author: "the step by step 'part x/y' doesn't work well: sometimes it does the same reasoning twice in a row and the part x/y doesn't
carry over" (a puzzle solved by one rule all along showed "part 1 of 6" .. "part 6 of 6", then "part 1 of 2" again, and so on).
The solver applies a rule pass after pass; each pass made its own step, and the v92 split (one finished piece per part) numbered
each step's parts on their own. Now consecutive steps of the same rule (plain rule steps, not probes, searches or facts) are one
run, numbered "part 1 of N" .. "part N of N" across all of them; only the first part gives the rule's explanation, the next ones
say they continue it ("finishes this piece" only for a part that does finish one).
Usage: python3 patch_ui_V1.0.40.py glimmith_solver_V1.0.39.html glimmith_solver_V1.0.40.html"""
import sys

def rep(src, old, new, what):
    c = src.count(old)
    if c != 1: raise SystemExit(f'{what}: anchor found {c} times')
    return src.replace(old, new)

src = open(sys.argv[1], encoding='utf8').read()
src = rep(src, "      parts.forEach((edges, i) => out.push(Object.assign({}, st, { edges, shapes: i === 0 ? st.shapes : [], part: i + 1, parts: parts.length, restPart: i === parts.length - 1 && left.length > 0 })));\n    }\n    return out;\n  }\n",
"""      parts.forEach((edges, i) => out.push(Object.assign({}, st, { edges, shapes: i === 0 ? st.shapes : [], part: i + 1, parts: parts.length, restPart: i === parts.length - 1 && left.length > 0, finishes: !(i === parts.length - 1 && left.length > 0) })));
    }
    return chainRuleRuns(out);
  }
  // V1.0.40: consecutive steps of the same rule are one deduction applied pass after pass: number their parts as one run
  function chainRuleRuns(steps){
    const key = st => st.kind === 'rule' ? st.rule : null;
    for(let i = 0; i < steps.length; ){
      const k = key(steps[i]); let j = i + 1;
      if(k) while(j < steps.length && key(steps[j]) === k) j++;
      if(k && j - i > 1) steps.slice(i, j).forEach((st, n) => {
        const split = !!st.parts;
        st.part = n + 1; st.parts = j - i;
        if(!split){ st.restPart = false; st.finishes = false; }
        st.again = n > 0 && (!split || st.part === 1 || steps[i + n - 1].pass !== st.pass);   // a new pass of the rule, not a piece of the same split
      });
      i = j;
    }
    return steps;
  }
""", 'chain')
src = rep(src, """      out.text = st.restPart ? 'The same deduction as the steps before also decides these remaining edges.'
                             : 'The same deduction as the step before also settles every edge round this piece, which finishes it.';""",
"""      out.text = st.finishes ? 'The same deduction as the step before also settles every edge round this piece, which finishes it.'
               : st.again ? 'The same deduction, applied again to what the steps before decided, also decides these edges.'
               : 'The same deduction as the steps before also decides these remaining edges.';                  // V1.0.40""", 'texts')
open(sys.argv[2], 'w', encoding='utf8').write(src); print('ok', sys.argv[2])
