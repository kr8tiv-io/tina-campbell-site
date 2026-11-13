#!/usr/bin/env python3
"""Record each GSAP prototype to clip.mp4 with Playwright."""
from __future__ import annotations

import http.server
import os
import re
import shutil
import socketserver
import subprocess
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]  # motion-options-2026-11-12
SEAM = Path(__file__).resolve().parents[1]
W, H = 1440, 810
PORT = 0


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        pass


def start_server():
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), Handler)
    httpd.allow_reuse_address = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return httpd, httpd.server_address[1]


def jobs(only):
    out = []
    for pair in sorted(p for p in SEAM.iterdir() if re.fullmatch(r"\d{2}[A-C]-\d{2}[A-C]", p.name)):
        for opt in sorted(pair.iterdir()):
            html = opt / "index.html"
            if not html.is_file():
                continue
            ident = f"{pair.name}/{opt.name}"
            if only and not any(s in ident for s in only):
                continue
            out.append((pair.name, opt.name, opt, f"/12-seam-transitions/{pair.name}/{opt.name}/index.html?record=1"))
    return out


def transcode(webm: Path, dest: Path):
    subprocess.check_call(
        [
            "ffmpeg", "-y", "-i", str(webm), "-an",
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-crf", "18", str(dest),
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def main():
    only = sys.argv[1:]
    items = jobs(only)
    if not items:
        print("no prototypes found", file=sys.stderr)
        sys.exit(1)
    httpd, port = start_server()
    failed = []
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path="/usr/bin/google-chrome",
            args=["--autoplay-policy=no-user-gesture-required", "--disable-dev-shm-usage", "--no-sandbox"],
        )
        for pair, opt, folder, url in items:
            tmp = folder / "_rec"
            if tmp.exists():
                shutil.rmtree(tmp)
            tmp.mkdir()
            context = browser.new_context(
                viewport={"width": W, "height": H},
                device_scale_factor=1,
                record_video_dir=str(tmp),
                record_video_size={"width": W, "height": H},
            )
            page = context.new_page()
            dest = folder / "clip.mp4"
            try:
                page.goto(f"http://127.0.0.1:{port}{url}", wait_until="networkidle", timeout=30000)
                page.wait_for_function("window.__PROTO_READY__ === true", timeout=15000)
                page.evaluate(
                    """async () => {
                      if (document.fonts && document.fonts.ready) await document.fonts.ready;
                      await Promise.all([...document.images].map((img) =>
                        (img.complete && img.naturalWidth) ? null :
                        new Promise((res) => { img.addEventListener('load', res, {once:true}); img.addEventListener('error', res, {once:true}); })
                      ));
                    }"""
                )
                page.wait_for_timeout(250)
                page.evaluate("window.__START_RECORD__()")
                page.wait_for_function("window.__PROTO_DONE__", timeout=20000)
                page.wait_for_timeout(250)
                context.close()
                webms = list(tmp.glob("*.webm"))
                if not webms:
                    raise RuntimeError("no webm recorded")
                transcode(webms[0], dest)
                shutil.rmtree(tmp, ignore_errors=True)
                print(f"OK  {pair}/{opt}  {dest.stat().st_size // 1024}k", flush=True)
            except Exception as e:
                failed.append(f"{pair}/{opt}: {e}")
                print(f"FAIL {pair}/{opt}: {e}", file=sys.stderr, flush=True)
                try:
                    context.close()
                except Exception:
                    pass
        browser.close()
    httpd.shutdown()
    if failed:
        print(f"\nFailed {len(failed)}:", file=sys.stderr)
        for f in failed:
            print(" ", f, file=sys.stderr)
        sys.exit(2)
    print("done", len(items))


if __name__ == "__main__":
    main()
