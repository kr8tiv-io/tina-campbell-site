# Home visual lock

Primary reference: `concepts/site-layouts/01-home-desktop-v2b.jpg`. PDF Concept A Runway (`pdf-p10-runway.jpg`) confirms the family: ink, photos on black, crimson, a sideways row of frames. Film Strip, Editorial Split, and Bridge and Skyline are the category band, Red Gown teaser, and footer.

The local full page is taller than layout 01 because the live site footer sits under the skyline band. `compare-visual.py` fits both panels to one height, so the local panel looks more compressed. Section order and the 1440 viewport shots are the check.

## What matches

- Hero is full-bleed `fb_141_signature`. Huge white serif TINA CAMPBELL in the lower third, mono caption, thin crimson rule, Scroll. The real frame is daylight. The mock is a night grade of the same pose.
- The Runway is five tall 4:5 frames, mono 01 to 05, a thin crimson rule, and "See all fashion work".
- Statement is "Edmonton is my runway." with the location sub line.
- Categories are a six-frame film strip (sprocket holes) linking to `/work/?filter=`.
- The Red Gown is an editorial split: ink text on the left, `fb_116_signature` on the right, crop showing the gown and the truck hood.
- Footer band is dusk skyline (`fb_168_city`) plus the Walterdale arch (`fb_066_city`), "Let's make something bold.", a crimson Book a shoot pill, and a modest TCPhoto mark.
- Mobile (390 and 360): full-height hero, stacked name, sticky crimson Book a shoot that hides when the footer band is in view, runway as a horizontal snap with a crimson progress bar, categories as a vertical list.

## Real-photo limits

There is no black-gown-under-magenta-runway frame in `images/`, and no red ballgown in snow. Frame 02 is the red two-piece in snow (`fb_009_fashion`). Frame 04 is the closest runway-night frame (`fb_064_runway`, blue stage light). Frame 05 is the leather editorial (`fb_011_fashion`). The arch photo already contains a baked TCPHOTO watermark. It was not edited.

Settled full-page screenshots clear ScrollTrigger so the pin spacer and the statement scrub do not leave a black hole. The live page still scrubs.
