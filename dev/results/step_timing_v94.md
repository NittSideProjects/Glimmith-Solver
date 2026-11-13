# Step timing, core v94 (V1.01)

Average time of one run of each propagation step, in the puzzles where it is active: 1,225 campaign puzzles + dev/user_puzzles, 5 s each,
2 jobs (tools: a copy of the core with a timer before every step). Used for the V1.02 order (fast < 30 us, medium 45-480 us, slow >= 550 us).

```
puzzles 1230 total propagation ms 367752                                                                  
step                                          puzzles       runs  mean us/run  median us   p90 us  share %
static checks                                    1209      12811         19.8        1.4      3.2      0.1
gemini-shape/delta-shape (pinned polyomino)      1207       8645          7.6        1.7      3.7      0.0
match-mismatch                                    679       1303         12.0        1.1      4.3      0.0
match-size/match-fit (shape list)                 539      28404         20.5        1.3     16.8      0.2
walls -> kept apart                              1230    1101517         12.8        4.9     26.4      3.8
euler-count                                      1189     280804          2.3        1.7      4.6      0.2
match-iso (isoStep)                               901       1887          6.9        1.1      4.3      0.0
match-iso (isoK)                                  716       1873         18.0        1.4      7.8      0.0
diff-clash                                        603      63331         25.6        1.3     15.2      0.4
gd-clash                                          588     105537          9.0        1.6     16.7      0.3
gemini-iso                                        490     154334         16.2        1.7     23.5      0.7
colour-count                                      973      63137          6.2        1.3      3.9      0.1
label                                             946      32012        549.5        4.2    362.8      4.8
rose-cover                                        782       8391        346.7        1.7    160.7      0.8
diff-small                                        699       1561       1434.9        1.4      6.4      0.6
rose-cut (static)                                 659      43271          8.9        1.4     17.8      0.1
match-hole                                        607      23392         14.8        1.2     12.5      0.1
cross                                            1229     323131          9.3        3.5     13.8      0.8
group sizes (pieceInfo)                          1230    1016504         17.7        9.5     45.4      4.9
match-size/match-fit (group ranges)              1035      26574          3.9        1.3      3.5      0.0
gemini-shape/delta-shape (finished twin)          969     127727         50.9        1.3     21.6      1.8
hetero-size                                       820       1970          6.2        1.1      3.8      0.0
minimum sizes                                     994     465291          7.0        2.7     11.7      0.9
basic edges                                      1229    1002752         25.8       11.7     71.2      7.0
mismatch-hall                                    1147      11276        724.4        1.4      3.9      2.2
bank-place                                        235       3987       2176.8      995.6   5610.0      2.4
size-cut                                         1209     106000          6.3        1.9      8.0      0.2
gemini-place                                     1050       7708        621.9        1.8     68.2      1.3
range-region/bank-region                          796     342672         19.2       12.5     32.8      1.8
bridge-count                                     1230     310934         15.3        8.3     24.2      1.3
grow (split group)                               1230     416717         10.4        7.4     21.8      1.2
split-cut                                        1230     411987         14.3        8.4     25.9      1.6
forced growth (grow/min-grow)                    1227     410443         11.3        4.5     16.1      1.3
reach/min-reach/cmp-budget                       1194     327199        105.1        8.3    137.8      9.4
Boxy / Non-boxy                                   135      49884        431.0      117.6   3406.8      5.8
area-count/area-region                            577      11289         45.8       14.4     77.7      0.1
mismatch-*                                        101      35008        245.0      292.4    904.7      2.3
area-sum                                          378     250994         30.5       17.5     89.8      2.1
Bricky                                             96      73159          5.7        4.3     43.6      0.1
stamp-place                                       172      91005         94.7       64.9    346.1      2.3
bank-block/bank-bend                              205       6965        123.4       22.6    459.1      0.2
size relations (area-rel ...)                     245     179185         79.9       94.4   1396.2      3.9
rose-region                                       266      87818          8.4        7.7     28.3      0.2
compass limits                                    130      34900       1448.7      703.5   2525.1     13.7
cmp-place                                         130        722      19287.7     1790.4  38680.8      3.8
cmp-crowd                                         130        572       9077.1     1679.0  38000.9      1.4
cmp-excl                                          130        562         15.7        7.5     78.2      0.0
watchtowers                                        86      92909         95.5       53.5    357.9      2.4
palisades / Wally                                 172      53177        114.4       76.2    881.6      1.7
Mingle / Size Separation                          187     269596         97.0      130.4    482.4      7.1
match-region                                       40       8141          9.7        5.2     78.2      0.0
match-place                                        40       1099        380.2       62.5    575.9      0.1
rose-cut (again)                                  113      13673        478.4      353.3    842.8      1.8
boxy-line/boxy-place (again)                        7        475       3832.3     1348.3   7134.1      0.5
Loopy                                              79      40251         11.8       14.7    100.9      0.1
area-place                                          2          3      37186.9    55583.8  55583.8      0.0
```
