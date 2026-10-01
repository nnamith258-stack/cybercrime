export type FileCategory = 'JPEG' | 'PNG' | 'PDF' | 'TXT' | 'ZIP' | 'DOCX' | 'XLSX' | 'PPTX' | 'MP4' | 'MP3' | 'GIF' | 'WEBP' | 'SQLite' | 'BINARY' | 'UNKNOWN';

export type RecoveryStatus = 'RECOVERED' | 'PARTIAL' | 'CORRUPTED' | 'UNRECOVERABLE';

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface RiskIndicator {
  id: string;
  severity: RiskSeverity;
  title: string;
  category: string;
  description: string;
  recommendedAction: string;
  linkedFileId?: string;
  linkedEntityId?: string;
}

export interface ExtractedEntity {
  id: string;
  type: 'Person' | 'Badge_ID' | 'IP_Address' | 'Credential_Hash' | 'Timestamp' | 'FilePath';
  value: string;
  context: string;
  sourceArtifactId: string;
  confidence: number;
}

export interface Fragment {
  id: string;
  index: number;
  offsetStart: number;
  offsetEnd: number;
  sizeBytes: number;
  detectedSignature: string;
  signatureName: string;
  predictedType: FileCategory;
  entropy: number; // 0.0 to 8.0
  asciiRatio: number; // 0.0 to 1.0
  confidenceScore: number;
  confidenceReasoning: string;
  matchedFileId?: string;
  clusterChainIndex?: number;
  isHeader: boolean;
  isFooter: boolean;
  status: 'matched' | 'unmatched' | 'corrupted_fragment';
  rawBytesPreview: string;
  rawAsciiPreview: string;
}

export interface MissingBlock {
  offsetStart: number;
  offsetEnd: number;
  sizeBytes: number;
  description: string;
}

export interface CvQualityDiagnostics {
  engine: string;
  laplacianVarianceBlur: number;
  isBlurry: boolean;
  compressionArtifactSpikes: number;
  visualIntegrityPercentage: number;
  scanlineContinuity: string;
}

export interface OcrDiagnostics {
  engine: string;
  extractedText: string;
  entitiesFound: Array<{ type: string; value: string; context: string }>;
  confidenceScore: number;
}

export interface ReconstructedFile {
  id: string;
  name: string;
  originalName: string;
  fileType: FileCategory;
  mimeType: string;
  sizeBytes: number;
  originalFragmentsTotal: number;
  recoveredFragmentsCount: number;
  fragmentIds: string[];
  recoveryPercentage: number | null; // null when expected size is unknown
  integrityPercentage: number; // 0 - 100
  aiConfidence: number; // 0 - 100, ranking signal only
  mlConfidence?: number | null;
  forensicConfidence?: number; // 0 - 1, final evidence assessment
  status: RecoveryStatus;
  sha256: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
  sourceSectorStart: number;
  sourceSectorEnd: number;
  metadata: {
    title?: string;
    author?: string;
    createdDate?: string;
    cameraModel?: string;
    dimensions?: string;
    duration?: string;
    pageCount?: number;
    archiveEntries?: string[];
    extractedKeywords?: string[];
    observedHeaders?: string[];
  };
  missingBlocks: MissingBlock[];
  previewType: 'image' | 'text' | 'document' | 'video' | 'binary';
  previewContent?: string;
  rawHexData: string;
  ocr?: OcrDiagnostics;
  cvQuality?: CvQualityDiagnostics;
  riskIndicators?: RiskIndicator[];
  downloadUrl?: string;
  directDownloadBlob?: Blob;
  isCustomUploaded?: boolean;
  fragmentationDetails?: {
    originalFragmentCount: number;
    stitchingMethod: string;
    defragmentedHeaders: string[];
    reassemblySteps: string[];
    restoredDimensions?: string;
    fragmentedPreviewUrl?: string;
  };
  quantumForensicState?: {
    algorithm: string;
    postQuantumHash: string;
    dilithiumSignature: string;
    kyberPublicKey: string;
    quantumFidelity: number;
    qber: number;
    quantumEntropyQrng: number;
    precisionLevel: string;
    timestamp: string;
  };
}

export interface ExternalToolInfo {
  id: string;
  name: string;
  category: string;
  installed: boolean;
  statusText: string;
  role: string;
  installCommands: {
    linux: string;
    macos: string;
    windows: string;
  };
  fallbackActive: boolean;
}

export interface EvidenceNode {
  id: string;
  tier: 'fragment' | 'file' | 'entity' | 'risk';
  type: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  severity?: RiskSeverity;
  dataRef?: any;
}

export interface EvidenceEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'fragment_to_file' | 'file_to_entity' | 'entity_to_risk' | 'file_to_risk' | 'duplicate_hash';
  stroke?: string;
}

export interface KPIStats {
  totalFragments: number;
  identifiedFragments: number;
  unidentifiedFragments: number;
  reconstructedFiles: number;
  fullyRecoveredFiles: number;
  partiallyRecoveredFiles: number;
  corruptedFiles: number;
  unrecoverableFiles: number;
  duplicateFilesCount: number;
  averageConfidence: number;
  averageIntegrity: number;
  totalStorageScannedBytes: number;
  criticalRisksCount: number;
  totalEntitiesExtracted: number;
}

export interface ForensicScanResult {
  scanId: string;
  datasetName: string;
  datasetSizeBytes: number;
  datasetSha256: string;
  scanTimestamp: string;
  sectorSize: number;
  fragments: Fragment[];
  reconstructedFiles: ReconstructedFile[];
  entities: ExtractedEntity[];
  riskIndicators: RiskIndicator[];
  toolsInfo: ExternalToolInfo[];
  stats: KPIStats;
  aiForensicSummary: {
    executiveOverview: string;
    directFacts: string[];
    aiInferences: string[];
    investigatorRecommendations: string[];
    anomalyAlerts: string[];
  };
}

export type ActiveTab = 'dashboard' | 'upload' | 'fragments' | 'recovered' | 'graph' | 'tools' | 'report' | 'defragmenter' | 'restoration';
