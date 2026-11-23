---
id: 029-laptop-text-hero-strip
title: Laptop viewports (1536x720 @1.25 and friends) - crisp legible strip labels, hero head never under the header, no blank screen after the film strip, smooth strip-to-runway hand-off
kind: fix
effort: xhigh
model: grok-4.7
depends_on: [027-home-post-strip-refresh]
supersedes: 028-home-strip-hold-to-echo (028 stays a held draft; do not run it, its scope is folded in here)
---
## Why
Matt, on his laptop (1920x1080 panel at 125% Windows scaling, so devicePixelRatio 1.25 and a Chrome viewport of about
1520-1536 x 630-740 CSS px): "all the text is weird on my laptop and the top of the splash page is cut off and it blanks out".
Operator diagnosis (reproduced in Playwright at 1536x720 DPR 1.25 and 1520x634 DPR 1.25 with real wheel input through
Lenis; probe frames under `/workspace/tina-review-2026-11-22/laptop-report/`):

1. Text. The webfonts DO load (JetBrains Mono, Inter Tight, Instrument Serif woff2 all 200 on staging, no CSP issue). The
   nav and corner captions are the approved JetBrains Mono; do NOT change the font families. What reads as "weird":
   (a) the echo strip's category labels (`[data-sheet="echo"]`, cloned by `seams.ts fillSheetEcho()`) are never positioned
   by `placeLabels()`, so in GL mode they all sit at the default spot and pile on top of each other at the left of the
   echo sheet ("Bridal/Landscape/No. 0X" overprinted) - that is the jagged overlapping text in the video;
   (b) live labels are 12 px name + 10 px "No. 0X" mono with only a soft text-shadow, placed at fractional CSS px from
   the WebGL quads (`rawLeft - origin.left`), straight on top of bright photos (Bridal sits on white) - at DPR 1.25 they
   land on fractional device pixels and look soft/aliased and unreadable;
   (c) `.hero__caption` / `.hero__scroll` are 0.68rem (10.9 px) mono.
2. Hero. `.hero__still img` and `.hero__zoom video` use object-fit cover with object-position 50% 50%. The 01A frame is
   16:9 with the picture in the top ~76% and a dark band below; the model's head (hair top to chin) sits at source
   y = 120..300 px, x = 1200..1400 px of 1920x1080 on every loop frame. On any viewport wider than 16:9 the centred crop
   removes (coverH - vh) / 2 from the top, and the opaque fixed header (`--header-h`, 100-112 px, background ink) covers
   the next 112 px, so at 1536x720 the head lands at y 24..168 under the header (face hidden); at 1520x634 worse.
3. Blank screen. `home-filmstrip.ts` drops `is-sheet-hold` (the fixed live strip) at scrub progress 0.995, but the
   02A-03B seam pin (`seams.ts pinTl`, trigger `[data-seam-pair="02A-03B"] [data-track]`, start 'top top') only engages
   when that track reaches the viewport top, about one more viewport of scroll later. In between, the only thing in view
   is the dark `.sheet-scrub` spacer (#0c0c0f): the screen is solid black with just the custom cursor dot (the "small red
   dot" is `.cursor`, not the flood). At short viewports the echo strip sits low in its section, so the black covers the
   whole screen for the longest stretch; then the echo slides up with its piled labels. Measured at 1536x720: hold off at
   y=2709, pin engages at y=3426, viewport-below-header luma 12-16 for the whole run. Pre-existing (the 028 draft gap),
   worst on short laptop viewports.

4. Hand-off to the runway (added by Matt 22 Nov 10:29 PM: "even when it works, the cut after the curved film strip flashes
   to black before the dancing women, really weird transition"). Measured on the page at 1536x720 and 1440x900: once the
   02A-03B stage pins, the locked 02A-03B-C timeline fades the echo strip (`outS` autoAlpha 1 -> 0 over 0.15..0.55) while
   the crimson flood rises with `power2.in` over 0..0.55, so the flood is still mostly below the fold when the strip is
   gone: 2-3 settled samples are a bare ink screen (luma 12-25) with only the cursor dot and a thin red band at the
   bottom, then red, then the runway. The prototype gets away with it because its outgoing panel is light; on the page
   the outgoing strip sits on ink. 028 (held draft) only covered the dark gap BEFORE the pin (item 3), not this; its
   spec is folded into item 3 above, and this item is new.

Operator prototype (scratch worktree, not committed) proved the hold bridge below: at 1536x720 the screen never goes
blank and the swap to the echo strip is invisible.

## Change (keep it to these places)
A. `site/src/scripts/motion/scenes/home-filmstrip.ts`
   - Replace the two direct `is-sheet-hold` toggles with one `syncHold()` that sets the class when
     `(scrub trigger isActive && its progress > 0.02) || (bridge isActive)`. Call it from the scrub trigger's
     onToggle/onUpdate and from the bridge's onToggle/onUpdate, and once after the refresh.
   - Add a `bridge` ScrollTrigger created right after the scrub trigger: `trigger: scrub, start: 'bottom bottom',
     endTrigger: <02A-03B [data-track]>, end: 'top top', refreshPriority: 1`, no scrub/snap/pin, killed in the same stop
     list. Result: the live strip stays held at its last frame until the 02A-03B stage is pinned at the top with the
     identical echo strip underneath, then drops in the same frame. Reverse mirrors automatically.
     Do NOT change the scrub start/end/snap, the 150vh/110vh spacer, the hold CSS, the seam timelines (except item D below), or any motion value.
   - Echo labels: every `placeLabels()` pass also mirrors each live item's computed inline geometry (link left/top/width/
     height, frame height, label left/top/width/display, `is-offstage`) onto the echo item with the same index
     (`[data-sheet="echo"] .sheet__item`), so at the swap the echo labels sit exactly where the live labels were. Until
     the live geometry exists (strip not ready, or a degenerate quad narrower than 8 px), hide labels with
     `visibility: hidden` instead of leaving them at 0,0. No stacked or overlapping labels anywhere.
   - Snap every label/link coordinate written by `placeLabels()` to device pixels:
     `const px = (v: number) => Math.round(v * devicePixelRatio) / devicePixelRatio`.
B. `site/src/styles/home.css` (GL label block `.sheet.is-film-gl .sheet__label` / `.sheet__no` and the hero block only)
   - Labels: name 13 px, "No. 0X" 11 px, line-height 1.35, `.sheet__no` margin-top 0.25rem so the two lines never touch;
     a small ink backing chip for legibility on bright photos: `background: rgba(12,12,15,0.66); padding: 0.28rem 0.5rem;
     width: max-content; max-width: 100%; margin-inline: auto; left: 0; right: 0` (centre without any translate
     transform). Keep JetBrains Mono, colour #F0F3F4, letter-spacing as is. Phone layout (the label row under the strip)
     keeps its current look but gets the same 1.35 line-height.
   - Hero framing: anchor the cover crop to the top and keep the head below the header on every viewport:
     `object-position: var(--hero-x, 50%) max(0px, calc(var(--header-h) + 8px - 0.1111 * max(100svh, 56.25vw)))` for
     `.hero__still img` and `.hero__zoom video[data-scene-video]`, with the phone breakpoint setting `--hero-x: 68%` instead
     of its current `object-position: 68% 50%`. At exactly 1920x1080 this evaluates to the current framing (0 offset, no
     crop), on 390x844 the head already clears the 80 px header so phones are unchanged. Any strip this leaves above the
     picture sits under the opaque header; paint it ink (#0C0C0F) not #0b4f9c (set the img/video background to ink only
     inside this rule). Exempt gate mode (`html.is-scene-gate` keeps 50% 50%) so the 01A scene gate still compares the
     plain cover crop.
   - `.hero__caption, .hero__scroll`: font-size max(0.75rem, 12px).
C. `site/src/layouts/BaseLayout.astro`: preload the three latin woff2 files used above the fold (JetBrains Mono 400,
   Inter Tight 400, Instrument Serif 400) with `<link rel="preload" as="font" type="font/woff2" crossorigin>`, URLs from
   `import x from '@fontsource/.../files/<name>-latin-400-normal.woff2?url'` so they resolve to the same hashed `_astro`
   files the CSS already uses (check the built HTML: the preload hrefs must equal the `url(...)` in the built CSS; no
   duplicate font files in `dist/_astro`).
D. `site/src/scripts/motion/seams.ts`, real page only (hand-off polish). The seam gate compares the HARNESS timeline
   (`/motion-lab/seams/02A-03B/`, `liveHarness`) tween-for-tween with the locked prototype, so the harness must keep
   calling `t_02A_03B_C` unchanged. For the real `[data-seam-pair="02A-03B"]` only (`!liveHarness`), build the same
   timeline with one difference: the echo strip is wiped off BY the flood instead of fading to black ahead of it.
   Same flood tweens (yPercent 100 -> 0, 0..0.55, power2.in; autoAlpha 0 at 0.55..1.05), same `inS` tweens and char
   stagger, same `outS` yPercent -10 drift over 0.15..0.55; but instead of `outS` autoAlpha 1 -> 0 over 0.15..0.55, clip the
   echo with the flood's leading edge: `clipPath: 'inset(0% 0% 0% 0%)' -> 'inset(0% 0% 100% 0%)'` on `outS` over 0..0.55
   with power2.in (the flood edge and the clip edge must coincide within 2 px on every settled 1% step; adjust for the
   drift if needed) and `autoAlpha: 0` set at 0.55 (fully under the flood). Optional and only if it reads better in your
   shots: let the crimson flood's top edge carry a soft 24-40 px feather (gradient mask) so it reads as a wash, not a
   hard wipe. Reverse must mirror. No bare ink frame between the strip and the runway: on every settled 2% step of pin
   progress 0..0.50 (the runway scene itself is a dark followspot, so do not apply this after 0.50), the area below the
   header must have >= 30% of pixels with luma > 40 on the 1536x720 DPR 1.25 and 1920x1080 screenshots. Operator
   baseline on the current code (staging, same code): fraction 0.40-0.45 at progress 0-0.15, then 0.18 / 0.11 / 0.25 at
   0.20 / 0.25 / 0.30 (the black frames), 0.45+ from 0.35 (flood). Frames:
   `/workspace/tina-review-2026-11-22/laptop-report/handoff-before/` and `before-handoff-framestrip-*.jpg`.
   Do not change the pin config, the runway/followspot scrub, other seams, or the harness. Record the page-only variant
   in `docs/design-system/MOTION-LOCKED.md` under 02A-03B as "page hand-off: echo wiped by the flood edge (Matt, 22 Nov)".
No other source files. No changes to core.ts, curvedStrip.ts, media, manifests, gates or gold frames.

## New regression tests: `site/tests/laptop.spec.ts`
Run against the production preview like the other specs. Add one Playwright project per viewport only inside this spec
via `test.describe` + `test.use` (do not change the existing projects in playwright.config.ts; skip this spec's cases when
`info.project.name !== 'desktop'` so they run once). Viewports: 1536x720 DPR 1.25, 1536x690 DPR 1.25, 1520x634 DPR 1.25,
1366x657 DPR 1, 1440x760 DPR 1, 1920x1080 DPR 1, and 390x844 DPR 3 isMobile hasTouch.
1. Fonts/labels: after load + strip ready (`window.__SCENE_READY__['02A']`), `document.fonts.check('13px "JetBrains Mono"')`,
   `'16px "Inter Tight"'`, `'16px "Instrument Serif"'` are true; `.site-nav a` (desktop only) computed font-family starts
   with "JetBrains Mono". Scrub to 3 positions (progress 0, 0.5, 1 via `window.__SCENE_TL__['02A'].setProgress` with
   `html[data-film-hold="1"]`): every visible live label has name-line bottom <= `.sheet__no` top (Range rects), no two
   visible labels' boxes overlap, and each label's left/top times devicePixelRatio is within 0.02 of an integer.
2. Hero: at scroll 0, compute the rendered head box from the poster img rect, computed object-position and cover math
   (source head y 120..300, x 1200..1400 of 1920x1080). Assert head top >= header bottom + 4 and head bottom <= title
   top, and head x inside the viewport. At 1920x1080 also assert the computed object-position Y resolves to 0px (framing
   unchanged) and at 390x844 X is 68%.
3. Strip, real input: desktop sizes use `page.mouse.wheel(0, 100)` twice per step with 60 ms gaps then 300 ms settle (real
   Lenis smoothing, no forced refresh/resize); phone uses `__tcMotion.scrollTo` 90 px steps. From 0 until `.runway--stage`
   opacity is 1 and the 02A-03B stage is no longer fixed, then back to 0. At every sample with scrollY between the scrub
   spacer's start and the 02A-03B pin start: `html.is-sheet-hold` is on (no blank black stretch). On the first sample with
   the 02A-03B stage fixed: hold is off and `.sheet--echo` opacity >= 0.98. Whenever the echo sheet intersects the
   viewport with opacity > 0.05 its visible labels have distinct x positions (> 24 px apart) and lie within 3 px of the
   live label of the same index measured at the hold's last sample. Also: after the forward run, wait 1500 ms with no
   input - the viewport centre `elementFromPoint` is inside `.runway` (not `.sheet-scrub`/body), i.e. never parked on black.
   On phone the hold also runs (110vh spacer); assert the same invariants there.
4. Hand-off: at 1536x720 DPR 1.25 and 1920x1080 (and 390x844), drive the page to the 02A-03B pin start, then step the
   pin progress in 2% steps with real wheel input and settle (or use the 02A-03B ScrollTrigger start/end to compute the
   scroll Y and `__tcMotion.scrollTo` it, then wait for the scrub to settle). On each step take a screenshot clip of the
   viewport below the header and compute the fraction of pixels with luma > 40 (decode the PNG buffer in Node with the
   built-in zlib, or draw it on a canvas in the page; no new dependencies): >= 0.30 on every step from progress 0 to 0.50.
   Must FAIL on the current code and PASS after.
The strip and hand-off tests must FAIL on the current code (run it once before the change; paste the first failure line per viewport in
the report) and PASS after. Keep the existing `post-strip.spec.ts` passing unchanged.

## Gate
`_CONTEXT.md` gates with `--scenes 01A,03B,04B` (keep worst SSIM 01A >= 0.97, 03B >= 0.96, 04B >= 0.95), seams 10/10,
routes 3/3, visual 3/3 desktop and mobile, `npm run check` clean, full Playwright suite 0 failed including the new spec.
Shots: 1536x720 DPR 1.25 at scroll 0 (hero), strip mid (labels), a forward frame strip across the strip exit (8 frames), and
a hand-off frame strip (12 frames, pin progress 0..0.6) at 1536x720 DPR 1.25 AND 1920x1080, before (current code) and after,
in `qa/029-laptop-text-hero-strip/shots/`; plus 1920x1080 and 390x844 hero at scroll 0 to show those framings did not
change (pixel diff vs current main build of the hero region, note the % changed). Report in
`qa/029-laptop-text-hero-strip/REPORT.md`; keep qa light (scores.json, tables, the shots above; no frame folders).

## Commit message
fix(home): laptop 1536x720 @1.25 - legible strip labels, hero head clear of the header, strip held until the echo pins, flood wipes the strip into the runway
