#!/usr/bin/env python3
# Upscale a picked 720p scene clip to a 1920x1080 master without touching its motion: Real-ESRGAN realesr-general-x4v3
# (dn blend with the wdn weights; dn 0.0 = full denoise, chosen 19 Nov 2026), CPU bf16, 4x then area-downsample to 1080p.
# Weights (BSD-3, public): https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesr-general-{x4v3,wdn-x4v3}.pth
# Usage: ESRGAN_WEIGHTS=<dir> upscale_scene.py <clip.mp4> <master.mp4> 0.0
import sys, os, subprocess, time, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
# SRVGGNetCompact (Real-ESRGAN realesr-general-x4v3), BSD-3 licensed architecture.
class SRVGG(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__(); s.up=up; b=[nn.Conv2d(3,nf,3,1,1), nn.PReLU(nf)]
        for _ in range(nc): b += [nn.Conv2d(nf,nf,3,1,1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf,3*up*up,3,1,1)]; s.body=nn.ModuleList(b); s.ps=nn.PixelShuffle(up)
    def forward(s,x):
        o=x
        for m in s.body: o=m(o)
        return s.ps(o)+F.interpolate(x,scale_factor=s.up,mode='nearest')
def load(dn):
    a=torch.load(os.environ.get('ESRGAN_WEIGHTS','weights')+'/realesr-general-x4v3.pth',map_location='cpu')['params']
    b=torch.load(os.environ.get('ESRGAN_WEIGHTS','weights')+'/realesr-general-wdn-x4v3.pth',map_location='cpu')['params']
    m=SRVGG(); m.load_state_dict({k:dn*a[k]+(1-dn)*b[k] for k in a}); return m.eval()
src, dst, dn = sys.argv[1], sys.argv[2], float(sys.argv[3]) if len(sys.argv)>3 else 0.5
limit = int(sys.argv[4]) if len(sys.argv)>4 else 0
torch.set_num_threads(os.cpu_count()); m=load(dn).to(memory_format=torch.channels_last)
W,H=1280,720
dec=subprocess.Popen(['ffmpeg','-v','error','-i',src,'-map','0:v:0','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
enc=subprocess.Popen(['ffmpeg','-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','24','-i','-','-c:v','libx264','-preset','slow','-crf','10','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709',dst],stdin=subprocess.PIPE)
n=0;t0=time.time()
while True:
    buf=dec.stdout.read(W*H*3)
    if len(buf)<W*H*3: break
    x=torch.from_numpy(np.frombuffer(buf,np.uint8).reshape(H,W,3).copy()).permute(2,0,1).float().div(255)[None]
    with torch.inference_mode(), torch.autocast('cpu',dtype=torch.bfloat16):
        y=m(x.to(memory_format=torch.channels_last)).float().clamp(0,1)
        y=F.interpolate(y,size=(1080,1920),mode='area')  # 4x -> 1.5x net, area downsample
    enc.stdin.write((y[0].permute(1,2,0).numpy()*255+0.5).astype(np.uint8).tobytes()); n+=1
    if n%10==0: print(f'{src.split("/")[-3]} {n} frames {(time.time()-t0)/n:.2f}s/frame',flush=True)
    if limit and n>=limit: break
enc.stdin.close(); enc.wait(); dec.kill(); print('done',n,'frames',time.time()-t0,'s',flush=True)
