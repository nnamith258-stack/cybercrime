import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional
from .tool_detector import check_binary

class PhotoRecCarver:
    """
    Integrates PhotoRec / TestDisk for broader deleted-file recovery across 480+ file extensions.
    """

    def __init__(self):
        self.is_available = check_binary("photorec")

    def carve(self, image_path: str, output_dir: str) -> Dict[str, Any]:
        """
        Executes PhotoRec in non-interactive batch mode:
        `photorec /cmd <image> search`
        """
        if not self.is_available:
            return {
                "engine": "PhotoRec",
                "status": "unavailable",
                "message": "PhotoRec CLI binary not detected on host system.",
                "recovered_files": [],
            }

        try:
            Path(output_dir).mkdir(parents=True, exist_ok=True)
            cmd = ["photorec", "/log", "/cmd", image_path, "partition", "search"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            files = [
                {"path": str(path), "size": path.stat().st_size, "offset": None}
                for path in Path(output_dir).rglob("*") if path.is_file()
            ]
            return {
                "engine": "PhotoRec",
                "status": "executed",
                "exit_code": res.returncode,
                "stdout": res.stdout,
                "stderr": res.stderr,
                "recovered_files": files,
            }
        except Exception as e:
            return {
                "engine": "PhotoRec",
                "status": "error",
                "error": str(e)
            }
