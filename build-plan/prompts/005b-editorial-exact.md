---
id: 005b-editorial-exact
title: Fashion and Editorial, series and Portraits/Bridal/Couples exact match (layouts 03 v2, 04 v3, 05 v2, 12 v2; clip 04)
kind: fix
effort: xhigh
model: grok-4.7
---
Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate.

Scope: /fashion-editorial/ (E1-E7), /series/<slug>/ for every series (S1-S5), /portraits-bridal-couples/ (P1-P2), and the in-panel mark (G5) in EXACT-TARGETS.md. Clip: clip04 (`concepts/site-layouts/motion/04-editorial-split-reveal.mp4`). Layouts: `03-fashion-editorial-desktop-v2.jpg`, `04-series-story-desktop-v3.jpg`, `12-series-mobile-v2.jpg`, `05-portraits-bridal-desktop-v2.jpg`. PDF: `build-plan/context/pdf-p14-editorial-split.jpg` (Tina: "I like this one"; "I really like the editorial for pages and how it looks on display, with text"; "fashion & editorial stand out most"). Baseline: `qa/exact-baseline-2026-11-12/replay-clip04/`, `sheets/clip04-key.jpg`, `sheets/fe-1440-2col.jpg`, `sheets/series-a.jpg`, `sheets/pbc-a.jpg`, `sheets/fe-390-r.jpg`.

Measured fixes required:
1. Split (E1): text panel 0-50%, crimson hairline divider at 50%, photo column 56-91% (~500 px wide at 1440) with three stacked photos each about a third of the viewport tall, 8 px gaps. Today the divider sits at ~76% and the photos are a thin strip at the far right.
2. Title (E2): "& Editorial" line ~41% of viewport width (~185 px font at 1440). In-panel TCPhoto mark ~200 px wide with its true aspect ratio (G5; it is stretched today).
3. Series list (E3): mono, "02  Legislature in Black" ~32% of viewport width, active number crimson, toggled as each series enters.
4. Load-in (E4): keep and verify the clip 04 timing from page load: 0-0.5 s black, title 0.5-1.25 s, subtitle 1.0-1.6 s, divider drawn top-down by 1.0 s, list stagger 2.0-3.75 s, photo column unmasks top-down 2.75-4.25 s. Replay clip04 and line up every pair.
5. Quote band (E5): four tall ~1:2 portraits across 25-100% beside the quote.
6. Mobile (E7): text first (mark, title, subtitle, list), then photos; check 390 and 360.
7. Series cover (S1): title top-left over the dark side of a full-bleed photo, ~150 px serif at 1440, mono "Series NN / Edmonton / YYYY" under it (real data). Story block (S3) text left ~40%, tall portrait right with a soft glow. Spreads (S4): a 2-up landscape row, then a full-width ~2.4:1 cinematic frame. Watermarks (S2): no frame with her signature across the subject or under a title; look at every candidate and swap.
8. Portraits, Bridal and Couples (P1-P2): one-line page title ~93% width (~115 px at 1440); each chapter: "Ch. 0N" mono above, photo left ~49% width (~4:3), heading ~85 px serif with a hairline rule under, body, "See the gallery" mono crimson. Keep the chapter pin/crossfade motion from MOTION-SPEC.

Verification: replay clip04 before and after; capture the three page types at 1440 and 390; side-by-sides vs layouts 03 v2, 04 v3, 12 v2, 05 v2 and PDF p14. Every E, S, P and G5 row PASS in qa/005b-editorial-exact/exact/CHECKLIST.md. site/tests must pass.

Commit: fix(editorial): exact match to layouts 03/04/05 and clip 04 (50/50 split, big title, mono list, cover title, clean frames)
