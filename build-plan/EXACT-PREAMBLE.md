# Exact-match preamble (read before every exact-match or later prompt)

Matt's instruction, Nov 12 2026: the Tina Campbell site must be built EXACTLY like the approved Grok Imagine layouts and the six approved motion clips, with every effect, timing, sizing and section in them, plus everything promised and every comment Tina wrote in her annotated PDF. He does not want a report. He wants the build to match.

Read, in this order: build-plan/EXACT-TARGETS.md (the measured numbers; this is your acceptance list), build-plan/VISUAL-TRUTH.md, build-plan/COPY.md, FEEDBACK-MAP.md, SECTIONS-INVENTORY.md, build-plan/SPEC.md. Baseline evidence of the current gaps: qa/exact-baseline-2026-11-12/ (replay-clipNN/CONTACT-clip-vs-build.jpg and sheets/). Look at those images first so you see what is wrong.

Rules that never change:
- Work only in /workspace/tina-campbell/site. Use only Tina's real photos from /workspace/tina-campbell/images (copy what you need into site/src/assets/photos). Look at every candidate photo before you pick it.
- All words are live HTML from COPY.md. Minimalist, classy, normal speech. No haiku, no em dashes, no en dashes. Never bake text into an image or video. Spell Tina's names, series and places exactly as the source files do.
- Tina's own baked watermark/signature stays untouched in her files; choose or crop frames so it is never across the subject or under a title.
- Keep every section her current site has (SECTIONS-INVENTORY.md) and the SEO journal plan.
- Design tokens: ink #0C0C0F, paper #F0F3F4, crimson #B3261E.
- Never deploy, never push, never touch Hostinger, never contact anyone. Do not run git push, reset --hard, clean, checkout main, switch, merge, rebase. Never run grok login/logout. Never kill processes you did not start. Never name a folder build, out or dist (Astro's existing site/dist output is fine).
- Reduced-motion and touch fallbacks stay as SPEC.md says. No horizontal overflow at 1440, 390, 360. No console errors. No broken images. `npm run build` must pass.

The gate (mandatory, this is what "done" means):
1. Build (`npm run build` in site), serve site/dist with `python3 -m http.server <free port 4800-4899>` in the background, and kill only that server when finished.
2. BEFORE changing code, run the baseline for your scope: `node /workspace/tina-campbell/build-plan/tools/exact-match/replay.mjs --clip <clipNN> --base http://localhost:<port> --out /workspace/tina-campbell/qa/<prompt-id>/exact/before-<clipNN>` and `node /workspace/tina-campbell/build-plan/tools/exact-match/capture.mjs http://localhost:<port> /workspace/tina-campbell/qa/<prompt-id>/exact/before-pages "<your routes>"`.
3. Fix every target in your scope.
4. Re-run both into `.../exact/after-<clipNN>` and `.../exact/after-pages`. Make contact sheets with `python3 /workspace/tina-campbell/build-plan/tools/exact-match/sheet.py`. Then compose side-by-sides of each section against its layout with `python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py` (viewport screenshots at each section, not only full-page shots).
5. Open EVERY `pair-XXX.jpg` (clip left, build right, same timestamp) and every layout side-by-side, frame by frame. For each target ID in scope write a row in `qa/<prompt-id>/exact/CHECKLIST.md`: ID, target, measured build value (use DOM measurements via Playwright where the target is a size or position), PASS/FAIL, what you changed.
6. Loop 3 to 5 until every in-scope row is PASS. If a row truly cannot pass with her real photos, mark it CLOSEST, name the frame you used and why, and keep going.
7. Final message: the checklist summary and the paths to `after-*/CONTACT-clip-vs-build.jpg` and the side-by-sides. Then `git add -A && git commit` with the commit message given (do not push).

If Grok Imagine, a tool or an install fails, say exactly what failed and stop; do not switch methods silently.
