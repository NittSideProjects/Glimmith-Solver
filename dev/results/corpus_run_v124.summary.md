# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v124.js` (sha1 85599dbf1a96), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.2 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 61 | 91 | 186 | 3.6 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 66 | 131 | 2770 | 11.1 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 92 | 284 | 1520 | 13.5 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 154 | 543 | 2466 | 14.2 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 452 | 3137 | 13343 | 41.1 | 45% | 40% | 8% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 444 | 6138 | 33612 | 55.9 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 625 | 785 | 825 | 1.6 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 53 | 77 | 94 | 2.7 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 66 | 150 | 809 | 10.6 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 106 | 233 | 984 | 16.7 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 154 | 643 | 28800 | 96.9 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 207 | 871 | 4045 | 20.2 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 432 | 4459 | 10011 | 37.8 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 894 | 6133 | 7910 | 20.2 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 47 | 61 | 147 | 2.4 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 67 | 165 | 15265 | 25.1 | 71% | 24% | 0% | 0% | 5% |  |
| Zone3 d3 | 114 | 43 | 111 | 477 | 8629 | 34.2 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 235 | 2209 | 33957 | 97.0 | 46% | 39% | 0% | 0% | 15% |  |
| Zone3 d5 | 56 | 74 | 524 | 3493 | 14740 | 89.2 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 806 | 3597 | 15344 | 85.8 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1708 | 9687 | 20499 | 114.4 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 92 | 626 | 33612 | 141.0 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 102 | 518 | 28800 | 205.1 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 147 | 1722 | 33957 | 448.2 | 57% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 53 | 86 | 186 | 8.7 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 66 | 150 | 15265 | 46.8 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 105 | 341 | 8629 | 64.4 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 174 | 956 | 33957 | 208.1 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 329 | 1973 | 14740 | 150.5 | 42% | 47% | 2% | 0% | 11% |  |
| d6 | 87 | 88 | 620 | 4536 | 33612 | 179.5 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1516 | 8719 | 20499 | 136.2 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 42 | 61 | 64 | 0.5 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 52 | 67 | 145 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 72 | 119 | 120 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 54 | 75 | 87 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 87 | 159 | 287 | 3.1 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 125 | 448 | 2632 | 10.5 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 81 | 243 | 33612 | 42.2 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 69 | 108 | 625 | 3.4 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 92 | 835 | 7726 | 24.7 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 141 | 809 | 3756 | 19.1 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 207 | 1411 | 13343 | 35.9 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 98 | 978 | 8822 | 23.7 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 67 | 189 | 787 | 6.2 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 153 | 581 | 1467 | 7.6 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 112 | 282 | 3467 | 10.8 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 108 | 466 | 13026 | 21.7 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 83 | 486 | 28800 | 39.2 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 115 | 671 | 1691 | 9.9 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 108 | 548 | 6345 | 18.5 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 105 | 500 | 10011 | 22.5 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 117 | 745 | 25347 | 45.1 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 87 | 378 | 2681 | 16.0 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 89 | 587 | 9000 | 21.5 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 106 | 710 | 8629 | 29.4 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 134 | 759 | 15344 | 37.8 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 117 | 676 | 2852 | 17.6 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 51 | 112 | 14325 | 19.5 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 498 | 4826 | 15838 | 123.5 | 75% | 16% | 0% | 0% | 9% |  |
| Zone3 7-finalboss | 1 | 176 | 1413 | 1413 | 1413 | 1.4 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 346 | 1886 | 33957 | 83.8 | 43% | 47% | 0% | 0% | 10% |  |
| Zone3 8-endgame | 34 | 113 | 1289 | 8228 | 20499 | 97.7 | 33% | 48% | 3% | 0% | 19% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 106 | 1549 | 28800 | 178.9 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 92 | 584 | 4363 | 61.7 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 334 | 3832 | 15838 | 191.7 | 76% | 17% | 0% | 0% | 7% |  |
| palisade | 169 | 51 | 92 | 475 | 25347 | 81.8 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 181 | 1592 | 33957 | 184.4 | 59% | 27% | 1% | 0% | 13% |  |
| stamp | 171 | 53 | 108 | 836 | 13343 | 87.9 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 173 | 1343 | 10011 | 69.8 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 162 | 855 | 15344 | 45.4 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 204 | 1712 | 20499 | 115.7 | 55% | 29% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 149 | 1020 | 33957 | 57.1 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 143 | 912 | 33957 | 55.4 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 107 | 886 | 33957 | 307.5 | 57% | 32% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 143 | 1810 | 33957 | 91.6 | 45% | 45% | 2% | 0% | 10% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 34.0 | 0.01 / 0.08 / 1.80 / 0.00 / 32.1 | 27% | 2% | 0% | 71% | 60 | UNIQUE |
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 33.6 | 0.02 / 0.20 / 4.68 / 0.00 / 28.7 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 28.8 | 0.01 / 0.01 / 0.08 / 0.00 / 28.7 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 25.3 | 0.00 / 2.13 / 0.45 / 0.00 / 22.7 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 20.5 | 0.00 / 0.06 / 1.12 / 0.00 / 19.3 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 15.8 | 0.04 / 0.84 / 14.9 / 0.00 / 0.03 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 15.3 | 0.00 / 3.79 / 2.64 / 0.00 / 8.88 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/1402 | 6-compass-main | 2 | 7x8 | 56 | 15.3 | 0.00 / 0.18 / 3.74 / 0.00 / 11.3 | 2% | 2% | 0% | 96% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 14.7 | 0.10 / 1.42 / 13.2 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 14.3 | 0.18 / 0.94 / 13.2 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 13.6 | 0.00 / 0.29 / 2.42 / 0.00 / 10.9 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 13.3 | 0.01 / 0.07 / 5.40 / 0.00 / 7.83 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 13.0 | 0.00 / 0.02 / 0.06 / 0.00 / 12.9 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 12.3 | 0.01 / 0.19 / 3.47 / 0.00 / 8.60 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 12.2 | 0.00 / 3.01 / 8.21 / 0.00 / 0.94 | 7% | 1% | 0% | 92% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 10.0 | 0.01 / 0.02 / 0.61 / 0.00 / 9.35 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 9.90 | 0.01 / 0.08 / 8.82 / 0.00 / 0.97 | 3% | 66% | 0% | 31% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.40 | 0.03 / 0.08 / 0.45 / 0.00 / 8.81 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.00 | 0.00 / 0.04 / 0.53 / 0.00 / 8.40 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 8.82 | 0.03 / 0.03 / 4.97 / 0.00 / 3.78 | 7% | 15% | 0% | 78% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 8.72 | 0.00 / 0.04 / 2.39 / 0.00 / 6.27 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.63 | 0.02 / 0.09 / 0.94 / 0.00 / 7.57 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.13 | 0.04 / 1.63 / 5.01 / 0.00 / 1.43 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.91 | 0.01 / 0.12 / 7.14 / 0.00 / 0.62 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.73 | 0.00 / 0.04 / 0.44 / 0.00 / 7.22 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 7.08 | 0.00 / 0.03 / 2.66 / 0.00 / 4.37 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 6.66 | 0.01 / 0.27 / 6.35 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.43 | 0.01 / 0.02 / 0.53 / 0.00 / 5.85 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.35 | 0.01 / 0.06 / 5.79 / 0.00 / 0.47 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone2/0742 | 1-area-numbers | 6 | 12x12 | 112 | 5.46 | 0.03 / 0.10 / 5.27 / 0.00 / 0.05 | 23% | 77% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 28.8 | 587.7 | 2.3 | 259.2 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 25.3 | 352 | 3.3 | 106.6 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 33.6 | 195.4 | 2.3 | 86.4 | 48% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 34.0 | 343 | 4.9 | 70.7 | 71% |
| Zone2/1346 | 5-minmax | 4 | 36 | 13.0 | 361.8 | 6.1 | 59.6 | 98% |
| Zone3/1402 | 6-compass-main | 2 | 56 | 15.3 | 272.6 | 4.6 | 58.7 | 96% |
| Zone3/0928 | 4-difference | 6 | 63 | 15.3 | 243.6 | 4.2 | 57.5 | 78% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 10.0 | 204.3 | 3.7 | 55.6 | 75% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.73 | 95.4 | 2.4 | 40.3 | 78% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.00 | 78.3 | 2.5 | 31.3 | 79% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.91 | 92 | 3.1 | 29.5 | 33% |
| Zone3/1395b | 6-compass | 5 | 138 | 14.3 | 103.8 | 3.5 | 29.5 | 0% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 13.6 | 278.5 | 10.3 | 27 | 76% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 8.82 | 72.9 | 2.8 | 26.4 | 78% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.62 | 60.3 | 2.4 | 25.5 | 96% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.04 | 72.2 | 2.9 | 25.2 | 0% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 12.2 | 248.5 | 10.1 | 24.6 | 92% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.40 | 103.3 | 4.2 | 24.4 | 90% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.36 | 48.5 | 2.3 | 21.4 | 84% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.13 | 100.4 | 4.9 | 20.7 | 70% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.91 | 100.2 | 4.9 | 20.6 | 75% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.43 | 83.5 | 4.4 | 18.9 | 73% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.35 | 135 | 7.3 | 18.4 | 96% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.73 | 43.1 | 2.4 | 18.2 | 94% |
| Zone2/0742 | 1-area-numbers | 6 | 112 | 5.46 | 48.8 | 2.8 | 17.6 | 0% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.63 | 44 | 2.9 | 15 | 45% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.47 | 57.8 | 4.1 | 14.2 | 57% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 13.3 | 139 | 10.9 | 12.8 | 74% |
| Zone3/1248 | 8-endgame | 7 | 100 | 20.5 | 205 | 16.2 | 12.7 | 100% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 14.7 | 126 | 10.3 | 12.2 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.63 | 2.28 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.10 | 0.03 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.14 | 0.05 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.49 | 0.33 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.96 | 0.59 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.09 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.08 | 0.02 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.12 | 0.03 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.31 | 0.23 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.62 | 0.50 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.04 | 0.96 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 28.8 | 28.7 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.40 | 0.27 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.11 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.71 | 1.23 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.11 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.14 | 0.07 | UNIQUE |
| Zone3/0776 | 7-zone3-mixed | 4 | 25 | 40 | 40 | 100% | 1.03 | 0.34 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.13 | 0.08 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 20.5 | 19.3 | UNIQUE |

## Decided without any search: 1080 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 332 |
| basic | 4323 | 4957 | 236 |
| stamp-place | 3521 | 1969 | 0 |
| label | 2772 | 2236 | 44 |
| size | 2133 | 2129 | 36 |
| size-cut | 2142 | 1621 | 78 |
| bridge-count | 2055 | 1355 | 9 |
| grow | 1747 | 1344 | 21 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1298 | 407 | 0 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 941 | 637 | 32 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 485 | 110 |
| reach | 662 | 653 | 24 |
| tower-link | 938 | 277 | 42 |
| pal-wall | 640 | 404 | 0 |
| mingle-area-place | 410 | 613 | 0 |
| size-range | 399 | 581 | 2 |
| rose-cut | 747 | 170 | 0 |
| tower-wall | 471 | 355 | 57 |
| area-rel | 277 | 441 | 0 |
| loo-color | 290 | 415 | 0 |
| range-region | 144 | 476 | 2 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 307 | 269 | 0 |
| mingle-area-merge | 295 | 259 | 0 |
| rose-pair | 337 | 216 | 0 |
| loo-corner | 125 | 417 | 0 |
| bri-three | 310 | 218 | 0 |
| area-sum | 283 | 226 | 4 |
| box-hall | 353 | 117 | 0 |
| min-reach | 285 | 180 | 0 |
| shape-fit | 170 | 270 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| colour-count | 189 | 169 | 27 |
| boxy-corner | 253 | 128 | 0 |
| match-place | 241 | 133 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
