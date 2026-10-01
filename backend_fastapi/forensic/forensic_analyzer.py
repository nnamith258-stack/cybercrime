"""Deterministic file-type detection and corruption analysis. Never fabricates damage."""

from __future__ import annotations

import io
import struct
import zlib
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from .hashes import hash_bundle, magic_hex

JPEG_SOI = b"\xff\xd8"
JPEG_EOI = b"\xff\xd9"
PNG_SIG = b"\x89PNG\r\n\x1a\n"
PDF_SIG = b"%PDF"
PDF_EOF = b"%%EOF"
SQLITE_SIG = b"SQLite format 3\x00"
ZIP_SIG = b"PK\x03\x04"
DOCX_HINTS = (b"[Content_Types].xml", b"word/", b"xl/", b"ppt/")

DISK_IMAGE_EXTS = {".dd", ".img", ".bin", ".raw", ".e01"}


def _empty_result(filename: str, data: bytes) -> Dict[str, Any]:
    hashes = hash_bundle(data)
    return {
        "filename": filename,
        "file_type": "UNKNOWN",
        "mime_type": "application/octet-stream",
        "magic_bytes": magic_hex(data),
        "file_size": hashes["size"],
        "sha256": hashes["sha256"],
        "md5": hashes["md5"],
        "status": "UNKNOWN",
        "signature_valid": False,
        "parser_valid": "N/A",
        "decoder_valid": "N/A",
        "corruption_indicators": [],
        "recoverability": "UNKNOWN",
        "recovery_required": False,
        "dimensions": None,
        "notes": [],
    }


def analyze_file(file_path: Union[str, Path]) -> Dict[str, Any]:
    path = Path(file_path)
    data = path.read_bytes()
    return analyze_bytes(data, path.name)


def analyze_bytes(data: bytes, filename: str = "unknown") -> Dict[str, Any]:
    result = _empty_result(filename, data)
    ext = Path(filename).suffix.lower()

    if len(data) == 0:
        result["status"] = "UNKNOWN"
        result["file_type"] = "EMPTY"
        result["corruption_indicators"] = ["Empty file (0 bytes)"]
        result["recoverability"] = "UNRECOVERABLE"
        result["notes"] = ["No payload present to analyze."]
        return result

    detected = detect_type(data, filename)
    result["file_type"] = detected["file_type"]
    result["mime_type"] = detected["mime_type"]

    if detected["file_type"] == "JPEG":
        result.update(_analyze_jpeg(data))
    elif detected["file_type"] == "PNG":
        result.update(_analyze_png(data))
    elif detected["file_type"] == "PDF":
        result.update(_analyze_pdf(data))
    elif detected["file_type"] in ("DISK_IMAGE",) or (
        ext in DISK_IMAGE_EXTS and detected["file_type"] not in ("JPEG", "PNG", "PDF")
    ):
        result["file_type"] = "DISK_IMAGE"
        result["mime_type"] = "application/octet-stream"
        result["status"] = "UNKNOWN"
        result["signature_valid"] = "N/A"
        result["parser_valid"] = "N/A"
        result["decoder_valid"] = "N/A"
        result["recovery_required"] = True
        result["recoverability"] = "CARVE"
        result["notes"] = ["Container/disk image: signature carving required. No per-file health claim."]
    else:
        result["file_type"] = detected["file_type"]
        result["status"] = "UNSUPPORTED_FORMAT"
        result["signature_valid"] = detected.get("signature_valid", False)
        result["parser_valid"] = "N/A"
        result["decoder_valid"] = "N/A"
        result["recovery_required"] = False
        result["recoverability"] = "NOT_APPLICABLE"
        result["notes"] = ["Format is outside the JPEG/PNG/PDF analysis set. No fabricated corruption."]

    result["filename"] = filename
    result["file_size"] = len(data)
    hashes = hash_bundle(data)
    result["sha256"] = hashes["sha256"]
    result["md5"] = hashes["md5"]
    result["magic_bytes"] = magic_hex(data)
    return result


def detect_type(data: bytes, filename: str = "") -> Dict[str, Any]:
    ext = Path(filename).suffix.lower()
    if data.startswith(JPEG_SOI):
        return {"file_type": "JPEG", "mime_type": "image/jpeg", "signature_valid": True}
    if data.startswith(PNG_SIG):
        return {"file_type": "PNG", "mime_type": "image/png", "signature_valid": True}
    if data.startswith(PDF_SIG) or data.lstrip().startswith(PDF_SIG):
        return {"file_type": "PDF", "mime_type": "application/pdf", "signature_valid": True}
    if data.startswith(SQLITE_SIG):
        return {"file_type": "SQLITE", "mime_type": "application/vnd.sqlite3", "signature_valid": True}
    if data.startswith(ZIP_SIG):
        kind = "DOCX" if any(h in data[:8192] for h in DOCX_HINTS) else "ZIP"
        mime = (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            if kind == "DOCX"
            else "application/zip"
        )
        return {"file_type": kind, "mime_type": mime, "signature_valid": True}
    if ext in DISK_IMAGE_EXTS:
        return {"file_type": "DISK_IMAGE", "mime_type": "application/octet-stream", "signature_valid": "N/A"}
    return {"file_type": "UNKNOWN", "mime_type": "application/octet-stream", "signature_valid": False}


def _analyze_jpeg(data: bytes) -> Dict[str, Any]:
    indicators: List[str] = []
    notes: List[str] = []
    has_soi = data[:2] == JPEG_SOI
    eoi_pos = data.rfind(JPEG_EOI)
    has_eoi = eoi_pos != -1

    if not has_soi:
        indicators.append("Missing JPEG SOI (FF D8)")
    if not has_eoi:
        indicators.append("Missing JPEG EOI (FF D9)")

    decoder_valid = False
    dimensions = None
    decoder_error: Optional[str] = None
    try:
        from PIL import Image, ImageFile

        ImageFile.LOAD_TRUNCATED_IMAGES = False
        img = Image.open(io.BytesIO(data))
        img.load()
        dimensions = {"width": img.size[0], "height": img.size[1]}
        decoder_valid = True
        notes.append("Pillow decoded and fully loaded the JPEG raster.")
    except Exception as exc:
        decoder_error = str(exc)
        indicators.append(f"JPEG decoding failed: {decoder_error}")

    signature_valid = has_soi
    parser_valid = has_soi and has_eoi

    if decoder_valid and has_soi and has_eoi:
        status = "HEALTHY"
        recovery_required = False
        recoverability = "NOT_REQUIRED"
    elif decoder_valid and has_soi:
        status = "CORRUPTED"
        recovery_required = True
        recoverability = "PARTIAL"
        notes.append("Decoder loaded pixels but structural markers are incomplete.")
    else:
        status = "CORRUPTED"
        recovery_required = True
        recoverability = "ATTEMPT"

    return {
        "file_type": "JPEG",
        "mime_type": "image/jpeg",
        "status": status,
        "signature_valid": signature_valid,
        "parser_valid": parser_valid,
        "decoder_valid": decoder_valid,
        "corruption_indicators": indicators,
        "recoverability": recoverability,
        "recovery_required": recovery_required,
        "dimensions": dimensions,
        "notes": notes,
        "eoi_offset": eoi_pos if has_eoi else None,
    }


def _analyze_png(data: bytes) -> Dict[str, Any]:
    indicators: List[str] = []
    notes: List[str] = []
    signature_valid = data.startswith(PNG_SIG)
    if not signature_valid:
        indicators.append("Missing PNG signature (89 50 4E 47 0D 0A 1A 0A)")

    chunk_ok, has_iend, chunk_errors, ihdr = _validate_png_chunks(data)
    indicators.extend(chunk_errors)
    parser_valid = signature_valid and chunk_ok and has_iend

    decoder_valid = False
    dimensions = ihdr
    try:
        from PIL import Image, ImageFile

        ImageFile.LOAD_TRUNCATED_IMAGES = False
        img = Image.open(io.BytesIO(data))
        img.load()
        dimensions = {"width": img.size[0], "height": img.size[1]}
        decoder_valid = True
        notes.append("Pillow decoded and fully loaded the PNG raster.")
    except Exception as exc:
        indicators.append(f"PNG decoding failed: {exc}")

    if decoder_valid and parser_valid:
        status = "HEALTHY"
        recovery_required = False
        recoverability = "NOT_REQUIRED"
    else:
        status = "CORRUPTED"
        recovery_required = True
        recoverability = "ATTEMPT" if signature_valid else "LOW"

    return {
        "file_type": "PNG",
        "mime_type": "image/png",
        "status": status,
        "signature_valid": signature_valid,
        "parser_valid": parser_valid,
        "decoder_valid": decoder_valid,
        "corruption_indicators": indicators,
        "recoverability": recoverability,
        "recovery_required": recovery_required,
        "dimensions": dimensions,
        "notes": notes,
        "has_iend": has_iend,
    }


def _validate_png_chunks(data: bytes) -> tuple:
    errors: List[str] = []
    if len(data) < 8 or not data.startswith(PNG_SIG):
        return False, False, ["PNG too short to contain chunks"], None
    pos = 8
    has_iend = False
    ihdr = None
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        ctype = data[pos + 4 : pos + 8]
        start = pos + 8
        end = start + length
        if end + 4 > len(data):
            errors.append(f"Truncated PNG chunk {ctype!r} at offset {pos}")
            return False, has_iend, errors, ihdr
        chunk_data = data[start:end]
        crc_stored = struct.unpack(">I", data[end : end + 4])[0]
        crc_calc = zlib.crc32(ctype + chunk_data) & 0xFFFFFFFF
        if crc_stored != crc_calc:
            errors.append(f"CRC mismatch in PNG chunk {ctype.decode('latin1', 'replace')} at offset {pos}")
        if ctype == b"IHDR" and length >= 8:
            w, h = struct.unpack(">II", chunk_data[:8])
            ihdr = {"width": w, "height": h}
        if ctype == b"IEND":
            has_iend = True
            break
        pos = end + 4
    if not has_iend:
        errors.append("Missing PNG IEND chunk")
    return (len(errors) == 0, has_iend, errors, ihdr)


def _analyze_pdf(data: bytes) -> Dict[str, Any]:
    indicators: List[str] = []
    notes: List[str] = []
    head = data.lstrip()
    signature_valid = head.startswith(PDF_SIG) or data.startswith(PDF_SIG)
    if not signature_valid:
        indicators.append("Missing PDF signature (%PDF)")

    has_eof = PDF_EOF in data
    if not has_eof:
        indicators.append("Missing PDF EOF marker (%%EOF)")

    has_obj = b" obj" in data or b"\nobj" in data or data.find(b"obj") != -1
    has_endobj = b"endobj" in data
    has_xref = b"xref" in data
    has_trailer = b"trailer" in data or b"/Root" in data

    if not has_obj:
        indicators.append("No PDF objects (obj) found")

    # Optional xref/trailer absence is a structural issue but not "missing metadata"
    parser_valid = signature_valid and has_eof and has_obj
    if signature_valid and has_eof and has_obj and not has_xref and not has_trailer:
        notes.append("xref/trailer optional structures missing; file still treated as structurally usable if objects and %%EOF exist.")

    decoder_valid = parser_valid
    if parser_valid:
        notes.append("PDF header, at least one object, and %%EOF are present.")

    if signature_valid and has_eof and has_obj:
        status = "HEALTHY"
        recovery_required = False
        recoverability = "NOT_REQUIRED"
    else:
        status = "CORRUPTED"
        recovery_required = True
        recoverability = "ATTEMPT" if signature_valid else "LOW"

    return {
        "file_type": "PDF",
        "mime_type": "application/pdf",
        "status": status,
        "signature_valid": signature_valid,
        "parser_valid": parser_valid,
        "decoder_valid": decoder_valid,
        "corruption_indicators": indicators,
        "recoverability": recoverability,
        "recovery_required": recovery_required,
        "dimensions": None,
        "notes": notes,
        "has_eof": has_eof,
        "has_xref": has_xref,
        "has_endobj": has_endobj,
    }
