# 030 phone strip labels vs the iOS toolbar: REPORT (operator, 26 Nov 2026 ~1:20 AM UTC-6)

Grok Build (grok-4.7 xhigh, KR8TIV) made the change; its own run ended rc=1 when its 600 s background-wait cap stopped the
full Playwright suite before it wrote this report. The operator gate below was run afterwards on the same tree.

## Change
- Phone (< 760 px) held 02A sheet uses `100svh` (100vh fallback); desktop and laptop rules untouched.
- Phone label y is measured from the on-screen sheet and `visualViewport`, kept in the band 0.18..0.70 of the visible height
  and at least 140 px above its bottom; re-placed on `visualViewport` resize while held.
- Phone labels 13 px / 12 px mono on a dark plate (rgba(12,12,15,0.86)); kept inside the screen edges.
- Book bar hides while the strip is held on phone. Echo labels on phone keep the live placement (no stacking).
- New `site/tests/phone-toolbar.spec.ts` (5 cases: 393x852 with a 120 px simulated toolbar, 393x659, 390x844, echo x, svh +
  shorter visualViewport).

## Operator gate (operator-verify/gate.txt): PASS
check PASS; build PASS; pages PASS (1 h1, noindex, no lab); Playwright 75 passed / 0 failed / 129 skipped (project skips)
incl. phone-toolbar 5/5, laptop.spec 1536x720@1.25, 1536x690, 1520x634, 1366x657, 1440x760, 1920x1080, 390x844, post-strip,
home-lock; seams 10/10; route tables PASS; visual desktop PASS; visual mobile PASS; scenes 01A 0.9774, 03B 0.9613, 04B 0.9531.
(The first gate run was void: Playwright reused another project's preview on :4321. Gate now pins PLAYWRIGHT_PORT=4831.)

## Label position (held strip, operator probe; shots/operator/)
| Viewport | Before (staging b35fe3f) | After |
| --- | --- | --- |
| iPhone 16 393x852 + 120 px toolbar | y 693..740, 112-124 px from bottom (under the toolbar at Landscape) | y 549..596, 256 px clear |
| 393x659 (Chrome iOS visible area) | y 539..578, 81-85 px from bottom | y 414..461, 198 px clear |
| 390x844 | y 646..712 | y 544..591, 253 px clear |

Laptop/desktop: 1536x720@1.25 Bridal frame 0.21 % px differ vs staging; 1920x1080 Bridal 4.2 % from scrub-smoothing timing
only (side by side identical composition). Landscape frames differ by catch-up timing at the hold end, not layout.
laptop.spec (029 gates) passes unchanged.

## Matt's question: "mobile only scrolls three panels"
Locked spec: 02A desktop shows a 5-to-7 frame barrel; the approved phone pass (022b) requires "3 frames fully or mostly in
view (centre plus neighbours)" and the scrub must still move one frame per step. Measured on phone: about 1.8 frames are on
screen at once, and the scrub DOES advance through all 7 categories (Signature, Runway, Portraits, Bridal, Couples, Edmonton,
Landscape) between scrollY ~1900 and ~2740 at 390x844, after ~1.4 screens of static lead. So three-at-a-time is by design,
but the whole 7-step advance happens inside less than one phone screen of scroll, which can read as "only three". Not
changed; a slower phone scrub (longer pin) is Matt's call.

GATE 030-phone-strip-labels-toolbar: PASS
