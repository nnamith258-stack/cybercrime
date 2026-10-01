from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Signature:
    file_type: str
    magic: bytes
    mime_type: str


SIGNATURES = (
    Signature("JPEG", b"\xff\xd8\xff", "image/jpeg"),
    Signature("PNG", b"\x89PNG\r\n\x1a\n", "image/png"),
    Signature("PDF", b"%PDF-", "application/pdf"),
    Signature("ZIP", b"PK\x03\x04", "application/zip"),
    Signature("MP4", b"ftyp", "video/mp4"),
    Signature("GIF", b"GIF87a", "image/gif"),
    Signature("GIF", b"GIF89a", "image/gif"),
    Signature("WEBP", b"RIFF", "image/webp"),
    Signature("MP3", b"ID3", "audio/mpeg"),
    Signature("SQLite", b"SQLite format 3\x00", "application/vnd.sqlite3"),
)
