import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
from .tool_detector import check_binary

class ForemostCarver:
    """
    Integrates Foremost or Scalpel for mature signature-based carving.
    """

    def __init__(self):
        self.foremost_available = check_binary("foremost")
        self.scalpel_available = check_binary("scalpel")

    def carve(self, image_path: str, output_dir: str, file_types: str = "all") -> Dict[str, Any]:
        """
        Executes foremost carving:
        `foremost -t <types> -i <image> -o <output_dir>`
        """
        binary = "foremost" if self.foremost_available else ("scalpel" if self.scalpel_available else None)

        if not binary:
            return {
                "engine": "Foremost/Scalpel",
                "status": "unavailable",
                "message": "Foremost and Scalpel binaries not detected on host system.",
                "recovered_files": [],
            }

        try:
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            cmd = [binary, "-t", file_types, "-i", image_path, "-o", output_dir]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            files = [
                {"path": str(path), "size": path.stat().st_size, "offset": None}
                for path in Path(output_dir).rglob("*") if path.is_file()
            ]
            return {
                "engine": binary,
                "status": "executed",
                "exit_code": res.returncode,
                "stdout": res.stdout,
                "stderr": res.stderr,
                "recovered_files": files,
            }
        except Exception as e:
            return {
                "engine": binary or "Foremost",
                "status": "error",
                "error": str(e)
            }
