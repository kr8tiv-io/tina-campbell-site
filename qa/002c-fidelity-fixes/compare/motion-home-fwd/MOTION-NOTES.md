# Motion compare notes

Clip: `concepts/site-layouts/motion/01-lenis-scroll-home.mp4`

Recording: `qa/002c-fidelity-fixes/motion/home-fwd.mp4` (1280x720 scroll, forward)

- [x] Timing. The name is already large, then grows over the first half of the hero while the photo lifts. The flat five-frame strip rises in next. The statement follows. Same order as the clip.
- [x] Easing. Title scale and photo lift are scrubbed to scroll (`progress / 0.5`), so they track the scroll in both directions. The runway rise is a short scrub as the section enters, not a timed tween.
- [x] Direction. Photo moves up. Title scales up from the bottom centre. The strip moves up into place. Nothing travels sideways on Home.
- [x] Pin behaviour. Home has no pin. The dead pin from the audit is gone. Five frames stay inside the content width.

Gaps and fixes:

- Imagine frames 02 to 05 are generated night-runway plates. The build uses the closest real photos, logged in `compare/NOTES.md`. Frame 04 stands in for the magenta-stage black gown, which is not in `images/`.
- Reverse recording (`motion/home-rev.mp4`) scrolls back to the hero. The title transform returns to identity.
