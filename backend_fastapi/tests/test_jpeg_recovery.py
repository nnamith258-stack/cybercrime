import io

import pytest

from backend_fastapi.recovery.carver import carve
from backend_fastapi.recovery.hashing import sha256_bytes


def test_jpeg_round_trip_hash():
    image = pytest.importorskip("PIL.Image")
    source = io.BytesIO()
    image.new("RGB", (2, 2), (12, 34, 56)).save(source, format="JPEG")
    original = source.getvalue()
    artifacts = carve(b"header" + original + b"footer")
    assert len(artifacts) == 1
    assert artifacts[0].file_type == "JPEG"
    assert sha256_bytes(artifacts[0].data) == sha256_bytes(original)
