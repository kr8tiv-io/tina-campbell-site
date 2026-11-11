# Motion references for Tina Campbell's site
All URLs checked from the box on Nov 11, 2026 (HTTP 200 unless noted). "Steal" = the exact move we borrow and where it lands.

## Award-winning photographer portfolios (the bar)
| # | Reference | What it does | Steal |
|---|---|---|---|
| 1 | Paul & Henriette (Awwwards SOTD 7.56, Aristide Benoist + Ben Mingo) https://www.awwwards.com/sites/paul-henriette | Fashion photography duo, black and white UI, irregular image grid, WebGL/GLSL transitions, minimal menu | Irregular grid that Flips into a slideshow: Work index -> series |
| 2 | Axel Vanhessche (Awwwards SOTD) https://www.awwwards.com/sites/axel-vanhessche | Paris portrait photographer. Featured elements: layer page reveal, draw-to-reveal, horizontal page, drag to explore, scroll animation with depth map | Layered page reveal for page transitions; depth-map parallax for the About bridge hero |
| 3 | Ottografie 2025 (Awwwards SOTD) https://www.awwwards.com/sites/ottografie-2025 | Beauty and fashion photographer. Project header, category gallery, dynamic navigation UI | Category gallery + dynamic nav that shrinks to the TCPhoto mark on scroll |
| 4 | Jonathan Alpeyrie (Awwwards HM) https://www.awwwards.com/sites/jonathan-alpeyrie-photographer | Black background, horizontal scroll reportage, horizontal menu animation, sticky scroll | Pinned horizontal story on the Runway page |
| 5 | Ruud Luijten Photography (Awwwards SOTD) https://www.awwwards.com/sites/ruud-luijten-photography | GSAP + Nuxt; project page and project navigation transitions | "Next series" footer that morphs into the next cover |
| 6 | Mathijs Hanenkamp case study (Awwwards HM 2026) https://www.hontran.dev/blog/mathijs-hanenkamp-photography-portfolio-case-study | Loader, cover wipe and first image as ONE GSAP timeline; Three.js fluid displacement between shots at full texture resolution; transform/opacity-only hovers | Loader -> hero choreography (signature draw then lamp-post hero); "never degrade the photo" rule |
| 7 | Jesper Landberg (Awwwards SOTD + Developer Award, Sep 2026) https://dokle.design/awards/jesper-landberg-curved-panels-webgl-portfolio | One Three.js room, work on curved panels sliding sideways, infinite carousel, project sheet opens over the running scene | Curved-panel catwalk: Runway strip frames bend slightly in WebGL as they pass centre |

## Techniques and tutorials (how we build it)
| # | Reference | Technique | Used on |
|---|---|---|---|
| 8 | Codrops, WebGL Distortion Hover Effects https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/ + lib https://github.com/robin-dela/hover-effect | Displacement-map transition between two images (Three.js + GSAP) | Noir -> colour hover on Work grid (B&W texture to colour texture through a brush-stroke displacement map) |
| 9 | Codrops, Motion hover effects with image distortion (Three.js) https://tympanus.net/codrops/2019/10/21/how-to-create-motion-hover-effects-with-image-distortions-using-three-js/ | Velocity-curved plane following the cursor, RGB displacement, image trail | Services list: hovering a row floats its thumbnail, bending with cursor speed |
| 10 | Codrops, Animate WebGL shaders with GSAP: ripples, reveals, blur (2025) https://tympanus.net/codrops/2025/10/08/how-to-animate-webgl-shaders-with-gsap-ripples-reveals-and-dynamic-blur-effects/ | GSAP tweening shader uniforms, Observer pointer, mask reveals, scroll/drag blur | Runway strip ripple on hover, motion blur tied to drag speed |
| 11 | Codrops, Seamless infinite scroll with GSAP + Lenis (May 2026) https://tympanus.net/codrops/2026/05/28/the-never-ending-story-building-a-seamless-infinite-scroll-experience-with-gsap-lenis/ | Lenis infinite + snap, gsap.ticker sync, ScrollTrigger parallax | Global Lenis setup; Journal loop |
| 12 | Bricksmotion Velocity Gallery https://bricksmotion.co/component/velocity-gallery-1/ | Frames lean and stretch with scroll velocity, spring back, reduced-motion fallback | Scroll-velocity skew on the Home runway and Fashion column |
| 13 | Codrops, Grid to slideshow switch (Flip, inspired by Paul & Henriette) https://tympanus.net/codrops/2023/05/04/ideas-for-grid-to-slideshow-switch-animations/ | GSAP Flip layout switch | Work grid -> fullscreen viewer |
| 14 | Codrops, Scroll-based layout animations https://tympanus.net/codrops/2023/07/20/scroll-based-layout-animations/ | Pinned section + Flip changes layout while scrolling | Home "contact sheet" band expanding to full frame |
| 15 | Codrops, Federico Pian portfolio case study https://tympanus.net/codrops/2024/10/02/case-study-federico-pian-portfolio-2024/ | Route-aware page transitions with Flip state carried across pages; full keyboard nav | Tile -> series hero transition across Astro pages |
| 16 | Codrops, SplitText to MorphSVG demos (free GSAP plugins) https://tympanus.net/codrops/2025/05/14/from-splittext-to-morphsvg-5-creative-demos-using-free-gsap-plugins/ | SplitText masked line reveals, DrawSVG, MorphSVG | Editorial headlines; TCPhoto signature drawn stroke by stroke (DrawSVG) |
| 17 | GitHub anurag-rai/portfolio-website https://github.com/anurag-rai/portfolio-website | Astro + GSAP ScrollTrigger + Lenis on gsap.ticker + lazy Three.js after WebGL check; preloader waits for scene | Our project skeleton pattern |
| 18 | GitHub floating-astronaut/astro-portfolio-template https://github.com/floating-astronaut/astro-portfolio-template | Astro 7, Lenis, scroll-scrubbed video with phone-specific encode, reduced-motion poster | Scroll-scrubbed hero film option + mobile encode recipe |

## Libraries and showcases
- Lenis https://lenis.darkroom.engineering/ (smooth scroll, snap)
- GSAP showcase https://gsap.com/showcase/ and Flip docs https://gsap.com/docs/v3/Plugins/Flip/
- Three.js examples https://threejs.org/examples/
- Astro view transitions https://docs.astro.build/en/guides/view-transitions/
- Awwwards photography collection https://www.awwwards.com/websites/photography/ , FWA https://thefwa.com/ , CSSDA https://www.cssdesignawards.com/
- Not verified: godly.website (returned HTTP 500 from the box), CodePen nmoreira "gsap horizontal scroll with parallax + lenis" https://codepen.io/nmoreira/pen/KKBMgZN (403 to curl, bot block; content read through search).
