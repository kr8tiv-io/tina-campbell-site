#!/usr/bin/env bash
# Tina 26 Nov queue supervisor. Runs prompts one at a time: Grok Build job (driver-1080.sh) -> operator gate
# (PLAYWRIGHT_PORT=4831) -> on PASS prune qa, commit (Matt-Aurora-Ventures), push the plan branch, brain checkpoint.
# Any FAIL: gate rerun once (flake check); second FAIL stops the queue. Never deploys, never touches main.
set -u
ROOT=/workspace/tina-seams-2026-11-19; BR=plan/locked-motion-2026-11-19; LOG=$ROOT/build-plan/logs-1080/driver.log
BRAIN=/workspace/company-brain-tina; ST=/workspace/tina-review-2026-11-25/queue-state.txt
ALL=01A,03B,04B,06B,09B,10A,11B
QUEUE=("025-work-04B-05C-on-page:01A,03B,04B" "026-home-01A-03B-on-page:01A,03B,04B" "017-scene-about-footer-09B-10A:01A,03B,04B,09B,10A" "018-scene-portraits-11B:01A,03B,04B,09B,10A,11B" "019-scene-transitions-08B:$ALL" "020-mobile-pass:$ALL" "021-staging-refresh:$ALL")
WAITPID=${1:-}
cd "$ROOT"
say(){ echo "$(date '+%F %T %Z') SUPERVISOR $*" | tee -a "$LOG" >> "$ST"; }
G(){ git -c user.name="Matt-Aurora-Ventures" -c user.email="209257121+Matt-Aurora-Ventures@users.noreply.github.com" "$@"; }
tidy(){ git diff --name-only | grep '^qa/' | grep -v "^qa/$1/" | xargs -r git restore --; git ls-files --deleted -z | xargs -0 -r git restore --
  mkdir -p /tmp/tina-webm-churn; git ls-files --others --exclude-standard qa | grep -v "^qa/$1/" | xargs -r -I{} mv {} /tmp/tina-webm-churn/ 2>/dev/null
  rm -rf build-plan/tools/__pycache__; }
prune(){ local d="qa/$1"; [ -d "$d" ] || return 0
  find "$d" -type f \( -name '*.webm' -o -name '*.mp4' \) -delete
  find "$d" -type d \( -name frames -o -name diffs -o -name build -o -name gold \) -prune -exec rm -rf {} +
  find "$d" -type f -name '*.png' -size +300k -exec python3 -c "import sys;from PIL import Image
for f in sys.argv[1:]:
  Image.open(f).convert('RGB').save(f[:-4]+'.jpg',quality=75)
import os;[os.remove(f) for f in sys.argv[1:]]" {} +
  find "$d" -type d -empty -delete; }
brain(){ local id=$1 sha=$2 msg=$3
  ( cd "$BRAIN" && git pull -q --rebase && \
    printf -- "- %s %s: %s (\`%s\`).\n" "$(date '+%d %b %-I:%M %p')" "$id" "$msg" "$sha" >> docs/progress/2026-11-26-tina-build.md && \
    python3 - "$id" "$sha" "$msg" <<'PY'
import sys; id,sha,msg=sys.argv[1:]
p='docs/projects/tina-campbell-site/STATUS-NOW.md'; s=open(p).read()
mark='## 26 Nov queue'
line=f"Latest supervisor checkpoint: {id} {msg}, branch at `{sha}`. Staging still `b35fe3f` until Matt says yes.\n\n"
i=s.find(mark); j=s.find('\n',i)+1
if 'Latest supervisor checkpoint:' in s:
  import re; s=re.sub(r'Latest supervisor checkpoint:.*\n\n',line,s,count=1)
else: s=s[:j]+'\n'+line+s[j:]
open(p,'w').write(s)
PY
    python3 -m brain llms >/dev/null 2>&1 && python3 -m unittest discover -s tests >/tmp/sup-brain-tests.log 2>&1 && \
    git add -A && G commit -qm "brain: log Tina $id $msg ($sha)" && git pull -q --rebase && git push -q origin main ) \
    && say "brain pushed for $id" || say "brain checkpoint FAILED for $id (see /tmp/sup-brain-tests.log); queue continues"; }

if [ -n "$WAITPID" ]; then say "waiting for running driver pid $WAITPID"; while kill -0 "$WAITPID" 2>/dev/null; do sleep 30; done; fi
first=1
for item in "${QUEUE[@]}"; do
  id=${item%%:*}; scenes=${item#*:}
  if git log --format=%s | grep -q "^\[$id\]\|prompt $id"; then say "$id already committed, skip"; continue; fi
  if [ $first = 1 ] && [ -n "$WAITPID" ]; then say "$id grok run finished (started earlier)"; else
    pgrep -f "/\.local/bin/grok |^grok " >/dev/null && true
    say "launching $id"; bash build-plan/driver-1080.sh "$id"; say "$id grok rc=$?"; fi
  first=0
  out=build-plan/logs-1080/$id.out
  grep -q "GATE $id: FAIL" "$out" qa/$id/REPORT.md 2>/dev/null && say "$id: Grok's own report says FAIL (operator gate still run)"
  ok=0
  for try in 1 2; do
    tidy "$id"
    bash build-plan/tools/operator-gate.sh "$id" "$scenes" > /tmp/sup-gate-$id-$try.log 2>&1
    if grep -q "GATE $id: PASS" qa/$id/operator-verify/gate.txt; then ok=1; break; fi
    say "$id operator gate FAIL try $try: $(grep -v PASS qa/$id/operator-verify/gate.txt | tr '\n' ';' | cut -c1-400)"
  done
  if [ $ok = 0 ]; then say "STOP: $id failed the gate twice. Tree left uncommitted for review."; echo "BLOCKED $id" >> "$ST"; exit 1; fi
  if grep -q "GATE $id: FAIL" "$out" qa/$id/REPORT.md 2>/dev/null; then say "STOP: $id operator gate PASS but Grok's own on-page gate says FAIL; needs review"; echo "BLOCKED $id" >> "$ST"; exit 1; fi
  tidy "$id"; prune "$id"
  msg=$(awk '/^## Commit message/{getline; while($0==""){getline}; print; exit}' build-plan/prompts-1080/$id.md)
  git add site/src site/tests site/public site/package.json site/package-lock.json site/astro.config.mjs site/playwright.config.ts build-plan docs "qa/$id" 2>/dev/null
  G commit -qm "${msg:-checkpoint($id)}" -m "Prompt $id via Grok Build xhigh (KR8TIV); operator gate PASS: $(grep -E 'playwright|seams|scenes' qa/$id/operator-verify/gate.txt | tr '\n' ' ' | cut -c1-600)" \
    && git push -q origin "$BR" && sha=$(git rev-parse --short HEAD) && say "$id PASS committed+pushed $sha" || { say "STOP: commit/push failed for $id"; exit 1; }
  brain "$id" "$sha" "PASS (operator gate, playwright on :4831)"
done
say "QUEUE DONE"; echo "DONE" >> "$ST"
