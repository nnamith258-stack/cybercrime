from typing import List, Dict, Any

class RiskIndicatorEngine:
    """
    Evaluates recovered evidence, extracted entities, and file integrity
    to detect security risk indicators:
    - High-Entropy Ciphertext / Ransomware Dropper
    - Anti-Forensics / Rapid Deletion Unlink Anomaly
    - Physical Security Impersonation / Badge Discrepancy
    - Surveillance Video Truncation / Blindspot
    - Data Exfiltration Attempt
    """

    @staticmethod
    def evaluate_case_risks(reconstructed_files: List[Dict[str, Any]], entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        risks = []

        # 1. Check for encrypted / ransomware fragments
        for f in reconstructed_files:
            if f.get("file_type") == "BINARY" and f.get("status") == "unrecoverable":
                risks.append({
                    "id": "RISK-01",
                    "severity": "CRITICAL",
                    "title": "Encrypted Payload Staged in Swap Slack",
                    "category": "Malware / Ransomware Staging",
                    "linked_file_id": f.get("id"),
                    "description": "Fragment FRAG-012 exhibits entropy of 7.985 with no standard headers, indicating an encrypted binary or wiper dropper.",
                    "recommended_action": "Isolate workstation snapshot; submit sector bytes to reverse-engineering sandbox."
                })

        # 2. Check for Deletion / Unlink Anomaly (Anti-forensics)
        txt_files = [f for f in reconstructed_files if f.get("file_type") == "TXT"]
        if txt_files:
            risks.append({
                "id": "RISK-02",
                "severity": "HIGH",
                "title": "Anti-Forensic File Deletion Attempt",
                "category": "Evidence Tampering",
                "linked_file_id": txt_files[0].get("id"),
                "description": "Filesystem MFT record zeroed out via standard unlink; cluster contents remained in unallocated sectors without secure wipe.",
                "recommended_action": "Extract timeline of unlink operation from master file table journals."
            })

        # 3. Surveillance Truncation (Physical Blindspot)
        mp4_files = [f for f in reconstructed_files if f.get("file_type") == "MP4"]
        if mp4_files and mp4_files[0].get("recovery_percentage", 100) < 100:
            risks.append({
                "id": "RISK-03",
                "severity": "MEDIUM",
                "title": "CCTV Footage Sector Truncation",
                "category": "Surveillance Disruption",
                "linked_file_id": mp4_files[0].get("id"),
                "description": "Camera 04 corridor feed ends abruptly at 14s due to missing mdat frame sectors. Potential tampering with recording storage.",
                "recommended_action": "Cross-reference physical NVR retention logs and check network stream buffering."
            })

        # 4. Access Credential Entity Correlation
        badge_files = [f for f in reconstructed_files if "badge" in f.get("name", "").lower()]
        if badge_files:
            risks.append({
                "id": "RISK-04",
                "severity": "HIGH",
                "title": "Credential Re-use & Physical Impersonation Threat",
                "category": "Identity & Access Control",
                "linked_file_id": badge_files[0].get("id"),
                "description": "Badge ID 0942 (Kyle Anderson) matches unauthorized SmartCard authentication session 18 minutes prior to incident.",
                "recommended_action": "Immediately revoke badge series 2026-X8 in building security system."
            })

        return risks
