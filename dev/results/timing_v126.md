# Timing of core v126 (V1.0.47) on the base game, same machine as a core v97 baseline

Both runs: `node tools/run_corpus.js --limit-s 60 --jobs 2`, cloud machine (Xeon 2.1 GHz, 4 cores). The author's last run (`corpus_run_userpass5`, core v93) was on another PC, about 1.85x faster for the same work, so v97 (the oldest core in the repository) was run here as the baseline.

| run | unique | summed minutes | over 10 s | over 30 s | slowest |
|---|---|---|---|---|---|
| v97 baseline | 1225 | 12.5 | 18 | 1 | Zone1/1434 39.0 s |
| v126 | 1225 | 11.4 | 13 | 1 | Zone1/1434 33.1 s |

Median time ratio v126 / v97 per puzzle: 1.07.

Puzzles at least 1.5x slower than v97 (and over 2 s):

| puzzle | v97 s | v126 s |
|---|---|---|
| Zone1/1439 | 1.7 | 2.8 |
| Zone2/0866 | 1.9 | 3.1 |
| Zone3/0262 | 1.1 | 2.1 |
| Zone3/0373 | 4.0 | 6.1 |
| Zone3/0970 | 2.5 | 8.8 |
| Zone3/1084 | 2.6 | 5.0 |
| Zone3/0268 | 3.0 | 4.9 |

Zone3/0970 is the only one at 2x or more, and it is the baseline that is off: run alone three times, core v97 itself spends 8.1 s in its final search every time (the 2.5 s of the baseline run was a lucky slice).
