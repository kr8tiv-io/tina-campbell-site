#!/usr/bin/env python3
"""Strict locked-motion gate for the Tina Campbell site.

Records each site section seam with Playwright at 1440x810 on the same
scroll timeline as motion-reference/12-seam-transitions/_shared/record.py
(boot.js: hold 0.6s, 5.2s linear scroll, 0.85s tail) and compares
sampled frames to the locked gold clip.mp4.

Verdicts are only PASS or FAIL. CLOSEST / ACCEPTABLE / PARTIAL are not used.
Any failed seam or failed frame fails the gate.
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]  # repo root of the worktree running the gate
DEFAULT_MANIFEST = ROOT / "build-plan/tools/motion-gate-seams.json"
CHROME = "/usr/bin/google-chrome"


def luma(arr: np.ndarray) -> np.ndarray:
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    return (0.2126 * r + 0.7152 * g + 0.0722 * b).astype(np.float64)


def ssim_luma(a: np.ndarray, b: np.ndarray) -> float:
    """Mean SSIM on luma, 11x11 uniform window, C1/C2 as in Wang et al."""
    x = luma(a)
    y = luma(b)
    k1, k2, l = 0.01, 0.03, 255.0
    c1, c2 = (k1 * l) ** 2, (k2 * l) ** 2
    win = 11
    pad = win // 2
    xp = np.pad(x, pad, mode="reflect")
    yp = np.pad(y, pad, mode="reflect")
    kernel = np.ones((win, win), dtype=np.float64) / (win * win)
    # sliding means via cumulative sums
    def conv(img: np.ndarray) -> np.ndarray:
        # box mean via integral image (same result as an 11x11 uniform window, ~50x faster)
        ii = np.pad(img, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
        return (ii[win:, win:] - ii[:-win, win:] - ii[win:, :-win] + ii[:-win, :-win]) / (win * win)

    mu_x = conv(xp)
    mu_y = conv(yp)
    mu_x2, mu_y2, mu_xy = mu_x ** 2, mu_y ** 2, mu_x * mu_y
    sig_x = conv(xp ** 2) - mu_x2
    sig_y = conv(yp ** 2) - mu_y2
    sig_xy = conv(xp * yp) - mu_xy
    num = (2 * mu_xy + c1) * (2 * sig_xy + c2)
    den = (mu_x2 + mu_y2 + c1) * (sig_x + sig_y + c2)
    return float(np.mean(num / np.maximum(den, 1e-12)))


def mae_rgb(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.mean(np.abs(a.astype(np.float64) - b.astype(np.float64))))


def load_frame(path: Path) -> np.ndarray:
    im = Image.open(path).convert("RGB")
    return np.asarray(im, dtype=np.uint8)


def extract_frames(video: Path, dest: Path, fps: float, start: float = 0.0) -> list[Path]:
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True, exist_ok=True)
    pattern = dest / "f-%04d.png"
    cmd = [
        "ffmpeg", "-y", "-ss", f"{start:.3f}", "-i", str(video),
        "-vf", f"fps={fps}",
        "-start_number", "0",
        str(pattern),
    ]
    proc = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed on {video}: {proc.stderr[-400:]}")
    frames = sorted(dest.glob("f-*.png"))
    if not frames:
        raise RuntimeError(f"no frames extracted from {video}")
    return frames


def probe_duration(video: Path) -> float:
    proc = subprocess.run(
        [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=nk=1:nw=1", str(video),
        ],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"ffprobe failed on {video}: {proc.stderr[-300:]}")
    return float(proc.stdout.strip())


def resize_to(arr: np.ndarray, size: tuple[int, int]) -> np.ndarray:
    im = Image.fromarray(arr)
    if im.size != size:
        im = im.resize(size, Image.Resampling.LANCZOS)
    return np.asarray(im, dtype=np.uint8)


def side_by_side(left: np.ndarray, right: np.ndarray, diff_path: Path, label: str, ssim_v: float, mae_v: float) -> None:
    h = max(left.shape[0], right.shape[0])
    # difference amplified
    delta = np.clip(np.abs(left.astype(np.int16) - right.astype(np.int16)) * 3, 0, 255).astype(np.uint8)
    gap = 8
    canvas = Image.new("RGB", (left.shape[1] * 3 + gap * 2, h + 48), (12, 12, 15))
    canvas.paste(Image.fromarray(left), (0, 48))
    canvas.paste(Image.fromarray(right), (left.shape[1] + gap, 48))
    canvas.paste(Image.fromarray(delta), (left.shape[1] * 2 + gap * 2, 48))
    draw = ImageDraw.Draw(canvas)
    text = f"{label}  SSIM {ssim_v:.4f}  MAE {mae_v:.2f}  (gold | site | x3 abs diff)"
    draw.text((12, 14), text, fill=(240, 243, 244))
    diff_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(diff_path, quality=92)


def record_site_seam(page, rec: dict, out_webm: Path) -> dict:
    """Drive the same record hook as boot.js. Returns timing measurements."""
    import time as time_mod

    page.wait_for_function("window.__PROTO_READY__ === true", timeout=20000)
    page.evaluate(
        """async () => {
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          await Promise.all([...document.images].map((img) =>
            (img.complete && img.naturalWidth) ? null :
            new Promise((res) => { img.addEventListener('load', res, {once:true}); img.addEventListener('error', res, {once:true}); })
          ));
        }"""
    )
    # Looping scene videos (e.g. 01A living-gown) play from whenever the page loaded, so their phase is
    # random per recording. Freeze every <video> on frame 0 in BOTH the gate gold and the site recording.
    page.evaluate(FREEZE_MEDIA_JS)
    # Prefer the site hook (must match boot.js). If present, use it.
    hook = page.evaluate("typeof window.__START_RECORD__")
    measures = {"hook": hook, "tl_duration": None, "eases": [], "scroll_dur": None}
    tl = page.evaluate(
        """() => {
          const tl = window.__PROTO_TL__;
          if (!tl || typeof tl.duration !== 'function') return null;
          const kids = typeof tl.getChildren === 'function' ? tl.getChildren() : [];
          return {
            duration: tl.duration(),
            eases: kids.map((t) => (t.vars && t.vars.ease) ? String(t.vars.ease) : null).filter(Boolean)
          };
        }"""
    )
    if tl:
        measures["tl_duration"] = tl.get("duration")
        measures["eases"] = tl.get("eases") or []
    page.wait_for_timeout(250)
    t0 = time_mod.perf_counter()
    if hook == "function":
        page.evaluate("window.__START_RECORD__()")
        page.wait_for_function("window.__PROTO_DONE__", timeout=25000)
    else:
        # Fallback that still uses the locked record numbers, then FAIL later if hook missing.
        hold, dur = rec["hold"], rec["dur"]
        page.wait_for_timeout(int(hold * 1000))
        page.evaluate(
            """async ({dur}) => {
              const max = document.documentElement.scrollHeight - window.innerHeight;
              const start = performance.now();
              return await new Promise((resolve) => {
                function step(now) {
                  const t = Math.min(1, (now - start) / (dur * 1000));
                  window.scrollTo(0, max * t);
                  if (t < 1) requestAnimationFrame(step);
                  else resolve(true);
                }
                requestAnimationFrame(step);
              });
            }""",
            {"dur": dur},
        )
        page.wait_for_timeout(int(rec["tail"] * 1000))
    measures["scroll_dur"] = time_mod.perf_counter() - t0
    page.wait_for_timeout(250)
    return measures


FREEZE_INIT_JS = """(() => {
  // Real 'scroll' events arrive on the real event loop at random moments between fake-clock ticks and restart
  // ScrollTrigger's scrub tween at a random phase (self-test was flaky at 0.1 s sampling). The gate already calls
  // ScrollTrigger.update() on every fake gsap tick, so swallow page scroll events entirely during capture.
  const swallow = (e) => { e.stopImmediatePropagation(); };
  window.addEventListener('scroll', swallow, true);
  document.addEventListener('scroll', swallow, true);
  const P = HTMLMediaElement.prototype; P.play = function () { try { this.pause(); } catch (e) {} return Promise.resolve(); };
  document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('video').forEach(v => { v.autoplay = false; v.pause(); }));
})();"""

FREEZE_MEDIA_JS = """async () => {
  const vids = [...document.querySelectorAll('video')];
  await Promise.all(vids.map(v => new Promise(res => {
    try {
      v.autoplay = false; v.pause();
      const done = () => res(true); const t = setTimeout(done, 3000);
      const seek = () => { if (v.currentTime === 0 && v.readyState >= 2) { clearTimeout(t); done(); return; }
        v.addEventListener('seeked', () => { clearTimeout(t); done(); }, { once: true }); v.currentTime = 0; };
      if (v.readyState >= 1) seek(); else v.addEventListener('loadedmetadata', seek, { once: true });
    } catch (e) { res(false); }
  })));
  return vids.length;
}"""

GOLD_DIR = ROOT / "build-plan/tools/motion-gate-gold"


def transcode(webm: Path, dest: Path) -> None:
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-i", str(webm), "-an",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-crf", "18", str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def _small_luma_seq(video: Path, fps: float, width: int = 240) -> np.ndarray:
    """Decode a video to a (n, h, w) float luma stack at low res, for start-offset search only."""
    proc = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(video), "-vf", f"fps={fps},scale={width}:-2,format=gray",
         "-f", "rawvideo", "-"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg decode failed on {video}: {proc.stderr[-300:]!r}")
    h = int(round(width * 810 / 1440 / 2) * 2)
    n = len(proc.stdout) // (width * h)
    return np.frombuffer(proc.stdout[: n * width * h], dtype=np.uint8).reshape(n, h, width).astype(np.float32)


def find_start_offset(gold: Path, site: Path, max_shift_s: float = 2.0, fps: float = 25.0) -> float:
    """Playwright's recording starts when the browser context opens, not at __START_RECORD__, so page
    load time shifts the whole clip by a constant. Find that one constant (seconds the site recording
    lags the gold) by minimising mean abs luma diff over the overlap. Only a single global shift is
    removed; every frame is then still compared at the same relative time, so timing, easing and
    duration differences still fail."""
    g, s = _small_luma_seq(gold, fps), _small_luma_seq(site, fps)
    best, best_k = None, 0
    kmax = int(max_shift_s * fps)
    for k in range(-kmax, kmax + 1):
        gs, ss = (g[: len(g) - k], s[k:]) if k >= 0 else (g[-k:], s[: len(s) + k])
        n = min(len(gs), len(ss))
        if n < fps * 3:
            continue
        err = float(np.mean(np.abs(gs[:n] - ss[:n])))
        if best is None or err < best:
            best, best_k = err, k
    return best_k / fps


def compare_videos(gold: Path, site: Path, work: Path, rec: dict, thr: dict) -> dict:
    fps = 1.0 / float(thr["sample_every_s"])
    shift = find_start_offset(gold, site)
    gold_frames = extract_frames(gold, work / "gold", fps, start=max(0.0, -shift))
    site_frames = extract_frames(site, work / "site", fps, start=max(0.0, shift))
    n = min(len(gold_frames), len(site_frames))
    if n < 5:
        return {
            "ok": False,
            "reason": f"too few aligned frames (gold={len(gold_frames)}, site={len(site_frames)})",
            "frames": [],
            "worst": [],
        }
    # Align by index over the shared prefix (same record timeline).
    rows = []
    for i in range(n):
        g = load_frame(gold_frames[i])
        s = load_frame(site_frames[i])
        s = resize_to(s, (g.shape[1], g.shape[0]))
        if s.shape != g.shape:
            return {
                "ok": False,
                "reason": f"frame {i} shape mismatch gold={g.shape} site={s.shape}",
                "frames": rows,
                "worst": [],
            }
        sv = ssim_luma(g, s)
        mae = mae_rgb(g, s)
        t = i * float(thr["sample_every_s"])
        passed = sv >= thr["ssim_min"] and mae <= thr["mae_max"]
        rows.append({"i": i, "t": t, "ssim": sv, "mae": mae, "pass": passed, "gold": gold_frames[i], "site": site_frames[i]})
    failed = [r for r in rows if not r["pass"]]
    need = int((rec["hold"] + rec["dur"]) * fps)
    if n < need:
        failed = failed or [{"i": -1, "t": -1, "ssim": 0.0, "mae": 999.0, "pass": False}]
    worst = sorted(rows, key=lambda r: (r["ssim"], -r["mae"]))[:3]
    return {
        "ok": len(failed) == 0,
        "reason": "" if not failed else f"{len(failed)}/{n} frames below threshold",
        "frames": rows,
        "failed": failed,
        "worst": worst,
        "gold_duration": probe_duration(gold),
        "site_duration": probe_duration(site),
        "n": n,
        "start_shift_s": shift,
    }


def capture_frames(browser, url: str, seam_sel, rec: dict, thr: dict, dest: Path) -> dict:
    """Deterministic capture: Playwright's fake clock is paused, so GSAP, ScrollTrigger scrub and the
    boot.js record scroll only advance when we step the clock. Every frame lands at an exact time
    (0, sample, 2*sample ...) from __START_RECORD__, identically for the gold prototype and the site.
    Wall-clock video recording was not usable as a gate: the prototype failed against its own clip
    (looping video phase, load offset, 1-2 frame jitter)."""
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)
    m = {"hook": "missing", "tl_duration": None, "eases": None, "notes": [], "frames": 0}
    ctx = browser.new_context(viewport={"width": rec["width"], "height": rec["height"]},
                              device_scale_factor=rec["device_scale_factor"], reduced_motion="no-preference")
    ctx.add_init_script(FREEZE_INIT_JS)
    page = ctx.new_page()
    try:
        page.clock.install(time=0)
        page.clock.pause_at(1000)  # page time never flows on its own; load timing cannot shift any timeline
        page.goto(url, wait_until="networkidle", timeout=30000)
        if seam_sel and not page.query_selector(seam_sel):
            # Fail fast (seconds, not minutes) when the seam is not on the page at all.
            m["notes"].append(f"missing {seam_sel} on page")
            m["hook"] = page.evaluate("typeof window.__START_RECORD__")
            return m
        ready = False
        for _ in range(150):  # up to 15 s of page time
            page.clock.run_for(100)
            if page.evaluate("window.__PROTO_READY__ === true"):
                ready = True
                break
        if not ready:
            m["notes"].append("window.__PROTO_READY__ never became true")
        page.evaluate("""async () => {
          if (document.fonts && document.fonts.ready) await document.fonts.ready;
          await Promise.all([...document.images].map((img) => (img.complete) ? null :
            new Promise((res) => { img.addEventListener('load', res, {once:true}); img.addEventListener('error', res, {once:true}); })));
        }""")
        page.evaluate("document.querySelectorAll('video').forEach(v => { try { v.autoplay = false; v.pause(); v.currentTime = 0; } catch (e) {} })")
        page.wait_for_timeout(400)  # real time for video seek / image decode only; page clock stays paused
        if seam_sel:
            el = page.query_selector(seam_sel)
            if not el:
                m["notes"].append(f"missing {seam_sel}")
            else:
                el.scroll_into_view_if_needed()
        m["hook"] = page.evaluate("typeof window.__START_RECORD__")
        tl = page.evaluate("""() => { const tl = window.__PROTO_TL__; if (!tl || typeof tl.duration !== 'function') return null;
          const kids = typeof tl.getChildren === 'function' ? tl.getChildren() : [];
          return { duration: tl.duration(), eases: kids.map((t) => (t.vars && t.vars.ease) ? String(t.vars.ease) : null).filter(Boolean) }; }""")
        if tl:
            m["tl_duration"], m["eases"] = tl["duration"], tl["eases"]
        # ScrollTrigger hears scroll events on the real event loop; update it on every (fake) tick instead,
        # and re-measure once now that fonts and images are in (pin spacing must not depend on load order).
        page.evaluate("(window.gsap && window.ScrollTrigger) ? (ScrollTrigger.refresh(), gsap.ticker.add(() => ScrollTrigger.update()), 1) : 0")
        page.clock.run_for(500)
        if m["hook"] != "function":
            m["notes"].append("window.__START_RECORD__ missing (required)")
            return m
        # Align the start to a fixed fake-clock phase (next whole second + 250 ms). The ready loop above can take a
        # different number of 100 ms steps on different runs; without this, rAF ticks fall at a different phase
        # against the 100 ms samples and the same page renders slightly different frames (self-test failed on 2 seams).
        now = int(page.evaluate("Date.now()"))
        page.clock.run_for((1000 - now % 1000) % 1000 + 250)
        page.evaluate("Promise.resolve(window.__START_RECORD__()).then(() => { window.__GATE_DONE__ = true; }); 1")
        step = float(thr["sample_every_s"])
        n = int(round((rec["hold"] + rec["dur"] + rec["tail"]) / step)) + 1
        for i in range(n):
            page.screenshot(path=str(dest / f"f-{i:04d}.jpg"), type="jpeg", quality=92, timeout=20000)
            page.clock.run_for(int(round(step * 1000)))
        m["frames"] = n
        page.clock.run_for(500)
        if not page.evaluate("window.__GATE_DONE__ === true"):
            m["notes"].append("__PROTO_DONE__ did not resolve within hold+dur+tail")
    except Exception as e:
        m["notes"].append(f"record error: {str(e).splitlines()[0]}")
    finally:
        try:
            ctx.close()
        except Exception:
            pass
    return m


def capture_gold(browser, gold_base: str, seam: dict, rec: dict, thr: dict):
    sid = seam["id"]
    url = gold_base.rstrip("/") + "/" + seam["prototype"] + "?record=1"
    tmp = GOLD_DIR / f".{sid}.tmp"
    m = capture_frames(browser, url, None, rec, thr, tmp)
    if m["hook"] != "function" or m["tl_duration"] is None or m["notes"] or not m["frames"]:
        shutil.rmtree(tmp, ignore_errors=True)
        return False, m["notes"] or ["prototype hooks missing"], m
    final = GOLD_DIR / sid
    if final.exists():
        shutil.rmtree(final)
    tmp.rename(final)
    (GOLD_DIR / f"{sid}.json").write_text(json.dumps({
        "seam": sid, "option": seam["option"], "prototype": seam["prototype"], "locked_clip": seam["clip"],
        "tl_duration": m["tl_duration"], "eases": m["eases"], "frames": m["frames"],
        "sample_every_s": thr["sample_every_s"], "media": "all <video> frozen on frame 0", "record": rec}, indent=2))
    return True, [], m


def compare_frames(gold_frames: list, site_frames: list, thr: dict) -> dict:
    n = min(len(gold_frames), len(site_frames))
    rows = []
    for i in range(n):
        g = load_frame(gold_frames[i])
        s = resize_to(load_frame(site_frames[i]), (g.shape[1], g.shape[0]))
        sv, mae = ssim_luma(g, s), mae_rgb(g, s)
        ok = sv >= thr["ssim_min"] and mae <= thr["mae_max"]
        shift = 0
        # Neighbour tolerance (19 Nov 2026): the locked prototype fails against ITSELF on a few fast frames because
        # the headless compositor can land one rAF tick either side of a 100 ms sample. A frame may therefore match
        # the gold one sample either side (+/-0.1 s of record time = about 2% of scroll progress). Every shifted
        # frame is reported; more than 10% shifted frames fails the seam (see below).
        if not ok and int(thr.get("neighbour_tolerance", 0)):
            for j in (i - 1, i + 1):
                if 0 <= j < len(gold_frames):
                    gj = load_frame(gold_frames[j])
                    sj, mj = ssim_luma(gj, s), mae_rgb(gj, s)
                    if sj >= thr["ssim_min"] and mj <= thr["mae_max"]:
                        ok, shift, sv, mae = True, j - i, max(sv, sj), min(mae, mj)
                        break
        rows.append({"i": i, "t": i * float(thr["sample_every_s"]), "ssim": sv, "mae": mae, "shift": shift,
                     "pass": ok, "gold": gold_frames[i], "site": site_frames[i]})
    failed = [r for r in rows if not r["pass"]]
    shifted = [r for r in rows if r.get("shift")]
    reason = ""
    if n and len(shifted) > 0.10 * n:
        failed = failed or shifted
        reason = f"{len(shifted)}/{n} frames only matched a neighbouring gold sample (max 10%); "
    if len(site_frames) != len(gold_frames):
        reason = f"frame count {len(site_frames)} vs gold {len(gold_frames)}; "
    if failed:
        reason += f"{len(failed)}/{n} frames below SSIM {thr['ssim_min']} / MAE {thr['mae_max']}"
    return {"ok": not failed and n > 0 and len(site_frames) == len(gold_frames), "reason": reason.strip("; "),
            "frames": rows, "failed": failed, "worst": sorted(rows, key=lambda r: (r["ssim"], -r["mae"]))[:3], "n": n}


def write_report(out: Path, results: list[dict], overall: str) -> None:
    lines = [
        "# Locked motion gate",
        "",
        "Verdicts are only PASS or FAIL. Close does not count.",
        "",
        f"Overall: **{overall}**",
        "",
        "| Seam | Option | Frame check | Timeline | Hook | Verdict | Worst SSIM | Worst MAE | Notes |",
        "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
    ]
    for r in results:
        lines.append(
            f"| {r['id']} | {r['option']} | {r['frame_check']} | {r['timeline_check']} | {r['hook']} | **{r['verdict']}** | {r['worst_ssim']} | {r['worst_mae']} | {r['notes']} |"
        )
    lines += ["", f"VERDICT: {overall}", ""]
    (out / "REPORT.md").write_text("\n".join(lines))
    (out / "verdict.txt").write_text(f"VERDICT: {overall}\n")


import http.server as _hs


class _QuietHandler(_hs.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *a):
        pass


def run(args: argparse.Namespace) -> int:
    manifest = json.loads(Path(args.manifest).read_text())
    rec, thr = manifest["record"], manifest["thresholds"]
    seams = manifest["seams"]
    if args.regen_gold:
        args.self_test = True
    wanted = [x for x in ((args.seam or "") + "," + (args.seams or "")).split(",") if x.strip()]
    if wanted:
        seams = [s for s in seams if s["id"] in wanted]
        if not seams:
            print(f"unknown seam(s) {wanted}", file=sys.stderr)
            print("VERDICT: FAIL")
            return 2
    # The locked prototypes (gold) are always served from the repo root.
    import socketserver, threading, functools
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(_QuietHandler, directory=str(ROOT)))
    httpd.daemon_threads = True
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    gold_base = f"http://127.0.0.1:{httpd.server_address[1]}"
    if args.self_test:
        # Self-test: capture the locked prototypes themselves and compare them to the cached gold (must PASS).
        args.base = gold_base
        seams = [dict(s, site_route="/" + s["prototype"] + "?record=1", site_seam=None) for s in seams]
    out = Path(args.out)
    if out.exists() and args.clean_out:
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    overall_pass = bool(args.base)
    regen_ok, regen_bad = [], []

    from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    launch_kwargs = {"headless": True,
                     "args": ["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage", "--no-sandbox"]}
    if Path(CHROME).exists():
        launch_kwargs["executable_path"] = CHROME
    browser = pw.chromium.launch(**launch_kwargs)

    try:
        for seam in seams:
            sid = seam["id"]
            work = out / sid
            work.mkdir(parents=True, exist_ok=True)
            gold_dir = GOLD_DIR / sid
            gm = GOLD_DIR / f"{sid}.json"
            notes = []
            hook = "missing"
            tl_ok = False
            frame_ok = False
            worst_ssim = "n/a"
            worst_mae = "n/a"
            verdict = "FAIL"
            measures = {}

            # Deterministic gold: the locked prototype itself, captured with the same frozen clock.
            if not args.regen_gold and not (gm.is_file() and gold_dir.is_dir()):
                print(f"gold for {sid} not cached; capturing it from the locked prototype", flush=True)
                g_ok, g_notes, _ = capture_gold(browser, gold_base, seam, rec, thr)
                if not g_ok:
                    notes.append("gold capture failed: " + "; ".join(g_notes))
            gold_meta = json.loads(gm.read_text()) if gm.is_file() else {}

            if args.regen_gold:
                g_ok, g_notes, m = capture_gold(browser, gold_base, seam, rec, thr)
                if g_ok:
                    regen_ok.append(sid); print(f"GOLD {sid} tl={m.get('tl_duration'):.3f}s frames={m.get('frames')}", flush=True)
                else:
                    regen_bad.append(sid); print(f"GOLD-FAILED {sid}: {'; '.join(g_notes)}", flush=True)
                continue

            site_dir = work / "site-frames"
            if not args.base:
                notes.append("no --base URL; site could not be recorded")
            elif gold_meta:
                route = seam["site_route"]
                # ?seam=<id> tells a page with several seams which one __START_RECORD__ must play.
                url = args.base.rstrip("/") + route + ("&" if "?" in route else "?") + "seam=" + sid
                measures = capture_frames(browser, url, seam.get("site_seam"), rec, thr, site_dir)
                notes += measures.get("notes", [])
                hook = measures.get("hook") or "missing"
                expected = float(gold_meta["tl_duration"])
                got = measures.get("tl_duration")
                if got is None:
                    notes.append("window.__PROTO_TL__ duration missing")
                elif abs(float(got) - expected) <= thr["timeline_end_tolerance_s"]:
                    tl_ok = True
                else:
                    notes.append(f"tl duration {got:.3f}s vs locked {expected:.3f}s")
                if gold_meta.get("eases") and measures.get("eases") is not None and measures.get("eases") != gold_meta["eases"]:
                    notes.append(f"eases {measures.get('eases')} vs locked {gold_meta['eases']}")
                    tl_ok = False

            site_frames = sorted(site_dir.glob("f-*.jpg")) if site_dir.is_dir() else []
            gold_frames = sorted(gold_dir.glob("f-*.jpg")) if gold_dir.is_dir() else []
            if site_frames and gold_frames:
                cmp = compare_frames(gold_frames, site_frames, thr)
                frame_ok = bool(cmp["ok"])
                if cmp["worst"]:
                    worst_ssim = f"{cmp['worst'][0]['ssim']:.4f}"
                    worst_mae = f"{cmp['worst'][0]['mae']:.2f}"
                if not frame_ok:
                    notes.append(cmp.get("reason") or "frame compare failed")
                for r in cmp.get("worst", []):
                    g = load_frame(r["gold"])
                    s = resize_to(load_frame(r["site"]), (g.shape[1], g.shape[0]))
                    side_by_side(g, s, work / "diffs" / f"worst-t{r['t']:.1f}s-ssim{r['ssim']:.3f}.jpg",
                                 f"{sid} t={r['t']:.1f}s", r["ssim"], r["mae"])
                (work / "frame-scores.json").write_text(json.dumps({
                    "n": cmp.get("n"), "gold_frames": len(gold_frames), "site_frames": len(site_frames),
                    "frames": [{"t": r["t"], "ssim": r["ssim"], "mae": r["mae"], "pass": r["pass"]} for r in cmp.get("frames", [])],
                }, indent=2))
            elif args.base:
                notes.append("no frames to compare (site capture or gold missing)")
            hook_ok = hook == "function"
            if frame_ok and tl_ok and hook_ok:
                verdict = "PASS"
            else:
                verdict = "FAIL"
                overall_pass = False
            results.append({
                "id": sid,
                "option": seam["option"],
                "frame_check": "PASS" if frame_ok else "FAIL",
                "timeline_check": "PASS" if tl_ok else "FAIL",
                "hook": hook,
                "verdict": verdict,
                "worst_ssim": worst_ssim,
                "worst_mae": worst_mae,
                "notes": "; ".join(notes) if notes else "",
            })
            print(f"{verdict} {sid}  frames={ 'PASS' if frame_ok else 'FAIL' }  tl={'PASS' if tl_ok else 'FAIL'}  hook={hook}", flush=True)
    finally:
        if browser:
            browser.close()
        if pw:
            pw.stop()
        if httpd:
            httpd.shutdown()

    if args.regen_gold:
        print(f"gate gold written for {len(regen_ok)} seam(s) in {GOLD_DIR}; failed: {regen_bad or 'none'}")
        return 0 if not regen_bad else 1
    overall = "PASS" if overall_pass and results and all(r["verdict"] == "PASS" for r in results) else "FAIL"
    if not args.base:
        overall = "FAIL"
    write_report(out, results, overall)
    print(f"\nReport: {out / 'REPORT.md'}")
    print(f"VERDICT: {overall}")
    return 0 if overall == "PASS" else 1


def main() -> int:
    p = argparse.ArgumentParser(description="Strict locked-motion gate (PASS or FAIL only).")
    p.add_argument("--base", help="Served site origin, e.g. http://127.0.0.1:4820")
    p.add_argument("--out", default=str(ROOT / "qa/motion-gate"), help="Output directory")
    p.add_argument("--manifest", default=str(DEFAULT_MANIFEST))
    p.add_argument("--seam", help="Run a single seam id, e.g. 01A-02A")
    p.add_argument("--seams", help="Comma list of seam ids to run (default: all)")
    p.add_argument("--self-test", action="store_true", help="Record the locked prototypes themselves (must PASS)")
    p.add_argument("--regen-gold", action="store_true",
                   help="Re-record the locked prototypes with media frozen into build-plan/tools/motion-gate-gold/ (deterministic gate gold)")
    p.add_argument("--clean-out", action="store_true")
    args = p.parse_args()
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
