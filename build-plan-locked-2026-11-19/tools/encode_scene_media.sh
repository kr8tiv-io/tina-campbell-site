#!/usr/bin/env bash
# Encode one 1080 scene master into the web set used by site/src/scripts/motion/scene-video.ts.
# Usage: encode_scene_media.sh <ID> <master.mp4> <loop|scrub|play> <site/public/media/scenes>
set -euo pipefail
id=$1; m=$2; mode=$3; dst=$4/$id; mkdir -p "$dst"
if [ "$mode" = scrub ]; then G="-g 6 -keyint_min 6 -sc_threshold 0 -bf 0"; GA="-g 6"; else G="-g 48 -keyint_min 48 -sc_threshold 0"; GA="-g 48"; fi
common="-an -map 0:v:0 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart"
ffmpeg -v error -y -i "$m" $common -c:v libx264 -profile:v high -preset veryslow -crf 21 $G "$dst/$id-1080.mp4"
ffmpeg -v error -y -i "$m" $common -vf scale=1280:720:flags=lanczos -c:v libx264 -profile:v high -preset veryslow -crf 23 $G "$dst/$id-720.mp4"
ffmpeg -v error -y -i "$m" -an -map 0:v:0 -pix_fmt yuv420p -c:v libsvtav1 -preset 4 -crf 34 $GA -svtav1-params tune=0 "$dst/$id-1080.webm"
ffmpeg -v error -y -i "$m" -map 0:v:0 -vf "select=eq(n\,0)" -frames:v 1 -q:v 3 "$dst/$id-poster.jpg"
ffmpeg -v error -y -i "$m" -map 0:v:0 -vf "select=eq(n\,0)" -frames:v 1 -c:v libwebp -quality 82 "$dst/$id-poster.webp"
ffmpeg -v error -y -sseof -0.1 -i "$m" -map 0:v:0 -update 1 -q:v 3 "$dst/$id-end.jpg"
ffmpeg -v error -y -sseof -0.1 -i "$m" -map 0:v:0 -update 1 -c:v libwebp -quality 82 "$dst/$id-end.webp"
ls -la "$dst"
