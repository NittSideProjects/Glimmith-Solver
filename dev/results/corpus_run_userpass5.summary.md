# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v93.js` (sha1 9ec3267f4543), node v26.13.0, win32 x64, 12 cores (11th Gen Intel(R) Core(TM) i5-11400F @ 2.60GHz), jobs 1
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 8.2 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 44 | 65 | 128 | 2.7 | 93% | 7% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 43 | 90 | 2594 | 11.0 | 78% | 17% | 4% | 0% | 6% |  |
| Zone1 d3 | 77 | 40 | 58 | 169 | 649 | 7.4 | 65% | 25% | 0% | 0% | 10% |  |
| Zone1 d4 | 51 | 56 | 108 | 356 | 1342 | 9.2 | 55% | 35% | 0% | 0% | 10% |  |
| Zone1 d5 | 33 | 75 | 199 | 1684 | 8299 | 26.8 | 43% | 39% | 6% | 0% | 18% |  |
| Zone1 d6 | 15 | 98 | 303 | 6852 | 29349 | 50.6 | 46% | 23% | 12% | 0% | 32% |  |
| Zone1 d7 | 3 | 99 | 339 | 413 | 432 | 0.8 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 33 | 45 | 100 | 1.8 | 91% | 9% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 43 | 94 | 402 | 6.6 | 65% | 30% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 63 | 149 | 485 | 10.1 | 50% | 40% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 88 | 740 | 9996 | 42.8 | 44% | 44% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 124 | 394 | 3144 | 12.4 | 47% | 42% | 0% | 0% | 11% |  |
| Zone2 d6 | 26 | 78 | 253 | 1518 | 5872 | 18.0 | 33% | 51% | 0% | 0% | 16% |  |
| Zone2 d7 | 8 | 90 | 551 | 2629 | 4481 | 9.6 | 21% | 53% | 0% | 0% | 26% |  |
| Zone3 d1 | 45 | 17 | 32 | 41 | 67 | 1.5 | 93% | 7% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 40 | 127 | 1058 | 7.1 | 67% | 22% | 0% | 0% | 10% |  |
| Zone3 d3 | 114 | 43 | 63 | 275 | 7748 | 25.5 | 60% | 32% | 0% | 0% | 8% |  |
| Zone3 d4 | 84 | 55 | 108 | 1483 | 11920 | 53.9 | 41% | 41% | 0% | 0% | 17% |  |
| Zone3 d5 | 56 | 74 | 207 | 2022 | 12148 | 57.9 | 34% | 56% | 0% | 0% | 10% |  |
| Zone3 d6 | 46 | 91 | 418 | 5971 | 11882 | 76.1 | 30% | 54% | 2% | 0% | 16% |  |
| Zone3 d7 | 30 | 113 | 1423 | 4163 | 10620 | 58.5 | 20% | 47% | 3% | 0% | 32% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 58 | 366 | 29349 | 108.6 | 68% | 23% | 2% | 0% | 9% |  |
| Zone2 | 438 | 42 | 62 | 321 | 9996 | 101.4 | 55% | 36% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 83 | 1347 | 12148 | 280.6 | 53% | 35% | 1% | 0% | 12% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 35 | 57 | 128 | 6.0 | 92% | 8% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 42 | 98 | 2594 | 24.7 | 69% | 24% | 1% | 0% | 7% |  |
| d3 | 310 | 40 | 62 | 202 | 7748 | 43.1 | 57% | 33% | 0% | 0% | 9% |  |
| d4 | 221 | 52 | 97 | 692 | 11920 | 105.9 | 46% | 41% | 0% | 0% | 14% |  |
| d5 | 136 | 69 | 166 | 1531 | 12148 | 97.2 | 41% | 47% | 1% | 0% | 12% |  |
| d6 | 87 | 88 | 355 | 5805 | 29349 | 144.7 | 34% | 48% | 3% | 0% | 19% |  |
| d7 | 41 | 107 | 1036 | 4017 | 10620 | 69.0 | 23% | 49% | 2% | 0% | 29% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 32 | 40 | 41 | 0.4 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 34 | 66 | 82 | 0.5 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 56 | 83 | 106 | 0.5 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 41 | 49 | 51 | 0.2 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 52 | 90 | 173 | 1.9 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 72 | 233 | 2284 | 6.2 | 65% | 27% | 3% | 0% | 8% |  |
| Zone1 7-slash-pack | 36 | 48 | 61 | 152 | 29349 | 35.4 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 43 | 61 | 432 | 2.2 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 60 | 638 | 7146 | 18.5 | 48% | 39% | 4% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 103 | 2070 | 6411 | 23.6 | 30% | 45% | 7% | 1% | 25% |  |
| Zone1 11-mixed-rules | 50 | 60 | 103 | 580 | 8299 | 19.4 | 49% | 35% | 0% | 0% | 16% |  |
| Zone2 1-area-numbers | 43 | 43 | 57 | 692 | 5872 | 14.0 | 57% | 37% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 43 | 101 | 572 | 3.7 | 80% | 19% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 90 | 412 | 801 | 4.6 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 65 | 155 | 1835 | 5.9 | 70% | 25% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 66 | 268 | 9996 | 16.0 | 55% | 35% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 64 | 377 | 8546 | 16.6 | 53% | 37% | 0% | 0% | 11% |  |
| Zone2 7-1SPR | 37 | 43 | 69 | 364 | 1045 | 5.7 | 46% | 45% | 0% | 0% | 9% |  |
| Zone2 8-all-rectangles | 40 | 46 | 57 | 334 | 4924 | 13.8 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 69 | 245 | 1291 | 6.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 83 | 359 | 4481 | 14.9 | 47% | 43% | 0% | 0% | 9% |  |
| Zone3 1-tatami | 70 | 44 | 48 | 146 | 2345 | 11.6 | 56% | 34% | 1% | 0% | 9% |  |
| Zone3 2-loopy | 58 | 61 | 53 | 306 | 1493 | 8.0 | 60% | 35% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 59 | 418 | 7748 | 21.5 | 47% | 45% | 1% | 0% | 8% |  |
| Zone3 4-difference | 53 | 38 | 84 | 435 | 11920 | 34.0 | 33% | 35% | 0% | 0% | 32% |  |
| Zone3 5-inequality | 56 | 39 | 86 | 392 | 5476 | 16.4 | 42% | 49% | 1% | 0% | 10% |  |
| Zone3 6-compass | 34 | 29 | 35 | 87 | 9342 | 12.5 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 225 | 3655 | 10620 | 75.6 | 73% | 18% | 0% | 0% | 9% |  |
| Zone3 7-finalboss | 1 | 176 | 6182 | 6182 | 6182 | 6.2 | 19% | 39% | 42% | 3% | 42% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 212 | 1192 | 12148 | 41.5 | 41% | 48% | 0% | 0% | 11% |  |
| Zone3 8-endgame | 34 | 113 | 870 | 2872 | 8480 | 53.3 | 31% | 42% | 3% | 0% | 26% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 68 | 934 | 9996 | 114.9 | 49% | 43% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 60 | 400 | 6411 | 59.6 | 74% | 18% | 2% | 0% | 8% |  |
| compass | 128 | 52 | 151 | 2921 | 12148 | 123.1 | 75% | 18% | 0% | 0% | 7% |  |
| palisade | 169 | 51 | 55 | 251 | 6182 | 32.1 | 61% | 35% | 0% | 0% | 4% |  |
| rose | 179 | 56 | 107 | 835 | 29349 | 101.6 | 58% | 28% | 1% | 0% | 14% |  |
| stamp | 171 | 53 | 64 | 451 | 8299 | 56.1 | 56% | 35% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 118 | 711 | 7146 | 35.4 | 55% | 31% | 3% | 0% | 15% |  |
| wall-diff | 69 | 46 | 107 | 599 | 11920 | 43.9 | 31% | 42% | 1% | 0% | 27% |  |
| wall-gemini | 116 | 49 | 154 | 942 | 8299 | 53.2 | 50% | 31% | 2% | 0% | 20% |  |
| wall-gt | 67 | 46 | 105 | 626 | 8351 | 27.6 | 36% | 55% | 1% | 0% | 10% |  |
| wall-lt | 64 | 46 | 104 | 533 | 8351 | 26.8 | 40% | 50% | 1% | 0% | 10% |  |
| wall-plain | 387 | 47 | 66 | 672 | 29349 | 201.0 | 52% | 34% | 1% | 0% | 14% |  |
| watchtower | 85 | 55 | 77 | 1010 | 8351 | 49.2 | 44% | 44% | 2% | 0% | 12% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 29.3 | 0.00 / 0.12 / 3.71 / 0.00 / 25.5 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 12.1 | 0.00 / 0.65 / 11.5 / 0.00 / 0.01 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/0926 | 4-difference | 4 | 9x9 | 81 | 11.9 | 0.00 / 0.01 / 0.21 / 0.00 / 11.7 | 0% | 13% | 0% | 87% | 60 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 11.9 | 0.00 / 1.95 / 0.91 / 0.00 / 9.00 | 20% | 1% | 0% | 79% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 10.6 | 0.00 / 0.27 / 10.3 / 0.00 / 0.01 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 10.00 | 0.00 / 0.01 / 0.04 / 0.00 / 9.92 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 9.58 | 0.00 / 0.08 / 1.67 / 0.00 / 7.80 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 9.34 | 0.00 / 0.56 / 8.74 / 0.00 / 0.01 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 8.55 | 0.00 / 0.01 / 0.06 / 0.00 / 8.45 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 8.48 | 0.00 / 0.02 / 2.06 / 0.00 / 6.39 | 1% | 9% | 0% | 91% | 0 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 8.35 | 0.00 / 0.04 / 0.69 / 0.00 / 7.59 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 8.30 | 0.00 / 0.03 / 0.54 / 0.00 / 7.70 | 20% | 1% | 0% | 79% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 8.11 | 0.00 / 1.82 / 5.23 / 0.00 / 1.04 | 7% | 1% | 0% | 92% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 7.83 | 0.00 / 0.03 / 2.42 / 0.00 / 5.37 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 7.75 | 0.00 / 0.04 / 0.61 / 0.00 / 7.07 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.15 | 0.00 / 0.02 / 0.14 / 0.00 / 6.97 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 6.75 | 0.00 / 0.05 / 6.44 / 0.00 / 0.24 | 3% | 68% | 0% | 29% | 0 | UNIQUE |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 9x9 | 81 | 6.41 | 0.00 / 0.02 / 0.16 / 0.00 / 6.21 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/1152 | 7-finalboss | 6 | 15x15 | 176 | 6.18 | 0.00 / 0.21 / 1.92 / 0.00 / 4.02 | 19% | 39% | 42% | 42% | 10 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 5.87 | 0.00 / 0.01 / 4.40 / 0.00 / 1.44 | 7% | 15% | 0% | 78% | 0 | UNIQUE |
| Zone3/1003 | 3-vertex-radar | 6 | 10x10 | 100 | 5.76 | 0.00 / 0.02 / 5.51 / 0.00 / 0.20 | 14% | 32% | 0% | 54% | 0 | UNIQUE |
| Zone3/0912 | 5-inequality | 7 | 13x13 | 158 | 5.48 | 0.00 / 1.72 / 3.73 / 0.00 / 0.02 | 18% | 82% | 0% | 0% | 0 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 5.14 | 0.00 / 2.95 / 0.69 / 0.00 / 1.49 | 2% | 0% | 0% | 98% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 5.13 | 0.00 / 0.79 / 3.32 / 0.00 / 1.00 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 4.92 | 0.00 / 0.03 / 4.66 / 0.00 / 0.22 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 4.48 | 0.00 / 0.06 / 4.40 / 0.00 / 0.01 | 27% | 73% | 0% | 0% | 0 | UNIQUE |
| Zone1/0165 | 10-same-shape-no-touch | 5 | 9x8 | 70 | 4.14 | 0.00 / 0.04 / 0.08 / 0.00 / 4.00 | 3% | 0% | 97% | 97% | 25 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 4.02 | 0.00 / 0.12 / 3.87 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/1082 | 6-compass-main | 5 | 7x8 | 56 | 4.02 | 0.00 / 0.52 / 3.48 / 0.00 / 0.00 | 9% | 91% | 0% | 0% | 0 | UNIQUE |
| Zone3/0683 | 6-compass-main | 6 | 13x12 | 100 | 3.73 | 0.00 / 0.51 / 3.19 / 0.00 / 0.01 | 23% | 77% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 8.55 | 174.4 | 1.3 | 137.2 | 100% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 29.3 | 170.6 | 1.8 | 97.2 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 10.00 | 277.7 | 3.6 | 76.7 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 11.9 | 188.6 | 3.1 | 60.2 | 79% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.15 | 88.2 | 1.7 | 50.8 | 78% |
| Zone3/0926 | 4-difference | 4 | 81 | 11.9 | 147.2 | 3 | 49.7 | 87% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 8.35 | 84.4 | 1.8 | 45.9 | 71% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 9.58 | 195.4 | 4.5 | 43.1 | 76% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 5.13 | 63.4 | 1.8 | 34.5 | 70% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 3.14 | 56.1 | 1.7 | 32.6 | 8% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 5.14 | 142.9 | 4.6 | 30.9 | 98% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.19 | 53.1 | 1.7 | 30.5 | 96% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 5.87 | 48.5 | 1.6 | 30.5 | 78% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 8.11 | 165.6 | 5.6 | 29.8 | 92% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 3.58 | 73 | 2.5 | 29.5 | 75% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 4.48 | 52.1 | 1.8 | 28.4 | 0% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 5.76 | 57.6 | 2 | 28.3 | 54% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 4.92 | 104.8 | 3.8 | 27.6 | 96% |
| Zone3/1395b | 6-compass | 5 | 138 | 9.34 | 67.7 | 2.5 | 27 | 0% |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 81 | 6.41 | 79.1 | 3 | 26.3 | 100% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 8.30 | 86.4 | 3.4 | 25.5 | 79% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 3.45 | 47.9 | 2 | 24 | 76% |
| Zone3/1017 | 6-compass-main | 3 | 36 | 2.08 | 57.7 | 2.5 | 23.3 | 82% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 7.75 | 39.5 | 1.8 | 22.5 | 45% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 3.50 | 38.9 | 1.8 | 22.1 | 84% |
| Zone1/1167 | 10-same-shape-no-touch | 2 | 52 | 2.38 | 45.7 | 2.4 | 19 | 93% |
| Zone1/1439 | 10-same-shape-no-touch | 2 | 60 | 2.59 | 43.2 | 2.4 | 17.9 | 90% |
| Zone3/1322 | 8-endgame | 6 | 97 | 8.48 | 87.4 | 5.1 | 17 | 91% |
| Zone3/0956 | 1-tatami | 5 | 67 | 1.72 | 25.6 | 1.6 | 15.6 | 91% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 12.1 | 103.8 | 6.7 | 15.4 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.28 | 2.15 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.05 | 0.01 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.09 | 0.04 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.20 | 0.13 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.69 | 0.56 | UNIQUE |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 81 | 136 | 136 | 100% | 6.41 | 6.21 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.06 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.05 | 0.01 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.11 | 0.05 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.17 | 0.13 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 1.07 | 1.01 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 0.67 | 0.61 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 8.55 | 8.45 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.26 | 0.19 | UNIQUE |
| Zone3/0404 | 4-difference | 2 | 21 | 20 | 20 | 100% | 0.05 | 0.02 | UNIQUE |
| Zone3/0480 | 4-difference | 2 | 24 | 28 | 28 | 100% | 0.12 | 0.02 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.06 | 0.01 | UNIQUE |
| Zone3/1383 | 4-difference | 2 | 24 | 30 | 30 | 100% | 0.15 | 0.11 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 0.94 | 0.72 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.06 | 0.02 | UNIQUE |

## Decided without any search: 1051 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 11075 | 2148 | 498 |
| label | 3497 | 3329 | 156 |
| basic | 2643 | 2968 | 102 |
| stamp-place | 3195 | 2003 | 0 |
| size | 1699 | 2041 | 24 |
| boxy-place | 2301 | 600 | 0 |
| size-cut | 1173 | 1395 | 43 |
| cmp-wrap | 1600 | 471 | 0 |
| area-rel | 629 | 1420 | 21 |
| pal-link | 1311 | 495 | 1 |
| loo-outline | 1751 | 39 | 0 |
| mismatch-hall | 1498 | 187 | 0 |
| grow | 788 | 768 | 24 |
| gemini-place | 820 | 525 | 76 |
| euler-count | 796 | 616 | 7 |
| bridge-count | 774 | 633 | 0 |
| rose-cut | 1008 | 391 | 0 |
| tower-link | 926 | 278 | 76 |
| pal-wall | 606 | 437 | 0 |
| colour-count | 452 | 500 | 0 |
| tower-wall | 489 | 373 | 52 |
| compass | 676 | 233 | 0 |
| range-region | 195 | 616 | 0 |
| reach | 284 | 472 | 8 |
| mingle-area-place | 283 | 459 | 0 |
| loo-color | 311 | 407 | 0 |
| box-hall | 478 | 147 | 0 |
| mingle-shape-clash | 0 | 545 | 44 |
| min-reach | 285 | 273 | 10 |
| cmp-box | 551 | 0 | 0 |
| mingle-area-merge | 262 | 288 | 0 |
| rose-pair | 333 | 202 | 0 |
| loo-corner | 125 | 403 | 0 |
| match-place | 325 | 183 | 0 |
| bri-three | 287 | 213 | 0 |
| stamp-size | 234 | 210 | 0 |
| mingle-area-clash | 0 | 392 | 0 |
| boxy-corner | 208 | 144 | 0 |
| place-probe | 0 | 340 | 0 |
| area-sum | 135 | 190 | 13 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
