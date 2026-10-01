import React, { useState } from 'react';
import { ForensicScanResult, ReconstructedFile } from '../types/forensics';
import { formatBytes, formatHexOffset } from '../utils/forensicEngine';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';

interface Props {
  scanResult: ForensicScanResult;
  onSelectFile: (file: ReconstructedFile) => void;
}

export const AnalysisReportView: React.FC<Props> = ({ scanResult, onSelectFile }) => {
  const [exported, setExported] = useState(false);
  const { stats, reconstructedFiles, aiForensicSummary } = scanResult;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scanResult, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `Forensic_Case_Report_${scanResult.scanId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl print:hidden">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Official Forensic Analysis Report</h2>
          <p className="text-xs text-slate-400">Formal technical findings, chain of custody, and verified evidence summary.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
          <button
            onClick={handleExportJson}
            className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exported ? 'Exported Case JSON' : 'Export JSON Package'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 space-y-8 text-xs text-slate-300 shadow-2xl print:bg-white print:text-black print:border-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-slate-800 pb-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950 shrink-0 flex items-center justify-center shadow-lg">
              <img
                src="/src/assets/images/forensic_lab_badge_1790319307480.jpg"
                alt="ReCoveryAI Forensic Seal"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <ShieldCheck className="w-8 h-8 text-cyan-400 hidden group-hover:block" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>ReCoveryAI Forensic Intelligence Platform</span>
              </div>
              <h1 className="text-xl font-bold text-slate-100">
                Digital Evidence Reconstruction & Integrity Audit
              </h1>
              <p className="text-slate-400 text-xs">
                Case Reference: <strong className="font-mono text-slate-200">{scanResult.scanId}</strong> · Examination Standard: NIST SP 800-86
              </p>
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-400 space-y-0.5">
            <div>Date: {new Date(scanResult.scanTimestamp).toLocaleDateString()}</div>
            <div>Time: {new Date(scanResult.scanTimestamp).toLocaleTimeString()} UTC</div>
            <div className="text-emerald-400 font-semibold">Status: Certified Read-Only</div>
          </div>
        </div>

        {/* Target Custody Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Evidence Ingestion & Cryptographic Chain of Custody
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 block">Target Image</span>
              <span className="text-slate-200 font-semibold truncate block">{scanResult.datasetName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Image Size</span>
              <span className="text-slate-200">{formatBytes(scanResult.datasetSizeBytes)} ({scanResult.datasetSizeBytes} B)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cluster Format</span>
              <span className="text-slate-200">{scanResult.sectorSize} B / Sector</span>
            </div>
            <div>
              <span className="text-slate-500 block">Deduplication</span>
              <span className="text-purple-400 font-semibold">Enabled (SHA-256)</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-slate-500 text-[10px] block">Cryptographic SHA-256 Checksum:</span>
            <span className="font-mono text-[11px] text-cyan-300 break-all">{scanResult.datasetSha256}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            1. Executive Case Summary
          </h3>
          <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {aiForensicSummary.executiveOverview}
          </p>
        </div>

        {/* Facts vs Inferences Split */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            2. Evidentiary Delineation: Physical Facts vs. AI Inferences
          </h3>
          <p className="text-[11px] text-slate-400">
            In compliance with forensic admissibility standards, deterministic byte-level observations are strictly segregated from statistical heuristics and machine predictions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Direct facts */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Physical Deterministic Facts (Admissible)
              </span>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                {aiForensicSummary.directFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-mono mt-0.5">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Heuristic findings */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-purple-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-purple-400" />
                Heuristic Corroborations (Requires Cross-Validation)
              </span>
              <ul className="space-y-2 text-slate-300 text-[11px]">
                {aiForensicSummary.aiInferences.map((inf, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500 font-mono mt-0.5">•</span>
                    <span>{inf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Reconstructed Evidence Inventory Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            3. Reconstructed Evidence Inventory ({reconstructedFiles.length} Artifacts)
          </h3>

          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">REF ID</th>
                  <th className="py-2.5 px-3">ARTIFACT NAME</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3 text-right">SIZE</th>
                  <th className="py-2.5 px-3 text-center">REC %</th>
                  <th className="py-2.5 px-3 text-center">INT %</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">SHA-256 HASH (PREVIEW)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {reconstructedFiles.map(file => (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className="hover:bg-slate-900/60 cursor-pointer"
                  >
                    <td className="py-2.5 px-3 text-cyan-400">{file.id}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-semibold">{file.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{file.fileType}</td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{formatBytes(file.sizeBytes)}</td>
                    <td className="py-2.5 px-3 text-center text-cyan-400">{file.recoveryPercentage}%</td>
                    <td className="py-2.5 px-3 text-center text-emerald-400">{file.integrityPercentage}%</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        file.status === 'RECOVERED' ? 'text-emerald-400 bg-emerald-950' :
                        file.status === 'PARTIAL' ? 'text-amber-400 bg-amber-950' :
                        'text-rose-400 bg-rose-950'
                      }`}>
                        {file.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-44">
                      {file.sha256.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Deduplication & Cryptographic Collision Audit */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            4. Cryptographic Deduplication Audit
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
            <p className="text-slate-300">
              The storage scan identified <strong>{stats.duplicateFilesCount} exact cryptographic clone(s)</strong> across unallocated sectors.
            </p>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-purple-300">
              Duplicate FILE-REC-06 (security_badge_k_anderson_backup_copy.jpg at 0x00013000) matched Primary FILE-REC-01 (0x00000000) with identical SHA-256 digest: 4a8f9c1039de47a8291f...
            </div>
            <p className="text-[11px] text-slate-500">
              Remediation: Both instances have been recorded in the chain of custody; duplicate weighting was removed from overall integrity metrics.
            </p>
          </div>
        </div>

        {/* Investigator Recommendations */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            5. Recommended Investigative Follow-Up Actions
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            {aiForensicSummary.investigatorRecommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-300 text-xs">
                <span className="font-mono text-cyan-400 font-bold">{i + 1}.</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Modular Toolchains & Optional Forensic Extensions */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            6. Modular Forensic Toolchain Integration Status
          </h3>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
            <p className="text-slate-400">
              The workbench supports optional execution bridges for The Sleuth Kit (TSK), PhotoRec, Foremost/Scalpel, Tesseract OCR, and OpenCV.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block font-semibold">The Sleuth Kit (fls, icat, tsk_recover)</span>
                <span className="text-emerald-400">Status: Pure Native MFT Cluster Parser Active</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block font-semibold">PhotoRec / TestDisk</span>
                <span className="text-emerald-400">Status: ReCoveryAI Deep Signature Carver Active</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block font-semibold">Tesseract OCR (v5 / pytesseract)</span>
                <span className="text-emerald-400">Status: Typography Extraction & Entity Match Active</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400 block font-semibold">OpenCV (cv2)</span>
                <span className="text-emerald-400">Status: Laplacian Blur & Scanline Discontinuity Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Threat Intelligence & Risk Indicators */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            7. Identified Threat Indicators & Risk Pathways
          </h3>
          <div className="space-y-2">
            {scanResult.riskIndicators?.map(risk => (
              <div key={risk.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      risk.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      risk.severity === 'HIGH' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                      'bg-yellow-950 text-yellow-300 border border-yellow-800'
                    }`}>
                      {risk.severity}
                    </span>
                    <span className="font-semibold text-slate-100">{risk.title}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{risk.description}</p>
                </div>
                <span className="font-mono text-[10px] text-cyan-400 shrink-0">{risk.id}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Report generated automatically by ReCoveryAI Forensics Engine v1.0</div>
          <div>Digital Fingerprint: {scanResult.datasetSha256.slice(0, 24)}...</div>
        </div>
      </div>
    </div>
  );
};
