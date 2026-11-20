#!/usr/bin/env python3
# Detail-masked blend: ESRGAN where the frame has real texture, Lanczos in flat areas (sky, walls) so H.264 banding in the
# 720p source is never "sharpened" into streaks. Motion untouched (both inputs are frame-exact upscales of the same clip).
# Usage: hybrid.py <clip720.mp4> <esrgan1080.mp4> <out.mp4>
import sys, subprocess, numpy as np, cv2
clip, esr, out = sys.argv[1:4]; W, H = 1920, 1080; N = W * H * 3
def rd(args): return subprocess.Popen(['ffmpeg', '-v', 'error'] + args + ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
a = rd(['-i', clip, '-map', '0:v:0', '-vf', 'scale=1920:1080:flags=lanczos'])
b = rd(['-i', esr, '-map', '0:v:0'])
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '10', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], stdin=subprocess.PIPE)
n = 0
while True:
    x = a.stdout.read(N); y = b.stdout.read(N)
    if len(x) < N or len(y) < N: break
    L = np.frombuffer(x, np.uint8).reshape(H, W, 3).astype(np.float32); E = np.frombuffer(y, np.uint8).reshape(H, W, 3).astype(np.float32)
    g = cv2.cvtColor(L.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32)
    mag = np.hypot(cv2.Sobel(g, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(g, cv2.CV_32F, 0, 1, ksize=3))
    m = cv2.GaussianBlur(np.clip((mag - 6.0) / 18.0, 0, 1), (0, 0), 3)[..., None]
    enc.stdin.write((L * (1 - m) + E * m + 0.5).clip(0, 255).astype(np.uint8).tobytes()); n += 1
enc.stdin.close(); enc.wait(); print('hybrid frames', n)
