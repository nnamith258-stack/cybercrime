"""Analyze-first forensic pipeline. Healthy files are never fragmented or inpainted."""

from __future__ import annotations

import io
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4

from .audit_log import append_audit_entry, build_entry
from .evidence_scorer import score_evidence
from .file_carver import carve_container
from .forensic_analyzer import DISK_IMAGE_EXTS, analyze_bytes, detect_type
from .forensic_validator import validate_bytes
from .fragment_classifier import classify_fragment
from .fragment_reassembler import reassemble_fragments
from .hashes import hash_bundle, sha256_hex
from .visual_restorer import restore_arrays

PIPELINE_VERSION = "1.0.0"


def process_evidence(
    data: bytes,
    filename: str,
    *,
    case_id: Optional[str] = None,
    evidence_root: Optional[Path] = None,
    mask_bytes: Optional[bytes] = None,
) -> Dict[str, Any]:
    case_id = case_id or f"CASE-{uuid4().hex[:12]}"
    original_hashes = hash_bundle(data)
    original_sha = original_hashes["sha256"]

    store = None
    if evidence_root is not None:
        store = _prepare_store(evidence_root, case_id, filename, data)

    analysis = analyze_bytes(data, filename)
    looks_like_disk = _should_carve(data, filename, analysis)

    restoration_called = False
    restoration_method = None
    fragments: List[Dict[str, Any]] = []
    assemblies: List[Dict[str, Any]] = []
    output_bytes = data
    evidence_state = analysis["status"]
    recovery_status = "NOT_REQUIRED"
    recovery_method = "none"
    validation = validate_bytes(data, analysis["file_type"] if analysis["file_type"] in ("JPEG", "PNG", "PDF") else None)
    notes = list(analysis.get("notes") or [])
    damage_description = "; ".join(analysis.get("corruption_indicators") or []) or "NOT DETECTED"

    if analysis["status"] == "HEALTHY":
        evidence_state = "HEALTHY"
        recovery_status = "NOT_REQUIRED"
        recovery_method = "none"
        notes.append("Original preserved byte-for-byte. Restoration skipped.")
        if store:
            (store / "recovered_output" / filename).write_bytes(data)
        output_sha = original_sha
        bytes_preserved = len(data)
        bytes_reconstructed = 0
        ai_estimated = "N/A"
    elif looks_like_disk:
        carved = carve_container(data, filename)
        for frag in carved:
            classification = classify_fragment(frag["raw_bytes"], frag.get("file_type"))
            frag["classification"] = classification
            frag["predicted_type"] = classification["predicted_type"]
            # Do not send raw bytes through JSON later; keep for reassembly only
        fragments = carved
        assemblies = reassemble_fragments(carved)
        recovery_method = "signature_carving"
        recovery_status = "ATTEMPTED"
        if assemblies:
            best = max(assemblies, key=lambda a: a["ordering_confidence"])
            output_bytes = best["payload"]
            validation = best["validation"]
            recovery_method = f"signature_carving+{best['ordering_method']}"
            if best["output_role"] == "VALIDATED_FILE":
                evidence_state = "PARTIAL"
                if validation["result"] == "VALID":
                    evidence_state = "PARTIAL"
            elif best["output_role"] == "RECOVERED_FILE":
                evidence_state = "PARTIAL"
            else:
                evidence_state = "UNRECOVERABLE" if not carved else "CORRUPTED"
        else:
            evidence_state = "UNKNOWN"
            notes.append("No JPEG/PNG/PDF signatures carved from container.")
            output_bytes = data
        output_sha = sha256_hex(output_bytes)
        bytes_preserved = min(len(data), sum(f["size"] for f in fragments))
        bytes_reconstructed = 0
        ai_estimated = "N/A"
        damage_description = f"Disk/container carving: {len(fragments)} carved fragment(s)."
        if store:
            out_name = f"carved_{filename}"
            (store / "recovered_output" / out_name).write_bytes(output_bytes)
    elif analysis["status"] in ("UNSUPPORTED_FORMAT", "UNKNOWN") and analysis["file_type"] != "EMPTY":
        analysis["status"] = "UNSUPPORTED_FORMAT"
        analysis["recovery_required"] = False
        evidence_state = "UNSUPPORTED_FORMAT"
        recovery_status = "NOT_REQUIRED"
        recovery_method = "none"
        notes.append("Unsupported format. No recovery confidence generated.")
        output_sha = original_sha
        bytes_preserved = len(data)
        bytes_reconstructed = 0
        ai_estimated = "N/A"
        validation = {
            "result": "INVALID",
            "signature": "FAIL" if analysis.get("signature_valid") is False else "N/A",
            "decoder": "N/A",
            "parser": "N/A",
            "file_type": analysis["file_type"],
            "corruption_indicators": [],
            "sha256": original_sha,
            "file_size": len(data),
        }
    else:
        # CORRUPTED JPEG/PNG/PDF
        recovered, rec_notes, rec_method = _attempt_structural_recovery(data, analysis)
        notes.extend(rec_notes)
        recovery_method = rec_method
        recovery_status = "ATTEMPTED"
        output_bytes = recovered
        validation = validate_bytes(recovered, analysis["file_type"])
        output_sha = sha256_hex(output_bytes)

        if validation["result"] == "VALID" and output_sha == original_sha:
            evidence_state = "HEALTHY"
            recovery_status = "NOT_REQUIRED"
        elif validation["result"] == "VALID":
            evidence_state = "PARTIAL"
        elif validation["result"] == "PARTIALLY_VALID":
            evidence_state = "PARTIAL"
        else:
            evidence_state = "UNRECOVERABLE"

        bytes_preserved = _overlapping_prefix(data, output_bytes)
        bytes_reconstructed = max(0, len(output_bytes) - bytes_preserved)

        visual = None
        if mask_bytes:
            restoration_called = True
            visual = restore_arrays(output_bytes, mask_bytes)
            restoration_method = visual.get("method")
            if visual.get("performed"):
                evidence_state = "AI_VISUAL_ESTIMATE"
                notes.append(visual.get("disclaimer"))
        else:
            notes.append("Damage location could not be determined precisely.")
            notes.append("Visual restoration skipped (no evidence-derived mask).")

        ai_estimated = "N/A"
        if store:
            (store / "recovered_output" / f"recovered_{filename}").write_bytes(output_bytes)

    restored_sha = output_sha
    scores = score_evidence(
        analysis,
        original_size=len(data),
        recovered_size=len(output_bytes),
        bytes_preserved=bytes_preserved if analysis["status"] != "HEALTHY" else len(data),
        validation_result=validation.get("result", "N/A"),
        ordering_confidence=assemblies[0]["ordering_confidence"] if assemblies else "N/A",
        visual_restoration=restoration_called and restoration_method is not None,
    )

    if analysis["status"] == "HEALTHY":
        # Integrity of an untouched original is fully explained by validation, not "recovery"
        pass

    file_analysis = {
        "fileType": analysis["file_type"],
        "mimeType": analysis["mime_type"],
        "magicBytes": analysis["magic_bytes"],
        "fileSize": len(data),
        "sha256": original_sha,
        "md5": original_hashes["md5"],
        "status": analysis["status"] if analysis["status"] != "UNKNOWN" or looks_like_disk else analysis["status"],
        "evidenceState": evidence_state,
        "damageDetected": analysis["status"] == "CORRUPTED" or (looks_like_disk and bool(fragments)),
        "damageDescription": damage_description if analysis["status"] != "HEALTHY" else "NOT DETECTED",
        "recoveryRequired": bool(analysis.get("recovery_required")) and analysis["status"] != "HEALTHY",
        "recoveryStatus": recovery_status,
        "recoveryMethod": recovery_method,
        "originalPreserved": True,
        "originalSha256": original_sha,
        "outputSha256": restored_sha,
        "originalUnchanged": original_sha == restored_sha,
        "signatureValid": analysis.get("signature_valid"),
        "decoderValid": analysis.get("decoder_valid"),
        "parserValid": analysis.get("parser_valid"),
        "validation": validation.get("result", "N/A"),
        "validationDetail": {
            "signature": validation.get("signature", "N/A"),
            "decoder": validation.get("decoder", "N/A"),
            "parser": validation.get("parser", "N/A"),
            "output": validation.get("result", "N/A"),
        },
        "restorationPerformed": bool(restoration_called and restoration_method),
        "restorationMethod": restoration_method,
        "restorationCalled": restoration_called,
        "fragmentCount": len(fragments),
        "reassemblyMethod": assemblies[0]["ordering_method"] if assemblies else None,
        "reassemblyConfidence": assemblies[0]["ordering_confidence"] if assemblies else "N/A",
        "fragmentIds": assemblies[0]["fragment_ids"] if assemblies else [],
        "bytesPreserved": len(data) if analysis["status"] == "HEALTHY" else bytes_preserved,
        "bytesReconstructed": 0 if analysis["status"] == "HEALTHY" else bytes_reconstructed,
        "aiEstimatedBytes": ai_estimated,
        "scores": scores,
        "damageLocationPrecise": False,
        "notes": notes,
        "corruptionIndicators": analysis.get("corruption_indicators") or [],
        "pipelineVersion": PIPELINE_VERSION,
        "caseId": case_id,
    }

    # Healthy override: never report recovery metrics as if work was done
    if analysis["status"] == "HEALTHY":
        file_analysis.update(
            {
                "damageDetected": False,
                "damageDescription": "NOT DETECTED",
                "recoveryRequired": False,
                "recoveryStatus": "NOT_REQUIRED",
                "recoveryMethod": "none",
                "restorationPerformed": False,
                "restorationCalled": False,
                "fragmentCount": 0,
                "reassemblyMethod": None,
                "reassemblyConfidence": "N/A",
                "bytesReconstructed": 0,
                "aiEstimatedBytes": "N/A",
                "originalUnchanged": True,
                "outputSha256": original_sha,
            }
        )
        fragments = []
        assemblies = []
        restoration_called = False

    audit_entry = build_entry(
        case_id=case_id,
        original_filename=filename,
        original_sha256=original_sha,
        file_type=analysis["file_type"],
        file_size=len(data),
        damage_status=file_analysis["status"],
        damage_description=file_analysis["damageDescription"],
        fragment_count=file_analysis["fragmentCount"],
        reassembly_method=file_analysis["reassemblyMethod"],
        restoration_method=restoration_method,
        recovered_sha256=file_analysis["outputSha256"],
        validation_status=str(file_analysis["validation"]),
        recovery_status=file_analysis["recoveryStatus"],
    )
    if store:
        append_audit_entry(store / "audit.jsonl", audit_entry)
        # Verify original was not mutated
        stored_original = (store / "original_evidence" / filename).read_bytes()
        if sha256_hex(stored_original) != original_sha:
            raise RuntimeError("Original evidence hash changed — pipeline abort")

    return {
        "case_id": case_id,
        "filename": filename,
        "analysis": analysis,
        "file_analysis": file_analysis,
        "fragments": [_public_fragment(f) for f in fragments],
        "assemblies": [
            {k: v for k, v in a.items() if k != "payload"} | {"payload_size": len(a.get("payload", b""))}
            for a in assemblies
        ],
        "output_bytes": output_bytes,
        "audit_entry": audit_entry,
        "original_sha256": original_sha,
        "output_sha256": file_analysis["outputSha256"],
        "restoration_called": file_analysis["restorationCalled"],
        "evidence_store": str(store) if store else None,
        "scan_timestamp": datetime.now(timezone.utc).isoformat(),
    }


def _should_carve(data: bytes, filename: str, analysis: Dict[str, Any]) -> bool:
    if len(data) == 0:
        return False
    if analysis.get("file_type") in ("JPEG", "PNG", "PDF", "EMPTY"):
        return False
    ext = Path(filename).suffix.lower()
    if ext in {".dd", ".img", ".raw", ".e01"}:
        return True
    if ext == ".bin" or analysis.get("recoverability") == "CARVE":
        from .file_carver import carve_container as _carve

        return len(_carve(data, filename)) > 0
    return False


def _prepare_store(root: Path, case_id: str, filename: str, data: bytes) -> Path:
    base = root / case_id
    for name in ("original_evidence", "working_copy", "recovered_output"):
        (base / name).mkdir(parents=True, exist_ok=True)
    (base / "original_evidence" / filename).write_bytes(data)
    (base / "working_copy" / filename).write_bytes(data)
    return base


def _public_fragment(frag: Dict[str, Any]) -> Dict[str, Any]:
    raw = frag.get("raw_bytes", b"")
    return {
        "id": frag["id"],
        "file_type": frag.get("file_type"),
        "predicted_type": frag.get("predicted_type"),
        "start_offset": frag.get("start_offset"),
        "end_offset": frag.get("end_offset"),
        "size": frag.get("size"),
        "source_image": frag.get("source_image"),
        "role": frag.get("role", "CARVED_FRAGMENT"),
        "sha256": frag.get("sha256"),
        "classification": frag.get("classification"),
        "raw_preview_hex": " ".join(f"{b:02X}" for b in raw[:24]),
    }


def _overlapping_prefix(original: bytes, output: bytes) -> int:
    n = min(len(original), len(output))
    i = 0
    while i < n and original[i] == output[i]:
        i += 1
    return i


def _attempt_structural_recovery(data: bytes, analysis: Dict[str, Any]) -> tuple:
    ftype = analysis["file_type"]
    notes: List[str] = []
    if ftype == "JPEG":
        payload = data
        soi = payload.find(b"\xff\xd8")
        if soi > 0:
            payload = payload[soi:]
            notes.append(f"Discarded {soi} leading bytes before JPEG SOI.")
        if b"\xff\xd9" not in payload:
            candidate = payload + b"\xff\xd9"
            if _jpeg_loads(candidate):
                notes.append("Appended missing EOI (FF D9) after surviving scan data.")
                return candidate, notes, "jpeg_eoi_repair"
            notes.append("EOI repair did not produce a decodable JPEG.")
            return payload, notes, "jpeg_surviving_bytes"
        return payload, notes, "jpeg_surviving_bytes"
    if ftype == "PNG":
        notes.append("Retained surviving PNG bytes; incomplete chunks were not invented.")
        return data, notes, "png_surviving_bytes"
    if ftype == "PDF":
        payload = data
        if b"%%EOF" not in payload:
            candidate = payload.rstrip() + b"\n%%EOF\n"
            notes.append("Appended missing %%EOF marker to surviving PDF bytes.")
            return candidate, notes, "pdf_eof_repair"
        return payload, notes, "pdf_surviving_bytes"
    return data, notes, "surviving_bytes"


def _jpeg_loads(data: bytes) -> bool:
    try:
        from PIL import Image, ImageFile

        ImageFile.LOAD_TRUNCATED_IMAGES = False
        img = Image.open(io.BytesIO(data))
        img.load()
        return True
    except Exception:
        return False
