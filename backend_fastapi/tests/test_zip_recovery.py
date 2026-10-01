import io
import zipfile

from backend_fastapi.recovery.carver import carve
from backend_fastapi.recovery.hashing import sha256_bytes


def test_zip_carving_preserves_bytes_and_hash():
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("evidence.txt", "verified bytes")
    original = buffer.getvalue()
    artifacts = carve(b"\x00" * 17 + original)
    assert len(artifacts) == 1
    assert artifacts[0].file_type == "ZIP"
    assert sha256_bytes(artifacts[0].data) == sha256_bytes(original)
