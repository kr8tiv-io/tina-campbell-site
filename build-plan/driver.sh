#!/usr/bin/env bash
# Feeds build-plan/prompts/*.md to Grok Build one at a time. Resumable via state file.
set -u
ROOT=/workspace/tina-campbell; BP=$ROOT/build-plan; LOG=$BP/logs; STATE=$BP/state.json
DEPLOY=/workspace/tina-campbell-deploy
mkdir -p "$LOG"
cd "$ROOT"
PROMPTS=$(ls "$BP"/prompts/*.md | sort)
done_list() { [ -f "$STATE" ] && python3 -c "import json;print(' '.join(json.load(open('$STATE')).get('done',[])))" || true; }
save() { python3 - "$@" <<PY
import json,sys,os,time
p='$STATE'; s=json.load(open(p)) if os.path.exists(p) else {'done':[]}
k,v=sys.argv[1],sys.argv[2]
if k=='done': s['done'].append(v)
else: s[k]=v
s['updated']=time.strftime('%Y-%m-%d %H:%M:%S %Z'); s['driver_pid']=os.getppid()
json.dump(s,open(p,'w'),indent=1)
PY
}
for f in $PROMPTS; do
  id=$(basename "$f" .md)
  case " $(done_list) " in *" $id "*) continue;; esac
  if [ -f "$BP/STOP" ]; then save status "stopped-before-$id"; exit 0; fi
  save current "$id"; save status running
  echo "=== $(date) START $id" >> "$LOG/driver.log"
  grok -m grok-4.7 --effort high --always-approve --prompt-file "$f" > "$LOG/$id.out" 2>&1
  rc=$?
  echo "=== $(date) END $id rc=$rc" >> "$LOG/driver.log"
  git add -A >/dev/null 2>&1; git commit -qm "build($id): driver checkpoint" >/dev/null 2>&1
  if [ $rc -ne 0 ]; then save status "failed-$id-rc$rc"; exit 1; fi
  ( cd site && npm run build > "$LOG/$id.build.log" 2>&1 ) || { save status "build-failed-after-$id"; git push -q origin main >/dev/null 2>&1; exit 1; }
  rm -rf "$DEPLOY" && cp -r site/dist "$DEPLOY" && echo "$id" > "$DEPLOY/.built-after"
  git push -q origin main >> "$LOG/driver.log" 2>&1
  save done "$id"
done
save status finished; save current none
