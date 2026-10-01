from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class FragmentModel(BaseModel):
    id: str
    index: int
    offset_start: int
    offset_end: int
    size_bytes: int
    detected_signature: str
    signature_name: str
    predicted_type: str
    entropy: float
    ascii_ratio: float
    confidence_score: Optional[int] = None
    confidence_reasoning: str
    matched_file_id: Optional[str] = None
    is_header: bool = False
    is_footer: bool = False
    status: str = "matched"
    raw_bytes_preview: str
    raw_ascii_preview: str

class MissingBlockModel(BaseModel):
    offset_start: int
    offset_end: int
    size_bytes: int
    description: str

class ReconstructedFileModel(BaseModel):
    id: str
    name: str
    original_name: str
    file_type: str
    mime_type: str
    size_bytes: int
    original_fragments_total: int
    recovered_fragments_count: int
    fragment_ids: List[str]
    recovery_percentage: Optional[int] = None
    integrity_percentage: Optional[int] = None
    ai_confidence: Optional[int] = None
    status: str
    sha256: str
    is_duplicate: bool = False
    duplicate_of_id: Optional[str] = None
    source_sector_start: int
    source_sector_end: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    missing_blocks: List[MissingBlockModel] = Field(default_factory=list)
    preview_type: str = "text"
    preview_content: Optional[str] = None

class KPIStatsModel(BaseModel):
    total_fragments: int
    identified_fragments: int
    reconstructed_files: int
    recovered_files: int
    partial_files: int
    corrupted_files: int
    unrecoverable_files: int
    duplicate_files_count: int
    average_confidence: Optional[float] = None
    average_integrity: Optional[float] = None
    total_storage_scanned_bytes: int

class ForensicScanResponse(BaseModel):
    scan_id: str
    dataset_name: str
    dataset_size_bytes: int
    dataset_sha256: str
    scan_timestamp: str
    sector_size: int
    fragments: List[FragmentModel]
    reconstructed_files: List[ReconstructedFileModel]
    stats: KPIStatsModel
    ai_forensic_summary: Dict[str, Any]
    file_analysis: Optional[Dict[str, Any]] = None
    audit_log: Optional[List[Dict[str, Any]]] = None
