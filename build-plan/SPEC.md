# Build spec: tinacampbell site (Astro), built exactly from the approved layouts and motion clips
Repo: kr8tiv-io/tina-campbell-site. Site source lives in `site/` (Astro project). Approved visuals: `concepts/site-layouts/` (best picks listed below) and motion clips `concepts/site-layouts/motion/01..06*.mp4` (watch them: extract frames with ffmpeg to understand timing). Feedback: `FEEDBACK-MAP.md`. Content map: `SECTIONS-INVENTORY.md`. All live text: `build-plan/COPY.md` (use it verbatim; never bake text into images/video).

## Stack (no other frameworks)
Astro 5 (static output, `astro:assets` for AVIF/WebP + responsive srcset, ClientRouter view transitions), TypeScript, plain CSS with custom properties (no Tailwind), GSAP 3.13+ (ScrollTrigger, SplitText, Flip, Observer; all free in the `gsap` npm package), Lenis, Three.js (lazy-loaded, only on pages that use WebGL, after a WebGL capability check). Node 24 available. Playwright browsers are cached in ~/.cache/ms-playwright (use @playwright/test matching chromium-1248 if possible; do not download new browsers unless necessary). Keep installs small (disk is tight).

## Design tokens
ink #0C0C0F (background), paper #F0F3F4 (text), graphite #302F33, rule rgba(240,243,244,.14), crimson #B3261E (the ONLY accent; buttons, active states, progress lines), muted text #9A9AA2. Display serif: "Instrument Serif" (self-host via @fontsource or woff2 in /public/fonts). UI grotesk: "Inter Tight". Mono captions: "JetBrains Mono" or "IBM Plex Mono". Film grain overlay (tiny tiled noise PNG/SVG, opacity .05). Hairline rules. Pill buttons. Max content width 1440, generous margins (clamp 20px to 64px).

## Logo
Her brush mark: `brand/tcphoto-logo-white-transparent.png` (and black version). For the signature loader, trace it to SVG (e.g. `potrace` npm package or `imagetracerjs`, small installs) into `site/src/assets/brand/tcphoto.svg`; never redraw as a font. Header logo uses the PNG/SVG at ~44px tall.

## Photos
Real photos only from `images/` (see `images/MANIFEST.csv` for category + subject). Copy the ones used into `site/src/assets/photos/` keeping names. Category mapping: signature+fashion -> Fashion & Editorial; runway -> Runway; portrait -> Portraits; bridal -> Bridal; couples -> Couples; city+landscape -> Edmonton; instagram-recent -> mixed (check subject). One typed data module `site/src/data/photos.ts` (file, category, series, alt text written from MANIFEST subject, location, orientation). Series: The Red Gown (fb_013, fb_016, fb_116, fb_114 + any red-gown fashion), Legislature in Black (fb_046, fb_141, ig_profile_02, ig_profile_03), Red in Snow (fb_009, fb_034, fb_133, fb_136), Runway Nights (runway files), Blue Hour/City (fb_001, fb_066, fb_168, fb_072, fb_008). Verify each by looking at the image before assigning. Never use Imagine mockup images as site content.

## Pages (route -> layout image to match -> motion clip)
| Route | Layout | Motion |
|---|---|---|
| / | 01-home-desktop-v2b.jpg, mobile 11-home-mobile.jpg | clip 01 (Lenis scroll + reveals), loader 14, runway strip (clip 02 style, smaller) |
| /work/ | 02-work-index-desktop-v3.jpg | clip 03 (Three.js ripple hover, B&W where reds stay red), GSAP Flip filtering, clip 05 tile-to-cover |
| /fashion-editorial/ | 03-fashion-editorial-desktop-v2.jpg | clip 04 (SplitText lines + clip-path unmask, pinned left panel) |
| /series/[slug]/ | 04-series-story-desktop-v3.jpg, mobile 12-series-mobile-v2.jpg | clip 04 reveals; cover receives clip 05 Flip |
| /portraits-bridal-couples/ | 05-portraits-bridal-desktop-v2.jpg | reveals |
| /runway/ | 06-runway-gallery-desktop-v2.jpg | clip 02 (pinned ScrollTrigger, vertical -> horizontal, Three.js curved panels) |
| /about/ | 07-about-desktop-v3-clean.jpg, mobile 13-about-mobile-v3.jpg | clip 06 done properly: separated layers moving at different speeds |
| /services/ | 08-services-desktop-v2b.jpg | hover thumbnail follow, reveals |
| /journal/ + /journal/[slug]/ | 09-journal-desktop-v2b.jpg | film-strip row reveals |
| /book/ | 10-contact-book-desktop.jpg | reveals |
| 404 | ink page, logo, link home | none |
Global: signature loader (layout 14) first visit only (sessionStorage), film-strip page transition (layout 15 / clip 05), crimson dot cursor with "View" on photos (desktop, fine pointer only), header hide on scroll down / show on up, footer on every page (logo, nav, Instagram + Facebook, "Site by KR8TIV").

## Motion rules
Lenis on gsap.ticker (`lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.lagSmoothing(0)`); destroy and re-init all ScrollTriggers/Lenis/Three scenes on `astro:before-swap` / `astro:page-load`. Transform/opacity only outside WebGL. Every effect must work scrolling forward and backward. `prefers-reduced-motion: reduce` -> no Lenis, no pin/scrub/WebGL, simple opacity fades, all content visible. Touch / coarse pointer -> no hover effects, runway becomes native horizontal swipe with scroll-snap and crimson progress bar. No JS -> all content visible (progressive enhancement: hide-for-animation classes only added by JS). Target 60fps: DPR cap 1.5 for WebGL, pause rendering when off-screen (IntersectionObserver), textures sized to display.

## Performance + accessibility
LCP hero image eager + fetchpriority high, others lazy. AVIF + WebP via astro:assets with widths [480, 800, 1200, 1600, 2000]. JS budget before Three.js < 120 KB gz. Semantic landmarks, skip link, focus-visible states in crimson, alt text on every photo, color contrast AA for text, keyboard reachable menus and galleries, aria-live for form status.

## SEO
Site name "Tina Campbell Photography". Title pattern "{Page} | Tina Campbell Photography, Edmonton". Meta descriptions per page (from COPY.md), canonical, Open Graph + Twitter image per page (her photos, 1200x630 generated at build with astro:assets/sharp), JSON-LD: `ProfessionalService`+`LocalBusiness` (Photographer) with areaServed Edmonton, St. Albert, Fort Saskatchewan, Alberta, sameAs Instagram + Facebook; `Person` (Tina Campbell); `Article` + `BreadcrumbList` on journal posts; `ImageGallery` on galleries. @astrojs/sitemap. robots.txt. Site URL from env `SITE_URL` (default the staging URL https://lightsteelblue-lark-427091.hostingersite.com).
STAGING NOINDEX (until Matt approves launch): env `PUBLIC_NOINDEX=true` (default true) adds `<meta name="robots" content="noindex, nofollow">` to every page, and `public/.htaccess` sets `Header set X-Robots-Tag "noindex, nofollow"` plus caching headers for /_astro/ (immutable) and HTTPS redirect. robots.txt disallow-all while noindex.

## Repo and commands
`site/package.json` scripts: dev, build, preview, test (playwright), check. Build output `site/dist/` (gitignored). Root `.gitignore` already whitelists paths; add `!/site/`, `/site/node_modules/`, `/site/dist/`, `/site/test-results/`, `/site/playwright-report/`, `!/build-plan/`, `!/SECTIONS-INVENTORY.md`, `!/qa/` if missing. Commit with clear messages. Do not push (the driver pushes). Do not deploy anywhere.
