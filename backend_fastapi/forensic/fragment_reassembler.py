"""Order carved fragments using offset, continuity, and parser validation."""

from __future__ import annotations

from typing import Any, Dict, List

from .forensic_validator import validate_bytes


def reassemble_fragments(fragments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Propose ordered recoveries. Does not label a concatenation as recovered
    unless validation supports it.
    """
    if not fragments:
        return []

    by_type: Dict[str, List[Dict[str, Any]]] = {}
    for frag in fragments:
        by_type.setdefault(frag.get("file_type", "UNKNOWN"), []).append(frag)

    assemblies: List[Dict[str, Any]] = []
    for file_type, group in by_type.items():
        ordered = sorted(group, key=lambda f: (f.get("start_offset", 0), f.get("id", "")))
        # Prefer complete header-to-footer singles already carved as full files
        for frag in ordered:
            raw = frag.get("raw_bytes", b"")
            validation = validate_bytes(raw, file_type)
            assemblies.append(_assembly([frag], file_type, "physical_offset_single_carve", validation, 0.0))

        # If multiple same-type fragments are contiguous, try concatenating neighbors
        if len(ordered) >= 2:
            concat = b"".join(f.get("raw_bytes", b"") for f in ordered)
            validation = validate_bytes(concat, file_type)
            gap_penalty = 0.0
            for a, b in zip(ordered, ordered[1:]):
                gap = b.get("start_offset", 0) - a.get("end_offset", 0)
                if gap > 0:
                    gap_penalty += min(0.4, gap / max(1, concat and len(concat) or 1))
            assemblies.append(
                _assembly(ordered, file_type, "offset_order_concat", validation, gap_penalty)
            )

    # Keep best unique candidate per type (highest confidence, prefer VALID)
    best: Dict[str, Dict[str, Any]] = {}
    for item in assemblies:
        key = item["file_type"]
        prev = best.get(key)
        if prev is None or _rank(item) > _rank(prev):
            best[key] = item
    return list(best.values())


def _assembly(
    frags: List[Dict[str, Any]],
    file_type: str,
    method: str,
    validation: Dict[str, Any],
    gap_penalty: float,
) -> Dict[str, Any]:
    raw = b"".join(f.get("raw_bytes", b"") for f in frags)
    output = "VALIDATED_FILE" if validation.get("result") == "VALID" else (
        "RECOVERED_FILE" if validation.get("result") == "PARTIALLY_VALID" else "CARVED_FRAGMENT"
    )
    base = 0.35
    if validation.get("result") == "VALID":
        base = 0.92
    elif validation.get("result") == "PARTIALLY_VALID":
        base = 0.62
    if len(frags) == 1 and validation.get("result") == "VALID":
        base = 0.97
    confidence = round(max(0.0, min(1.0, base - gap_penalty)), 3)
    return {
        "file_type": file_type,
        "fragment_ids": [f.get("id") for f in frags],
        "ordering_method": method,
        "ordering_confidence": confidence,
        "output_role": output,
        "payload": raw,
        "validation": validation,
    }


def _rank(item: Dict[str, Any]) -> tuple:
    order = {"VALIDATED_FILE": 3, "RECOVERED_FILE": 2, "CARVED_FRAGMENT": 1}
    return (order.get(item["output_role"], 0), item["ordering_confidence"], len(item["payload"]))
