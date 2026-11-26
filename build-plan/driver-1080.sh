#!/usr/bin/env bash
# Runs ONE 1080 scene prompt through Grok Build (KR8TIV login already on the box; never login/logout, never read auth files).
# Usage: build-plan/driver-1080.sh <prompt-id>     e.g. 013-scene-hero-01A
# One heavy job at a time: refuses to start if another grok process is running. No git writes, no push, no deploy here:
# the operator gates, commits and pushes after reading qa/<id>/REPORT.md.
set -u
ROOT=/workspace/tina-seams-2026-11-19; P=$ROOT/build-plan/prompts-1080; LOG=$ROOT/build-plan/logs-1080
id=${1:?prompt id}; f=$P/$id.md; [ -f "$f" ] || { echo "no prompt $f"; exit 2; }
mkdir -p "$LOG"
# One Tina job at a time. Other workspaces (e.g. the PrimeTime driver) may run their own grok job alongside (25 Nov).
for gp in $(pgrep -f "/\.local/bin/grok |^grok |/\.grok/bin/" || true); do
  [ "$(readlink -f /proc/$gp/cwd 2>/dev/null)" = "$ROOT" ] && { echo "another Tina grok job is running (pid $gp); refusing"; exit 3; }
done
tmp=$(mktemp /tmp/prompt-$id-XXXX.md); cat "$P/_CONTEXT.md" "$f" > "$tmp"
cd "$ROOT"
echo "$(date '+%F %T %Z') START $id pid $$" >> "$LOG/driver.log"
grok -m grok-4.7 --effort xhigh --always-approve --background-wait-timeout 5400 --output-format plain --prompt-file "$tmp" > "$LOG/$id.out" 2>&1
rc=$?
echo "$(date '+%F %T %Z') END $id rc=$rc" >> "$LOG/driver.log"
exit $rc
