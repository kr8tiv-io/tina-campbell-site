# Locked scenes at 1080p: render route and site approach (19 Nov 2026, America/Edmonton UTC-6)

Matt (19 Nov): 7 video scenes + 4 code scenes, render the video scenes, pick whatever gives the best visual result,
staging only, keep it tracked on GitHub.

## 1. Render route (decided by test, not taste)

| Route | Result |
|---|---|
| Grok Imagine inside Grok Build | Blocked by xAI zero data retention (ZDR) since 12 Nov. Not touched. |
| Image-to-video 1080p generator from the picked clip's frame 0 + the imagine brief (the same generator family that made the 167 options) | Tested on 01A. New random motion: camera pulls back instead of pushing in, skirt does a different move. Per-frame SSIM vs the picked clip min 0.51, mean 0.58, 143/145 frames below 0.92. FAIL. A new generation can never reproduce the exact motion Matt picked. |
| Upscale the picked 720p clip itself (Real-ESRGAN realesr-general-wdn-x4v3, CPU bf16, 4x then area-downsample to 1920x1080) | Motion, pacing and framing are identical by construction. dn 0.5 blend sharpened JPEG/H.264 banding in the sky into horizontal streaks (rejected); dn 0.0 still left faint streaks in flat sky. Chosen: a detail-masked hybrid (`tools/hybrid_scene.py`): ESRGAN dn 0.0 where the frame has real texture (hair, fabric, faces, chrome), Lanczos in flat areas. 01A: SSIM vs picked clip min 0.9887 / mean 0.9894, frame-to-frame change 0.715 vs 0.681 in the source (ESRGAN alone 0.871 = shimmer), skies clean. |
| Lanczos 1.5x | Exact too (01A min SSIM 0.9957) but soft. Used inside the hybrid for flat areas. |

Masters live on the box at `/workspace/tina-render-1080-2026-11-19/hybrid/<ID>-hybrid.mp4` (ESRGAN pass in `esrgan/`) (CRF 10, not in git,
reproducible with `tools/upscale_scene.py` then `tools/hybrid_scene.py`; sha256 in `site/public/media/scenes/manifest.json`).
Per-scene fidelity numbers: `qa/scenes-1080/REPORT.md`.

## 2. Site approach

Not one long site video. One video per scene, each driven by the single motion core:
- Real HTML text over the media (h1/h2, captions, links), so search engines and screen readers get the words and the copy
  stays editable. A single page-long video would hide every word from search, weigh 100+ MB, break on iOS Low Power Mode
  autoplay rules and make every copy change a re-render.
- Encodes per scene in `site/public/media/scenes/<ID>/`: `<ID>-1080.mp4` (H.264 High, yuv420p, faststart, no audio),
  `<ID>-1080.webm` (AV1), `<ID>-720.mp4` (small screens), `<ID>-poster.(webp|jpg)` = frame 0, `<ID>-end.(webp|jpg)` = last
  frame (reduced motion and no-JS). Scrubbed scenes (03B 06B 09B 11B) are encoded with a 6-frame GOP and no B-frames so
  `currentTime` seeks land fast in both directions; looped/played scenes (01A 10A 04B) use a 2 s GOP.
- Modes: `loop` (01A hero, 10A footer band: muted, playsinline, paused off screen), `scrub` (03B 06B 09B 11B:
  currentTime = progress x duration from a ScrollTrigger on the pinned section), `play` (04B: hover/focus forward, leave
  reverses to 0 over 0.4 s, touch plays once at 60% in view).
- Loading: poster is the LCP image (`fetchpriority=high` only on the hero), `preload="none"` + IntersectionObserver for
  every other scene, 720p source under 1000 css px wide or Save-Data, nothing loads for reduced motion.
- Code scenes (02A 05C 07C 08B) stay DOM/GSAP/Three on the same core, gated on choreography (timing table taken from the
  clip) plus keyframe visual review. A strict SSIM 0.92 against an AI-rendered clip is not reachable from real DOM photos,
  so that is flagged to Matt instead of being faked.
- Seams: already ported and PASS (012). Wire the remaining pairs as their scenes land.

## 3. Gates
- Video scenes: `build-plan-locked-2026-11-19/tools/scene_gate.py` (145 frames, seek to (i+0.5)/24, element screenshot vs
  clip frame i with object-fit cover crop, luma SSIM >= 0.92 and MAE <= 8 on every frame, master >= 1920 wide, duration
  6.04 s). Self-test: 1080 Lanczos of 01A PASS (worst 0.9878), the regenerated 01A FAIL (worst 0.40).
- Seams: `seam_gate.py` unchanged.
- Every step also: `npm run check`, production build, desktop 1440x900 + mobile 390x844 screenshots, reduced-motion pass.
