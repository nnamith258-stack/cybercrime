from typing import List, Dict, Any

try:
    from ..recovery.fragment_engine import rank_fragment_pair
except ImportError:
    from recovery.fragment_engine import rank_fragment_pair

class FragmentMatchingEngine:
    """
    Advanced fragment-matching algorithm for truly fragmented, non-contiguous files.
    
    Uses:
    1. Byte continuity & Markov bigram transition probability between sector boundary tail and head
    2. Format-specific structural grammar (JPEG markers, PDF object xrefs, ZIP central directory)
    3. Spatial sector offset distance penalty
    4. Shannon entropy delta smoothing (Delta H)
    """

    @staticmethod
    def calculate_boundary_compatibility(tail_bytes: bytes, head_bytes: bytes, file_type: str = "GENERIC") -> float:
        result = rank_fragment_pair(tail_bytes, head_bytes, file_type)
        return result["score"]

    @staticmethod
    def match_fragments_into_chains(fragments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Builds directed reconstruction chains connecting fragmented sectors.
        Returns ordered chains with confidence metrics.
        """
        chains: list[dict[str, Any]] = []
        for header in (fragment for fragment in fragments if fragment.get("is_header")):
            candidates = []
            for candidate in fragments:
                if candidate is header or candidate.get("predicted_type") != header.get("predicted_type"):
                    continue
                if candidate.get("offset_start", 0) < header.get("offset_end", 0):
                    continue
                score = rank_fragment_pair(
                    bytes.fromhex(candidate.get("raw_bytes_preview", "").replace(" ", "")) if candidate.get("raw_bytes_preview") else b"",
                    bytes.fromhex(header.get("raw_bytes_preview", "").replace(" ", "")) if header.get("raw_bytes_preview") else b"",
                    header.get("predicted_type", "UNKNOWN"),
                    offset_a=header.get("offset_start", 0), offset_b=candidate.get("offset_start", 0),
                )
                candidates.append((score["score"], candidate, score["reasons"]))
            candidates.sort(key=lambda item: item[0], reverse=True)
            best = candidates[0] if candidates else None
            sequence = [header["id"]] + ([best[1]["id"]] if best else [])
            chains.append({
                "chain_id": f"CHAIN-{len(chains) + 1:02d}",
                "predicted_type": header.get("predicted_type", "UNKNOWN"),
                "fragment_sequence": sequence,
                "fragment_count": len(sequence),
                "is_complete": False,
                "confidence_score": best[0] if best else 0.0,
                "reasons": best[2] if best else ["no compatible candidate"],
                "validation_status": "RANKING_ONLY",
            })
        return chains

        return chains
