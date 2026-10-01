from datetime import datetime, timezone
import json
import tempfile
from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
if __package__:
    from .create_test_data import write_test_data
    from .forensic.pipeline import process_evidence
    from .models import ForensicScanResponse
    from .scanner import scan_raw_bytes
    from .recovery.carver import carve
    from .recovery.hashing import sha256_bytes
else:
    from create_test_data import write_test_data
    from forensic.pipeline import process_evidence
    from models import ForensicScanResponse
    from scanner import scan_raw_bytes
    from recovery.carver import carve
    from recovery.hashing import sha256_bytes
if __package__:
    from .integrations.tool_detector import get_forensic_tools_status
    from .integrations.sleuthkit import SleuthKitAnalyzer
    from .integrations.photorec_carver import PhotoRecCarver
    from .integrations.foremost_carver import ForemostCarver
    from .integrations.ocr_engine import OcrEngine
    from .integrations.cv_analyzer import CvAnalyzer
    from .integrations.fragment_matcher import FragmentMatchingEngine
    from .integrations.risk_engine import RiskIndicatorEngine
else:
    from integrations.tool_detector import get_forensic_tools_status
    from integrations.sleuthkit import SleuthKitAnalyzer
    from integrations.photorec_carver import PhotoRecCarver
    from integrations.foremost_carver import ForemostCarver
    from integrations.ocr_engine import OcrEngine
    from integrations.cv_analyzer import CvAnalyzer
    from integrations.fragment_matcher import FragmentMatchingEngine
    from integrations.risk_engine import RiskIndicatorEngine

app = FastAPI(
    title="ReCoveAI Forensic Engine API",
    description="AI-Assisted Intelligent Data Recovery and Digital Evidence Reconstruction with SleuthKit, PhotoRec, Foremost, Tesseract & OpenCV extensions",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RECOVERED_DIR = Path(__file__).parent / "recovered"
RECOVERED_DIR.mkdir(exist_ok=True)
ARTIFACT_INDEX: dict[str, Path] = {}

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "engine": "ReCoveAI-Forensic-v1.2",
        "mode": "read_only",
        "non_destructive": True
    }

@app.get("/api/tools/status")
def get_tools_status():
    """
    Checks availability of external forensic toolchains:
    - PhotoRec / TestDisk
    - The Sleuth Kit (fls, icat, tsk_recover)
    - Foremost / Scalpel
    - Tesseract OCR
    - OpenCV (cv2)
    Provides cross-platform installation instructions for Windows, Linux, and macOS.
    """
    return get_forensic_tools_status()

@app.get("/api/demo")
def get_demo_dataset():
    """Returns metadata for the deterministic corrupted-JPEG demo fixture."""
    return {
        "dataset_name": "recoveryai_corrupted_sample.jpg",
        "description": "A deterministic JPEG sample truncated before its EOI marker.",
        "sector_size": 512,
        "status": "ready"
    }


@app.get("/api/forensic/demo")
def run_forensic_demo():
    """Run the deterministic truncated-JPEG fixture through the forensic pipeline."""
    with tempfile.TemporaryDirectory(prefix="recoveryai-demo-") as temp_dir:
        fixtures = write_test_data(Path(temp_dir) / "fixtures")
        source_path = fixtures / "corrupted.jpg"
        source = source_path.read_bytes()

    case_id = f"CASE-{uuid4().hex[:12]}"
    result = process_evidence(source, source_path.name, case_id=case_id)
    analysis = result["file_analysis"]
    output = result["output_bytes"]
    artifact_id = f"{case_id}-ART-{uuid4().hex[:12]}"
    artifact_path = RECOVERED_DIR / f"{uuid4().hex}_recovered.jpg"
    artifact_path.write_bytes(output)
    ARTIFACT_INDEX[artifact_id] = artifact_path

    validation_result = analysis.get("validation", "INVALID")
    status = "RECOVERED" if validation_result == "VALID" else (
        "PARTIAL" if validation_result == "PARTIALLY_VALID" else "CORRUPTED"
    )
    fragments = result["fragments"]
    source_offsets = [
        [fragment.get("start_offset", 0), fragment.get("end_offset", 0)]
        for fragment in fragments
    ] or [[0, len(source)]]
    validation = analysis.get("scores", {}).get("integrity_score", 0)
    case_payload = {
        "case_id": case_id,
        "source_name": "ReCoveryAI deterministic corrupted JPEG sample",
        "source_sha256": result["original_sha256"],
        "source_size": len(source),
        "scan_timestamp": result["scan_timestamp"],
        "sector_size": 512,
        "tools_used": ["signature_analysis", "structural_recovery", "format_validation", "sha256"],
        "fragments": fragments,
        "artifacts": [{
            "id": artifact_id,
            "original_name": source_path.name,
            "recovered_name": "recovered_corrupted.jpg",
            "file_type": analysis.get("fileType", "JPEG"),
            "source_offsets": source_offsets,
            "expected_size": None,
            "recovered_size": len(output),
            "recovery_percentage": None,
            "status": status,
            "sha256": result["output_sha256"],
            "validation": {
                "valid": validation_result == "VALID",
                "integrity_score": validation if isinstance(validation, (int, float)) else 0,
                "errors": analysis.get("corruptionIndicators", []),
                "warnings": analysis.get("notes", []),
            },
            "fragment_count": analysis.get("fragmentCount", len(fragments)),
            "ml_confidence": None,
            "forensic_confidence": (
                analysis.get("scores", {}).get("overall_score", 0) / 100
                if isinstance(analysis.get("scores", {}).get("overall_score"), (int, float)) else 0
            ),
            "download_url": f"/api/recovery/download/{artifact_id}",
        }],
        "forensic_summary": {
            "executive_overview": (
                f"The deterministic sample was truncated before the JPEG EOI marker. "
                f"The pipeline preserved {analysis.get('bytesPreserved', 0)} source bytes, "
                f"appended {analysis.get('bytesReconstructed', 0)} validated repair byte(s), "
                f"and produced a {validation_result} output."
            ),
            "direct_facts": [
                f"Source SHA-256: {result['original_sha256']}",
                f"Recovered output SHA-256: {result['output_sha256']}",
                f"Format validation: {validation_result}",
            ],
            "heuristic_findings": analysis.get("notes", []),
            "investigator_recommendations": ["Retain the original sample and compare both SHA-256 hashes."],
        },
        "file_analysis": analysis,
    }
    (RECOVERED_DIR / f"{case_id}_case_manifest.json").write_text(
        json.dumps(case_payload, indent=2), encoding="utf-8"
    )
    return case_payload

@app.post("/api/scan", response_model=ForensicScanResponse)
async def scan_disk_image(
    file: UploadFile = File(...),
    sector_size: int = Form(512)
):
    """
    Ingests user-provided sample disk image or file.
    Executes signature scanning, fragment carving, entropy analysis, and file reconstruction.
    """
    contents = await file.read()
    result = scan_raw_bytes(contents, file.filename or "unknown_evidence.dd", sector_size)
    return result


@app.post("/api/recovery/scan")
async def recover_disk_image(
    file: UploadFile = File(...),
    sector_size: int = Form(512),
    filesystem: Optional[str] = Form(None),
    file_types: Optional[str] = Form(None),
):
    """Perform read-only carving and persist only validated reconstructed bytes."""
    del filesystem
    source = await file.read()
    source_name = file.filename or "evidence.bin"
    requested_types = {value.strip().upper() for value in file_types.split(",")} if file_types else None
    tools_used = []
    with tempfile.TemporaryDirectory(prefix="recoveai-evidence-") as work_dir:
        image_path = Path(work_dir) / "source.evidence"
        image_path.write_bytes(source)
        external_output = Path(work_dir) / "external"
        photorec = PhotoRecCarver()
        foremost = ForemostCarver()
        if photorec.is_available:
            result = photorec.carve(str(image_path), str(external_output / "photorec"))
            if result.get("status") == "executed":
                tools_used.append("photorec")
        if not photorec.is_available or not tools_used:
            foremost_result = foremost.carve(str(image_path), str(external_output / "foremost"))
            if foremost_result.get("status") == "executed":
                tools_used.append(foremost_result["engine"])
    artifacts = carve(source, expected_types=requested_types)
    case_id = f"CASE-{uuid4().hex[:12]}"
    artifact_payloads = []
    tools_used.append("internal_signature_carver")
    for artifact in artifacts:
        artifact_id = f"{case_id}-{artifact.artifact_id}"
        output_name = f"{uuid4().hex}.{artifact.file_type.lower()}"
        output_path = RECOVERED_DIR / output_name
        output_path.write_bytes(artifact.data)
        ARTIFACT_INDEX[artifact_id] = output_path
        artifact_payloads.append({
            "id": artifact_id,
            "original_name": artifact.original_name,
            "recovered_name": artifact.recovered_name,
            "file_type": artifact.file_type,
            "source_offsets": artifact.source_offsets,
            "expected_size": artifact.expected_size,
            "recovered_size": len(artifact.data),
            "recovery_percentage": artifact.recovery_percentage,
            "status": artifact.status.value,
            "sha256": sha256_bytes(artifact.data),
            "validation": artifact.validation,
            "fragment_count": artifact.fragment_count,
            "ml_confidence": artifact.ml_confidence,
            "forensic_confidence": artifact.forensic_confidence,
            "download_url": f"/api/recovery/download/{artifact_id}",
        })
    source_hash = sha256_bytes(source)
    manifest = {
        "case_id": case_id,
        "source_sha256": source_hash,
        "source_size": len(source),
        "scan_timestamp": datetime.now(timezone.utc).isoformat(),
        "tools_used": tools_used,
        "artifacts": artifact_payloads,
    }
    (RECOVERED_DIR / f"{case_id}_case_manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return {
        "case_id": case_id,
        "source_sha256": source_hash,
        "source_size": len(source),
        "tools_used": tools_used,
        "files_found": len(artifact_payloads),
        "files_recovered": sum(item["status"] == "RECOVERED" for item in artifact_payloads),
        "files_partial": sum(item["status"] == "PARTIAL" for item in artifact_payloads),
        "files_corrupted": sum(item["status"] == "CORRUPTED" for item in artifact_payloads),
        "files_unrecoverable": sum(item["status"] == "UNRECOVERABLE" for item in artifact_payloads),
        "artifacts": artifact_payloads,
        "sector_size": sector_size,
    }


@app.get("/api/recovery/download/{artifact_id}")
def download_recovered_artifact(artifact_id: str):
    from fastapi.responses import FileResponse
    path = ARTIFACT_INDEX.get(artifact_id)
    if path is None or not path.is_file():
        raise HTTPException(status_code=404, detail="Recovered artifact is not available")
    return FileResponse(path, filename=path.name, media_type="application/octet-stream")

@app.post("/api/analyze/ocr")
async def analyze_ocr(
    file: Optional[UploadFile] = File(None),
    artifact_name: str = Form("IMG_0942_Badge_ID.jpg")
):
    """
    Runs Tesseract OCR (or built-in fallback) to extract names, badge IDs, and text
    from recovered images.
    """
    engine = OcrEngine()
    bytes_data = await file.read() if file else b""
    return engine.extract_text_from_image(bytes_data, artifact_name)

@app.post("/api/analyze/cv-quality")
async def analyze_cv_quality(
    file: Optional[UploadFile] = File(None),
    artifact_name: str = Form("IMG_0942_Badge_ID.jpg")
):
    """
    Runs OpenCV (or built-in fallback) to assess image quality, Laplacian blur,
    compression artifacts, and scanline corruption.
    """
    analyzer = CvAnalyzer()
    bytes_data = await file.read() if file else b""
    return analyzer.analyze_image_corruption(bytes_data, artifact_name)

@app.get("/api/graph/extended")
def get_extended_topology():
    """
    Returns 4-tier graph topology:
    Fragments ──► Reconstructed Files ──► Extracted Entities ──► Risk Indicators
    """
    return {
        "tiers": ["fragments", "reconstructed_files", "extracted_entities", "risk_indicators"],
        "summary": "4-tier evidentiary correlation pipeline"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_fastapi.main:app", host="0.0.0.0", port=8000, reload=True)
