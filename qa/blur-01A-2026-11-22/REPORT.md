# blur-01A: home hero 01A sharpness (22 Nov 2026, UTC-6)

Matt: "The video of Tina looks really blurry. But the rest looks good."

## Source
- Best master on the box: `/workspace/tina-render-1080-2026-11-19/hybrid/01A-hybrid.mp4` (1920x1080, 145 frames, 24 fps, H.264 CRF 10, 18.5 Mbps; sha256 ac15f172... matches manifest `master_sha256`).
- It is an upscale of the picked Grok Imagine clip `concepts/motion-options-2026-11-12/01-home-hero/A-living-gown/clip.mp4` (1280x720, 2.0 Mbps). The picture fills only the top ~508 rows; the bottom ~29% is black. Real-ESRGAN (general-wdn-x4v3 dn0) blended with Lanczos in flat areas. No higher-resolution source exists.

## Cause
1. Source resolution: a 720p generation shown full-bleed. At 1440x900 DPR 2 each source pixel covers 2.5 device px; at 390x844 DPR 3 (cover crop ~26% of the width) 3.5 px.
2. Phones (<1000 px) were served `01A-720.mp4` (a downscale of the 1080 upscale, CRF 23, 1.1 Mbps): 3.52 device px per video px.
3. Lean encodes (H.264 1080 CRF 21 3.2 Mbps, AV1 CRF 34 1.0 Mbps). Measured vs master only 46.9-47.6 dB Y-PSNR, so a smaller factor.

## Fix (no regeneration, same master, same 145 frames, loop, poster and end stills unchanged)
- Light luma unsharp 5:5:0.45 before encode (upscale was unavoidable).
- `01A-1080.mp4` H.264 CRF 18 veryslow GOP 48: 4.70 MB, 6.2 Mbps (was 2.41 MB, 3.2 Mbps).
- `01A-1080.webm` AV1 SVT preset 4 CRF 24 enable-tf=0, cloned tail frame kept: 1.89 MB, 2.5 Mbps (was 0.77 MB, 1.0 Mbps).
- `01A-720.mp4` H.264 CRF 18: 1.95 MB, 2.6 Mbps (was 0.84 MB, 1.1 Mbps). Now only the no-manifest fallback.
- `manifest.json`: 01A `h264_720` points to `01A-1080.mp4`, so phones get the 1080 file (2.34 device px per video px at 390 DPR 3).

## Gate
check, build, pages, Playwright 44 passed 0 failed 24 skipped, seams 10/10, route tables, visual desktop and mobile PASS. Scene 01A PASS worst 0.9774 mean 0.9794 (was 0.9748 / 0.9773).
Rendered: 1440x900 serves 01A-1080.webm, box 1440x900, cover 0.833; 390x844 serves 01A-1080.mp4, box 390x844, cover 0.781.

Compare: `compare/01A-before-after.jpg` (desktop AV1 face crop, phone 390 DPR 3 simulation, frame 72).
