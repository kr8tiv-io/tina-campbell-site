# Tina Campbell Portfolio Site: Build Spec v1
Prepared Nov 11, 2026. Status: spec ready, nothing built or deployed. Read ASSESSMENT.md first.

## 0. Goal
An award-level, motion-rich editorial portfolio that feels like walking through a gallery built out of Edmonton's architecture, with Tina's photos always in front. It must make her look like the premium fashion and portrait photographer in YEG, and turn visitors into enquiries.

Success means:
- Her photos lead every screen. Chrome, type and motion frame them, never compete.
- It feels designed, not templated: pinned sequences, horizontal galleries, clean reveals, page transitions.
- It is fast: Lighthouse 90+ performance on mobile, LCP under 2.5 s, no layout shift.
- One clear action everywhere: "Book a shoot".

## 1. Brand direction
**Name on the site:** Tina Campbell, with **TCPhoto** as the mark. Lead with her full name (search and trust, and it avoids confusion with tcphoto.ca, a different studio). Keep "_tcphoto" as the social handle.

**Her existing mark leads.** Tina's current brush-script "TCPhoto" (Facebook cover and profile picture; files in brand/) is the primary logo across the site: header, loader (stroke-by-stroke draw), favicon (the slashing T), footer signature and series covers. White on ink or ink on paper. Every Imagine concept is fed this logo as a reference. Her older "TC Photos PHOTOGRAPHY" camera lockup is retired.

**Wordmark idea (supporting her mark):** two parts.
1. Primary: "TINA CAMPBELL" set in a tall, high-contrast serif in caps with wide tracking, a hairline rule, then "PHOTOGRAPHY · EDMONTON" in small mono.
2. Signature: a cleaned-up vector of her existing hand-script "TCPhoto" used as a signature stamp (footer, loader, favicon "TC"). This keeps continuity with her watermark and profile image.
Logo colours: white, black, or metallic only.

**Palette (sampled from her photos):**
| Token | Hex | Where it comes from | Use |
|---|---|---|---|
| ink | #0C0C0F | black gowns, night runway | primary dark background, text on light |
| paper | #F0F3F4 | overcast winter, white studio | primary light background |
| graphite | #302F33 | leather, shadows | secondary surfaces, rules |
| crimson | #963730 (UI) / #B3261E (bright) | the red gown series | single accent: buttons, active states, cursor dot |
| sky | #AFCBE2 / #729DC4 | her hard blue skies | hover tints, gallery mat on "Blue Hour" pages |
| sand | #DCCCC0 / #BAA391 | skin tones, golden hour | captions on dark, warm mats |
| slate | #4C5961 | bridges, steel | meta text, grid lines |
Rule: crimson is the only saturated UI colour. Everything else stays neutral so the photos carry the colour.

**Type pairing (free, self-hosted):**
- Display: Instrument Serif (or Cormorant Garamond for heavier contrast). Huge sizes, tight leading.
- Text and UI: Inter Tight (or Manrope).
- Meta and captions: JetBrains Mono or IBM Plex Mono, small caps style, for "frame numbers" and locations.
Premium upgrade if budget allows: PP Editorial New + Neue Montreal.

**Voice:** short, confident, warm, a little attitude. Uses her own lines. Plain language, no fluff. Examples:
- Hero: "Confidence, framed."
- Sub: "Fashion, portrait and runway photography in Edmonton by Tina Campbell."
- CTA: "Book a shoot"
- About opener: "I used to shoot weddings. Now I photograph people the way they want to be seen."

## 2. Design direction: pick one (concepts for Matt)
All three share the same sitemap, stack and performance budget. They differ in mood and motion.

### Concept A: "Runway" (dark, cinematic, fashion-week)
- Ink background, crimson accent, white type. Feels like a show at night.
- Home opens on a slow push-in of the black-gown Legislature frame, then the name types in letter by letter.
- Signature move: a pinned horizontal "runway" where frames walk past at different speeds, each with a mono frame number and location.
- Cursor: a small crimson dot that grows into "VIEW" over images.
- Best for: fashion, models, runway, glam. Strongest "wow".

### Concept B: "Blueprint" (light, architectural, gallery)
- Paper background with faint slate grid lines like an architect's drawing. Images sit in the grid with exact margins and hairline rules.
- Section dividers are her bridge and skyline shots, cropped into long panoramic bands that parallax.
- Signature move: images reveal with a clip-path "shutter" wipe that follows the grid lines, plus a pinned split screen (text column fixed, photos scroll).
- Best for: the "architectural" brief, premium and calm, works for bridal and brand clients too.

### Concept C: "Red Gown" (editorial magazine)
- Alternates paper and ink spreads like a magazine. Each gallery opens with a "cover" page: full-bleed hero, giant serif headline, issue-style meta.
- Crimson used boldly on cover pages only.
- Signature move: page transitions that slide like turning a page, and a hero sequence built from the red-gown-on-teal-truck series stitched into a scroll-driven flipbook.
- Best for: personality and storytelling, shows her as an artist with series.

**Recommendation:** B as the base system (it answers "architectural" and keeps photos first), borrowing A's horizontal runway for the Runway gallery and C's cover pages for each series. That mix is called "Blueprint + Runway" below and is what the prompt list builds.

### Imagine-first step (standing rule)
Every site starts with Grok Imagine concept mockups made from prompts, then the build matches the chosen mockup.
- Prompts for A, B and C live in `concepts/PROMPTS.md`, each fed with her palette, genres, mood, layout and motion notes and her real reference photos.
- Generated mockups: `concepts/concept-a-runway`, `concept-b-blueprint`, `concept-c-red-gown`, plus `concept-b-mobile`.
- Generated with Grok Build on the aurahomes login (`GROK_HOME=~/.grok-aurahomes`), never the kr8tiv login.
- Matt picks one (or a mix). The build then uses the mockup for layout and mood only: all words are real HTML text and all photos are Tina's real images. Ignore any text drawn in the mockups.

## 3. Sitemap
- `/` Home
- `/work/` Portfolio index (all series)
  - `/work/fashion/` Fashion and Editorial
  - `/work/runway/` Runway and Backstage
  - `/work/portraits/` Beauty and Portraits
  - `/work/bridal/` Bridal and Couples
  - `/work/city/` Edmonton (city and landscape)
  - `/work/[series]/` Featured series pages: "The Red Gown", "Legislature in Black" (more as she adds)
- `/services/` Sessions and what is included (pricing "from" or "on request")
- `/about/` Tina's story, process, press ("Woman Of The Week"), collaborators
- `/book/` Enquiry and booking form
- `/journal/` Optional later: shoot stories and BTS
- `/404/`, `/privacy/`
- Global: header, full-screen menu, footer with Instagram feed strip, sticky "Book a shoot".

## 4. Grid and layout system
- 12-column grid, 1440 max content width, 24 px gutters desktop, 16 px mobile. Outer margin 5vw.
- Vertical rhythm on an 8 px base. Section spacing 160 px desktop, 96 px mobile.
- Image ratios used: 4:5 (her native portrait), 2:3, 1:1, 16:9 and ultra-wide 3:1 bands for city dividers.
- Hairline rules (1 px slate at 30%) mark the grid in Concept B. Frame numbers in mono ("No. 014 / Alberta Legislature").
- Whitespace is generous: no more than 2 large images per viewport on desktop.
- Captions always small, mono, sand or slate; never on top of faces.

## 5. Page by page
### Home
1. **Loader (under 1.2 s):** TC signature draws as a line, counter 0 to 100, then splits like curtains. Skipped on repeat visits.
2. **Hero:** full-bleed signature image (red gown on teal truck or black gown at the Legislature) with a slow scale-down from 1.1 to 1.0 on load. Name in giant serif, sub-line, "Book a shoot" and "See the work".
3. **Statement:** one sentence in big serif that reveals word by word on scroll: "I photograph people the way they want to be seen: bold, polished and completely themselves."
4. **Featured series (pinned horizontal):** 5 to 7 series covers sliding sideways while the section is pinned; progress bar in crimson.
5. **City band:** ultra-wide Walterdale Bridge or High Level Bridge band with parallax, caption "Shot in Edmonton".
6. **Category grid:** asymmetric architectural grid linking to the 5 galleries, each tile a hover video-like crossfade between 3 frames.
7. **Proof:** "Woman Of The Week, Elle & Beauty Inc." plus 2 to 3 client lines (to collect).
8. **Services teaser:** 3 cards, each with a photo, name and "from" line.
9. **About teaser:** portrait of Tina (needed) with a short line and link.
10. **Instagram strip:** latest 6 posts, horizontal drag.
11. **Final CTA:** huge "Let's make something bold." with the booking button.

### Work index
- Filter bar (All, Fashion, Runway, Portraits, Bridal, Edmonton) with animated underline and GSAP Flip reflow when filtering.
- Masonry-free justified grid in Concept B style; hover shows mono caption and a crimson corner tick.
- Click opens the project page with a shared-element transition (thumbnail grows into hero).

### Gallery / series page
- Cover: full-bleed hero, serif title, meta row (location, year, team credits: model, MUA, designer).
- Body: alternating layouts (single centered, pair, offset trio, full-bleed) driven by a layout array in content data.
- Runway gallery uses the pinned horizontal "runway" sequence.
- Lightbox: fullscreen, keyboard and swipe, preloads neighbours, shows caption and frame count.
- Next series link at the bottom with a large hover preview.

### Services
- Session types (draft, confirm with Tina): Model Portfolio, Glam and Personal Brand, Runway and Event Coverage, Business Content Day, Bridal and Engagement, Creative Concept Shoot.
- Each: what it is, who it is for, what is included (time, looks, locations, edited images, turnaround), "from" price or "Pricing on request".
- Process timeline: Enquire, Plan the look, Shoot day, Gallery delivery.
- FAQ accordion (styling help, locations, what to wear, travel, usage rights).

### About
- Big portrait of Tina, her story in plain words (weddings first, now empowerment and fashion), what she believes, the Edmonton spots she loves, press, collaborators, BTS strip (`ig_profile_05.jpg` style).

### Book
- Short form: name, email, phone, session type, preferred date, location idea, budget range, message, how did you hear. Honeypot spam field, success state animation.
- Backend: Formspree or Web3Forms (static-friendly) sending to Tina's email; optional Calendly embed later.

### Global
- Header: wordmark left, "Work, Services, About" centre, "Book a shoot" button right. Hides on scroll down, shows on scroll up.
- Menu (mobile and optional desktop): full-screen ink overlay, big serif links staggering in, a photo preview that changes per link.
- Footer: signature mark, Instagram and Facebook links, email, "Edmonton, Alberta", small credit.

## 6. Motion system
- **Smooth scroll:** Lenis (lerp 0.1), disabled on reduced-motion and for touch where it fights native scroll.
- **GSAP + ScrollTrigger:** image reveals via clip-path inset (bottom to top, 0.9 s, power3.out) with a slight scale 1.12 to 1.0 inside the mask.
- **Text:** SplitText-style line and word reveals (GSAP SplitText is free now; fallback to a tiny custom splitter).
- **Pinned sequences:** horizontal runway gallery, split-screen series intros, flipbook hero.
- **Parallax:** city bands and offset images at 5 to 15% depth only.
- **Cursor:** custom dot (crimson) with magnetic buttons and "VIEW"/"DRAG" labels; off on touch.
- **Page transitions:** Astro View Transitions (ClientRouter) with a shared-element morph from grid tile to hero, plus a quick ink wipe. Fallback is a simple fade.
- **Hover:** subtle image scale 1.03 and caption slide; filter reflow with GSAP Flip.
- **Rules:** every animation respects `prefers-reduced-motion`; nothing blocks reading or clicking; total JS under 120 KB gzipped.

## 7. Images and performance
- Source: clean, unwatermarked originals from Tina (ask). Until then use files in `images/` for layout only.
- Pipeline: Astro `astro:assets` / `<Picture>` generating AVIF and WebP at 480, 800, 1200, 1800, 2400 widths; blur-up LQIP; explicit width and height; lazy-load below the fold; hero preloaded.
- Content collection `src/content/work/*.json|md` with fields: title, slug, category, cover, images[{src, alt, ratio, layout, caption, credits}], location, year, featured.
- Alt text written for every image (subject, wardrobe, location), never "AI generated" or similar labels.
- Watermark policy: none on site images; right-click protection is not worth the UX cost. Optional subtle signature only on downloads (none offered).

## 8. SEO basics
- Title pattern: "{Page} | Tina Campbell Photography, Edmonton". Home: "Tina Campbell Photography | Fashion and Portrait Photographer in Edmonton".
- Meta descriptions per page, Open Graph and Twitter images (her hero frames), canonical URLs.
- JSON-LD: `LocalBusiness` / `ProfessionalService` (Photographer) with name, area served (Edmonton, St. Albert, Sherwood Park, Fort Saskatchewan), sameAs (Instagram, Facebook), plus `Person` for Tina and `ImageGallery` on galleries.
- Target phrases: Edmonton fashion photographer, YEG model portfolio photographer, Edmonton glam photoshoot, Edmonton runway photographer, Edmonton bridal portraits.
- Sitemap.xml, robots.txt, clean slugs, descriptive file names (`red-gown-teal-truck-edmonton.avif`).
- Google Business Profile: create or claim one and link it (she has none found).

## 9. Tech stack
- **Astro 5** static site (same family as Matt's other sites), TypeScript, content collections.
- **Styling:** plain CSS with custom properties (tokens above) or Tailwind 4 with a token layer.
- **Motion:** GSAP 3 (ScrollTrigger, Flip, SplitText), Lenis.
- **Lightbox:** PhotoSwipe 5.
- **Forms:** Formspree or Web3Forms.
- **Hosting:** GitHub Pages or Cloudflare Pages (free, fast). Domain: tcphotophotography.ca (already hers, currently pointed at Wix) or a new tinacampbell.ca style domain.
- **Analytics:** Plausible or Cloudflare Web Analytics (privacy-friendly).
- **Repo:** new repo, e.g. `kr8tiv-io/tina-campbell-site`, preview deploys before any live change.

## 10. Content Tina needs to supply
- 40 to 80 unwatermarked full-resolution favourites, grouped by series, with credits (model, MUA, designer, location).
- A portrait of herself and 3 to 6 BTS shots.
- Her session list and starting prices (or "on request").
- 3 to 6 testimonials.
- Contact email, phone (optional), service area, booking preference (form only or calendar).
- Confirmation of model and client releases for commercial display.

## 11. Ordered spec-prompt list (build sequence)
Each prompt is one focused task for the builder (Grok Build or a coding agent). Run in order, review after each.
0. Imagine-first: generate concept mockups from `concepts/PROMPTS.md` (done for v1), get Matt's pick, and add the chosen mockup to the build folder as the visual reference for every prompt below.
1. Scaffold Astro 5 + TypeScript project, folders, ESLint/Prettier, base layout, `.gitignore`, README. No content yet.
2. Add design tokens (palette, type scale, spacing, grid, radii, z-index) as CSS custom properties; self-host Instrument Serif, Inter Tight, JetBrains Mono with `font-display: swap`.
3. Build the 12-column grid utilities, container, section spacing and the Blueprint hairline grid overlay component.
4. Create content collections schema for `work` (series) and `services`; seed with the curated images from `images/MANIFEST.json` mapped to categories.
5. Image pipeline: `<Picture>` component with AVIF/WebP, srcset widths, LQIP blur, aspect-ratio boxes, priority flag for heroes.
6. Header, hide-on-scroll behaviour, full-screen menu with staggered links and per-link photo preview.
7. Footer with signature mark, socials, contact, Instagram strip placeholder.
8. Lenis smooth scroll + GSAP/ScrollTrigger setup with a single RAF loop and reduced-motion guard.
9. Reusable reveal primitives: `RevealImage` (clip-path + inner scale), `RevealText` (line/word split), `Parallax` wrapper.
10. Custom cursor (dot, magnetic buttons, VIEW/DRAG labels), off on touch and reduced motion.
11. Loader with TC signature line-draw and counter; session-skip on repeat visits.
12. Home: hero with signature image, name lockup, CTAs, scale-in.
13. Home: word-by-word statement section.
14. Home: pinned horizontal featured-series sequence with crimson progress bar.
15. Home: ultra-wide city parallax band, category grid with 3-frame hover crossfade.
16. Home: proof, services teaser, about teaser, Instagram strip, final CTA.
17. Work index with filter bar and GSAP Flip reflow; hover captions.
18. Series page template: cover, meta/credits row, layout-array driven body, next-series footer.
19. Runway gallery: pinned horizontal runway sequence with frame numbers and drag on touch.
20. PhotoSwipe lightbox integration with captions, keyboard, swipe, neighbour preload.
21. Page transitions: Astro ClientRouter, shared-element tile-to-hero morph, ink wipe fallback; re-init GSAP safely on navigation.
22. Services page: session cards, process timeline, FAQ accordion.
23. About page: portrait, story, press, collaborators, BTS strip.
24. Book page: enquiry form (Formspree/Web3Forms), validation, honeypot, success animation.
25. SEO: meta component, OG images, JSON-LD (LocalBusiness, Person, ImageGallery), sitemap, robots, 404 page.
26. Accessibility pass: focus states, skip link, alt text audit, colour contrast, reduced motion, keyboard lightbox.
27. Performance pass: Lighthouse mobile 90+, JS budget under 120 KB gz, LCP under 2.5 s, CLS 0; fix regressions.
28. Copy pass: final words in her voice, no em dashes, no filler; replace placeholders.
29. Swap layout images for Tina's clean originals; regenerate derivatives; final visual QA on mobile and desktop.
30. Preview deploy (Cloudflare Pages or GitHub Pages) for Matt and Tina to review. Live deploy and DNS only after their OK.

## 12. Copy rules
- No em dashes. Never "gonna" or "wanna". Plain, confident, warm language.
- Never label any image as AI generated.
- No competitor names.
