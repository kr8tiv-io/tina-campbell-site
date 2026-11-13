#!/usr/bin/env bash
# Independent post-step verification: replay clips + capture routes against site/dist, then a separate
# Grok Build review (read-only intent) that writes reviews/<id>.md and, on FAIL, a fix prompt.
# 13 Nov 2026 (Matt): verdicts are PASS or FAIL only; close never passes.
#  - motion steps (009-transitions, 011+): the code motion gate runs first; on FAIL the review and fix
#    prompt are written by code and the LLM reviewer is skipped (no tokens spent).
#  - after the LLM review, gate-review.py strict forces FAIL unless every in-scope row is PASS.
# Last stdout line is always "VERDICT: PASS" or "VERDICT: FAIL" (driver contract).
set -u
ID="$1"; BASE_ID="${ID%%-fix*}"
ROOT=/workspace/tina-campbell; BP=${TINA_BP:-$ROOT/build-plan}; T=$ROOT/build-plan/tools/exact-match
export TINA_BP=$BP  # gate-review.py writes reviews/prompts here (override only for sandbox tests)
OUT=${TINA_QA:-$ROOT/qa}/$BASE_ID/exact/driver-verify-$ID; mkdir -p "$OUT"
CLIPS=$(python3 -c "import json;s=json.load(open('$T/steps.json')).get('$BASE_ID');print(','.join(s['clips']) if s else '')")
ROUTES=$(python3 -c "import json;s=json.load(open('$T/steps.json')).get('$BASE_ID');print(s['routes'] if s else '')")
case "${BASE_ID:0:3}" in [0-9][0-9][0-9]) NUM=$((10#${BASE_ID:0:3}));; *) NUM=0;; esac
MOTION=0; { [ "$BASE_ID" = 009-transitions ] || [ "$NUM" -ge 11 ]; } && MOTION=1
[ -z "$ROUTES" ] && [ $MOTION = 0 ] && { echo "no verify mapping for $BASE_ID"; exit 0; }
NFIX=$(ls "$BP/prompts/" | grep -c "^$BASE_ID-fix" || true)
NEXT=$((NFIX+1))
PORT=${VERIFY_PORT:-4890}
( cd "$ROOT/site/dist" && exec python3 -m http.server $PORT >/dev/null 2>&1 ) & SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1.5
if [ $MOTION = 1 ]; then
  # Code gate first (plain Python + Playwright, zero LLM tokens).
  GARGS=""
  if [ "$BASE_ID" = 009-transitions ]; then
    # 009 owns page transitions (T1-T4); the 10 seams are 011's scope. Gate every seam 009 put on the page.
    PRESENT=$(grep -rhoE "data-seam=[\"']?[0-9]{2}[A-C]-[0-9]{2}[A-C]" "$ROOT/site/dist" 2>/dev/null | grep -oE "[0-9]{2}[A-C]-[0-9]{2}[A-C]" | sort -u | paste -sd, -)
    [ -n "$PRESENT" ] && GARGS="--seams $PRESENT" || GARGS=SKIP
  fi
  if [ "$GARGS" != SKIP ]; then
    GOUT=$OUT/motion-gate
    timeout 2400 python3 "$ROOT/build-plan/tools/motion-gate.py" --base http://127.0.0.1:$PORT --out "$GOUT" --clean-out $GARGS > "$OUT/motion-gate.log" 2>&1
    GV=$(grep -E '^VERDICT: (PASS|FAIL)$' "$OUT/motion-gate.log" | tail -1)
    rm -rf "$GOUT"/*/frames  # raw PNG frames are huge; REPORT.md, diffs/, site.mp4 and frame-scores.json stay
    mkdir -p "$BP/logs"; echo "$(date '+%F %T') $ID motion-gate ${GV:-VERDICT: FAIL}" >> "$BP/logs/motion-gate.log"
    if [ "$GV" != "VERDICT: PASS" ]; then
      python3 "$T/gate-review.py" gate "$ID" "$BASE_ID" "$NEXT" "$GOUT" "$OUT/motion-gate.log" > /dev/null
      echo "VERDICT: FAIL"; exit 0
    fi
  fi
fi
for c in ${CLIPS//,/ }; do
  ts=1; [ "$c" = clip05 ] && ts=3.5
  timeout 400 node "$T/replay.mjs" --clip "$c" --base http://localhost:$PORT --out "$OUT/$c" --timescale $ts > "$OUT/$c.log" 2>&1
  [ "$c" = clip03 ] && timeout 400 node "$T/replay.mjs" --clip clip03 --base http://localhost:$PORT --out "$OUT/clip03-ts4" --timescale 4 > "$OUT/clip03-ts4.log" 2>&1
done
timeout 900 node "$T/capture.mjs" http://localhost:$PORT "$OUT/pages" "$ROUTES" > "$OUT/capture.log" 2>&1
for d in "$OUT"/pages/*/; do [ -d "$d" ] || continue; n=$(basename "$d"); c=4; [[ $n == *390 ]] && c=6; python3 "$T/sheet.py" "$d" 'fwd-*' $c 480 "$OUT/sheet-$n.jpg" 2>/dev/null; done
kill $SRV 2>/dev/null
GATE_NOTE=""
[ $MOTION = 1 ] && [ -f "$OUT/motion-gate/REPORT.md" ] && GATE_NOTE="- code motion gate: already PASSED ($OUT/motion-gate/REPORT.md, diffs under $OUT/motion-gate/*/diffs/). Do not re-run it; judge the remaining targets."
SCOPE=$(python3 -c "import json;s=json.load(open('$T/steps.json')).get('$BASE_ID');print(s['ids'] if s else 'L1-L11, S01-S10, G-RM, G-GATE')")
cat > "$OUT/review-prompt.md" <<EOR
You are the independent exact-match reviewer for the Tina Campbell site. Do NOT edit anything under /workspace/tina-campbell/site and do not run git commands except git log/diff/show. You only write two kinds of files: the review file and (if needed) one fix prompt.

Step just finished: $ID (scope of base step $BASE_ID). Read /workspace/tina-campbell/build-plan/EXACT-TARGETS.md and /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md, the step prompt /workspace/tina-campbell/build-plan/prompts/$ID.md, and the builder's own checklist under /workspace/tina-campbell/qa/$BASE_ID/exact/ if present (do not trust it; check it).
Evidence produced independently after the step (open every image, frame by frame): $OUT
- clip replays: $OUT/<clip>/pair-*.jpg (left approved clip, right build, same timestamp), CONTACT-clip-vs-build.jpg, zone-luma.json
- page captures: $OUT/pages/*/fwd-*.jpg and rev-*.jpg, metrics.json (h1 glyph boxes, logo box, nav font, overflow, console errors), sheets $OUT/sheet-*.jpg
$GATE_NOTE
- layouts: /workspace/tina-campbell/concepts/site-layouts/ (names in /workspace/tina-campbell/build-plan/tools/exact-match/steps.json for $BASE_ID); compose your own side-by-sides with python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py into $OUT/review/ if helpful.

For every target ID in scope ($SCOPE) decide PASS or FAIL. Those are the only two allowed verdicts. CLOSEST, ACCEPTABLE, PARTIAL and "near" do not exist any more: anything that is not an exact match is FAIL (Matt, 13 Nov: close does not count). The overall verdict is PASS only if every in-scope row is PASS. (H10, H11 and R7 are recorded known gaps from earlier steps; do not list or reopen them.) Be strict: Matt wants it EXACTLY like the layouts and clips (sizes within ~10%, same composition, same grade, same motion timing/easing/direction/pin, same effect look). Words differ on purpose (live copy) and photos are Tina's real frames, so judge composition, size, grade and motion, not the mock words.

Write /workspace/tina-campbell/build-plan/reviews/$ID.md: a table whose first two columns are exactly ID and Verdict (then evidence image path, measured vs target), one row per in-scope ID, verdict cell exactly PASS or FAIL, and, as the very last line, exactly "VERDICT: PASS" or "VERDICT: FAIL".
If FAIL and fewer than 3 fix rounds exist for $BASE_ID (this would be round $NEXT), also write /workspace/tina-campbell/build-plan/prompts/$BASE_ID-fix$NEXT.md using the same front matter style as the step prompt (id: $BASE_ID-fix$NEXT, kind: fix, effort: xhigh, model: grok-4.7) whose body starts with "Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate." and then lists ONLY the failing IDs with the measured build value, the exact target, the evidence image paths, and concrete fix instructions; it ends with a Commit line "fix($BASE_ID): exact-match round $NEXT". Do not write a fix prompt when the verdict is PASS.
EOR
cd "$ROOT" && /home/box/.local/bin/grok -m grok-4.7 --effort xhigh --always-approve \
  --deny 'Bash(*git push*)' --deny 'Bash(*git reset*)' --deny 'Bash(*git clean*)' --deny 'Bash(*git checkout*)' --deny 'Bash(*git switch*)' --deny 'Bash(*git merge*)' --deny 'Bash(*git rebase*)' --deny 'Bash(*git commit*)' --deny 'Bash(*git add*)' --deny 'Bash(*git stash*)' --deny 'Bash(*pkill*)' --deny 'Bash(*killall*)' --deny 'Bash(*grok login*)' --deny 'Bash(*grok logout*)' --deny 'Bash(*auth.aura-homes*)' --deny 'Bash(*GROK_HOME*)' --deny 'Bash(*npm run build*)' --deny 'Bash(*rm -rf*)' \
  --prompt-file "$OUT/review-prompt.md" > "$BP/logs/review-$ID.out" 2>&1
# Code post-check: PASS only if the review's last line is PASS and every in-scope row is PASS.
python3 "$T/gate-review.py" strict "$ID" "$BASE_ID" "$NEXT"
