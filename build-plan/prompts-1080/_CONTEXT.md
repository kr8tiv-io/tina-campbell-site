# Shared context for every 1080 scene prompt (prepended by driver-1080.sh)

Repo: /workspace/tina-seams-2026-11-19 (worktree, branch plan/locked-motion-2026-11-19). Work ONLY inside it.
Read once: `build-plan-locked-2026-11-19/SCENES-1080-PLAN.md`, `docs/design-system/MOTION-LOCKED.md`, the scene spec named in
your prompt (`build-plan-locked-2026-11-19/prompts/scenes/<ID>.md`) and its keyframe strip
(`build-plan-locked-2026-11-19/prompts/strips/scene-<ID>.jpg`). Motion truth is the FULL picked clip
`/workspace/tina-campbell/concepts/motion-options-2026-11-12/<scene>/<opt>/clip.mp4` (6.04 s, 24 fps). Never the 12 Nov layout
clips or EXACT-TARGETS.md (those predate the 13 Nov lock).

Runtime: ONE motion core. `site/src/scripts/motion/runtime.ts` registers GSAP plugins once; `core.ts` owns Lenis and init order;
`seams.ts` owns seams. Add scene code as `site/src/scripts/motion/scenes/<name>.ts` registered from core.ts, plus ONE shared
helper `site/src/scripts/motion/scene-video.ts` (created by prompt 013, reused by every later prompt; do not fork it).
Scene media is already encoded in `site/public/media/scenes/<ID>/` (see `manifest.json`). Do not re-encode or replace it.

Video scene contract (the gate depends on it):
- `<video data-scene-video="<ID>" muted playsinline preload="none|metadata" poster=...>` with sources AV1 webm then H.264 mp4;
  the helper picks 1080 vs 720 (720 when innerWidth < 1000 or Save-Data). Real HTML text sits on top, never baked in.
- `?record=1&gate=<ID>`: Lenis off, no autoplay, overlay copy + decorative layers marked `data-scene-overlay` hidden,
  media at its neutral transform (no zoom, no filter), force the 1080 source, then set `window.__SCENE_READY__[<ID>] = true`
  after `loadedmetadata`. Production behaviour must not change because of this hook.
- Reduced motion: no video download, show `<ID>-end.webp` as a still with the same crop; no pin, scrub or split.
- No JS: poster/end image visible, text readable.

Gates you must run and paste into `qa/<prompt-id>/REPORT.md` (PASS or FAIL only, close = FAIL):
```
cd site && npm run check && TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 > /tmp/preview-4821.log 2>&1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/scene_gate.py --base http://127.0.0.1:4821 --scenes <IDs> --out qa/<prompt-id>/scene-gate
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/<prompt-id>/seam-gate   # must stay 10/10
npm --prefix site run build    # production build: no motion-lab routes, noindex meta still present
```
Plus screenshots with Playwright (`/usr/bin/google-chrome`): desktop 1440x900 and mobile 390x844 (DPR 3) of every route you
touched, at scroll 0 and at each scene's start/middle/end, saved under `qa/<prompt-id>/shots/`. Also one reduced-motion shot.
Iterate on FAIL (read `diffs/` and `scores.json`) up to 3 fixes per scene, then record the exact blocker and stop.
Do NOT edit the gates, thresholds, gold frames, manifests, `motion-reference/`, `concepts/` or the encoded media.

Hard rules: no git add/commit/push/reset/checkout/stash/clean (the operator commits); leave the unstaged deletions under
`qa/**/build/` alone. Never create a folder named build, out or dist (Astro's own `site/dist` output is tolerated). No deploy,
no uploads, no network writes. Never run grok login/logout or read any auth file. Kill only processes you started (by pid; no
pkill/killall). Only Tina's real photos; no text baked into media; no AI disclaimer captions; no em dashes in user-facing copy.
Additive only: do not delete pages, sections or features. Tokens: ink #0C0C0F, paper #F0F3F4, crimson #B3261E.
Performance budget: hero LCP element is the poster image; no scene video requests before first interaction-free idle except
the hero; total JS added per prompt < 15 KB gzip.
For prompt 012b the gate commands in that prompt replace the scene_gate line.
Final line of your answer: `GATE <prompt-id>: PASS|FAIL` then one line per scene with worst SSIM.
