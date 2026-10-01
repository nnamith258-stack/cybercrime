from ..validators import validate_artifact


def reconstruct(data: bytes):
    return validate_artifact(data, "ZIP")
