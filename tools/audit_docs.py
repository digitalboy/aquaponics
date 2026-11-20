#!/usr/bin/env python3
"""
Full-Repository Docs-as-Code Governance Auditor (`pnpm docs:check`).

Checks:
1. Delegates BOM arithmetic, ledger reconciliation, and spec SSOT boundary checks to `tools/audit_boms.py`.
2. Checks all relative Markdown links & image references across root `README.md` and `docs/**/*.md` (excluding `docs/references/`).
3. Checks index coverage: active `.md` docs must be referenced by at least one `README.md` index.
4. Enforces clean filenames (no half-width parentheses `(` or `)`) for active docs.
5. Guards against redundant `.pdf` artifacts under `docs/` and accidental secret leaks (JWT/Tunnel tokens).
6. Checks ISO 8601 UTC timestamp (`YYYY-MM-DDTHH:mm:ss.000Z`) presence in active doc headers.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
EXCLUDED_DIRS = {"references", "99_archive", "adr"}

LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^()#\s]+(?:\([^)]*\)[^()#\s]*)*)(?:#[^)]*)?\)")
UTC_RE = re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z")
SECRET_RE = re.compile(r"eyJ[A-Za-z0-9_-]{24,}\.[A-Za-z0-9_-]{10,}")


def is_under(path: Path, folder_name: str) -> bool:
    try:
        rel = path.relative_to(DOCS)
        return bool(rel.parts) and rel.parts[0] == folder_name
    except ValueError:
        return False


def collect_md_files() -> list[Path]:
    files = [ROOT / "README.md"]
    for p in sorted(DOCS.rglob("*.md")):
        if is_under(p, "references"):
            continue
        files.append(p)
    return files


def check_links(md_files: list[Path], errors: list[str]) -> None:
    for md in md_files:
        text = md.read_text(encoding="utf-8")
        for idx, line in enumerate(text.splitlines(), start=1):
            for m in LINK_RE.finditer(line):
                raw = m.group(1).strip()
                if raw.startswith(("http://", "https://", "mailto:", "file://", "data:", "#")):
                    continue
                target = (md.parent / unquote(raw)).resolve()
                if not target.exists():
                    errors.append(
                        f"[Broken Link] {md.relative_to(ROOT)}:{idx} -> {raw}"
                    )


def check_orphans(errors: list[str]) -> None:
    readme_texts = (ROOT / "README.md").read_text(encoding="utf-8")
    for r in DOCS.rglob("README.md"):
        if not is_under(r, "references"):
            readme_texts += "\n" + r.read_text(encoding="utf-8")

    for p in sorted(DOCS.rglob("*.md")):
        if p.name == "README.md":
            continue
        if any(is_under(p, d) for d in EXCLUDED_DIRS):
            continue
        if "sop_kanban" in p.parts:
            continue
        if p.name not in readme_texts:
            errors.append(
                f"[Orphan Doc] {p.relative_to(ROOT)} is not indexed in any README.md"
            )


def check_filenames_and_pdfs(errors: list[str]) -> None:
    for p in sorted(DOCS.rglob("*")):
        if p.is_dir():
            continue
        if p.suffix.lower() == ".pdf":
            errors.append(
                f"[Redundant PDF] {p.relative_to(ROOT)} should not exist under docs/ (keep Markdown as SSOT)"
            )
        if p.suffix.lower() == ".md" and not any(is_under(p, d) for d in ("references", "99_archive")):
            if "(" in p.name or ")" in p.name:
                errors.append(
                    f"[Bad Filename] {p.relative_to(ROOT)} contains parentheses '(' or ')'"
                )


def check_secrets_and_utc(md_files: list[Path], errors: list[str], warnings: list[str]) -> None:
    for md in md_files:
        text = md.read_text(encoding="utf-8")
        for idx, line in enumerate(text.splitlines(), start=1):
            if SECRET_RE.search(line):
                errors.append(
                    f"[Secret Leak Risk] {md.relative_to(ROOT)}:{idx} matches JWT/Tunnel Token pattern"
                )

        if md == ROOT / "README.md" or md.name == "README.md":
            continue
        if any(is_under(md, d) for d in ("references", "99_archive")) or "sop_kanban" in md.parts:
            continue
        header = "\n".join(text.splitlines()[:25])
        if not UTC_RE.search(header):
            warnings.append(
                f"[Missing UTC Header] {md.relative_to(ROOT)} lacks ISO 8601 UTC timestamp in first 25 lines"
            )


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []

    bom_proc = subprocess.run(
        [sys.executable, str(ROOT / "tools" / "audit_boms.py")],
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if bom_proc.returncode != 0:
        errors.append("[BOM Audit Failed]\n" + bom_proc.stdout + bom_proc.stderr)

    md_files = collect_md_files()
    check_links(md_files, errors)
    check_orphans(errors)
    check_filenames_and_pdfs(errors)
    check_secrets_and_utc(md_files, errors, warnings)

    if warnings:
        print(f"=== Warnings ({len(warnings)}) ===")
        for w in warnings:
            print(" ", w)

    if errors:
        print(f"\n=== Errors ({len(errors)}) ===", file=sys.stderr)
        for e in errors:
            print(" ", e, file=sys.stderr)
        return 1

    print(
        f"[PASS] Full docs governance check passed! "
        f"(checked {len(md_files)} Markdown files, 0 errors, {len(warnings)} warnings)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
