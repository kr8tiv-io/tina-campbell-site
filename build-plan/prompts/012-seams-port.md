# 012 seams port (locked transitions) — Tina Campbell site

Repo: /workspace/tina-seams-2026-11-19 (git worktree, branch plan/locked-motion-2026-11-19, off merge/best-of-2026-11-18). Work ONLY inside this folder.

## Goal
Port the locked seam runtime `motion-reference/12-seam-transitions/_shared/boot.js` ONCE as TypeScript at
`site/src/scripts/motion/seams.ts`, wired by `data-seam="<pair>"` attributes, using ONE shared GSAP/ScrollTrigger/Lenis/Three
module (extend or factor out of `site/src/scripts/motion/core.ts`; do not create a second Lenis or a second ScrollTrigger registration;
Three stays in the existing webgl modules, import from the same shared module, do not add a new Three instance for seams).
All 10 seams must PASS the locked seam gate (Luma SSIM >= 0.92 AND MAE <= 8 on EVERY one of 101 frames across the full
timeline, plus an exact tween timing table). Close does not count.

Binding spec: `docs/design-system/MOTION-LOCKED.md` (seam section) and the 10 prototypes
`motion-reference/12-seam-transitions/<pair>/<option>/index.html` (picks listed in `build-plan/tools/motion-gate-seams.json`).
Port the `t_<pair>_<opt>` functions, markup, classes, chrome.css rules, masks (`_shared/masks/*.svg`), custom ease `cine`
(0.22,1,0.36,1), timeline defaults, pin config (`[data-track]`, start "top top", end "bottom bottom", scrub 0.6, pin `[data-stage]`,
anticipatePin 1), SplitText config, nav aria-current swap at 0.55, and the record hooks exactly. Do not change any timing, ease,
stagger, from/to value, layering or mask. Use npm `gsap` 3.15.1 (same version as the prototype, includes SplitText/DrawSVG/CustomEase/ScrollToPlugin).

## Deliverables
1. `site/src/scripts/motion/seams.ts`: the single port. Exports `initSeams(root)` that finds every `[data-seam]`, builds the
   locked timeline for that pair and returns a cleanup. Exposes on window, for the gate: `ScrollTrigger` (global),
   `__PROTO_TL__`, `__PROTO_READY__`, `__START_RECORD__` (0.6 s hold, scroll to max over 5.2 s ease none, 0.85 s tail),
   same as boot.js. When `?record=1` is present, Lenis smoothing must not interfere (native scroll, ScrollTrigger.update()).
   `prefers-reduced-motion: reduce`: no pin/scrub/split/masks; show incoming section only (see MOTION-LOCKED.md).
2. A shared seam component, e.g. `site/src/components/motion/Seam.astro`, producing the prototype markup with `data-seam`.
3. Gate harness pages `site/src/pages/motion-lab/seams/[id].astro` -> `/motion-lab/seams/<id>/` for all 10 ids. They must
   render pixel-identical to the prototype at 1440x810 (same chrome.css header, grain, fonts, media files, copy). Copy the
   media the prototypes reference into `site/public/motion-lab/` (do not hotlink motion-reference). Harness pages:
   `<meta name="robots" content="noindex,nofollow">`, excluded from the sitemap, and only generated when env `TC_MOTION_LAB=1`
   (getStaticPaths returns [] otherwise) so the production build never ships them.
4. Wire `data-seam` into the real routes where both scenes already exist (home: 01A-02A, 02A-03B, 03B-04B; work: 04B-05C ...;
   see `site_route_real` in the manifest) via the same component and module. Additive only: do not delete existing sections,
   pages or features. If a real-route scene does not exist yet, log it in `build-plan/OPEN-QUESTIONS.md` and continue.

## Verify (must run, paste results into qa/012-seams/REPORT.md)
```
cd site && npm run check && TC_MOTION_LAB=1 npm run build && (npx astro preview --port 4821 --host 127.0.0.1 &) ; cd ..
python3 build-plan-locked-2026-11-19/tools/seam_gate.py --base http://127.0.0.1:4821 --out qa/012-seams/gate
npm --prefix site run build   # production build without TC_MOTION_LAB: confirm dist has no motion-lab folder
```
Iterate on any FAIL by reading `qa/012-seams/gate/<id>/diffs/` and `scores.json` until all 10 PASS, or until you have tried
3 fixes on a seam; then record the exact blocker for that seam. Do NOT edit the gate, its thresholds, the gold frames
(`build-plan-locked-2026-11-19/.gold`), the manifest, or anything in `motion-reference/`. Stop the preview server you started
(kill only its own pid) when done.

## Hard rules
- Do not run git add/commit/push/reset/checkout/switch/merge/rebase/clean/stash. The operator commits. Leave the existing
  unstaged deletions under qa/**/build/ alone.
- Never create a folder named build, out or dist (Astro's own site/dist output is fine).
- No deploy, no network uploads, no hostinger/sftp. Never run grok login/logout or read any auth file.
- Never kill or signal any process you did not start. No pkill/killall.
- Only Tina's real photos; no new images, no text baked into media. Tokens: ink #0C0C0F, paper #F0F3F4, crimson #B3261E.
- No em dashes in any new user-facing copy.
Final line of your answer: `SEAMS: <n>/10 PASS` followed by the per-seam worst SSIM.
