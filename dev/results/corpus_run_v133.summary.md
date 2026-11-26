# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v133.js` (sha1 746a62cb8b18), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 2  (more than 1 job = timings are noisier)
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
| Zone1 d1 | 55 | 25 | 70 | 117 | 263 | 4.5 | 98% | 2% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 86 | 185 | 2932 | 12.3 | 85% | 12% | 1% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 109 | 313 | 2130 | 17.0 | 72% | 21% | 0% | 0% | 8% |  |
| Zone1 d4 | 51 | 56 | 233 | 793 | 2824 | 18.4 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 515 | 2292 | 14305 | 43.6 | 45% | 43% | 6% | 0% | 12% |  |
| Zone1 d6 | 15 | 98 | 502 | 6498 | 43919 | 68.5 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 689 | 872 | 918 | 1.8 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 63 | 100 | 134 | 3.2 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 77 | 230 | 1288 | 13.1 | 67% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 131 | 352 | 1167 | 21.9 | 52% | 38% | 0% | 0% | 9% |  |
| Zone2 d4 | 86 | 47 | 179 | 987 | 31279 | 103.0 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 302 | 1010 | 5647 | 28.1 | 49% | 42% | 0% | 0% | 9% |  |
| Zone2 d6 | 26 | 78 | 608 | 2928 | 9059 | 37.8 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1392 | 4882 | 7216 | 19.8 | 27% | 45% | 0% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 52 | 76 | 175 | 2.6 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 74 | 240 | 626 | 12.2 | 73% | 23% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 148 | 640 | 9394 | 41.6 | 66% | 27% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 276 | 1784 | 24119 | 97.4 | 48% | 38% | 0% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 525 | 3488 | 14715 | 89.1 | 37% | 53% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 811 | 4151 | 10946 | 79.8 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 1799 | 9899 | 21888 | 115.2 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 114 | 740 | 43919 | 166.1 | 73% | 20% | 1% | 0% | 7% |  |
| Zone2 | 438 | 42 | 127 | 720 | 31279 | 227.0 | 57% | 34% | 0% | 0% | 8% |  |
| Zone3 | 478 | 53 | 183 | 1683 | 24119 | 438.0 | 58% | 34% | 0% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 59 | 108 | 263 | 10.3 | 96% | 4% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 80 | 213 | 2932 | 37.6 | 74% | 22% | 0% | 0% | 4% |  |
| d3 | 310 | 40 | 133 | 476 | 9394 | 80.6 | 62% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 233 | 1168 | 31279 | 218.8 | 50% | 38% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 443 | 2242 | 14715 | 160.8 | 43% | 47% | 1% | 0% | 10% |  |
| d6 | 87 | 88 | 717 | 4924 | 43919 | 186.2 | 36% | 50% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1550 | 9797 | 21888 | 136.8 | 26% | 49% | 2% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 56 | 71 | 73 | 0.6 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 60 | 84 | 173 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 89 | 143 | 158 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 61 | 89 | 99 | 0.3 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 103 | 251 | 364 | 4.1 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 155 | 635 | 3265 | 13.0 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 132 | 353 | 43919 | 50.8 | 89% | 10% | 0% | 0% | 1% |  |
| Zone1 8-poly | 39 | 42 | 79 | 132 | 689 | 4.0 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 111 | 1127 | 7661 | 27.3 | 58% | 31% | 6% | 0% | 11% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 198 | 1253 | 4752 | 21.4 | 47% | 38% | 2% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 262 | 2118 | 14305 | 42.9 | 55% | 31% | 0% | 0% | 14% |  |
| Zone2 1-area-numbers | 43 | 43 | 105 | 973 | 8716 | 21.9 | 59% | 38% | 0% | 0% | 3% |  |
| Zone2 2-palisade | 60 | 41 | 80 | 267 | 1060 | 8.1 | 82% | 17% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 246 | 810 | 2264 | 11.7 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 143 | 401 | 3776 | 13.3 | 72% | 23% | 0% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 139 | 606 | 15590 | 26.3 | 57% | 32% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 94 | 745 | 18747 | 31.4 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 151 | 1092 | 2356 | 14.2 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 131 | 589 | 6837 | 23.2 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 162 | 677 | 9059 | 22.2 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 171 | 1013 | 31279 | 54.6 | 50% | 40% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 102 | 391 | 2755 | 18.4 | 60% | 31% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 111 | 770 | 13739 | 28.5 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 151 | 828 | 9394 | 34.7 | 50% | 44% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 179 | 641 | 9797 | 30.0 | 46% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 153 | 813 | 2687 | 20.9 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 58 | 141 | 14715 | 20.5 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 612 | 4705 | 11921 | 101.4 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 1505 | 1505 | 1505 | 1.5 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 430 | 2006 | 24119 | 74.4 | 44% | 48% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1341 | 9373 | 21888 | 107.7 | 33% | 49% | 3% | 0% | 18% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 130 | 1865 | 18747 | 188.6 | 52% | 41% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 113 | 681 | 3661 | 68.8 | 81% | 14% | 1% | 0% | 4% |  |
| compass | 128 | 52 | 374 | 3945 | 14715 | 170.9 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 115 | 645 | 31279 | 96.2 | 63% | 33% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 237 | 1590 | 43919 | 183.0 | 60% | 28% | 0% | 0% | 12% |  |
| stamp | 171 | 53 | 132 | 1167 | 14305 | 103.6 | 59% | 33% | 0% | 0% | 8% |  |
| wall-delta | 98 | 49 | 223 | 1658 | 9059 | 72.6 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 209 | 739 | 9797 | 37.9 | 42% | 42% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 273 | 2122 | 21888 | 124.2 | 55% | 30% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 172 | 1237 | 24119 | 50.5 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 172 | 1032 | 24119 | 49.2 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 137 | 1099 | 43919 | 315.9 | 58% | 31% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 179 | 1669 | 24119 | 88.8 | 48% | 44% | 2% | 0% | 8% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 43.9 | 0.02 / 0.28 / 7.78 / 0.00 / 35.8 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 31.3 | 0.00 / 2.59 / 0.60 / 0.00 / 28.1 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 24.1 | 0.01 / 0.10 / 2.70 / 0.00 / 21.3 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 21.9 | 0.00 / 0.08 / 1.85 / 0.00 / 19.9 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 18.7 | 0.01 / 0.02 / 0.11 / 0.00 / 18.6 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 15.6 | 0.00 / 0.01 / 0.06 / 0.00 / 15.5 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 14.7 | 0.15 / 0.62 / 13.9 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.3 | 0.01 / 0.09 / 6.20 / 0.00 / 7.99 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 14.0 | 0.02 / 0.27 / 4.35 / 0.00 / 9.34 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 13.7 | 0.00 / 0.05 / 0.74 / 0.00 / 12.9 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 13.5 | 0.12 / 1.84 / 11.5 / 0.00 / 0.02 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 11.9 | 0.00 / 3.33 / 7.90 / 0.00 / 0.65 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 10.9 | 0.03 / 0.13 / 9.62 / 0.00 / 1.14 | 3% | 65% | 0% | 31% | 0 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 10.1 | 0.05 / 0.87 / 9.17 / 0.00 / 0.03 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 9.87 | 0.00 / 0.07 / 2.76 / 0.00 / 7.03 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 9.80 | 0.03 / 0.07 / 0.50 / 0.00 / 9.18 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 9.39 | 0.04 / 0.14 / 1.72 / 0.00 / 7.47 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.06 | 0.01 / 0.02 / 0.60 / 0.00 / 8.40 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 8.72 | 0.03 / 1.99 / 5.15 / 0.00 / 1.53 | 28% | 2% | 0% | 70% | 0 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 8.72 | 0.06 / 0.05 / 5.02 / 0.00 / 3.56 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 8.33 | 0.00 / 3.62 / 3.19 / 0.00 / 1.50 | 20% | 2% | 0% | 78% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 8.28 | 0.00 / 0.25 / 1.71 / 0.00 / 6.30 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 8.21 | 0.00 / 0.04 / 3.55 / 0.00 / 4.59 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.66 | 0.00 / 0.04 / 0.58 / 0.00 / 7.02 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 7.22 | 0.02 / 0.12 / 6.42 / 0.00 / 0.64 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.84 | 0.01 / 0.07 / 5.48 / 0.00 / 1.26 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone3/0994 | 3-vertex-radar | 4 | 9x9 | 77 | 6.82 | 0.01 / 0.03 / 0.65 / 0.00 / 6.10 | 8% | 19% | 0% | 73% | 0 | UNIQUE |
| Zone3/1084 | 6-compass-main | 5 | 9x8 | 48 | 5.86 | 0.02 / 0.16 / 1.03 / 0.00 / 4.62 | 8% | 16% | 0% | 76% | 0 | UNIQUE |
| Zone3/1082 | 6-compass-main | 5 | 7x8 | 56 | 5.69 | 0.01 / 1.12 / 4.54 / 0.00 / 0.01 | 9% | 91% | 0% | 0% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 5.65 | 0.01 / 0.15 / 5.46 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 18.7 | 382.6 | 2.6 | 147.2 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 31.3 | 434.4 | 5.1 | 84.7 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 43.9 | 255.3 | 3.1 | 82.5 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 15.6 | 433.1 | 6.3 | 69 | 98% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 24.1 | 243.6 | 5.4 | 45.5 | 71% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.06 | 184.9 | 4.4 | 41.8 | 75% |
| Zone3/0970 | 2-loopy | 4 | 115 | 13.7 | 119.5 | 3.2 | 37.4 | 79% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.66 | 94.6 | 3.2 | 29.5 | 78% |
| Zone3/0928 | 4-difference | 6 | 63 | 8.33 | 132.2 | 4.7 | 28.1 | 78% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 5.65 | 100.8 | 3.6 | 27.9 | 0% |
| Zone3/1395b | 6-compass | 5 | 138 | 14.7 | 106.6 | 4 | 26.5 | 0% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 2.40 | 60 | 2.6 | 23.5 | 94% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 8.72 | 72 | 3.1 | 23.2 | 81% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 9.80 | 107.7 | 4.7 | 22.9 | 90% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 11.9 | 243.3 | 10.8 | 22.6 | 90% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 8.72 | 107.7 | 5.4 | 20.1 | 70% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 7.22 | 83.9 | 4.2 | 19.8 | 33% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 3.72 | 62 | 3.2 | 19.3 | 96% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.84 | 145.5 | 7.6 | 19 | 97% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.82 | 88.6 | 5.8 | 15.2 | 73% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 4.76 | 97.1 | 6.5 | 15 | 75% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 13.5 | 115.8 | 8 | 14.5 | 0% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 8.28 | 169 | 11.9 | 14.2 | 76% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.78 | 62.9 | 4.9 | 12.9 | 57% |
| Zone3/1248 | 8-endgame | 7 | 100 | 21.9 | 218.9 | 17.1 | 12.8 | 100% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 9.39 | 47.9 | 3.8 | 12.7 | 45% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 5.18 | 51.8 | 4.1 | 12.6 | 0% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 3.40 | 94.6 | 7.6 | 12.4 | 0% |
| Zone3/1084 | 6-compass-main | 5 | 48 | 5.86 | 122 | 10.8 | 11.3 | 76% |
| Zone2/1436 | 6-same-size-no-touch | 6 | 140 | 3.59 | 25.7 | 2.6 | 10.1 | 54% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.93 | 2.38 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.14 | 0.04 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.17 | 0.08 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.71 | 0.42 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.28 | 0.73 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.13 | 0.03 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.14 | 0.08 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.18 | 0.04 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.40 | 0.30 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.88 | 0.70 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.30 | 1.18 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 18.7 | 18.6 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.64 | 0.36 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.14 | 0.02 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 2.54 | 1.90 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.15 | 0.05 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.28 | 0.16 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.22 | 0.15 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 21.9 | 19.9 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.51 | 0.10 | UNIQUE |

## Decided without any search: 1087 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| basic | 4679 | 5122 | 239 |
| bank-place | 8265 | 1056 | 191 |
| stamp-place | 3559 | 1937 | 0 |
| label | 2813 | 2202 | 8 |
| size | 2285 | 1998 | 26 |
| size-cut | 2243 | 1422 | 70 |
| bridge-count | 2085 | 1368 | 7 |
| grow | 1530 | 1112 | 6 |
| boxy-place | 2133 | 476 | 0 |
| loo-outline | 1772 | 47 | 0 |
| compass | 1364 | 412 | 0 |
| pal-link | 1281 | 420 | 0 |
| euler-count | 964 | 659 | 25 |
| reach | 765 | 771 | 30 |
| gemini-place | 825 | 495 | 116 |
| mismatch-hall | 1315 | 113 | 0 |
| tower-link | 937 | 266 | 42 |
| pal-wall | 647 | 380 | 0 |
| size-range | 415 | 594 | 10 |
| mingle-area-place | 405 | 609 | 0 |
| rose-cut | 747 | 147 | 0 |
| tower-wall | 471 | 361 | 57 |
| loo-color | 292 | 417 | 0 |
| min-reach | 402 | 304 | 0 |
| area-rel | 279 | 420 | 0 |
| stamp-size | 309 | 300 | 0 |
| bank-fit | 480 | 120 | 4 |
| cmp-box | 602 | 0 | 0 |
| range-region | 152 | 423 | 1 |
| loo-corner | 132 | 431 | 0 |
| rose-pair | 340 | 216 | 0 |
| area-sum | 284 | 241 | 4 |
| mingle-area-merge | 292 | 230 | 0 |
| bri-three | 316 | 204 | 0 |
| box-hall | 353 | 142 | 0 |
| shape-fit | 170 | 272 | 0 |
| cmp-wrap | 313 | 88 | 0 |
| boxy-corner | 252 | 145 | 0 |
| rose-grow | 294 | 80 | 0 |
| rose-reach | 156 | 199 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
