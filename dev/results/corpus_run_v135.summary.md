# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v135.js` (sha1 ee89ac8e03eb), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 13.3 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 72 | 102 | 122 | 4.0 | 98% | 2% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 85 | 176 | 2670 | 11.4 | 85% | 12% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 118 | 342 | 3378 | 19.8 | 72% | 21% | 0% | 0% | 8% |  |
| Zone1 d4 | 51 | 56 | 218 | 739 | 3416 | 18.3 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 520 | 2041 | 15434 | 40.6 | 45% | 43% | 6% | 0% | 12% |  |
| Zone1 d6 | 15 | 98 | 640 | 6697 | 50068 | 74.2 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 604 | 621 | 626 | 1.3 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 66 | 95 | 109 | 3.3 | 94% | 6% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 90 | 216 | 968 | 13.8 | 67% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 115 | 303 | 1008 | 19.2 | 51% | 40% | 0% | 0% | 9% |  |
| Zone2 d4 | 86 | 47 | 148 | 1165 | 32574 | 96.0 | 43% | 45% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 236 | 923 | 6343 | 27.4 | 44% | 44% | 0% | 0% | 11% |  |
| Zone2 d6 | 26 | 78 | 470 | 2874 | 8821 | 33.0 | 33% | 52% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1255 | 4645 | 6438 | 17.0 | 27% | 45% | 0% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 56 | 74 | 379 | 3.0 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 82 | 228 | 537 | 11.8 | 73% | 23% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 123 | 572 | 8989 | 38.3 | 66% | 27% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 240 | 2716 | 19146 | 92.4 | 47% | 39% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 402 | 3607 | 16294 | 90.0 | 37% | 54% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 628 | 3674 | 10247 | 71.3 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1643 | 8840 | 31822 | 112.1 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 114 | 644 | 50068 | 169.8 | 73% | 20% | 1% | 0% | 7% |  |
| Zone2 | 438 | 42 | 115 | 624 | 32574 | 209.6 | 55% | 36% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 149 | 1563 | 31822 | 418.8 | 57% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 61 | 100 | 379 | 10.3 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 85 | 209 | 2670 | 37.0 | 74% | 22% | 0% | 0% | 4% |  |
| d3 | 310 | 40 | 119 | 394 | 8989 | 77.3 | 62% | 31% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 192 | 1168 | 32574 | 206.7 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 341 | 2207 | 16294 | 158.0 | 42% | 48% | 1% | 0% | 11% |  |
| d6 | 87 | 88 | 568 | 4681 | 50068 | 178.5 | 35% | 51% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1493 | 8083 | 31822 | 130.5 | 26% | 49% | 2% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 53 | 68 | 71 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 58 | 103 | 182 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 86 | 111 | 160 | 0.7 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 70 | 81 | 87 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 105 | 218 | 384 | 4.1 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 121 | 637 | 2670 | 10.1 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 133 | 367 | 50068 | 56.5 | 89% | 10% | 0% | 0% | 1% |  |
| Zone1 8-poly | 39 | 42 | 93 | 155 | 626 | 4.3 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 91 | 974 | 7802 | 28.0 | 58% | 31% | 6% | 0% | 11% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 186 | 1080 | 5041 | 21.6 | 47% | 38% | 2% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 260 | 1257 | 15434 | 42.8 | 55% | 31% | 0% | 0% | 14% |  |
| Zone2 1-area-numbers | 43 | 43 | 105 | 882 | 6967 | 19.4 | 59% | 35% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 83 | 183 | 499 | 6.2 | 74% | 24% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 196 | 1164 | 2167 | 11.9 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 127 | 312 | 2494 | 10.7 | 72% | 23% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 144 | 494 | 14761 | 25.3 | 57% | 32% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 105 | 565 | 12569 | 26.9 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 119 | 727 | 2261 | 11.5 | 46% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 122 | 538 | 6997 | 24.1 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 141 | 555 | 8821 | 20.7 | 26% | 66% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 147 | 834 | 32574 | 52.9 | 45% | 45% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 89 | 297 | 2559 | 15.7 | 60% | 31% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 101 | 597 | 13521 | 26.3 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 130 | 602 | 8989 | 32.0 | 50% | 44% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 137 | 459 | 8787 | 24.7 | 45% | 36% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 108 | 571 | 2718 | 16.8 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 65 | 175 | 16294 | 22.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 464 | 4825 | 13184 | 102.4 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1372 | 1372 | 1372 | 1.4 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 348 | 2076 | 19146 | 68.7 | 44% | 48% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1153 | 9405 | 31822 | 108.6 | 33% | 49% | 3% | 0% | 18% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 116 | 1614 | 14761 | 175.7 | 51% | 41% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 105 | 600 | 3682 | 59.2 | 81% | 14% | 1% | 0% | 4% |  |
| compass | 128 | 52 | 376 | 3900 | 16294 | 174.1 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 102 | 473 | 32574 | 100.9 | 58% | 38% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 223 | 1315 | 50068 | 173.2 | 60% | 29% | 0% | 0% | 12% |  |
| stamp | 171 | 53 | 133 | 1293 | 15434 | 107.3 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 196 | 1201 | 8821 | 67.3 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 170 | 677 | 8787 | 31.3 | 41% | 43% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 264 | 2128 | 31822 | 131.5 | 55% | 30% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 135 | 854 | 19146 | 40.2 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 130 | 714 | 19146 | 39.2 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 115 | 903 | 50068 | 301.8 | 58% | 31% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 156 | 1424 | 19146 | 77.8 | 47% | 44% | 2% | 0% | 8% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 50.1 | 0.02 / 0.32 / 9.20 / 0.00 / 40.5 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 32.6 | 0.00 / 2.56 / 0.39 / 0.00 / 29.6 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 31.8 | 0.00 / 0.07 / 1.40 / 0.00 / 30.3 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 19.1 | 0.01 / 0.10 / 2.35 / 0.00 / 16.7 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 16.3 | 0.17 / 0.75 / 15.3 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 15.9 | 0.07 / 1.57 / 14.3 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 15.4 | 0.01 / 0.16 / 6.03 / 0.00 / 9.21 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 14.8 | 0.00 / 0.02 / 0.07 / 0.00 / 14.6 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 13.5 | 0.00 / 0.04 / 0.73 / 0.00 / 12.7 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 13.2 | 0.00 / 3.23 / 9.27 / 0.00 / 0.65 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 12.6 | 0.01 / 0.02 / 0.13 / 0.00 / 12.4 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 12.4 | 0.02 / 0.19 / 3.74 / 0.00 / 8.42 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 10.2 | 0.01 / 0.07 / 8.99 / 0.00 / 1.16 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 9.44 | 0.00 / 0.03 / 3.44 / 0.00 / 5.95 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.32 | 0.00 / 0.05 / 2.41 / 0.00 / 6.84 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.99 | 0.03 / 0.13 / 1.52 / 0.00 / 7.29 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 8.82 | 0.01 / 0.03 / 0.56 / 0.00 / 8.20 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 8.79 | 0.02 / 0.06 / 0.46 / 0.00 / 8.23 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 8.08 | 0.06 / 0.47 / 7.51 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 8.05 | 0.01 / 0.21 / 2.07 / 0.00 / 5.74 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 7.97 | 0.03 / 1.79 / 4.93 / 0.00 / 1.20 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.80 | 0.00 / 0.06 / 0.56 / 0.00 / 7.16 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 7.15 | 0.01 / 0.04 / 0.66 / 0.00 / 6.42 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 7.00 | 0.01 / 0.07 / 5.64 / 0.00 / 1.25 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 6.97 | 0.04 / 0.04 / 5.09 / 0.00 / 1.77 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 6.44 | 0.01 / 0.14 / 5.95 / 0.00 / 0.32 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/1082 | 6-compass-main | 5 | 7x8 | 56 | 6.39 | 0.01 / 1.07 / 5.28 / 0.00 / 0.01 | 9% | 91% | 0% | 0% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 6.34 | 0.01 / 0.13 / 6.17 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 5.81 | 0.00 / 1.74 / 2.72 / 0.00 / 1.33 | 20% | 2% | 0% | 78% | 0 | UNIQUE |
| Zone3/0374 | 6-compass-main | 5 | 9x7 | 57 | 5.71 | 0.01 / 1.62 / 4.05 / 0.00 / 0.01 | 40% | 60% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 32.6 | 452.4 | 4 | 114.4 | 76% |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 12.6 | 256.5 | 2.6 | 99.5 | 100% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 50.1 | 291.1 | 3.3 | 88.1 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 14.8 | 410 | 5.2 | 78.2 | 98% |
| Zone3/0970 | 2-loopy | 4 | 115 | 13.5 | 117.6 | 2.3 | 50.8 | 79% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 19.1 | 193.4 | 4.4 | 44 | 71% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 8.82 | 180 | 4.2 | 43 | 75% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.80 | 96.3 | 2.6 | 37.5 | 78% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 6.34 | 113.3 | 3.6 | 31.8 | 0% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 3.93 | 98.3 | 3.3 | 29.7 | 94% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 4.39 | 73.1 | 2.6 | 28.5 | 96% |
| Zone3/1395b | 6-compass | 5 | 138 | 16.3 | 118.1 | 4.7 | 25.3 | 0% |
| Zone3/1248 | 8-endgame | 7 | 100 | 31.8 | 318.2 | 12.7 | 25.1 | 100% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 15.9 | 136.3 | 5.9 | 23.2 | 0% |
| Zone1/1100 | 11-mixed-rules | 5 | 96 | 15.4 | 160.8 | 7 | 23 | 74% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 7.97 | 98.3 | 4.4 | 22.4 | 70% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 8.79 | 96.6 | 4.3 | 22.3 | 90% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 6.44 | 74.9 | 3.4 | 21.9 | 33% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 7.00 | 148.9 | 6.8 | 21.8 | 97% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 13.2 | 269.1 | 12.6 | 21.4 | 90% |
| Zone3/0928 | 4-difference | 6 | 63 | 5.81 | 92.2 | 4.3 | 21.3 | 78% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 7.15 | 92.9 | 4.5 | 20.6 | 73% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 6.97 | 57.6 | 2.9 | 19.6 | 81% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.58 | 99.5 | 6.8 | 14.6 | 0% |
| Zone1/1098 | 11-mixed-rules | 3 | 56 | 3.38 | 60.3 | 4.4 | 13.8 | 89% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.99 | 45.9 | 3.5 | 13.1 | 45% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 8.05 | 164.2 | 12.9 | 12.8 | 76% |
| Zone3/1322 | 8-endgame | 6 | 97 | 9.44 | 97.3 | 8.1 | 12 | 89% |
| Zone1/1099 | 11-mixed-rules | 3 | 64 | 3.27 | 51.1 | 4.4 | 11.6 | 86% |
| Zone3/0208 | 8-endgame | 7 | 90 | 12.4 | 137.7 | 12.7 | 10.9 | 99% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.67 | 2.31 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.15 | 0.05 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.19 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.74 | 0.38 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.15 | 0.64 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.14 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.14 | 0.09 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.17 | 0.04 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.35 | 0.27 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.91 | 0.70 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.68 | 1.57 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 12.6 | 12.4 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 1.16 | 0.92 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.17 | 0.03 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.99 | 1.49 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.11 | 0.04 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.26 | 0.16 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.15 | 0.09 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 31.8 | 30.3 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.61 | 0.14 | UNIQUE |

## Decided without any search: 1086 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 5054 | 6006 | 257 |
| bank-place | 9102 | 1315 | 200 |
| grow | 4304 | 3202 | 64 |
| size | 2681 | 2370 | 32 |
| stamp-place | 2565 | 1670 | 0 |
| min-grow | 1736 | 976 | 0 |
| boxy-place | 2156 | 506 | 0 |
| reach | 1011 | 1098 | 37 |
| rose-grow | 1523 | 570 | 0 |
| loo-outline | 1769 | 36 | 0 |
| pal-link | 1140 | 540 | 0 |
| cmp-wrap | 1261 | 370 | 0 |
| mismatch-hall | 1451 | 142 | 0 |
| size-range | 663 | 853 | 10 |
| tower-link | 952 | 297 | 68 |
| rose-pair | 911 | 405 | 0 |
| gemini-place | 580 | 489 | 104 |
| min-reach | 483 | 578 | 0 |
| pal-wall | 563 | 497 | 0 |
| tower-wall | 510 | 394 | 59 |
| compass | 715 | 218 | 0 |
| loo-color | 336 | 491 | 0 |
| stamp-size | 429 | 386 | 0 |
| loo-corner | 247 | 566 | 0 |
| rose-region | 353 | 370 | 0 |
| rose-reach | 341 | 304 | 0 |
| solitude-grow | 376 | 223 | 0 |
| cmp-box | 577 | 0 | 0 |
| bank-fit | 438 | 117 | 4 |
| bri-three | 320 | 218 | 0 |
| box-hall | 353 | 142 | 0 |
| mingle-area-merge | 276 | 215 | 0 |
| solitude-pair | 239 | 216 | 0 |
| boxy-corner | 240 | 144 | 0 |
| range-region | 148 | 233 | 0 |
| shape-range | 183 | 120 | 18 |
| solitude-region | 118 | 182 | 0 |
| rose-cut | 222 | 72 | 0 |
| mingle-area-place | 137 | 156 | 0 |
| cmp-place | 188 | 81 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
