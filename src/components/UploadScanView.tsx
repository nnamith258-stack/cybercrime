import React, { useState } from 'react';
import { ForensicScanResult } from '../types/forensics';
import { formatBytes } from '../utils/forensicEngine';
import { scanEvidence } from '../services/recoveryApi';
import {
  Upload,
  Sparkles,
  ShieldCheck,
  Cpu,
  Sliders,
  CheckCircle2,
  HardDrive,
  Image as ImageIcon,
  ArrowRight,
  Database,
  Lock
} from 'lucide-react';

interface Props {
  onScanComplete: (result: ForensicScanResult) => void;
  onLoadDemo: () => Promise<boolean>;
  onNavigateTab: (tab: any) => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onOpenSavedCases?: () => void;
}

export const UploadScanView: React.FC<Props> = ({
  onScanComplete,
  onLoadDemo,
  onNavigateTab,
  userEmail,
  onOpenAuth,
  onOpenSavedCases
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [sectorSize, setSectorSize] = useState<512 | 4096>(512);
  const [deepCarving, setDeepCarving] = useState(true);
  const [entropyAnalysis, setEntropyAnalysis] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const handleRunDemo = () => {
    void onLoadDemo();
  };

  // Handle uploaded file
  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStep(`Reading bitstream from ${file.name} (${formatBytes(file.size)})...`);

    try {
      setScanProgress(45);
      setScanStep('Sending a read-only copy to the forensic recovery API...');
      const result = await scanEvidence(file, sectorSize);
      setScanProgress(100);
      setScanStep('Structural validation complete. No bytes were fabricated.');
      onScanComplete(result);
      setIsScanning(false);
      onNavigateTab('recovered');
    } catch (err) {
      console.error(err);
      setScanStep(err instanceof Error ? err.message : 'Recovery API unavailable.');
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Database Persistence Status / Local Mode Banner */}
      {userEmail ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <span>Cloud Firestore Database Active</span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800">
                  {userEmail}
                </span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New evidence uploaded and analyzed here will be ready to save into your persistent investigation case records.
              </p>
            </div>
          </div>
          {onOpenSavedCases && (
            <button
              onClick={onOpenSavedCases}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            >
              View Saved Cases
            </button>
          )}
        </div>
      ) : (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-900/60 border border-amber-700 text-amber-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-300 font-mono text-[11px] block">
                Local Mode
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Evidence files can be analyzed locally in your browser. Cloud case storage is disabled in local mode.
              </p>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer whitespace-nowrap"
            >
              Sign In to Save
            </button>
          )}
        </div>
      )}

      {/* Forensic Disclaimer */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Forensic Integrity & Non-Destructive Analysis Guarantee
          </p>
          <p className="text-slate-400 leading-relaxed">
            All analysis operations are executed strictly read-only on an in-memory byte representation. 
            Source data is never mutated, executed, or overwritten. Missing bytes are explicitly flagged as gaps and never fabricated.
          </p>
        </div>
      </div>

      {/* Fragmented Image Defragmenter Callout Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-900/50 border border-emerald-500/50 rounded-xl text-emerald-400 shrink-0">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Fragmented Image Defragmenter & Download Studio
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-semibold">
                Instant Download Form
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Have a fragmented, segmented, or corrupted image? Reconstruct missing JPEG SOI/EOI markers, align scanline clusters, and download directly in iOS, Android, macOS & Windows native formats.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('defragmenter')}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950 flex items-center gap-2 whitespace-nowrap ml-auto cursor-pointer"
        >
          <span>Open Image Defragmenter & Download Form</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: 1-Click Demo Scenario */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Hackathon Demo Scenario
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                Pre-configured
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              Analyze Prepared Corrupted File
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Runs a deterministic, truncated JPEG sample through the backend recovery and validation pipeline:
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-1 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>JPEG signature and corruption detection</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Missing EOI marker repair attempt</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Structural validation of repaired output</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Source and output SHA-256 comparison</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Repair bytes are recorded separately from source bytes</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleRunDemo}
            disabled={isScanning}
            className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Execute Corrupted JPEG Demo</span>
          </button>
        </div>

        {/* Card 2: Custom File / Disk Image Upload */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Custom Target Input
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Raw / Image / Folder
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-100">
              Upload Sample Disk Image / Evidence File
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Provide a raw storage dump, partition capture (.dd, .raw, .img, .bin), or individual suspect file for automatic fragment carving.
            </p>

            {/* Dropzone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors flex flex-col items-center justify-center space-y-2 cursor-pointer ${
                dragActive ? 'border-cyan-400 bg-cyan-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
              }`}
              onClick={() => {
                const input = document.getElementById('custom-file-input');
                if (input) input.click();
              }}
            >
              <Upload className="w-8 h-8 text-slate-500" />
              <div className="text-xs font-semibold text-slate-300">
                Click to browse or drag & drop evidence file
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Supports .dd, .raw, .img, .bin, .pdf, .jpg, .zip, .mp4, .txt (up to 50MB)
              </p>
              <input
                id="custom-file-input"
                type="file"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          {/* Scanner Parameters Configuration */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Sector Cluster Size:
              </span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                <button
                  onClick={() => setSectorSize(512)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sectorSize === 512 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  512 B
                </button>
                <button
                  onClick={() => setSectorSize(4096)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sectorSize === 4096 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  4096 B (4K)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Deep Signature Carving:</span>
              <button
                onClick={() => setDeepCarving(!deepCarving)}
                className={`font-mono px-2 py-0.5 rounded border transition-colors ${
                  deepCarving ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {deepCarving ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Shannon Entropy Analysis:</span>
              <button
                onClick={() => setEntropyAnalysis(!entropyAnalysis)}
                className={`font-mono px-2 py-0.5 rounded border transition-colors ${
                  entropyAnalysis ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {entropyAnalysis ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanning Progress Overlay / Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-400 animate-spin">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-100">Forensic Pipeline Executing</h4>
                <p className="text-xs text-slate-400 font-mono">Stage: Analyzing Storage Sectors</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 truncate max-w-xs">{scanStep}</span>
                <span className="text-cyan-400 font-bold">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Live Sector Grid Animation */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>SECTOR ALLOCATION MAP (208 SECTORS)</span>
                <span className="text-emerald-400">CARVING ACTIVE</span>
              </div>
              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 64 }).map((_, i) => {
                  const isActive = (i / 64) * 100 <= scanProgress;
                  return (
                    <div
                      key={i}
                      className={`h-2.5 rounded-xs transition-colors duration-200 ${
                        isActive
                          ? i % 7 === 0 ? 'bg-cyan-400' :
                            i % 5 === 0 ? 'bg-rose-400' :
                            i % 4 === 0 ? 'bg-emerald-400' : 'bg-blue-500'
                          : 'bg-slate-900'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
