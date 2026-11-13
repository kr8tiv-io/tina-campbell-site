---
id: 011-locked-motion
title: Implement locked scenes and 10 GSAP section seams, then pass the strict motion gate
kind: build
effort: xhigh
model: grok-4.7
---
Read first: /workspace/tina-campbell/docs/design-system/MOTION-LOCKED.md, /workspace/tina-campbell/motion-reference/README.md, /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md (including the 13 Nov locked motion gate section), /workspace/tina-campbell/build-plan/EXACT-TARGETS.md (L1-L11, S01-S10, G-RM, G-GATE), /workspace/tina-campbell/build-plan/OPEN-QUESTIONS.md, /workspace/tina-campbell/build-plan/VISUAL-TRUTH.md, /workspace/tina-campbell/build-plan/COPY.md, /workspace/tina-campbell/FEEDBACK-MAP.md, /workspace/tina-campbell/SECTIONS-INVENTORY.md. Work in /workspace/tina-campbell/site (Astro). Follow the locked motion spec exactly. Primary truth for this step is MOTION-LOCKED.md and the in-repo prototypes under /workspace/tina-campbell/motion-reference/ (each chosen `index.html`, `_shared/boot.js`, and gold `clip.mp4`). Open every prototype with `?play=1` or read the HTML plus the matching function in `_shared/boot.js` all the way through before writing code. Use only real photos from /workspace/tina-campbell/images. Scene moving references that were not copied live at the original clip paths listed in MOTION-LOCKED.md. All text is live HTML from COPY.md; never bake words into images or video. No em dashes and no en dashes in any copy. Run `npm run build` and fix all errors before finishing. Never push, never deploy, never name a folder build, out, or dist (Astro's existing site/dist is fine). Never run grok login/logout. Never kill processes you did not start.

Matt's instruction, 13 Nov 2026: these are the exact animations and transitions; adhere to them perfectly. Close does not count. It has to be perfect. Build what is locked now. More transitions may come later; do not wait. Questions do not block the build: log any ambiguity to /workspace/tina-campbell/build-plan/OPEN-QUESTIONS.md and keep going, then fix after. A failed motion gate still blocks this step.

## Goal
Implement all 11 locked scene motions (L1-L11) and all 10 locked section-to-section GSAP seams (S01-S10) in the live site so they match the locked prototypes 1:1: same pin, scrub, durations, eases, masks or clip-paths, SplitText, layering, and colours. Then pass the strict motion gate.

## Must haves
- Port the locked seam functions from `motion-reference/12-seam-transitions/_shared/boot.js` (`t_01A_02A_A`, `t_02A_03B_C`, `t_03B_04B_A`, `t_04B_05C_C`, `t_05C_06B_A`, `t_06B_07C_C`, `t_07C_08B_C`, `t_08B_09B_C`, `t_09B_10A_B`, `t_10A_11B_B`) and the matching markup (ink layers, magenta flood, loupe SVG, thread path, magazine rotateY, city iris layers, footer band, chapter lift). Do not invent a different choreography.
- Shared pin on each seam: ScrollTrigger trigger on the track, start `top top`, end `bottom bottom`, `scrub: 0.6`, pin the stage, `anticipatePin: 1`, default ease `cine` `(0.22, 1, 0.36, 1)`, default duration 1, SplitText `{ type: "chars,words,lines", mask: "chars" }`. Header stays put. Nav `aria-current` swaps at progress 0.55 where the prototypes do.
- Every seam root has `data-seam="<pair>"` (for example `data-seam="01A-02A"`). Expose `window.__PROTO_READY__`, `window.__START_RECORD__`, `window.__PROTO_DONE__`, and `window.__PROTO_TL__` on pages that contain seams, with the same record hook as boot.js: hold 0.6 s, scroll duration 5.2 s, ease none, tail 0.85 s, viewport 1440x810.
- Scene motions match the locked clips: 01A living-gown, 02A film-gate-advance, 03B followspot (provisional; build it as locked), 04B crimson-ink-drop, 05C light-table-drop, 06B crimson-thread, 07C print-stack, 08B ink-flood, 09B blue-hour-lights, 10A blue-hour-drift, 11B veil-wipe.
- Reduced motion (G-RM): no pin, no scrub, no SplitText staggers, no masks or floods. Show the incoming section, or a 200 ms crossfade. Content readable without JavaScript.
- Preserve approved layout and earlier exact-match work (headers, type sizes, routes, copy, Flip tile-to-cover from 009 / clip 05 when that prompt has landed). Do not restyle H10, H11, or R7 photo choices.
- Tokens stay ink `#0C0C0F`, paper `#F0F3F4`, crimson `#B3261E`.

## Motion gate (mandatory, this is what "done" means)
1. `npm run build` in `site`. Serve `site/dist` with `python3 -m http.server <free port 4800-4899>` in the background, and kill only that server when finished.
2. Run `python3 /workspace/tina-campbell/build-plan/tools/motion-gate.py --base http://127.0.0.1:<port> --out /workspace/tina-campbell/qa/011-locked-motion/gate --clean-out`.
3. Open `qa/011-locked-motion/gate/REPORT.md` and every worst-frame diff. Write `qa/011-locked-motion/exact/CHECKLIST.md` with one row per L1-L11, S01-S10, G-RM, G-GATE. Verdicts are only PASS or FAIL. CLOSEST, ACCEPTABLE, and PARTIAL are FAIL.
4. Loop until the gate last line is `VERDICT: PASS` and every checklist row is PASS. If a question comes up, log it in `build-plan/OPEN-QUESTIONS.md` and keep going. If the gate is FAIL, this step is not done; do not treat it as success.
5. Also confirm no horizontal overflow at 1440, 390, 360; no console errors; no broken images; reduced-motion path works.

## Commit
feat(motion): lock 11 scenes and 10 GSAP seams to the approved prototypes

Do not push. Do not deploy. If the motion gate is FAIL, do not present the step as done.
