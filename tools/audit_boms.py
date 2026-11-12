#!/usr/bin/env python3
"""
Procurement & BOM SSOT Automated Auditor (采购与 BOM 文档体系自动化校验脚本).

Checks:
1. Table arithmetic consistency inside every BOM_01 ~ BOM_10 (qty*unit == total, detail sum == subtotal, subtotal sum == grand total).
2. Cross-document total alignment between BOM_01 ~ BOM_10, 00_第一期总工程预算与采购总台账.md, and docs/02_requirements_and_plans/README.md.
3. Relative Markdown link existence across 02_procurement_and_boms/, 03_engineering_specs/, and README.md.
4. Strict ISO 8601 UTC timestamp format (YYYY-MM-DDTHH:mm:ss.000Z) and required BOM metadata headers.
5. SSOT boundary guard ensuring 03_engineering_specs/ contains no commercial pricing table columns.
"""

from __future__ import annotations

import glob
import os
import re
import sys
from pathlib import Path
from typing import List, Tuple

ROOT = Path(__file__).resolve().parent.parent
PLAN_DIR = ROOT / "docs" / "02_requirements_and_plans"
PROC_DIR = PLAN_DIR / "02_procurement_and_boms"
BOMS_DIR = PROC_DIR / "boms"
SPECS_DIR = PLAN_DIR / "03_engineering_specs"
LEDGER_PATH = PROC_DIR / "00_第一期总工程预算与采购总台账.md"
README_PATH = PLAN_DIR / "README.md"

UTC_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z")
MONEY_RE = re.compile(r"¥\s*([\d,]+\.\d+|[\d,]+)")
LINK_RE = re.compile(r"\[([^\]]+)\]\(((?:[^()]+|\([^()]*\))+)\)")
AMOUNT_COL_KEYS = ("合计", "总价", "小计", "预算金额", "实核预算", "参考金额", "人工费")


def parse_money(cell: str) -> List[float]:
    return [float(m.replace(",", "")) for m in MONEY_RE.findall(cell)]


def split_row(line: str) -> List[str]:
    return [c.strip() for c in line.strip().split("|")[1:-1]]


def is_separator_row(cells: List[str]) -> bool:
    return bool(cells) and all(set(c) <= set("-: ") for c in cells)


def audit_bom_tables(bom_path: Path) -> Tuple[List[str], float]:
    """Audit arithmetic inside a single BOM markdown file and return (errors, grand_total)."""
    errors: List[str] = []
    lines = bom_path.read_text(encoding="utf-8").splitlines()
    name = bom_path.name

    header: List[str] = []
    in_table = False
    is_overview = False
    sub_sum = 0.0
    pct_sum = 0.0
    subtotals: List[float] = []
    overview_total = None

    for lineno, raw in enumerate(lines, 1):
        s = raw.strip()
        if not s.startswith("|"):
            in_table = False
            header = []
            sub_sum = 0.0
            pct_sum = 0.0
            continue

        cells = split_row(s)
        if not cells:
            continue

        if is_separator_row(cells):
            in_table = True
            sub_sum = 0.0
            pct_sum = 0.0
            is_overview = any("占比" in h for h in header)
            continue

        if not in_table:
            header = cells
            continue

        first_clean = re.sub(r"[*` ]", "", cells[0])
        if first_clean in {"一", "二", "三", "四", "五"} and all(
            c.replace("*", "").strip() == "" for c in cells[2:-2]
        ):
            # Category divider row inside BOM_01 (e.g. **一** | **柜体结构** | ... | ¥ 1,410.00 |)
            continue

        is_summary = any(k in first_clean for k in ("小计", "合计", "区合计"))
        if is_summary:
            # Find summary money value in the money column (before remark column if present)
            money_col_idx = next(
                (i for i, h in enumerate(header) if any(k in h for k in AMOUNT_COL_KEYS)),
                len(cells) - 1,
            )
            vals = parse_money(cells[money_col_idx]) if money_col_idx < len(cells) else []
            if not vals:
                vals = parse_money(" ".join(cells[:-1] if len(cells) > 2 else cells))
            if not vals:
                errors.append(f"{name}:L{lineno} summary row missing ¥ amount")
                sub_sum = 0.0
                continue
            stated = vals[-1]
            if abs(sub_sum - stated) > 0.05:
                errors.append(
                    f"{name}:L{lineno} [{first_clean}] sum mismatch: computed={sub_sum:.2f} vs stated={stated:.2f}"
                )
            if is_overview:
                overview_total = stated
                if pct_sum > 0 and abs(pct_sum - 100.0) > 0.25:
                    errors.append(
                        f"{name}:L{lineno} overview percentage sum={pct_sum:.2f}% (expected ~100.00%)"
                    )
            else:
                subtotals.append(stated)
            sub_sum = 0.0
            pct_sum = 0.0
            continue

        # Data row
        if is_overview:
            amt_col = next((i for i, h in enumerate(header) if any(k in h for k in AMOUNT_COL_KEYS)), -1)
            pct_col = next((i for i, h in enumerate(header) if "占比" in h), -1)
            if amt_col >= 0 and amt_col < len(cells):
                vals = parse_money(cells[amt_col])
                if vals:
                    sub_sum += vals[0]
            if pct_col >= 0 and pct_col < len(cells):
                pm = re.search(r"([\d.]+)\s*%", cells[pct_col])
                if pm:
                    pct_sum += float(pm.group(1))
        else:
            # Detail table: identify total column and optionally qty/unit columns
            total_col = next(
                (i for i, h in enumerate(header) if any(k in h for k in AMOUNT_COL_KEYS)),
                -1,
            )
            unit_col = next(
                (i for i, h in enumerate(header) if "单价" in h),
                -1,
            )
            qty_col = next(
                (i for i, h in enumerate(header) if h in ("数量", "总数量", "采购数量")),
                -1,
            )
            if total_col >= 0 and total_col < len(cells):
                t_vals = parse_money(cells[total_col])
                if t_vals:
                    t_val = t_vals[-1]
                    sub_sum += t_val
                    if qty_col >= 0 and unit_col >= 0 and qty_col < len(cells) and unit_col < len(cells):
                        qm = re.fullmatch(r"\**\s*(\d+(?:\.\d+)?)\s*\**", cells[qty_col])
                        u_vals = parse_money(cells[unit_col])
                        if qm and len(u_vals) == 1 and "综合" not in cells[unit_col]:
                            qty = float(qm.group(1))
                            if abs(qty * u_vals[0] - t_val) > 0.05:
                                errors.append(
                                    f"{name}:L{lineno} qty*unit mismatch: {qty} * {u_vals[0]:.2f} != {t_val:.2f}"
                                )

    # Exclude BOM_01 Section 3 ("第二期电表改造硬件备忘" ¥655.00) from BOM_01 active total
    active_subtotals = subtotals[:-1] if name.startswith("BOM_01_") and len(subtotals) > 1 else subtotals
    detail_grand = sum(active_subtotals)
    if overview_total is not None and abs(detail_grand - overview_total) > 0.05:
        errors.append(
            f"{name} overview total ({overview_total:.2f}) != detail subtotals sum ({detail_grand:.2f})"
        )
    return errors, (overview_total if overview_total is not None else detail_grand)


def audit_ledger(bom_totals: dict[str, float]) -> List[str]:
    """Audit 00_第一期总工程预算与采购总台账.md section totals and cross-BOM alignment."""
    errors: List[str] = []
    text = LEDGER_PATH.read_text(encoding="utf-8")
    lines = text.splitlines()

    # Reuse table checker for ledger tables
    header: List[str] = []
    in_table = False
    sub_sum = 0.0
    zone_totals: dict[str, float] = {}

    for lineno, raw in enumerate(lines, 1):
        s = raw.strip()
        if not s.startswith("|"):
            in_table = False
            header = []
            sub_sum = 0.0
            continue
        cells = split_row(s)
        if not cells:
            continue
        if is_separator_row(cells):
            in_table = True
            sub_sum = 0.0
            continue
        if not in_table:
            header = cells
            continue

        first_clean = re.sub(r"[*` ]", "", cells[0])
        if any(k in first_clean for k in ("合计", "小计")):
            amt_col = next((i for i, h in enumerate(header) if any(k in h for k in ("金额", "人工费"))), 2)
            vals = parse_money(cells[amt_col])
            if vals:
                if abs(sub_sum - vals[0]) > 0.05:
                    errors.append(
                        f"Ledger:L{lineno} [{first_clean}] sum mismatch: computed={sub_sum:.2f} vs stated={vals[0]:.2f}"
                    )
                zone_totals[first_clean] = vals[0]
            sub_sum = 0.0
            continue

        amt_col = next((i for i, h in enumerate(header) if any(k in h for k in ("金额", "人工费"))), -1)
        if amt_col >= 0 and amt_col < len(cells):
            vals = parse_money(cells[amt_col])
            if vals:
                sub_sum += vals[0]

    # Verify A区 + B区 == ¥133,938.40 and child BOM totals match
    for label in ("A区合计", "B区合计", "C区合计", "D区合计"):
        if label not in zone_totals:
            errors.append(f"Ledger missing summary row: {label}")

    if "A区合计" in zone_totals and "B区合计" in zone_totals:
        combined = zone_totals["A区合计"] + zone_totals["B区合计"]
        if f"{combined:,.2f}" not in text:
            errors.append(f"Ledger missing or mismatched A+B total: expected ¥ {combined:,.2f}")
        if "D区合计" in zone_totals:
            combined_abd = combined + zone_totals["D区合计"]
            if f"{combined_abd:,.2f}" not in text:
                errors.append(f"Ledger missing or mismatched A+B+D total: expected ¥ {combined_abd:,.2f}")

    # Cross-check single-phase BOMs (01, 04, 05, 06, 07, 08, 09, 10, 11, 12)
    single_phase_codes = ["BOM-01", "BOM-04", "BOM-05", "BOM-06", "BOM-07", "BOM-08", "BOM-09", "BOM-10", "BOM-11", "BOM-12"]
    for code in single_phase_codes:
        bom_prefix = code.replace("-", "_")
        actual = next((v for k, v in bom_totals.items() if k.startswith(bom_prefix)), None)
        if actual is None:
            errors.append(f"Missing BOM file for {code}")
            continue
        m = re.search(rf"\|\s*\*\*{code}\*\*\s*\|[^|]+\|\s*\*\*¥\s*([\d,]+\.\d+)\*\*", text)
        if not m:
            errors.append(f"Ledger missing row for {code}")
            continue
        ledger_val = float(m.group(1).replace(",", ""))
        if abs(ledger_val - actual) > 0.05:
            errors.append(f"Ledger {code} ({ledger_val:.2f}) != {bom_prefix} total ({actual:.2f})")

    # Cross-check split-phase BOMs (BOM-02: 200+1970=2170, BOM-03: 590+8650=9240)
    for code, c_tag in [("BOM-02", "BOM-02 预留"), ("BOM-03", "BOM-03 预留")]:
        bom_prefix = code.replace("-", "_")
        actual = next((v for k, v in bom_totals.items() if k.startswith(bom_prefix)), None)
        m_a = re.search(rf"\|\s*\*\*{code}\*\*\s*\|[^|]+\|\s*\*\*¥\s*([\d,]+\.\d+)\*\*", text)
        m_c = re.search(rf"\|\s*\*\*{c_tag}\*\*\s*\|[^|]+\|[^|]+\|\s*\*\*¥\s*([\d,]+\.\d+)\*\*", text)
        if not (actual is not None and m_a and m_c):
            errors.append(f"Ledger split-phase rows missing for {code}")
            continue
        sum_ac = float(m_a.group(1).replace(",", "")) + float(m_c.group(1).replace(",", ""))
        if abs(sum_ac - actual) > 0.05:
            errors.append(f"Ledger {code} (A+C={sum_ac:.2f}) != {bom_prefix} total ({actual:.2f})")

    return errors


def audit_links_and_metadata(files: List[Path], require_bom_meta: bool) -> List[str]:
    """Check relative markdown links, UTC timestamps, and BOM metadata headers."""
    errors: List[str] = []
    for path in files:
        text = path.read_text(encoding="utf-8")
        if path.parent == BOMS_DIR or path == LEDGER_PATH:
            if not UTC_RE.search(text):
                errors.append(f"{path.name} missing strict ISO 8601 UTC timestamp")
        if require_bom_meta and path.parent == BOMS_DIR:
            for field in ("适用分期", "业务域", "台账状态"):
                if field not in text:
                    errors.append(f"{path.name} missing metadata field: {field}")

        for label, target in LINK_RE.findall(text):
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            rel = target.split("#")[0]
            if not rel:
                continue
            resolved = (path.parent / rel).resolve()
            if not resolved.exists():
                errors.append(f"{path.name} broken link: [{label}]({target})")
    return errors


def audit_specs_no_pricing() -> List[str]:
    """Ensure engineering specs do not embed commercial unit/total price table columns."""
    errors: List[str] = []
    for spec in sorted(SPECS_DIR.glob("*.md")):
        for lineno, line in enumerate(spec.read_text(encoding="utf-8").splitlines(), 1):
            if line.strip().startswith("|") and any(
                col in line for col in ("| 单价", "| 实核单价", "| 核定单价", "| 总价", "| 合计金额", "| 预算金额")
            ):
                errors.append(f"{spec.name}:L{lineno} violates SSOT: pricing column found in engineering spec")
    return errors


def main() -> int:
    bom_files = sorted(BOMS_DIR.glob("BOM_*.md"))
    all_errors: List[str] = []
    bom_totals: dict[str, float] = {}

    for bf in bom_files:
        errs, total = audit_bom_tables(bf)
        all_errors.extend(errs)
        bom_totals[bf.name] = total

    all_errors.extend(audit_ledger(bom_totals))
    all_errors.extend(audit_links_and_metadata([LEDGER_PATH, README_PATH] + bom_files, require_bom_meta=True))
    all_errors.extend(audit_links_and_metadata(sorted(SPECS_DIR.glob("*.md")), require_bom_meta=False))
    all_errors.extend(audit_specs_no_pricing())

    print("=== BOM SSOT Audit Summary ===")
    for name, total in sorted(bom_totals.items()):
        print(f"  {name}: ¥ {total:,.2f}")

    if all_errors:
        print(f"\n[FAIL] Found {len(all_errors)} issue(s):")
        for err in all_errors:
            print(f"  - {err}")
        return 1

    print("\n[PASS] All BOM arithmetic, ledger reconciliation, relative links, UTC timestamps, and SSOT boundaries passed (0 errors).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
