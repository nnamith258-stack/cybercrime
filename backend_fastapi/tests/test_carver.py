from backend_fastapi.recovery.carver import carve


def test_random_bytes_do_not_become_artifacts():
    assert carve(b"random storage bytes" * 100) == []


def test_embedded_valid_png_is_carved():
    import struct
    import zlib
    signature = b"\x89PNG\r\n\x1a\n"
    def chunk(name, body):
        return struct.pack(">I", len(body)) + name + body + struct.pack(">I", zlib.crc32(name + body) & 0xffffffff)
    data = signature + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(b"\x00\xff\x00\x00")) + chunk(b"IEND", b"")
    artifacts = carve(b"prefix" + data + b"suffix")
    assert len(artifacts) == 1
    assert artifacts[0].file_type == "PNG"
    assert artifacts[0].source_offsets == [(6, 6 + len(data))]
