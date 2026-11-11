# Motion spec: Tina Campbell (TCPhoto)
Stack: Astro (static pages + ClientRouter view transitions), GSAP 3 (ScrollTrigger, Flip, SplitText, DrawSVG, Observer; all free since GSAP 3.13), Lenis (smooth scroll on gsap.ticker), Three.js (one shared WebGL canvas for image planes, lazy-loaded after a capability check), Node (build, sharp image pipeline, ffmpeg for loops).
Rules: photos are never degraded (full-res textures, effects around the image, not baked in). Transform and opacity only outside WebGL. Every effect has a prefers-reduced-motion path (static, fades only) and a touch path (no hover, swipe instead). Budget: LCP image under 200 KB AVIF, JS under 120 KB gz before Three.js, Three.js only on pages that use it.
Feedback source for each decision: ../FEEDBACK-MAP.md.

## Global
| Moment | What moves | Library |
|---|---|---|
| Loader (first visit only) | TCPhoto brush mark draws stroke by stroke in white, slashing T last, mono counter, crimson line fills; then the mark shrinks into the header slot (Flip) as the hero fades up | GSAP DrawSVG + Flip, one timeline with the hero (Hanenkamp pattern) |
| Smooth scroll | Weighty, 1.1s ease, snap only inside pinned galleries | Lenis synced to gsap.ticker; ScrollTrigger.update on Lenis scroll |
| Cursor | Small crimson dot; becomes a 64px crimson circle reading "View" / "Drag" over photos | GSAP quickTo |
| Page transition | Clicked tile grows into the next page's hero (shared element); everything else advances off like film frames with a crimson wipe edge | Astro ClientRouter + GSAP Flip; fallback fade |
| Headlines | Serif lines rise out of masks, 80 ms stagger | GSAP SplitText (mask: "lines") + ScrollTrigger |
| Images entering | clip-path inset reveal from bottom, inner image counter-scales 1.15 -> 1 | GSAP + ScrollTrigger |
| Scroll velocity | Photo frames skew up to 4 deg and stretch slightly with scroll speed, spring back at rest | ScrollTrigger.getVelocity + quickTo |
| Header | Hides on scroll down, returns on scroll up; Book a shoot pill stays | ScrollTrigger |

## Pages
1. **Home** (Runway base). Hero: lamp-post photo with slow Ken Burns and grain; name splits in on load. Runway: section pins, vertical scroll drives the strip sideways (ScrollTrigger pin + scrub + containerAnimation), frames bend in WebGL as they pass centre (Three.js planes, Landberg curve), crimson progress rail. Statement "Edmonton is my runway." word-by-word scrub. Contact sheet band: six film frames, hover plays a 2 s muted loop of that category; click Flips to the category. Editorial teaser: split panel, photo parallax inside its mask. Footer: Bridge/Skyline 3-layer parallax.
2. **Work index** (Noir and Crimson). Grid fades in staggered. Photos rendered B&W in a shader with a crimson-preserving mask (only red stays red); hover runs displacement-map transition to full colour (Codrops hover-effect). Filter change: GSAP Flip reflow. Click: Flip tile -> series hero.
3. **Fashion & Editorial** (Editorial Split). Left panel pinned; right column scrolls; series index highlights the active series in crimson as each enters (ScrollTrigger toggleClass). Pull quote SplitText. Collab CTA with magnetic button.
4. **Series story**. Cover: title mask reveal over full-bleed photo, photo scales 1.1 -> 1 on scroll. Credits fade in by line. Spreads: clip-path reveals alternating left/right. Next series: footer image grows into the next cover (Flip + view transition).
5. **Portraits, Bridal and Couples**. Three chapters, each pinned briefly; the chapter photo crossfades through 3 frames as you scroll (scrub). Warm, slower easing.
6. **Runway gallery**. Full horizontal catwalk: drag or scroll (Observer + Lenis), WebGL planes on a gentle curve, centre frame sharp and lit, side frames dimmer; motion blur scales with drag speed (shader uniform); timecode counter ticks.
7. **About** (Bridge and Skyline). Hero is 3 layers (skyline, bridge arch, Tina) with name between layers; scroll moves layers at 0.2 / 0.5 / 1.0 speed, optional depth-map shader for pointer parallax (Three.js). BTS film strip drifts sideways with scroll. Location cards tilt toward pointer.
8. **Services**. Large numbered rows; hovering a row floats its thumbnail beside the cursor with velocity-curved distortion (Codrops 2019). Steps draw a hairline across as you scroll. FAQ accordion with height tween.
9. **Journal**. Film-strip list; rows slide in like frames advancing; featured post letterbox bars open on enter (clip-path).
10. **Contact / Book**. Bridge at blue hour, slow drift; form fields underline in crimson on focus; session chips pop with spring; on send, the TCPhoto mark signs itself as the success state.

## Mobile
No WebGL hover. Runway becomes a native swipe strip with scroll-snap and a crimson progress bar; sticky "Book a shoot" bar; parallax reduced to two layers; page transitions are a crimson wipe.

## Motion ideas taken from video prompts
Grok Imagine video prompts (see concepts/site-layouts/motion/VIDEO-PROMPTS.md) are written as camera moves; each maps to one implementable effect: "dolly along the catwalk" = pinned horizontal Runway, "rack focus" = centre frame sharp / sides blurred, "push in through the frame" = tile -> hero Flip, "parallax crane up past the bridge" = About layers, "ink bleeding into colour" = noir -> colour hover.
