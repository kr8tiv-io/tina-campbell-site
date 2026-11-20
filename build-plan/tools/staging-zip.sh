#!/usr/bin/env bash
# Production build -> zip that extracts into the staging public_html root (hPanel File Manager upload + extract).
# Adds/overwrites only; deletes nothing on the server. Refuses if any page lacks noindex, robots.txt is not Disallow: /,
# the X-Robots-Tag .htaccess is missing, or motion-lab routes leaked into the build.
set -euo pipefail
ROOT=${STAGING_ROOT:-/workspace/tina-seams-2026-11-19}; OUT=/workspace/tina-staging-zips; mkdir -p "$OUT"
cd "$ROOT/site" && unset TC_MOTION_LAB && npm run build >/tmp/staging-zip-build.log 2>&1
D="$ROOT/site/dist"
[ -d "$D/motion-lab" ] && { echo "motion-lab leaked"; exit 1; }
grep -q "Disallow: /" "$D/robots.txt" || { echo "robots not Disallow"; exit 1; }
grep -q 'X-Robots-Tag "noindex, nofollow"' "$D/.htaccess" || { echo ".htaccess noindex missing"; exit 1; }
miss=$(find "$D" -name '*.html' -print0 | xargs -0 grep -L 'name="robots" content="noindex' || true)
[ -z "$miss" ] || { echo "pages without noindex:"; echo "$miss"; exit 1; }
ts=$(date +%Y%m%d-%H%M); sha=$(git -C "$ROOT" rev-parse --short HEAD)
z="$OUT/tina-staging-$ts-$sha.zip"
(cd "$D" && find . -type f | sed 's|^\./||' | sort > "$OUT/UPLOAD-PATHS-$ts-$sha.txt" && python3 -c "import sys,os,zipfile
z=zipfile.ZipFile(sys.argv[1],'w',zipfile.ZIP_DEFLATED)
for l in open(sys.argv[2]):
    f=l.strip()
    if f: z.write(f,f)
z.close()" "$z" "$OUT/UPLOAD-PATHS-$ts-$sha.txt" )
echo "zip: $z ($(du -h "$z" | cut -f1), $(wc -l < "$OUT/UPLOAD-PATHS-$ts-$sha.txt") files, commit $sha)"
