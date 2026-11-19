# CORE.md / AGENTS.md: Tina Campbell locked motion (shared context, load once)

Repo: /workspace/tina-seams-2026-11-19 (branch plan/locked-motion-2026-11-19, off merge/best-of-2026-11-18). Astro 5, GSAP 3.15.1, Lenis, Three.
Spec: docs/design-system/MOTION-LOCKED.md (binding). Picks: concepts/motion-options-2026-11-12/PICKS.md (locked 13 Nov 2026).
Motion truth = the FULL picked videos, never stills:
- scenes: concepts/motion-options-2026-11-12/<scene>/<opt>/clip.mp4 (6.04 s, 24 fps, 1280x720; laptop copy Desktop\Tina-Context-Kit\videos\PICKED)
- seams: motion-reference/12-seam-transitions/<pair>/<opt>/clip.mp4 (+ index.html prototype, _shared/boot.js)

Runtime: one module only. site/src/scripts/motion/core.ts owns gsap, ScrollTrigger, SplitText, Lenis and the Three renderer.
Seams live in site/src/scripts/motion/seams.ts (boot.js port), wired by data-seam="<pair>". Scenes register through core.ts too.
Ease cine = cubic-bezier(0.22,1,0.36,1). Pin: [data-track], top top to bottom bottom, scrub 0.6, pin [data-stage], anticipatePin 1.
Tokens: ink #0C0C0F, paper #F0F3F4, crimson #B3261E. Fonts: Instrument Serif, Inter Tight, JetBrains Mono.

Gates (PASS or FAIL only, close = FAIL):
- seams: build-plan-locked-2026-11-19/tools/seam_gate.py, 101 frames, SSIM >= 0.92 and MAE <= 8 every frame + exact tween table.
- scenes: sample the site scene and the picked clip at the same 24 fps timeline; SSIM >= 0.92 per frame on the full 6.04 s.
Reduced motion: no pin, scrub, split or mask; show the end state. Readable without JS.

Rules: Grok Build KR8TIV login only, xhigh, one heavy job at a time, never login/logout or open auth files. No push, deploy or main.
No folder named build/out/dist. Only Tina's real photos; no words baked into media; no em dashes in copy. Additive only.
