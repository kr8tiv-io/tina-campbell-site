#!/usr/bin/env python3
"""Seam gate v2 (19 Nov 2026). PASS or FAIL only.

Source of truth: the locked GSAP prototypes in motion-reference/12-seam-transitions/<pair>/<opt>/index.html.
For each seam it checks, against the prototype run in the same browser:
  1. Timing table: every tween in window.__PROTO_TL__ (start, duration, ease, stagger, animated props, from/to
     values) must equal the prototype's within 1 ms / 0.001. Pin config (start, end, scrub, track/viewport ratio) too.
  2. Dense frames: the whole transition rendered at every 1% of scroll progress (101 frames, 1440x810), each
     settled (scrub tween completed) so capture is deterministic. Luma SSIM >= 0.92 and MAE <= 8 on every frame.
Usage:
  seam_gate.py --gold            # render prototype frames + tables into GOLD (gitignored)
  seam_gate.py --self-test       # prototype vs gold (must PASS, proves determinism)
  seam_gate.py --base http://127.0.0.1:4821 [--seams 01A-02A,...]   # site harness /motion-lab/seams/<id>/
"""
from __future__ import annotations
import argparse, json, shutil, sys, threading, functools, socketserver, http.server
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "build-plan/tools"))
from importlib.machinery import SourceFileLoader
mg = SourceFileLoader("mg", str(ROOT / "build-plan/tools/motion-gate.py")).load_module()
MANIFEST = json.loads((ROOT / "build-plan/tools/motion-gate-seams.json").read_text())
GOLD = ROOT / "build-plan-locked-2026-11-19/.gold"
W, H, STEPS = 1440, 810, 100
SSIM_MIN, MAE_MAX, T_TOL = 0.92, 8.0, 0.001

TABLE_JS = r"""() => {
  const tl = window.__PROTO_TL__; if (!tl) return null;
  const st = tl.scrollTrigger || null;
  const name = (e) => !e ? '' : typeof e === 'string' ? e : (e.id ? '#'+e.id : '') + (e.getAttribute && e.getAttribute('class') ? '.'+e.getAttribute('class').trim().split(/\s+/).join('.') : '') || e.tagName;
  const norm = (v) => typeof v === 'number' ? Math.round(v*1000)/1000 : (typeof v === 'string' ? v : (v && typeof v === 'object' && !Array.isArray(v) ? JSON.stringify(v) : String(v)));
  const skip = new Set(['ease','duration','stagger','delay','onComplete','onUpdate','onStart','immediateRender','lazy','callbackScope','overwrite','parent','runBackwards','startAt','data','id','paused','yoyo','repeat','keyframes']);
  const rows = tl.getChildren(true, true, true).map((t) => {
    const v = t.vars || {}; const props = {};
    Object.keys(v).sort().forEach((k) => { if (!skip.has(k)) props[k] = norm(v[k]); });
    const from = v.startAt ? Object.fromEntries(Object.keys(v.startAt).sort().filter(k=>!skip.has(k)).map(k=>[k,norm(v.startAt[k])])) : null;
    const tg = t.targets ? t.targets() : [];
    return { start: Math.round(t.startTime()*1000)/1000, dur: Math.round(t.duration()*1000)/1000,
             ease: v.ease ? String(v.ease) : 'default', stagger: v.stagger === undefined ? null : norm(v.stagger),
             n: tg.length, target: tg.length ? name(tg[0]) : '', props, from };
  });
  return { duration: Math.round(tl.duration()*1000)/1000, defaults: JSON.stringify(tl.vars.defaults || {}),
           pin: st ? { start: st.vars.start, end: st.vars.end, scrub: st.vars.scrub, anticipatePin: st.vars.anticipatePin || 0,
                       ratio: Math.round((st.end - st.start) / innerHeight * 1000) / 1000 } : null, rows };
}"""

SET_JS = r"""(p) => { const tl = window.__PROTO_TL__; const st = tl.scrollTrigger;
  const y = st.start + p * (st.end - st.start); window.scrollTo(0, y); ScrollTrigger.update();
  const tw = st.getTween && st.getTween(); if (tw) tw.progress(1); tl.progress(p); return [y, tl.progress()]; }"""

def serve(directory):
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Q, directory=str(directory))
    s = socketserver.ThreadingTCPServer(("127.0.0.1", 0), h); s.daemon_threads = True
    threading.Thread(target=s.serve_forever, daemon=True).start(); return s

def capture(browser, url, dest: Path):
    if dest.exists(): shutil.rmtree(dest)
    dest.mkdir(parents=True)
    ctx = browser.new_context(viewport={"width": W, "height": H}, device_scale_factor=1, reduced_motion="no-preference")
    ctx.add_init_script(mg.FREEZE_INIT_JS)
    pg = ctx.new_page(); notes = []
    try:
        pg.goto(url, wait_until="networkidle", timeout=45000)
        pg.wait_for_function("window.__PROTO_READY__ === true", timeout=20000)
        pg.evaluate("async () => { if (document.fonts) await document.fonts.ready; }")
        pg.evaluate(mg.FREEZE_MEDIA_JS)
        pg.evaluate("ScrollTrigger.refresh()"); pg.wait_for_timeout(300)
        table = pg.evaluate(TABLE_JS)
        if not table: return None, ["window.__PROTO_TL__ missing"]
        if not table["pin"]: notes.append("timeline has no scrollTrigger")
        for i in range(STEPS + 1):
            pg.evaluate(SET_JS, i / STEPS)
            pg.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            pg.screenshot(path=str(dest / f"p-{i:03d}.jpg"), type="jpeg", quality=90)
        (dest / "table.json").write_text(json.dumps(table, indent=1))
        return table, notes
    except Exception as e:
        return None, [f"capture error: {str(e).splitlines()[0]}"]
    finally:
        ctx.close()

def cmp_tables(g, s):
    diffs = []
    if g["duration"] != s["duration"]: diffs.append(f"duration {s['duration']} vs {g['duration']}")
    if g["defaults"] != s["defaults"]: diffs.append(f"defaults {s['defaults']} vs {g['defaults']}")
    if g["pin"] != s["pin"]: diffs.append(f"pin {s['pin']} vs {g['pin']}")
    if len(g["rows"]) != len(s["rows"]): diffs.append(f"tween count {len(s['rows'])} vs {len(g['rows'])}")
    for i, (a, b) in enumerate(zip(g["rows"], s["rows"])):
        for k in ("start", "dur"):
            if abs(a[k] - b[k]) > T_TOL: diffs.append(f"tween {i} {k} {b[k]} vs {a[k]}")
        for k in ("ease", "stagger", "n", "props", "from"):
            if a[k] != b[k]: diffs.append(f"tween {i} {k} {b[k]} vs {a[k]}")
    return diffs

def cmp_frames(gdir, sdir):
    rows = []
    for gp in sorted(gdir.glob("p-*.jpg")):
        sp = sdir / gp.name
        if not sp.exists(): rows.append((gp.name, 0.0, 255.0)); continue
        g = mg.load_frame(gp); s = mg.resize_to(mg.load_frame(sp), (g.shape[1], g.shape[0]))
        rows.append((gp.name, mg.ssim_luma(g, s), mg.mae_rgb(g, s)))
    return rows

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--gold", action="store_true"); ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--base"); ap.add_argument("--seams"); ap.add_argument("--out", default=str(ROOT / "qa/seam-gate"))
    a = ap.parse_args()
    seams = MANIFEST["seams"]
    if a.seams: seams = [s for s in seams if s["id"] in a.seams.split(",")]
    srv = serve(ROOT); proto_base = f"http://127.0.0.1:{srv.server_address[1]}"
    from playwright.sync_api import sync_playwright
    pw = sync_playwright().start()
    br = pw.chromium.launch(headless=True, executable_path=mg.CHROME, args=["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage", "--no-sandbox"])
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True); results = []; allpass = True
    try:
        for s in seams:
            sid = s["id"]; gdir = GOLD / sid
            if a.gold:
                t, n = capture(br, f"{proto_base}/{s['prototype']}", gdir)
                print(f"GOLD {sid} tweens={len(t['rows']) if t else 'ERR'} dur={t and t['duration']} {n}", flush=True); continue
            url = f"{proto_base}/{s['prototype']}" if a.self_test else a.base.rstrip("/") + f"/motion-lab/seams/{sid}/"
            sdir = out / sid / "frames"
            t, notes = capture(br, url, sdir)
            g = json.loads((gdir / "table.json").read_text())
            tdiff = cmp_tables(g, t) if t else ["no timeline captured"] + notes
            fr = cmp_frames(gdir, sdir) if t else []
            bad = [r for r in fr if r[1] < SSIM_MIN or r[2] > MAE_MAX]
            worst = min(fr, key=lambda r: r[1]) if fr else ("-", 0.0, 255.0)
            ok = not tdiff and fr and not bad
            allpass &= bool(ok)
            (out / sid / "scores.json").write_text(json.dumps({"timing_diffs": tdiff, "frames": [{"f": r[0], "ssim": round(r[1], 4), "mae": round(r[2], 2)} for r in fr]}, indent=1))
            if bad:
                for name, sv, mv in sorted(bad, key=lambda r: r[1])[:3]:
                    gg = mg.load_frame(gdir / name); ss = mg.resize_to(mg.load_frame(sdir / name), (gg.shape[1], gg.shape[0]))
                    mg.side_by_side(gg, ss, out / sid / "diffs" / f"{name}-ssim{sv:.3f}.jpg", f"{sid} {name}", sv, mv)
            results.append((sid, s["option"], "PASS" if ok else "FAIL", len(fr) and round(sum(r[1] for r in fr) / len(fr), 4), round(worst[1], 4), worst[0], len(bad), len(tdiff), "; ".join(tdiff[:3])))
            print(f"{'PASS' if ok else 'FAIL'} {sid} frames={len(fr)} bad={len(bad)} worst_ssim={worst[1]:.4f}@{worst[0]} timing_diffs={len(tdiff)}", flush=True)
    finally:
        br.close(); pw.stop(); srv.shutdown()
    if a.gold: return 0
    lines = ["# Seam gate v2", "", "| Seam | Option | Verdict | Mean SSIM | Worst SSIM | Worst frame | Bad frames /101 | Timing diffs | First diffs |", "|---|---|---|---|---|---|---|---|---|"]
    lines += [f"| {r[0]} | {r[1]} | **{r[2]}** | {r[3]} | {r[4]} | {r[5]} | {r[6]} | {r[7]} | {r[8]} |" for r in results]
    v = "PASS" if allpass and results else "FAIL"; lines += ["", f"VERDICT: {v}"]
    (out / "REPORT.md").write_text("\n".join(lines) + "\n"); print(f"VERDICT: {v}"); return 0 if v == "PASS" else 1

if __name__ == "__main__": sys.exit(main())
