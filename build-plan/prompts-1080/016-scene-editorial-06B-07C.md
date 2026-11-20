---
id: 016-scene-editorial-06B-07C
title: Editorial split 06B crimson thread (video) and series 07C print stack (code)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [015-scene-work-04B-05C]
---
## Goal
`/fashion-editorial/`: 06B video scrubbed by the pinned split; a DOM DrawSVG crimson hairline synced to the same progress so
the line leads the colour (red bleeds into the gown only, 1.0-5.5 s). `/series/<slug>/` cover: 07C print stack in GSAP (top
print slides up-left, strongest 1.0-2.0 s, next print straightens and sharpens to centre, settle by 5.5 s with drift), one
step per scroll through the series' real photos.
## Must haves
06B via `scene-video.ts` scrub; hairline y = progress x height, drawn above the video, `data-scene-overlay`. 07C timeline
exported as `window.__SCENE_TL__['07C']`, timing within 2 frames, keyframe side-by-sides. Wire seams 05C-06B and 06B-07C
only if both scenes are on the same route; otherwise update OPEN-QUESTIONS. Seams stay 10/10.
## Verification
gates `--scenes 01A,03B,04B,06B`; screenshots of /fashion-editorial/ and /series/the-red-gown/.
## Commit message
feat(scene-06B-07C): editorial crimson thread scrub and series print stack
