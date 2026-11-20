#!/usr/bin/env python3
"""Compare real-route seam timelines with the locked gold tables.

Reads window.__SEAM_TABLES__ from /?record=1 and /work/?record=1. Tweens must
match the gold table on start, duration, ease, stagger, animated props and
from/to values. Target names and target counts may differ because the real
sections are not the prototype markup. Does not edit seam_gate.py.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GOLD = ROOT / "build-plan-locked-2026-11-19/.gold"
T_TOL = 0.001
ROUTES = {
    "/?record=1": ["01A-02A", "02A-03B"],
    "/work/?record=1": ["04B-05C"],
}


def cmp_rows(gold: dict, live: dict) -> list[str]:
    diffs: list[str] = []
    if gold.get("duration") != live.get("duration"):
        diffs.append(f"duration {live.get('duration')} vs {gold.get('duration')}")
    if gold.get("defaults") != live.get("defaults"):
        diffs.append(f"defaults {live.get('defaults')} vs {gold.get('defaults')}")
    grows = gold.get("rows") or []
    lrows = live.get("rows") or []
    if len(grows) != len(lrows):
        diffs.append(f"tween count {len(lrows)} vs {len(grows)}")
    for i, (a, b) in enumerate(zip(grows, lrows)):
        for key in ("start", "dur"):
            if abs(float(a[key]) - float(b[key])) > T_TOL:
                diffs.append(f"tween {i} {key} {b[key]} vs {a[key]}")
        for key in ("ease", "stagger", "props", "from"):
            if a.get(key) != b.get(key):
                diffs.append(f"tween {i} {key} {b.get(key)} vs {a.get(key)}")
    return diffs


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="http://127.0.0.1:4821")
    args = ap.parse_args()
    sys.path.insert(0, str(ROOT / "build-plan/tools"))
    from importlib.machinery import SourceFileLoader

    mg = SourceFileLoader("mg", str(ROOT / "build-plan/tools/motion-gate.py")).load_module()
    from playwright.sync_api import sync_playwright

    pw = sync_playwright().start()
    browser = pw.chromium.launch(
        headless=True,
        executable_path=mg.CHROME,
        args=["--disable-dev-shm-usage", "--no-sandbox"],
    )
    ok = True
    try:
        for path, expect in ROUTES.items():
            ctx = browser.new_context(viewport={"width": 1440, "height": 810}, reduced_motion="no-preference")
            page = ctx.new_page()
            page.goto(args.base.rstrip("/") + path, wait_until="networkidle", timeout=45000)
            page.wait_for_function("window.__PROTO_READY__ === true", timeout=20000)
            page.wait_for_function("window.__SEAM_TABLES__ && Object.keys(window.__SEAM_TABLES__).length > 0", timeout=20000)
            tables = page.evaluate("() => window.__SEAM_TABLES__")
            ctx.close()
            for pair in expect:
                live = tables.get(pair) if isinstance(tables, dict) else None
                gold = json.loads((GOLD / pair / "table.json").read_text())
                diffs = ["missing __SEAM_TABLES__[" + pair + "]"] if not live else cmp_rows(gold, live)
                status = "PASS" if not diffs else "FAIL"
                if diffs:
                    ok = False
                print(f"{status} {pair} on {path} diffs={len(diffs)}", flush=True)
                for line in diffs[:8]:
                    print(f"  {line}", flush=True)
    finally:
        browser.close()
        pw.stop()
    print("VERDICT: PASS" if ok else "VERDICT: FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
