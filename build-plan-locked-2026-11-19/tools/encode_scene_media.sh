#!/usr/bin/env bash
# Encode one 1080 scene master into the web set used by site/src/scripts/motion/scene-video.ts.
# AV1: one cloned tail frame (6.083 s) because SVT-AV1 degrades the final frame of the stream; the site maps scrub to the manifest duration 6.0417 s.
# Usage: encode_scene_media.sh <ID> <master.mp4> <loop|scrub|play> <site/public/media/scenes>
set -euo pipefail
id=$1; m=$2; mode=$3; dst=$4/$id; mkdir -p "$dst"
SG=${GOP:-6}; CH=${CRF_H264:-21}; CL=${CRF_720:-23}; CA=${CRF_AV1:-34}   # per-scene overrides via env (09B: GOP=12 CRF_H264=20 CRF_720=21 CRF_AV1=29)
if [ "$mode" = scrub ]; then G="-g $SG -keyint_min $SG -sc_threshold 0 -bf 0"; GA="-g $SG"; else G="-g 48 -keyint_min 48 -sc_threshold 0"; GA="-g 48"; fi
common="-an -map 0:v:0 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart"
ffmpeg -v error -y -i "$m" $common -c:v libx264 -profile:v high -preset veryslow -crf $CH $G "$dst/$id-1080.mp4"
ffmpeg -v error -y -i "$m" $common -vf scale=1280:720:flags=lanczos -c:v libx264 -profile:v high -preset veryslow -crf $CL $G "$dst/$id-720.mp4"
ffmpeg -v error -y -i "$m" -an -map 0:v:0 -vf tpad=stop=1:stop_mode=clone -pix_fmt yuv420p -c:v libsvtav1 -preset 4 -crf $CA $GA -svtav1-params tune=0 "$dst/$id-1080.webm"
ffmpeg -v error -y -i "$m" -map 0:v:0 -vf "select=eq(n\,0)" -frames:v 1 -q:v 3 "$dst/$id-poster.jpg"
ffmpeg -v error -y -i "$m" -map 0:v:0 -vf "select=eq(n\,0)" -frames:v 1 -c:v libwebp -quality 82 "$dst/$id-poster.webp"
ffmpeg -v error -y -sseof -0.1 -i "$m" -map 0:v:0 -update 1 -q:v 3 "$dst/$id-end.jpg"
ffmpeg -v error -y -sseof -0.1 -i "$m" -map 0:v:0 -update 1 -c:v libwebp -quality 82 "$dst/$id-end.webp"
ls -la "$dst"
