"""Post-recovery structural validation. Generating a file is not enough to label it Recovered."""

from __future__ import annotations

from typing import Any, Dict

from .forensic_analyzer import analyze_bytes


def validate_bytes(data: bytes, expected_type: str | None = None) -> Dict[str, Any]:
    analysis = analyze_bytes(data, f"output.{(expected_type or 'bin').lower()}")
    file_type = expected_type or analysis["file_type"]

    sig = analysis.get("signature_valid")
    dec = analysis.get("decoder_valid")
    par = analysis.get("parser_valid")

    def flag(v: Any) -> str:
        if v == "N/A":
            return "N/A"
        return "PASS" if v is True else "FAIL"

    if analysis["status"] == "HEALTHY":
        result = "VALID"
    elif analysis["status"] == "CORRUPTED" and (dec is True or par is True):
        result = "PARTIALLY_VALID"
    elif analysis["status"] == "UNSUPPORTED_FORMAT":
        result = "INVALID"
    else:
        result = "INVALID"
        if file_type in ("JPEG", "PNG") and dec is True:
            result = "PARTIALLY_VALID"
        if file_type == "PDF" and par is True:
            result = "PARTIALLY_VALID"

    return {
        "result": result,
        "file_type": analysis["file_type"],
        "signature": flag(sig),
        "decoder": flag(dec),
        "parser": flag(par),
        "status": analysis["status"],
        "corruption_indicators": analysis.get("corruption_indicators", []),
        "sha256": analysis["sha256"],
        "file_size": analysis["file_size"],
    }


def validate_file(file_path: str) -> Dict[str, Any]:
    from pathlib import Path

    return validate_bytes(Path(file_path).read_bytes())
