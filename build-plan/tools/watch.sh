#!/usr/bin/env bash
# Token-free build watcher for the Tina exact driver (pure bash, no LLM, no network).
# Every 5 minutes it reads build-plan/state.json, the motion-gate log, the latest review verdict and
# whether the driver process is alive. It prints nothing while the build progresses. It exits, writing
# build-plan/WATCH-ALERT.txt with the reason, only when:
#   1. the code motion gate says VERDICT: FAIL twice in a row for the same step (base id incl. fix rounds)
#   2. the driver process is gone
#   3. state.json has not changed for 90 minutes
#   4. the queue finished (status "finished")
# Launch: nohup bash build-plan/tools/watch.sh > build-plan/logs/watch.out 2>&1 &
set -u
BP=${WATCH_BP:-/workspace/tina-campbell/build-plan}
STATE=$BP/state.json; ALERT=$BP/WATCH-ALERT.txt; GATELOG=$BP/logs/motion-gate.log
INTERVAL=${WATCH_INTERVAL:-300}; STALE=${WATCH_STALE:-5400}

field() { sed -n "s/^ *\"$1\": *\"\{0,1\}\([^\",]*\)\"\{0,1\},\{0,1\} *$/\1/p" "$STATE" | head -1; }
latest_review() {
  local f; f=$(ls -t "$BP"/reviews/*.md 2>/dev/null | head -1)
  [ -n "$f" ] && echo "$(basename "$f" .md): $(tail -1 "$f")" || echo "none"
}
alert() {
  { echo "WATCH ALERT $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "reason: $1"
    echo "state: status=$(field status) current=$(field current) driver_pid=$(field driver_pid) updated=$(field updated)"
    echo "latest review: $(latest_review)"
    [ -f "$GATELOG" ] && { echo "last motion-gate results:"; tail -4 "$GATELOG"; }
    echo "driver.log tail:"; tail -4 "$BP/logs/driver.log" 2>/dev/null
  } > "$ALERT.tmp" && mv "$ALERT.tmp" "$ALERT"
  exit 0
}

while :; do
  [ -f "$STATE" ] || alert "state.json missing"
  status=$(field status); pid=$(field driver_pid)
  [ "$status" = finished ] && alert "queue finished: all prompts done"
  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null || ! tr '\0' ' ' < "/proc/$pid/cmdline" 2>/dev/null | grep -q driver; then
    alert "driver process ${pid:-?} is not running (status: $status)"
  fi
  age=$(( $(date +%s) - $(stat -c %Y "$STATE") ))
  [ "$age" -ge "$STALE" ] && alert "state.json unchanged for $((age / 60)) minutes (status: $status, current: $(field current))"
  if [ -f "$GATELOG" ]; then
    # lines: "<date> <time> <step-id> motion-gate VERDICT: PASS|FAIL"
    read -r a b < <(tail -2 "$GATELOG" | awk '{id=$3; sub(/-fix[0-9]+$/,"",id); printf "%s:%s ", id, $NF}')
    if [ -n "${b:-}" ] && [ "$a" = "$b" ] && [ "${a##*:}" = FAIL ]; then
      alert "motion gate FAIL twice in a row for step ${a%%:*} (see $GATELOG and the reviews)"
    fi
  fi
  sleep "$INTERVAL"
done
