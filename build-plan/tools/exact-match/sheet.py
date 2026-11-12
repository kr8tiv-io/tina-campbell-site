import sys,glob
from PIL import Image, ImageDraw
def sheet(files,out,cols,w):
    ims=[Image.open(f) for f in files]
    ims=[i.resize((w,int(i.height*w/i.width))) for i in ims]
    h=max(i.height for i in ims); rows=(len(ims)+cols-1)//cols
    S=Image.new('RGB',(cols*w+(cols-1)*6,rows*h+(rows-1)*6),(60,60,60))
    for k,i in enumerate(ims): S.paste(i,((k%cols)*(w+6),(k//cols)*(h+6)))
    S.save(out,quality=80)
d=sys.argv[1]; pat=sys.argv[2]; cols=int(sys.argv[3]); w=int(sys.argv[4])
sheet(sorted(glob.glob(d+'/'+pat)),sys.argv[5],cols,w)
