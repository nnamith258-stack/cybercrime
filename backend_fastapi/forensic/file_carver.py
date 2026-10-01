"""Signature-based carving from disk images (.dd / .img / .bin)."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from .forensic_analyzer import JPEG_EOI, JPEG_SOI, PDF_EOF, PDF_SIG, PNG_SIG, _validate_png_chunks
from .hashes import sha256_hex

JPEG_SOI_SCAN = b"\xff\xd8\xff"


def carve_container(data: bytes, source_name: str = "evidence.img") -> List[Dict[str, Any]]:
    fragments: List[Dict[str, Any]] = []
    fragments.extend(_carve_jpeg(data, source_name, len(fragments)))
    fragments.extend(_carve_png(data, source_name, len(fragments)))
    fragments.extend(_carve_pdf(data, source_name, len(fragments)))
    return fragments


def _frag(
    idx: int,
    file_type: str,
    start: int,
    end: int,
    raw: bytes,
    source_name: str,
    role: str = "CARVED_FRAGMENT",
) -> Dict[str, Any]:
    return {
        "id": f"FRAG-{idx + 1:03d}",
        "file_type": file_type,
        "start_offset": start,
        "end_offset": end,
        "size": end - start,
        "raw_bytes": raw,
        "source_image": source_name,
        "role": role,
        "sha256": sha256_hex(raw),
    }


def _carve_jpeg(data: bytes, source: str, start_idx: int) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    pos = 0
    while True:
        soi = data.find(JPEG_SOI, pos)
        if soi == -1:
            break
        eoi = data.find(JPEG_EOI, soi + 2)
        if eoi == -1:
            raw = data[soi:]
            end = len(data)
            out.append(_frag(start_idx + len(out), "JPEG", soi, end, raw, source))
            break
        end = eoi + 2
        out.append(_frag(start_idx + len(out), "JPEG", soi, end, data[soi:end], source))
        pos = end
    return out


def _carve_png(data: bytes, source: str, start_idx: int) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    pos = 0
    while True:
        sig = data.find(PNG_SIG, pos)
        if sig == -1:
            break
        iend = data.find(b"IEND", sig + 8)
        if iend == -1:
            raw = data[sig:]
            out.append(_frag(start_idx + len(out), "PNG", sig, len(data), raw, source))
            break
        end = min(len(data), iend + 8)  # IEND + CRC
        raw = data[sig:end]
        out.append(_frag(start_idx + len(out), "PNG", sig, end, raw, source))
        pos = end
    return out


def _carve_pdf(data: bytes, source: str, start_idx: int) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    pos = 0
    while True:
        start = data.find(PDF_SIG, pos)
        if start == -1:
            break
        eof = data.find(PDF_EOF, start + 4)
        if eof == -1:
            raw = data[start:]
            out.append(_frag(start_idx + len(out), "PDF", start, len(data), raw, source))
            break
        end = eof + len(PDF_EOF)
        # include optional trailing CR/LF
        while end < len(data) and data[end] in (10, 13, 32):
            end += 1
            if end - eof > 8:
                break
        out.append(_frag(start_idx + len(out), "PDF", start, end, data[start:end], source))
        pos = end
    return out
