You are doing a short, read-only design fidelity review. Do not edit, create or delete any file except the single output file named below. Do not run git commands that change anything, do not deploy, do not push, do not contact anyone. Do not change authentication or read any auth file.

Project: Tina Campbell photography site (Astro + GSAP + Lenis + Three.js). Approved visual truth = Grok Imagine layouts and 6 motion clips. Tina's ticked favourites: Runway (dark cinematic, "like a fashion show at night", photos glowing on black, crimson buttons, sideways runway) and Editorial Split (text beside photos) most; also Bridge and Skyline, Film Strip, Noir and Crimson. She says fashion and editorial stand out most and she enjoys all styles. Copy must be live HTML (never baked into images), minimalist, normal speech, no em dashes.

Currently built (commit d466aa0, after prompt 002b): Home and 404 only. Other routes are not built yet (prompt 003 runway is in progress).

Open and LOOK at these images (view them; do not just read file names):
1. /workspace/tina-fidelity-audit-2026-11-12/audit/sheets/CONTACT-SHEET-home-404-loader.jpg  (left = approved layout crop, right = local build; my provisional verdict and note under each row)
2. /workspace/tina-fidelity-audit-2026-11-12/audit/sheets/CONTACT-SHEET-motion-home.jpg  (clip 01 frames vs build scroll frames)
3. /workspace/tina-fidelity-audit-2026-11-12/audit/sheets/home-1440-vs-pdf-p10.jpg  (PDF page Tina ticked vs build hero)
4. /workspace/tina-campbell/concepts/site-layouts/01-home-desktop-v2b.jpg and 11-home-mobile.jpg and 19-404-desktop.jpg (full layouts)
5. /workspace/tina-fidelity-audit-2026-11-12/audit/shots/home-1440-viewport.png, home-1440-sec1.png, home-1440-sec3.png, home-1440-sec4.png, home-390-sec0.png, 404.html-1440-viewport.png
6. /workspace/tina-fidelity-audit-2026-11-12/audit/sheets/clip-02-runway-pinned-horizontal.jpg (reference for the runway page and the home strip style)
Measured fact: at 1280x720 the Home runway section pins for about 600px of scroll while the track moves only 46px horizontally; at 1440 the 5th runway frame is clipped at the right edge (track 1493px wide).

Task: For each row (Header+hero, Runway strip, Statement+categories, Red Gown editorial split, Bridge+Skyline band, Mobile hero, Mobile runway, Mobile categories, 404, Loader, Home scroll motion vs clip 01) give your own verdict MATCH / DRIFT / MISSING and the concrete fix (CSS/layout/photo/motion level, specific numbers where you can). Say clearly where you disagree with my provisional verdicts. Then list the top 8 fixes in priority order, and anything I missed. Keep it under 900 words. Be blunt and specific.

Write your full answer verbatim to /workspace/tina-fidelity-audit-2026-11-12/audit/grok-review-verbatim.md and also print it as your final message.
