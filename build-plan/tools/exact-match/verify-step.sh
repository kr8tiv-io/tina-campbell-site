#!/usr/bin/env bash
# Independent post-step verification: replay clips + capture routes against site/dist, then a separate
# Grok Build review (read-only intent) that writes reviews/<id>.md and, on FAIL, a fix prompt.
set -u
ID="$1"; BASE_ID="${ID%%-fix*}"
ROOT=/workspace/tina-campbell; BP=$ROOT/build-plan; T=$BP/tools/exact-match
OUT=$ROOT/qa/$BASE_ID/exact/driver-verify-$ID; mkdir -p "$OUT"
CLIPS=$(python3 -c "import json;s=json.load(open('$T/steps.json')).get('$BASE_ID');print(','.join(s['clips']) if s else '')")
ROUTES=$(python3 -c "import json;s=json.load(open('$T/steps.json')).get('$BASE_ID');print(s['routes'] if s else '')")
[ -z "$ROUTES" ] && { echo "no verify mapping for $BASE_ID"; exit 0; }
PORT=4890
( cd "$ROOT/site/dist" && exec python3 -m http.server $PORT >/dev/null 2>&1 ) & SRV=$!
sleep 1.5
for c in ${CLIPS//,/ }; do
  ts=1; [ "$c" = clip05 ] && ts=3.5
  timeout 400 node "$T/replay.mjs" --clip "$c" --base http://localhost:$PORT --out "$OUT/$c" --timescale $ts > "$OUT/$c.log" 2>&1
  [ "$c" = clip03 ] && timeout 400 node "$T/replay.mjs" --clip clip03 --base http://localhost:$PORT --out "$OUT/clip03-ts4" --timescale 4 > "$OUT/clip03-ts4.log" 2>&1
done
timeout 900 node "$T/capture.mjs" http://localhost:$PORT "$OUT/pages" "$ROUTES" > "$OUT/capture.log" 2>&1
for d in "$OUT"/pages/*/; do [ -d "$d" ] || continue; n=$(basename "$d"); c=4; [[ $n == *390 ]] && c=6; python3 "$T/sheet.py" "$d" 'fwd-*' $c 480 "$OUT/sheet-$n.jpg" 2>/dev/null; done
kill $SRV 2>/dev/null
NFIX=$(ls "$BP/prompts/" | grep -c "^$BASE_ID-fix" || true)
NEXT=$((NFIX+1))
cat > "$OUT/review-prompt.md" <<EOR
You are the independent exact-match reviewer for the Tina Campbell site. Do NOT edit anything under /workspace/tina-campbell/site and do not run git commands except git log/diff/show. You only write two kinds of files: the review file and (if needed) one fix prompt.

Step just finished: $ID (scope of base step $BASE_ID). Read /workspace/tina-campbell/build-plan/EXACT-TARGETS.md and /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md, the step prompt /workspace/tina-campbell/build-plan/prompts/$ID.md, and the builder's own checklist under /workspace/tina-campbell/qa/$BASE_ID/exact/ if present (do not trust it; check it).
Evidence produced independently after the step (open every image, frame by frame): $OUT
- clip replays: $OUT/<clip>/pair-*.jpg (left approved clip, right build, same timestamp), CONTACT-clip-vs-build.jpg, zone-luma.json
- page captures: $OUT/pages/*/fwd-*.jpg and rev-*.jpg, metrics.json (h1 glyph boxes, logo box, nav font, overflow, console errors), sheets $OUT/sheet-*.jpg
- layouts: /workspace/tina-campbell/concepts/site-layouts/ (names in /workspace/tina-campbell/build-plan/tools/exact-match/steps.json for $BASE_ID); compose your own side-by-sides with python3 /workspace/tina-campbell/build-plan/tools/compare-visual.py into $OUT/review/ if helpful.

For every target ID in scope ($(python3 -c "import json;print(json.load(open('$T/steps.json'))['$BASE_ID']['ids'])")) decide PASS / FAIL / CLOSEST (CLOSEST only when her real photos make an exact match impossible and the builder picked the nearest frame). Be strict: Matt wants it EXACTLY like the layouts and clips (sizes within ~10%, same composition, same grade, same motion timing/easing/direction/pin, same effect look). Words differ on purpose (live copy) and photos are Tina's real frames, so judge composition, size, grade and motion, not the mock words.

Write /workspace/tina-campbell/build-plan/reviews/$ID.md: a table (ID, verdict, evidence image path, measured vs target) and, as the very last line, exactly "VERDICT: PASS" or "VERDICT: FAIL".
If FAIL and fewer than 3 fix rounds exist for $BASE_ID (this would be round $NEXT), also write /workspace/tina-campbell/build-plan/prompts/$BASE_ID-fix$NEXT.md using the same front matter style as the step prompt (id: $BASE_ID-fix$NEXT, kind: fix, effort: xhigh, model: grok-4.7) whose body starts with "Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate." and then lists ONLY the failing IDs with the measured build value, the exact target, the evidence image paths, and concrete fix instructions; it ends with a Commit line "fix($BASE_ID): exact-match round $NEXT". Do not write a fix prompt when the verdict is PASS.
EOR
cd "$ROOT" && /home/box/.local/bin/grok -m grok-4.7 --effort xhigh --always-approve \
  --deny 'Bash(*git push*)' --deny 'Bash(*git reset*)' --deny 'Bash(*git clean*)' --deny 'Bash(*git checkout*)' --deny 'Bash(*git switch*)' --deny 'Bash(*git merge*)' --deny 'Bash(*git rebase*)' --deny 'Bash(*git commit*)' --deny 'Bash(*git add*)' --deny 'Bash(*git stash*)' --deny 'Bash(*pkill*)' --deny 'Bash(*killall*)' --deny 'Bash(*grok login*)' --deny 'Bash(*grok logout*)' --deny 'Bash(*auth.aura-homes*)' --deny 'Bash(*GROK_HOME*)' --deny 'Bash(*npm run build*)' --deny 'Bash(*rm -rf*)' \
  --prompt-file "$OUT/review-prompt.md" > "$BP/logs/review-$ID.out" 2>&1
tail -1 "$BP/reviews/$ID.md" 2>/dev/null || echo "VERDICT: MISSING"
