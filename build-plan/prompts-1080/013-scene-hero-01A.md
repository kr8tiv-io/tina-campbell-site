---
id: 013-scene-hero-01A
title: Home hero becomes the 01A living-gown 1080p video
kind: build
effort: xhigh
model: grok-4.7
depends_on: [012c-seams-visual-fix]
---
## Goal
The home hero (`site/src/pages/index.astro` `.hero`, `site/src/scripts/motion/home.ts`) plays scene 01A A-living-gown exactly
as picked: full-bleed red gown on the teal truck, slow ~12% push-in baked into the video, skirt ripple peaking 2.0-4.0 s,
muted seamless loop. Title "Tina Campbell" and meta stay real HTML on top (SplitText chars via core as now).

## Timing table (from the clip, 24 fps)
| t (s) | frame | what |
|---|---|---|
| 0.00 | 0 | still pose, skirt low, leg out |
| 0.8-2.0 | 19-48 | skirt lifts |
| 2.0-4.0 | 48-96 | peak billow |
| 4.0-6.04 | 96-144 | settles, push-in continues; frame 144 cuts to frame 0 |

## Must haves
1. Create `site/src/scripts/motion/scene-video.ts` (shared helper for all 7 video scenes): build/upgrade a
   `<video data-scene-video>` from `site/public/media/scenes/manifest.json` entries; modes `loop | scrub | play`; source pick
   (1080 vs 720, AV1 webm first); IntersectionObserver lazy load + pause off screen; `scrub(progress)` that sets
   currentTime with rVFC/rAF coalescing; gate hook `?record=1&gate=<ID>` per `_CONTEXT.md`; reduced-motion still.
2. Hero media slot: replace the static hero `<Photo>` render with the video (mode loop), poster `01A-poster.webp` as the LCP
   image (preload + fetchpriority high), `01A-end.webp` for reduced motion. Keep `hero__shade` (text legibility) but mark
   decorative layers (`hero__night`, `hero__warm`, `hero__shade`, `hero__grain`) `data-scene-overlay`. Remove the code
   zoom/warm/night tweens that fight the baked push-in ONLY for the media (keep copy motion, header and loader).
3. Seams 01A-02A and 02A-03B still PASS (their harness media may stay the photo; real home must not break them).
4. Mobile 390x844: object-position chosen so the gown and face stay in frame for the whole loop (check frames 0, 72, 144);
   document the value.

## Files
site/src/scripts/motion/scene-video.ts (new), site/src/scripts/motion/home.ts, site/src/scripts/motion/core.ts,
site/src/pages/index.astro, site/src/styles/home.css, site/src/env.d.ts (window types).

## Non-goals
Runway, work and other scenes. Re-encoding media. Changing copy.

## Verification
`_CONTEXT.md` gates with `--scenes 01A`, seam gate 10/10, screenshots. Also report hero LCP from a Lighthouse-style trace
(`npx playwright` performance timing is fine) and bytes loaded before first scroll at 1440 and 390 widths.

## Commit message
feat(scene-01A): home hero plays the locked living-gown 1080p loop via shared scene-video helper
