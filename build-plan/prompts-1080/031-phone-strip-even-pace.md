---
id: 031-phone-strip-even-pace
title: Phone 02A film strip - longer pinned scroll, all seven categories advance evenly (no still lead, no rush)
kind: fix
effort: xhigh
model: grok-4.7
depends_on: [030-phone-strip-labels-toolbar]
---
## Why
Matt (26 Nov 8:15 AM UTC-6): "slow the phone film strip so each category gets more scroll". Keep the locked 022b phone
design (about three frames visible, centre large, tilt -5, curve, sprockets, labels from 030), but stretch the pinned scroll
so Signature, Runway, Portraits, Bridal, Couples, Edmonton and Landscape each get the same share. It must not hold still and
then rush through.

Operator measurement on 991b24e at 390x844 (DPR 3, isMobile): the strip reaches the screen at scrollY ~700, sits still on
Signature for ~1200 px (~1.4 screens) until the hold starts at ~1900, then all six steps happen between ~1900 and ~2740
(~140 px per step, under one screen in total), then it holds on Landscape ~2740 to ~3640 before the echo and flood.
Phone scrub spacer is `.sheet-scrub { height: 110vh }` (home.css, max-width 759px) with the ScrollTrigger end `+=110%`.

## Change (phone, < 760 px wide, only)
- Pinned scrub distance on phone: about 0.55 x visible height per category step (6 steps, so about 330svh total of scrub;
  pick the exact value so the numbers below pass). Steps evenly spaced; snap still lands on whole frames.
- Remove the dead lead: once the strip is fully in view and held, the first step starts within 0.35 x visible height of scroll.
- Final hold on Landscape before the 02A-03B hand-off at most 0.6 x visible height. The 029 hold-until-echo-pins, the flood
  wipe, the 030 svh hold and label placement stay exactly as they are (re-measure, do not rewrite them).
- Reduced motion: unchanged behaviour (no pin, no scrub, no extra scroll length; the static strip or CSS stand-in as now).
- Do NOT change: desktop/laptop (>= 760 px) scrub length, mapping, snap, geometry; PHONE.visible, segments, tilt, curve,
  frame count; any MOTION-LOCKED timeline value; the hero; other sections.

## Verification (PASS or FAIL only; any FAIL blocks)
BEFORE editing, write `qa/031-phone-strip-even-pace/before.json`: at 390x844 and 393x852, scrollY -> centred category every
40 px through the section, plus the scroll distance of each of the 6 steps, the still lead and the final hold.
1. New `site/tests/phone-pace.spec.ts` (fails on 991b24e, passes after), real wheel/touch-like scrolling through Lenis at
   390x844 and 393x852 DPR 3 isMobile:
   a. All seven categories become the centred frame, in order, forward; and in reverse order scrolling back.
   b. Each step's scroll distance >= 0.45 x innerHeight, and every step within +-15 percent of the mean step.
   c. Still lead (held, before the first step) <= 0.35 x innerHeight; final hold before the 02A-03B pin <= 0.6 x innerHeight.
   d. Reduced motion (390x844): no `.sheet-scrub` height, no pin, page height within 2 percent of 991b24e reduced-motion height.
2. Desktop unchanged: at 1440x900, 1536x720 @1.25 and 1920x1080 the scrollY of each category step equals 991b24e within 2 px
   (write the table), and record frames at 02A progress 0, 0.5, 1 differ < 1 percent from `before/`.
3. Unchanged and passing: `phone-toolbar.spec.ts`, `laptop.spec.ts`, `post-strip.spec.ts`, `home-lock.spec.ts`, `home.spec.ts`.
4. All shared gates from _CONTEXT.md (check, lab build, scene_gate 01A,03B,04B, seams 10/10, routes 3/3, route visual 3/3
   desktop and --mobile, production build + full Playwright with PLAYWRIGHT_PORT=4831, 0 failed).
5. Shots `qa/031-phone-strip-even-pace/shots/` (JPEG q75): 390x844 at each of the seven centred categories, 1920x1080 mid strip.
Write `qa/031-phone-strip-even-pace/REPORT.md` with the before/after step table and end with
`GATE 031-phone-strip-even-pace: PASS|FAIL`. Keep qa light (no frame folders, no webm).

## Commit message
fix(home): phone film strip paced evenly across all seven categories (longer pinned scroll, no still lead); desktop unchanged
