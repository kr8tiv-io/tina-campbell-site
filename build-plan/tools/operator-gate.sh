#!/usr/bin/env bash
# Operator gate for one Grok Build job. Usage: operator-gate.sh <job-id> <scene,ids>
# Writes qa/<job-id>/operator-verify/ and prints a GATE line. Never commits.
set -u
ID="$1"; SCENES="$2"; PORT="${PORT:-4871}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
T=build-plan-locked-2026-11-19/tools; O="qa/$ID/operator-verify"; mkdir -p "$O"
fail=0; note(){ echo "$*" | tee -a "$O/gate.txt"; }
: > "$O/gate.txt"
restore_qa(){ git diff --name-only | grep '^qa/' | grep -v scenes-1080 | grep -v "^qa/$ID/" | xargs -r git restore --; }
unset TC_MOTION_LAB
npm --prefix site run check > /tmp/og-check.log 2>&1 && note "check PASS" || { note "check FAIL"; fail=1; }
npm --prefix site run build > /tmp/og-build.log 2>&1 && note "build PASS" || { note "build FAIL"; fail=1; }
bad=0; for f in $(find site/dist -name '*.html'); do n=$(grep -o '<h1' "$f" | wc -l); [ "$n" != 1 ] && { note "H1=$n $f"; bad=1; }; grep -q noindex "$f" || { note "NOINDEX missing $f"; bad=1; }; done
grep -rlq motion-lab site/dist && { note "motion-lab leak"; bad=1; }
[ $bad = 0 ] && note "pages PASS (1 h1, noindex, no lab)" || fail=1
(cd site && npx playwright test > /tmp/og-pw.log 2>&1); pw=$?
note "playwright rc=$pw $(grep -E '^\s+[0-9]+ (passed|failed|skipped|flaky)' /tmp/og-pw.log | tr -s ' ' | tr '\n' ' ')"
[ $pw = 0 ] || fail=1
restore_qa
TC_MOTION_LAB=1 npm --prefix site run build > /tmp/og-lab.log 2>&1 || { note "lab build FAIL"; fail=1; }
(cd site && npx astro preview --port $PORT --host 127.0.0.1 > /tmp/og-prev.log 2>&1 &) ; sleep 5
B=http://127.0.0.1:$PORT
python3 $T/seam_gate.py --base $B --out $O/seam-gate > $O/seam-gate.txt 2>&1; grep -q 'VERDICT: PASS' $O/seam-gate.txt && note "seams PASS $(grep -c '^PASS' $O/seam-gate.txt)/10" || { note "seams FAIL"; fail=1; }
python3 $T/seam_route_check.py --base $B > $O/route-check.txt 2>&1; grep -q 'VERDICT: PASS' $O/route-check.txt && note "route tables PASS" || { note "route tables FAIL"; fail=1; }
python3 $T/seam_route_visual.py --base $B --out $O/desktop > $O/visual-desktop.txt 2>&1; grep -q 'VERDICT: PASS' $O/visual-desktop.txt && note "visual desktop PASS" || { note "visual desktop FAIL"; fail=1; }
python3 $T/seam_route_visual.py --base $B --out $O/mobile --mobile > $O/visual-mobile.txt 2>&1; grep -q 'VERDICT: PASS' $O/visual-mobile.txt && note "visual mobile PASS" || { note "visual mobile FAIL"; fail=1; }
python3 $T/scene_gate.py --base $B --scenes "$SCENES" --out $O/scene-gate > $O/scene-gate.txt 2>&1; grep -q 'VERDICT: PASS' $O/scene-gate.txt && note "scenes PASS: $(grep -E '^[0-9]{2}[A-C] ' $O/scene-gate.txt | tr '\n' ';')" || { note "scenes FAIL: $(tail -5 $O/scene-gate.txt | tr '\n' ';')"; fail=1; }
pkill -f "astro preview --port $PORT"
unset TC_MOTION_LAB; npm --prefix site run build > /dev/null 2>&1
restore_qa
[ -z "$(git ls-files --deleted)" ] || { note "DELETIONS: $(git ls-files --deleted | head -5 | tr '\n' ' ')"; fail=1; }
[ $fail = 0 ] && note "GATE $ID: PASS" || note "GATE $ID: FAIL"
