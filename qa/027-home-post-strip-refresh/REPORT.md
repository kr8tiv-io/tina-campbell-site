# 027 home post-strip refresh

The film-strip scrub spacer mounts after the load-time `ScrollTrigger.refresh()`. The 02A-03B pin kept the start it measured without that spacer (desktop 2880 vs 4230, short by 1350 px, the 150vh spacer). The stage went `position: fixed` while `html.is-sheet-hold` was still on, so the echo sheet was already mid-fade when the hold let go.

`document.documentElement.scrollHeight` does not move on a later resize. The spacer is already in normal flow (desktop 9047 before and after). The stale data is the cached trigger start and end.

## Change

`site/src/scripts/motion/scenes/home-filmstrip.ts`, only when `.sheet-scrub` is inserted:

- `refreshPriority: 1` on the scrub trigger, above the seam pins (default 0), so a later refresh measures the spacer first.
- `ScrollTrigger.sort()` then `ScrollTrigger.refresh()` immediately after `ScrollTrigger.create`. No `scrollTo`. Start, end, scrub, snap, and the 150vh / 110vh heights are unchanged.

`seams.ts` was not edited. Record mode and reduced motion still skip the spacer, so this refresh does not run there.

## Regression

`site/tests/post-strip.spec.ts`. Production preview, Chromium, desktop 1440x900 and mobile 390x844 (isMobile, hasTouch, DPR 2). Small and reduced projects skip.

Load `/`, wait for `load`, then for `[data-sheet-scrub]` plus 1200 ms. Walk to `.runway--strip` and back (desktop `mouse.wheel` 120 px, phone `__tcMotion.scrollTo`, 90 px, 200 ms settle). Then dispatch `resize`, wait 600 ms, and require `scrollHeight` equal within 4 px.

The walk is before the resize. A resize refreshes ScrollTrigger, which clears the stale starts on desktop (`ignoreMobileResize` skips that refresh on the phone). Walking first is what makes the desktop case fail on the unfixed build.

Before the fix (current dist, spec only):

```
Error: forward hold while 02A-03B stage is fixed at y=2936
Error: forward hold while 02A-03B stage is fixed at y=2723
```

Desktop y=2936, phone y=2723. After the fix the same spec passed on both projects, including inside the full suite.

## Gate

| Check | Result |
|---|---|
| `tsc --noEmit` | PASS |
| Scene 01A | PASS worst 0.9774 mean 0.9794 (floor 0.97) |
| Scene 03B | PASS worst 0.9613 mean 0.9693 (floor 0.96) |
| Scene 04B | PASS worst 0.9531 mean 0.9597 (floor 0.95) |
| Seam gate | PASS 10/10 |
| Route check | PASS 3/3 (`01A-02A`, `02A-03B` on `/`, `04B-05C` on `/work/`) |
| Route visual desktop | PASS 3/3 |
| Route visual mobile | PASS 3/3 |
| Production Playwright | PASS 46 passed, 26 skipped, 0 failed (9.6m) |

Production build lists 20 pages. `motion-lab` routes are not emitted. The layout client chunk is 81.02 kB, gzip 23.78 kB. The added calls are a few dozen bytes.

Shots (Chrome, DPR 3): `qa/027-home-post-strip-refresh/shots/`. Home at scroll 0 and at the 01A, 02A, and 03B ranges (start, middle, end) on 1440x900 and 390x844, plus `reduced-home-scroll0.jpg`.

## Commit message

```
fix(home): refresh scroll triggers after the 02A scrub spacer mounts so 02A-03B no longer fires early
```
