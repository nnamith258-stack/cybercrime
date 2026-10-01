"""Deterministic fragment classification. CNN confidence is N/A unless a model is loaded."""

from __future__ import annotations

from typing import Any, Dict, Optional

from .forensic_analyzer import detect_type

CNN_AVAILABLE = False
CNN_MODEL_VERSION = None


def classify_fragment(raw_bytes: bytes, hint_type: Optional[str] = None) -> Dict[str, Any]:
    detected = detect_type(raw_bytes, "")
    file_type = detected["file_type"]
    if file_type in ("DISK_IMAGE", "EMPTY"):
        file_type = "UNKNOWN"
    if file_type == "ZIP":
        file_type = "UNKNOWN" if hint_type != "DOCX" else "DOCX"

    if file_type not in ("JPEG", "PNG", "PDF", "DOCX", "SQLITE"):
        if raw_bytes.startswith(b"SQLite format 3"):
            file_type = "SQLITE"
        elif raw_bytes.startswith(b"PK\x03\x04"):
            file_type = "DOCX" if (b"word/" in raw_bytes[:4096] or b"[Content_Types].xml" in raw_bytes[:4096]) else "UNKNOWN"
        elif hint_type in ("JPEG", "PNG", "PDF", "DOCX", "SQLITE"):
            file_type = hint_type
        else:
            file_type = "UNKNOWN"

    confidence: Any = "N/A"
    method = "file_signature"
    if CNN_AVAILABLE:
        confidence = "N/A"
        method = "cnn_unavailable_fallback_signature"

    return {
        "predicted_type": file_type,
        "confidence": confidence,
        "method": method,
        "cnn_available": CNN_AVAILABLE,
        "cnn_model_version": CNN_MODEL_VERSION,
        "signature_valid": detected.get("signature_valid", False),
    }
