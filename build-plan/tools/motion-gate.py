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

ROOT = Path("/workspace/tina-campbell")
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
        return (
            np.lib.stride_tricks.sliding_window_view(img, (win, win)) * kernel
        ).sum(axis=(-1, -2))

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


def extract_frames(video: Path, dest: Path, fps: float) -> list[Path]:
    dest.mkdir(parents=True, exist_ok=True)
    pattern = dest / "f-%04d.png"
    cmd = [
        "ffmpeg", "-y", "-i", str(video),
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


def compare_videos(gold: Path, site: Path, work: Path, rec: dict, thr: dict) -> dict:
    fps = 1.0 / float(thr["sample_every_s"])
    gold_frames = extract_frames(gold, work / "gold", fps)
    site_frames = extract_frames(site, work / "site", fps)
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
    }


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


def run(args: argparse.Namespace) -> int:
    manifest = json.loads(Path(args.manifest).read_text())
    rec, thr = manifest["record"], manifest["thresholds"]
    seams = manifest["seams"]
    if args.seam:
        seams = [s for s in seams if s["id"] == args.seam]
        if not seams:
            print(f"unknown seam {args.seam}", file=sys.stderr)
            return 2
    out = Path(args.out)
    if out.exists() and args.clean_out:
        shutil.rmtree(out)
    out.mkdir(parents=True, exist_ok=True)
    results = []
    overall_pass = True

    # Playwright only if we have a base URL to record
    browser = context = None
    if args.base:
        from playwright.sync_api import sync_playwright

        pw = sync_playwright().start()
        launch_kwargs = {
            "headless": True,
            "args": ["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage", "--no-sandbox"],
        }
        if Path(CHROME).exists():
            launch_kwargs["executable_path"] = CHROME
        browser = pw.chromium.launch(**launch_kwargs)
    else:
        pw = None
        overall_pass = False

    try:
        for seam in seams:
            sid = seam["id"]
            work = out / sid
            work.mkdir(parents=True, exist_ok=True)
            gold = ROOT / seam["clip"]
            notes = []
            hook = "missing"
            tl_ok = False
            frame_ok = False
            worst_ssim = "n/a"
            worst_mae = "n/a"
            verdict = "FAIL"
            measures = {}

            if not gold.is_file():
                notes.append(f"gold clip missing: {gold}")
                overall_pass = False
                results.append({
                    "id": sid, "option": seam["option"], "frame_check": "FAIL",
                    "timeline_check": "FAIL", "hook": hook, "verdict": "FAIL",
                    "worst_ssim": worst_ssim, "worst_mae": worst_mae,
                    "notes": "; ".join(notes),
                })
                print(f"FAIL {sid}: gold clip missing", flush=True)
                continue

            site_mp4 = work / "site.mp4"
            if not args.base:
                notes.append("no --base URL; site could not be recorded")
                overall_pass = False
            else:
                tmp = work / "_rec"
                if tmp.exists():
                    shutil.rmtree(tmp)
                tmp.mkdir()
                context = browser.new_context(
                    viewport={"width": rec["width"], "height": rec["height"]},
                    device_scale_factor=rec["device_scale_factor"],
                    record_video_dir=str(tmp),
                    record_video_size={"width": rec["width"], "height": rec["height"]},
                    reduced_motion="no-preference",
                )
                page = context.new_page()
                url = args.base.rstrip("/") + seam["site_route"]
                try:
                    page.goto(url, wait_until="networkidle", timeout=30000)
                    el = page.query_selector(seam["site_seam"])
                    if not el:
                        notes.append(f"missing {seam['site_seam']} on {seam['site_route']}")
                    else:
                        el.scroll_into_view_if_needed()
                    measures = record_site_seam(page, rec, tmp)
                    hook = measures.get("hook") or "missing"
                    if hook != "function":
                        notes.append("window.__START_RECORD__ missing (required)")
                    expected = float(seam["expected_tl_end"])
                    got = measures.get("tl_duration")
                    if got is None:
                        notes.append("window.__PROTO_TL__ duration missing")
                        tl_ok = False
                    elif abs(float(got) - expected) <= thr["timeline_end_tolerance_s"]:
                        tl_ok = True
                    else:
                        notes.append(f"tl duration {got:.3f}s vs expected {expected:.3f}s")
                        tl_ok = False
                    # scroll wall-clock includes hold + dur + tail (~6.65s)
                    expected_wall = rec["hold"] + rec["dur"] + rec["tail"]
                    wall = measures.get("scroll_dur")
                    if wall is not None and abs(float(wall) - expected_wall) > 0.5:
                        notes.append(f"record wall {wall:.2f}s vs expected ~{expected_wall:.2f}s")
                except Exception as e:
                    notes.append(f"record error: {e}")
                finally:
                    try:
                        context.close()
                    except Exception:
                        pass
                webms = list(tmp.glob("*.webm"))
                if webms:
                    transcode(webms[0], site_mp4)
                    shutil.rmtree(tmp, ignore_errors=True)
                else:
                    notes.append("no webm recorded from Playwright")

            if site_mp4.is_file() and gold.is_file():
                cmp = compare_videos(gold, site_mp4, work / "frames", rec, thr)
                frame_ok = bool(cmp["ok"])
                if cmp["worst"]:
                    worst_ssim = f"{cmp['worst'][0]['ssim']:.4f}"
                    worst_mae = f"{cmp['worst'][0]['mae']:.2f}"
                if not frame_ok:
                    notes.append(cmp.get("reason") or "frame compare failed")
                for r in cmp.get("worst", []):
                    g = load_frame(r["gold"])
                    s = resize_to(load_frame(r["site"]), (g.shape[1], g.shape[0]))
                    side_by_side(
                        g, s,
                        work / "diffs" / f"worst-t{r['t']:.1f}s-ssim{r['ssim']:.3f}.jpg",
                        f"{sid} t={r['t']:.1f}s",
                        r["ssim"], r["mae"],
                    )
                (work / "frame-scores.json").write_text(
                    json.dumps(
                        {
                            "gold_duration": cmp.get("gold_duration"),
                            "site_duration": cmp.get("site_duration"),
                            "n": cmp.get("n"),
                            "frames": [
                                {"t": r["t"], "ssim": r["ssim"], "mae": r["mae"], "pass": r["pass"]}
                                for r in cmp.get("frames", [])
                            ],
                        },
                        indent=2,
                    )
                )
            else:
                notes.append("site recording missing; cannot compare frames")

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
    p.add_argument("--clean-out", action="store_true")
    args = p.parse_args()
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
