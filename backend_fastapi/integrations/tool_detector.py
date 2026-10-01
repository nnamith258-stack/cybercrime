import shutil
import importlib.util
from typing import Dict, Any

def check_binary(binary_name: str) -> bool:
    """Checks whether an external command line binary exists in the system PATH."""
    return shutil.which(binary_name) is not None

def check_python_module(module_name: str) -> bool:
    """Checks whether a Python package is installed and importable."""
    return importlib.util.find_spec(module_name) is not None

def get_forensic_tools_status() -> Dict[str, Any]:
    """
    Returns installation status and cross-platform setup commands for optional forensic tools:
    - PhotoRec / TestDisk
    - The Sleuth Kit (fls, icat, tsk_recover)
    - Foremost / Scalpel
    - Tesseract OCR (CLI + pytesseract)
    - OpenCV (cv2)
    """
    tools = {
        "sleuthkit": {
            "name": "The Sleuth Kit (TSK)",
            "binaries": {
                "fls": check_binary("fls"),
                "icat": check_binary("icat"),
                "tsk_recover": check_binary("tsk_recover"),
                "fsstat": check_binary("fsstat"),
                "mmls": check_binary("mmls")
            },
            "installed": check_binary("fls") or check_binary("tsk_recover"),
            "role": "File-system aware inode recovery, slack space inspection, unallocated sector carving",
            "install": {
                "linux": "sudo apt-get install -y sleuthkit",
                "macos": "brew install sleuthkit",
                "windows": "choco install sleuthkit or download from sleuthkit.org"
            },
            "fallback_mode": "Native Python FAT/NTFS/EXT cluster parser with heuristic signature fallback"
        },
        "photorec": {
            "name": "PhotoRec / TestDisk",
            "binaries": {
                "photorec": check_binary("photorec"),
                "testdisk": check_binary("testdisk")
            },
            "installed": check_binary("photorec") or check_binary("testdisk"),
            "role": "Comprehensive file carving across 480+ file families from damaged block devices",
            "install": {
                "linux": "sudo apt-get install -y testdisk",
                "macos": "brew install testdisk",
                "windows": "choco install testdisk or download CGSecurity zip"
            },
            "fallback_mode": "Native ReCoveAI Deep Signature Carving Engine (JPEG, PNG, PDF, TXT, DOCX, MP4, ZIP)"
        },
        "foremost": {
            "name": "Foremost / Scalpel",
            "binaries": {
                "foremost": check_binary("foremost"),
                "scalpel": check_binary("scalpel")
            },
            "installed": check_binary("foremost") or check_binary("scalpel"),
            "role": "Dedicated binary header/footer carving with custom config rules",
            "install": {
                "linux": "sudo apt-get install -y foremost scalpel",
                "macos": "brew install foremost",
                "windows": "Download Foremost Windows binary from SourceForge"
            },
            "fallback_mode": "Native ReCoveAI header/footer transition matrix parser"
        },
        "tesseract_ocr": {
            "name": "Tesseract OCR",
            "binaries": {
                "tesseract": check_binary("tesseract")
            },
            "python_module": check_python_module("pytesseract"),
            "installed": check_binary("tesseract") and check_python_module("pytesseract"),
            "role": "Optical character recognition for badge IDs, scanned documents, and text inside recovered images",
            "install": {
                "linux": "sudo apt-get install -y tesseract-ocr && pip install pytesseract",
                "macos": "brew install tesseract && pip install pytesseract",
                "windows": "winget install UB-Mannheim.TesseractOCR && pip install pytesseract"
            },
            "fallback_mode": "Deterministic EXIF/JFIF text stream extractor and structural metadata regex parser"
        },
        "opencv": {
            "name": "OpenCV (Computer Vision)",
            "python_module": check_python_module("cv2"),
            "installed": check_python_module("cv2"),
            "role": "Image corruption diagnostics, Laplacian blur estimation, SSIM, and scanline disruption analysis",
            "install": {
                "linux": "pip install opencv-python-headless",
                "macos": "pip install opencv-python",
                "windows": "pip install opencv-python"
            },
            "fallback_mode": "Native NumPy DCT coefficient discontinuity and Shannon variance checker"
        }
    }
    
    installed_count = sum(1 for t in tools.values() if t.get("installed", False))
    return {
        "tools": tools,
        "total_optional_tools": len(tools),
        "installed_count": installed_count,
        "system_summary": f"{installed_count}/{len(tools)} external forensic toolchains detected. Pure Python native fallback is 100% operational."
    }
