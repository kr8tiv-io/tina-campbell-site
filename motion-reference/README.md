# Locked motion reference (Tina Campbell)

Matt locked these scenes and section-to-section transitions on 13 Nov 2026 (America/Costa_Rica, UTC-6). The website build must reproduce them exactly. This folder is the in-repo copy of the approved GSAP prototypes and scene stills.

Canonical write-up: `docs/design-system/MOTION-LOCKED.md`.
Original working tree (includes large scene `clip.mp4` files, not copied here): `concepts/motion-options-2026-11-12/`.

## What is in here

- `12-seam-transitions/_shared/` — GSAP runtime, fonts, chrome, masks, boot.js
- `12-seam-transitions/<pair>/<option>/` — the 10 chosen prototypes (`index.html` plus the recorded `clip.mp4` gold frames)
- `<scene>/<option>/start.jpg` and `end.jpg` — stills the prototypes reference (relative paths in the HTML are unchanged)
- Scene `clip.mp4` files were not copied (they are large). Each scene folder has `CLIP-PATH.txt` pointing at the original.

## Preview

Serve the parent of the scene folders (this folder) and open a prototype with `?play=1`:

```bash
python3 -m http.server 8766 --bind 127.0.0.1 --directory /workspace/tina-campbell/motion-reference
# e.g. http://127.0.0.1:8766/12-seam-transitions/01A-02A/A-ink-bleed-down/index.html?play=1
```

Record hooks (same as `_shared/record.py` and `boot.js`): viewport 1440x810, `?record=1`, wait for `window.__PROTO_READY__`, then `window.__START_RECORD__()` which holds 0.6s, scrolls the pin track in 5.2s with ease none, then waits 0.85s.

## Do not

Do not rename this folder `build`, `out`, or `dist`. Do not treat unchosen A/B/C options as approved. Scene 03B (followspot) is provisional but is the locked pick until Matt changes it.
