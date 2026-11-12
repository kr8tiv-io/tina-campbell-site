# Motion compare notes

Clip: `concepts/site-layouts/motion/04-editorial-split-reveal.mp4` (6.04s)

Recording: `qa/005-editorial/motion/04-editorial-split.webm` (trimmed to 6.04s from a 7.40s take)

Looked at `contact-sheet.jpg` and `frame-00` through `frame-11`.

- [x] Timing (when each move starts and ends)
- [x] Easing (ease weight, no linear pops unless the clip is linear)
- [x] Direction (up/down/left/right, what enters and what exits)
- [x] Pin behaviour (what stays pinned, when it releases)

## Frames

| Frame | Clip | Build |
| --- | --- | --- |
| 00 | Header only, logo beginning | Logo in, first headline line rising through the mask. A short beat ahead of the clip. |
| 01 | Logo and "Fashion" | Both lines in, second line still masked at the baseline. Same rise, slightly ahead. |
| 03 | Both lines and the lead. Index not in yet. | Lines, lead, and 01 just arriving. |
| 05 | Index through 02, photos starting to unmask from the top | Index through 03, photo mask just opening (a thin strip at the top of the column). |
| 07 | Full title, five rows, three photos | Same hold. Number 01 is crimson. |
| 09 to 11 | Hold | Hold. No second move. |

Direction matches the clip: headline lines rise inside a mask, lead fades, index rows tick down the list, the photo column unmasks with `clip-path` from `inset(0 0 100% 0)` to open. Easing is `power3.out` on the lines and `power2.inOut` on the unmask, not a linear pop.

The load clip does not scroll. The pin is the scroll after that. At 62% of the pin distance the left panel stays put, the track transform changes, and the active number moves to 02. The column keeps changing through the rest of the pin, so the pin is not a dead hold.

## Gaps

The second headline line leads the clip by a fraction of a second. The order of moves is the same, and frames 07 to 11 sit on the same hold, so the timeline was left on the measured clip beats (lines at 0.55s, rows at 2.0s, unmask at 2.7s).

On a 1280x720 frame the photo column is narrower than the letterboxed clip, so three full figures fit the height. The unmask direction and the three-up stack are the same.
