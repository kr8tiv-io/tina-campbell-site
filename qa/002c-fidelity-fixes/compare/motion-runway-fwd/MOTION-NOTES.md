# Motion compare notes

Clip: `concepts/site-layouts/motion/02-runway-pinned-horizontal.mp4`

Recording: `qa/002c-fidelity-fixes/motion/runway-fwd.mp4` (1440x900, pin forward)

- [x] Timing. The strip is pinned and walks sideways for the whole pin. The rail dot travels with it.
- [x] Easing. Scrubbed to scroll, so the walk matches scroll position forward and back.
- [x] Direction. Frames move left as scroll increases, the same way as the clip. The curve stays concave, centre brighter than the edges, sprocket bands above and below.
- [x] Pin behaviour. Pin length equals horizontal travel. At 1440, `data-pin-distance` and `data-travel-px` are both 795. `invalidateOnRefresh` recomputes the end on refresh.

Gaps and fixes:

- The live sub line is "Edmonton fashion shows" (COPY.md). The clip bakes "Edmonton Fashion Week".
- Real photos are mall-lit. The clip's magenta stage is a generated grade.
- Reverse recording returns the strip and the rail dot to the start.
