from backend_fastapi.recovery.fragment_engine import rank_fragment_pair
from backend_fastapi.recovery.ml_fragment_ranker import FragmentRanker


def test_pair_ranking_is_a_signal_not_validation():
    result = rank_fragment_pair(b"abc" * 100, b"def" * 100, "JPEG")
    assert 0 <= result["score"] <= 1
    assert result["validation_status"] == "RANKING_ONLY"


def test_heuristic_ranker_is_deterministic_without_model():
    ranker = FragmentRanker()
    features = ranker.extract_fragment_features(b"abc", b"abd", "JPEG")
    assert ranker.predict_proba(features) == ranker.predict_proba(features)
