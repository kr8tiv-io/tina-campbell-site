# 013 operator verification (20 Nov 2026, America/Edmonton UTC-6)
- npm run check exit 0; production build exit 0 (20 pages); every page 1 h1 and noindex; 0 motion-lab refs in dist.
- Playwright: 42 passed, 0 failed, 18 skipped.
- Seam gate (lab build, port 4871): 10/10 PASS, worst SSIM 1.0000, 0 timing diffs. Route tables 3/3 PASS.
- Real-route visual desktop: 3/3 PASS (0.50/0.51, 0.26/0.23, 0.04/0.12). Mobile 390x844: 3/3 PASS (0.32/0.42, 0.62/0.66, 0.21/0.19).
- Scene gate 01A on the real route: PASS worst 0.9748 (frame 95), mean 0.9773, 0/145 bad.
- Hero element boxes measured at 1440x900 and 390x844: hero, media, still, video all full viewport.
- Visual review: the dark lower band in the hero is in the picked 01A clip itself (concept brief: "empty dark band in
  the lower third for the name"); faithful. Desktop title sits in the band. Phone layout leaves the band empty and the
  caption still says Alberta Legislature (hero is now fb_013 The Red Gown). Both carried into prompt 020.
- Hygiene: Playwright-rewritten qa artifacts restored; no deletions.
