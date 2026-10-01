from __future__ import annotations

import io
import struct
import zipfile
import zlib
from typing import Any

from .hashing import sha256_bytes


def _png(data: bytes) -> tuple[bool, list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not data.startswith(b"\x89PNG\r\n\x1a\n"):
        return False, ["invalid PNG signature"], warnings
    position = 8
    saw_iend = False
    while position + 12 <= len(data):
        length = struct.unpack(">I", data[position:position + 4])[0]
        end = position + 12 + length
        if end > len(data):
            errors.append("truncated PNG chunk")
            break
        chunk_type = data[position + 4:position + 8]
        chunk = data[position + 8:position + 8 + length]
        expected_crc = struct.unpack(">I", data[position + 8 + length:end])[0]
        if zlib.crc32(chunk_type + chunk) & 0xffffffff != expected_crc:
            errors.append(f"invalid CRC for {chunk_type.decode('latin1', 'replace')}")
        if not all(32 <= value <= 126 for value in chunk_type):
            errors.append("invalid PNG chunk type")
        position = end
        if chunk_type == b"IEND":
            saw_iend = True
            break
    if not saw_iend:
        errors.append("missing PNG IEND")
    if position < len(data) and saw_iend:
        warnings.append("trailing bytes after PNG IEND")
    return not errors, errors, warnings


def _zip(data: bytes) -> tuple[bool, list[str], list[str], str]:
    errors: list[str] = []
    warnings: list[str] = []
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            bad = archive.testzip()
            if bad:
                errors.append(f"CRC failure in ZIP member {bad}")
            names = archive.namelist()
            if not names:
                errors.append("ZIP has no members")
            if "[Content_Types].xml" in names:
                if "word/document.xml" in names:
                    file_type = "DOCX"
                elif "xl/workbook.xml" in names:
                    file_type = "XLSX"
                elif "ppt/presentation.xml" in names:
                    file_type = "PPTX"
                else:
                    file_type = "ZIP"
            else:
                file_type = "ZIP"
    except (zipfile.BadZipFile, OSError) as exc:
        errors.append(str(exc))
        file_type = "ZIP"
    return not errors, errors, warnings, file_type


def validate_artifact(data: bytes, file_type: str, expected_size: int | None = None) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    actual_type = file_type
    if file_type == "JPEG":
        if not data.startswith(b"\xff\xd8\xff") or data.rfind(b"\xff\xd9") != len(data) - 2:
            errors.append("JPEG SOI/EOI boundary is invalid")
        else:
            try:
                from PIL import Image
                with Image.open(io.BytesIO(data)) as image:
                    image.verify()
            except Exception as exc:
                errors.append(f"JPEG decoder rejected bytes: {exc}")
    elif file_type == "PNG":
        valid, png_errors, png_warnings = _png(data)
        errors.extend(png_errors)
        warnings.extend(png_warnings)
        if valid:
            try:
                from PIL import Image
                with Image.open(io.BytesIO(data)) as image:
                    image.verify()
            except Exception as exc:
                errors.append(f"PNG decoder rejected bytes: {exc}")
    elif file_type in {"ZIP", "DOCX", "XLSX", "PPTX"}:
        valid, zip_errors, zip_warnings, actual_type = _zip(data)
        errors.extend(zip_errors)
        warnings.extend(zip_warnings)
    elif file_type == "PDF":
        if not data.startswith(b"%PDF-"):
            errors.append("missing PDF header")
        if b"%%EOF" not in data:
            errors.append("missing PDF EOF marker")
    elif file_type == "GIF":
        if not data.startswith((b"GIF87a", b"GIF89a")) or not data.rstrip().endswith(b";"):
            errors.append("invalid GIF header or trailer")
    elif file_type == "WEBP":
        if not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
            errors.append("invalid WEBP RIFF header")
    elif file_type == "MP4":
        if b"ftyp" not in data[:32]:
            errors.append("missing MP4 ftyp box")
    elif file_type == "MP3":
        if not data.startswith(b"ID3") and not (len(data) >= 2 and data[0] == 0xff and data[1] & 0xe0 == 0xe0):
            errors.append("missing MP3 frame or ID3 header")
    elif file_type == "SQLite" and not data.startswith(b"SQLite format 3\x00"):
        errors.append("invalid SQLite header")
    else:
        errors.append("unsupported or unvalidated file type")
    valid = not errors
    recovery_percentage = None if expected_size in (None, 0) else round(min(100.0, len(data) / expected_size * 100), 2)
    integrity_score = 100.0 if valid and recovery_percentage in (None, 100.0) else (round(recovery_percentage, 2) if valid and recovery_percentage is not None else 0.0)
    return {
        "valid": valid,
        "format": actual_type,
        "size_bytes": len(data),
        "sha256": sha256_bytes(data),
        "integrity_score": integrity_score,
        "recovery_percentage": recovery_percentage,
        "errors": errors,
        "warnings": warnings,
    }
