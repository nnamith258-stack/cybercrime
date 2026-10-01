from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class RecoveryStatus(str, Enum):
    RECOVERED = "RECOVERED"
    PARTIAL = "PARTIAL"
    CORRUPTED = "CORRUPTED"
    UNRECOVERABLE = "UNRECOVERABLE"


@dataclass
class RecoveryArtifact:
    artifact_id: str
    file_type: str
    data: bytes
    source_offsets: list[tuple[int, int]]
    expected_size: int | None = None
    original_name: str | None = None
    recovered_name: str = ""
    fragment_count: int = 1
    ml_confidence: float | None = None
    forensic_confidence: float = 0.0
    status: RecoveryStatus = RecoveryStatus.UNRECOVERABLE
    validation: dict[str, Any] = field(default_factory=dict)

    @property
    def recovered_size(self) -> int:
        return len(self.data)

    @property
    def recovery_percentage(self) -> float | None:
        if self.expected_size in (None, 0):
            return None
        return round(min(100.0, len(self.data) / self.expected_size * 100), 2)
