"""Deterministic forensic test fixtures. Corruption uses a fixed procedure (no unseeded randomness)."""

from __future__ import annotations

import io
from pathlib import Path

from PIL import Image, ImageDraw

SEED_NOTE = "deterministic-recoveai-fixtures-v1"


def _make_jpeg_bytes() -> bytes:
    img = Image.new("RGB", (320, 240), (20, 48, 80))
    draw = ImageDraw.Draw(img)
    draw.rectangle([20, 20, 300, 220], outline=(0, 200, 255), width=4)
    draw.text((40, 100), "ReCoveAI HEALTHY JPEG", fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()


def _make_png_bytes() -> bytes:
    img = Image.new("RGB", (256, 256), (16, 32, 48))
    draw = ImageDraw.Draw(img)
    draw.ellipse([40, 40, 216, 216], fill=(16, 185, 129))
    draw.text((60, 118), "HEALTHY PNG", fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _make_pdf_bytes() -> bytes:
    # Minimal but structurally valid PDF 1.4
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >>\nendobj\n"
        b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n"
        b"trailer\n<< /Root 1 0 R /Size 4 >>\n"
        b"startxref\n9\n"
        b"%%EOF\n"
    )


def write_test_data(output_dir: Path | None = None) -> Path:
    output_dir = output_dir or Path(__file__).resolve().parent / "test_fixtures"
    output_dir.mkdir(parents=True, exist_ok=True)

    jpeg = _make_jpeg_bytes()
    png = _make_png_bytes()
    pdf = _make_pdf_bytes()

    (output_dir / "healthy.jpg").write_bytes(jpeg)
    # Truncate last 25% including EOI — reproducible
    cut = int(len(jpeg) * 0.75)
    (output_dir / "corrupted.jpg").write_bytes(jpeg[:cut])

    (output_dir / "healthy.png").write_bytes(png)
    (output_dir / "corrupted.png").write_bytes(png[:-24])  # drop IEND + trailing

    (output_dir / "healthy.pdf").write_bytes(pdf)
    (output_dir / "corrupted.pdf").write_bytes(pdf.replace(b"%%EOF\n", b""))

    # Synthetic fragmented JPEG inside a disk image with padding
    f1, f2, f3 = jpeg[:80], jpeg[80:len(jpeg) // 2], jpeg[len(jpeg) // 2 :]
    padding = b"\x00" * 64
    disk = b"DISKHEAD" + f1 + padding + f2 + padding + f3 + b"TRAILER"
    (output_dir / "fragmented_jpeg.img").write_bytes(disk)

    (output_dir / "empty.bin").write_bytes(b"")
    (output_dir / "random.bin").write_bytes(bytes(range(256)) * 8)

    (output_dir / "README.txt").write_text(
        "Deterministic ReCoveAI fixtures. " + SEED_NOTE + "\n",
        encoding="utf-8",
    )
    return output_dir


if __name__ == "__main__":
    path = write_test_data()
    print(f"Wrote fixtures to {path}")
