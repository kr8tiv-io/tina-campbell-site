#!/usr/bin/env bash
# After 002-home finishes successfully, stop the current driver (which started
# before 002b existed) and restart it so 002b-home-visual-lock runs next.
# If 002 fails, do not restart; leave the failure in state.json.
set -u
BP=/workspace/tina-campbell/build-plan
LOG=$BP/logs/restart-after-002.log
DRIVER_PID=1622200
mkdir -p "$BP/logs"
exec >>"$LOG" 2>&1
echo "=== $(date) watcher start, waiting on 002-home (driver $DRIVER_PID) ==="

wait_for_end() {
  local line rc
  while true; do
    if ! kill -0 "$DRIVER_PID" 2>/dev/null; then
      echo "$(date) driver $DRIVER_PID exited before an END 002-home line"
      if grep -q "END 002-home" "$BP/logs/driver.log" 2>/dev/null; then
        return 0
      fi
      echo "No END 002-home in driver.log. Not restarting."
      return 2
    fi
    line=$(grep "END 002-home" "$BP/logs/driver.log" 2>/dev/null | tail -1 || true)
    if [ -n "$line" ]; then
      echo "$(date) saw: $line"
      rc=$(echo "$line" | sed -n 's/.*rc=\([0-9-]*\).*/\1/p')
      if [ "$rc" != "0" ]; then
        echo "002-home failed with rc=$rc. Not restarting. Report this."
        return 1
      fi
      return 0
    fi
    sleep 5
  done
}

wait_for_end
end_rc=$?
if [ $end_rc -ne 0 ]; then
  exit $end_rc
fi

echo "$(date) writing STOP so the current driver exits before 003"
touch "$BP/STOP"

echo "$(date) waiting for driver $DRIVER_PID to exit after 002 post-steps"
for i in $(seq 1 900); do
  if ! kill -0 "$DRIVER_PID" 2>/dev/null; then
    echo "$(date) driver exited"
    break
  fi
  # If it already started 003 somehow, still wait for STOP to take effect (too late if 003 running)
  sleep 2
  if [ $i -eq 360 ]; then
    echo "$(date) timed out waiting for driver exit; not force-killing a running grok job"
    exit 3
  fi
done

rm -f "$BP/STOP"
echo "$(date) STOP removed"

# Confirm 002 is in done[] before restart; if not, still restart only if status is not failed
python3 - <<'PY'
import json,sys
s=json.load(open("/workspace/tina-campbell/build-plan/state.json"))
print(s)
if str(s.get("status","")).startswith("failed") or str(s.get("status","")).startswith("build-failed"):
    sys.exit(1)
if "002-home" not in s.get("done",[]) and not str(s.get("status","")).startswith("stopped-before"):
    # stopped-before-003 is the expected status
    print("warning: 002-home not in done and status is", s.get("status"))
PY
st=$?
if [ $st -ne 0 ]; then
  echo "$(date) state is failed; not restarting"
  exit 1
fi

cd /workspace/tina-campbell
nohup bash build-plan/driver.sh >> build-plan/logs/driver.nohup 2>&1 &
new=$!
echo "$(date) restarted driver pid=$new"
sleep 2
if ! kill -0 "$new" 2>/dev/null; then
  echo "restarted driver died immediately"
  exit 4
fi
# The new driver's first prompt should be 002b
python3 - <<'PY'
import json,time
time.sleep(1)
s=json.load(open("/workspace/tina-campbell/build-plan/state.json"))
print("state after restart:", s)
PY
echo "=== $(date) watcher done ==="
