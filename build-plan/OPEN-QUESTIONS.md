# Build-plan open questions

Ambiguity is logged here and the build keeps going. A failed locked-motion gate is not an open question: it blocks advancing.

Logged 13 Nov 2026, America/Costa_Rica (UTC-6):

1. Scene 03B (followspot) is a provisional pick. Matt said we can change it later. Build 03B exactly as locked until he says otherwise.
2. More transitions may come later. Build the 11 scenes and 10 seams that are locked now. Do not wait.
3. Earlier exact-match rows were accepted as CLOSEST and now conflict with the 13 Nov "close does not count" rule. Do not change them in 011 unless Matt says so:
   - H10 (home Red Gown split): layout pose is a signed file; the build uses the unsigned gown-on-the-teal-truck frame (`fb_016`).
   - H11 (home footer band): the only plate with both the Walterdale arch and the skyline is daylight, darkened in CSS.
   - R7 (runway opening): no magenta-catwalk plate exists in `images/`; the build uses the darkest real runway frames (`fb_029`, `fb_012`).
4. Scene `clip.mp4` files were not copied into `motion-reference/` (they are large). Use the original paths under `concepts/motion-options-2026-11-12/` as listed in MOTION-LOCKED.md.
5. Root `OPEN-QUESTIONS.md` still has client questions for Matt (domain, brand name, services, hosting, and the rest). Those stay open. They do not block building what is already approved.

Logged 19 Nov 2026, while porting the locked seams. The seam runtime is on the routes where both scenes already exist. The others are not wired:

6. `03B-04B` (`site_route_real` `/`): home has the runway section (03B). It does not have the 04B work-hover scene. That scene is the work index. The seam is not inserted on `/`.
   Update 20 Nov 2026 (prompt 014): 03B is the followspot video on the home runway stage (`/`). 04B is still the work-index hover, a different route. The pair stays cross-route. The seam is still not inserted on `/`. The harness at `/motion-lab/seams/03B-04B/` is unchanged.
7. `05C-06B` (`site_route_real` `/work/`): `/work/` has the work entrance (05C) and the hover grid (04B). It does not have the 06B editorial split. That scene is `/fashion-editorial/`. The seam is not inserted on `/work/`.
   Update 20 Nov 2026 (prompt 016): 05C stays on `/work/`. 06B is the scrubbed crimson-thread video on `/fashion-editorial/`. The pair is still cross-route, so the seam is not inserted on either page. The harness at `/motion-lab/seams/05C-06B/` is unchanged.
8. `06B-07C` (`site_route_real` `/fashion-editorial/`): the editorial split (06B) is this page. The 07C print-stack series scene is not a section here. It lives at `/series/the-red-gown/`. The seam is not inserted.
   Update 20 Nov 2026 (prompt 016): 06B is on `/fashion-editorial/`. 07C is the print stack on every `/series/<slug>/` cover. The pair is still cross-route, so the seam is not inserted. The harness at `/motion-lab/seams/06B-07C/` is unchanged.
9. `07C-08B` (`site_route_real` `/series/the-red-gown/`): the series story (07C) is this page. The 08B ink-flood page transition is not a section on it. The seam is not inserted.
10. `08B-09B` (`site_route_real` `/about/`): the about parallax hero (09B) exists. The 08B ink-flood scene is not a section on `/about/`. The seam is not inserted.
11. `09B-10A` (`site_route_real` `/about/`): the about hero (09B) exists. The 10A blue-hour contact band is not a section on `/about/`. The home band and the site footer are separate. The seam is not inserted.
    Update 26 Nov 2026 (prompt 017): 09B is the full-bleed band under the editorial split on `/about/`. 10A is the home contact band and the site footer on every other page, including `/book/`. On `/about/` the portrait split, the behind-the-scenes row, and the places block sit between the 09B band and the footer, so the two scenes are not adjacent. The seam stays unwired. The harness at `/motion-lab/seams/09B-10A/` is unchanged.
12. `10A-11B` (`site_route_real` `/portraits/`): there is no `/portraits/` route. Portraits, bridal and couples live at `/portraits-bridal-couples/`. That page does not include the 10A contact band. The seam is not inserted.
