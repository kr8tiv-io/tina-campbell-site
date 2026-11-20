#!/usr/bin/env python3
"""Real-route seam visual check (19 Nov 2026). PASS or FAIL only. Complements seam_route_check.py (tables).

For each wired pair it scrolls the real route (?record=1, native scroll) through the [data-seam-pair] wrapper in 21 steps
(top of wrapper to its bottom minus one viewport), waits for the 0.6 s scrub to settle, screenshots at 1440x810 and measures
the share of near-black pixels (luma < 18) below the 80 px header. The gold prototype frames (.gold/<pair>/p-XXX.jpg) give the
allowed darkness at the same progress. FAIL if any step is darker than gold + 0.20 (wrapper scroll length is reported
for review, not gated, because the wrapper also holds the real sections). Writes a contact sheet per pair for visual review.
Usage: seam_route_visual.py --base http://127.0.0.1:4821 [--out qa/seam-route-visual]
"""
from __future__ import annotations
import argparse, json, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
GOLD = ROOT / "build-plan-locked-2026-11-19/.gold"
ROUTES = {"/": ["01A-02A", "02A-03B"], "/work/": ["04B-05C"]}
W, H, STEPS, SLACK = 1440, 810, 20, 0.20

def dark(arr):
    a = arr[80:].astype(np.float64); l = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    return float((l < 18).mean())

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--base", default="http://127.0.0.1:4821")
    ap.add_argument("--out", default=str(ROOT / "qa/seam-route-visual")); ap.add_argument("--mobile", action="store_true"); a = ap.parse_args()
    global W, H
    if a.mobile: W, H = 390, 844   # gold darkness still read from the 1440 frames (same progress)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    br = pw.chromium.launch(headless=True, executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--disable-dev-shm-usage"])
    ok = True; lines = ["# Seam route visual check", "", "| Pair | Verdict | Worst step | Site dark | Gold dark | Scroll len (vh) | Gold pin (vh) |", "|---|---|---|---|---|---|---|"]
    try:
        for route, pairs in ROUTES.items():
            for pair in pairs:
                ctx = br.new_context(viewport={"width": W, "height": H}, reduced_motion="no-preference", is_mobile=a.mobile, has_touch=a.mobile); pg = ctx.new_page()
                pg.goto(a.base.rstrip("/") + route + "?record=1", wait_until="networkidle", timeout=60000)
                pg.wait_for_timeout(1500)
                box = pg.evaluate(f"""() => {{ const e = document.querySelector('[data-seam-pair="{pair}"]'); if (!e) return null;
                    const r = e.getBoundingClientRect(); return {{ top: r.top + scrollY, h: r.height }}; }}""")
                gold_tab = json.loads((GOLD / pair / "table.json").read_text()); gpin = (gold_tab.get("pin") or {}).get("ratio") or 0
                if not box:
                    ok = False; lines.append(f"| {pair} | **FAIL** | no [data-seam-pair] | | | | {gpin} |"); ctx.close(); continue
                span = max(0.0, box["h"] - H); rows = []; shots = []
                for i in range(STEPS + 1):
                    y = box["top"] + span * i / STEPS
                    pg.evaluate(f"() => {{ window.scrollTo(0, {y}); if (window.ScrollTrigger) ScrollTrigger.update(); }}")
                    pg.wait_for_timeout(900)
                    p = out / pair / f"s-{i:02d}.jpg"; p.parent.mkdir(parents=True, exist_ok=True)
                    pg.screenshot(path=str(p), type="jpeg", quality=85)
                    s = np.asarray(Image.open(p).convert("RGB")); g = np.asarray(Image.open(GOLD / pair / f"p-{round(i * 100 / STEPS):03d}.jpg").convert("RGB").resize((W, H)))
                    rows.append((i, dark(s), dark(g))); shots.append(Image.open(p).resize((288, 162) if not a.mobile else (117, 253)))
                ctx.close()
                tw, th = shots[0].size; sheet = Image.new("RGB", (tw * 7, th * 3), (12, 12, 15))
                for k, im in enumerate(shots): sheet.paste(im, ((k % 7) * tw, (k // 7) * th))
                sheet.save(out / f"sheet-{pair}.jpg", quality=85)
                worst = max(rows, key=lambda r: r[1] - r[2]); lenvh = round(box["h"] / H, 2)
                good = worst[1] - worst[2] <= SLACK  # length is reported, not gated (wrappers contain real sections)
                ok &= good
                lines.append(f"| {pair} | **{'PASS' if good else 'FAIL'}** | {worst[0]} | {worst[1]:.2f} | {worst[2]:.2f} | {lenvh} | {gpin} |")
                print(f"{'PASS' if good else 'FAIL'} {pair} worst step {worst[0]} dark {worst[1]:.2f} vs gold {worst[2]:.2f}, len {lenvh}vh vs pin {gpin}", flush=True)
    finally:
        br.close(); pw.stop()
    lines += ["", f"VERDICT: {'PASS' if ok else 'FAIL'}"]; (out / "REPORT.md").write_text("\n".join(lines) + "\n")
    print(f"VERDICT: {'PASS' if ok else 'FAIL'}"); return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
