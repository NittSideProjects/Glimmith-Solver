# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v131.js` (sha1 2d0d292a7b25), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.9 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 62 | 98 | 229 | 3.8 | 98% | 2% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 81 | 159 | 2770 | 10.9 | 85% | 12% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 96 | 310 | 1695 | 15.3 | 72% | 21% | 0% | 0% | 8% |  |
| Zone1 d4 | 51 | 56 | 212 | 683 | 3072 | 17.0 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 471 | 2249 | 13824 | 41.6 | 45% | 43% | 6% | 0% | 12% |  |
| Zone1 d6 | 15 | 98 | 424 | 6389 | 43529 | 67.6 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 770 | 877 | 904 | 1.8 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 58 | 96 | 138 | 3.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 84 | 222 | 1183 | 13.8 | 67% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 131 | 286 | 1024 | 20.5 | 52% | 38% | 0% | 0% | 9% |  |
| Zone2 d4 | 86 | 47 | 175 | 873 | 30328 | 97.3 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 299 | 954 | 5816 | 27.3 | 49% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 527 | 2942 | 9046 | 34.8 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1542 | 4897 | 7206 | 19.1 | 27% | 45% | 0% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 46 | 64 | 147 | 2.4 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 75 | 188 | 478 | 11.2 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 140 | 550 | 9971 | 40.9 | 66% | 27% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 274 | 2384 | 23702 | 96.1 | 48% | 38% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 548 | 3482 | 15745 | 96.1 | 37% | 53% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 988 | 3605 | 10882 | 83.3 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 2336 | 10664 | 22464 | 131.7 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 98 | 709 | 43529 | 158.0 | 73% | 20% | 1% | 0% | 7% |  |
| Zone2 | 438 | 42 | 125 | 689 | 30328 | 216.1 | 57% | 34% | 0% | 0% | 8% |  |
| Zone3 | 478 | 53 | 177 | 2069 | 23702 | 461.6 | 58% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 57 | 96 | 229 | 9.4 | 96% | 4% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 80 | 192 | 2770 | 35.9 | 74% | 22% | 0% | 0% | 4% |  |
| d3 | 310 | 40 | 129 | 402 | 9971 | 76.7 | 62% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 239 | 1005 | 30328 | 210.4 | 50% | 38% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 428 | 2223 | 15745 | 165.0 | 43% | 47% | 1% | 0% | 10% |  |
| d6 | 87 | 88 | 751 | 4325 | 43529 | 185.6 | 36% | 50% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1753 | 9821 | 22464 | 152.6 | 26% | 49% | 2% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 48 | 66 | 68 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 60 | 92 | 172 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 71 | 127 | 139 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 65 | 71 | 73 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 93 | 261 | 375 | 3.9 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 127 | 614 | 3121 | 11.8 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 102 | 326 | 43529 | 49.6 | 89% | 10% | 0% | 0% | 1% |  |
| Zone1 8-poly | 39 | 42 | 73 | 118 | 904 | 4.0 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 99 | 946 | 7781 | 27.0 | 58% | 31% | 6% | 0% | 11% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 199 | 1121 | 4301 | 20.6 | 47% | 38% | 2% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 241 | 1692 | 13824 | 38.8 | 55% | 31% | 0% | 0% | 14% |  |
| Zone2 1-area-numbers | 43 | 43 | 112 | 869 | 7173 | 19.7 | 59% | 37% | 0% | 0% | 4% |  |
| Zone2 2-palisade | 60 | 41 | 81 | 253 | 834 | 7.4 | 82% | 17% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 239 | 911 | 2118 | 11.9 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 141 | 350 | 2982 | 11.9 | 72% | 23% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 130 | 568 | 14157 | 24.8 | 57% | 32% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 100 | 646 | 17261 | 29.5 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 142 | 996 | 2407 | 13.3 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 136 | 579 | 6586 | 22.7 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 153 | 663 | 9046 | 22.1 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 156 | 934 | 30328 | 52.8 | 50% | 40% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 116 | 422 | 2806 | 19.4 | 60% | 31% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 135 | 711 | 13198 | 29.0 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 128 | 979 | 9971 | 35.8 | 50% | 44% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 160 | 918 | 9821 | 31.8 | 46% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 131 | 785 | 2736 | 20.3 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 51 | 151 | 15340 | 21.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 467 | 4954 | 12664 | 103.9 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1596 | 1596 | 1596 | 1.6 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 379 | 2437 | 23702 | 80.4 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1323 | 10259 | 22464 | 118.1 | 33% | 49% | 3% | 0% | 18% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 134 | 1767 | 17261 | 180.7 | 52% | 41% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 105 | 697 | 3865 | 66.3 | 81% | 14% | 1% | 0% | 4% |  |
| compass | 128 | 52 | 339 | 3448 | 15745 | 177.0 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 116 | 562 | 30328 | 98.6 | 63% | 33% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 243 | 1707 | 43529 | 189.5 | 60% | 28% | 0% | 0% | 12% |  |
| stamp | 171 | 53 | 124 | 1253 | 13824 | 98.1 | 59% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 217 | 1605 | 9046 | 68.2 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 195 | 1003 | 9821 | 40.5 | 41% | 43% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 278 | 1791 | 22464 | 118.6 | 55% | 30% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 191 | 1239 | 23702 | 50.6 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 165 | 1067 | 23702 | 48.4 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 136 | 1064 | 43529 | 314.8 | 58% | 31% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 222 | 2268 | 23702 | 95.0 | 48% | 44% | 2% | 0% | 8% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 43.5 | 0.02 / 0.24 / 8.18 / 0.00 / 35.1 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 30.3 | 0.00 / 2.61 / 0.58 / 0.00 / 27.1 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 23.7 | 0.01 / 0.09 / 2.32 / 0.00 / 21.3 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 22.5 | 0.00 / 0.08 / 1.87 / 0.00 / 20.5 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 17.3 | 0.01 / 0.01 / 0.11 / 0.00 / 17.1 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 15.7 | 0.09 / 1.68 / 13.9 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 15.3 | 0.19 / 0.84 / 14.3 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 14.5 | 0.02 / 0.28 / 4.31 / 0.00 / 9.89 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 14.2 | 0.00 / 0.02 / 0.08 / 0.00 / 14.0 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.8 | 0.01 / 0.10 / 5.70 / 0.00 / 7.99 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 13.2 | 0.00 / 0.04 / 0.79 / 0.00 / 12.4 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 12.7 | 0.00 / 3.54 / 8.45 / 0.00 / 0.65 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 11.8 | 0.07 / 0.93 / 10.7 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 10.9 | 0.01 / 0.08 / 9.47 / 0.00 / 1.30 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 10.5 | 0.00 / 0.05 / 3.23 / 0.00 / 7.24 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 9.97 | 0.04 / 0.13 / 1.32 / 0.00 / 8.46 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.82 | 0.03 / 0.08 / 0.47 / 0.00 / 9.22 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0975a | 8-endgame | 7 | 11x11 | 121 | 9.60 | 0.02 / 0.23 / 0.93 / 0.00 / 8.40 | 41% | 0% | 0% | 59% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 9.16 | 0.00 / 0.25 / 1.90 / 0.00 / 7.00 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.05 | 0.01 / 0.03 / 0.57 / 0.00 / 8.42 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.84 | 0.05 / 1.68 / 5.41 / 0.00 / 1.69 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 8.26 | 0.00 / 0.03 / 3.39 / 0.00 / 4.83 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 8.18 | 0.00 / 3.89 / 2.98 / 0.00 / 1.29 | 20% | 2% | 0% | 78% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.78 | 0.00 / 0.06 / 0.56 / 0.00 / 7.13 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 7.32 | 0.01 / 0.03 / 0.78 / 0.00 / 6.48 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.21 | 0.02 / 0.21 / 6.37 / 0.00 / 0.59 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 7.17 | 0.04 / 0.04 / 5.27 / 0.00 / 1.80 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/1246 | 6-compass-main | 7 | 7x7 | 49 | 7.15 | 0.00 / 0.22 / 2.15 / 0.00 / 4.76 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.59 | 0.01 / 0.06 / 5.39 / 0.00 / 1.11 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 5.85 | 0.00 / 0.17 / 4.01 / 0.00 / 1.64 | 20% | 38% | 0% | 42% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 17.3 | 352.3 | 2.3 | 154 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 30.3 | 421.2 | 4.3 | 98.9 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 43.5 | 253.1 | 2.7 | 92.8 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 14.2 | 393.3 | 5.8 | 67.6 | 98% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 23.7 | 239.4 | 6 | 39.7 | 71% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.05 | 184.6 | 4.9 | 37.9 | 75% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.78 | 96.1 | 2.8 | 34.8 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 13.2 | 114.8 | 3.3 | 34.4 | 79% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.82 | 103.9 | 3.1 | 33.1 | 0% |
| Zone3/1395b | 6-compass | 5 | 138 | 15.3 | 111.2 | 3.7 | 29.9 | 0% |
| Zone3/0928 | 4-difference | 6 | 63 | 8.18 | 129.8 | 4.8 | 27.1 | 78% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.93 | 65.6 | 2.8 | 23.8 | 96% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 12.7 | 258.4 | 11.4 | 22.7 | 90% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.82 | 107.9 | 4.8 | 22.5 | 90% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 9.16 | 187 | 8.9 | 21.1 | 76% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.21 | 83.8 | 4 | 21 | 33% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.59 | 140.1 | 7.3 | 19.1 | 97% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 5.10 | 104.1 | 5.6 | 18.5 | 75% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.84 | 109.1 | 6 | 18.1 | 70% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.90 | 47.6 | 2.8 | 17.1 | 94% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 7.17 | 59.3 | 3.5 | 17 | 81% |
| Zone3/1246 | 6-compass-main | 7 | 49 | 7.15 | 145.9 | 8.9 | 16.4 | 90% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 7.32 | 95 | 6.2 | 15.4 | 73% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.23 | 89.7 | 7.3 | 12.2 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 22.5 | 224.6 | 18.5 | 12.1 | 100% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 9.97 | 50.9 | 4.2 | 12.1 | 45% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.77 | 55.4 | 4.8 | 11.6 | 100% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.8 | 144 | 13 | 11 | 74% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 4.23 | 117.4 | 11 | 10.7 | 98% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 15.7 | 134.6 | 13 | 10.4 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.77 | 2.29 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.14 | 0.04 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.18 | 0.08 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.59 | 0.33 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.93 | 0.48 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.14 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.12 | 0.07 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.15 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.36 | 0.26 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.75 | 0.61 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.19 | 1.09 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 17.3 | 17.1 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.53 | 0.31 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.15 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.59 | 1.85 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.15 | 0.05 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.16 | 0.08 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.20 | 0.11 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 22.5 | 20.5 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.82 | 0.17 | UNIQUE |

## Decided without any search: 1086 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4680 | 5190 | 242 |
| bank-place | 8265 | 972 | 194 |
| stamp-place | 3559 | 1952 | 0 |
| label | 2813 | 2237 | 14 |
| size | 2286 | 2050 | 25 |
| size-cut | 2243 | 1381 | 67 |
| bridge-count | 2085 | 1324 | 7 |
| grow | 1529 | 1127 | 5 |
| boxy-place | 2133 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1364 | 405 | 0 |
| pal-link | 1281 | 420 | 0 |
| euler-count | 964 | 600 | 25 |
| reach | 765 | 764 | 27 |
| gemini-place | 826 | 497 | 123 |
| mismatch-hall | 1315 | 114 | 0 |
| tower-link | 937 | 278 | 42 |
| pal-wall | 647 | 401 | 0 |
| mingle-area-place | 405 | 602 | 0 |
| size-range | 403 | 584 | 3 |
| rose-cut | 747 | 161 | 0 |
| tower-wall | 471 | 360 | 57 |
| min-reach | 402 | 316 | 0 |
| area-rel | 277 | 438 | 0 |
| loo-color | 289 | 415 | 0 |
| bank-fit | 480 | 141 | 4 |
| cmp-box | 602 | 0 | 0 |
| stamp-size | 309 | 274 | 0 |
| range-region | 152 | 404 | 1 |
| rose-pair | 340 | 216 | 0 |
| loo-corner | 126 | 428 | 0 |
| area-sum | 284 | 233 | 4 |
| mingle-area-merge | 292 | 228 | 0 |
| bri-three | 316 | 197 | 0 |
| box-hall | 353 | 141 | 0 |
| shape-fit | 170 | 269 | 0 |
| cmp-wrap | 313 | 84 | 0 |
| colour-count | 184 | 170 | 27 |
| boxy-corner | 252 | 127 | 0 |
| rose-grow | 294 | 78 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
