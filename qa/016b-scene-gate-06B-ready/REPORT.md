# 016b scene gate 06B ready

Verdict: **FAIL**. Production scrub and hover are intact. The combined scene gate still does not mark 06B ready inside 30s after 01A, 03B, and 04B have been screenshotted in the same Chrome.

## What changed

- Gate mode does not move the 04B or 06B media element. `html.is-gate-04B` / `html.is-gate-06B` already pin the video fixed. The fashion split pin is skipped only when `gate=06B`, so ScrollTrigger cannot reparent an ancestor after `load()`.
- Production 04B hover still floats the video onto `document.body` so the header (z-index 30) stays above it (video z-index 6). If that move leaves `readyState === 0`, it calls `load()` once and resumes play.
- `scene-video.ts` arms one idle kick: if a video that was asked to load is still `readyState 0` and `NETWORK_IDLE` after 1.5s, it calls `load()` once. The timer is cleared on `loadedmetadata` and on abort. No source rebuild.
- A client-side return to `/fashion-editorial/` restores `fe-intro` and `has-thread`. The head script that sets them does not re-run after a swap, so the pin was not mounting on the second visit.

Client chunk `BaseLayout.astro_astro_type_script_index_0_lang.lxPl3S51.js`: 72.81 kB, gzip 21.15 kB. The prompt's addition is well under 15 kB gzip. 05C and 07C were not touched. Media, gates, gold, and tests were not edited.

## Production check, build, Playwright

```
cd site && npm run check && npm run build && npx playwright test
```

`tsc --noEmit` passed. Production build: 20 pages (no motion-lab routes). Playwright: **42 passed, 18 skipped, 0 failed** (6.5m).

## Combined scene gate

Run once on the motion-lab preview (`http://127.0.0.1:4821`), bundle hash `BD6uB5dp` for the gate path (the later `fe-intro` restore does not change a full gate load: the head script already sets those classes, and gate mode still returns before creating the pin). The run failed, so it was not repeated.

```
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes 01A,03B,04B,06B --out qa/016b-scene-gate-06B-ready/scene-gate
```

```
01A PASS worst=0.9748 (frame 95) mean=0.9773 bad=0/145 []
03B PASS worst=0.9613 (frame 83) mean=0.9693 bad=0/145 []
04B PASS worst=0.9256 (frame 1) mean=0.9322 bad=0/145 []
06B FAIL worst=0.0 (frame -1) mean=0 bad=0/0 ['capture error: Page.wait_for_function: Timeout 30000ms exceeded.']
VERDICT: FAIL
```

04B stays in the tile and still passes. Worst SSIM 0.9256 is above 0.92, with less margin than the old body-mounted 0.9531.

### Blocker

Same Chrome, order `01A,03B,04B,06B`. 01A, 03B, and 04B each decode and screenshot all 145 frames. 06B then never sets `__SCENE_READY__['06B']` inside the gate's 30s wait.

A follow-up probe used that same warmup. 06B `goto` returned in 0.76s (`networkidle` succeeded). The next CDP evaluate did not return for more than 5 minutes. During that stall the headless GPU process was at about 349% CPU. When the same Chrome is only seek-warmed, metadata can arrive inside 30s. The screenshot warmup is what freezes resource selection. The 1.5s idle kick cannot run while the renderer is frozen, and a second `load()` cannot make metadata arrive inside the gate window.

Earlier attempts on this scene, already spent:

1. No reparent, pin still on, one `load()` if already idle: 06B ready timeout 30s.
2. Skip the pin and rebuild `<source>` nodes on the kick: 06B `goto` timeout 60s (the rebuild held the connection open).
3. Skip the pin, defer attach 1.2s, plain `load()` kick: 06B ready timeout 30s.

Stopped there. `scene_gate.py` and the Chrome flags it launches with were not changed.

## Seams

```
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/seam-gate
```

10/10 PASS. `VERDICT: PASS`. `SEAM_GATE_EXIT:0`.

```
python3 build-plan-locked-2026-11-19/tools/seam_route_check.py --base http://127.0.0.1:4821
```

3/3 PASS (`01A-02A`, `02A-03B`, `04B-05C`). `VERDICT: PASS`. `ROUTE_CHECK_EXIT:0`.

```
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/route-visual
```

3/3 PASS. `VERDICT: PASS`. `ROUTE_VIS_EXIT:0`.

```
python3 build-plan-locked-2026-11-19/tools/seam_route_visual.py --base http://127.0.0.1:4821 --out qa/016b-scene-gate-06B-ready/route-visual-mobile --mobile
```

3/3 PASS. `VERDICT: PASS`. `ROUTE_MOBILE_EXIT:0`.

## One tab, no record flag

Desktop 1440x900, one browser context: `/` then `/work/` then `/fashion-editorial/` then `/series/the-red-gown/` then `/fashion-editorial/`.

06B `currentTime` at pin progress 0, 0.50, and 0.98:

| Visit | start | middle | end |
|---|---|---|---|
| first | 0 | 3.040 | 5.964 |
| second (client swap from the series page) | 0 | 3.040 | 5.964 |

Both visits move. Shots of the start frame are black and white. Shots of the end frame are the crimson grade. The header click from `/work/` to Fashion timed out once, so that hop was a same-tab full load. The return from `/series/the-red-gown/` was a client transition, `fe-intro` and `has-thread` were present, and the times still moved.

04B real mouse hover on `/work/`: `currentTime` 1.09 then 3.21, `paused` false, floating over the tile (`overlapsTile` true). `elementFromPoint` on the header hit the header link, not the video.

Reduced motion, `/fashion-editorial/`: still is `06B-end.webp`, video `display: none`, zero sources, no `.webm` or `.mp4` request. Title text is readable.

## Shots

`qa/016b-scene-gate-06B-ready/shots/`. Desktop 1440x900 and mobile 390x844 at DPR 3, plus `reduced-fashion-scroll-0.png`. Scroll 0 and scene start, middle, and end for home (01A, 03B), `/work/` (04B), and `/fashion-editorial/` (06B). Log: `shots/log.json`.

Preview on port 4821 was stopped. Playwright and the gates were not run at the same time.

Suggested commit (not created): `fix(scene-video): no reparent after load; idle-load kick so 06B is ready in a warm Chrome`
