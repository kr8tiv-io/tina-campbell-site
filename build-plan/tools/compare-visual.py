#!/usr/bin/env python3
"""Side-by-side composite: reference layout or PDF page (left) vs local build screenshot (right)."""
from __future__ import annotations

import argparse
import os
import sys

from PIL import Image, ImageDraw, ImageFont


def font(size: int) -> ImageFont.ImageFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def fit_height(im: Image.Image, height: int) -> Image.Image:
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    elif im.mode == "RGBA":
        bg = Image.new("RGB", im.size, (12, 12, 15))
        bg.paste(im, mask=im.split()[-1])
        im = bg
    w, h = im.size
    if h == 0:
        raise SystemExit("empty image")
    new_w = max(1, round(w * (height / h)))
    return im.resize((new_w, height), Image.Resampling.LANCZOS)


def label_bar(width: int, text: str, bar_h: int = 36) -> Image.Image:
    bar = Image.new("RGB", (width, bar_h), (12, 12, 15))
    draw = ImageDraw.Draw(bar)
    draw.text((12, 8), text, fill=(240, 243, 244), font=font(16))
    return bar


def main() -> None:
    p = argparse.ArgumentParser(description="Composite a reference image beside a build screenshot.")
    p.add_argument("--shot", required=True, help="Built-site screenshot")
    p.add_argument("--ref", required=True, help="Layout or PDF concept image")
    p.add_argument("--out", required=True, help="Output JPEG/PNG path")
    p.add_argument("--label-left", default="REFERENCE")
    p.add_argument("--label-right", default="LOCAL BUILD")
    p.add_argument("--height", type=int, default=1100, help="Panel height in px")
    args = p.parse_args()

    if not os.path.isfile(args.ref):
        raise SystemExit(f"missing ref: {args.ref}")
    if not os.path.isfile(args.shot):
        raise SystemExit(f"missing shot: {args.shot}")

    left = fit_height(Image.open(args.ref), args.height)
    right = fit_height(Image.open(args.shot), args.height)
    gap = 8
    bar_h = 36
    width = left.width + gap + right.width
    canvas = Image.new("RGB", (width, args.height + bar_h), (12, 12, 15))
    canvas.paste(label_bar(left.width, args.label_left, bar_h), (0, 0))
    canvas.paste(label_bar(right.width, args.label_right, bar_h), (left.width + gap, 0))
    canvas.paste(left, (0, bar_h))
    canvas.paste(right, (left.width + gap, bar_h))

    os.makedirs(os.path.dirname(os.path.abspath(args.out)) or ".", exist_ok=True)
    ext = os.path.splitext(args.out)[1].lower()
    if ext in {".jpg", ".jpeg"}:
        canvas.save(args.out, "JPEG", quality=90, optimize=True)
    else:
        canvas.save(args.out)
    print(args.out)


if __name__ == "__main__":
    main()
