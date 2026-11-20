# 012c operator verification (19 Nov 2026, America/Edmonton UTC-6)
- npm run check exit 0; production build exit 0; home and work 1 h1 each; 0 motion-lab refs in dist.
- Playwright (port 4861): 42 passed, 0 failed, 18 skipped.
- Seam gate (lab build, port 4871): 10/10 PASS, worst SSIM 1.0000, 0 timing diffs. Route tables 3/3 PASS.
- Real-route visual check desktop 1440x810: 3/3 PASS (01A-02A dark 0.14 vs gold 0.27; 02A-03B 0.26 vs 0.23; 04B-05C 0.04 vs 0.12).
- Real-route visual check mobile 390x844: 3/3 PASS (0.38/0.39, 0.62/0.66, 0.21/0.19).
- Visual review of the sheets: hero -> ink -> contact sheet, hero does not come back; contact sheet -> red flood -> runway;
  work grid -> loupe assemble. Sheets: desktop/sheet-*.jpg, mobile/sheet-*.jpg.
- Hygiene: Playwright rewrote tracked qa artifacts and deleted one tracked webm; restored with git restore. No deletions committed.
