# Visual compare notes

Primary reference: `concepts/site-layouts/06-runway-gallery-desktop-v2.jpg`.
Direction: `build-plan/context/pdf-p10-runway.jpg` (the runway page Tina ticked) and `pdf-p15-film-strip.jpg`.
Shots are the viewport, not a full-page capture. A full-page shot would include the ScrollTrigger pin spacer and squash the film.

## Desktop 1440

Close match to the Imagine layout.

- Ink field, paper type, crimson rail, crimson Book pill.
- Title is Instrument Serif. Live copy is "Runway" and "Edmonton fashion shows" from COPY.md. The layout line "Edmonton Fashion Week" is mock type and is not used.
- The rail sits under the subtitle. At rest the dot is on the left third, about 36vw.
- The film sits just under the rail (about 13px at 1440x900). Centre frames are the tallest. The edge tops sit only slightly lower, the same dip fraction as the layout.
- Sprocket bands follow that curve. The centre frame is the blue feather look (fb_064), with the red gown to its right. Those are Tina's real frames in the layout's hero pairing.
- The hint "Scroll to walk the runway" is live HTML.

Accepted differences:

- Outer frames have a mild keystone. The film is one continuous ribbon so the sprockets stay connected. Separate rectangles turned the band into stairs.
- The two middle frames are a little less wide than the mock, which draws them much wider than their neighbours. Height, arch, and placement match the measured layout.

## PDF

p10 is the dark cinematic runway spread. Same family: black field, crimson, a strip of runway photographs. It is a concept page, not a pixel template.
p15 is the film-strip device. Same sprocket language and horizontal catwalk.

## 390 and 360

No mobile Imagine layout was named. These viewports use the coarse-pointer fallback: a native horizontal scroll-snap strip with the same ink, type, rail, and sprocket bands. The blue hero is centred. The hint is "Swipe to walk the runway". Composites against the desktop layout and the PDF pages are family checks only.

## Reduced motion

At 1440 the page is the CSS strip. The canvas stays hidden. Horizontal scroll moves. The centre frame scales up. Copy and the rail stay.

## Checks

Playwright used the cached Chromium at `chromium-1243` (1248 is not installed on this machine). Viewports 1440x900, 390x844, and 360x780, plus reduced motion. No horizontal overflow, no broken images, no console errors. Scrolling the pin changes the strip transform and scrolling back reverses it. The header stays visible. No long task over 200ms during the desktop scroll. The film and the words are in the HTML, so the strip is visible without JavaScript.
