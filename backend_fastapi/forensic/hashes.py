import hashlib
from typing import Dict


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def md5_hex(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def hash_bundle(data: bytes) -> Dict[str, str]:
    return {
        "sha256": sha256_hex(data),
        "md5": md5_hex(data),
        "size": len(data),
    }


def magic_hex(data: bytes, n: int = 16) -> str:
    return " ".join(f"{b:02X}" for b in data[:n])
