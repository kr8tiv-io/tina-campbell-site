#!/usr/bin/env python3
"""Token-free review writers for verify-step.sh (no LLM).

gate   <id> <base_id> <next_round> <gate_out> <gate_log>
    Code motion gate said FAIL: write reviews/<id>.md (failing seams + diff frames, last line
    "VERDICT: FAIL") and, if fewer than 3 fix rounds exist, prompts/<base>-fix<next>.md.
strict <id> <base_id> <next_round>
    After the LLM review: PASS only if every in-scope row is PASS. Any CLOSEST / ACCEPTABLE /
    PARTIAL / NEAR / MISSING / non-PASS row, or a missing table, forces "VERDICT: FAIL" (and writes
    a fix prompt for those rows if the reviewer did not). Prints the final verdict line.
"""
import glob, json, os, re, sys
from pathlib import Path

BP = Path(os.environ.get("TINA_BP", "/workspace/tina-campbell/build-plan"))
PRE = "Read /workspace/tina-campbell/build-plan/EXACT-PREAMBLE.md first and follow it exactly, including the gate."
SOFT = re.compile(r"\b(CLOSEST|CLOSE|ACCEPTABLE|PARTIAL|NEAR|MOSTLY|APPROX\w*)\b", re.I)
VERDICT_CELL = re.compile(r"^(PASS|FAIL|CLOSEST|CLOSE|ACCEPTABLE|PARTIAL|NEAR|MOSTLY|N/?A)\b", re.I)
KNOWN_GAPS = {"H10", "H11", "R7"}  # accepted earlier as CLOSEST; recorded in EXACT-TARGETS.md, not reopened


def nfix(base):
    return len(glob.glob(str(BP / "prompts" / f"{base}-fix*.md")))


def fix_prompt(base, nxt, title, body):
    if nfix(base) >= 3:
        return None
    p = BP / "prompts" / f"{base}-fix{nxt}.md"
    if p.exists():
        return p
    p.write_text(f"---\nid: {base}-fix{nxt}\ntitle: {title}\nkind: fix\neffort: xhigh\nmodel: grok-4.7\n---\n"
                 f"{PRE}\n\n{body.rstrip()}\n\nCommit: fix({base}): exact-match round {nxt}\n")
    return p


def gate(id_, base, nxt, gout, glog):
    gout = Path(gout)
    rows = []
    rep = gout / "REPORT.md"
    if rep.exists():
        for ln in rep.read_text().splitlines():
            c = [x.strip() for x in ln.strip().strip("|").split("|")]
            if len(c) >= 9 and c[0] not in ("Seam", "---") and "FAIL" in c[5]:
                rows.append(c)
    log_tail = Path(glog).read_text(errors="replace").splitlines()[-25:] if Path(glog).exists() else []
    lines = [f"# Review {id_} (code motion gate, no LLM review spent)", "",
             "The strict code gate (build-plan/tools/motion-gate.py) failed, so the LLM reviewer was skipped.",
             "Verdicts are only PASS or FAIL. Close does not count.", "",
             f"Gate report: `{rep}`", "",
             "| Seam | Option | Frames | Timeline | Hook | Verdict | Worst SSIM | Worst MAE | Notes | Diff frames |",
             "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    fixes = []
    for c in rows:
        sid = c[0]
        diffs = sorted(glob.glob(str(gout / sid / "diffs" / "*.jpg")))
        dtxt = ", ".join(f"`{d}`" for d in diffs) or "none (not recorded)"
        lines.append(f"| {sid} | {c[1]} | {c[2]} | {c[3]} | {c[4]} | FAIL | {c[6]} | {c[7]} | {c[8]} | {dtxt} |")
        fixes.append(f"- {sid} ({c[1]}): frames {c[2]}, timeline {c[3]}, hook {c[4]}, worst SSIM {c[6]} (need >= 0.92), "
                     f"worst MAE {c[7]} (need <= 8). Notes: {c[8] or 'none'}. Gold clip and prototype are listed for {sid} in "
                     f"/workspace/tina-campbell/build-plan/tools/motion-gate-seams.json. Diff frames (gold | site | x3 diff): {dtxt}.")
    if not rows:
        lines.append("| (gate) | - | FAIL | FAIL | - | FAIL | n/a | n/a | gate crashed or wrote no report; see log tail | none |")
        fixes.append("- The motion gate produced no seam rows (crash or no report). Log tail:\n```\n" + "\n".join(log_tail) + "\n```")
    lines += ["", "Gate log tail:", "```", *log_tail, "```", ""]
    fp = fix_prompt(base, nxt, f"Locked motion gate round {nxt} (code gate FAIL)",
                    "Scope is only the seams below, which failed the strict code motion gate. Do not restyle anything else.\n"
                    "Match each locked prototype 1:1 (same timeline duration, eases, masks, layering, colours; expose "
                    "window.__PROTO_READY__, window.__PROTO_TL__, window.__START_RECORD__ and window.__PROTO_DONE__ exactly as "
                    "motion-reference/12-seam-transitions/_shared/boot.js does). Then re-run\n"
                    "`python3 /workspace/tina-campbell/build-plan/tools/motion-gate.py --base http://127.0.0.1:<port> "
                    f"--out /workspace/tina-campbell/qa/{base}/gate --clean-out` until its last line is VERDICT: PASS.\n\n"
                    + "\n".join(fixes))
    lines.append(f"Fix prompt: `{fp}`" if fp else "Fix prompt: none (3 fix rounds already used; logged as open gap by the driver).")
    lines += ["", "VERDICT: FAIL"]
    (BP / "reviews").mkdir(exist_ok=True)
    (BP / "reviews" / f"{id_}.md").write_text("\n".join(lines) + "\n")
    print("VERDICT: FAIL")


def strict(id_, base, nxt):
    rp = BP / "reviews" / f"{id_}.md"
    if not rp.exists():
        print("VERDICT: FAIL"); return
    txt = rp.read_text(errors="replace").rstrip("\n").splitlines()
    last = txt[-1].strip() if txt else ""
    bad = []; seen = 0
    for ln in txt:
        s = ln.strip()
        if not s.startswith("|") or re.match(r"^\|\s*-", s):
            continue
        cells = [x.strip().strip("*").strip() for x in s.strip("|").split("|")]
        if len(cells) < 2 or cells[0].lower() in ("id", "target", "#", "seam"):
            continue
        tid = cells[0]
        if not VERDICT_CELL.match(cells[1]):
            continue  # not a verdict table row (e.g. a measurements table)
        if tid in KNOWN_GAPS:
            continue
        verdict = cells[1].upper()
        seen += 1
        if verdict != "PASS" or SOFT.search(cells[1]):
            bad.append((tid, cells[1], s))
    if last == "VERDICT: PASS" and seen and not bad:
        print("VERDICT: PASS"); return
    if last == "VERDICT: PASS":
        why = "no verdict table rows found" if not seen else "rows not PASS: " + ", ".join(f"{t}={v}" for t, v, _ in bad)
        txt.append("")
        txt.append(f"Strict gate override (code): {why}. Only PASS passes; CLOSEST counts as FAIL.")
        if bad and not (BP / "prompts" / f"{base}-fix{nxt}.md").exists():
            fp = fix_prompt(base, nxt, f"Exact-match round {nxt} (strict: non-PASS rows)",
                            "Scope is only the IDs below. The reviewer did not mark them PASS; under Matt's rule close does not count.\n"
                            f"Evidence and measurements are in /workspace/tina-campbell/build-plan/reviews/{id_}.md.\n\n"
                            + "\n".join(f"- {t}: reviewer said {v}. Row: {r}" for t, v, r in bad))
            txt.append(f"Fix prompt: `{fp}`" if fp else "Fix prompt: none (3 fix rounds used).")
        txt += ["", "VERDICT: FAIL"]
        rp.write_text("\n".join(txt) + "\n")
    print("VERDICT: FAIL")


if __name__ == "__main__":
    m = sys.argv[1]
    if m == "gate":
        gate(*sys.argv[2:7])
    elif m == "strict":
        strict(*sys.argv[2:5])
    else:
        sys.exit("usage: gate-review.py gate|strict ...")
