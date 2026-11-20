---
id: 014-scene-runway-03B
title: Home runway band gets the 03B followspot scrubbed video
kind: build
effort: xhigh
model: grok-4.7
depends_on: [013-scene-hero-01A]
---
## Goal
Scene 03B B-followspot on `/` runway band: noir stage, followspot enters left, lands on the red gown, that frame floods to
colour, scrubbed by scroll on the pinned section (forward and reverse). Existing runway WebGL strip stays untouched; the
video is the stage the band opens on, then hands over to the strip.

## Timing table
| t (s) | frame | what |
|---|---|---|
| 0.3-1.5 | 7-36 | spot enters from left with haze beam |
| 1.0-3.0 | 24-72 | strongest motion, spot glides to centre |
| ~2.5 | 60 | spot lands on red gown |
| 3.5 | 84 | gown frame fully colour, rest noir |
| 3.5-6.04 | 84-144 | eases, near still |

## Must haves
- Mode scrub via `scene-video.ts`, pinned per core pin rules (`[data-track]` top top to bottom bottom, scrub 0.6, pin
  `[data-stage]`, anticipatePin 1), progress 0..1 maps to currentTime 0..6.0 s; reverse scroll rewinds smoothly.
- "The Runway" heading and frame captions are HTML over the video, `data-scene-overlay` on decorative layers only.
- Wire seam 02A-03B into the new stage (it must still PASS) and log 03B-04B status in OPEN-QUESTIONS (cross-route).
## Files
site/src/pages/index.astro, site/src/scripts/motion/scenes/runway-followspot.ts (new), runway.ts (hook only), home.css.
## Non-goals
Changing the runway WebGL strip, hero, other routes.
## Verification
`_CONTEXT.md` gates `--scenes 01A,03B`; seam gate 10/10; scroll forward and back screenshots at progress 0, .25, .5, .75, 1.
## Commit message
feat(scene-03B): runway followspot video scrubbed by the pinned runway stage
