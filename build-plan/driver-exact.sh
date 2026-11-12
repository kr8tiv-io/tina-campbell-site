#!/usr/bin/env bash
# Exact-match driver (Nov 12 2026). Same queue and state.json as driver.sh, but:
#  - Grok Build grok-4.7 --effort xhigh on the default (KR8TIV) login, with deny rules
#  - NO git push, NO deploy, no rm of the old deploy folder (local commits only)
#  - after each step: independent verify (clip replays + captures) and a Grok review that queues
#    <base>-fixN.md (max 3 rounds per step) when any exact-match target fails
set -u
ROOT=/workspace/tina-campbell; BP=$ROOT/build-plan; LOG=$BP/logs; STATE=$BP/state.json
GROK=/home/box/.local/bin/grok
mkdir -p "$LOG"; cd "$ROOT"
export TINA_STATE="$STATE"
done_list() { python3 -c "import json;print(' '.join(json.load(open('$STATE')).get('done',[])))"; }
save() { python3 - "$@" <<'ENDSAVE'
import json,sys,os,time
p=os.environ["TINA_STATE"]; s=json.load(open(p)) if os.path.exists(p) else {"done":[]}
k,v=sys.argv[1],sys.argv[2]
if k=="done":
    if v not in s.get("done",[]): s.setdefault("done",[]).append(v)
else: s[k]=v
s["updated"]=time.strftime("%Y-%m-%d %H:%M:%S %Z"); s["driver"]="driver-exact.sh"; s["driver_pid"]=os.getppid()
json.dump(s,open(p,"w"),indent=1)
ENDSAVE
}
next_prompt() {
  local f id d; d=" $(done_list) "
  for f in $(ls "$BP"/prompts/*.md | LC_ALL=C sort); do
    id=$(basename "$f" .md)
    case "$d" in *" $id "*) continue;; esac
    echo "$f"; return 0
  done; return 1
}
while f=$(next_prompt); do
  id=$(basename "$f" .md)
  if [ -f "$BP/STOP" ]; then save status "stopped-before-$id"; exit 0; fi
  save current "$id"; save status running
  echo "=== $(date) START $id (exact driver, xhigh)" >> "$LOG/driver.log"
  "$GROK" -m grok-4.7 --effort xhigh --always-approve \
    --deny 'Bash(*git push*)' --deny 'Bash(*git reset --hard*)' --deny 'Bash(*git clean*)' --deny 'Bash(*git checkout main*)' \
    --deny 'Bash(*git switch*)' --deny 'Bash(*git merge*)' --deny 'Bash(*git rebase*)' --deny 'Bash(*git worktree remove*)' \
    --deny 'Bash(*git branch -D*)' --deny 'Bash(*pkill*)' --deny 'Bash(*killall*)' --deny 'Bash(*grok login*)' --deny 'Bash(*grok logout*)' \
    --deny 'Bash(*auth.aura-homes*)' --deny 'Bash(*GROK_HOME*)' --deny 'Bash(*hostinger*)' --deny 'Bash(*sftp*)' --deny 'Bash(*lftp*)' \
    --deny 'Bash(*vercel*)' --deny 'Bash(*netlify*)' --deny 'Bash(*wrangler*)' \
    --prompt-file "$f" > "$LOG/$id.out" 2>&1
  rc=$?
  echo "=== $(date) END $id rc=$rc" >> "$LOG/driver.log"
  git add -A >/dev/null 2>&1; git commit -qm "build($id): exact driver checkpoint" >/dev/null 2>&1
  if [ $rc -ne 0 ]; then save status "failed-$id-rc$rc"; exit 1; fi
  ( cd site && npm run build > "$LOG/$id.build.log" 2>&1 ) || { save status "build-failed-after-$id"; exit 1; }
  save done "$id"
  save status "verifying-$id"
  v=$(bash "$BP/tools/exact-match/verify-step.sh" "$id" 2>>"$LOG/verify-$id.err" | tail -1)
  echo "=== $(date) VERIFY $id: $v" >> "$LOG/driver.log"
  git add -A >/dev/null 2>&1; git commit -qm "qa($id): independent exact-match verify ($v)" >/dev/null 2>&1
  base="${id%%-fix*}"
  if [ "$v" != "VERDICT: PASS" ] && [ "$(ls "$BP"/prompts/ | grep -c "^$base-fix")" -ge 3 ] && ! ls "$BP/prompts/" | grep -q "^$id-never"; then
    echo "- $id: still not PASS after 3 fix rounds ($(date)); see build-plan/reviews/$id.md. 010-qa must close it." >> "$BP/EXACT-OPEN-GAPS.md"
  fi
done
save status finished; save current none
