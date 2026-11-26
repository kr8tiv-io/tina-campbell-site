# 017 operator-gate Playwright failures: fix notes (26 Nov, UTC-6)

## Diagnosis: flake from the box, not a 017 regression
- Try 2 (13:15-13:44): Chromium itself aborted mid-run ("D-Bus connection was disconnected. Aborting.", signal 6) during
  post-strip; the following tests then saw no WebGL (canWebGL() false), so runway fell to data-catwalk-ready="css",
  work never set html.work-gl, and the home 02A timeline wait timed out. laptop 1920x1080 failed "while setting up page" (60 s).
  None of the failures touch about/footer code; 017 adds no WebGL, only a lazy 10A footer video and the 09B about scrub.
- Box was heavily loaded (load avg 7-13 on 8 cores) with other agents' Chromium/previews running.
- Kept logs: try 2 Playwright /tmp/og-pw-017-try2.log, gate /tmp/gate-017-try2.txt.

## Changes
- None to product code, tests, gold frames or media.

## Re-runs on PLAYWRIGHT_PORT=4831
- Failing specs (runway, work, post-strip, home, laptop): 41 passed, 0 failed, 99 skipped (18.3 m), /tmp/fix017-pw-subset.log.
- Operator gate try 3 (operator-gate.sh, same args as supervisor): /tmp/sup-gate-017-scene-about-footer-09B-10A-3.log
  - check, build, pages PASS; playwright rc=0, 75 passed, 129 skipped, 0 failed (18.0 m); seams 10/10; route tables, visual desktop/mobile PASS.
  - scenes PASS: 01A 0.9774, 03B 0.9613, 04B 0.9531, 09B 0.9319, 10A 0.9526 (worst), bad=0/145 each.
  - GATE 017-scene-about-footer-09B-10A: PASS (finished about 4:00 PM UTC-6).

## Next
- Commit and push per supervisor practice, brain checkpoint, then the queue can resume at 018.
