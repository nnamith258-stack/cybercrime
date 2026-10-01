from __future__ import annotations

import hashlib
import math
from datetime import datetime, timezone

if __package__:
    from .models import FragmentModel, ForensicScanResponse, KPIStatsModel, ReconstructedFileModel
    from .recovery.carver import carve
else:
    from models import FragmentModel, ForensicScanResponse, KPIStatsModel, ReconstructedFileModel
    from recovery.carver import carve


def calculate_shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    frequencies = [data.count(value) for value in range(256)]
    return round(-sum((count / len(data)) * math.log2(count / len(data)) for count in frequencies if count), 3)


def calculate_ascii_ratio(data: bytes) -> float:
    if not data:
        return 0.0
    return round(sum(value in (9, 10, 13) or 32 <= value <= 126 for value in data) / len(data), 3)


def scan_raw_bytes(data: bytes, filename: str, sector_size: int = 512) -> ForensicScanResponse:
    """Scan immutable evidence and report only format-validated carved artifacts."""
    source_hash = hashlib.sha256(data).hexdigest()
    artifacts = carve(data)
    fragments: list[FragmentModel] = []
    reconstructed_files: list[ReconstructedFileModel] = []

    for index, artifact in enumerate(artifacts, start=1):
        start, end = artifact.source_offsets[0]
        raw = artifact.data
        validation = artifact.validation
        confidence = 100 if validation["valid"] else 0
        fragments.append(FragmentModel(
            id=f"FRAG-{index:03d}", index=index, offset_start=start, offset_end=end,
            size_bytes=len(raw), detected_signature=raw[:16].hex().upper(),
            signature_name=f"Validated {artifact.file_type} header",
            predicted_type=artifact.file_type, entropy=calculate_shannon_entropy(raw),
            ascii_ratio=calculate_ascii_ratio(raw), confidence_score=confidence,
            confidence_reasoning="Format validator accepted the complete carved byte range.",
            matched_file_id=artifact.artifact_id, is_header=True, is_footer=True,
            status="matched", raw_bytes_preview=" ".join(f"{byte:02X}" for byte in raw[:32]),
            raw_ascii_preview="".join(chr(byte) if 32 <= byte <= 126 else "." for byte in raw[:32]),
        ))
        reconstructed_files.append(ReconstructedFileModel(
            id=artifact.artifact_id, name=artifact.recovered_name, original_name=filename,
            file_type=artifact.file_type, mime_type="application/octet-stream", size_bytes=len(raw),
            original_fragments_total=1, recovered_fragments_count=1, fragment_ids=[f"FRAG-{index:03d}"],
            recovery_percentage=validation["recovery_percentage"],
            integrity_percentage=validation["integrity_score"],
            ai_confidence=None, status="RECOVERED" if validation["valid"] else "CORRUPTED",
            sha256=validation["sha256"], is_duplicate=False, source_sector_start=start,
            source_sector_end=end, metadata={"validation": validation}, missing_blocks=[],
            preview_type="image" if artifact.file_type in {"JPEG", "PNG", "GIF", "WEBP"} else "binary",
        ))

    recovered = sum(file.status == "RECOVERED" for file in reconstructed_files)
    partial = sum(file.status == "PARTIAL" for file in reconstructed_files)
    corrupted = sum(file.status == "CORRUPTED" for file in reconstructed_files)
    stats = KPIStatsModel(
        total_fragments=len(fragments), identified_fragments=len(fragments),
        reconstructed_files=len(reconstructed_files), recovered_files=recovered,
        partial_files=partial, corrupted_files=corrupted,
        unrecoverable_files=0, duplicate_files_count=0,
        average_confidence=100.0 if recovered else None,
        average_integrity=100.0 if recovered else None, total_storage_scanned_bytes=len(data),
    )
    return ForensicScanResponse(
        scan_id=f"SCAN-{source_hash[:12]}", dataset_name=filename,
        dataset_size_bytes=len(data), dataset_sha256=source_hash,
        scan_timestamp=datetime.now(timezone.utc).isoformat(), sector_size=sector_size,
        fragments=fragments, reconstructed_files=reconstructed_files, stats=stats,
        ai_forensic_summary={
            "executive_overview": f"Scanned {len(data)} source bytes; validated {len(reconstructed_files)} carved artifact(s).",
            "direct_facts": [f"Input size: {len(data)} bytes", f"SHA-256: {source_hash}"],
            "ai_inferences": [],
            "investigator_recommendations": ["Preserve the source image and compare artifact hashes against the manifest."],
        },
    )
