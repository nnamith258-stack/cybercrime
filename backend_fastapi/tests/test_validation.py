import hashlib

from backend_fastapi.recovery.validators import validate_artifact


def test_invalid_jpeg_is_not_valid():
    result = validate_artifact(b"\xff\xd8\xffbroken\xff\xd9", "JPEG")
    assert result["valid"] is False
    assert result["sha256"] == hashlib.sha256(b"\xff\xd8\xffbroken\xff\xd9").hexdigest()


def test_unknown_expected_size_is_explicit():
    result = validate_artifact(b"%PDF-1.7\n%%EOF", "PDF")
    assert result["valid"] is True
    assert result["recovery_percentage"] is None
