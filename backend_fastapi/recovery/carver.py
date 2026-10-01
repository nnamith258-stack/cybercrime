from __future__ import annotations

import struct
import uuid
from typing import Iterable

from .models import RecoveryArtifact, RecoveryStatus
from .signatures import SIGNATURES
from .validators import validate_artifact


def _ranges(data: bytes, magic: bytes) -> Iterable[int]:
    start = 0
    while (offset := data.find(magic, start)) >= 0:
        yield offset
        start = offset + 1


def _end_for(data: bytes, file_type: str, start: int) -> int | None:
    if file_type == "JPEG":
        end = data.find(b"\xff\xd9", start + 3)
        return end + 2 if end >= 0 else None
    if file_type == "PNG":
        position = start + 8
        while position + 12 <= len(data):
            length = struct.unpack(">I", data[position:position + 4])[0]
            end = position + 12 + length
            if end > len(data):
                return None
            if data[position + 4:position + 8] == b"IEND":
                return end
            position = end
        return None
    if file_type == "PDF":
        end = data.find(b"%%EOF", start + 5)
        return end + 5 if end >= 0 else None
    if file_type in {"ZIP", "DOCX", "XLSX", "PPTX"}:
        end = data.find(b"PK\x05\x06", start + 4)
        if end < 0:
            end = data.find(b"PK\x06\x06", start + 4)
            return end + 56 if end >= 0 else None
        return end + 22
    if file_type == "GIF":
        end = data.find(b";", start + 6)
        return end + 1 if end >= 0 else None
    if file_type == "WEBP":
        if start + 8 <= len(data):
            size = struct.unpack_from("<I", data, start + 4)[0]
            return min(len(data), start + 8 + size)
        return None
    if file_type == "MP4":
        if start >= 4:
            box_size = struct.unpack(">I", data[start - 4:start])[0]
            if box_size >= 8:
                return min(len(data), start - 4 + box_size)
        return len(data)
    if file_type == "SQLite":
        return len(data)
    if file_type == "MP3":
        return len(data)
    return None


def _signature_hits(data: bytes):
    for signature in SIGNATURES:
        for offset in _ranges(data, signature.magic):
            yield signature, offset


def carve(data: bytes, *, expected_types: set[str] | None = None) -> list[RecoveryArtifact]:
    """Carve complete, structurally bounded files from immutable source bytes."""
    artifacts: list[RecoveryArtifact] = []
    occupied: list[tuple[int, int]] = []
    for signature, start in sorted(_signature_hits(data), key=lambda item: item[1]):
        if expected_types and signature.file_type not in expected_types:
            continue
        if signature.file_type == "WEBP" and data[start:start + 8] != b"RIFF":
            continue
        end = _end_for(data, signature.file_type, start)
        if end is None or end <= start:
            continue
        raw = data[start:end]
        validation = validate_artifact(raw, signature.file_type)
        if not validation["valid"]:
            continue
        actual_type = validation["format"]
        if any(start >= left and start < right for left, right in occupied):
            continue
        artifact = RecoveryArtifact(
            artifact_id=f"ART-{uuid.uuid4().hex[:12]}",
            file_type=actual_type,
            data=raw,
            source_offsets=[(start, end)],
            expected_size=len(raw),
            recovered_name=f"recovered_{len(artifacts) + 1}.{actual_type.lower()}",
            status=RecoveryStatus.RECOVERED,
            forensic_confidence=1.0,
            validation=validation,
        )
        artifacts.append(artifact)
        occupied.append((start, end))
    return artifacts
