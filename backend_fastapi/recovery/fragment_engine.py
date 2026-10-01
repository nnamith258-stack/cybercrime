from __future__ import annotations

import math
from collections import Counter


def entropy(data: bytes) -> float:
    if not data:
        return 0.0
    counts = Counter(data)
    size = len(data)
    return -sum((count / size) * math.log2(count / size) for count in counts.values())


def rank_fragment_pair(fragment_a: bytes, fragment_b: bytes, file_type: str, *, offset_a: int = 0, offset_b: int = 0, sector_size: int = 512) -> dict:
    boundary = 1.0 if fragment_a and fragment_b else 0.0
    if file_type == "JPEG":
        boundary = 1.0 if fragment_a[-1:] != b"\xff" or fragment_b[:1] == b"\xd8" else 0.2
    if file_type == "PNG":
        boundary = 1.0 if fragment_a[-4:] != b"IEND" and fragment_b[:4] != b"IEND" else 0.3
    if file_type in {"ZIP", "DOCX", "XLSX", "PPTX"}:
        boundary = 1.0 if not fragment_a.endswith(b"PK\x05\x06") else 0.2
    transition = sum(a != b for a, b in zip(fragment_a[-64:], fragment_b[:64])) / max(1, min(64, len(fragment_a), len(fragment_b)))
    score = max(0.0, min(1.0, 0.35 * boundary + 0.25 * (1 - abs(entropy(fragment_a) - entropy(fragment_b)) / 8) + 0.2 * (1 - min(1, transition)) + 0.2 * (1 if offset_b % sector_size == 0 else 0.25)))
    return {"candidate_a": offset_a, "candidate_b": offset_b, "score": round(score, 4), "reasons": ["boundary compatibility", "entropy continuity", "sector alignment"], "format": file_type, "validation_status": "RANKING_ONLY"}
