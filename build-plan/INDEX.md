# Build prompts (run in order by build-plan/driver.sh)

001-foundation · 002-home · 002b-home-visual-lock · 003-runway · 004-work · 005-editorial · 006-about · 007-services-book · 008-journal-seo · 009-transitions · 010-qa

Imagine-first rule: pages without an approved layout (journal article, 404 already have 17–19) get a Grok Imagine layout first (concepts/site-layouts/20-* onwards, motion 07-* onwards) before their prompt runs. Do not invent a layout.

Visual truth: `VISUAL-TRUTH.md`. Layouts and the six motion clips are primary; PDF frames in `context/` confirm Runway + Editorial. Every remaining prompt has a side-by-side screenshot gate (local build vs layout and vs the named PDF concept) and a frame-by-frame motion gate against the matching clip.

002 was already in flight when the visual lock was added, so 002b is the correction pass: replace the temporary Home hero, match layout 01-home-desktop-v2b and the Runway look, and land the first official side-by-sides in `qa/002b-home-visual-lock/compare/`.
