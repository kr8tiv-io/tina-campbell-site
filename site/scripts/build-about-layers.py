#!/usr/bin/env python3
"""Cut About hero layers from Tina Campbell's real photos.

Far plate: Edmonton dusk sky and skyline from fb_168_city.jpg, graded to the
clip 06 dusk palette (upper ~#E5B5B3 / #D2A8B2, lower ~#63374D).
Middle: Walterdale arch cut from fb_066_city.jpg (sky keyed, feathered alpha).
Foreground: photographer with a camera to her eye, cut from ig_profile_05.jpg
(the closest real frame of a person shooting; Tina has not supplied a portrait
of herself). Sky is keyed. The cut is flipped horizontally so she faces the
skyline, then crushed toward a dusk silhouette.

No new pixels of a person are invented. Watermarks are cropped out, not erased.
"""

from __future__ import annotations

import os
from collections import deque

import cv2
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
IMAGES = os.path.join(ROOT, 'images')
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src', 'assets', 'about-layers'))

# Clip 06 samples, 1280x720 photo area.
UPPER = np.array([229, 181, 179], dtype=np.float32)  # #E5B5B3
MID = np.array([210, 168, 178], dtype=np.float32)  # #D2A8B2
LOWER = np.array([99, 55, 77], dtype=np.float32)  # #63374D
INK = np.array([12, 12, 15], dtype=np.float32)  # #0C0C0F


def load(name: str) -> np.ndarray:
    return np.asarray(Image.open(os.path.join(IMAGES, name)).convert('RGB'))


def save_rgba(arr: np.ndarray, stem: str) -> None:
    os.makedirs(OUT, exist_ok=True)
    img = Image.fromarray(arr, 'RGBA')
    img.save(os.path.join(OUT, stem + '.png'), 'PNG', optimize=True)
    img.save(os.path.join(OUT, stem + '.webp'), 'WEBP', quality=84, method=6)
    print(stem, img.size, 'alpha', int((arr[:, :, 3] > 16).sum()))


def feather(alpha: np.ndarray, radius: float) -> np.ndarray:
    im = Image.fromarray(alpha)
    im = im.filter(ImageFilter.GaussianBlur(radius=radius))
    return np.asarray(im)


def dilate(alpha: np.ndarray, size: int) -> np.ndarray:
    im = Image.fromarray(alpha)
    im = im.filter(ImageFilter.MaxFilter(size=size if size % 2 else size + 1))
    return np.asarray(im)


def flood(binary: np.ndarray, seeds: list[tuple[int, int]]) -> np.ndarray:
    h, w = binary.shape
    seen = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()
    for y, x in seeds:
        if 0 <= y < h and 0 <= x < w and binary[y, x] and not seen[y, x]:
            seen[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        if y > 0 and binary[y - 1, x] and not seen[y - 1, x]:
            seen[y - 1, x] = True
            q.append((y - 1, x))
        if y + 1 < h and binary[y + 1, x] and not seen[y + 1, x]:
            seen[y + 1, x] = True
            q.append((y + 1, x))
        if x > 0 and binary[y, x - 1] and not seen[y, x - 1]:
            seen[y, x - 1] = True
            q.append((y, x - 1))
        if x + 1 < w and binary[y, x + 1] and not seen[y, x + 1]:
            seen[y, x + 1] = True
            q.append((y, x + 1))
    return seen


def fill_holes(alpha: np.ndarray) -> np.ndarray:
    """Fill enclosed gaps. Openings that touch the border stay open."""
    mask = (alpha > 40).astype(np.uint8) * 255
    # A one-pixel empty border makes every outside region reachable from (0, 0).
    padded = cv2.copyMakeBorder(mask, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
    inv = cv2.bitwise_not(padded)
    ff_mask = np.zeros((inv.shape[0] + 2, inv.shape[1] + 2), np.uint8)
    cv2.floodFill(inv, ff_mask, (0, 0), 0)
    holes = inv[1:-1, 1:-1]
    return cv2.bitwise_or(mask, holes)


def trim(rgba: np.ndarray, pad: int = 8) -> np.ndarray:
    alpha = rgba[:, :, 3]
    ys, xs = np.where(alpha > 12)
    if len(xs) == 0:
        return rgba
    y0, y1 = max(0, ys.min() - pad), min(rgba.shape[0], ys.max() + pad + 1)
    x0, x1 = max(0, xs.min() - pad), min(rgba.shape[1], xs.max() + pad + 1)
    return rgba[y0:y1, x0:x1]


def lerp(a: np.ndarray, b: np.ndarray, t: np.ndarray) -> np.ndarray:
    return a * (1 - t) + b * t


def dusk_gradient(h: int, w: int) -> np.ndarray:
    y = np.linspace(0, 1, h, dtype=np.float32)
    c = np.zeros((h, 3), dtype=np.float32)
    for i, t in enumerate(y):
        if t <= 0.22:
            c[i] = lerp(UPPER, MID, t / 0.22)
        elif t <= 0.48:
            c[i] = lerp(MID, LOWER, (t - 0.22) / 0.26)
        elif t <= 0.78:
            c[i] = lerp(LOWER, LOWER * 0.45 + INK * 0.55, (t - 0.48) / 0.30)
        else:
            c[i] = lerp(LOWER * 0.45 + INK * 0.55, INK, (t - 0.78) / 0.22)
    out = np.broadcast_to(c[:, None, :], (h, w, 3)).copy()
    # Soft sun left of centre, so the open sky is not a flat fill.
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    sun = np.exp(-(((xx - 0.42) ** 2) / 0.08 + ((yy - 0.55) ** 2) / 0.02))
    out += sun[..., None] * np.array([40, 12, 8], dtype=np.float32)
    return np.clip(out, 0, 255)


def build_sky() -> np.ndarray:
    src = load('fb_168_city.jpg').astype(np.float32)
    # Valley overlook: pink sky, sun, towers on the right, dark trees below.
    # The TCPhoto script is in the bushes under this crop.
    band = src[700:1420, 0:1380]
    plate_h, plate_w = 1000, 2050
    photo = np.asarray(
        Image.fromarray(np.clip(band, 0, 255).astype(np.uint8)).resize((plate_w, plate_h), Image.Resampling.LANCZOS)
    ).astype(np.float32)
    grad = dusk_gradient(plate_h, plate_w)
    lum = photo.mean(axis=2, keepdims=True)
    sky_w = np.clip((lum - 70) / 130, 0, 1)
    blur = np.asarray(Image.fromarray(photo.astype(np.uint8)).filter(ImageFilter.GaussianBlur(22))).astype(np.float32)
    detail = photo - blur
    # Bright sky takes the clip palette and keeps her cloud detail. Towers and
    # the evergreen ridge stay photographic, pulled a little toward dusk.
    base = photo * 0.55 + grad * 0.45
    out = base * (1 - sky_w) + (grad * 0.78 + detail * 0.45) * sky_w
    out = out + detail * 0.25 * (1 - sky_w)
    # Darken the ridge so it reads as the bottom-left tree mass, then ink.
    y = np.linspace(0, 1, plate_h, dtype=np.float32)[:, None, None]
    shade = np.clip((y - 0.34) / 0.42, 0, 1)
    out = out * (1 - shade * 0.72) + INK * (shade * 0.55)
    fade = np.clip((y - 0.68) / 0.32, 0, 1) ** 1.05
    out = out * (1 - fade * 0.96) + INK * (fade * 0.96)
    # Pull the open sky onto the clip samples. Towers stay photographic.
    # A second, stronger lift so the upper viewport reads #E5B5B3 / #D2A8B2
    # even after object-fit cover crops the plate.
    top = np.clip((0.58 - y) / 0.58, 0, 1)
    lift = np.clip(top * 1.2, 0, 1)
    out = out * (1 - lift) + grad * lift
    rgba = np.zeros((plate_h, plate_w, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(out, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = 255
    # Report the grade so the palette can be checked.
    print('sky upper', rgba[80, plate_w // 2, :3].tolist(), 'lower', rgba[520, plate_w // 2, :3].tolist())
    return rgba


def build_arch() -> np.ndarray:
    """Walterdale from fb_066, side view. Sky keyed. Not a mirrored frontal arch.

    The @_TCPHOTO line sits on the ice under the deck, so the crop stops above it.
    """
    src = load('fb_066_city.jpg')[:398]
    h, w = src.shape[:2]
    hsv = cv2.cvtColor(src, cv2.COLOR_RGB2HSV)
    hue, sat, val = cv2.split(hsv)
    lum = src.astype(np.float32).mean(axis=2)
    gray = cv2.cvtColor(src, cv2.COLOR_RGB2GRAY)
    mag = np.hypot(
        cv2.Sobel(gray, cv2.CV_32F, 1, 0, ksize=3),
        cv2.Sobel(gray, cv2.CV_32F, 0, 1, ksize=3),
    )
    struct = cv2.dilate(
        (mag > 24).astype(np.uint8) * 255,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)),
    )
    blue = (hue >= 78) & (hue <= 130) & (sat >= 30) & (val >= 28)
    white_sky = (val > 214) & (sat < 48) & (struct == 0)
    cloud = (val > 175) & (sat < 80) & (hue > 70) & (hue < 135) & (struct == 0) & (lum > 150)
    alpha = np.where(blue | white_sky | cloud, 0, 255).astype(np.uint8)
    yy = np.arange(h)[:, None]
    xx = np.arange(w)[None, :]
    # Far bank under the deck, and the towers to the right of the truss.
    alpha[(yy > 352) & (lum < 130) & (mag < 16)] = 0
    alpha[(yy > 255) & (xx > 700)] = 0
    # Sun field and the cloud spray, flooded from the top-right corner.
    bright = ((lum > 160) & (mag < 20)).astype(np.uint8) * 255
    flood = bright.copy()
    cv2.floodFill(flood, np.zeros((h + 2, w + 2), np.uint8), (w - 8, 12), 128)
    alpha[flood == 128] = 0
    # Bright cloud pockets inside the opening. Skip a flood that escapes to the edge.
    for seed in ((280, 180), (360, 200), (420, 220), (250, 260), (340, 280), (480, 240)):
        if bright[seed[1], seed[0]] == 0:
            continue
        pocket = bright.copy()
        cv2.floodFill(pocket, np.zeros((h + 2, w + 2), np.uint8), seed, 128)
        if (pocket[0] == 128).mean() > 0.2 or (pocket[:, -1] == 128).mean() > 0.2:
            continue
        alpha[pocket == 128] = 0
    thick = cv2.morphologyEx(
        (alpha > 128).astype(np.uint8) * 255,
        cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)),
    )
    alpha[(xx > 530) & (yy < 155) & (thick == 0)] = 0
    # Remaining bright clouds inside the rib. Cables are dark and stay.
    opening = np.zeros((h, w), np.uint8)
    poly = np.array(
        [[230, 300], [250, 200], [320, 130], [400, 105], [470, 140], [530, 210], [560, 280], [500, 310], [280, 320]],
        np.int32,
    )
    cv2.fillPoly(opening, [poly], 255)
    # Bright clouds inside the rib only. The truss is outside this polygon.
    alpha[(opening > 0) & (lum > 168) & (mag < 14)] = 0
    # Close only the blown-out crown so the rib meets the truss.
    crown = alpha.copy()
    crown[72:] = 0
    crown = cv2.morphologyEx(
        crown, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 15))
    )
    alpha = np.maximum(alpha, crown)
    # Pull the deck together. The ice and the signature are already below the crop.
    deck = alpha.copy()
    deck[:305] = 0
    deck = cv2.morphologyEx(deck, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (21, 7)))
    alpha = np.maximum(alpha, deck)
    alpha[:, 760:] = 0
    # Soften the crop edge so the deck does not draw a hard line on the trees.
    fade_rows = 26
    alpha = alpha.astype(np.float32)
    alpha[-fade_rows:] *= np.linspace(1, 0, fade_rows, dtype=np.float32)[:, None]
    alpha = alpha.astype(np.uint8)
    dil = cv2.dilate(
        (alpha > 100).astype(np.uint8) * 255,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)),
    )
    n, labels, stats, _ = cv2.connectedComponentsWithStats((dil > 0).astype(np.uint8), 8)
    if n > 1:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        alpha[labels != biggest] = 0
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    photo = src.astype(np.float32)
    green = np.clip((photo[:, :, 1] - photo[:, :, 0]) / 45.0, 0, 1)
    photo[:, :, 1] = photo[:, :, 1] * (1 - 0.62 * green) + photo[:, :, 0] * (0.62 * green)
    hi = np.clip((lum - 130) / 100, 0, 1)[..., None]
    dusk = np.array([220, 180, 172], dtype=np.float32)
    tinted = photo * (1 - hi * 0.42) + dusk * (hi * 0.42)
    tinted = np.where(lum[..., None] < 70, photo * 0.8, tinted)
    tinted = tinted * 0.9
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(tinted, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = alpha.astype(np.uint8)
    rgba = trim(rgba, 2)
    # Cloud still clinging inside the opening, right of the rib and left of the truss.
    hh, ww = rgba.shape[:2]
    lum2 = rgba[:, :, :3].astype(np.float32).mean(axis=2)
    ys, xs = np.mgrid[0:hh, 0:ww]
    zone = (xs > int(ww * 0.42)) & (xs < int(ww * 0.78)) & (ys > int(hh * 0.04)) & (ys < int(hh * 0.59))
    rgba[:, :, 3][zone & (lum2 > 155)] = 0
    # Pale cloud and ice still sitting in the lower opening, above the deck fade.
    # The rib is left of 20% and the truss is right of 70%. Cables are dark and stay.
    lower = (xs > int(ww * 0.20)) & (xs < int(ww * 0.70)) & (ys > int(hh * 0.74)) & (ys < int(hh * 0.97))
    rgba[:, :, 3][lower & (lum2 > 148)] = 0
    rgba[:, :, 3][(xs > int(ww * 0.90)) & (ys > int(hh * 0.55))] = 0
    wisp = (xs > int(ww * 0.67)) & (ys < int(hh * 0.21)) & (lum2 > 170)
    rgba[:, :, 3][wisp] = 0
    return rgba


def build_figure() -> np.ndarray:
    """Photographer from ig_profile_05, camera at the eye. Not a portrait of Tina.

    The model on the left is outside the crop. GrabCut keeps the person on the
    right: black clothes, blonde bun, camera raised. Brick, sky, railing and
    the floor are background. The cut is flipped so she faces the skyline.
    """
    rgb = load('ig_profile_05.jpg')
    y0, y1, x0, x1 = 330, 1120, 330, 640
    roi = np.ascontiguousarray(rgb[y0:y1, x0:x1])
    rh, rw = roi.shape[:2]
    rr = roi[:, :, 0].astype(np.int16)
    rg = roi[:, :, 1].astype(np.int16)
    rb = roi[:, :, 2].astype(np.int16)
    lum = roi.astype(np.float32).mean(axis=2)
    yy = np.arange(rh)[:, None]
    xx = np.arange(rw)[None, :]
    full_y = yy + y0
    full_x = xx + x0
    mask = np.full((rh, rw), cv2.GC_PR_BGD, np.uint8)
    sky = (rb > rr + 18) & (rb > 110) & (lum > 90)
    brick = (rr > 160) & (rg > 140) & (rb > 130) & (np.abs(rr - rg) < 40) & (lum > 150) & (full_y < 500)
    bright = lum > 165
    floor = (full_y > 1000) & (lum > 90)
    mask[sky | brick | bright | floor] = cv2.GC_BGD
    mask[:, :20] = cv2.GC_BGD
    torso = (full_x > 530) & (full_y > 480) & (full_y < 1080) & (lum < 60)
    hair = (
        (full_y > 360) & (full_y < 470) & (full_x > 520) & (full_x < 630)
        & (rr > 140) & (rr > rb + 20) & (lum > 80) & (lum < 220)
    )
    arm = (full_y > 390) & (full_y < 500) & (full_x > 400) & (full_x < 560) & (lum < 55)
    mask[torso | hair | arm] = cv2.GC_FGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(roi, mask, None, bgd, fgd, 5, cv2.GC_INIT_WITH_MASK)
    alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    alpha[sky | brick | (lum > 175)] = 0
    n, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 0).astype(np.uint8), 8)
    seed_y, seed_x = 700 - y0, 580 - x0
    seed = int(labels[seed_y, seed_x])
    if seed:
        alpha[labels != seed] = 0
    alpha = fill_holes(alpha)
    # Close the notch where the railing crossed the sleeve. Do not regrow into sky.
    alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    # Fill the bun. Brick shows through the blonde, and those gaps touch the outside.
    hys, hxs = np.where(hair)
    if len(hxs) > 30:
        hull = cv2.convexHull(np.stack([hxs, hys], axis=1).astype(np.int32))
        bun = np.zeros_like(alpha)
        cv2.fillConvexPoly(bun, hull, 255)
        bun[sky] = 0
        alpha = np.maximum(alpha, bun)
    alpha[sky | (lum > 185)] = 0
    n, labels, stats, _ = cv2.connectedComponentsWithStats((alpha > 20).astype(np.uint8), 8)
    if n > 1:
        biggest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
        alpha[labels != biggest] = 0
    alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
    # Dusk silhouette. The bun stays a little lighter so the head reads.
    hair_lift = cv2.dilate(hair.astype(np.uint8) * 255, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
    tone = np.zeros_like(roi, dtype=np.float32)
    tone[:] = (16, 12, 14)
    tone[hair_lift > 0] = (58, 42, 34)
    # A hint of the jacket fold so the shoulder is not a flat box.
    form = np.clip((70 - lum) / 70, 0, 1)[..., None]
    tone = tone * (0.72 + 0.28 * form)
    rgba = np.zeros((rh, rw, 4), dtype=np.uint8)
    rgba[:, :, :3] = np.clip(tone, 0, 255).astype(np.uint8)
    rgba[:, :, 3] = alpha
    rgba = trim(rgba, 2)
    flipped = np.array(Image.fromarray(rgba, 'RGBA').transpose(Image.Transpose.FLIP_LEFT_RIGHT))
    return trim(flipped, 2)


def preview(sky: np.ndarray, arch: np.ndarray, figure: np.ndarray) -> None:
    # Photo box at 1280x720 under a 100px header: 1280 x 620.
    box = Image.fromarray(sky, 'RGBA').resize((1280, 620), Image.Resampling.LANCZOS)
    stage = Image.new('RGBA', (1280, 620), (0, 0, 0, 255))
    stage.alpha_composite(box)
    arch_img = Image.fromarray(arch, 'RGBA')
    aw = int(1280 * 0.37)
    ah = int(aw * arch_img.height / arch_img.width)
    arch_img = arch_img.resize((aw, ah), Image.Resampling.LANCZOS)
    # Arch top at 33% of the 720 viewport, header 100px.
    stage.alpha_composite(arch_img, (int(1280 * 0.34), max(0, int(0.33 * 720) - 100)))
    fig = Image.fromarray(figure, 'RGBA')
    fw = int(1280 * 0.13)
    fh = int(fw * fig.height / fig.width)
    fig = fig.resize((fw, fh), Image.Resampling.LANCZOS)
    stage.alpha_composite(fig, (int(1280 * 0.06), max(0, int(0.21 * 720) - 100)))
    os.makedirs('/tmp/about-preview', exist_ok=True)
    stage.convert('RGB').save('/tmp/about-preview/hero-1280.jpg', quality=86)
    print('preview /tmp/about-preview/hero-1280.jpg', stage.size)


def main() -> None:
    sky = build_sky()
    arch = build_arch()
    figure = build_figure()
    save_rgba(sky, 'sky')
    save_rgba(arch, 'arch')
    save_rgba(figure, 'figure')
    preview(sky, arch, figure)


if __name__ == '__main__':
    main()
