"""Train the small fragment ranker on explicitly synthetic adjacency examples."""

from pathlib import Path

from recovery.ml_fragment_ranker import FragmentRanker


def main() -> None:
    # These labels are synthetic demonstrations, not forensic evidence.
    features = []
    labels = []
    for left, right, label in [(b"AAAA", b"BBBB", 1), (b"AAAA", b"\x00\xff\x10\x80", 0), (b"PK\x03\x04", b"PK\x01\x02", 1), (b"PNG", b"random", 0)]:
        ranker = FragmentRanker()
        features.append(ranker.extract_fragment_features(left, right, "ZIP"))
        labels.append(label)
    ranker = FragmentRanker(Path(__file__).parent / "models" / "fragment_ranker.joblib")
    ranker.train(features, labels)
    print("Trained on synthetic examples only.")


if __name__ == "__main__":
    main()
