# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v125.js` (sha1 62ec9c822676), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.6 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 60 | 92 | 205 | 3.7 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 75 | 166 | 2735 | 11.9 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 99 | 298 | 1678 | 14.1 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 196 | 694 | 2996 | 17.1 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 419 | 2995 | 14239 | 42.3 | 45% | 40% | 8% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 467 | 6564 | 37283 | 61.1 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 708 | 832 | 863 | 1.7 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 61 | 91 | 132 | 3.1 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 74 | 191 | 1128 | 12.6 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 117 | 261 | 1079 | 18.6 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 153 | 736 | 29500 | 79.6 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 252 | 1029 | 4553 | 23.6 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 461 | 5262 | 10398 | 39.2 | 36% | 48% | 0% | 0% | 16% |  |
| Zone2 d7 | 8 | 90 | 981 | 6946 | 8071 | 22.0 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 59 | 81 | 194 | 2.9 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 76 | 193 | 652 | 11.5 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 128 | 543 | 8795 | 38.0 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 266 | 2525 | 34496 | 104.6 | 46% | 40% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 531 | 3350 | 15751 | 90.3 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 876 | 3630 | 16415 | 90.1 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1881 | 10254 | 21441 | 127.0 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 94 | 682 | 37283 | 152.0 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 113 | 546 | 29500 | 198.7 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 169 | 1858 | 34496 | 464.4 | 57% | 35% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 60 | 91 | 205 | 9.8 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 75 | 185 | 2735 | 36.1 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 117 | 370 | 8795 | 70.7 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 198 | 992 | 34496 | 201.3 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 365 | 2215 | 15751 | 156.1 | 42% | 47% | 2% | 0% | 11% |  |
| d6 | 87 | 88 | 669 | 5249 | 37283 | 190.5 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1592 | 9575 | 21441 | 150.7 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 47 | 66 | 70 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 49 | 92 | 152 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 71 | 129 | 160 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 54 | 67 | 71 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 90 | 188 | 351 | 3.6 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 160 | 487 | 2735 | 11.2 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 87 | 293 | 37283 | 46.9 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 77 | 117 | 708 | 3.7 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 92 | 921 | 7955 | 24.8 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 164 | 887 | 4478 | 20.3 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 252 | 1572 | 14239 | 39.1 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 99 | 1226 | 6860 | 24.5 | 58% | 36% | 0% | 0% | 6% |  |
| Zone2 2-palisade | 60 | 41 | 76 | 181 | 902 | 6.6 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 172 | 742 | 1780 | 9.3 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 122 | 286 | 3700 | 11.3 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 136 | 464 | 13946 | 23.7 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 90 | 554 | 29500 | 41.7 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 138 | 695 | 2076 | 10.9 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 122 | 568 | 6624 | 20.2 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 141 | 574 | 10398 | 24.7 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 134 | 814 | 8071 | 25.8 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 105 | 371 | 2756 | 17.3 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 100 | 630 | 9273 | 22.5 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 128 | 756 | 8795 | 32.2 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 151 | 708 | 16415 | 39.6 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 142 | 734 | 2863 | 19.8 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 70 | 157 | 13330 | 19.3 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 569 | 5284 | 14232 | 115.6 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1561 | 1561 | 1561 | 1.6 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 418 | 2218 | 34496 | 89.7 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1499 | 9224 | 21441 | 106.9 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 117 | 1851 | 29500 | 195.6 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 99 | 665 | 4947 | 67.2 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 338 | 3631 | 15751 | 187.8 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 106 | 499 | 21441 | 65.3 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 207 | 1693 | 37283 | 184.5 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 117 | 894 | 14239 | 93.3 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 197 | 1576 | 10398 | 74.8 | 62% | 26% | 4% | 0% | 13% |  |
| wall-diff | 69 | 46 | 183 | 914 | 16415 | 47.9 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 257 | 1658 | 21441 | 123.2 | 55% | 29% | 3% | 0% | 17% |  |
| wall-gt | 67 | 46 | 173 | 1298 | 34496 | 60.5 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 157 | 1100 | 34496 | 58.7 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 116 | 965 | 37283 | 329.6 | 57% | 32% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 187 | 2133 | 34496 | 99.0 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 37.3 | 0.03 / 0.25 / 5.57 / 0.00 / 31.4 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 34.5 | 0.01 / 0.11 / 1.91 / 0.00 / 32.4 | 27% | 2% | 0% | 71% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 29.5 | 0.01 / 0.03 / 0.10 / 0.00 / 29.3 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 21.4 | 0.00 / 0.08 / 1.57 / 0.00 / 19.8 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 16.4 | 0.00 / 4.17 / 3.12 / 0.00 / 9.11 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 15.8 | 0.12 / 1.48 / 14.1 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.2 | 0.01 / 0.10 / 5.74 / 0.00 / 8.37 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 14.2 | 0.07 / 1.14 / 13.0 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 13.9 | 0.00 / 0.02 / 0.07 / 0.00 / 13.8 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.5 | 0.02 / 0.26 / 4.01 / 0.00 / 9.18 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 13.3 | 0.12 / 0.67 / 12.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 12.2 | 0.00 / 3.03 / 8.42 / 0.00 / 0.69 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 11.1 | 0.00 / 0.21 / 2.60 / 0.00 / 8.27 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 10.6 | 0.01 / 0.08 / 9.15 / 0.00 / 1.33 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 10.4 | 0.01 / 0.03 / 0.42 / 0.00 / 9.92 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.89 | 0.00 / 0.06 / 2.50 / 0.00 / 7.30 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/1246 | 6-compass-main | 7 | 7x7 | 49 | 9.58 | 0.01 / 0.19 / 3.14 / 0.00 / 6.22 | 7% | 5% | 0% | 88% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.29 | 0.03 / 0.08 / 0.43 / 0.00 / 8.73 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.27 | 0.00 / 0.06 / 0.68 / 0.00 / 8.51 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 9.12 | 0.05 / 1.86 / 5.50 / 0.00 / 1.68 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.79 | 0.02 / 0.11 / 1.17 / 0.00 / 7.48 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 8.44 | 0.02 / 0.39 / 7.99 / 0.00 / 0.02 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 8.07 | 0.01 / 0.10 / 7.43 / 0.00 / 0.51 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.95 | 0.00 / 0.05 / 0.53 / 0.00 / 7.36 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.66 | 0.00 / 0.03 / 2.91 / 0.00 / 4.70 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 6.86 | 0.03 / 0.03 / 5.01 / 0.00 / 1.78 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.70 | 0.01 / 0.04 / 0.50 / 0.00 / 6.13 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.62 | 0.01 / 0.05 / 5.10 / 0.00 / 1.45 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 6.58 | 0.00 / 4.32 / 0.73 / 0.00 / 1.51 | 2% | 0% | 0% | 98% | 0 | UNIQUE |
| Zone2/0866 | 9-no-rectangles | 7 | 10x12 | 120 | 6.46 | 0.04 / 0.04 / 6.32 / 0.00 / 0.05 | 1% | 99% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 29.5 | 602 | 2.6 | 228.9 | 100% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 34.5 | 348.4 | 4.1 | 84.3 | 71% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 37.3 | 216.8 | 2.7 | 80.7 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 13.9 | 387.4 | 6.5 | 59.6 | 98% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 10.4 | 212.2 | 4 | 52.4 | 75% |
| Zone3/0928 | 4-difference | 6 | 63 | 16.4 | 260.5 | 5 | 51.9 | 78% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.95 | 98.2 | 2.7 | 36.6 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.27 | 80.6 | 2.4 | 33.5 | 79% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 9.12 | 112.6 | 4.1 | 27.2 | 70% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 8.07 | 93.9 | 3.6 | 26 | 33% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.55 | 81.3 | 3.3 | 24.9 | 0% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.87 | 64.5 | 2.7 | 24.1 | 96% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 12.2 | 248 | 11.1 | 22.3 | 90% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 11.1 | 226.5 | 10.5 | 21.6 | 76% |
| Zone3/1395b | 6-compass | 5 | 138 | 13.3 | 96.6 | 4.6 | 21 | 0% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.95 | 55 | 2.7 | 20.5 | 84% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.29 | 102.1 | 5 | 20.4 | 90% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.21 | 55.2 | 2.7 | 20.2 | 94% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 5.43 | 110.8 | 5.6 | 19.8 | 75% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.62 | 140.9 | 7.5 | 18.8 | 97% |
| Zone3/1246 | 6-compass-main | 7 | 49 | 9.58 | 195.4 | 10.5 | 18.6 | 88% |
| Zone2/0742 | 1-area-numbers | 6 | 112 | 6.40 | 57.2 | 3.2 | 18.1 | 28% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 6.86 | 56.7 | 3.2 | 18 | 81% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.70 | 87 | 4.9 | 17.7 | 73% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 4.41 | 61.2 | 3.8 | 16.1 | 76% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 6.58 | 182.8 | 13 | 14 | 98% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.70 | 61.7 | 4.5 | 13.7 | 57% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.79 | 44.9 | 3.3 | 13.5 | 45% |
| Zone2/0866 | 9-no-rectangles | 7 | 120 | 6.46 | 53.9 | 4 | 13.3 | 0% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 14.2 | 148.3 | 11.9 | 12.5 | 74% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.74 | 2.36 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.10 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.15 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.69 | 0.46 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.17 | 0.75 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.09 | 0.03 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.14 | 0.04 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.32 | 0.23 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.81 | 0.66 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.08 | 0.96 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 29.5 | 29.3 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.52 | 0.32 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.17 | 0.03 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.94 | 1.34 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.13 | 0.06 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.19 | 0.08 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.17 | 0.09 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 21.4 | 19.8 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.02 | 0.14 | UNIQUE |

## Decided without any search: 1081 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 332 |
| basic | 4338 | 4962 | 237 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2784 | 2232 | 44 |
| size | 2133 | 2126 | 38 |
| size-cut | 2142 | 1621 | 80 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1758 | 1346 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 422 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 959 | 641 | 32 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 467 | 106 |
| reach | 661 | 651 | 26 |
| tower-link | 938 | 279 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 576 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 358 | 57 |
| area-rel | 277 | 440 | 0 |
| loo-color | 289 | 415 | 0 |
| range-region | 144 | 472 | 2 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 307 | 269 | 0 |
| rose-pair | 338 | 216 | 0 |
| mingle-area-merge | 295 | 259 | 0 |
| loo-corner | 126 | 417 | 0 |
| bri-three | 310 | 218 | 0 |
| area-sum | 283 | 220 | 4 |
| box-hall | 353 | 117 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 170 | 268 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 187 | 175 | 27 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
