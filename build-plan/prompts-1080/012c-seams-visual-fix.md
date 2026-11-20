---
id: 012c-seams-visual-fix
title: Real-route seams look like the gold prototypes (no black holds, hero never comes back)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [012b-seams-integrate]
---
## Why
012b (commit 7934edc) made tests green (42/0/18), seams 10/10 on the harness and route tables 3/3. But scrolling the REAL
home page now goes: hero -> several viewports of near-black -> the hero AGAIN with its title -> filmstrip -> black -> red
flood -> runway. Work ends in a black screen too. The gold prototypes go hero -> ink bleed -> filmstrip, with no black hold.
Evidence: `qa/012b-seams-integrate/operator-verify/` (VERIFY.md, sheet-01A-02A.jpg, sheet-02A-03B.jpg, sheet-04B-05C.jpg) and
the gold frames `build-plan-locked-2026-11-19/.gold/<pair>/p-000..p-100.jpg`.

## Must haves
1. For each wired pair (home 01A-02A, 02A-03B; work 04B-05C) the real route, scrolled through `[data-seam-pair]`, must show
   the same sequence as the gold frames: progress 0 = the real outgoing section fully visible as it rests, progress 1 = the
   real incoming section fully visible, and in between only the seam's effect (ink, flood, loupe) over/between those two
   real sections. The outgoing section must not reappear after the seam. No empty or black stage at any step.
2. Pin length per seam = the gold pin (ratio 2.2 viewports, scrub 0.6, anticipatePin 1). Do not add extra spacer scroll
   beyond the pin plus the real sections' own height.
3. Keep everything 012b fixed: one h1 per page, no horizontal overflow, no `/motion-lab/` URLs in production, tables equal
   to gold, harness pages untouched.
4. Reduced motion: no pin, sections stacked, no seam layers.

## Verification (paste into qa/012c-seams-visual-fix/REPORT.md)
```
cd site && npm run check && npm run build && npx playwright test      # expect 42 passed, 0 failed, 18 skipped
TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/012c-seams-visual-fix/seam-gate     # 10/10
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821                                       # 3/3
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/012c-seams-visual-fix/route-visual   # 3/3
```
Open the three `sheet-<pair>.jpg` files yourself and compare them with the gold frames before you claim PASS. Do not edit
seam_route_visual.py, seam_gate.py, seam_route_check.py, the gold or the existing tests.

## Non-goals
Scene videos (013+), other seam pairs.

## Commit message
fix(seams): real-route seams follow the gold sequence with no black holds

Final line: `GATE 012c: PASS|FAIL`, `TESTS: p/f/s`, `SEAMS: n/10`, `ROUTE-VISUAL: n/3`.
