from __future__ import annotations

import hashlib
from pathlib import Path
from typing import BinaryIO


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(source: BinaryIO | Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    if isinstance(source, Path):
        with source.open("rb") as handle:
            return sha256_file(handle, chunk_size)
    while chunk := source.read(chunk_size):
        digest.update(chunk)
    return digest.hexdigest()
