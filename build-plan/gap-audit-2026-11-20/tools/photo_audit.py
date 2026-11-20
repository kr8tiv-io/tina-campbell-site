import re,os,glob,collections,json,sys
root=sys.argv[1]
ids=set(os.path.splitext(f)[0] for f in os.listdir(sys.argv[2]))
per=collections.OrderedDict(); site=collections.Counter(); pages_of=collections.defaultdict(set)
for f in sorted(glob.glob(root+'/**/index.html',recursive=True)):
    page='/'+os.path.relpath(os.path.dirname(f),root).replace('.','')+'/'
    page=page.replace('//','/')
    h=open(f,encoding='utf8').read()
    # one count per <img>/<source>/background element: take first photo id inside each tag
    c=collections.Counter()
    for tag in re.findall(r'<img\b[^>]*>|<[a-z]+\b[^>]*style="[^"]*url\([^>]*>|<video\b[^>]*poster[^>]*>',h):
        m=re.search(r'/_astro/((?:fb|ig)_[A-Za-z0-9_]+?)\.[A-Za-z0-9_-]{8}',tag) or re.search(r'((?:fb|ig)_\d+_[a-z]+|ig_profile_\d+)',tag)
        if m and (m.group(1) in ids):
            if tag.startswith('<source') : continue  # picture sources duplicate the img
            c[m.group(1)]+=1
    per[page]=c
    for k,v in c.items(): site[k]+=v; pages_of[k].add(page)
json.dump({'per':{p:dict(c) for p,c in per.items()},'site':dict(site),'pages':{k:sorted(v) for k,v in pages_of.items()}},open('/tmp/ga/photo_audit.json','w'),indent=1)
print('pages',len(per),'distinct used',len(site),'of library',len(ids),'total uses',sum(site.values()))
print('\nPer-page repeats (same photo more than once on one page):')
for p,c in per.items():
    r={k:v for k,v in c.items() if v>1}
    print(f'  {p}: {sum(c.values())} uses, {len(c)} distinct' + (f'; repeats {r}' if r else ''))
print('\nMost used site-wide (uses / pages):')
for k,v in site.most_common(25): print(f'  {k}: {v} uses on {len(pages_of[k])} pages')
print('\nUnused library photos:',sorted(ids-set(site)))
