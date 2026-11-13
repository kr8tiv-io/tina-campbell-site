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
