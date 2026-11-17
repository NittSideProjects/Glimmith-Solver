# Glimmith corpus run

* puzzles in this report: **1225**   (runs merged: 1; the latest record of each puzzle counts)
* solver core: `solver-core.v128.js` (sha1 b1253bce09e9), node v22.23.4, linux x64, 4 cores (Intel(R) Xeon(R) Processor @ 2.10GHz), jobs 3  (more than 1 job = timings are noisier)
* hard limit per puzzle: 60 s (worker killed 3 s after that); solver settings = the page's defaults: {"testMs":100,"restart":"continue","order":"clues","focusMode":"near","nearShare":0.4,"useWitness":true,"stopAtTwo":true,"nodeBudget":0}
* summed solver time: 16.7 min

How to read the edge columns: every edge that is not a hand-drawn wall is decided by exactly one of **instant** (first propagation, nothing assumed), **probe** (look-ahead: assume it, propagate, contradiction; still no search), **scan** ("wall per wall": a narrow exact search per edge, plus the edges that then follow by propagation; the column "proved by the search itself" counts only the edges the search settled directly) or is **left** for the final exact solver. The four shares are means over the puzzles of the row (percent of that puzzle's edges).

## Verdicts

| verdict | puzzles | meaning |
|---|---|---|
| UNIQUE | 1225 | the solver proved the stored solution is the only tiling |

## Time and edge split by zone and difficulty

| zone / difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 d1 | 55 | 25 | 68 | 126 | 292 | 4.5 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 d2 | 75 | 36 | 85 | 174 | 3181 | 13.5 | 82% | 15% | 2% | 0% | 3% |  |
| Zone1 d3 | 77 | 40 | 112 | 363 | 1772 | 16.8 | 70% | 21% | 0% | 0% | 9% |  |
| Zone1 d4 | 51 | 56 | 253 | 789 | 4601 | 21.9 | 60% | 31% | 0% | 0% | 9% |  |
| Zone1 d5 | 33 | 75 | 574 | 3823 | 14425 | 51.9 | 45% | 40% | 8% | 0% | 15% |  |
| Zone1 d6 | 15 | 98 | 498 | 6680 | 41642 | 69.1 | 46% | 26% | 12% | 0% | 27% |  |
| Zone1 d7 | 3 | 99 | 855 | 1000 | 1037 | 2.1 | 50% | 50% | 0% | 0% | 0% |  |
| Zone2 d1 | 48 | 21 | 67 | 113 | 130 | 3.5 | 95% | 5% | 0% | 0% | 0% |  |
| Zone2 d2 | 104 | 30 | 97 | 246 | 1151 | 15.5 | 66% | 29% | 0% | 0% | 5% |  |
| Zone2 d3 | 119 | 37 | 144 | 347 | 1104 | 23.7 | 51% | 39% | 0% | 0% | 10% |  |
| Zone2 d4 | 86 | 47 | 199 | 1015 | 38052 | 116.7 | 45% | 43% | 0% | 0% | 12% |  |
| Zone2 d5 | 47 | 60 | 299 | 1257 | 6813 | 34.1 | 48% | 41% | 0% | 0% | 10% |  |
| Zone2 d6 | 26 | 78 | 693 | 4479 | 9651 | 40.9 | 36% | 49% | 0% | 0% | 15% |  |
| Zone2 d7 | 8 | 90 | 1448 | 5968 | 10170 | 23.7 | 21% | 50% | 7% | 0% | 28% |  |
| Zone3 d1 | 45 | 17 | 51 | 89 | 166 | 2.8 | 94% | 6% | 0% | 0% | 0% |  |
| Zone3 d2 | 103 | 31 | 86 | 279 | 624 | 13.7 | 72% | 24% | 0% | 0% | 4% |  |
| Zone3 d3 | 114 | 43 | 166 | 660 | 10520 | 47.0 | 66% | 28% | 0% | 0% | 6% |  |
| Zone3 d4 | 84 | 55 | 341 | 2670 | 28087 | 141.7 | 46% | 40% | 1% | 0% | 14% |  |
| Zone3 d5 | 56 | 74 | 631 | 3914 | 18762 | 107.5 | 36% | 55% | 0% | 0% | 9% |  |
| Zone3 d6 | 46 | 91 | 1137 | 4514 | 18121 | 110.2 | 32% | 57% | 1% | 0% | 11% |  |
| Zone3 d7 | 30 | 113 | 2423 | 13985 | 20517 | 143.2 | 23% | 50% | 3% | 0% | 27% |  |

## By zone

| zone | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 | 309 | 46 | 118 | 793 | 41642 | 179.7 | 72% | 21% | 2% | 0% | 7% |  |
| Zone2 | 438 | 42 | 138 | 846 | 38052 | 258.0 | 57% | 35% | 0% | 0% | 9% |  |
| Zone3 | 478 | 53 | 208 | 2219 | 28087 | 566.2 | 57% | 35% | 1% | 0% | 9% |  |

## By difficulty (all zones)

| difficulty | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| d1 | 148 | 21 | 61 | 116 | 292 | 10.7 | 95% | 5% | 0% | 0% | 0% |  |
| d2 | 282 | 32 | 92 | 249 | 3181 | 42.7 | 72% | 24% | 1% | 0% | 4% |  |
| d3 | 310 | 40 | 144 | 500 | 10520 | 87.4 | 61% | 30% | 0% | 0% | 8% |  |
| d4 | 221 | 52 | 246 | 1341 | 38052 | 280.3 | 49% | 39% | 0% | 0% | 12% |  |
| d5 | 136 | 69 | 467 | 2616 | 18762 | 193.5 | 42% | 47% | 2% | 0% | 11% |  |
| d6 | 87 | 88 | 852 | 5159 | 41642 | 220.2 | 36% | 49% | 3% | 0% | 15% |  |
| d7 | 41 | 107 | 1958 | 11091 | 20517 | 169.0 | 25% | 50% | 4% | 0% | 25% |  |

## By mechanic (the game's category)

| category | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1 1-single-shape | 11 | 17 | 57 | 89 | 91 | 0.7 | 91% | 9% | 0% | 0% | 0% |  |
| Zone1 2-shape-bank | 11 | 33 | 63 | 100 | 216 | 0.9 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 3-gemini-delta | 8 | 26 | 74 | 187 | 188 | 0.8 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 4-slash-pack | 5 | 25 | 56 | 114 | 125 | 0.4 | 100% | 0% | 0% | 0% | 0% |  |
| Zone1 5-shape-bank | 31 | 63 | 95 | 257 | 364 | 4.1 | 97% | 3% | 0% | 0% | 0% |  |
| Zone1 6-gemini-delta | 33 | 40 | 148 | 562 | 3664 | 13.2 | 74% | 20% | 3% | 0% | 6% |  |
| Zone1 7-slash-pack | 36 | 48 | 119 | 356 | 41642 | 53.0 | 89% | 7% | 2% | 0% | 4% |  |
| Zone1 8-poly | 39 | 42 | 83 | 150 | 855 | 4.4 | 87% | 13% | 0% | 0% | 0% |  |
| Zone1 9-region-size-x | 44 | 44 | 115 | 978 | 7759 | 31.5 | 48% | 39% | 6% | 0% | 13% |  |
| Zone1 10-same-shape-no-touch | 41 | 45 | 201 | 1110 | 5154 | 24.8 | 47% | 38% | 4% | 0% | 15% |  |
| Zone1 11-mixed-rules | 50 | 60 | 377 | 1776 | 14425 | 45.8 | 54% | 31% | 0% | 0% | 15% |  |
| Zone2 1-area-numbers | 43 | 43 | 132 | 1262 | 7361 | 24.5 | 58% | 36% | 0% | 0% | 5% |  |
| Zone2 2-palisade | 60 | 41 | 100 | 297 | 1122 | 8.9 | 81% | 18% | 0% | 0% | 1% |  |
| Zone2 3-all-regions-same | 28 | 41 | 225 | 986 | 2013 | 11.9 | 18% | 43% | 0% | 0% | 39% |  |
| Zone2 4-all-regions-different | 48 | 33 | 157 | 474 | 3945 | 14.3 | 72% | 23% | 1% | 0% | 5% |  |
| Zone2 5-minmax | 46 | 41 | 146 | 668 | 16928 | 29.5 | 56% | 33% | 0% | 0% | 11% |  |
| Zone2 6-same-size-no-touch | 45 | 43 | 113 | 841 | 21484 | 38.5 | 59% | 33% | 0% | 0% | 9% |  |
| Zone2 7-1SPR | 37 | 43 | 147 | 1055 | 2843 | 15.1 | 47% | 45% | 0% | 0% | 8% |  |
| Zone2 8-all-rectangles | 40 | 46 | 156 | 677 | 6878 | 26.1 | 78% | 19% | 0% | 0% | 3% |  |
| Zone2 9-no-rectangles | 43 | 38 | 178 | 804 | 9651 | 23.9 | 27% | 65% | 0% | 0% | 8% |  |
| Zone2 10-zone2-mixed | 48 | 48 | 186 | 1123 | 38052 | 65.4 | 49% | 41% | 0% | 0% | 10% |  |
| Zone3 1-tatami | 70 | 44 | 116 | 440 | 3009 | 20.4 | 58% | 33% | 1% | 0% | 8% |  |
| Zone3 2-loopy | 58 | 61 | 137 | 776 | 9834 | 26.3 | 61% | 34% | 0% | 0% | 5% |  |
| Zone3 3-vertex-radar | 59 | 44 | 165 | 1061 | 10520 | 38.2 | 47% | 47% | 1% | 0% | 6% |  |
| Zone3 4-difference | 53 | 38 | 187 | 936 | 18121 | 44.2 | 45% | 35% | 0% | 0% | 19% |  |
| Zone3 5-inequality | 56 | 39 | 149 | 785 | 2953 | 21.4 | 52% | 41% | 1% | 0% | 6% |  |
| Zone3 6-compass | 34 | 29 | 68 | 190 | 18762 | 26.0 | 95% | 5% | 0% | 0% | 0% |  |
| Zone3 6-compass-main | 66 | 56 | 618 | 5522 | 26956 | 156.0 | 76% | 16% | 0% | 0% | 8% |  |
| Zone3 7-finalboss | 1 | 176 | 2157 | 2157 | 2157 | 2.2 | 51% | 49% | 0% | 0% | 0% |  |
| Zone3 7-zone3-mixed | 47 | 64 | 471 | 2836 | 28087 | 105.1 | 43% | 49% | 0% | 0% | 8% |  |
| Zone3 8-endgame | 34 | 113 | 1868 | 11770 | 20517 | 126.4 | 33% | 47% | 3% | 0% | 20% |  |

## By feature tag (a puzzle counts once per tag it has)

| feature | puzzles | avg tiles | median ms | p90 ms | max ms | total s | instant | probe | scan | of which proved by the search itself | left | not UNIQUE |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| area | 219 | 47 | 148 | 2004 | 26956 | 238.3 | 50% | 42% | 0% | 0% | 8% |  |
| bank | 235 | 49 | 119 | 802 | 5436 | 81.1 | 81% | 14% | 2% | 0% | 5% |  |
| compass | 128 | 52 | 433 | 4672 | 28087 | 260.9 | 77% | 18% | 0% | 0% | 6% |  |
| palisade | 169 | 51 | 136 | 706 | 38052 | 111.0 | 62% | 34% | 0% | 0% | 3% |  |
| rose | 179 | 56 | 288 | 2024 | 41642 | 202.1 | 60% | 28% | 1% | 0% | 12% |  |
| stamp | 171 | 53 | 153 | 1325 | 14425 | 109.8 | 58% | 33% | 0% | 0% | 9% |  |
| wall-delta | 98 | 49 | 237 | 1843 | 9651 | 80.9 | 62% | 26% | 4% | 0% | 12% |  |
| wall-diff | 69 | 46 | 218 | 1136 | 18121 | 54.4 | 41% | 44% | 0% | 0% | 16% |  |
| wall-gemini | 116 | 49 | 294 | 2066 | 20517 | 130.8 | 55% | 29% | 3% | 0% | 16% |  |
| wall-gt | 67 | 46 | 221 | 1346 | 22554 | 51.0 | 45% | 49% | 1% | 0% | 6% |  |
| wall-lt | 64 | 46 | 208 | 1246 | 22554 | 48.8 | 50% | 44% | 1% | 0% | 6% |  |
| wall-plain | 387 | 47 | 145 | 1192 | 41642 | 370.6 | 57% | 32% | 1% | 0% | 11% |  |
| watchtower | 85 | 55 | 229 | 2591 | 22554 | 103.3 | 45% | 46% | 2% | 0% | 9% |  |

## The 30 slowest puzzles

| id | category | diff | size | tiles | total s | ctx / instant / probe / scan / final (s) | instant | probe | scan | left | tests | verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Zone1/1434 | 7-slash-pack | 6 | 15x15 | 172 | 41.6 | 0.02 / 0.21 / 6.17 / 0.00 / 35.2 | 17% | 35% | 0% | 48% | 0 | UNIQUE |
| Zone2/0864b | 10-zone2-mixed | 4 | 10x10 | 72 | 38.1 | 0.00 / 2.86 / 0.52 / 0.00 / 34.6 | 13% | 11% | 0% | 76% | 60 | UNIQUE |
| Zone3/1110 | 7-zone3-mixed | 4 | 9x9 | 81 | 28.1 | 0.05 / 2.19 / 7.36 / 0.00 / 18.5 | 28% | 2% | 9% | 70% | 0 | UNIQUE |
| Zone3/0373 | 6-compass-main | 4 | 6x6 | 36 | 27.0 | 0.01 / 2.27 / 0.92 / 0.00 / 23.7 | 2% | 0% | 4% | 98% | 0 | UNIQUE |
| Zone3/1137 | 7-zone3-mixed | 4 | 11x9 | 99 | 22.6 | 0.01 / 0.09 / 2.36 / 0.00 / 20.1 | 27% | 2% | 0% | 71% | 0 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 7x7 | 49 | 21.5 | 0.01 / 0.02 / 0.11 / 0.00 / 21.3 | 0% | 0% | 0% | 100% | 0 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 10x10 | 100 | 20.5 | 0.00 / 0.12 / 1.45 / 0.00 / 18.9 | 0% | 0% | 0% | 100% | 60 | UNIQUE |
| Zone3/1395b | 6-compass | 5 | 14x16 | 138 | 18.8 | 0.21 / 1.01 / 17.5 / 0.00 / 0.02 | 7% | 93% | 0% | 0% | 0 | UNIQUE |
| Zone3/0928 | 4-difference | 6 | 9x7 | 63 | 18.1 | 0.00 / 4.71 / 3.25 / 0.00 / 10.1 | 20% | 2% | 0% | 78% | 60 | UNIQUE |
| Zone3/0631 | 7-zone3-mixed | 5 | 12x12 | 117 | 17.9 | 0.07 / 1.68 / 16.1 / 0.00 / 0.03 | 20% | 80% | 0% | 0% | 0 | UNIQUE |
| Zone2/1346 | 5-minmax | 4 | 6x6 | 36 | 16.9 | 0.00 / 0.02 / 0.07 / 0.00 / 16.8 | 2% | 0% | 0% | 98% | 60 | UNIQUE |
| Zone3/1258 | 6-compass-main | 7 | 13x13 | 169 | 16.4 | 0.07 / 1.32 / 15.0 / 0.00 / 0.03 | 19% | 81% | 0% | 0% | 0 | UNIQUE |
| Zone3/0312 | 6-compass-main | 6 | 7x7 | 49 | 16.3 | 0.01 / 0.31 / 3.37 / 0.00 / 12.6 | 20% | 4% | 0% | 76% | 0 | UNIQUE |
| Zone3/1086 | 6-compass-main | 5 | 7x7 | 49 | 15.6 | 0.00 / 3.65 / 10.9 / 0.00 / 1.01 | 7% | 2% | 0% | 90% | 0 | UNIQUE |
| Zone3/0208 | 8-endgame | 7 | 13x14 | 90 | 15.6 | 0.02 / 0.25 / 5.37 / 0.00 / 9.92 | 0% | 1% | 0% | 99% | 60 | UNIQUE |
| Zone1/1100 | 11-mixed-rules | 5 | 13x13 | 96 | 14.4 | 0.01 / 0.10 / 6.00 / 0.00 / 8.29 | 20% | 7% | 0% | 74% | 0 | UNIQUE |
| Zone3/1138 | 8-endgame | 7 | 11x11 | 121 | 13.8 | 0.00 / 0.08 / 5.22 / 0.00 / 8.49 | 2% | 0% | 98% | 98% | 0 | UNIQUE |
| Zone3/1085a | 8-endgame | 6 | 12x12 | 144 | 13.0 | 0.02 / 0.13 / 10.8 / 0.00 / 1.98 | 3% | 58% | 0% | 38% | 0 | UNIQUE |
| Zone3/0930d-real | 4-difference | 7 | 13x13 | 91 | 11.1 | 0.04 / 0.09 / 0.55 / 0.00 / 10.4 | 10% | 0% | 0% | 90% | 60 | UNIQUE |
| Zone3/0999 | 3-vertex-radar | 3 | 14x14 | 196 | 10.5 | 0.03 / 0.13 / 1.52 / 0.00 / 8.81 | 55% | 0% | 45% | 45% | 0 | UNIQUE |
| Zone2/1114 | 10-zone2-mixed | 7 | 10x9 | 86 | 10.2 | 0.01 / 0.20 / 9.25 / 0.00 / 0.69 | 27% | 40% | 0% | 33% | 0 | UNIQUE |
| Zone3/0970 | 2-loopy | 4 | 16x13 | 115 | 9.83 | 0.00 / 0.06 / 0.79 / 0.00 / 8.96 | 19% | 2% | 0% | 79% | 61 | UNIQUE |
| Zone3/1080 | 6-compass-main | 7 | 10x10 | 100 | 9.81 | 0.03 / 0.44 / 9.30 / 0.00 / 0.02 | 11% | 89% | 0% | 0% | 0 | UNIQUE |
| Zone2/0850 | 9-no-rectangles | 6 | 7x7 | 49 | 9.65 | 0.01 / 0.04 / 0.69 / 0.00 / 8.89 | 0% | 25% | 0% | 75% | 60 | UNIQUE |
| Zone3/1322 | 8-endgame | 6 | 12x12 | 97 | 8.95 | 0.00 / 0.03 / 4.04 / 0.00 / 4.85 | 1% | 10% | 0% | 89% | 0 | UNIQUE |
| Zone1/0246 | 9-region-size-x | 5 | 10x6 | 60 | 7.76 | 0.00 / 0.11 / 0.29 / 0.00 / 7.34 | 2% | 0% | 98% | 98% | 51 | UNIQUE |
| Zone1/0116 | 9-region-size-x | 6 | 9x9 | 81 | 7.70 | 0.00 / 0.06 / 0.47 / 0.00 / 7.14 | 2% | 20% | 78% | 78% | 49 | UNIQUE |
| Zone2/0745 | 1-area-numbers | 6 | 11x11 | 121 | 7.36 | 0.04 / 0.05 / 5.33 / 0.00 / 1.93 | 7% | 11% | 0% | 81% | 0 | UNIQUE |
| Zone2/1195 | 8-all-rectangles | 4 | 8x7 | 47 | 6.88 | 0.01 / 0.07 / 5.57 / 0.00 / 1.20 | 0% | 3% | 0% | 97% | 0 | UNIQUE |
| Zone2/0832 | 8-all-rectangles | 5 | 8x7 | 56 | 6.81 | 0.01 / 0.19 / 6.58 / 0.00 / 0.01 | 13% | 87% | 0% | 0% | 0 | UNIQUE |

## Outliers: much slower per tile than their peers (same category and difficulty; at least 0.3 s, at least 4x the peer median)

| id | category | diff | tiles | total s | ms per tile | peer median ms per tile | x peers | left |
|---|---|---|---|---|---|---|---|---|
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 21.5 | 438.4 | 3.1 | 142 | 100% |
| Zone2/0864b | 10-zone2-mixed | 4 | 72 | 38.1 | 528.5 | 5.2 | 101.8 | 76% |
| Zone1/1434 | 7-slash-pack | 6 | 172 | 41.6 | 242.1 | 3 | 79.6 | 48% |
| Zone2/1346 | 5-minmax | 4 | 36 | 16.9 | 470.2 | 7.7 | 60.8 | 98% |
| Zone3/0928 | 4-difference | 6 | 63 | 18.1 | 287.6 | 5.6 | 51.7 | 78% |
| Zone3/1110 | 7-zone3-mixed | 4 | 81 | 28.1 | 346.8 | 6.9 | 49.9 | 70% |
| Zone3/0373 | 6-compass-main | 4 | 36 | 27.0 | 748.8 | 16.7 | 44.9 | 98% |
| Zone2/0850 | 9-no-rectangles | 6 | 49 | 9.65 | 197 | 4.9 | 40.4 | 75% |
| Zone2/1352 | 6-same-size-no-touch | 5 | 40 | 4.53 | 113.2 | 3.2 | 35.9 | 94% |
| Zone3/1137 | 7-zone3-mixed | 4 | 99 | 22.6 | 227.8 | 6.9 | 32.8 | 71% |
| Zone3/0970 | 2-loopy | 4 | 115 | 9.83 | 85.5 | 2.7 | 31.8 | 79% |
| Zone1/0116 | 9-region-size-x | 6 | 81 | 7.70 | 95 | 3.2 | 30 | 78% |
| Zone3/1395b | 6-compass | 5 | 138 | 18.8 | 136 | 4.5 | 29.9 | 0% |
| Zone2/0832 | 8-all-rectangles | 5 | 56 | 6.81 | 121.7 | 4.1 | 29.6 | 0% |
| Zone2/1114 | 10-zone2-mixed | 7 | 86 | 10.2 | 118.3 | 4.3 | 27.5 | 33% |
| Zone3/0312 | 6-compass-main | 6 | 49 | 16.3 | 332.4 | 12.2 | 27.2 | 76% |
| Zone1/0030 | 9-region-size-x | 6 | 60 | 4.80 | 80 | 3.2 | 25.2 | 96% |
| Zone3/1086 | 6-compass-main | 5 | 49 | 15.6 | 318 | 13.3 | 23.9 | 90% |
| Zone3/0930d-real | 4-difference | 7 | 91 | 11.1 | 121.9 | 5.6 | 21.9 | 90% |
| Zone1/1236 | 7-slash-pack | 5 | 90 | 5.44 | 60.4 | 3 | 19.9 | 84% |
| Zone3/1260 | 6-compass-main | 3 | 49 | 6.23 | 127.2 | 6.9 | 18.5 | 75% |
| Zone2/1195 | 8-all-rectangles | 4 | 47 | 6.88 | 146.3 | 8.3 | 17.7 | 97% |
| Zone2/0745 | 1-area-numbers | 6 | 121 | 7.36 | 60.8 | 3.6 | 17 | 81% |
| Zone2/0010 | 8-all-rectangles | 4 | 36 | 4.10 | 113.9 | 8.3 | 13.8 | 0% |
| Zone3/0994 | 3-vertex-radar | 4 | 77 | 6.68 | 86.7 | 6.8 | 12.8 | 73% |
| Zone3/0999 | 3-vertex-radar | 3 | 196 | 10.5 | 53.7 | 4.4 | 12.2 | 45% |
| Zone1/1439 | 10-same-shape-no-touch | 2 | 60 | 3.18 | 53 | 4.4 | 12 | 64% |
| Zone2/0349 | 4-all-regions-different | 7 | 60 | 3.95 | 65.8 | 5.6 | 11.8 | 57% |
| Zone3/0631 | 7-zone3-mixed | 5 | 117 | 17.9 | 152.6 | 13.5 | 11.3 | 0% |
| Zone3/1003 | 3-vertex-radar | 6 | 100 | 5.17 | 51.7 | 4.6 | 11.2 | 0% |

## The 20 puzzles with the largest share of edges left to the final solver

| id | category | diff | tiles | spots | left | left % | total s | final s | verdict |
|---|---|---|---|---|---|---|---|---|---|
| Zone1/0099 | 6-gemini-delta | 2 | 50 | 73 | 73 | 100% | 2.85 | 2.29 | UNIQUE |
| Zone1/0276 | 10-same-shape-no-touch | 3 | 16 | 13 | 13 | 100% | 0.13 | 0.04 | UNIQUE |
| Zone1/1065 | 10-same-shape-no-touch | 3 | 25 | 40 | 40 | 100% | 0.20 | 0.08 | UNIQUE |
| Zone1/0130 | 9-region-size-x | 4 | 36 | 46 | 46 | 100% | 0.65 | 0.40 | UNIQUE |
| Zone1/0528 | 6-gemini-delta | 4 | 54 | 72 | 72 | 100% | 1.34 | 0.81 | UNIQUE |
| Zone2/1177 | 3-all-regions-same | 2 | 18 | 27 | 27 | 100% | 0.11 | 0.04 | UNIQUE |
| Zone2/0372 | 3-all-regions-same | 3 | 18 | 22 | 22 | 100% | 0.12 | 0.04 | UNIQUE |
| Zone2/1120 | 10-zone2-mixed | 3 | 18 | 23 | 23 | 100% | 0.24 | 0.12 | UNIQUE |
| Zone2/1345 | 5-minmax | 3 | 25 | 34 | 34 | 100% | 0.31 | 0.25 | UNIQUE |
| Zone2/1348 | 5-minmax | 4 | 25 | 37 | 37 | 100% | 0.84 | 0.68 | UNIQUE |
| Zone2/1351 | 5-minmax | 4 | 35 | 54 | 54 | 100% | 1.71 | 1.60 | UNIQUE |
| Zone2/1356 | 6-same-size-no-touch | 4 | 49 | 68 | 68 | 100% | 21.5 | 21.3 | UNIQUE |
| Zone2/1365 | 3-all-regions-same | 4 | 52 | 83 | 83 | 100% | 0.85 | 0.64 | UNIQUE |
| Zone3/0893 | 4-difference | 2 | 16 | 22 | 22 | 100% | 0.17 | 0.03 | UNIQUE |
| Zone3/0493 | 7-zone3-mixed | 3 | 64 | 108 | 108 | 100% | 3.20 | 2.49 | UNIQUE |
| Zone3/1385 | 4-difference | 3 | 26 | 25 | 25 | 100% | 0.16 | 0.07 | UNIQUE |
| Zone3/1401 | 4-difference | 3 | 20 | 27 | 27 | 100% | 0.20 | 0.11 | UNIQUE |
| Zone3/1039 | 4-difference | 4 | 20 | 26 | 26 | 100% | 0.19 | 0.11 | UNIQUE |
| Zone3/1248 | 8-endgame | 7 | 100 | 179 | 179 | 100% | 20.5 | 18.9 | UNIQUE |
| Zone2/0960 | 3-all-regions-same | 7 | 92 | 158 | 157 | 99% | 1.25 | 0.13 | UNIQUE |

## Decided without any search: 1082 of 1225 puzzles (every edge by instant propagation or look-ahead; scan tests = 0, left = 0)

## Which rules decided the edges (all puzzles, edges per phase; `search` = proved by a narrow search)

| rule | instant | probe | scan |
|---|---|---|---|
| bank-place | 8409 | 918 | 330 |
| label | 3819 | 3611 | 172 |
| basic | 3143 | 3466 | 86 |
| stamp-place | 3521 | 1962 | 0 |
| size | 2134 | 2128 | 42 |
| size-cut | 2142 | 1621 | 73 |
| bridge-count | 2056 | 1359 | 9 |
| grow | 1529 | 1148 | 5 |
| boxy-place | 2141 | 501 | 0 |
| loo-outline | 1772 | 39 | 0 |
| compass | 1324 | 422 | 2 |
| pal-link | 1269 | 420 | 0 |
| euler-count | 940 | 659 | 35 |
| mismatch-hall | 1346 | 108 | 47 |
| gemini-place | 828 | 484 | 110 |
| reach | 675 | 653 | 24 |
| tower-link | 934 | 281 | 41 |
| pal-wall | 640 | 404 | 0 |
| colour-count | 456 | 506 | 58 |
| mingle-area-place | 405 | 605 | 0 |
| size-range | 399 | 578 | 3 |
| rose-cut | 775 | 184 | 0 |
| tower-wall | 508 | 398 | 53 |
| area-rel | 277 | 441 | 0 |
| loo-color | 289 | 415 | 0 |
| range-region | 144 | 479 | 2 |
| cmp-box | 602 | 0 | 0 |
| bank-fit | 457 | 130 | 7 |
| stamp-size | 309 | 271 | 0 |
| rose-pair | 338 | 208 | 0 |
| loo-corner | 126 | 418 | 2 |
| area-sum | 292 | 225 | 10 |
| bri-three | 309 | 218 | 0 |
| mingle-area-merge | 292 | 233 | 0 |
| box-hall | 353 | 141 | 0 |
| min-reach | 285 | 179 | 0 |
| shape-fit | 169 | 269 | 0 |
| cmp-wrap | 335 | 66 | 0 |
| boxy-corner | 253 | 128 | 0 |
| rose-grow | 294 | 80 | 0 |

Files: the .jsonl has everything per puzzle (per-rule counts per phase, scan test counts, final-search progress, wrong-edge examples); the .csv is the flat version of the main numbers.
