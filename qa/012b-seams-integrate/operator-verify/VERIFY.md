# 012b operator verification (19 Nov 2026, America/Edmonton UTC-6)
- npm run check: exit 0. Production build: exit 0, 0 files mention motion-lab, home and work each 1 h1, noindex present.
- Playwright (port 4831): 42 passed, 0 failed, 18 skipped (base 38 + 4 new). PASS.
- Seam gate (lab build, port 4841): 10/10 PASS, worst SSIM 1.0000. Route tables (seam_route_check.py): 3/3 PASS.
- NEW real-route visual check (seam_route_visual.py, written by the operator): FAIL on all 3 wired pairs. Scrolling the real
  home page goes hero -> near-black screens for several viewports -> hero again -> filmstrip -> black -> red flood -> runway.
  Gold goes hero -> ink -> filmstrip with no black hold. Worst steps: 01A-02A 0.98 dark vs gold 0.45; 02A-03B 1.00 vs 0.04;
  04B-05C 1.00 vs 0.24. Sheets: sheet-<pair>.jpg here. Fix queued as prompt 012c.
- Working-tree hygiene: Playwright rewrote tracked qa/*.png|webm artifacts and deleted one tracked webm; restored with
  git restore (nothing deleted). No qa/**/build/ deletions this run.
