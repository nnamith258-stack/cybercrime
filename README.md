# ReCoveryAI – AI-Assisted Intelligent Data Recovery & Digital Evidence Reconstruction

**ReCoveryAI** is a safe, controlled digital forensics and intelligent data recovery workbench built for a 24-hour cybersecurity and AI hackathon.

The system analyzes sample disk images and file dumps containing intentionally deleted, fragmented, or corrupted files. It carves recoverable file fragments, classifies them using byte signatures, Shannon entropy, and heuristic modeling, matches fragment chains for truly fragmented files, reconstructs files with rigorous integrity scoring, isolates duplicate artifacts via SHA-256 cryptographic hashing, and presents actionable intelligence in an investigator dashboard and an interactive **4-tier causality graph**:
$$\text{Fragments} \longrightarrow \text{Reconstructed Files} \longrightarrow \text{Extracted Entities} \longrightarrow \text{Risk Indicators}$$

---

## Non-Destructive Forensic Guarantee & Safety Ethics

- **Read-Only Operation**: Analysis is conducted exclusively on an in-memory bitstream copy. The original target file or physical storage medium is never modified or written to.
- **Zero-Hallucination / Non-Fabrication Policy**: Missing bytes and unallocated sectors are explicitly demarcated as gaps (`[MISSING SECTOR: 0x... - 0x...]`). The system never fabricates content or falsely certifies corrupted files as intact.
- **Admissibility Delineation**: Directly observed deterministic physical evidence (magic headers, byte addresses, hash collisions) is strictly segregated from AI/heuristic inferences (cluster continuity hypotheses and semantic entity correlation).
- **Safety Boundary**: This tool does not deploy exploits, bypass authentication, extract credentials, deploy ransomware, or perform destructive operations.

---

## 4-Tier Evidentiary Causality Architecture

```
[1. Logical Fragments] ──► [2. Reconstructed Files] ──► [3. Extracted Entities] ──► [4. Risk Indicators]
   · FRAG-001 (SOI)            · Badge ID (JPEG)           · Person: Kyle Anderson     · RISK-04: Credential Abuse
   · FRAG-002 (SOS Scan)       · Incident Brief (PDF)      · Badge ID: 0942            · RISK-02: Deletion Anomaly
   · FRAG-003 (EOI)            · Access Log (TXT)          · Host: 192.168.10.45       · RISK-03: Video Truncation
   · FRAG-004 (PDF Obj)        · CCTV Footage (MP4)        · Workstation 12-West       · RISK-01: Encrypted Dropper
   · FRAG-012 (Cipher)         · Encrypted Blob (BIN)      · Timestamp: 14:22:01 UTC
```

---

## Modular External Forensic Toolchains (Optional Host Integrations)

The architecture intentionally keeps external forensic tools optional because installation packages differ between Linux, macOS, and Windows. ReCoveryAI automatically uses its **pure-memory native Python and TypeScript engine** when host binaries are absent, while providing seamless subprocess/ctypes bridge support when they are installed:

| Toolchain | Role in Recovery Pipeline | Native Fallback | Linux (Ubuntu/Debian) | macOS (Homebrew) | Windows |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **The Sleuth Kit (TSK)** | File-system-aware inode recovery (`fls`, `icat`, `tsk_recover`, `fsstat`) | Native MFT/FAT directory cluster parser | `sudo apt-get install -y sleuthkit` | `brew install sleuthkit` | `choco install sleuthkit` |
| **PhotoRec / TestDisk** | Broader carving across 480+ file families and damaged partition reconstruction | ReCoveryAI signature carver | `sudo apt-get install -y testdisk` | `brew install testdisk` | `choco install testdisk` |
| **Foremost / Scalpel** | Mature signature-based header/footer carving with custom extraction rules | ReCoveryAI boundary validator | `sudo apt-get install -y foremost scalpel` | `brew install foremost` | Download Foremost binaries |
| **Tesseract OCR** | Text and typography extraction from recovered images, whiteboards, badges | Built-in metadata & text stream parser | `sudo apt-get install -y tesseract-ocr && pip install pytesseract` | `brew install tesseract && pip install pytesseract` | `winget install UB-Mannheim.TesseractOCR && pip install pytesseract` |
| **OpenCV (cv2)** | Image quality diagnostics, Laplacian blur variance, and scanline corruption analysis | Pure NumPy DCT discontinuity & gradient variance analyzer | `pip install opencv-python-headless` | `pip install opencv-python` | `pip install opencv-python` |

---

## Truly Fragmented File Matching Algorithm

For non-contiguous fragments, ReCoveryAI evaluates:
1. **Markov Bigram Transition Probabilities**: Analyzes byte continuity across the tail of Fragment $A$ and head of Fragment $B$.
2. **Format Structural Grammar**:
   - **JPEG**: Start of Scan (`0xFF 0xDA`) must precede entropy-coded quantization streams; End of Image (`0xFF 0xD9`) strictly terminates file chains.
   - **PDF**: Stream dictionaries (`/Length`, `stream ... endstream`) and indirect object references (`X 0 obj ... endobj`) cross-validate object continuity.
   - **ZIP / DOCX**: Local file header records (`50 4B 03 04`) transition to Central Directory headers (`50 4B 01 02`) and EOCD records (`50 4B 05 06`).
3. **Spatial Proximity & Entropy Smoothing**: Computes distance penalty $|offset_{next} - offset_{prev}|$ and delta entropy $|\Delta H|$.

---

## Project Repository & Downloadable ZIP Package

The complete project codebase is packaged as **`recoveai_forensics_workbench.zip`** (available in the root directory and downloadable directly within the web app via the **Download .ZIP** button in the top navigation bar).

### Archive Contents:
- `/src`: Full React 19 + TypeScript frontend with 4-tier Evidence Graph, Hex Viewer, Dashboard, and Reports.
- `/backend_fastapi`: Complete Python FastAPI service with SleuthKit, PhotoRec, Foremost, Tesseract, and OpenCV bridges.
- `/public`: Static assets and downloadable zip package.
- `metadata.json`, `package.json`, `tsconfig.json`, `vite.config.ts`.
- `README.md`: Technical documentation and setup guides.

---

## Quickstart Instructions

### 1. Web Workbench (Frontend)
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** to launch the forensic workbench.

### 2. Standalone Python FastAPI Backend
```bash
cd backend_fastapi
pip install -r requirements.txt
uvicorn backend_fastapi.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI / Swagger Documentation: **[http://localhost:8000/docs](http://localhost:8000/docs)**
