from __future__ import annotations

from pathlib import Path


def recover_filesystem(image_path: Path, output_dir: Path, filesystem: str | None = None) -> list[dict]:
    """Use pytsk3 when installed; absence is a normal fallback condition."""
    try:
        import pytsk3
    except ImportError:
        return []
    del filesystem
    output_dir.mkdir(parents=True, exist_ok=True)
    image = pytsk3.Img_Info(str(image_path))
    fs = pytsk3.FS_Info(image)
    recovered: list[dict] = []
    root = fs.open_dir(path="/")
    for entry in root:
        name = entry.info.name.name.decode("utf-8", "replace") if entry.info.name.name else ""
        if not name or name in {".", ".."}:
            continue
        if entry.info.meta and entry.info.meta.type == pytsk3.TSK_FS_META_TYPE_REG:
            recovered.append({"name": name, "size": entry.info.meta.size, "metadata_only": True})
    return recovered
