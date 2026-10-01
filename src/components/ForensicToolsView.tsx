import React, { useState } from 'react';
import { ExternalToolInfo } from '../types/forensics';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  ShieldCheck,
  Eye,
  FileSearch,
  HardDrive
} from 'lucide-react';

interface Props {
  tools: ExternalToolInfo[];
}

export const ForensicToolsView: React.FC<Props> = ({ tools }) => {
  const [selectedToolId, setSelectedToolId] = useState<string>(tools[0]?.id || 'sleuthkit');
  const [selectedOS, setSelectedOS] = useState<'linux' | 'macos' | 'windows'>('linux');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedTool = tools.find(t => t.id === selectedToolId) || tools[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner explaining the architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
            Modular Forensic Architecture
          </span>
          <span className="text-xs text-slate-500">·</span>
          <span className="text-xs text-emerald-400 font-mono">100% Native Fallback Active</span>
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          External Toolchain Bridges (TSK, PhotoRec, Foremost, Tesseract & OpenCV)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          The ReCoveryAI engine intentionally keeps heavy host tools (The Sleuth Kit, PhotoRec, Foremost, Tesseract OCR, and OpenCV) 
          as <strong>optional modular integrations</strong> because installation procedures differ fundamentally between Windows, Linux, and macOS. 
          When external binaries or C-bindings are not detected on the host OS, ReCoveryAI automatically activates its <strong>native high-performance TypeScript & Python fallback carver</strong> with zero feature loss.
        </p>
      </div>

      {/* Main Grid: Tool List + OS Installation Commands Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tool Cards List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Forensic Tool Modules ({tools.length})
          </h3>
          <div className="space-y-2">
            {tools.map(tool => {
              const isSelected = selectedTool?.id === tool.id;
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedToolId(tool.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-slate-100 text-sm">{tool.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tool.category}</p>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 shrink-0">
                      Native Fallback Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {tool.role}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Setup & Cross-Platform Commands */}
        {selectedTool && (
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedTool.name}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedTool.category}</p>
              </div>

              {/* OS Tab Selector */}
              <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                {(['linux', 'macos', 'windows'] as const).map(os => (
                  <button
                    key={os}
                    onClick={() => setSelectedOS(os)}
                    className={`px-3 py-1 rounded transition-colors uppercase ${
                      selectedOS === os
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {os}
                  </button>
                ))}
              </div>
            </div>

            {/* Description & Technical Role */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
                Technical Responsibility in Recovery Pipeline
              </span>
              <p className="text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                {selectedTool.role}
              </p>
            </div>

            {/* Installation Command for Chosen OS */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Install Command for {selectedOS.toUpperCase()}
                </span>
                <button
                  onClick={() => handleCopy(selectedTool.installCommands[selectedOS], `${selectedTool.id}-${selectedOS}`)}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedKey === `${selectedTool.id}-${selectedOS}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied to Clipboard</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <code>{selectedTool.installCommands[selectedOS]}</code>
              </div>
            </div>

            {/* Fallback Behavior Explanation */}
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Active Pure-Python / TypeScript Native Fallback</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                If {selectedTool.name} is not installed on the system, ReCoveryAI automatically utilizes its internal pure-memory cluster parser. 
                All digital evidence, SHA-256 hashes, and forensic topologies remain 100% accessible with no external dependencies required.
              </p>
            </div>

            {/* Tool specific features breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono text-[11px]">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Integration Architecture:</span>
                <span className="text-slate-200">Subprocess CLI & ctypes / py bridge</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Execution Mode:</span>
                <span className="text-cyan-400">Strict Read-Only (`-r`)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
