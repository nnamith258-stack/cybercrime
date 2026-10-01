"""Append-only forensic audit log."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

MODEL_VERSION = "ReCoveAI-forensic-pipeline-1.0"


def append_audit_entry(log_path: Path, entry: Dict[str, Any]) -> Dict[str, Any]:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_version": MODEL_VERSION,
        **entry,
    }
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, default=str) + "\n")
    return record


def read_audit_log(log_path: Path) -> List[Dict[str, Any]]:
    if not log_path.exists():
        return []
    rows = []
    for line in log_path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def build_entry(
    *,
    case_id: str,
    original_filename: str,
    original_sha256: str,
    file_type: str,
    file_size: int,
    damage_status: str,
    damage_description: str,
    fragment_count: int,
    reassembly_method: Optional[str],
    restoration_method: Optional[str],
    recovered_sha256: Optional[str],
    validation_status: str,
    recovery_status: str,
) -> Dict[str, Any]:
    return {
        "case_id": case_id,
        "original_filename": original_filename,
        "original_sha256": original_sha256,
        "file_type": file_type,
        "file_size": file_size,
        "damage_status": damage_status,
        "damage_description": damage_description,
        "fragment_count": fragment_count,
        "reassembly_method": reassembly_method,
        "restoration_method": restoration_method,
        "recovered_sha256": recovered_sha256,
        "validation_status": validation_status,
        "recovery_status": recovery_status,
        "model_version": MODEL_VERSION,
    }
