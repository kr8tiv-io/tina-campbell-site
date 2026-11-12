# Motion compare notes

Clip: `/workspace/tina-campbell/concepts/site-layouts/motion/03-webgl-hover-distortion.mp4`

Recording: `/workspace/tina-campbell/qa/004-work/motion/hover.mp4`

`hover.mp4` is `hover-raw.webm` trimmed with `ffmpeg -ss 2.20 -t 6.04`. The raw file includes page load. Contact (colour leaving the center tile) starts about 1.05s into the trim. The ripple then travels for 5s and is at full progress as the 6.04s take ends.

Look at every `frame-XX.jpg` and the contact sheet. Pixel match is not the test (Imagine clips have baked mock type and stand-in crops). Check:

- [x] Timing (when each move starts and ends)
- [x] Easing (ease weight, no linear pops unless the clip is linear)
- [x] Direction (up/down/left/right, what enters and what exits)
- [x] Pin behaviour (what stays pinned, when it releases)

Gaps and fixes:

- Timing. Frame 00: clip cursor is already on the left photo, no bubble yet. Our three heroes are still noir, View not on a tile yet. Frame 02: clip has a medium glass bubble on the center photo. Ours is just engaging the center tile. Frame 05: both have a large circular bubble on the center only, colour inside, neighbours still. Frame 11: both hold a full sphere. The clip cursor crosses the left photo about half a second earlier because our glide starts in the margin with `pointer-events: none`, so View appears only on contact. The 5s grow itself finishes with the take.
- Easing. `uProgress` runs linear over 5 seconds (`TRAVEL = 5`, GSAP ease `none`). The visible radius is `grow = 1 - pow(1 - p, 1.65)`, an ease-out, so the bubble covers ground early and the edge slows as it reaches the far corner. Colour fades in from grow 0.3 to 0.88. That matches the clip: a small bubble, then a fast swell, then a held sphere. No linear pop.
- Direction. The circle expands from the cursor point to the farthest corner of that tile. Only the hovered tile changes. On leave, the same travel runs backward. The functional test moves the pointer off the tile and waits until `data-ripple` is under 0.2. Reverse is not inside this 6s take. The take is the hover, matching the clip, which also does not show the leave.
- Pin. Left and right heroes, and the row below, stay still for all 12 frames. There is no scroll pin on this page. The clip bends the film strip once the sphere overflows. Ours clamps UV to 0..1, so the ripple cannot leave the tile. That clamp is required. The clip's overflow is not copied.
- End state. The clip does not flatten. Frame 11 is still a glass sphere, spilled past the film. Ours holds the full-tile bubble (colour flooded, thin red-cyan fringe on the rim) instead of settling to a flat colour photo. Written prompt text says "settle flat". The clip does not, and the clip is the motion reference. The held bubble is the match.
- Chromatic fringe. Shift is 0.012 UV on the outer rim only, so the edge reads red-cyan. An earlier wider split painted a rainbow across the whole bubble and was reduced.

No remaining drift on timing, easing, direction, or pin. The two intentional differences are the half-second cursor arrival and the tile clamp.
