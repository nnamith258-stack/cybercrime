import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  Plus,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Clock,
  HardDrive,
  FileCheck,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';
import {
  fetchUserEvidenceCases,
  saveEvidenceCaseToDatabase,
  deleteEvidenceCase,
  SavedEvidenceCase
} from '../services/firebase';
import { ForensicScanResult } from '../types/forensics';
import { formatBytes } from '../utils/forensicEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentScanResult: ForensicScanResult;
  onLoadCase: (scanResult: ForensicScanResult) => void;
  userEmail: string | null;
}

export const SavedCasesModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentScanResult,
  onLoadCase,
  userEmail
}) => {
  const [cases, setCases] = useState<SavedEvidenceCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [caseTitle, setCaseTitle] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userEmail) {
      loadCases();
    }
  }, [isOpen, userEmail]);

  const loadCases = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchUserEvidenceCases();
      setCases(data);
    } catch (err: any) {
      console.error('Error fetching cases:', err);
      setErrorMessage(err?.message || 'Could not load saved cases from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      setErrorMessage('Cloud case storage is unavailable in local mode.');
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const caseId = await saveEvidenceCaseToDatabase(
        currentScanResult,
        caseTitle.trim() || undefined
      );
      setStatusMessage(`Case successfully saved with ID: ${caseId}`);
      setCaseTitle('');
      await loadCases();
    } catch (err: any) {
      console.error('Save case error:', err);
      setErrorMessage(err?.message || 'Failed to save case to database.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (caseId: string, caseName: string) => {
    if (!confirm(`Delete case record "${caseName}"? This action cannot be undone.`)) return;

    try {
      await deleteEvidenceCase(caseId);
      setCases(prev => prev.filter(c => c.id !== caseId));
      setStatusMessage(`Deleted case ${caseId}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to delete case.');
    }
  };

  const handleSelectCase = (c: SavedEvidenceCase) => {
    // Reconstruct full ForensicScanResult
    const reconstructed: ForensicScanResult = {
      scanId: c.id,
      datasetName: c.datasetName,
      datasetSizeBytes: c.datasetSizeBytes,
      datasetSha256: c.evidenceSha256,
      sectorSize: 512,
      scanTimestamp: c.createdAt,
      stats: {
        totalFragments: c.totalFragments,
        identifiedFragments: c.identifiedFragments,
        unidentifiedFragments: Math.max(0, c.totalFragments - c.identifiedFragments),
        reconstructedFiles: c.reconstructedFilesCount,
        fullyRecoveredFiles: c.reconstructedFiles.filter(f => f.status === 'RECOVERED').length,
        partiallyRecoveredFiles: c.reconstructedFiles.filter(f => f.status === 'PARTIAL').length,
        corruptedFiles: c.reconstructedFiles.filter(f => f.status === 'CORRUPTED').length,
        unrecoverableFiles: 0,
        duplicateFilesCount: 0,
        averageConfidence: 94,
        averageIntegrity: 92,
        totalStorageScannedBytes: c.datasetSizeBytes,
        criticalRisksCount: 0,
        totalEntitiesExtracted: 0
      },
      fragments: c.fragments || [],
      reconstructedFiles: c.reconstructedFiles || [],
      entities: currentScanResult.entities || [],
      riskIndicators: currentScanResult.riskIndicators || [],
      toolsInfo: currentScanResult.toolsInfo,
      aiForensicSummary: currentScanResult.aiForensicSummary
    };

    onLoadCase(reconstructed);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Evidence Cases Database
              </h2>
              <p className="text-xs text-slate-400">
                Persistent Cloud Firestore storage for uploaded evidence datasets and recovery projects.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local Mode Banner */}
        {!userEmail ? (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 space-y-2">
            <div className="flex items-center">
              <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5 font-mono">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Local Mode Active</span>
              </span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              You are using the workbench without an account. Analysis and recovery tools remain available; cloud case storage is disabled in local mode.
            </p>
          </div>
        ) : (
          /* Save current evidence case form */
          <form onSubmit={handleSaveCurrent} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Save Active Workspace to Database</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                User: {userEmail}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={caseTitle}
                onChange={e => setCaseTitle(e.target.value)}
                placeholder={`Case title (Default: Investigation of ${currentScanResult.datasetName})`}
                className="flex-1 w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-950 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Save to Database</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Status / Error Notifications */}
        {statusMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200">
            {errorMessage}
          </div>
        )}

        {/* Saved cases list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase font-mono">
              Saved Case Records ({cases.length})
            </span>
            {userEmail && (
              <button
                onClick={loadCases}
                disabled={loading}
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500 font-mono">
              Connecting to Firestore database...
            </div>
          ) : cases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl p-6 space-y-2">
              <Database className="w-8 h-8 mx-auto text-slate-600" />
              <p className="font-medium text-slate-400">No saved cases in your database account yet.</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                {userEmail
                  ? 'Upload or analyze evidence and click "Save to Database" above to store your forensic work.'
                  : 'Cloud case storage is unavailable in local mode.'}
              </p>
            </div>
          ) : (
            cases.map(c => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{c.caseName}</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      File: {c.datasetName} · {formatBytes(c.datasetSizeBytes)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleSelectCase(c)}
                      className="px-3 py-1 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Load into Workbench</span>
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.caseName)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 border border-slate-800 hover:border-red-800 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Case Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2 rounded-xl border border-slate-850">
                  <div>
                    <span className="text-slate-500 block">Fragments</span>
                    <span className="text-slate-200 font-bold">{c.identifiedFragments} / {c.totalFragments}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Recovered Files</span>
                    <span className="text-emerald-400 font-bold">{c.reconstructedFilesCount}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block">Evidence SHA-256</span>
                    <span className="text-yellow-400 truncate block font-mono">
                      {c.evidenceSha256 ? `${c.evidenceSha256.slice(0, 10)}...${c.evidenceSha256.slice(-8)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
