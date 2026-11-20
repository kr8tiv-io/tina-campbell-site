#!/usr/bin/env python3
"""Scene gate v1.1 (fresh browser per scene, 20 Nov 2026; v1 19 Nov 2026) for the 7 VIDEO scenes. PASS or FAIL only.

Truth = the picked 720p clip (concepts/motion-options-2026-11-12/<scene>/<opt>/clip.mp4, 145 frames @ 24 fps).
The site must expose the scene's media as <video data-scene-video="<ID>"> and honour `?record=1&gate=<ID>`:
  - Lenis off, no autoplay; overlay copy and decorative layers ([data-scene-overlay]) hidden; no extra transforms
    or filters on the media (scroll/zoom tweens at their neutral state).
  - window.__SCENE_READY__[<ID>] === true once the video has metadata and gate mode is applied.
For each frame i (0..144) the gate seeks the site video to (i + 0.5) / 24 s, waits for `seeked` + 2 rAF, screenshots
the element box at a 1280x720 viewport, and compares it with clip frame i cropped the way object-fit: cover
crops it. Every frame needs luma SSIM >= 0.92 and MAE <= 8. Also checks the served media: >= 1920 px wide master,
duration 6.04 s +- 1 frame.
Usage:
  scene_gate.py --base http://127.0.0.1:4821 --scenes 01A[,03B...] [--out qa/scene-gate]
  scene_gate.py --self-test --master <file.mp4> --scenes 01A   # harness page plays <file>; must PASS for a faithful master
"""
from __future__ import annotations
import argparse, json, shutil, subprocess, sys, tempfile, threading, functools, socketserver, http.server
from pathlib import Path
import numpy as np
from PIL import Image

import os
ROOT = Path(os.environ.get("TC_ROOT") or Path(__file__).resolve().parents[2])
from importlib.machinery import SourceFileLoader
mg = SourceFileLoader("mg", str(ROOT / "build-plan/tools/motion-gate.py")).load_module()
CONCEPTS = Path("/workspace/tina-campbell/concepts/motion-options-2026-11-12")
SCENES = {
    "01A": ("/", "01-home-hero/A-living-gown"),
    "03B": ("/", "03-home-runway/B-followspot"),
    "04B": ("/work/", "04-work-hover/B-crimson-ink-drop"),
    "06B": ("/fashion-editorial/", "06-editorial-split/B-crimson-thread"),
    "09B": ("/about/", "09-about-parallax/B-blue-hour-lights"),
    "10A": ("/book/", "10-contact-footer/A-blue-hour-drift"),
    "11B": ("/portraits-bridal-couples/", "11-portraits-chapters/B-veil-wipe"),
}
W, H, FPS, NF = 1280, 720, 24, 145
SSIM_MIN, MAE_MAX = 0.92, 8.0

def clip_path(sid: str) -> Path:
    for base in (ROOT / "concepts/motion-options-2026-11-12", CONCEPTS):
        p = base / SCENES[sid][1] / "clip.mp4"
        if p.exists(): return p
    sys.exit(f"clip for {sid} not found")

def ref_frames(sid: str, cache: Path) -> list[Path]:
    d = cache / sid
    if not (d.exists() and len(list(d.glob("f-*.png"))) == NF):
        if d.exists(): shutil.rmtree(d)
        d.mkdir(parents=True)
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(clip_path(sid)), "-map", "0:v:0", "-fps_mode", "passthrough",
                        "-start_number", "0", str(d / "f-%03d.png")], check=True)
    return sorted(d.glob("f-*.png"))

def cover_crop(ref: np.ndarray, bw: int, bh: int, pos=(0.5, 0.5)) -> np.ndarray:
    h, w = ref.shape[:2]; s = max(bw / w, bh / h)
    img = Image.fromarray(ref.astype(np.uint8)).resize((round(w * s), round(h * s)), Image.LANCZOS)
    x = round((img.width - bw) * pos[0]); y = round((img.height - bh) * pos[1])
    return np.asarray(img.crop((x, y, x + bw, y + bh)), dtype=np.uint8)

SEEK_JS = """async ([id, t]) => { const v = document.querySelector(`video[data-scene-video="${id}"]`);
  v.pause(); await new Promise(r => { const f = () => { v.removeEventListener('seeked', f); r(); };
  v.addEventListener('seeked', f); v.currentTime = t; });
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const b = v.getBoundingClientRect(); const cs = getComputedStyle(v);
  return { x: b.x, y: b.y, w: b.width, h: b.height, fit: cs.objectFit, pos: cs.objectPosition,
           tf: cs.transform, filter: cs.filter, src: v.currentSrc, vw: v.videoWidth, vh: v.videoHeight, dur: v.duration }; }"""

def parse_pos(s: str):
    try:
        a = [float(p.rstrip('%')) / 100 for p in s.split()[:2] if p.endswith('%')]
        return (a[0], a[1]) if len(a) == 2 else (0.5, 0.5)
    except Exception: return (0.5, 0.5)

def serve(directory):
    class Q(http.server.SimpleHTTPRequestHandler):
        """Static server with HTTP Range support (video seeking needs 206 responses)."""
        def log_message(self, *a): pass
        def send_head(self):
            rng = self.headers.get("Range"); path = self.translate_path(self.path)
            if not rng or not rng.startswith("bytes=") or not Path(path).is_file():
                return super().send_head()
            size = Path(path).stat().st_size; a, _, b = rng[6:].split(",")[0].partition("-")
            start = int(a) if a else max(0, size - int(b)); end = int(b) if (a and b) else size - 1
            end = min(end, size - 1); f = open(path, "rb"); f.seek(start); self._rng = end - start + 1
            self.send_response(206); self.send_header("Content-Type", self.guess_type(path))
            self.send_header("Accept-Ranges", "bytes"); self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Content-Length", str(self._rng)); self.end_headers(); return f
        def copyfile(self, src, dst):
            n = getattr(self, "_rng", None)
            if n is None: return super().copyfile(src, dst)
            while n > 0:
                buf = src.read(min(65536, n))
                if not buf: break
                dst.write(buf); n -= len(buf)
    s = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(directory)))
    s.daemon_threads = True; threading.Thread(target=s.serve_forever, daemon=True).start(); return s

def run_scene(br, url: str, sid: str, out: Path, cache: Path) -> dict:
    refs = ref_frames(sid, cache); sdir = out / sid / "frames"
    if sdir.exists(): shutil.rmtree(sdir)
    sdir.mkdir(parents=True)
    ctx = br.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, reduced_motion="no-preference")
    pg = ctx.new_page(); rows = []; meta = None; errs = []
    try:
        pg.goto(url, wait_until="networkidle", timeout=60000)
        pg.wait_for_function(f"window.__SCENE_READY__ && window.__SCENE_READY__['{sid}'] === true", timeout=30000)
        pg.evaluate("async () => { if (document.fonts) await document.fonts.ready; }")
        pg.evaluate(f"""() => document.querySelector('video[data-scene-video="{sid}"]').scrollIntoView({{block:'center'}})""")
        for i in range(NF):
            m = pg.evaluate(SEEK_JS, [sid, (i + 0.5) / FPS]); meta = meta or m
            b = {k: round(m[k]) for k in ("x", "y", "w", "h")}
            b = {"x": max(0, b["x"]), "y": max(0, b["y"]), "width": min(W, b["w"]), "height": min(H, b["h"])}
            p = sdir / f"f-{i:03d}.png"; pg.screenshot(path=str(p), clip=b)
            s = mg.load_frame(p); g = cover_crop(mg.load_frame(refs[i]), s.shape[1], s.shape[0], parse_pos(m["pos"]))
            rows.append((i, mg.ssim_luma(g, s), mg.mae_rgb(g, s)))
    except Exception as e:
        errs.append(f"capture error: {str(e).splitlines()[0]}")
    finally:
        ctx.close()
    if meta:
        if meta["vw"] < 1920: errs.append(f"served media {meta['vw']}x{meta['vh']} < 1920 wide")
        if abs(meta["dur"] - NF / FPS) > 1.5 / FPS: errs.append(f"duration {meta['dur']:.3f}s != {NF/FPS:.3f}s")
        if meta["filter"] not in ("none", ""): errs.append(f"filter on media: {meta['filter']}")
    bad = [r for r in rows if r[1] < SSIM_MIN or r[2] > MAE_MAX]
    ok = not errs and len(rows) == NF and not bad
    worst = min(rows, key=lambda r: r[1]) if rows else (-1, 0.0, 255.0)
    for i, sv, mv in sorted(bad, key=lambda r: r[1])[:3]:
        s = mg.load_frame(sdir / f"f-{i:03d}.png"); g = cover_crop(mg.load_frame(refs[i]), s.shape[1], s.shape[0])
        mg.side_by_side(g, s, out / sid / "diffs" / f"f-{i:03d}-ssim{sv:.3f}.jpg", f"{sid} f{i}", sv, mv)
    res = {"scene": sid, "url": url, "verdict": "PASS" if ok else "FAIL", "frames": len(rows), "bad": len(bad),
           "mean_ssim": round(float(np.mean([r[1] for r in rows])), 4) if rows else 0, "worst_ssim": round(worst[1], 4),
           "worst_frame": worst[0], "errors": errs, "media": meta}
    (out / sid / "scores.json").write_text(json.dumps({**res, "rows": [{"f": r[0], "ssim": round(r[1], 4), "mae": round(r[2], 2)} for r in rows]}, indent=1))
    return res

HARNESS = """<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:#000}
video{display:block;width:100vw;height:100vh;object-fit:cover}</style>
<video data-scene-video="{sid}" muted playsinline preload=auto src="{src}"></video>
<script>window.__SCENE_READY__={};const v=document.querySelector('video');
v.addEventListener('loadeddata',()=>{window.__SCENE_READY__['{sid}']=true},{once:true});</script>"""

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--base"); ap.add_argument("--scenes", required=True)
    ap.add_argument("--self-test", action="store_true"); ap.add_argument("--master")
    ap.add_argument("--out", default=str(ROOT / "qa/scene-gate")); a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True); cache = Path(tempfile.gettempdir()) / "scene-gate-refs"
    from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    launch = lambda: pw.chromium.launch(headless=True, executable_path=mg.CHROME, args=["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage", "--no-sandbox"])
    # v1.1 (20 Nov 2026, Matt's call): each scene gets its own fresh browser, so it is judged as a real single page
    # visit. Thresholds unchanged. One shared headless Chrome froze its GPU process after ~435 screenshots (016/016b).
    br = None
    results = []
    try:
        for sid in a.scenes.split(","):
            if br is not None: br.close()
            br = launch()
            if a.self_test:
                tmp = Path(tempfile.mkdtemp()); shutil.copy(a.master, tmp / "m.mp4")
                (tmp / "index.html").write_text(HARNESS.replace("{sid}", sid).replace("{src}", "m.mp4"))
                srv = serve(tmp); url = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
            else:
                url = a.base.rstrip("/") + SCENES[sid][0] + f"?record=1&gate={sid}"
            r = run_scene(br, url, sid, out, cache); results.append(r)
            print(f"{sid} {r['verdict']} worst={r['worst_ssim']} (frame {r['worst_frame']}) mean={r['mean_ssim']} bad={r['bad']}/{r['frames']} {r['errors']}", flush=True)
    finally:
        if br is not None: br.close()
        pw.stop()
    lines = ["# Scene gate v1", "", "| Scene | Verdict | Mean SSIM | Worst SSIM | Worst frame | Bad /145 | Errors |", "|---|---|---|---|---|---|---|"]
    lines += [f"| {r['scene']} | **{r['verdict']}** | {r['mean_ssim']} | {r['worst_ssim']} | {r['worst_frame']} | {r['bad']} | {'; '.join(r['errors'])} |" for r in results]
    allok = all(r["verdict"] == "PASS" for r in results); lines += ["", f"VERDICT: {'PASS' if allok else 'FAIL'}"]
    (out / "REPORT.md").write_text("\n".join(lines) + "\n"); print(f"VERDICT: {'PASS' if allok else 'FAIL'}")
    return 0 if allok else 1

if __name__ == "__main__":
    sys.exit(main())
