import os,sys,itertools
from PIL import Image
def dh(p,n=16):
    im=Image.open(p).convert('L').resize((n+1,n)); px=list(im.getdata())
    return [px[r*(n+1)+c]>px[r*(n+1)+c+1] for r in range(n) for c in range(n)]
lib=sys.argv[1]; fs=sorted(f for f in os.listdir(lib) if f.endswith('.jpg'))
H={f[:-4]:dh(os.path.join(lib,f)) for f in fs}
pairs=[]
for a,b in itertools.combinations(H,2):
    d=sum(x!=y for x,y in zip(H[a],H[b]))
    if d<=70: pairs.append((d,a,b))
for d,a,b in sorted(pairs): print(f'{d:3d}/256  {a}  ~  {b}')
