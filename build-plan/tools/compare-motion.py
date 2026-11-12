#!/usr/bin/env python3
"""Extract N evenly spaced frames from an Imagine motion clip and a Playwright
recording, then write side-by-side composites plus a contact sheet.

This is a choreography gate, not a pixel-match test. Imagine clips contain
mock typography and stand-in crops; the built site uses live HTML and Tina's
real photos. Compare timing, easing, direction, and pin behaviour.
"""
from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont


def font(size: int) -> ImageFont.ImageFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def ffprobe_duration(path: str) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nokey=1:noprint_wrappers=1",
            path,
        ],
        text=True,
    ).strip()
    try:
        return float(out)
    except ValueError as exc:
        raise SystemExit(f"could not read duration for {path}: {out!r}") from exc


def extract_frames(src: str, dest_dir: os.PathLike[str] | str, count: int, prefix: str) -> list[str]:
    os.makedirs(dest_dir, exist_ok=True)
    duration = ffprobe_duration(src)
    if duration <= 0:
        raise SystemExit(f"zero duration: {src}")
    # Sample the middle of each of N equal slices, so first/last are not empty
    paths: list[str] = []
    for i in range(count):
        t = duration * ((i + 0.5) / count)
        out = os.path.join(dest_dir, f"{prefix}-{i:02d}.jpg")
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-ss",
                f"{t:.3f}",
                "-i",
                src,
                "-frames:v",
                "1",
                "-q:v",
                "3",
                out,
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        if not os.path.isfile(out):
            raise SystemExit(f"ffmpeg failed to write {out}")
        paths.append(out)
    return paths


def fit(im: Image.Image, height: int) -> Image.Image:
    if im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    return im.resize((max(1, round(w * (height / h))), height), Image.Resampling.LANCZOS)


def pair(left: Image.Image, right: Image.Image, caption: str, height: int = 720) -> Image.Image:
    l = fit(left, height)
    r = fit(right, height)
    gap = 8
    bar_h = 32
    canvas = Image.new("RGB", (l.width + gap + r.width, height + bar_h), (12, 12, 15))
    draw = ImageDraw.Draw(canvas)
    draw.text((12, 7), caption, fill=(240, 243, 244), font=font(15))
    canvas.paste(l, (0, bar_h))
    canvas.paste(r, (l.width + gap, bar_h))
    return canvas


def main() -> None:
    p = argparse.ArgumentParser(description="Frame-by-frame motion choreography compare.")
    p.add_argument("--clip", required=True, help="Approved Grok Imagine motion clip (mp4)")
    p.add_argument("--recording", required=True, help="Playwright recording of the built section")
    p.add_argument("--out-dir", required=True)
    p.add_argument("--frames", type=int, default=12)
    args = p.parse_args()

    if not os.path.isfile(args.clip):
        raise SystemExit(f"missing clip: {args.clip}")
    if not os.path.isfile(args.recording):
        raise SystemExit(f"missing recording: {args.recording}")

    os.makedirs(args.out_dir, exist_ok=True)
    raw = os.path.join(args.out_dir, "frames")
    os.makedirs(raw, exist_ok=True)

    clip_frames = extract_frames(args.clip, os.path.join(raw, "clip"), args.frames, "clip")
    rec_frames = extract_frames(args.recording, os.path.join(raw, "build"), args.frames, "build")

    pairs = []
    for i, (c, r) in enumerate(zip(clip_frames, rec_frames)):
        im = pair(Image.open(c), Image.open(r), f"FRAME {i:02d}   LEFT imagine clip   RIGHT local build")
        path = os.path.join(args.out_dir, f"frame-{i:02d}.jpg")
        im.save(path, "JPEG", quality=88, optimize=True)
        pairs.append(path)

    # Contact sheet: 4 columns
    cols = 4
    rows = (len(pairs) + cols - 1) // cols
    samples = [Image.open(path) for path in pairs]
    thumb_h = 280
    thumbs = [fit(im, thumb_h) for im in samples]
    cell_w = max(t.width for t in thumbs) + 8
    sheet = Image.new("RGB", (cell_w * cols, (thumb_h + 8) * rows), (12, 12, 15))
    for i, th in enumerate(thumbs):
        x = (i % cols) * cell_w
        y = (i // cols) * (thumb_h + 8)
        sheet.paste(th, (x, y))
    sheet_path = os.path.join(args.out_dir, "contact-sheet.jpg")
    sheet.save(sheet_path, "JPEG", quality=88, optimize=True)

    notes = os.path.join(args.out_dir, "MOTION-NOTES.md")
    if not os.path.exists(notes):
        with open(notes, "w") as fh:
            fh.write(
                "# Motion compare notes\n\n"
                f"Clip: `{args.clip}`\n\n"
                f"Recording: `{args.recording}`\n\n"
                "Look at every `frame-XX.jpg` and the contact sheet. Pixel match is not the test "
                "(Imagine clips have baked mock type and stand-in crops). Check:\n\n"
                "- [ ] Timing (when each move starts and ends)\n"
                "- [ ] Easing (ease weight, no linear pops unless the clip is linear)\n"
                "- [ ] Direction (up/down/left/right, what enters and what exits)\n"
                "- [ ] Pin behaviour (what stays pinned, when it releases)\n\n"
                "Gaps and fixes:\n\n- \n"
            )
    print(sheet_path)
    for path in pairs:
        print(path)


if __name__ == "__main__":
    main()
