# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v97.js` (sha1 33253285781f), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 12.5 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 52 | 71 | 182 | 3.1 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 60 | 118 | 2488 | 9.3 | 79% | 18% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 73 | 232 | 980 | 10.5 | 67% | 24% | 0% | 0% | 10% |  |
| Zone1 d4 | 51 | 56 | 144 | 464 | 2106 | 12.9 | 55% | 35% | 0% | 0% | 10% |  |
| Zone1 d5 | 33 | 75 | 372 | 3504 | 12738 | 39.6 | 44% | 38% | 8% | 0% | 18% |  |
| Zone1 d6 | 15 | 98 | 506 | 8354 | 38994 | 67.1 | 46% | 26% | 12% | 0% | 28% |  |
| Zone1 d7 | 3 | 99 | 557 | 636 | 656 | 1.3 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 48 | 76 | 113 | 2.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 63 | 158 | 848 | 10.2 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 96 | 232 | 825 | 16.0 | 51% | 38% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 149 | 917 | 27953 | 75.1 | 44% | 44% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 212 | 807 | 4135 | 20.1 | 48% | 43% | 0% | 0% | 9% |  |
| Zone2 d6 | 26 | 78 | 391 | 2363 | 23338 | 43.6 | 34% | 50% | 0% | 0% | 16% |  |
| Zone2 d7 | 8 | 90 | 827 | 4173 | 7083 | 15.1 | 21% | 49% | 0% | 0% | 30% |  |
| Zone3 d1 | 45 | 17 | 43 | 62 | 118 | 2.1 | 93% | 7% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 60 | 196 | 1539 | 10.6 | 68% | 22% | 0% | 0% | 10% |  |
| Zone3 d3 | 114 | 43 | 104 | 500 | 8963 | 38.4 | 62% | 31% | 0% | 0% | 8% |  |
| Zone3 d4 | 84 | 55 | 198 | 2163 | 17381 | 81.8 | 42% | 41% | 0% | 0% | 17% |  |
| Zone3 d5 | 56 | 74 | 430 | 3239 | 13262 | 85.2 | 34% | 56% | 2% | 0% | 10% |  |
| Zone3 d6 | 46 | 91 | 674 | 5831 | 13800 | 92.8 | 31% | 53% | 2% | 0% | 16% |  |
| Zone3 d7 | 30 | 113 | 2110 | 10970 | 17391 | 114.4 | 22% | 46% | 3% | 0% | 32% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 76 | 518 | 38994 | 143.9 | 70% | 22% | 2% | 0% | 8% |  |
| Zone2 | 438 | 42 | 96 | 464 | 27953 | 182.7 | 56% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 131 | 1740 | 17391 | 425.4 | 54% | 35% | 1% | 0% | 12% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 46 | 72 | 182 | 7.8 | 94% | 6% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 62 | 160 | 2488 | 30.1 | 70% | 24% | 0% | 0% | 6% |  |
| d3 | 310 | 40 | 94 | 309 | 8963 | 65.0 | 59% | 32% | 0% | 0% | 9% |  |
| d4 | 221 | 52 | 164 | 1084 | 27953 | 169.8 | 46% | 41% | 0% | 0% | 13% |  |
| d5 | 136 | 69 | 311 | 2219 | 13262 | 144.9 | 41% | 47% | 3% | 0% | 12% |  |
| d6 | 87 | 88 | 572 | 6433 | 38994 | 203.5 | 35% | 48% | 3% | 0% | 18% |  |
| d7 | 41 | 107 | 1365 | 9456 | 17391 | 130.8 | 24% | 47% | 2% | 0% | 29% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 38 | 44 | 60 | 0.4 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 45 | 58 | 157 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 61 | 96 | 107 | 0.6 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 46 | 56 | 59 | 0.2 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 70 | 152 | 240 | 2.6 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 117 | 416 | 2488 | 10.1 | 65% | 27% | 3% | 0% | 8% |  |
| Zone1 7-slash-pack | 36 | 48 | 86 | 238 | 38994 | 46.9 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 58 | 96 | 557 | 2.9 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 75 | 640 | 7424 | 21.4 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 126 | 1160 | 8975 | 25.8 | 42% | 40% | 2% | 0% | 18% |  |
| Zone1 11-mixed-rules | 50 | 60 | 196 | 1057 | 12738 | 32.4 | 51% | 33% | 0% | 0% | 16% |  |
| Zone2 1-area-numbers | 43 | 43 | 85 | 918 | 23338 | 35.2 | 57% | 39% | 0% | 0% | 4% |  |
| Zone2 2-palisade | 60 | 41 | 71 | 161 | 731 | 5.8 | 80% | 19% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 148 | 648 | 1232 | 7.4 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 103 | 316 | 2926 | 9.6 | 70% | 25% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 84 | 403 | 11960 | 20.6 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 84 | 500 | 27953 | 40.9 | 56% | 34% | 0% | 0% | 11% |  |
| Zone2 7-1SPR | 37 | 43 | 118 | 731 | 2081 | 10.5 | 46% | 45% | 0% | 0% | 9% |  |
| Zone2 8-all-rectangles | 40 | 46 | 108 | 521 | 5791 | 19.5 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 120 | 405 | 2002 | 10.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 120 | 595 | 7083 | 22.8 | 48% | 42% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 78 | 299 | 10657 | 25.3 | 56% | 34% | 2% | 0% | 9% |  |
| Zone3 2-loopy | 58 | 61 | 86 | 497 | 2454 | 13.3 | 60% | 35% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 90 | 586 | 8963 | 31.2 | 47% | 45% | 1% | 0% | 8% |  |
| Zone3 4-difference | 53 | 38 | 125 | 724 | 17381 | 51.0 | 33% | 36% | 0% | 0% | 31% |  |
| Zone3 5-inequality | 56 | 39 | 107 | 539 | 2546 | 16.2 | 47% | 44% | 1% | 0% | 8% |  |
| Zone3 6-compass | 34 | 29 | 48 | 108 | 13262 | 18.3 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 501 | 4305 | 16126 | 105.1 | 73% | 18% | 0% | 0% | 9% |  |
| Zone3 7-finalboss | 1 | 176 | 4550 | 4550 | 4550 | 4.6 | 20% | 59% | 0% | 0% | 20% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 316 | 1660 | 13435 | 58.3 | 41% | 47% | 0% | 0% | 11% |  |
| Zone3 8-endgame | 34 | 113 | 1228 | 10058 | 17391 | 102.2 | 33% | 41% | 4% | 0% | 26% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 104 | 1302 | 27953 | 192.9 | 49% | 43% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 82 | 543 | 8975 | 73.5 | 78% | 16% | 2% | 0% | 6% |  |
| compass | 128 | 52 | 301 | 3574 | 16126 | 167.7 | 75% | 18% | 0% | 0% | 7% |  |
| palisade | 169 | 51 | 88 | 478 | 17391 | 60.5 | 61% | 35% | 0% | 0% | 4% |  |
| rose | 179 | 56 | 170 | 1451 | 38994 | 149.0 | 59% | 28% | 1% | 0% | 14% |  |
| stamp | 171 | 53 | 96 | 849 | 23338 | 102.0 | 56% | 35% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 145 | 1412 | 7424 | 51.6 | 56% | 29% | 4% | 0% | 15% |  |
| wall-diff | 69 | 46 | 161 | 761 | 17381 | 61.0 | 31% | 43% | 0% | 0% | 26% |  |
| wall-gemini | 116 | 49 | 222 | 1425 | 17391 | 91.7 | 51% | 29% | 3% | 0% | 20% |  |
| wall-gt | 67 | 46 | 131 | 1009 | 13435 | 34.1 | 40% | 51% | 1% | 0% | 9% |  |
| wall-lt | 64 | 46 | 122 | 844 | 13435 | 32.8 | 45% | 46% | 1% | 0% | 9% |  |
| wall-plain | 387 | 47 | 100 | 956 | 38994 | 296.0 | 54% | 33% | 1% | 0% | 14% |  |
| watchtower | 85 | 55 | 145 | 1601 | 13435 | 74.0 | 44% | 44% | 2% | 0% | 12% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 39.0 | 0.00 / 0.18 / 4.63 / 0.00 / 34.2 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 28.0 | 0.00 / 0.01 / 0.08 / 0.00 / 27.8 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 23.3 | 0.00 / 0.03 / 4.70 / 0.00 / 18.6 | 7% | 15% | 0% | 78% | 60 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 17.4 | 0.00 / 0.04 / 0.62 / 0.00 / 16.7 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/0926 | 4-difference | 4 | 9x9 | 81 | 17.4 | 0.00 / 0.02 / 0.44 / 0.00 / 16.9 | 0% | 13% | 0% | 87% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 16.1 | 0.00 / 0.99 / 15.1 / 0.00 / 0.02 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 13.8 | 0.00 / 0.03 / 3.38 / 0.00 / 10.4 | 1% | 9% | 0% | 91% | 0 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 13.4 | 0.00 / 0.07 / 1.20 / 0.00 / 12.1 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 13.3 | 0.00 / 0.70 / 12.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 13.2 | 0.00 / 0.21 / 3.77 / 0.00 / 9.20 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 12.7 | 0.00 / 0.06 / 3.56 / 0.00 / 9.11 | 20% | 1% | 0% | 79% | 0 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 12.7 | 0.00 / 1.18 / 11.5 / 0.00 / 0.01 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 12.7 | 0.00 / 2.32 / 1.86 / 0.00 / 8.51 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 12.0 | 0.00 / 0.02 / 0.06 / 0.00 / 11.9 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 11.6 | 0.00 / 0.22 / 2.18 / 0.00 / 9.14 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 10.7 | 0.00 / 0.05 / 4.25 / 0.00 / 6.39 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0956 | 1-tatami | 5 | 10x7 | 67 | 10.7 | 0.00 / 0.02 / 0.28 / 0.00 / 10.3 | 8% | 1% | 91% | 91% | 83 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 10.5 | 0.00 / 2.84 / 6.81 / 0.00 / 0.79 | 7% | 1% | 0% | 92% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.46 | 0.00 / 0.05 / 0.26 / 0.00 / 9.13 | 7% | 0% | 0% | 93% | 60 | UNIQUE |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 9x9 | 81 | 8.97 | 0.00 / 0.04 / 0.29 / 0.00 / 8.63 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 8.96 | 0.00 / 0.08 / 0.88 / 0.00 / 7.99 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 8.51 | 0.00 / 0.07 / 7.72 / 0.00 / 0.69 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.20 | 0.00 / 1.63 / 4.99 / 0.00 / 1.56 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.42 | 0.00 / 0.03 / 0.29 / 0.00 / 7.08 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone3/1003 | 3-vertex-radar | 6 | 10x10 | 100 | 7.11 | 0.00 / 0.06 / 6.44 / 0.00 / 0.59 | 14% | 30% | 0% | 56% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.08 | 0.00 / 0.13 / 6.46 / 0.00 / 0.48 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 6.89 | 0.00 / 0.28 / 6.58 / 0.00 / 0.01 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone2/1436 | 6-same-size-no-touch | 6 | 12x12 | 140 | 5.98 | 0.00 / 0.04 / 1.65 / 0.00 / 4.27 | 0% | 35% | 0% | 65% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 5.79 | 0.00 / 0.06 / 5.22 / 0.00 / 0.49 | 0% | 4% | 0% | 96% | 0 | UNIQUE |
| Zone3/1017 | 6-compass-main | 3 | 6x6 | 36 | 5.77 | 0.00 / 0.45 / 0.43 / 0.00 / 4.86 | 18% | 0% | 0% | 82% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 28.0 | 570.5 | 2.5 | 229.2 | 100% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 39.0 | 226.7 | 2.2 | 104.7 | 48% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 23.3 | 192.9 | 2.2 | 85.9 | 78% |
| Zone2/1346 | 5-minmax | 4 | 36 | 12.0 | 332.2 | 5.2 | 63.4 | 98% |
| Zone3/0956 | 1-tatami | 5 | 67 | 10.7 | 159.1 | 3 | 53.3 | 91% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.42 | 91.6 | 2.2 | 41.2 | 78% |
| Zone3/0926 | 4-difference | 4 | 81 | 17.4 | 214.6 | 5.3 | 40.8 | 87% |
| Zone3/0928 | 4-difference | 6 | 63 | 12.7 | 201.7 | 5 | 40.5 | 78% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 13.4 | 135.7 | 3.4 | 39.6 | 71% |
| Zone3/1017 | 6-compass-main | 3 | 36 | 5.77 | 160.2 | 5 | 32.2 | 82% |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 81 | 8.97 | 110.8 | 3.7 | 30 | 100% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.20 | 101.2 | 3.4 | 29.6 | 70% |
| Zone3/1395b | 6-compass | 5 | 138 | 13.3 | 96.1 | 3.4 | 28.5 | 0% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.08 | 82.4 | 2.9 | 28.3 | 33% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 11.6 | 235.9 | 8.7 | 27.1 | 76% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 4.14 | 73.8 | 2.9 | 25.7 | 0% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.26 | 54.4 | 2.2 | 24.4 | 96% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 7.11 | 71.1 | 3 | 23.4 | 56% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 10.5 | 213.6 | 9.8 | 21.7 | 92% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 5.39 | 70 | 3.3 | 21.1 | 73% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 4.08 | 45.3 | 2.2 | 20.9 | 84% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.46 | 103.9 | 5 | 20.9 | 93% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 4.62 | 64.1 | 3.3 | 19.6 | 76% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.69 | 95.6 | 5 | 19.2 | 75% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 5.98 | 42.7 | 2.3 | 18.5 | 65% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 5.79 | 123.2 | 6.9 | 17.8 | 96% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 8.96 | 45.7 | 2.7 | 16.7 | 45% |
| Zone3/1322 | 8-endgame | 6 | 97 | 13.8 | 142.3 | 9 | 15.9 | 91% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 1.45 | 36.2 | 2.3 | 15.7 | 94% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.60 | 100 | 6.9 | 14.5 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.49 | 2.25 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.08 | 0.02 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.13 | 0.06 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.34 | 0.22 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 0.99 | 0.77 | UNIQUE |
| Zone1/0201 | 10-same-shape-no-touch | 6 | 81 | 136 | 136 | 100% | 8.97 | 8.63 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.07 | 0.02 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.13 | 0.06 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.36 | 0.28 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 1.35 | 1.25 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.08 | 0.98 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 28.0 | 27.8 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.41 | 0.30 | UNIQUE |
| Zone3/0404 | 4-difference | 2 | 21 | 20 | 20 | 100% | 0.07 | 0.03 | UNIQUE |
| Zone3/0480 | 4-difference | 2 | 24 | 28 | 28 | 100% | 0.19 | 0.03 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.09 | 0.02 | UNIQUE |
| Zone3/1383 | 4-difference | 2 | 24 | 30 | 30 | 100% | 0.24 | 0.19 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 1.60 | 1.19 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.09 | 0.05 | UNIQUE |

## Decided without any search: 1056 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8147 | 886 | 348 |
| label | 3443 | 3332 | 166 |
| basic | 3045 | 3248 | 114 |
| stamp-place | 3395 | 2045 | 0 |
| size | 2080 | 2161 | 52 |
| size-cut | 2080 | 1662 | 71 |
| bridge-count | 2027 | 1345 | 16 |
| boxy-place | 2217 | 468 | 0 |
| area-rel | 758 | 1447 | 2 |
| grow | 1244 | 898 | 24 |
| loo-outline | 1772 | 40 | 0 |
| compass | 1268 | 435 | 0 |
| pal-link | 1267 | 417 | 0 |
| gemini-place | 950 | 514 | 117 |
| euler-count | 834 | 629 | 16 |
| mismatch-hall | 1171 | 142 | 0 |
| tower-link | 933 | 267 | 76 |
| reach | 559 | 556 | 24 |
| pal-wall | 627 | 414 | 0 |
| colour-count | 457 | 537 | 0 |
| rose-cut | 767 | 186 | 0 |
| tower-wall | 505 | 385 | 52 |
| bank-fit | 529 | 190 | 17 |
| mingle-area-place | 296 | 435 | 0 |
| loo-color | 283 | 409 | 0 |
| min-reach | 341 | 300 | 4 |
| range-region | 151 | 422 | 0 |
| stamp-size | 301 | 266 | 0 |
| cmp-box | 558 | 0 | 0 |
| area-sum | 289 | 255 | 13 |
| mingle-area-merge | 264 | 278 | 3 |
| loo-corner | 125 | 414 | 0 |
| rose-pair | 338 | 196 | 0 |
| bri-three | 307 | 222 | 3 |
| rose-grow | 350 | 140 | 0 |
| boxy-corner | 291 | 188 | 0 |
| mingle-shape-clash | 0 | 464 | 5 |
| box-hall | 353 | 83 | 0 |
| shape-fit | 165 | 266 | 0 |
| cmp-wrap | 351 | 66 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
