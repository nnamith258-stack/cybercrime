import { ExternalToolInfo, ForensicScanResult, ReconstructedFile, RecoveryStatus } from '../types/forensics';

interface RecoveryArtifactResponse {
  id: string;
  original_name: string | null;
  recovered_name: string;
  file_type: ReconstructedFile['fileType'];
  source_offsets: Array<[number, number]>;
  expected_size: number | null;
  recovered_size: number;
  recovery_percentage: number | null;
  status: RecoveryStatus;
  sha256: string;
  validation: {
    valid: boolean;
    integrity_score: number;
    errors: string[];
    warnings: string[];
  };
  fragment_count: number;
  ml_confidence: number | null;
  forensic_confidence: number;
  download_url: string;
}

interface RecoveryResponse {
  case_id: string;
  source_sha256: string;
  source_size: number;
  source_name?: string;
  scan_timestamp?: string;
  sector_size?: number;
  tools_used: string[];
  artifacts: RecoveryArtifactResponse[];
  fragments?: Array<{
    id: string;
    file_type?: string;
    predicted_type?: string;
    start_offset?: number;
    end_offset?: number;
    size?: number;
    role?: string;
    classification?: { predicted_type?: string; confidence?: number | string; method?: string; signature_valid?: boolean };
    raw_preview_hex?: string;
  }>;
  forensic_summary?: {
    executive_overview: string;
    direct_facts: string[];
    heuristic_findings: string[];
    investigator_recommendations: string[];
  };
}

const toFile = (artifact: RecoveryArtifactResponse): ReconstructedFile => {
  const [start, end] = artifact.source_offsets[0] ?? [0, 0];
  return {
    id: artifact.id,
    name: artifact.recovered_name,
    originalName: artifact.original_name ?? '',
    fileType: artifact.file_type,
    mimeType: 'application/octet-stream',
    sizeBytes: artifact.recovered_size,
    originalFragmentsTotal: artifact.fragment_count,
    recoveredFragmentsCount: artifact.fragment_count,
    fragmentIds: [],
    recoveryPercentage: artifact.recovery_percentage ?? 0,
    integrityPercentage: artifact.validation.integrity_score,
    aiConfidence: artifact.ml_confidence === null ? 0 : artifact.ml_confidence * 100,
    forensicConfidence: artifact.forensic_confidence,
    status: artifact.status,
    sha256: artifact.sha256,
    isDuplicate: false,
    sourceSectorStart: start,
    sourceSectorEnd: end,
    metadata: {
      observedHeaders: artifact.validation.valid ? ['Structural validation passed'] : artifact.validation.errors,
    },
    missingBlocks: [],
    previewType: 'binary',
    downloadUrl: artifact.download_url,
    rawHexData: '',
  };
};

export function createEmptyScanResult(): ForensicScanResult {
  return {
    scanId: 'NO-CASE', datasetName: 'No evidence loaded', datasetSizeBytes: 0, datasetSha256: '',
    scanTimestamp: new Date(0).toISOString(), sectorSize: 512, fragments: [], reconstructedFiles: [],
    entities: [], riskIndicators: [], toolsInfo: [],
    stats: {
      totalFragments: 0, identifiedFragments: 0, unidentifiedFragments: 0, reconstructedFiles: 0,
      fullyRecoveredFiles: 0, partiallyRecoveredFiles: 0, corruptedFiles: 0, unrecoverableFiles: 0,
      duplicateFilesCount: 0, averageConfidence: 0, averageIntegrity: 0, totalStorageScannedBytes: 0,
      criticalRisksCount: 0, totalEntitiesExtracted: 0,
    },
    aiForensicSummary: {
      executiveOverview: 'No evidence has been scanned.', directFacts: [], aiInferences: [],
      investigatorRecommendations: [], anomalyAlerts: [],
    },
  };
}

function toScanResult(payload: RecoveryResponse, datasetName: string, sectorSize: number): ForensicScanResult {
  const files = payload.artifacts.map(toFile);
  const fragments = payload.fragments ? payload.fragments.map((fragment, index) => {
    const fileType = (fragment.classification?.predicted_type ?? fragment.predicted_type ?? fragment.file_type ?? 'UNKNOWN') as ReconstructedFile['fileType'];
    const preview = fragment.raw_preview_hex ?? '';
    const confidence = typeof fragment.classification?.confidence === 'number'
      ? Math.round(fragment.classification.confidence * 100)
      : fragment.classification?.signature_valid ? 100 : 0;
    return {
    id: fragment.id,
    index: index + 1,
    offsetStart: fragment.start_offset ?? 0,
    offsetEnd: fragment.end_offset ?? 0,
    sizeBytes: fragment.size ?? 0,
    detectedSignature: fileType,
    signatureName: `Classified ${fileType} fragment`,
    predictedType: fileType,
    entropy: 0,
    asciiRatio: 0,
    confidenceScore: confidence,
    confidenceReasoning: fragment.classification?.method ?? 'Deterministic signature classification.',
    matchedFileId: files[0]?.id,
    isHeader: index === 0,
    isFooter: index === (payload.fragments?.length ?? 1) - 1,
    status: 'matched' as const,
    rawBytesPreview: preview,
    rawAsciiPreview: '',
  };
  }) : files.map((file, index) => ({
    id: `FRAG-${String(index + 1).padStart(3, '0')}`,
    index: index + 1,
    offsetStart: file.sourceSectorStart,
    offsetEnd: file.sourceSectorEnd,
    sizeBytes: file.sizeBytes,
    detectedSignature: file.fileType,
    signatureName: `Validated ${file.fileType}`,
    predictedType: file.fileType,
    entropy: 0,
    asciiRatio: 0,
    confidenceScore: 100,
    confidenceReasoning: 'Accepted by the backend structural validator.',
    matchedFileId: file.id,
    isHeader: true,
    isFooter: true,
    status: 'matched' as const,
    rawBytesPreview: '',
    rawAsciiPreview: '',
  }));
  const toolsInfo: ExternalToolInfo[] = payload.tools_used.map(tool => ({
    id: tool,
    name: tool,
    category: 'Recovery',
    installed: true,
    statusText: 'Used for this scan',
    role: 'Evidence recovery',
    installCommands: { linux: '', macos: '', windows: '' },
    fallbackActive: tool === 'internal_signature_carver',
  }));
  return {
    scanId: payload.case_id,
    datasetName,
    datasetSizeBytes: payload.source_size,
    datasetSha256: payload.source_sha256,
    scanTimestamp: payload.scan_timestamp ?? new Date().toISOString(),
    sectorSize: payload.sector_size ?? sectorSize,
    fragments,
    reconstructedFiles: files,
    entities: [],
    riskIndicators: [],
    toolsInfo,
    stats: {
      totalFragments: fragments.length,
      identifiedFragments: fragments.length,
      unidentifiedFragments: 0,
      reconstructedFiles: files.length,
      fullyRecoveredFiles: files.filter(item => item.status === 'RECOVERED').length,
      partiallyRecoveredFiles: files.filter(item => item.status === 'PARTIAL').length,
      corruptedFiles: files.filter(item => item.status === 'CORRUPTED').length,
      unrecoverableFiles: files.filter(item => item.status === 'UNRECOVERABLE').length,
      duplicateFilesCount: 0,
      averageConfidence: files.length ? files.reduce((sum, item) => sum + (item.forensicConfidence ?? 0), 0) / files.length * 100 : 0,
      averageIntegrity: files.length ? files.reduce((sum, item) => sum + item.integrityPercentage, 0) / files.length : 0,
      totalStorageScannedBytes: payload.source_size,
      criticalRisksCount: 0,
      totalEntitiesExtracted: 0,
    },
    aiForensicSummary: {
      executiveOverview: payload.forensic_summary?.executive_overview ?? `Validated ${files.length} artifact(s) from the uploaded evidence.`,
      directFacts: payload.forensic_summary?.direct_facts ?? [`Source SHA-256: ${payload.source_sha256}`],
      aiInferences: payload.forensic_summary?.heuristic_findings ?? [],
      investigatorRecommendations: payload.forensic_summary?.investigator_recommendations ?? ['Compare downloaded artifact hashes with the case manifest.'],
      anomalyAlerts: [],
    },
  };
}

export async function scanEvidence(file: File, sectorSize: number): Promise<ForensicScanResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('sector_size', String(sectorSize));
  const response = await fetch('http://localhost:8000/api/recovery/scan', { method: 'POST', body: form });
  if (!response.ok) throw new Error(`Recovery API returned ${response.status}`);
  const payload = (await response.json()) as RecoveryResponse;
  return toScanResult(payload, file.name, sectorSize);
}

export async function runForensicDemo(): Promise<ForensicScanResult> {
  const response = await fetch('http://localhost:8000/api/forensic/demo');
  if (!response.ok) throw new Error(`Demo API returned ${response.status}`);
  const payload = (await response.json()) as RecoveryResponse;
  return toScanResult(payload, payload.source_name ?? 'ReCoveryAI corrupted JPEG sample', payload.sector_size ?? 512);
}
