# Build prompts (run in order by build-plan/driver.sh)

001-foundation · 002-home · 002b-home-visual-lock · 003-runway · 002c-fidelity-fixes (runs after 003; file-name sort puts it before 004) · 004-work · 005-editorial · 006-about · 007-services-book · 008-journal-seo · 009-transitions · 010-qa

Imagine-first rule: pages without an approved layout (journal article, 404 already have 17–19) get a Grok Imagine layout first (concepts/site-layouts/20-* onwards, motion 07-* onwards) before their prompt runs. Do not invent a layout.

Visual truth: `VISUAL-TRUTH.md`. Layouts and the six motion clips are primary; PDF frames in `context/` confirm Runway + Editorial. Every remaining prompt has a side-by-side screenshot gate (local build vs layout and vs the named PDF concept) and a frame-by-frame motion gate against the matching clip.

002 was already in flight when the visual lock was added, so 002b is the correction pass: replace the temporary Home hero, match layout 01-home-desktop-v2b and the Runway look, and land the first official side-by-sides in `qa/002b-home-visual-lock/compare/`.


2026-11-12 fidelity audit: `FIDELITY-AUDIT-2026-11-12.md` (contact sheets in `fidelity-audit-2026-11-12/`). Its fixes are prompt `002c-fidelity-fixes`, which the driver picks up after 003-runway because it is the first not-done prompt in sort order. Prompts 004 to 010 now end with a "Fidelity check before finishing" section (layout, clip frames, Tina's input).

2026-11-12 3:15-3:34 PM (UTC-6) exact-match pass (Matt: "make it exactly like that"): measured targets in `EXACT-TARGETS.md`, shared rules and gate in `EXACT-PREAMBLE.md`, replay/capture tools in `tools/exact-match/`, baseline evidence in `qa/exact-baseline-2026-11-12/`. New fix prompts 002d-home-exact, 003b-runway-exact, 004b-work-exact, 005b-editorial-exact run after 005 (first not-done in sort order); 006-010 gained an "Exact-match targets" section. Runner is now `driver-exact.sh` (xhigh, no push, no deploy, independent verify + Grok review after every step that queues `<step>-fixN.md`, max 3 rounds). Do not restart the old `driver.sh`: it pushes to origin main after every step.

2026-11-12 4:07 PM (UTC-6): 006-010 "Exact-match targets" sections rewritten with measured numbers (clip 06 pin and layer speeds, clip 05 end state, layouts 07/08/09/10/13/15/17/18 sizes); EXACT-TARGETS.md gained A1-A10, V1-V5, B1-B4, J1-J5, T1b/T4. The exact driver runs them after 005b in sort order, with its independent verify + auto fix prompts (max 3 rounds per step).

2026-11-13 (UTC-6): Matt locked the 11 scene picks and 10 GSAP section seams. Binding spec: `../docs/design-system/MOTION-LOCKED.md`. In-repo prototypes: `../motion-reference/`. Strict gate: `tools/motion-gate.py` (PASS or FAIL only; close does not count). Queued prompt `011-locked-motion` runs after 010 on `driver-exact.sh` (KR8TIV, xhigh, no push, no deploy). Ambiguity is logged in `OPEN-QUESTIONS.md` and does not block the build; a failed motion gate still blocks advancing and staging.
