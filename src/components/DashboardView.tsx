import React, { useState } from 'react';
import { ForensicScanResult, ReconstructedFile } from '../types/forensics';
import { formatBytes, formatHexOffset } from '../utils/forensicEngine';
import {
  Shield,
  Layers,
  FileCheck,
  AlertTriangle,
  CopyCheck,
  Cpu,
  ArrowRight,
  TrendingUp,
  Activity,
  FileText,
  Image as ImageIcon,
  Film,
  FileCode,
  Sparkles,
  Download,
  LayoutGrid,
  List,
  ExternalLink,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';

interface Props {
  scanResult: ForensicScanResult;
  onSelectFile: (file: ReconstructedFile) => void;
  onNavigateTab: (tab: any) => void;
  onLoadDemo: () => void;
  onOpenSavedCases?: () => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
}

export const DashboardView: React.FC<Props> = ({
  scanResult,
  onSelectFile,
  onNavigateTab,
  onLoadDemo,
  onOpenSavedCases,
  userEmail,
  onOpenAuth
}) => {
  const { stats, reconstructedFiles, fragments } = scanResult;
  const [artifactViewMode, setArtifactViewMode] = useState<'auto' | 'table' | 'cards'>('auto');

  // File type distribution count
  const typeCounts = reconstructedFiles.reduce((acc, f) => {
    acc[f.fileType] = (acc[f.fileType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner & Scenario Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 shrink-0 flex items-center justify-center shadow-md">
            <img
              src="/src/assets/images/forensic_lab_badge_1790319307480.jpg"
              alt="ReCoveryAI Seal"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={e => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400">Forensic Workspace</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] sm:text-xs text-cyan-400 font-mono">Read-Only Mode</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex flex-wrap items-center gap-1.5">
              <span>Target Evidence:</span>
              <span className="font-mono text-cyan-300 break-all">{scanResult.datasetName}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 leading-snug">
              {formatBytes(scanResult.datasetSizeBytes)} inspected across {fragments.length} logical sectors ({scanResult.sectorSize} B/sector) · {new Date(scanResult.scanTimestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Action buttons (responsive grid on phone, flex on tablet/laptop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full md:w-auto">
          {onOpenSavedCases && (
            <button
              onClick={onOpenSavedCases}
              className="px-2.5 sm:px-3.5 py-2 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg sm:rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950 text-center cursor-pointer"
              title="Open Evidence Cases Database (Cloud Firestore)"
            >
              <Database className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
              <span className="truncate">Saved Cases</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('restoration')}
            className="px-2.5 sm:px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg sm:rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-purple-950 text-center cursor-pointer"
            title="Open AI-Assisted Image Restoration Lab"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Restoration Lab</span>
          </button>

          <button
            onClick={() => onNavigateTab('defragmenter')}
            className="px-2.5 sm:px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg sm:rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950 text-center cursor-pointer"
            title="Open Image Defragmenter & Download Form"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Defragment Form</span>
          </button>


          <button
            onClick={() => onNavigateTab('upload')}
            className="px-2.5 sm:px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg sm:rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
          >
            <span className="truncate">Scan Another</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="px-2.5 sm:px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg sm:rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950 text-center cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Reload Demo</span>
          </button>
        </div>
      </div>

      {/* Local Mode Notice */}
      {!userEmail && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-900/60 border border-amber-700 text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-100 uppercase tracking-wide block">
                Local Mode Active
              </span>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                You are using the workbench without an account. Analysis and recovery tools remain available; cloud case storage is disabled in local mode.
              </span>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 shadow-sm cursor-pointer whitespace-nowrap"
            >
              Sign In to Save Data
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Grid (Phone: 2 cols, Tablet: 3 cols, Laptop: 6 cols) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Total Fragments */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Total Fragments</span>
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-100 font-tabular">
            {stats.totalFragments}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Logical storage clusters</div>
        </div>

        {/* Identified Fragments */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Identified Frags</span>
            <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 font-tabular">
            {stats.identifiedFragments}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">
            {((stats.identifiedFragments / stats.totalFragments) * 100).toFixed(0)}% signature match
          </div>
        </div>

        {/* Reconstructed Files */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Reconstructed</span>
            <FileCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 font-tabular">
            {stats.reconstructedFiles}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">{stats.fullyRecoveredFiles} complete files</div>
        </div>

        {/* Partial Files */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Partial Files</span>
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 font-tabular">
            {stats.partiallyRecoveredFiles}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Missing sector gaps</div>
        </div>

        {/* Corrupted / Unrec */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Unrecoverable</span>
            <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 font-tabular">
            {stats.unrecoverableFiles + stats.corruptedFiles}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">Cipher / broken headers</div>
        </div>

        {/* Duplicates */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-2.5 sm:p-3.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider truncate">Duplicates</span>
            <CopyCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-purple-400 font-tabular">
            {stats.duplicateFilesCount}
          </div>
          <div className="text-[9px] sm:text-[10px] text-slate-500 truncate">SHA-256 deduplicated</div>
        </div>
      </div>

      {/* AI Summary Highlight Panel */}
      <div className="bg-slate-900/60 border border-cyan-900/40 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Forensic Investigation Summary
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('report')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Full Investigation Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {scanResult.aiForensicSummary.executiveOverview}
        </p>

        {/* Observed vs Inferred distinction (Stacks on mobile, 2 cols on tablet/laptop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1 text-xs">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Measured Evidence Facts
            </span>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              {scanResult.aiForensicSummary.directFacts.slice(0, 3).map((f, i) => (
                <li key={i} className="truncate">· {f}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Heuristic Findings (Requires Cross-Validation)
            </span>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              {scanResult.aiForensicSummary.aiInferences.slice(0, 3).map((inf, i) => (
                <li key={i} className="truncate">· {inf}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Forensic Visual Charts Grid (1 col phone, 2 cols tablet, 3 cols laptop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* File Type Distribution */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">File Type Breakdown</span>
            <span className="text-[10px] text-slate-500 font-mono">By Format</span>
          </div>

          <div className="space-y-2 text-xs">
            {Object.entries(typeCounts).map(([type, count]) => {
              const pct = (count / reconstructedFiles.length) * 100;
              const barColor =
                type === 'JPEG' ? 'bg-cyan-500' :
                type === 'PDF' ? 'bg-rose-500' :
                type === 'TXT' ? 'bg-emerald-500' :
                type === 'DOCX' ? 'bg-blue-500' :
                type === 'MP4' ? 'bg-purple-500' : 'bg-amber-500';

              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-mono text-slate-300">{type}</span>
                    <span className="text-slate-400 font-mono">{count} files ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Status Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Reconstruction Health</span>
            <span className="text-[10px] text-slate-500 font-mono">Integrity Status</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 sm:p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Fully Intact</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">{stats.fullyRecoveredFiles}</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${(stats.fullyRecoveredFiles / stats.reconstructedFiles) * 100}%` }} />
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Partial Recover</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400">{stats.partiallyRecoveredFiles}</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${(stats.partiallyRecoveredFiles / stats.reconstructedFiles) * 100}%` }} />
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Unrecoverable</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-rose-400">{stats.unrecoverableFiles + stats.corruptedFiles}</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full" style={{ width: `${((stats.unrecoverableFiles + stats.corruptedFiles) / stats.reconstructedFiles) * 100}%` }} />
              </div>
            </div>

            <div className="p-2.5 sm:p-3 bg-slate-950 rounded-lg border border-slate-800/80">
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">Deduplicated</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-purple-400">{stats.duplicateFilesCount}</span>
              <div className="w-full bg-slate-900 h-1 rounded mt-1.5 overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: `${(stats.duplicateFilesCount / stats.reconstructedFiles) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quality Gauges (Spans 2 cols on tablet for clean layout) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300">Confidence & Integrity</span>
            <span className="text-[10px] text-slate-500 font-mono">Weighted Mean</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Mean AI Confidence</span>
                <span className="font-mono text-purple-400 font-semibold">{stats.averageConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-full rounded-full" style={{ width: `${stats.averageConfidence}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-400">Mean Structural Integrity</span>
                <span className="font-mono text-emerald-400 font-semibold">{stats.averageIntegrity}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full" style={{ width: `${stats.averageIntegrity}%` }} />
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Carving Rule: Non-Destructive</span>
              <span className="text-cyan-400 font-mono">Forensic Standard</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Tier Causality & Modular Toolchain Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Card 1: 4-Tier Graph Shortcut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-purple-400 font-semibold">
                Causality & Risk Architecture
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                4-Tier Pipeline
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              Fragments ──► Files ──► Entities ──► Risk Indicators
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trace evidentiary lineage from raw disk sectors to assembled files, OCR extracted badge credentials, and cyber threat indicators.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('graph')}
            className="w-full py-2 px-3 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Inspect 4-Tier Evidence Topology</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Modular Forensic Toolchains Shortcut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Extensibility Layer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Native Fallback Active
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              TSK · PhotoRec · Foremost · OCR · OpenCV
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Optional external tool integration bridges with cross-platform instructions for Windows, Linux, and macOS.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('tools')}
            className="w-full py-2 px-3 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Toolchain Setup & OS Commands</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recovered Artifacts Inventory Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header with Title and Mode Switcher for Phone/Tablet */}
        <div className="px-3.5 sm:px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Reconstructed Evidence Artifacts ({reconstructedFiles.length})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Cards vs Table view selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setArtifactViewMode('table')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                  artifactViewMode === 'table' || artifactViewMode === 'auto'
                    ? 'bg-slate-800 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Table View"
              >
                <List className="w-3 h-3" />
                <span className="hidden sm:inline">Table</span>
              </button>

              <button
                onClick={() => setArtifactViewMode('cards')}
                className={`px-2 py-1 rounded transition-colors flex items-center gap-1 text-[11px] ${
                  artifactViewMode === 'cards'
                    ? 'bg-slate-800 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Cards View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateTab('recovered')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1. Mobile Cards View (Rendered when 'cards' is selected, or on very narrow phone viewports) */}
        {artifactViewMode === 'cards' ? (
          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {reconstructedFiles.map(file => (
              <div
                key={file.id}
                onClick={() => onSelectFile(file)}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 border border-slate-800 shrink-0">
                      {file.fileType === 'JPEG' ? <ImageIcon className="w-3.5 h-3.5" /> :
                       file.fileType === 'MP4' ? <Film className="w-3.5 h-3.5" /> :
                       <FileText className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-100 text-xs truncate group-hover:text-cyan-300">
                        {file.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {file.fileType} · {formatBytes(file.sizeBytes)}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-semibold shrink-0 ${
                    file.status === 'RECOVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    file.status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {file.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-850 text-center font-mono text-[10px]">
                  <div className="bg-slate-900/60 p-1 rounded">
                    <span className="text-slate-500 block text-[9px]">RECOVERY</span>
                    <span className="text-cyan-400 font-semibold">{file.recoveryPercentage}%</span>
                  </div>
                  <div className="bg-slate-900/60 p-1 rounded">
                    <span className="text-slate-500 block text-[9px]">INTEGRITY</span>
                    <span className="text-emerald-400 font-semibold">{file.integrityPercentage}%</span>
                  </div>
                  <div className="bg-slate-900/60 p-1 rounded">
                    <span className="text-slate-500 block text-[9px]">AI CONF</span>
                    <span className="text-purple-400 font-semibold">{file.aiConfidence}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span>Sector: {formatHexOffset(file.sourceSectorStart)}</span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:underline">
                    Inspect <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 2. Responsive Full Data Table (with smooth horizontal scrollbar & touch scroll) */
          <div className="overflow-x-auto">
            <div className="sm:hidden px-3 py-1.5 text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 border-b border-cyan-900/40 flex items-center justify-between">
              <span>← Swipe table horizontally to see all columns →</span>
              <button
                onClick={() => setArtifactViewMode('cards')}
                className="underline hover:text-cyan-200"
              >
                Switch to Cards
              </button>
            </div>

            <table className="w-full text-xs text-left min-w-[700px]">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 sm:px-4 font-medium">ARTIFACT NAME</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium">TYPE</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium">SECTOR RANGE</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium text-right">SIZE</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium text-center">RECOVERY</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium text-center">INTEGRITY</th>
                  <th className="py-2.5 px-2 sm:px-3 font-medium text-center">AI CONF</th>
                  <th className="py-2.5 px-3 sm:px-4 font-medium">STATUS</th>
                  <th className="py-2.5 px-3 sm:px-4 font-medium text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {reconstructedFiles.map(file => (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className="hover:bg-slate-850/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="p-1 sm:p-1.5 rounded bg-slate-950 text-cyan-400 border border-slate-800 shrink-0">
                          {file.fileType === 'JPEG' ? <ImageIcon className="w-3.5 h-3.5" /> :
                           file.fileType === 'MP4' ? <Film className="w-3.5 h-3.5" /> :
                           <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors truncate max-w-[160px] sm:max-w-xs">
                            {file.name}
                          </div>
                          {file.isDuplicate && (
                            <span className="text-[10px] text-amber-400">Duplicate</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-300">{file.fileType}</td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-slate-400 whitespace-nowrap">
                      {formatHexOffset(file.sourceSectorStart)} - {formatHexOffset(file.sourceSectorEnd)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-right text-slate-300 font-tabular whitespace-nowrap">
                      {formatBytes(file.sizeBytes)}
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                      <span className="text-cyan-400 font-semibold">{file.recoveryPercentage}%</span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                      <span className="text-emerald-400 font-semibold">{file.integrityPercentage}%</span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-3 text-center">
                      <span className="text-purple-400 font-semibold">{file.aiConfidence}%</span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        file.status === 'RECOVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        file.status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {file.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
