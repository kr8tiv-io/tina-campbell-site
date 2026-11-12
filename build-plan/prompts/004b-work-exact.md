---
id: 004b-work-exact
title: Work index exact match to layouts 02 v3 / 16 v3 and clip 03
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope: /work/ (targets W1-W8 in EXACT-TARGETS.md) and the site-wide cursor. Clip: clip03 (`concepts/site-layouts/motion/03-webgl-hover-distortion.mp4`). Layouts: `concepts/site-layouts/02-work-index-desktop-v3.jpg` (grid) and `16-motion-hover-distortion-v3.jpg` (hover state). PDF: `build-plan/context/pdf-p18-noir-crimson.jpg` (Tina: "I like this one"). Baseline: `qa/exact-baseline-2026-11-12/replay-clip03/`, `sheets/clip03-key.jpg`, `sheets/work-a.jpg`, `sheets/work-hover-crop.jpg`.

Measured fixes required:
1. Noir grade (W1): deep, contrasty B&W like layout 02 v3 (true blacks, grey skies, no blown whites); only reds stay red. Tune the shader's luminance curve; compare tiles against the layout with zone luma.
2. Type (W2): filter row and frame count in mono, active filter white with a crimson underline; the count is the real number of frames.
3. Captions (W3): replace the grey placeholder bars with live mono captions (series or category name) from data. The bars in the mock stand for text; never render them as decoration.
4. Grid mix (W4): masonry with portrait and landscape tiles; every style near the top (fashion, bridal, couples, Edmonton bridge or city, runway), as layout 02 v3 shows.
5. Hover ripple (W5): concentric circular rings centred exactly on the pointer (check the uv maths; today the lens starts at the tile edge), first ring at 0.33 s after enter, radius ~120 px at 2 s and ~200 px at 4 s at 1280 in the clip, ring spacing ~18 px, slight chromatic edge, the subject at the centre stays recognisable, and the ripple may spill past the tile edge over the border like clip 03. On the site keep the clip's look and order at a faster pace: ripple 0-1.0 s, colour flood 1.0-1.6 s (W6). Verify the look with `replay.mjs --clip clip03 --timescale 4` so the slowed site lines up with the clip frame by frame, and at normal speed.
6. Leave (W7): rings collapse and the tile is back to clean B&W with zero residual warp within 0.6 s.
7. Cursor (W8): 64 px crimson filled disc with white "View" centred on the pointer over photos (and "Drag" on the runway strip), GSAP quickTo, fine pointers only.

Verification: replay clip03 before and after (normal and timescale 4), capture /work/ at 1440 and 390, side-by-side grid vs layout 02 v3 and hover frame vs layout 16 v3 and PDF p18. Every W row PASS in qa/004b-work-exact/exact/CHECKLIST.md. site/tests must pass.

Commit: fix(work): exact match to clip 03 and layout 02 v3 (noir grade, cursor-centred ripple, colour after ripple, live captions, View disc)
