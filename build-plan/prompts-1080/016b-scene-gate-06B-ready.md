---
id: 016b-scene-gate-06B-ready
title: 06B becomes ready reliably (combined scene gate passes in one Chrome)
kind: build
effort: xhigh
model: grok-4.7
depends_on: [016-scene-editorial-06B-07C]
---
## Why
016 is otherwise good (operator re-checked: 06B scrubs b/w to crimson on the real `/fashion-editorial/` route, 07C
timeline 0 frames off, seams 10/10, route visual 3/3 + 3/3). But the required combined gate
`scene_gate.py --scenes 01A,03B,04B,06B` FAILS: 06B never sets `__SCENE_READY__['06B']`. Order `06B,01A,03B,04B` PASSES.
Operator debug dump at the timeout (same Chrome, after 01A/03B/04B):
```
cls: "js fe-intro has-thread has-cursor loader-skip is-scene-gate is-gate-06B"
video 06B: readyState 0, networkState 1 (NETWORK_IDLE), error null, preload "auto", parent BODY,
currentSrc /media/scenes/06B/06B-1080.webm, sources [webm, mp4]
```
So the source was selected and then loading went idle and never resumed. Most likely cause: a race between
`scene-video.ts` (`attachSources()` calls `video.load()`) and `scenes/editorial-thread.ts`, which in gate mode does
`document.body.appendChild(video)` AFTER the load started. Removing a media element from the document pauses it and can
leave a pending load suspended; whether it races depends on timing (warm Chrome = slower/faster init), which matches the
order dependence. `scenes/work-ink.ts` reparents 04B the same way. A real visitor's long session could hit the same stall,
so fix it in the site, not in the gate tool.

## Must haves
1. No media element is reparented after its sources are attached / `load()` is called. Preferred: do not move the gate
   video at all; the gate CSS (`html.is-gate-06B` / `html.is-gate-04B`) already makes it `position: fixed; inset: 0`.
   If a move is truly needed, move it before `initSceneVideos` attaches sources, or call `video.load()` again right after
   the move when `readyState === 0`.
2. Defensive kick in `scene-video.ts` (shared helper, all modes): if a video that should be loading (preload auto, or the
   scrub/loop/play path has asked for it) sits at `readyState 0` and `networkState === NETWORK_IDLE` for 1.5 s, call
   `load()` once more. Keep it cheap and cleaned up on abort.
3. Do not change media files, scene_gate.py, seam tools, gold, or tests. Do not change 05C/07C timelines.
4. 04B hover on `/work/` (real mouse) still plays in its tile with the header above it; 06B real-route scrub still goes
   b/w to crimson.

## Verification (paste into qa/016b-scene-gate-06B-ready/REPORT.md)
```
cd site && npm run check && npm run build && npx playwright test      # 42+ passed, 0 failed
TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes 01A,03B,04B,06B --out qa/016b-scene-gate-06B-ready/scene-gate   # PASS, run it TWICE, both PASS
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/seam-gate   # 10/10
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821                                   # 3/3
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/route-visual
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/route-visual-mobile --mobile
```
Also: in ONE browser tab, navigate `/` -> `/work/` -> `/fashion-editorial/` -> `/series/the-red-gown/` -> `/fashion-editorial/`
(no record flag), scroll the fashion pin each time and log the 06B `currentTime` at 3 scroll points; it must move.
Stop any preview you start. Do not run playwright and the gates at the same time (the box is shared; parallel load makes
one editorial test flaky).

## Non-goals
New scenes, the phone hero (020), copy.

## Commit message
fix(scene-video): no reparent after load; idle-load kick so 06B is ready in a warm Chrome

Final line: `GATE 016b: PASS|FAIL`.
