# Locked motion spec (Tina Campbell)

Status: LOCKED. Matt approved these picks on 13 Nov 2026 at 6:37 AM, America/Costa_Rica (UTC-6), and said to lock them into the design system, put them in the Company Brain, and adhere to them perfectly for the website build. Close does not count. It has to be perfect.

Source of truth for the picks: `concepts/motion-options-2026-11-12/PICKS.md`.
In-repo prototypes (copy of the chosen HTML/GSAP and recorded gold clips): `motion-reference/`.
Original working tree (includes large scene `clip.mp4` files): `concepts/motion-options-2026-11-12/`.

This file is the binding motion section of the design system. The build must reproduce each scene and each seam exactly: same timing, easing, masks or clip-paths, layering, typography motion, and pin behaviour. Do not substitute a fade, a wipe, or a different ease because it is close.

## Binding rule

- Verdicts for locked motion are only PASS or FAIL. CLOSEST, ACCEPTABLE, and PARTIAL are FAIL.
- Any FAIL on a locked seam or scene blocks the driver from advancing to the next step and blocks staging.
- An independent reviewer must run `python3 build-plan/tools/motion-gate.py` against `site` (or the served `site/dist`) and the gold `clip.mp4` files in `motion-reference/`. The gate records at 1440x810 on the same scroll timeline as `_shared/record.py` and `boot.js`.
- Ambiguity does not block the build. Log the question in `build-plan/OPEN-QUESTIONS.md` and keep going with the locked pick. A failed motion gate still blocks advancing.
- More transitions may come later. Build the 11 scenes and 10 seams locked here. Do not wait.
- Scene 03B (followspot) is a provisional pick. Build it exactly as locked until Matt changes it.
- Reduced-motion fallback is required on every scene and seam (see below). It is not a licence to change the full-motion path.
- Use only Tina's real photos. Never bake words into images or video. Tokens stay ink `#0C0C0F`, paper `#F0F3F4`, crimson `#B3261E`.
- Never name a folder `build`, `out`, or `dist` (Astro's existing `site/dist` output is fine). Do not push. Do not deploy.

## Shared runtime (every seam)

All 10 seam prototypes share `motion-reference/12-seam-transitions/_shared/`.

- GSAP 3 plugins: ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin, CustomEase.
- Custom ease `cine`: cubic-bezier `(0.22, 1, 0.36, 1)`, created in `boot.js`. Timeline defaults: `ease: "cine"`, `duration: 1`, unless a tween overrides them.
- Pin: `ScrollTrigger` on `[data-track]`, `start: "top top"`, `end: "bottom bottom"`, `scrub: 0.6`, `pin: [data-stage]`, `anticipatePin: 1`. Header stays put. Nav `aria-current` swaps at progress `0.55`.
- SplitText (when a title is animated): `SplitText.create(h1, { type: "chars,words,lines", mask: "chars" })`. Incoming chars start at `yPercent: 110` and ease to `0`.
- Record / preview timeline (the motion gate must use this): viewport **1440x810**, device scale 1, `?record=1`, wait for `window.__PROTO_READY__ === true`, fonts and images ready, 250 ms, then `window.__START_RECORD__()`. That hook holds **0.6 s**, scrolls to the max scroll with `duration: 5.2`, `ease: "none"`, then waits **0.85 s**. Preview with `?play=1` runs the same hook.
- Chrome: grain overlay, TCPhoto wordmark, Inter Tight nav, crimson "Book a shoot" pill. Incoming section starts hidden (`autoAlpha: 0`) unless a specific function sets it otherwise.
- Reduced motion (`prefers-reduced-motion: reduce`): no pin, no scrub, no SplitText staggers, no masks or floods. Show the incoming section only (`opacity: 0` on `.sec-out`, `opacity: 1` on `.sec-in`), or a 200 ms crossfade. Content must be fully readable without JavaScript.

## Locked scenes (page order)

Each scene's motion must match the chosen clip. Gold stills are in `motion-reference/<scene>/<option>/start.jpg` and `end.jpg`. The moving reference is the original clip (not copied; path below).

| # | Section | Pick | Name | Stills / prototype media | Original clip (not in this folder) |
| --- | --- | --- | --- | --- | --- |
| 01 | Home hero | A | living-gown | `motion-reference/01-home-hero/A-living-gown/` | `concepts/motion-options-2026-11-12/01-home-hero/A-living-gown/clip.mp4` |
| 02 | Home filmstrip | A | film-gate-advance | `motion-reference/02-home-filmstrip/A-film-gate-advance/` | `concepts/motion-options-2026-11-12/02-home-filmstrip/A-film-gate-advance/clip.mp4` |
| 03 | Home runway | B | followspot (provisional) | `motion-reference/03-home-runway/B-followspot/` | `concepts/motion-options-2026-11-12/03-home-runway/B-followspot/clip.mp4` |
| 04 | Work hover | B | crimson-ink-drop | `motion-reference/04-work-hover/B-crimson-ink-drop/` | `concepts/motion-options-2026-11-12/04-work-hover/B-crimson-ink-drop/clip.mp4` |
| 05 | Work entrance | C | light-table-drop | `motion-reference/05-work-entrance/C-light-table-drop/` | `concepts/motion-options-2026-11-12/05-work-entrance/C-light-table-drop/clip.mp4` |
| 06 | Editorial split | B | crimson-thread | `motion-reference/06-editorial-split/B-crimson-thread/` | `concepts/motion-options-2026-11-12/06-editorial-split/B-crimson-thread/clip.mp4` |
| 07 | Series story | C | print-stack | `motion-reference/07-series-story/C-print-stack/` | `concepts/motion-options-2026-11-12/07-series-story/C-print-stack/clip.mp4` |
| 08 | Page transitions | B | ink-flood | `motion-reference/08-page-transitions/B-ink-flood/` | `concepts/motion-options-2026-11-12/08-page-transitions/B-ink-flood/clip.mp4` |
| 09 | About parallax | B | blue-hour-lights | `motion-reference/09-about-parallax/B-blue-hour-lights/` | `concepts/motion-options-2026-11-12/09-about-parallax/B-blue-hour-lights/clip.mp4` |
| 10 | Contact / footer | A | blue-hour-drift | `motion-reference/10-contact-footer/A-blue-hour-drift/` | `concepts/motion-options-2026-11-12/10-contact-footer/A-blue-hour-drift/clip.mp4` |
| 11 | Portraits chapters | B | veil-wipe | `motion-reference/11-portraits-chapters/B-veil-wipe/` | `concepts/motion-options-2026-11-12/11-portraits-chapters/B-veil-wipe/clip.mp4` |

What each scene does:

1. **01A living-gown.** Full-bleed red gown on the teal truck, fabric living in a breeze. The hero is a living photograph, not a still Ken Burns crop.
2. **02A film-gate-advance.** Category band as a 35mm film gate, advancing frame by frame.
3. **03B followspot.** Provisional. Stage stays noir; a followspot flushes each frame into colour.
4. **04B crimson-ink-drop.** Crimson ink blooms into the gown on the Work tile (hover or equivalent focus).
5. **05C light-table-drop.** Prints drop onto a light table and settle into the Work grid.
6. **06B crimson-thread.** Editorial split; a crimson hairline paints red into the gown.
7. **07C print-stack.** Series cover as a loose stack of prints.
8. **08B ink-flood.** Page-to-page ink flood, next cover emerging through the wash. (This is the scene language for the ink flood. Route changes also still follow the Flip / film-strip work in prompt 009 and clip 05.)
9. **09B blue-hour-lights.** About hero: dusk to blue hour, bridge and city lights on. Layered plates.
10. **10A blue-hour-drift.** Contact / footer band, Walterdale arch drifting at blue hour.
11. **11B veil-wipe.** Portraits / Bridal chapter, a veil wiping between frames.

## Locked seams (page order)

Each row is one adjacent-section transition. Prototype HTML is the implementation reference. `clip.mp4` is the gold recording the motion gate compares against. Function names are in `_shared/boot.js`. Timeline times are GSAP seconds on the pinned, scrubbed timeline (not wall-clock). Default ease is `cine` unless noted. Incoming titles use SplitText chars as described above.

### 1. 01A living-gown to 02A film-gate-advance

- Pick: **A** `A-ink-bleed-down`
- Prototype: `motion-reference/12-seam-transitions/01A-02A/A-ink-bleed-down/index.html`
- Gold clip: `motion-reference/12-seam-transitions/01A-02A/A-ink-bleed-down/clip.mp4`
- Function: `t_01A_02A_A`
- Markup: `[data-ink]` layer over the two sections. Ink fill is `--ink` (`#0C0C0F`). Incoming section starts at `yPercent: 36`, `autoAlpha: 0`, `zIndex: 9`. Ink starts at `yPercent: 100`, `zIndex: 8`. Incoming chars at `yPercent: 110`.
- Motion: outgoing media `yPercent: -12`, `scale: 1.08`, duration **1.2**, at t=0. Outgoing title chars `yPercent: -110`, `opacity: 0`, stagger **0.02**, duration **0.55**, at t=**0.05**. Ink rises to `yPercent: 0`, duration **0.65**, ease `power2.inOut`, at t=**0.15**. Incoming section to `autoAlpha: 1`, `yPercent: 0`, duration **0.85**, ease `power3.out`, at t=**0.38**. Incoming chars to `yPercent: 0`, stagger **0.03**, duration **0.6**, at t=**0.52**. Incoming media from `yPercent: 18`, `blur(8px)` to `0` / `blur(0)`, duration **0.7**, at t=**0.4**. Ink exits to `yPercent: 100`, duration **0.45**, ease `power2.in`, at t=**0.72**.
- Timeline end about **1.17**.

### 2. 02A film-gate-advance to 03B followspot

- Pick: **C** `C-magenta-flood`
- Prototype: `motion-reference/12-seam-transitions/02A-03B/C-magenta-flood/index.html`
- Gold clip: `motion-reference/12-seam-transitions/02A-03B/C-magenta-flood/clip.mp4`
- Function: `t_02A_03B_C`
- Markup: `[data-flood]` layer. Flood fill is set in JS to `linear-gradient(180deg, #4a0d1a 0%, #b3261e 40%, #1a0a12 100%)`. Incoming starts `autoAlpha: 0`, `yPercent: 16`, `blur(10px)`. Flood starts `yPercent: 100`.
- Motion: flood to `yPercent: 0`, duration **0.55**, ease `power2.in`, at t=0. Outgoing `autoAlpha: 0`, `yPercent: -10`, duration **0.4**, at t=**0.15**. Incoming to `autoAlpha: 1`, `yPercent: 0`, `blur(0)`, duration **0.7**, at t=**0.4**. Flood `autoAlpha: 0`, duration **0.5**, at t=**0.55**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.55**.
- Page hand-off: echo wiped by the flood edge (Matt, 22 Nov). The harness timeline is unchanged. On the real page the echo stays opaque until the flood covers it, and its bottom edge is clipped to the flood's leading edge over 0..0.55 (`power2.in`, the -10 drift compensated) so the strip does not fade to ink ahead of the wash. While that wash thins onto the followspot it holds a 6% brightness lift, so a 16:9 frame does not drop out.
- Timeline end about **1.05**.

### 3. 03B followspot to 04B crimson-ink-drop

- Pick: **A** `A-catwalk-to-grid`
- Prototype: `motion-reference/12-seam-transitions/03B-04B/A-catwalk-to-grid/index.html`
- Gold clip: `motion-reference/12-seam-transitions/03B-04B/A-catwalk-to-grid/clip.mp4`
- Function: `t_03B_04B_A`
- Markup: no extra mask layer. Incoming starts `autoAlpha: 0`, `rotate: -4`, `yPercent: -20`, `scale: 0.86`. Work nav may take `aria-current` at progress 0.55 (`data-nav-in`).
- Motion: outgoing chars `yPercent: -110`, stagger **0.02**, duration **0.4**, at t=0. Outgoing media `yPercent: 40`, `rotate: 3`, `scale: 0.8`, duration **0.7**, at t=0 (frames drop and rotate toward the Work grid). Incoming to `autoAlpha: 1`, `rotate: 0`, `yPercent: 0`, `scale: 1`, duration **0.85**, ease `power3.out`, at t=**0.25**. Outgoing `autoAlpha: 0`, duration **0.3**, at t=**0.55**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.5**.
- Timeline end about **1.10**.

### 4. 04B crimson-ink-drop to 05C light-table-drop

- Pick: **C** `C-loupe-assemble`
- Prototype: `motion-reference/12-seam-transitions/04B-05C/C-loupe-assemble/index.html`
- Gold clip: `motion-reference/12-seam-transitions/04B-05C/C-loupe-assemble/clip.mp4`
- Function: `t_04B_05C_C`
- Markup: SVG `viewBox="0 0 1440 810"` with `circle[data-loupe]` at `cx=720`, `cy=405`, `r=90`, `fill=none`, `stroke=#b3261e`, `stroke-width=6`. Incoming starts `autoAlpha: 0`, `clip-path: circle(8% at 50% 50%)`. Loupe starts `scale: 0.15`, `autoAlpha: 1`.
- Motion: loupe `scale: 1.15`, duration **0.85**, ease `power2.inOut`, at t=0. Incoming `autoAlpha: 1`, `clip-path: circle(80% at 50% 50%)`, duration **0.85**, ease `power2.inOut`, at t=**0.1**. Loupe `autoAlpha: 0`, duration **0.3**, at t=**0.7**. Outgoing `autoAlpha: 0`, duration **0.25**, at t=**0.65**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.55**.
- Timeline end about **0.95**.

### 5. 05C light-table-drop to 06B crimson-thread

- Pick: **A** `A-print-to-column`
- Prototype: `motion-reference/12-seam-transitions/05C-06B/A-print-to-column/index.html`
- Gold clip: `motion-reference/12-seam-transitions/05C-06B/A-print-to-column/clip.mp4`
- Function: `t_05C_06B_A`
- Markup: one print grows into the editorial photo column. Incoming copy is `copy--left` with the Fashion and Editorial title (live HTML, including the `&amp;` line) and the series list. SVG path `#threadPath`, `stroke=#b3261e`, `stroke-width=3`, `d="M720,0 C716,160 728,280 720,405 C712,560 724,680 720,810"`, drawn with DrawSVG. Incoming starts `autoAlpha: 0`, `xPercent: 28`, `scale: 0.86`. Thread starts `drawSVG: "0% 0%"`.
- Motion: outgoing chars `xPercent: -30`, `opacity: 0`, stagger **0.02**, duration **0.4**, at t=0. Outgoing media `xPercent: -18`, `scale: 0.92`, duration **0.7**, at t=0. Incoming to `autoAlpha: 1`, `xPercent: 0`, `scale: 1`, duration **0.8**, at t=**0.25**. Thread `drawSVG: "0% 100%"`, duration **0.7**, ease `power1.inOut`, at t=**0.4**. Outgoing `autoAlpha: 0`, duration **0.25**, at t=**0.6**. Incoming title chars duration **0.6**, stagger **0.018**, at t=**0.45**.
- Timeline end about **1.10**.

### 6. 06B crimson-thread to 07C print-stack

- Pick: **C** `C-magazine-close`
- Prototype: `motion-reference/12-seam-transitions/06B-07C/C-magazine-close/index.html`
- Gold clip: `motion-reference/12-seam-transitions/06B-07C/C-magazine-close/clip.mp4`
- Function: `t_06B_07C_C`
- Markup: no extra mask. Incoming starts `autoAlpha: 0`, `rotateY: 90`, `transformPerspective: 1600`, `transformOrigin: "left center"`.
- Motion: outgoing `rotateY: -55`, `transformPerspective: 1600`, `transformOrigin: "right center"`, duration **0.7**, at t=0 (magazine close). Incoming to `autoAlpha: 1`, `rotateY: 0`, duration **0.75**, at t=**0.28**. Outgoing `autoAlpha: 0`, duration **0.2**, at t=**0.65**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.5**.
- Timeline end about **1.03**.

### 7. 07C print-stack to 08B ink-flood

- Pick: **C** `C-ink-curtain-wipe`
- Prototype: `motion-reference/12-seam-transitions/07C-08B/C-ink-curtain-wipe/index.html`
- Gold clip: `motion-reference/12-seam-transitions/07C-08B/C-ink-curtain-wipe/clip.mp4`
- Function: `t_07C_08B_C`
- Markup: `[data-ink]` curtain. JS sets `xPercent: -100` and `background: linear-gradient(90deg, #0c0c0f 70%, transparent)`. Incoming starts `autoAlpha: 0`, `xPercent: 12`.
- Motion: ink to `xPercent: 0`, duration **0.6**, ease `power2.inOut`, at t=0. Outgoing `xPercent: -10`, `autoAlpha: 0`, duration **0.5**, at t=**0.15**. Incoming to `autoAlpha: 1`, `xPercent: 0`, duration **0.7**, at t=**0.4**. Ink exits to `xPercent: 100`, duration **0.55**, at t=**0.55**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.55**.
- Timeline end about **1.10**.

### 8. 08B ink-flood to 09B blue-hour-lights

- Pick: **C** `C-city-iris`
- Prototype: `motion-reference/12-seam-transitions/08B-09B/C-city-iris/index.html`
- Gold clip: `motion-reference/12-seam-transitions/08B-09B/C-city-iris/clip.mp4`
- Function: `t_08B_09B_C`
- Markup: incoming About media is three layers of the same plate (`data-layer`): base; one at `opacity: 0.55`, `mix-blend-mode: screen`, `scale(1.06)`; one at `opacity: 0.35`, `scale(1.12)`. Incoming starts visible, `clip-path: circle(0% at 50% 55%)`. About nav takes `aria-current` at progress 0.55.
- Motion: incoming `clip-path: circle(80% at 50% 55%)`, duration **1**, ease `power2.inOut`, at t=0. Outgoing `autoAlpha: 0`, `scale: 1.06`, duration **0.6**, at t=**0.35**. Incoming chars duration **0.55**, stagger **0.03**, at t=**0.5**.
- Timeline end about **1.05**.

### 9. 09B blue-hour-lights to 10A blue-hour-drift

- Pick: **B** `B-layers-settle`
- Prototype: `motion-reference/12-seam-transitions/09B-10A/B-layers-settle/index.html`
- Gold clip: `motion-reference/12-seam-transitions/09B-10A/B-layers-settle/clip.mp4`
- Function: `t_09B_10A_B`
- Markup: incoming media uses `media--band` (band inset: top and bottom 18% of the stage). Copy is `copy--footer`. Incoming starts `autoAlpha: 0`, `yPercent: 20`.
- Motion: outgoing chars `yPercent: -110`, stagger **0.02**, duration **0.4**, at t=0. Outgoing media `yPercent: -14`, `scale: 1.04`, duration **0.8**, at t=0. Incoming to `autoAlpha: 1`, `yPercent: 0`, duration **0.75**, at t=**0.3**. Outgoing `autoAlpha: 0`, duration **0.3**, at t=**0.6**. Incoming chars duration **0.5**, stagger **0.03**, at t=**0.5**.
- Timeline end about **1.05**.

### 10. 10A blue-hour-drift to 11B veil-wipe

- Pick: **B** `B-band-lifts-chapter`
- Prototype: `motion-reference/12-seam-transitions/10A-11B/B-band-lifts-chapter/index.html`
- Gold clip: `motion-reference/12-seam-transitions/10A-11B/B-band-lifts-chapter/clip.mp4`
- Function: `t_10A_11B_B`
- Markup: outgoing is the contact band; incoming is the portraits chapter (`copy--chapter`). Incoming starts `autoAlpha: 0`, `yPercent: 40`. Work nav may take `aria-current` at progress 0.55.
- Motion: outgoing chars `yPercent: -110`, stagger **0.02**, duration **0.4**, at t=0. Outgoing section `yPercent: -60`, duration **0.8**, ease `power2.inOut`, at t=**0.05** (the band lifts off). Incoming to `autoAlpha: 1`, `yPercent: 0`, duration **0.8**, ease `power2.out`, at t=**0.25**. Incoming chars duration **0.55**, stagger **0.03**, at t=**0.5**.
- Timeline end about **1.05**.

## Motion gate

Run from the repo root, after `npm run build` in `site`, with the preview server up:

```bash
python3 /workspace/tina-campbell/build-plan/tools/motion-gate.py \
  --base http://127.0.0.1:<port> \
  --out /workspace/tina-campbell/qa/011-locked-motion/gate
```

The script records each site seam at 1440x810 on the same hold / 5.2 s linear scroll / tail timeline as `_shared/record.py`, then compares sampled frames to the gold `clip.mp4`. It also checks GSAP timeline durations and eases against this spec.

Thresholds (all must pass; there is no close):

- Luma SSIM of every sampled frame at or above **0.92**
- Mean absolute per-channel error at or below **8.0** (0-255)
- Scroll duration **5.2 s ± 0.08 s**
- GSAP timeline end within **0.05 s** of the end time listed above
- Default ease on unspecified tweens is `cine` `(0.22, 1, 0.36, 1)`; named overrides (`power2.inOut`, `power3.out`, `power2.in`, `power1.inOut`, `power2.out`) must match this file
- Zero failed frames. Worst frames are written as diffs. The only allowed last line is `VERDICT: PASS` or `VERDICT: FAIL`.

The site must expose, on each seam, `data-seam="<pair>"` (for example `data-seam="01A-02A"`) and the same `window.__PROTO_READY__` / `window.__START_RECORD__` / `window.__PROTO_TL__` hooks as the prototypes, so the gate can record the live page the same way.

## Site contract for prompt 011

Implement the 11 scenes and the 10 seams in the Astro site. Prefer porting the locked `boot.js` functions and markup, then wiring them to real routes and Tina's photos. Do not invent a different choreography. Keep approved layout work from earlier prompts. Log open questions to `build-plan/OPEN-QUESTIONS.md` and continue. Do not publish, push, or deploy.
