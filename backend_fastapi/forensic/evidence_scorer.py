"""Explainable evidence scores derived only from measured analysis fields."""

from __future__ import annotations

from typing import Any, Dict, Optional, Union

NA = "N/A"


def _bool_points(value: Any, when_true: float, when_false: float = 0.0) -> Optional[float]:
    if value == "N/A" or value is None:
        return None
    return when_true if value else when_false


def score_evidence(
    analysis: Dict[str, Any],
    *,
    original_size: int,
    recovered_size: int,
    bytes_preserved: int,
    validation_result: str,
    ordering_confidence: Union[float, str] = NA,
    visual_restoration: bool = False,
) -> Dict[str, Any]:
    factors_integrity = []
    integ_vals = []

    for label, val, pts in (
        ("valid_file_signature", analysis.get("signature_valid"), 25.0),
        ("parser_success", analysis.get("parser_valid"), 25.0),
        ("decoder_success", analysis.get("decoder_valid"), 25.0),
    ):
        p = _bool_points(val, pts)
        if p is None:
            factors_integrity.append({"factor": label, "contribution": NA})
        else:
            integ_vals.append(p)
            factors_integrity.append({"factor": label, "contribution": p})

    if original_size > 0:
        preserved_pct = min(100.0, 100.0 * bytes_preserved / original_size)
        struct_pts = round(preserved_pct * 0.25, 2)
        integ_vals.append(struct_pts)
        factors_integrity.append({"factor": "percent_original_data_preserved", "contribution": struct_pts})
    else:
        factors_integrity.append({"factor": "percent_original_data_preserved", "contribution": NA})

    integrity_score = round(sum(integ_vals), 2) if integ_vals else NA
    if isinstance(integrity_score, (int, float)):
        integrity_score = min(100.0, integrity_score)

    rec_vals = []
    rec_factors = []
    if original_size > 0:
        survive = round(min(100.0, 100.0 * bytes_preserved / original_size) * 0.35, 2)
        rec_vals.append(survive)
        rec_factors.append({"factor": "surviving_data", "contribution": survive})
    else:
        rec_factors.append({"factor": "surviving_data", "contribution": NA})

    reconstructed = validation_result in ("VALID", "PARTIALLY_VALID")
    rec_vals.append(30.0 if reconstructed else 0.0)
    rec_factors.append({"factor": "successful_reconstruction", "contribution": 30.0 if reconstructed else 0.0})

    val_pts = {"VALID": 25.0, "PARTIALLY_VALID": 12.0, "INVALID": 0.0}.get(validation_result, None)
    if val_pts is None:
        rec_factors.append({"factor": "validation_success", "contribution": NA})
    else:
        rec_vals.append(val_pts)
        rec_factors.append({"factor": "validation_success", "contribution": val_pts})

    if ordering_confidence == NA or ordering_confidence is None:
        rec_factors.append({"factor": "fragment_ordering_confidence", "contribution": NA})
    else:
        oc = float(ordering_confidence) * 10.0
        rec_vals.append(oc)
        rec_factors.append({"factor": "fragment_ordering_confidence", "contribution": round(oc, 2)})

    recovery_confidence = round(sum(rec_vals), 2) if rec_vals else NA
    if isinstance(recovery_confidence, (int, float)):
        recovery_confidence = min(100.0, recovery_confidence)

    rel_vals = []
    rel_factors = []
    type_pts = 20.0 if analysis.get("file_type") in ("JPEG", "PNG", "PDF") else 5.0
    rel_vals.append(type_pts)
    rel_factors.append({"factor": "file_type", "contribution": type_pts})

    meta_pts = 15.0 if analysis.get("dimensions") or analysis.get("has_eof") else 5.0
    rel_vals.append(meta_pts)
    rel_factors.append({"factor": "metadata_availability", "contribution": meta_pts})

    recov_pts = 40.0 if analysis.get("status") == "HEALTHY" else (25.0 if reconstructed else 0.0)
    rel_vals.append(recov_pts)
    rel_factors.append({"factor": "successful_recovery_or_intact", "contribution": recov_pts})

    use_pts = 25.0 if analysis.get("decoder_valid") is True or analysis.get("parser_valid") is True else 0.0
    rel_vals.append(use_pts)
    rel_factors.append({"factor": "file_usability", "contribution": use_pts})

    investigative_relevance = round(min(100.0, sum(rel_vals)), 2)

    numeric = [v for v in (integrity_score, recovery_confidence, investigative_relevance) if isinstance(v, (int, float))]
    overall_score = round(sum(numeric) / len(numeric), 2) if numeric else NA

    if visual_restoration:
        rec_factors.append({"factor": "ai_visual_estimate_excluded_from_integrity", "contribution": 0.0})

    return {
        "integrity_score": integrity_score,
        "recovery_confidence": recovery_confidence,
        "investigative_relevance": investigative_relevance,
        "overall_score": overall_score,
        "factors": {
            "integrity": factors_integrity,
            "recovery_confidence": rec_factors,
            "investigative_relevance": rel_factors,
        },
    }
