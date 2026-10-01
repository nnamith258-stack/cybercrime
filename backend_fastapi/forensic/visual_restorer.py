"""Visual restoration only. Never presented as forensic byte recovery. No ByteGPT. No LaMa training."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional, Union

RESTORATION_METHOD_LAMA = "LaMa"
RESTORATION_METHOD_OPENCV = "OpenCV fallback"
DISCLAIMER = "AI-estimated pixels are not original evidence."


def restore_image(image_path: Union[str, Path], mask_path: Union[str, Path]) -> Dict[str, Any]:
    image_path = Path(image_path)
    mask_path = Path(mask_path)
    if not image_path.exists() or not mask_path.exists():
        return {
            "performed": False,
            "method": None,
            "reason": "Image or mask path missing.",
            "disclaimer": DISCLAIMER,
        }
    return restore_arrays(image_path.read_bytes(), mask_path.read_bytes())


def restore_arrays(image_bytes: bytes, mask_bytes: bytes) -> Dict[str, Any]:
    """
    LaMa is not bundled (heavy deps / no local weights). OpenCV inpaint is the supported fallback.
    """
    try:
        import cv2
        import numpy as np
    except Exception:
        return {
            "performed": False,
            "method": None,
            "reason": "OpenCV is unavailable and LaMa is not installed.",
            "disclaimer": DISCLAIMER,
        }

    img_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_arr, cv2.IMREAD_COLOR)
    mask_arr = np.frombuffer(mask_bytes, np.uint8)
    mask = cv2.imdecode(mask_arr, cv2.IMREAD_GRAYSCALE)
    if img is None or mask is None:
        return {
            "performed": False,
            "method": None,
            "reason": "Could not decode image or mask for visual restoration.",
            "disclaimer": DISCLAIMER,
        }

    if int(mask.max()) == 0:
        return {
            "performed": False,
            "method": None,
            "reason": "Mask is empty; no visual restoration required.",
            "disclaimer": DISCLAIMER,
        }

    _, binary = cv2.threshold(mask, 120, 255, cv2.THRESH_BINARY)
    restored = cv2.inpaint(img, binary, 3, cv2.INPAINT_TELEA)
    ok, encoded = cv2.imencode(".png", restored)
    return {
        "performed": bool(ok),
        "method": RESTORATION_METHOD_OPENCV,
        "disclaimer": DISCLAIMER,
        "output_png": encoded.tobytes() if ok else None,
        "note": "OpenCV Telea inpainting is classical PDE interpolation, not an AI model and not original evidence.",
    }
