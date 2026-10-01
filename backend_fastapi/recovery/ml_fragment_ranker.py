from __future__ import annotations

from pathlib import Path
from typing import Iterable

import numpy as np


class FragmentRanker:
    """Small optional RandomForest ranker; heuristic scoring remains authoritative."""

    def __init__(self, model_path: Path | None = None):
        self.model_path = model_path
        self.model = None
        if model_path and model_path.exists():
            try:
                import joblib
                self.model = joblib.load(model_path)
            except Exception:
                self.model = None

    def extract_fragment_features(self, fragment_a: bytes, fragment_b: bytes, file_type: str, offset_distance: int = 0) -> list[float]:
        from .fragment_engine import entropy
        return [
            float(sum(a != b for a, b in zip(fragment_a[-64:], fragment_b[:64])) / max(1, min(64, len(fragment_a), len(fragment_b)))),
            abs(entropy(fragment_a) - entropy(fragment_b)),
            float(bool(fragment_a and fragment_b)),
            len(fragment_a) / max(1, len(fragment_b)),
            float(offset_distance % 512 == 0),
            float(file_type == "JPEG" and fragment_a[-1:] == b"\xff" and fragment_b[:1] == b"\xd9"),
            float(file_type == "PNG" and b"IEND" in fragment_a[-16:]),
            float(file_type in {"ZIP", "DOCX", "XLSX", "PPTX"} and b"PK" in fragment_a[-8:]),
            float(offset_distance),
            abs(sum(32 <= value < 127 for value in fragment_a) / max(1, len(fragment_a)) - sum(32 <= value < 127 for value in fragment_b) / max(1, len(fragment_b))),
        ]

    def predict_proba(self, features: Iterable[float]) -> float:
        vector = np.asarray(list(features), dtype=float).reshape(1, -1)
        if self.model is not None:
            return float(self.model.predict_proba(vector)[0][1])
        return float(max(0.0, min(1.0, 1.0 - vector[0][0] * 0.5 + vector[0][2] * 0.2)))

    def train(self, features: Iterable[Iterable[float]], labels: Iterable[int]) -> None:
        from sklearn.ensemble import RandomForestClassifier
        import joblib
        self.model = RandomForestClassifier(n_estimators=32, random_state=42).fit(np.asarray(list(features)), list(labels))
        if self.model_path:
            self.model_path.parent.mkdir(parents=True, exist_ok=True)
            joblib.dump(self.model, self.model_path)
