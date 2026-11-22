# 023-about-hero-editorial-split

VERDICT: PASS

`/about/` opens as an editorial split. Left ink panel (`#0C0C0F`) holds the eyebrow, the one h1 "Tina Campbell", the existing two-line intro, and Book a shoot. Right is `fb_171_bts`, full height, object-fit cover. A 2 px crimson (`#B3261E`) rule sits on the seam. Directly under the hero, `data-about-band` is the 09B poster only (`/media/scenes/09B/09B-end.webp`), full bleed, no caption and no video. `[data-about-hero]` stays on the hero. The cut-out files under `site/src/assets/about-layers/` are still in the repo and are no longer rendered or preloaded. The story, BTS, and places sections below are unchanged. The lower h2 still repeats "I shoot everything. / Fashion is the one I'd do for free."

## How close it is to Editorial Split

`side-by-side-06B.jpg` puts `motion-reference/06-editorial-split/B-crimson-thread/end.jpg` beside the desktop scroll-0 shot.

Same grammar: ink field, live type, a thin crimson seam, a photograph. Different picture. 06B is a colour gown in a narrower column on a wide black field, with the thread painted into the reference and no headline in that frame. This hero puts the type in the left half and fills the entire right half, which is what this prompt asks for. The site header is the existing full-width ink bar, so the photograph starts under it. The source file itself clips the top of the camera; the hero crop keeps that same edge at the top of the column.

Phone (390x844, DPR 3): the photo is on top at 60svh, a horizontal crimson rule, then the ink panel. The h1 is still the first heading in the DOM. At scroll 0 the Book button is only a sliver at the bottom of an 844 px screen. The full button is in view by scroll 400. Scroll 400 and 800 show the blue-hour bridge band, then the existing story.

Reduced motion (`desktop-reduced-0.png`): the photo, the full rule, and the type are static. No clip, no rise, no drift.

## Motion, stated as built

On load, when motion is allowed, the photo reveals from the seam (`clip-path` inset `0 100% 0 0` to `0`, 0.9 s, ease `cine`) and the ink lines rise 12 px with a 0.08 stagger. The crimson rule draws in that same 0.9 s entrance (`scaleY` on desktop, `scaleX` under 900 px). The hero is already at the top of the page, so a scrub that starts at `top top` would keep the seam hidden until the panel scrolls away. Scroll owns only the photograph.

The drift tween is `yPercent` 0 to -6 across the hero (`top top` to `bottom top`, scrub). Travel is 6 percent upward. The source has almost no headroom above the camera, so a downward lag would crop the face or open a gap. The comment in `about.ts` calls this a "6 percent lag"; the tween direction is upward. Reduced motion and no JS leave the still, the rule, and the type where they are. The hero image is the LCP (`priority` on `fb_171_bts`). The band image is `loading="lazy"`. The about page has no `<video>`.

## Photos

`fb_171_bts.jpg` is a byte copy of raw index 171 (`fb_477002674212609.jpg`), 1080x1127, 82152 bytes. Corner check was clean. Matt confirmed this is Tina. Alt text is "Tina Campbell behind the camera". It is the hero.

`fb_125_bts.jpg` is index 125 (`fb_253103339935878.jpg`) with the black letterbox removed: crop `(0, 118, 1080, 779)`, JPEG quality 95, 4:4:4, 123290 bytes. Edge means are not black. The Canon strap text is equipment in the frame. Alt does not call that photographer Tina. Short side is 779 px. PHOTO-PLAN wants a short side of at least 1000 px above 40 vw, and 768 px only under 25 vw. `workTiles()` still lists every library photo, so this frame can appear in the work grid wider than 25 vw. It was not upscaled. Seam route visual on 04B-05C still passed (desktop dark 0.04 vs gold 0.12, mobile 0.22 vs 0.19).

## JS size

`about.ts` gzip -9 is 1053 bytes (HEAD was 1218). `about/index.astro` gzip -9 is 1721 (HEAD 1580). `about.css` gzip -9 is 2130 (HEAD 1945). No new JS chunk. Production BaseLayout is 80.55 kB, gzip 23.58 kB. Added script is under the 15 KB gzip budget.

`site/src/styles/pages.css` still has the old collage selectors. About does not import that file. Those rules were left in place.

## Gates

Motion-lab preview `http://127.0.0.1:4821` before the production rebuild. `npm run check` is in the same `&&` chain and the chain reached the preview and the gates.

```
cd site && npm run check && TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes 01A,03B,04B --out qa/023-about-hero-editorial-split/scene-gate
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/023-about-hero-editorial-split/seam-gate
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/023-about-hero-editorial-split/route-visual
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/023-about-hero-editorial-split/route-visual-mobile --mobile
```

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145 []
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145 []
04B PASS worst=0.9531 (frame 1) mean=0.9597 bad=0/145 []
VERDICT: PASS
```

```
PASS 01A-02A frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 02A-03B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 03B-04B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 04B-05C frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 05C-06B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 06B-07C frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 07C-08B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 08B-09B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 09B-10A frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
PASS 10A-11B frames=101 bad=0 worst_ssim=1.0000@p-000.jpg timing_diffs=0
VERDICT: PASS
```

```
PASS 01A-02A on /?record=1 diffs=0
PASS 02A-03B on /?record=1 diffs=0
PASS 04B-05C on /work/?record=1 diffs=0
VERDICT: PASS
```

```
PASS 01A-02A worst step 7 dark 0.60 vs gold 0.45, len 3.2vh vs pin 2.2
PASS 02A-03B worst step 3 dark 0.63 vs gold 0.53, len 3.2vh vs pin 2.2
PASS 04B-05C worst step 10 dark 0.04 vs gold 0.12, len 3.2vh vs pin 2.2
VERDICT: PASS
```

```
PASS 01A-02A worst step 9 dark 0.52 vs gold 0.50, len 3.2vh vs pin 2.2
PASS 02A-03B worst step 6 dark 0.67 vs gold 0.66, len 3.2vh vs pin 2.2
PASS 04B-05C worst step 7 dark 0.22 vs gold 0.19, len 3.2vh vs pin 2.2
VERDICT: PASS
```

| Gate | Result |
|---|---|
| tsc `npm run check` | PASS. The `&&` chain reached the motion-lab build and scene_gate. |
| scene_gate 01A, 03B, 04B | PASS. Worst SSIM 01A 0.9748 frame 95, 03B 0.9613 frame 83, 04B 0.9531 frame 1. Bad 0/145 each. |
| seam_gate | PASS 10/10. Each pair worst SSIM 1.0000, bad 0/101, timing diffs 0. |
| seam_route_check | PASS 3/3, diffs 0. |
| seam_route_visual desktop | PASS 3/3. |
| seam_route_visual mobile | PASS 3/3. |

## Production Playwright

`npm --prefix site run build` with `TC_MOTION_LAB` unset: 20 pages. The motion-lab seam route file was scanned and emitted no HTML. Built `/about/` has one h1, `noindex, nofollow`, `data-about-hero`, `data-about-band`, the 09B poster, and `fb_171`. It has no about-layer URLs, no `<video>`, and no `/motion-lab` link.

No about test asserted the old layers, so no test file changed.

`PLAYWRIGHT_PORT=4399 npx playwright test` (4321 was already in use, so the suite booted this production `site/dist`). 43 passed, 21 skipped, 0 failed (6.4m).

## Shots

`qa/023-about-hero-editorial-split/shots/`: `desktop-1440-0.png`, `desktop-1440-400.png`, `desktop-1440-800.png` (1440x900); `mobile-390-0.png`, `mobile-390-400.png`, `mobile-390-800.png` (390x844, DPR 3); `desktop-reduced-0.png`, `desktop-reduced-400.png`, `desktop-reduced-800.png`. Side-by-side: `qa/023-about-hero-editorial-split/side-by-side-06B.jpg`.

## Commit

Operator commits. Suggested message:

feat(about): editorial split hero with a real behind-the-camera photo
