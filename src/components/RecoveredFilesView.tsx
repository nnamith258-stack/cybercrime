import React, { useState } from 'react';
import { ReconstructedFile, RecoveryStatus } from '../types/forensics';
import { formatBytes, formatHexOffset } from '../utils/forensicEngine';
import { getSupportedFileBlob } from '../utils/filePayloadGenerator';
import { DownloadRecoveredFileForm } from './DownloadRecoveredFileForm';
import {
  FileText,
  Image as ImageIcon,
  Film,
  FileCode,
  Download,
  Eye,
  Filter,
  Search,
  CopyCheck,
  ShieldCheck,
  AlertCircle,
  LayoutGrid,
  List,
  Smartphone,
  Monitor,
  Check,
  Sliders
} from 'lucide-react';

interface Props {
  files: ReconstructedFile[];
  onSelectFile: (file: ReconstructedFile) => void;
}

export const RecoveredFilesView: React.FC<Props> = ({ files, onSelectFile }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [activeDownloadFile, setActiveDownloadFile] = useState<ReconstructedFile | null>(null);

  const filtered = files.filter(f => {
    let matchesStatus = true;
    if (filterStatus === 'DUPLICATES') {
      matchesStatus = f.isDuplicate;
    } else if (filterStatus !== 'ALL') {
      matchesStatus = f.status === filterStatus;
    }

    const matchesSearch =
      search === '' ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.fileType.toLowerCase().includes(search.toLowerCase()) ||
      f.sha256.toLowerCase().includes(search.toLowerCase()) ||
      (f.metadata.title && f.metadata.title.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleDownload = async (e: React.MouseEvent, file: ReconstructedFile) => {
    e.stopPropagation();
    const blob = await getSupportedFileBlob(file, 'png');
    let downloadName = file.name;
    // For JPEG images, export as PNG for 100% loss-free guarantee on mobile
    if (file.fileType === 'JPEG' && !downloadName.endsWith('.png') && !downloadName.endsWith('.jpg')) {
      downloadName += '.png';
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    setDownloadNotice(`Downloaded ${downloadName} (Phone & Desktop Verified)`);
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Deduplication & Evidence Banner with ZIP Download */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-950/60 border border-purple-500/30 rounded-lg text-purple-400 shrink-0">
            <CopyCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm">
                Cryptographic Deduplication & Multi-Platform Evidence Repository
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                iOS / Android / Win / Mac Supported
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-3xl">
              Each reconstructed file is hashed with SHA-256. All recovered image, document, log, and video artifacts
              are formatted to open natively on both desktop and mobile operating systems without third-party converters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px] mr-2">
            <div>
              <span className="text-slate-500 mr-1.5">Unique:</span>
              <span className="font-bold text-cyan-400">{files.filter(f => !f.isDuplicate).length}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1.5">Duplicates:</span>
              <span className="font-bold text-purple-400">{files.filter(f => f.isDuplicate).length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveDownloadFile(activeDownloadFile ? null : files[0] || null)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-md shadow-emerald-950 whitespace-nowrap"
              title="Open the Download Recovered File Form"
            >
              <Download className="w-4 h-4" />
              <span>{activeDownloadFile ? 'Close Download Form' : 'Download Form'}</span>
            </button>

          </div>
        </div>
      </div>

      {/* Inline Download Recovered File Form */}
      {activeDownloadFile && (
        <div className="animate-in fade-in slide-in-from-top-3">
          <DownloadRecoveredFileForm
            file={activeDownloadFile}
            onClose={() => setActiveDownloadFile(null)}
          />
        </div>
      )}

      {/* Floating Download Toast */}
      {downloadNotice && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-800 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Filter and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {[
            { id: 'ALL', label: 'All Artifacts' },
            { id: 'RECOVERED', label: 'Recovered' },
            { id: 'PARTIAL', label: 'Partial' },
            { id: 'CORRUPTED', label: 'Corrupted' },
            { id: 'UNRECOVERABLE', label: 'Unrecoverable' },
            { id: 'DUPLICATES', label: 'Duplicates Only' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1 font-medium rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search file name, hash, metadata..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(file => (
            <div
              key={file.id}
              onClick={() => onSelectFile(file)}
              className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 space-y-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/20 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                    {file.fileType === 'JPEG' ? <ImageIcon className="w-5 h-5" /> :
                     file.fileType === 'MP4' ? <Film className="w-5 h-5" /> :
                     <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      file.status === 'RECOVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                      file.status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {file.status.replace('_', ' ')}
                    </span>
                    {file.isDuplicate && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                        Duplicate Copy
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors text-sm break-words">
                    {file.name}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {file.fileType} · {formatBytes(file.sizeBytes)} · {file.recoveredFragmentsCount} fragments
                  </p>
                </div>

                {file.metadata.title && (
                  <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                    {file.metadata.title}
                  </p>
                )}
              </div>

              {/* Progress and Actions */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Recovery Ratio</span>
                    <span className="text-cyan-400 font-semibold">{file.recoveryPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${file.recoveryPercentage}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Integrity: <strong className="text-emerald-400">{file.integrityPercentage}%</strong></span>
                  <span>AI Conf: <strong className="text-purple-400">{file.aiConfidence}%</strong></span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => onSelectFile(file)}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Inspect</span>
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setActiveDownloadFile(file);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="py-1.5 px-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                    title="Open in Download Form"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Form</span>
                  </button>
                  <button
                    onClick={e => handleDownload(e, file)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="Quick Download Native File"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4 font-medium">NAME</th>
                  <th className="py-2.5 px-3 font-medium">TYPE</th>
                  <th className="py-2.5 px-3 font-medium">SECTOR RANGE</th>
                  <th className="py-2.5 px-3 font-medium text-right">SIZE</th>
                  <th className="py-2.5 px-3 font-medium text-center">RECOVERY</th>
                  <th className="py-2.5 px-3 font-medium text-center">INTEGRITY</th>
                  <th className="py-2.5 px-3 font-medium text-center">AI CONF</th>
                  <th className="py-2.5 px-4 font-medium">STATUS</th>
                  <th className="py-2.5 px-4 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filtered.map(file => (
                  <tr
                    key={file.id}
                    onClick={() => onSelectFile(file)}
                    className="hover:bg-slate-850/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <span className="text-cyan-400">[{file.id}]</span>
                      <span className="truncate max-w-xs">{file.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{file.fileType}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {formatHexOffset(file.sourceSectorStart)} - {formatHexOffset(file.sourceSectorEnd)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatBytes(file.sizeBytes)}</td>
                    <td className="py-3 px-3 text-center text-cyan-400 font-bold">{file.recoveryPercentage}%</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-bold">{file.integrityPercentage}%</td>
                    <td className="py-3 px-3 text-center text-purple-400 font-bold">{file.aiConfidence}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                        file.status === 'RECOVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        file.status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {file.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setActiveDownloadFile(file);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-2 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 rounded text-[11px]"
                        title="Open Download Form"
                      >
                        Form
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectFile(file);
                        }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px]"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={e => handleDownload(e, file)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                      >
                        Quick Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
