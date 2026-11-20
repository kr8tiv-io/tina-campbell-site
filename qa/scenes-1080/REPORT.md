# Scenes at 1080p: fidelity report (19 Nov 2026, America/Edmonton UTC-6)

Truth: the picked 720p clips (145 frames, 24 fps). Route: upscale the picked clip itself, so motion, pacing and framing
are identical by construction. A fresh 1080p image-to-video generation of 01A from frame 0 + the brief scored min SSIM 0.51
(different camera move) and was rejected.

Browser gate = `scene_gate.py --self-test` (Chrome, 1280x720 viewport, seek (i+0.5)/24, element screenshot vs clip frame i,
luma SSIM >= 0.92 and MAE <= 8 on all 145 frames, master >= 1920 wide, duration 6.04 s).

| Scene | Master | AV1 1080 (gate) | H.264 1080 (gate) | AV1 / H.264 1080 / H.264 720 MB | Notes |
|---|---|---|---|---|---|
| 01A living-gown | ESRGAN hybrid | PASS 0.9748 | PASS 0.9773 | 0.74 / 2.4 / 0.84 | dn 0.5 ESRGAN streaked the sky (rejected); hybrid sky clean, frame-to-frame change 0.715 vs source 0.681 |
| 03B followspot | ESRGAN hybrid | PASS 0.9613 | PASS 0.9661 | 3.1 / 5.9 / 2.5 | scrub GOP 6 |
| 04B crimson-ink-drop | ESRGAN hybrid | PASS 0.9531 | PASS 0.9555 | 1.9 / 3.6 / 1.3 | |
| 06B crimson-thread | Lanczos | PASS 0.9816 | PASS 0.9895 | 3.6 / 4.5 / 1.9 | ESRGAN hybrid failed the gate (0.906): it smoothed the B&W grain. Lanczos keeps it |
| 09B blue-hour-lights | ESRGAN hybrid | PASS 0.9319 | PASS 0.9334 | 4.9 / 9.1 / 3.5 | dense foliage + water; higher quality encode (GOP 12, CRF 20/29); heaviest scene, lazy only |
| 10A blue-hour-drift | ESRGAN hybrid | PASS 0.9526 | PASS 0.9660 | 1.8 / 3.9 / 1.4 | |
| 11B veil-wipe | ESRGAN hybrid | PASS 0.9662 | PASS 0.9676 | 4.6 / 7.6 / 3.2 | |

Strips (top picked clip, bottom 1080 encode, one frame per second): `strip-<ID>-picked-vs-1080.jpg`.
AV1 encodes carry one cloned tail frame because SVT-AV1 degraded the final frame (09B frame 144 gate 0.909 without it).
