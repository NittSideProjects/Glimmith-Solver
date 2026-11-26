# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v130.js` (sha1 fea970284b24), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 14.0 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 73 | 110 | 280 | 4.3 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 87 | 192 | 3196 | 13.4 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 106 | 331 | 1804 | 15.7 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 226 | 796 | 3263 | 18.4 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 509 | 2570 | 13799 | 44.4 | 45% | 40% | 5% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 446 | 6832 | 37357 | 64.1 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 858 | 877 | 882 | 1.9 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 58 | 98 | 114 | 3.1 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 85 | 250 | 982 | 13.3 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 121 | 349 | 1006 | 21.2 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 194 | 897 | 32662 | 101.7 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 314 | 1248 | 6758 | 32.7 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 605 | 4675 | 9443 | 42.2 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1184 | 5648 | 9247 | 21.9 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 59 | 78 | 163 | 2.9 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 79 | 207 | 747 | 12.5 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 144 | 607 | 9329 | 40.6 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 284 | 2194 | 20344 | 89.5 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 520 | 3422 | 15755 | 92.3 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 949 | 3705 | 16593 | 89.7 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 2188 | 9966 | 19271 | 113.3 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 109 | 803 | 37357 | 162.3 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 122 | 729 | 32662 | 236.1 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 173 | 1907 | 20344 | 440.7 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 62 | 102 | 280 | 10.3 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 84 | 207 | 3196 | 39.2 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 125 | 425 | 9329 | 77.6 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 231 | 1059 | 32662 | 209.5 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 438 | 2322 | 15755 | 169.4 | 42% | 47% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 728 | 5215 | 37357 | 196.1 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1730 | 9824 | 19271 | 137.0 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 55 | 67 | 75 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 57 | 113 | 271 | 0.9 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 82 | 113 | 119 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 69 | 86 | 93 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 93 | 227 | 387 | 3.9 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 136 | 679 | 4253 | 13.8 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 102 | 313 | 37357 | 47.9 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 93 | 146 | 882 | 4.5 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 112 | 905 | 7892 | 24.2 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 200 | 1147 | 5242 | 23.4 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 250 | 1790 | 13799 | 42.1 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 120 | 1265 | 9443 | 26.2 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 87 | 231 | 1082 | 7.7 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 198 | 898 | 1950 | 10.5 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 139 | 384 | 4105 | 13.3 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 125 | 574 | 14390 | 25.7 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 94 | 718 | 18053 | 34.4 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 138 | 871 | 2810 | 13.5 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 143 | 700 | 7287 | 24.4 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 154 | 698 | 9117 | 22.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 193 | 1103 | 32662 | 58.1 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 107 | 430 | 2888 | 18.0 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 121 | 716 | 9231 | 24.0 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 128 | 885 | 9329 | 34.3 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 181 | 848 | 16593 | 41.1 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 143 | 714 | 2759 | 19.6 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 66 | 177 | 15755 | 21.9 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 541 | 4472 | 13850 | 99.2 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1969 | 1969 | 1969 | 2.0 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 421 | 2479 | 20344 | 75.1 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1292 | 9168 | 19271 | 105.4 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 138 | 1911 | 18053 | 194.7 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 109 | 848 | 5297 | 76.4 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 408 | 3385 | 15755 | 170.5 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 115 | 640 | 32662 | 97.8 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 252 | 1759 | 37357 | 178.9 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 143 | 1162 | 13799 | 104.0 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 226 | 1601 | 9117 | 71.8 | 62% | 26% | 3% | 0% | 12% |  |
| wall-diff | 69 | 46 | 203 | 909 | 16593 | 50.4 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 263 | 1985 | 19271 | 119.4 | 55% | 29% | 2% | 0% | 16% |  |
| wall-gt | 67 | 46 | 181 | 1270 | 20344 | 46.5 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 167 | 1146 | 20344 | 44.4 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 129 | 1067 | 37357 | 310.3 | 57% | 32% | 0% | 0% | 11% |  |
| watchtower | 85 | 55 | 175 | 2314 | 20344 | 89.3 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 37.4 | 0.02 / 0.27 / 5.42 / 0.00 / 31.6 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 32.7 | 0.00 / 2.55 / 0.50 / 0.00 / 29.6 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 20.3 | 0.01 / 0.11 / 1.78 / 0.00 / 18.4 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 19.3 | 0.01 / 0.06 / 1.07 / 0.00 / 18.1 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 18.1 | 0.01 / 0.02 / 0.12 / 0.00 / 17.9 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 16.6 | 0.00 / 3.63 / 3.22 / 0.00 / 9.72 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 15.8 | 0.13 / 0.73 / 14.9 / 0.00 / 0.03 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 14.4 | 0.00 / 0.02 / 0.09 / 0.00 / 14.3 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 14.1 | 0.09 / 1.54 / 12.4 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 13.8 | 0.00 / 3.57 / 9.42 / 0.00 / 0.83 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.8 | 0.01 / 0.07 / 5.86 / 0.00 / 7.83 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.3 | 0.02 / 0.24 / 3.88 / 0.00 / 9.18 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 11.6 | 0.03 / 0.13 / 9.84 / 0.00 / 1.58 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 10.8 | 0.03 / 0.08 / 0.49 / 0.00 / 10.2 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 9.87 | 0.07 / 0.84 / 8.91 / 0.00 / 0.03 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.82 | 0.00 / 0.05 / 2.49 / 0.00 / 7.27 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 9.44 | 0.05 / 0.06 / 5.24 / 0.00 / 4.08 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 9.33 | 0.02 / 0.09 / 1.10 / 0.00 / 8.09 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 9.25 | 0.02 / 0.17 / 8.50 / 0.00 / 0.53 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.23 | 0.00 / 0.05 / 0.65 / 0.00 / 8.51 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.12 | 0.01 / 0.04 / 0.66 / 0.00 / 8.38 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 9.01 | 0.03 / 2.10 / 5.31 / 0.00 / 1.55 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 8.49 | 0.00 / 0.26 / 1.90 / 0.00 / 6.31 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.89 | 0.00 / 0.07 / 0.63 / 0.00 / 7.17 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.64 | 0.00 / 0.03 / 3.20 / 0.00 / 4.38 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 7.29 | 0.01 / 0.08 / 5.39 / 0.00 / 1.78 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 7.15 | 0.01 / 0.03 / 0.45 / 0.00 / 6.64 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 6.76 | 0.01 / 0.15 / 6.57 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |
| Zone3/0268 | 8-endgame | 7 | 15x15 | 200 | 5.74 | 0.00 / 0.13 / 3.83 / 0.00 / 1.74 | 20% | 37% | 0% | 43% | 0 | UNIQUE |
| Zone3/1084 | 6-compass-main | 5 | 9x8 | 48 | 5.45 | 0.02 / 0.08 / 0.90 / 0.00 / 4.43 | 8% | 16% | 0% | 76% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 18.1 | 368.4 | 2.4 | 153.2 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 32.7 | 453.6 | 4.7 | 96.9 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 37.4 | 217.2 | 3.1 | 70 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 14.4 | 399.7 | 7.7 | 52.2 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 16.6 | 263.4 | 5.9 | 44.6 | 78% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.12 | 186.1 | 4.6 | 40.2 | 75% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 20.3 | 205.5 | 5.3 | 38.9 | 71% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 6.76 | 120.7 | 3.4 | 35.2 | 0% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 4.18 | 104.6 | 3.1 | 34.2 | 94% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.89 | 97.4 | 2.9 | 33.3 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.23 | 80.3 | 2.4 | 33 | 79% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 9.25 | 107.5 | 4.2 | 25.7 | 33% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 13.8 | 282.6 | 11.2 | 25.3 | 90% |
| Zone3/1395b | 6-compass | 5 | 138 | 15.8 | 114.2 | 4.6 | 24.6 | 0% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 4.00 | 66.6 | 2.9 | 22.7 | 96% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 9.44 | 78 | 3.6 | 21.5 | 81% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 9.01 | 111.2 | 5.3 | 21 | 70% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 10.8 | 119.1 | 5.9 | 20.2 | 90% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 5.30 | 58.9 | 3.1 | 19 | 84% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 7.29 | 155 | 8.3 | 18.8 | 97% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 7.15 | 92.8 | 5.3 | 17.5 | 73% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 8.49 | 173.4 | 11.1 | 15.7 | 76% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 4.11 | 68.4 | 5 | 13.7 | 57% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.11 | 83.9 | 6.4 | 13.2 | 75% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 9.33 | 47.6 | 3.7 | 13 | 45% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 5.20 | 37.1 | 3.1 | 12.1 | 54% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 14.1 | 120.5 | 11.2 | 10.8 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 19.3 | 192.7 | 18.3 | 10.5 | 100% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.8 | 143.7 | 13.7 | 10.5 | 74% |
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 2.81 | 56.1 | 5.4 | 10.4 | 100% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.81 | 2.34 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.14 | 0.04 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.23 | 0.10 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.64 | 0.38 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.26 | 0.75 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.15 | 0.04 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.14 | 0.09 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.19 | 0.05 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.39 | 0.28 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.86 | 0.67 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.11 | 0.99 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 18.1 | 17.9 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.67 | 0.42 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.15 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.60 | 1.81 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.12 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.19 | 0.10 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.15 | 0.10 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 19.3 | 18.1 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.00 | 0.19 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4616 | 5266 | 245 |
| bank-place | 8409 | 918 | 332 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2775 | 2241 | 44 |
| size | 2136 | 2129 | 32 |
| size-cut | 2142 | 1621 | 51 |
| bridge-count | 2055 | 1358 | 9 |
| grow | 1526 | 1152 | 5 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1305 | 402 | 0 |
| pal-link | 1267 | 420 | 0 |
| euler-count | 949 | 645 | 22 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 76 |
| reach | 654 | 644 | 25 |
| tower-link | 936 | 277 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 405 | 608 | 0 |
| size-range | 399 | 582 | 3 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 469 | 357 | 57 |
| area-rel | 277 | 441 | 0 |
| loo-color | 289 | 411 | 0 |
| range-region | 144 | 475 | 2 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 309 | 269 | 0 |
| rose-pair | 338 | 215 | 0 |
| loo-corner | 126 | 422 | 0 |
| bri-three | 309 | 218 | 0 |
| mingle-area-merge | 292 | 228 | 0 |
| area-sum | 283 | 226 | 4 |
| box-hall | 353 | 141 | 0 |
| min-reach | 285 | 180 | 0 |
| cmp-wrap | 359 | 84 | 0 |
| shape-fit | 169 | 268 | 0 |
| colour-count | 184 | 170 | 27 |
| boxy-corner | 253 | 128 | 0 |
| match-place | 241 | 133 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
