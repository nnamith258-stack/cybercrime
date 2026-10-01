# ReCoveryAI - Python FastAPI Forensic Engine

This directory provides the standalone Python FastAPI backend for **ReCoveryAI**. Recovery is evidence-preserving: source bytes are hashed before processing, read-only copies are used for optional external tools, and an artifact is returned only after format-specific validation.

## Architecture

```
Incoming Bitstream (.dd / .raw / .bin / custom)
         │
         ▼
[Filesystem metadata recovery] ─── (pytsk3 when installed)
         │
         ▼
[PhotoRec / Foremost] ─── (optional subprocess integrations)
         │
         ▼
[Validated signature carver] ─── (JPEG, PNG, PDF, ZIP/OOXML, MP4, MP3, GIF, WEBP, SQLite)
         │
         ▼
[Fragment ranking] ─── (heuristic plus optional small RandomForest ranking signal)
         │
         ▼
[Structural validation and SHA-256]
         │
         ▼
[SHA-256 Deduplication]     (Identifies clone artifacts in slack sectors)
         │
         ▼
[Forensic Case API]
```

## Running the Backend

1. Create and activate a Windows virtual environment from this directory:
```bash
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

2. Start the FastAPI development server:
```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

3. Open Swagger / OpenAPI documentation at:
```
http://localhost:8000/docs
```

The frontend uses `npm install` followed by `npm run dev`.

Optional host tools are detected at runtime. Install PhotoRec/TestDisk, Foremost, and The Sleuth Kit separately; absence of any of them does not disable the internal validator-backed carver.

`POST /api/recovery/scan` accepts an evidence file and returns a case manifest. Downloaded files are stored under `recovered/` using UUID names. The uploaded source is never overwritten.

`GET /api/forensic/demo` generates a deterministic truncated JPEG, runs the forensic recovery pipeline, and returns a separately downloadable recovered artifact. Use the Upload & Scan page's **Execute Corrupted JPEG Demo** action to run it from the web app.
