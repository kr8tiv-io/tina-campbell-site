---
id: 012b-seams-integrate
title: Seams become the transition between the real scene sections (fix 17 test regressions from 012)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [012-seams-port]
---
## Why
012 (commit f8c152b) ported all 10 seams and the harness pages PASS the seam gate (SSIM 1.0). But on real routes
`Seam.astro` drops whole prototype sections into the page: home has 5 h1s, work has 3, there is horizontal overflow, and the
01A-02A seam video points at `/motion-lab/media/...` which the production build deletes. Playwright: 17 failed / 21 passed /
18 skipped, versus 38 passed / 0 failed on base `ca39b72`. Evidence: `qa/012-seams/VERIFY-2026-11-19.md`.

## Decision (binding)
Seams live INSIDE the real scene sections as the transition between two adjacent real sections. No extra prototype sections
on real routes, exactly one h1 per page, no horizontal overflow, and every media file a real route needs comes from a
production path (`site/public/media/seams/...`), never `/motion-lab/`.

## Must haves
1. `seams.ts`: keep the per-pair timeline builders byte-for-byte in timing (same tweens, eases, staggers, from/to, pin config).
   Add a real-route mount: `initSeams` finds `[data-seam-pair="<pair>"]` wrappers that contain the REAL outgoing section
   (`[data-seam-out]`) and the REAL incoming section (`[data-seam-in]`) and builds the same timeline against them. Helper
   layers the prototype needs (masks, ink, flood, iris) are created as `aria-hidden="true"` decorative elements inside the
   wrapper, never headings or copy.
2. Harness pages `/motion-lab/seams/<id>/` stay exactly as they are (they are the gate truth path) and still only build with
   `TC_MOTION_LAB=1`.
3. Real routes: home wires 01A-02A (hero -> category band) and 02A-03B (category band -> runway); work wires 04B-05C. Remove
   the injected `<Seam id=...>` prototype blocks from `index.astro` and `work/index.astro` (that removal is the fix, not a
   feature deletion). Keep every original section, heading and link.
4. Media: copy only what the real routes reference to `site/public/media/seams/<pair>/` and point to it.
5. In `?record=1` mode expose `window.__SEAM_TABLES__[<pair>]` on real routes using the same TABLE extraction as
   `seam_gate.py`, and add a check script `build-plan-locked-2026-11-19/tools/seam_route_check.py` (new file; do not edit
   seam_gate.py) that compares each real-route table with the gold `table.json` in `build-plan-locked-2026-11-19/.gold/<pair>/`
   (tweens, starts, durations, eases; target names may differ). It must PASS for the 3 wired pairs.
6. Tests: all base tests pass again (38 passed, 0 failed; skipped count unchanged). Do NOT edit or skip existing tests to make
   them pass. You may add tests (one h1 per route, no horizontal overflow, no `/motion-lab/` URL in production HTML).

## Verification (paste outputs into qa/012b-seams-integrate/REPORT.md)
```
cd site && npm run check && npm run build && grep -rl "motion-lab" dist && echo "LEAK" || echo "no motion-lab refs in dist"
npx playwright test            # expect 38+ passed, 0 failed
TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/012b-seams-integrate/seam-gate   # 10/10
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
```
Screenshots desktop 1440x900 and mobile 390x844 of / and /work/ at the three seams (before, middle, after) into
`qa/012b-seams-integrate/shots/`.

## Non-goals
Scene videos (prompt 013 onwards), new seams on other routes (log in OPEN-QUESTIONS), refactoring older modules' gsap imports.

## Commit message
fix(seams): run seams between the real sections; one h1, no overflow, production media paths (38 tests green)

Final line of your answer: `GATE 012b: PASS|FAIL`, then `TESTS: <passed>/<failed>/<skipped>` and `SEAMS: <n>/10`.
