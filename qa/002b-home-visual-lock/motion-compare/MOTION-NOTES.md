# Motion compare notes

Clip: `concepts/site-layouts/motion/01-lenis-scroll-home.mp4` (6.04s)

Recording: `qa/002b-home-visual-lock/motion/01-home-scroll.webm` (7.08s, 1280x720)

Pixel match is not the test. The clip uses a night grade and mock crops. The build uses `fb_141_signature` and live HTML.

## Clip 01

- [x] Timing. Frames 00 to 04 hold the hero with the name already in. Frame 05 is the exit: the name and photo move up together and The Runway enters from the bottom. Frames 10 to 11 hold The Runway in the centre. Frame 08 is one sample early: the build has eased into the pin while the clip still shows a sliver of the hero. Direction is the same.
- [x] Easing. Lenis duration 1.1s on the ticker, lag smoothing off. The rise eases out. It does not pop.
- [x] Direction. Hero exits up. The Runway rises. The name SplitText rises on load (chars, masked lines) before the scroll hold.
- [x] Pin. Once The Runway reaches the centre it stays there through the end of the take. It does not scroll away.

Ken Burns is a load scale from 1.08 to 1. Scroll adds a small lag on the photo (y and a slight scale) so the name leaves with the frame, a little faster. Statement words scrub on the next scroll, past the end of this 6 second clip. Reduced motion shows them without the scrub.

## Clip 02, lighter Home form

See `motion-compare/runway/`. Clip 02 is the full curved sprocket runway. Home is the lighter form from prompt 002: five 4:5 frames, a brief centre pin, a short leftward scrub, velocity skew up to 4 degrees, and a clip-reveal. It is not the curved WebGL strip.

- [x] Direction. The row moves left. Frame 01 crops off and frame 05 opens.
- [x] Pin. The section stays centred while the scrub runs.
- [x] The travel is short on purpose so five frames still read. The full-page still (ScrollTrigger cleared) shows five equal frames, which is layout 01.

Footer parallax is a light nod to clip 06: the skyline moves less than the arch. It is not the About hero.
