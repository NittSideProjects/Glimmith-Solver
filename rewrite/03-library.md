# Puzzle list, import and export

The puzzle list at the top of the Puzzle Grid panel, its buttons, the Fast import box, the import report and the messages an import or export can show.

Left here: 6 to write, 0 to check again, 6 notes, 0 to put on the page. Done: 110.

A copy of the answers on the rewrite page (see README.md): `- new:` empty = not done yet, `=` = keep the text as it is, `[..]` = a note for Claude.

### T0014
- what: text · #puzzlePanel
- now: Puzzle Grid
- new: =

### T0015
- what: text · #libraryBar
- now: Name
- new: =

### T0017
- what: text · #libraryBar
- now: Puzzle
- new: =

### T0019
- what: tooltip · #newPuzzleBtn · Tooltip: shows when you hover over it.
- now: Make a new empty puzzle
- new: Make a new empty puzzle

### T0020
- what: text · #newPuzzleBtn
- now: New puzzle
- new: =

### T0021
- what: tooltip · #importBtn · Tooltip: shows when you hover over it.
- now: Import puzzle files, either just one puzzle or multiple with a zip
- new: Import puzzle files, either just one puzzle or multiple with a zip

### T0022
- what: text · #importBtn
- now: Import puzzles…
- new: =

### T0023
- what: tooltip · #fastImportBtn · Tooltip: shows when you hover over it.
- now: Import every puzzle from the steam folder or the appdata one. Should be where most puzzles are kept for most people
- new: Import every puzzle from the steam folder or the appdata one. Should be where most puzzles are kept for most people

### T0024
- what: text · #fastImportBtn
- now: Fast import
- new: =

### T0025
- what: tooltip · #fastFoldersBtn · Button that only shows once Fast import has remembered a folder. Tooltip: shows when you hover over it.
- now: Choose or forget the folders Fast import reads
- new: =

### T0026
- what: text · #fastFoldersBtn · Button that only shows once Fast import has remembered a folder.
- now: Folders…
- new: [where]

### T0027
- what: tooltip · #exportBtn · Tooltip: shows when you hover over it.
- now: To save or send this puzzle, works with custom rules !
- new: To save or send this puzzle, works with custom rules !

### T0028
- what: text · #exportBtn
- now: Export puzzle
- new: =

### T0029
- what: tooltip · #exportAllBtn · Tooltip: shows when you hover over it.
- now: To save every puzzle, works with custom rules !
- new: To save every puzzle, works with custom rules !

### T0030
- what: text · #exportAllBtn
- now: Export all
- new: =

### T0031
- what: tooltip · #showFileSolutionBtn · Button that only shows for an imported puzzle with a stored solution. Tooltip: shows when you hover over it.
- now: Show at the bottom what solution was stored, THIS ISNT THE SOLVER.
- new: Show at the bottom what solution was stored, THIS ISNT THE SOLVER.

### T0032
- what: text · #showFileSolutionBtn · Button that only shows for an imported puzzle with a stored solution.
- now: File's solution
- new: =

### T0033
- what: tooltip · #deletePuzzleBtn · Tooltip: shows when you hover over it.
- now: Remove this puzzle from the list
- new: =

### T0034
- what: text · #deletePuzzleBtn
- now: Delete
- new: =

### T0035
- what: text · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: The puzzle you downloaded
- new: The puzzle you downloaded

### T0036
- what: text · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: C:\Program Files (x86)\Steam\steamapps\workshop\content
- new: =

### T0037
- what: text (keep the <b>/<i> tags or drop them) · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: open this : <code>4160210</code>
- new: open this : <code>4160210</code>

### T0038
- what: text · #fastPick_steam · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Choose folder…
- new: =

### T0039
- what: text · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: The puzzle you made
- new: The puzzle you made

### T0040
- what: text · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: %LOCALAPPDATA%\Geri\Saved
- new: =

### T0041
- what: text (keep the <b>/<i> tags or drop them) · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: open this : <code>workshop</code>
- new: open this : <code>workshop</code>

### T0042
- what: text · #fastImportBox · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Simply paste the path into the address bar of the folder window. Don't worry about duplicates, they are skipped by default
- new: Simply paste the path into the address bar of the folder window. Don't worry about duplicates, they are skipped by default

### T0890
- what: text · #fastBlockedLink · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Folder blocked?
- new: 

### T0891
- what: text (keep the <b>/<i> tags or drop them) · #fastBlocked · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: <b>Did your browser say it "can't open this folder because it contains system files"?</b> Chrome and Edge do not let a page remember folders inside Program Files or AppData, and both game folders are there. You can still read them once: the browser asks for the folder each time, and it may say it will upload the files, but they stay on your computer.
- new: 

### T0892
- what: text · #fastOnce_steam · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Read the workshop folder once
- new: 

### T0893
- what: text · #fastOnce_own · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Read your own puzzles once
- new: 

### T0894
- what: text · #fastBlocked · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: If that is blocked too: copy the folder somewhere else (for example into Documents) and choose the copy, or zip it and open the zip with Import puzzles…
- new: 

### T0043
- what: text · #fastRunBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Import now
- new: [where]

### T0044
- what: text · #fastForgetBtn · In the Fast import box, which opens the first time you click Fast import, or with Folders….
- now: Forget folders
- new: [where]

### T0045
- what: text · #importLogSummary · Under the puzzle list, after an import.
- now: Import report
- new: [where]

### T0421
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable compass at column {2}
- new: =

### T0422
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable polyomino at column {2}
- new: =

### T0423
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unreadable area number "{2}"
- new: =

### T0424
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown cell code "{2}"
- new: =

### T0425
- what: error message · importCellTokens · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unexpected text after the last cell ("{2}")
- new: =

### T0426
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: not a puzzle file (first line is not "VERSION 1")
- new: =

### T0427
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: shape {1} is empty
- new: =

### T0428
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: unknown header line "{1}" ignored
- new: =

### T0429
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: no PUZZLE section
- new: =

### T0430
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: no DIMENSIONS line
- new: =

### T0431
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: the file has AREA_EQUALS together with AT_LEAST / AT_MOST
- new: =

### T0432
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: the board has {1} lines, {2} expected
- new: =

### T0433
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown corner mark "{2}"
- new: =

### T0434
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown horizontal edge "{2}"
- new: =

### T0435
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: unknown vertical edge "{2}"
- new: =

### T0436
- what: error message · parsePuzzleFile · An error message, shown when something goes wrong (often in the import report).
- now: row {1}: polyomino S{2} is not defined by a SHAPE line
- new: =

### T0437
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: {1} edge mark(s) next to an empty tile ignored
- new: =

### T0438
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: watchtower at corner {1} touches no tile, ignored
- new: =

### T0439
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: SHAPE_BANK lists shape {1}, which is not defined
- new: =

### T0440
- what: message · parsePuzzleFile · Shown in the import report when a file can not be read as expected.
- now: SOLUTION section is cut short, ignored
- new: =

### T0441
- what: error message · str · An error message, shown when something goes wrong (often in the import report).
- now: bad metadata
- new: =

### T0442
- what: error message · bits · An error message, shown when something goes wrong (often in the import report).
- now: unexpected end of compressed data
- new: =

### T0443
- what: error message · decode · An error message, shown when something goes wrong (often in the import report).
- now: bad Huffman code
- new: =

### T0444
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad stored block
- new: =

### T0445
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad lengths
- new: =

### T0446
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad block type
- new: =

### T0447
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad length symbol
- new: =

### T0448
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: bad distance symbol
- new: =

### T0449
- what: error message · inflateRawJS · An error message, shown when something goes wrong (often in the import report).
- now: distance too far back
- new: =

### T0450
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: not a valid zip file (no end-of-archive record)
- new: =

### T0451
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: zip64 archives are not supported
- new: =

### T0452
- what: error message · readZip · An error message, shown when something goes wrong (often in the import report).
- now: damaged zip directory
- new: =

### T0453
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: {1} is encrypted
- new: =

### T0454
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: damaged zip entry {1}
- new: =

### T0455
- what: error message · readZip › getData · An error message, shown when something goes wrong (often in the import report).
- now: {1}: unsupported zip compression method {2}
- new: =

### T0456
- what: message · importExpand › message · Shown in the import report when a file can not be read as expected.
- now: zip files nested too deeply, skipped
- new: =

### T0457
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: Duplicate puzzle got skipped
- new: Duplicate puzzle got skipped

### T0458
- what: message · fallback · Shown in the import report when a file can not be read as expected.
- now: Imported puzzle
- new: =

### T0459
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: no readable puzzle found
- new: =

### T0460
- what: message · collectPuzzles › message · Shown in the import report when a file can not be read as expected.
- now: no puzzle files found (expected text files starting with "VERSION 1")
- new: =

### T0797
- what: message · FILE_SOLUTION_LABEL · Built by the page while it runs, so it only shows in some situations.
- now: The file's known solution
- new: The file's known solution

### T0798
- what: message · library › items.name · Built by the page while it runs, so it only shows in some situations.
- now: My puzzle
- new: =

### T0799
- what: message · STARTER_PUZZLES › name · Built by the page while it runs, so it only shows in some situations.
- now: Example Puzzle Unique
- new: Example Puzzle Unique

### T0800
- what: message · STARTER_PUZZLES › name · Built by the page while it runs, so it only shows in some situations.
- now: Example Puzzle Non Unique
- new: Example Puzzle Non Unique

### T0801
- what: message · switchPuzzle · Built by the page while it runs, so it only shows in some situations.
- now: Wait for the solver to finish (or cancel it) first
- new: =

### T0802
- what: message · item › name · Built by the page while it runs, so it only shows in some situations.
- now: Puzzle {1}
- new: =

### T0803
- what: message · newPuzzle · Built by the page while it runs, so it only shows in some situations.
- now: New empty puzzle: {1}
- new: =

### T0804
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: by {1}
- new: =

### T0805
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: id {1}
- new: =

### T0806
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: the file's solution is stored
- new: =

### T0807
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: no solution in the file
- new: =

### T0808
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: {1} import note{2}: {3}
- new: =

### T0809
- what: message · renderLibrary · Built by the page while it runs, so it only shows in some situations.
- now: Delete
- new: =

### T0815
- what: message · join · Built by the page while it runs, so it only shows in some situations.
- now: {1} and {2}
- new: =

### T0816
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: those custom rules
- new: =

### T0817
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: that custom rule
- new: =

### T0818
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: “{1}” says {2} in its description, so we assumed it uses {3} and turned {4} on.
- new: =

### T0819
- what: message · showAssumedRules · Built by the page while it runs, so it only shows in some situations.
- now: {1} puzzles name a custom rule in their description, so we assumed they use it and turned it on:
- new: [duplicatedwith0818?]

### T0820
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Reading…
- new: =

### T0821
- what: message · bits · Built by the page while it runs, so it only shows in some situations.
- now: {1} puzzle{2} imported
- new: =

### T0822
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: {1} already in the list
- new: =

### T0823
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: {1} problem{2}
- new: =

### T0824
- what: message · importFiles › text · Built by the page while it runs, so it only shows in some situations.
- now: {1}: {2} switched on (named in its description)
- new: =

### T0825
- what: message · importFiles › text · Built by the page while it runs, so it only shows in some situations.
- now: No problems.
- new: =

### T0826
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import report: {1}
- new: =

### T0827
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Imported {1} puzzles
- new: Imported {1} puzzles

### T0828
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Imported “{1}”
- new: =

### T0829
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Nothing new to import
- new: =

### T0830
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import failed
- new: =

### T0831
- what: message · importFiles · Built by the page while it runs, so it only shows in some situations.
- now: Import puzzles…
- new: =

### T0833
- what: message · fastRender · Built by the page while it runs, so it only shows in some situations.
- now: Choose each folder once. After that, Fast import reads both in one click (if your browser is compatible).
- new: Choose each folder once. After that, Fast import reads both in one click (if your browser is compatible).

### T0834
- what: message · fastRender · Built by the page while it runs, so it only shows in some situations.
- now: Choose your folder to import the puzzles. Your browser can't remember folders (Chrome and Edge can), so you will need to pick it each time.
- new: Choose your folder to import the puzzles. Your browser can't remember folders (Chrome and Edge can), so you will need to pick it each time.

### T0835
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: {1}: reading was not allowed
- new: =

### T0836
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: Fast import: nothing read
- new: =

### T0837
- what: message · fastRun · Built by the page while it runs, so it only shows in some situations.
- now: The folders hold no puzzle files.
- new: =

### T0838
- what: message · attachFastImport › text · Built by the page while it runs, so it only shows in some situations.
- now: The folder holds no puzzle files.
- new: [duplicatewithT0837]

### T0839
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: no puzzle in it
- new: =

### T0840
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: the grid size is not valid
- new: =

### T0841
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: the grid does not match its size
- new: =

### T1134
- what: message · normalizeState › error · Built by the page while it runs, so it only shows in some situations.
- now: a clue in it is not valid
- new: 

### T0843
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Nothing to export
- new: =

### T0844
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Exported “{1}”
- new: =

### T0845
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Exported {1} puzzles
- new: =

### T0846
- what: message · exportPuzzles · Built by the page while it runs, so it only shows in some situations.
- now: Export failed: {1}
- new: =

### T0847
- what: message · readOwnExport › message · Built by the page while it runs, so it only shows in some situations.
- now: this file was saved by a version of the editor not supported yet. Please verify the import went well
- new: this file was saved by a version of the editor not supported yet. Please verify the import went well

### T0848
- what: message · readOwnExport › message · Built by the page while it runs, so it only shows in some situations.
- now: the file holds no puzzles
- new: =

### T0849
- what: message · deleteActivePuzzle · Built by the page while it runs, so it only shows in some situations.
- now: Click again to delete
- new: =
