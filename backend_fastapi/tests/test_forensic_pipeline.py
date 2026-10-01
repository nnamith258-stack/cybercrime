import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PARENT = ROOT.parent
if str(PARENT) not in sys.path:
    sys.path.insert(0, str(PARENT))

from backend_fastapi.create_test_data import write_test_data
from backend_fastapi.forensic.file_carver import carve_container
from backend_fastapi.forensic.forensic_analyzer import analyze_file
from backend_fastapi.forensic.forensic_validator import validate_bytes
from backend_fastapi.forensic.fragment_classifier import classify_fragment
from backend_fastapi.forensic.fragment_reassembler import reassemble_fragments
from backend_fastapi.forensic.hashes import sha256_hex
from backend_fastapi.forensic.pipeline import process_evidence


class ForensicPipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fixtures = write_test_data(Path(tempfile.mkdtemp(prefix="recoveai_fx_")))

    def test_healthy_jpeg(self):
        path = self.fixtures / "healthy.jpg"
        data = path.read_bytes()
        original = sha256_hex(data)
        result = process_evidence(data, "healthy.jpg", evidence_root=Path(tempfile.mkdtemp()))
        fa = result["file_analysis"]
        self.assertEqual(fa["status"], "HEALTHY")
        self.assertFalse(fa["recoveryRequired"])
        self.assertEqual(fa["originalSha256"], fa["outputSha256"])
        self.assertEqual(original, fa["outputSha256"])
        self.assertFalse(fa["restorationCalled"])
        self.assertFalse(result["restoration_called"])
        stored = Path(result["evidence_store"]) / "original_evidence" / "healthy.jpg"
        self.assertEqual(sha256_hex(stored.read_bytes()), original)

    def test_corrupted_jpeg(self):
        data = (self.fixtures / "corrupted.jpg").read_bytes()
        result = process_evidence(data, "corrupted.jpg")
        fa = result["file_analysis"]
        self.assertEqual(fa["status"], "CORRUPTED")
        self.assertTrue(fa["recoveryRequired"])
        self.assertEqual(fa["recoveryStatus"], "ATTEMPTED")
        self.assertIn(fa["validation"], ("VALID", "PARTIALLY_VALID", "INVALID"))

    def test_healthy_png(self):
        data = (self.fixtures / "healthy.png").read_bytes()
        result = process_evidence(data, "healthy.png")
        self.assertEqual(result["file_analysis"]["status"], "HEALTHY")
        self.assertFalse(result["file_analysis"]["recoveryRequired"])
        self.assertEqual(result["original_sha256"], result["output_sha256"])

    def test_corrupted_png(self):
        data = (self.fixtures / "corrupted.png").read_bytes()
        result = process_evidence(data, "corrupted.png")
        self.assertEqual(result["file_analysis"]["status"], "CORRUPTED")
        self.assertTrue(result["file_analysis"]["recoveryRequired"])

    def test_healthy_pdf(self):
        data = (self.fixtures / "healthy.pdf").read_bytes()
        result = process_evidence(data, "healthy.pdf")
        self.assertEqual(result["file_analysis"]["status"], "HEALTHY")
        self.assertFalse(result["restoration_called"])

    def test_corrupted_pdf(self):
        data = (self.fixtures / "corrupted.pdf").read_bytes()
        result = process_evidence(data, "corrupted.pdf")
        self.assertEqual(result["file_analysis"]["status"], "CORRUPTED")
        self.assertTrue(result["file_analysis"]["recoveryRequired"])

    def test_empty_file(self):
        analysis = analyze_file(self.fixtures / "empty.bin")
        self.assertEqual(analysis["file_type"], "EMPTY")
        result = process_evidence(b"", "empty.bin")
        self.assertIn(result["file_analysis"]["status"], ("UNKNOWN", "UNSUPPORTED_FORMAT"))
        self.assertFalse(result["restoration_called"])

    def test_invalid_file(self):
        data = (self.fixtures / "random.bin").read_bytes()
        result = process_evidence(data, "random.bin")
        self.assertEqual(result["file_analysis"]["status"], "UNSUPPORTED_FORMAT")
        self.assertFalse(result["file_analysis"]["recoveryRequired"])
        self.assertEqual(result["file_analysis"]["reassemblyConfidence"], "N/A")

    def test_carving(self):
        data = (self.fixtures / "fragmented_jpeg.img").read_bytes()
        frags = carve_container(data, "fragmented_jpeg.img")
        self.assertGreaterEqual(len(frags), 1)
        self.assertTrue(any(f["file_type"] == "JPEG" for f in frags))
        for f in frags:
            self.assertEqual(f["role"], "CARVED_FRAGMENT")

    def test_fragment_classification(self):
        jpeg = (self.fixtures / "healthy.jpg").read_bytes()
        classified = classify_fragment(jpeg)
        self.assertEqual(classified["predicted_type"], "JPEG")
        self.assertEqual(classified["confidence"], "N/A")
        unknown = classify_fragment(b"\x00\x01\x02\x03" * 20)
        self.assertEqual(unknown["predicted_type"], "UNKNOWN")
        self.assertEqual(unknown["confidence"], "N/A")

    def test_reassembly(self):
        data = (self.fixtures / "fragmented_jpeg.img").read_bytes()
        frags = carve_container(data, "fragmented_jpeg.img")
        assemblies = reassemble_fragments(frags)
        self.assertTrue(assemblies)
        self.assertIn("ordering_method", assemblies[0])
        self.assertIn("ordering_confidence", assemblies[0])
        self.assertIn("fragment_ids", assemblies[0])

    def test_validation(self):
        healthy = validate_bytes((self.fixtures / "healthy.jpg").read_bytes(), "JPEG")
        self.assertEqual(healthy["result"], "VALID")
        self.assertEqual(healthy["signature"], "PASS")
        self.assertEqual(healthy["decoder"], "PASS")
        corrupted = validate_bytes((self.fixtures / "corrupted.jpg").read_bytes(), "JPEG")
        self.assertIn(corrupted["result"], ("PARTIALLY_VALID", "INVALID"))


if __name__ == "__main__":
    unittest.main()
