from backend_fastapi.recovery.carver import carve


def test_truncated_png_is_not_recovered():
    assert carve(b"\x89PNG\r\n\x1a\n\x00\x00\x00\x00") == []
