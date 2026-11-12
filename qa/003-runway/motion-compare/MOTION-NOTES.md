# Motion compare notes

Clip: `concepts/site-layouts/motion/02-runway-pinned-horizontal.mp4`

Recording: `qa/003-runway/motion/02-runway-pinned.webm` (1280x720, 6.04s, trimmed to the gesture)

Look at every `frame-XX.jpg` and the contact sheet. Pixel match is not the test (Imagine clips have baked mock type and stand-in crops). Check:

- [x] Timing (when each move starts and ends)
- [x] Easing (ease weight, no linear pops unless the clip is linear)
- [x] Direction (up/down/left/right, what enters and what exits)
- [x] Pin behaviour (what stays pinned, when it releases)

The clip moves the film from right to left, about two frame widths. It eases in, cruises, and eases out by about 3.75s, then holds through 6.04s. Header, title, and logo stay put.

The build drives that same curve with ScrollTrigger scrub (ease none) and an immediate scroll, so Lenis does not ease the gesture a second time. A tracked centre photo moves left from the first sample, is almost finished at 3.0s (98% of the travel, clip 96%), and does not move from 3.5s through 5.5s. The first half-second is a little ahead of the clip's very slow ease-in (about 16% of the travel versus 7%). By 1.5s it is 60% versus 54%. The settle and the hold match. Direction is right to left. This two-frame gesture stays inside the pin. Scrolling the full pin and back reverses the strip. That reverse is a functional check. The clip itself does not reverse.

The Imagine clip freezes the crimson dot for the whole clip. The generation locked the chrome in place. The build moves the dot along the rail, from the left third toward the middle, across those two frame widths, then holds it there. That is the live progress rail. The header stays pinned on both.

Desktop drag uses GSAP Observer. Reduced motion and a coarse pointer use the CSS scroll-snap strip instead of the pin.

No unresolved choreography drift.
