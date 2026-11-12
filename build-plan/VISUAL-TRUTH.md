# Visual truth for the Tina Campbell build

Matt reviewed staging and said the site does not look like the PDF we sent Tina. The foundation placeholder is expected to be temporary. Every remaining step must lock the built pages to the approved look and motion. Nothing goes to Tina, and this file does not authorise a staging deploy.

## Hierarchy (do not invert)

1. **Primary truth: Grok Imagine layouts and motion clips.**
   - Layouts: `/workspace/tina-campbell/concepts/site-layouts/` (use the approved pick named in the prompt: v2b / v3 / v3-clean where listed, otherwise the latest named file).
   - Motion clips: `/workspace/tina-campbell/concepts/site-layouts/motion/01-lenis-scroll-home.mp4` through `06-about-bridge-parallax.mp4`.
   - Motion written spec: `/workspace/tina-campbell/motion/MOTION-SPEC.md`.
2. **Direction confirmation: the annotated branding PDF and Tina's own words.**
   - PDF: `/home/box/agent-data/agents/85C11A56-174F-4D04-8F12-0090F125E393/attachments/0ba40fba46fd346d0f14b7465fe9ff28f493d68f635603b6f93f5f375cfe3f12.pdf`
   - Extracted pages: `/workspace/tina-campbell/build-plan/context/` (see `context/README.md`).
   - Her verbatim notes, already mapped in `/workspace/tina-campbell/FEEDBACK-MAP.md`:
     - "Thx Matt, great presentation. I feel this captured my work in a nutshell. Layout is great." Keep the layouts she saw recognisable.
     - "My fave is runway and editorial." Runway is the global look (ink, photos glowing on black, crimson pills, sideways runway). Editorial Split is every text page (ink text panel + scrolling photos, text sitting beside pictures).
     - "I chose a few I liked something different about each" / ticks: also keep Film Strip, Noir and Crimson, and Bridge and Skyline as mapped.
     - "fashion & editorial stand out most"
     - "I really like the editorial for pages and how it looks on display, with text."
     - "As for the business card, i would chose a different photo." Print only, not a site task.
     - "So I enjoy all types of different styles of photography, but not paid for my skills in the fashion but absolutely enjoy very much."
3. **Copy and content:** `/workspace/tina-campbell/build-plan/COPY.md` and `SECTIONS-INVENTORY.md`. All words are live HTML from COPY.md. Never bake text into images or video. Minimalist, classy, normal speech. No haiku, no em dashes.

Design tokens stay as SPEC.md (ink `#0C0C0F`, paper `#F0F3F4`, crimson `#B3261E`). The PDF colour chip `#963730` is older; do not switch to it. Photos are Tina's real frames from `images/`, never Imagine mockups as content.

## Before you implement

Open the named layout image(s) and the named PDF concept page(s). Watch the named motion clip(s) all the way through; extract frames with ffmpeg into `/tmp` and delete them after. Note timing, easing, direction, and pin behaviour. If a page or UI state in your prompt has no approved layout or clip, **stop**. Generate a new Grok Imagine layout and/or clip first, using the existing layouts and clips as context, and save it into `concepts/site-layouts/` (next free number from 20) or `concepts/site-layouts/motion/` (next free number from 07). Use the same Grok Imagine method already used for rounds 1 to 4 (see `concepts/imagine-site-layouts-r4-task.md` and `concepts/site-layouts/motion/VIDEO-PROMPTS.md`). Do not invent a layout, and do not silently switch methods. If Grok Imagine or Grok Build fails or blocks, report the exact failure in your final message and stop.

## Visual gate (every prompt)

Playwright Chromium from `~/.cache/ms-playwright` at 1440x900, 390x844 and 360x780. Full-page screenshots into `/workspace/tina-campbell/qa/<prompt-id>/`. Then composite each screenshot against its layout, and against the named PDF concept page where one is given:

```
python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py \
  --shot qa/<id>/desktop-1440.png \
  --ref /workspace/tina-campbell/concepts/site-layouts/<layout>.jpg \
  --label-left "LAYOUT <name>" \
  --label-right "LOCAL BUILD 1440" \
  --out qa/<id>/compare/<page>-1440-vs-layout.jpg

python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py \
  --shot qa/<id>/desktop-1440.png \
  --ref /workspace/tina-campbell/build-plan/context/<pdf-page>.jpg \
  --label-left "PDF <concept>" \
  --label-right "LOCAL BUILD 1440" \
  --out qa/<id>/compare/<page>-1440-vs-pdf.jpg
```

Open the side-by-sides. Fix palette, typography scale and placement, composition, photo treatment, spacing and section order until the built page is a close visual match to the Imagine layout (primary) and clearly in the same family as the PDF concept. Photos will be her real frames; type is live HTML, so letterforms may differ slightly from baked mock type, but size, weight, colour, alignment and hierarchy must match. Write short notes in `qa/<id>/compare/NOTES.md`. Do not commit until visible gaps are fixed.

## Motion gate (every prompt that names a clip)

Replicate the clip exactly: timing, easing, direction, and pin behaviour. Record the built section with Playwright `recordVideo` at 1280x720 (desktop, fine pointer) into `qa/<id>/motion/`. Scroll and interact the same way the clip does (including reverse scroll where the clip or SPEC requires it). Then:

```
python3 /workspace/tina-campbell/build-plan/tools/compare-motion.py \
  --clip /workspace/tina-campbell/concepts/site-layouts/motion/<clip>.mp4 \
  --recording qa/<id>/motion/<recording> \
  --out-dir qa/<id>/motion-compare \
  --frames 12
```

Open every `frame-XX.jpg` and the contact sheet. This is a choreography compare, not a pixel match (clips have baked mock type and stand-in crops). If timing, easing, direction or pin behaviour drifts, fix, re-record, and compare again. Fill in `qa/<id>/motion-compare/MOTION-NOTES.md`. No drift. Reduced-motion and touch fallbacks still apply as in SPEC.md; the clip is the full-motion desktop reference.

## Other standing rules

Same as the prompt preamble: real photos only, `npm run build` must pass, no overflow, no broken images, no console errors, reduced-motion pass, git add and commit, do not push, do not deploy. If a tool or install fails, say exactly what failed.
