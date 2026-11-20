#!/usr/bin/env bash
# Extract 6 reference frames (n = 0 29 58 87 115 144 of 145, i.e. t 0..6.04 s) per locked clip into ${1:-/tmp/ga/ref}/<ID>-<k>.jpg
set -euo pipefail; O=${1:-/tmp/ga/ref}; mkdir -p "$O"; C=/workspace/tina-campbell/concepts/motion-options-2026-11-12
declare -A M=([01A]=01-home-hero/A-living-gown [02A]=02-home-filmstrip/A-film-gate-advance [03B]=03-home-runway/B-followspot [04B]=04-work-hover/B-crimson-ink-drop [05C]=05-work-entrance/C-light-table-drop [06B]=06-editorial-split/B-crimson-thread [07C]=07-series-story/C-print-stack [08B]=08-page-transitions/B-ink-flood [09B]=09-about-parallax/B-blue-hour-lights [10A]=10-contact-footer/A-blue-hour-drift [11B]=11-portraits-chapters/B-veil-wipe)
for id in "${!M[@]}"; do k=0; for n in 0 29 58 87 115 144; do ffmpeg -v error -y -i "$C/${M[$id]}/clip.mp4" -vf "select=eq(n\,$n)" -frames:v 1 -q:v 4 "$O/$id-$k.jpg"; k=$((k+1)); done; done
