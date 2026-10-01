from __future__ import annotations

from .models import RecoveryArtifact, RecoveryStatus
from .validators import validate_artifact


def reconstruct_fragments(fragments: list[tuple[int, bytes]], file_type: str, expected_size: int | None = None) -> RecoveryArtifact:
    ordered = sorted(fragments, key=lambda item: item[0])
    data = b"".join(part for _, part in ordered)
    validation = validate_artifact(data, file_type, expected_size)
    if validation["valid"] and (expected_size is None or len(data) == expected_size):
        status = RecoveryStatus.RECOVERED
    elif validation["valid"] or data:
        status = RecoveryStatus.PARTIAL if validation["valid"] else RecoveryStatus.CORRUPTED
    else:
        status = RecoveryStatus.UNRECOVERABLE
    return RecoveryArtifact(
        artifact_id="reconstructed",
        file_type=file_type,
        data=data,
        source_offsets=[(offset, offset + len(part)) for offset, part in ordered],
        expected_size=expected_size,
        recovered_name=f"recovered.{file_type.lower()}",
        fragment_count=len(ordered),
        status=status,
        forensic_confidence=1.0 if status == RecoveryStatus.RECOVERED else 0.0,
        validation=validation,
    )
