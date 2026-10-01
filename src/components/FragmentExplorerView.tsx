import React, { useState } from 'react';
import { Fragment, FileCategory } from '../types/forensics';
import { formatBytes, formatHexOffset } from '../utils/forensicEngine';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Cpu,
  Eye,
  Hash
} from 'lucide-react';

interface Props {
  fragments: Fragment[];
  onSelectFragment?: (frag: Fragment) => void;
}

export const FragmentExplorerView: React.FC<Props> = ({ fragments }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [selectedFrag, setSelectedFrag] = useState<Fragment | null>(fragments[0] || null);

  const filtered = fragments.filter(f => {
    const matchesType = typeFilter === 'ALL' || f.predictedType === typeFilter;
    const matchesSearch =
      search === '' ||
      f.id.toLowerCase().includes(search.toLowerCase()) ||
      f.signatureName.toLowerCase().includes(search.toLowerCase()) ||
      f.detectedSignature.toLowerCase().includes(search.toLowerCase()) ||
      formatHexOffset(f.offsetStart).toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Visual Fragment Matching Chain Callout */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Logical Fragment Assembly & Correlation Chain
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Cluster Sequence Matching Engine
          </span>
        </div>

        {/* Interactive chain preview illustration */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs overflow-x-auto">
          <div className="p-2.5 bg-slate-900 border border-cyan-500/40 rounded-lg space-y-0.5 min-w-36">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
              <span>FRAG-001</span>
              <span>[HEADER]</span>
            </div>
            <p className="font-semibold text-slate-200">JPEG SOI (0x0000)</p>
            <p className="text-[10px] text-slate-400 font-mono">Entropy: 7.42 · 4 KB</p>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 bg-slate-900 border border-cyan-500/40 rounded-lg space-y-0.5 min-w-36">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
              <span>FRAG-002</span>
              <span>[BODY SCAN]</span>
            </div>
            <p className="font-semibold text-slate-200">JPEG SOS (0x1000)</p>
            <p className="text-[10px] text-slate-400 font-mono">Entropy: 7.89 · 8 KB</p>
          </div>

          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

          <div className="p-2.5 bg-slate-900 border border-cyan-500/40 rounded-lg space-y-0.5 min-w-36">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono">
              <span>FRAG-003</span>
              <span>[FOOTER]</span>
            </div>
            <p className="font-semibold text-slate-200">JPEG EOI (0x3000)</p>
            <p className="text-[10px] text-slate-400 font-mono">Entropy: 7.61 · 4 KB</p>
          </div>

          <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />

          <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/50 rounded-lg space-y-0.5 min-w-44">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
              <span>RECONSTRUCTED</span>
              <span>100% MATCH</span>
            </div>
            <p className="font-semibold text-emerald-300">security_badge_k_anderson.jpg</p>
            <p className="text-[10px] text-emerald-400/80 font-mono">16,384 bytes assembled</p>
          </div>
        </div>
      </div>

      {/* Filter and Search toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Category:
          </span>
          {['ALL', 'JPEG', 'PDF', 'TXT', 'MP4', 'DOCX', 'BINARY'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 font-mono rounded-lg transition-colors ${
                typeFilter === type
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search fragment ID, offset, or signature..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 w-64"
          />
        </div>
      </div>

      {/* Fragments Table + Fragment Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Carved Fragments */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">
              Carved Logical Fragments ({filtered.length})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Click fragment to inspect telemetry
            </span>
          </div>

          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] sticky top-0 z-10 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">FRAG ID</th>
                  <th className="py-2.5 px-3">OFFSET</th>
                  <th className="py-2.5 px-3 text-right">SIZE</th>
                  <th className="py-2.5 px-3">SIGNATURE / PATTERN</th>
                  <th className="py-2.5 px-3 text-center">TYPE</th>
                  <th className="py-2.5 px-3 text-center">ENTROPY</th>
                  <th className="py-2.5 px-3 text-center">CONF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filtered.map(frag => {
                  const isSelected = selectedFrag?.id === frag.id;
                  return (
                    <tr
                      key={frag.id}
                      onClick={() => setSelectedFrag(frag)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/50 text-cyan-200 font-semibold' : 'hover:bg-slate-850/50 text-slate-300'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-cyan-400 font-bold">{frag.id}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {formatHexOffset(frag.offsetStart)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300 font-tabular">
                        {formatBytes(frag.sizeBytes)}
                      </td>
                      <td className="py-2.5 px-3 truncate max-w-44 text-slate-200">
                        {frag.signatureName}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          frag.predictedType === 'JPEG' ? 'bg-cyan-950 text-cyan-400' :
                          frag.predictedType === 'PDF' ? 'bg-rose-950 text-rose-400' :
                          frag.predictedType === 'TXT' ? 'bg-emerald-950 text-emerald-400' :
                          frag.predictedType === 'DOCX' ? 'bg-blue-950 text-blue-400' :
                          frag.predictedType === 'MP4' ? 'bg-purple-950 text-purple-400' :
                          'bg-amber-950 text-amber-400'
                        }`}>
                          {frag.predictedType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-tabular">
                        <span className={frag.entropy > 7.7 ? 'text-amber-400' : frag.entropy < 5.0 ? 'text-emerald-400' : 'text-slate-300'}>
                          {frag.entropy}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`font-bold ${
                          frag.confidenceScore >= 90 ? 'text-emerald-400' :
                          frag.confidenceScore >= 70 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {frag.confidenceScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Fragment Deep Inspector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Fragment Inspector
            </span>
            {selectedFrag && (
              <span className="font-mono text-xs font-bold text-cyan-400">
                {selectedFrag.id}
              </span>
            )}
          </div>

          {selectedFrag ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-500 block text-[11px]">Identified Signature</label>
                <p className="text-slate-100 font-semibold text-sm">{selectedFrag.signatureName}</p>
                <p className="font-mono text-cyan-400 text-[11px] mt-0.5 truncate">{selectedFrag.detectedSignature}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[11px]">Start Offset</span>
                  <span className="font-mono text-slate-200">{formatHexOffset(selectedFrag.offsetStart)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">End Offset</span>
                  <span className="font-mono text-slate-200">{formatHexOffset(selectedFrag.offsetEnd)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Cluster Size</span>
                  <span className="font-mono text-slate-200">{formatBytes(selectedFrag.sizeBytes)} ({selectedFrag.sizeBytes} B)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">ASCII Printable Ratio</span>
                  <span className="font-mono text-emerald-400">{(selectedFrag.asciiRatio * 100).toFixed(1)}%</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Shannon Entropy (0 - 8.0)</span>
                  <span className="font-mono text-slate-200 font-semibold">{selectedFrag.entropy}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-cyan-500 to-rose-500 h-full rounded-full"
                    style={{ width: `${(selectedFrag.entropy / 8) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {selectedFrag.entropy > 7.7
                    ? 'High entropy indicates compressed stream or encrypted ciphertext.'
                    : selectedFrag.entropy < 5.0
                    ? 'Low entropy indicates structured plaintext or repeated byte patterns.'
                    : 'Moderate entropy typical of structured binary format.'}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">AI Classification Reasoning</span>
                <p className="text-slate-300 leading-relaxed text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                  {selectedFrag.confidenceReasoning}
                </p>
              </div>

              {/* Raw Byte Sample View */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px] font-semibold">Leading 32 Bytes (Hex)</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-cyan-300 break-all leading-relaxed">
                  {selectedFrag.rawBytesPreview}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 block text-[11px] font-semibold">ASCII Translation Preview</span>
                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-400 break-all">
                  {selectedFrag.rawAsciiPreview}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a fragment row to view deep technical byte properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
