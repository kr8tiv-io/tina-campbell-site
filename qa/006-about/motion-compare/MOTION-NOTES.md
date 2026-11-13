# Motion notes, clip 06

Clip: `concepts/site-layouts/motion/06-about-bridge-parallax.mp4` (1280x720, about 6s).
Recording: `qa/006-about/motion/hero-scroll.mp4`, trimmed to 6.000s of the scroll (lead-in 1.101s removed). Scroll 0 to 360px, linear, via `__tcMotion.scrollTo`.
Compared with `compare-motion.py --frames 12`. Contact sheet and frame-00 through frame-11 were opened. Replay pairs at t=0, t=3 and t=6 were opened (`exact/after-clip06/pair-000.jpg`, `pair-012.jpg`, `pair-024.jpg`).

| Check | Result |
| --- | --- |
| Timing | Figure is low at frame 00, mid at frame 06, and the head is leaving the top at frame 11. Same relative height as the clip at t=0, 3s and 6s. |
| Easing | Linear scrub (`scrub: true`, `ease: 'none'`). No ease-in or ease-out pop. |
| Direction | Figure translates up and scales 1.0 to 1.12. Sky, arch and title stay within the caps (measured at 1440: sky -3px, arch -8px, title -4px, figure y -135px at the end of a 450px pin). |
| Pin | Hero stays pinned for the first half viewport (360px at 720, 450px at 900). At pin+40 the hero y is -40, so the pin has released and the page scrolls. The figure keeps moving for the whole pin. Not a dead pin. |
| Opacity | No opacity change on any layer. The ghost double exposure in the clip is a video artefact and is not reproduced. |
| Reverse | Scrub is scroll-linked. Scrolling back returns the layers. The release measurement shows the hero leaving only after the pin distance. |
| Reduced motion | Transforms are `none`. At 225px of scroll the hero has moved to y -225. No pin. |
| Touch | No pin at max-width 900px. The figure rises at 0.3x the scroll. The background does not. |

No timing, easing, direction or pin drift that needs another record. The header hides on scroll the same way it does on the rest of the site (002d). That is not a hero-layer move.
