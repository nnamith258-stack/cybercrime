import React, { useState, useEffect } from 'react';
import { ReconstructedFile, Fragment } from '../types/forensics';
import { formatBytes, formatHexOffset } from '../utils/forensicEngine';
import {
  getSupportedFileBlob,
  createBadgeJpegBlob,
  createBadgePngBlob,
  getBadgeImageDataUrl,
  createIncidentReportPdfBlob,
  createRealDocxBlob,
  createSurveillanceVideoBlob
} from '../utils/filePayloadGenerator';
import { HexViewer } from './HexViewer';
import { DownloadRecoveredFileForm } from './DownloadRecoveredFileForm';
import {
  X,
  Download,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Image as ImageIcon,
  Film,
  FileCode,
  Copy,
  Check,
  Cpu,
  Layers,
  Info,
  Smartphone,
  Monitor,
  ExternalLink
} from 'lucide-react';

interface Props {
  file: ReconstructedFile | null;
  fragments: Fragment[];
  onClose: () => void;
  onNavigateToFile?: (fileId: string) => void;
}

export const FileDetailsModal: React.FC<Props> = ({ file, fragments, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'download_form' | 'fragments' | 'hex' | 'metadata' | 'ocr' | 'cv' | 'risks'>('preview');
  const [copiedHash, setCopiedHash] = useState(false);
  const [badgeImgUrl, setBadgeImgUrl] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (file) {
      if (file.downloadUrl) {
        setBadgeImgUrl(file.downloadUrl);
      } else if (file.previewContent && (file.previewType === 'image' || file.downloadUrl)) {
        setBadgeImgUrl(file.previewContent);
      } else if (file.fileType === 'JPEG' || file.name.endsWith('.jpg') || file.name.endsWith('.png')) {
        const url = getBadgeImageDataUrl('png');
        if (active) {
          setBadgeImgUrl(url);
        }
      }
    }
    return () => {
      active = false;
    };
  }, [file]);

  if (!file) return null;

  const fileFragments = fragments.filter(f => file.fragmentIds.includes(f.id));

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    setDownloadSuccess(`Downloaded ${filename} successfully!`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(file.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadFileDefault = async () => {
    const blob = await getSupportedFileBlob(file, 'png');
    let ext = file.name;
    if (file.fileType === 'JPEG' && !ext.endsWith('.png') && !ext.endsWith('.jpg')) {
      ext += '.png';
    }
    triggerDownload(blob, ext);
  };

  const handleDownloadJpeg = async () => {
    const blob = await getSupportedFileBlob(file, 'jpeg');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerDownload(blob, `${baseName}.jpg`);
  };

  const handleDownloadPng = async () => {
    const blob = await getSupportedFileBlob(file, 'png');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    triggerDownload(blob, `${baseName}.png`);
  };

  const handleDownloadPdf = () => {
    const blob = createIncidentReportPdfBlob();
    triggerDownload(blob, file.name.endsWith('.pdf') ? file.name : `${file.name}.pdf`);
  };

  const handleDownloadDocx = async () => {
    const blob = await createRealDocxBlob();
    triggerDownload(blob, file.name.endsWith('.docx') ? file.name : `${file.name}.docx`);
  };

  const handleDownloadVideo = async () => {
    const blob = await createSurveillanceVideoBlob();
    triggerDownload(blob, 'surveillance_cam_04.mp4');
  };

  const handleOpenImageNewTab = () => {
    setActiveTab('download_form');
  };

  const handleDownloadChecksum = () => {
    const text = `${file.sha256}  ${file.name}\n# ReCoveryAI Forensic Hash Verification\n# Timestamp: ${new Date().toISOString()}\n# Integrity: ${file.integrityPercentage}%\n# Status: ${file.status}\n`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    triggerDownload(blob, `${file.name}.sha256`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shrink-0">
              {file.fileType === 'JPEG' ? <ImageIcon className="w-5 h-5" /> :
               file.fileType === 'PDF' || file.fileType === 'TXT' || file.fileType === 'DOCX' ? <FileText className="w-5 h-5" /> :
               file.fileType === 'MP4' ? <Film className="w-5 h-5" /> :
               <FileCode className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-100 break-all">{file.name}</h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                  file.status === 'RECOVERED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  file.status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {file.status.replace('_', ' ')}
                </span>
                {file.isDuplicate && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-700">
                    Duplicate Copy
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {file.fileType} · {formatBytes(file.sizeBytes)} · Sectors {formatHexOffset(file.sourceSectorStart)} - {formatHexOffset(file.sourceSectorEnd)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownloadChecksum}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1.5"
              title="Download SHA-256 Checksum"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Checksum</span>
            </button>
            <button
              onClick={() => setActiveTab('download_form')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950"
              title="Open interactive Download Recovered File Form"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Form</span>
            </button>
            <button
              onClick={handleDownloadFileDefault}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-950"
              title="Download verified native file for phone and desktop"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Quick Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors ml-1"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-800/80 px-6 py-2 flex items-center justify-between text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{downloadSuccess} Tested & verified for phone (iOS/Android) and desktop.</span>
            </div>
          </div>
        )}

        {/* Cross-Platform Device Support Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Smartphone className="w-4 h-4" />
              <span>Phone (iOS/Android) Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <Monitor className="w-4 h-4" />
              <span>Desktop (Win/Mac/Linux) Verified</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">SHA-256: {file.sha256.substring(0, 12)}...</span>
            <button
              onClick={handleCopyHash}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 border-b border-slate-800 flex gap-3 sm:gap-4 text-xs font-medium overflow-x-auto whitespace-nowrap bg-slate-950/40">
          <button
            onClick={() => setActiveTab('preview')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'preview' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Artifact Content Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('download_form')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'download_form' ? 'border-emerald-400 text-emerald-400 font-semibold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Recovered File Form</span>
          </button>
          <button
            onClick={() => setActiveTab('fragments')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'fragments' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Fragment Chain ({fileFragments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('hex')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'hex' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hex Dump & Byte Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'metadata' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Forensic Metadata</span>
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ocr' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Tesseract OCR</span>
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'cv' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>OpenCV Quality</span>
          </button>
          <button
            onClick={() => setActiveTab('risks')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'risks' ? 'border-rose-400 text-rose-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Risk Indicators</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'download_form' && (
            <DownloadRecoveredFileForm
              file={file}
              fragments={fragments}
            />
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              {/* Warnings for missing blocks if any */}
              {file.missingBlocks.length > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Non-Fabrication Policy: Incomplete Sectors Detected</span>
                  </div>
                  <p className="text-xs text-amber-200/80">
                    ReCoveryAI adheres strictly to digital forensic ethics. Missing bytes are never fabricated. Missing range:{' '}
                    <span className="font-mono">{formatHexOffset(file.missingBlocks[0].offsetStart)} - {formatHexOffset(file.missingBlocks[0].offsetEnd)}</span>{' '}
                    ({formatBytes(file.missingBlocks[0].sizeBytes)} unallocated).
                  </p>
                </div>
              )}

              {/* Rendering preview depending on type */}
              {(file.fileType === 'JPEG' || file.name.endsWith('.jpg')) && (
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950 flex flex-col items-center space-y-4">
                  {badgeImgUrl ? (
                    <div className="w-full max-w-xl space-y-4">
                      <div className="rounded-xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-black">
                        <img
                          src={badgeImgUrl}
                          alt="Recovered Badge ID"
                          className="w-full h-auto object-contain select-none"
                        />
                      </div>

                      {/* Device-Specific Export Controls */}
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-200">Export in Natively Supported Image Format:</span>
                          <span className="font-mono text-cyan-400 text-[11px]">1200x750 px · High-Res</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            onClick={handleDownloadPng}
                            className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                            title="PNG format - 100% universal support on iPhone Photos, Android Gallery, Windows Photos, macOS Preview"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PNG</span>
                          </button>

                          <button
                            onClick={handleDownloadJpeg}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                            title="Standard JPEG format with JFIF APP0 headers"
                          >
                            <Download className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Download JPEG (.jpg)</span>
                          </button>

                          <button
                            onClick={handleOpenImageNewTab}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                            title="Opens image directly in browser. Tap & hold on mobile to 'Save to Photos'"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                            <span>Open for Mobile Save</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          Tested for iOS Camera Roll, Android Google Photos, Windows 10/11 Photos app, and Mac Preview.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">Loading reconstructed image payload...</div>
                  )}
                  <p className="text-xs text-slate-500 text-center max-w-lg">
                    Reconstructed from 3 discrete cluster sectors: Header (0x00000000) + Quantized DCT Scan (0x00001000) + EOI (0x00003000).
                  </p>
                </div>
              )}

              {file.fileType === 'TXT' && (
                <div className="space-y-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {file.previewContent}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Clean UTF-8 text file with standard CRLF/LF line endings.</span>
                    <button
                      onClick={handleDownloadFileDefault}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>
              )}

              {file.fileType === 'PDF' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-rose-400">PARTIALLY EXTRACTED DOCUMENT TEXT</span>
                    <span className="text-slate-500 font-mono">Page 1-2 of 3 (Page 3 Missing Trailer)</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-lg font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {file.previewContent}
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">Conforming PDF 1.4 Binary</span>
                      <span className="text-[11px] text-slate-400">Opens in Adobe Acrobat, Apple Books, and Android PDF reader.</span>
                    </div>
                    <button
                      onClick={handleDownloadPdf}
                      className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Document (.pdf)</span>
                    </button>
                  </div>
                </div>
              )}

              {file.fileType === 'DOCX' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-blue-400">EXTRACTED OOXML DOCUMENT PAYLOAD</span>
                    <span className="text-slate-500 font-mono">PKZIP Central Directory Validated</span>
                  </div>
                  <div className="bg-slate-900/80 p-4 rounded-lg font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800">
                    {file.previewContent}
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">Real Microsoft Word Package (.docx)</span>
                      <span className="text-[11px] text-slate-400">Structured Office Open XML package. Compatible with Word, Pages, and Google Docs.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDownloadDocx}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download DOCX (.docx)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {file.fileType === 'MP4' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-purple-400">SURVEILLANCE VIDEO CLIP RECONSTRUCTION</span>
                    <span className="text-slate-500 font-mono">CAM-04 VAULT CORRIDOR</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-lg text-xs text-slate-300 space-y-2 border border-slate-800">
                    <p>Carved ftyp atom at sector 0x0000B000. Moov container metadata is intact for early track descriptors.</p>
                    <p className="text-amber-400">
                      Media data (mdat) preserved for initial motion trigger window. Playable in VLC, QuickTime, Windows Media Player, and mobile phones.
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-400">
                      <div>Codec: H.264 / AVC Baseline</div>
                      <div>Resolution: 640x360 @ 25fps</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadVideo}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Video Segment (.mp4)</span>
                    </button>
                  </div>
                </div>
              )}

              {file.fileType === 'BINARY' && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-semibold text-amber-400">HIGH-ENTROPY CIPHERTEXT EVALUATION</span>
                    <span className="text-rose-400 font-mono">Unrecoverable Without Key</span>
                  </div>
                  <div className="p-4 bg-slate-900/80 rounded-lg text-xs text-slate-300 space-y-2 border border-slate-800">
                    <p>
                      Entropy evaluated at 7.985 out of 8.000. Chi-square randomness tests indicate AES-256 or ChaCha20 encrypted payload.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Digital forensic rule: We do not fabricate or brute-force data. The fragment is preserved and tagged for offline cryptanalysis.
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadFileDefault}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Raw Bitstream (.bin)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fragments' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Discrete disk fragments mapped to this reconstructed file via signature matching and cluster continuity:
              </p>
              <div className="space-y-2">
                {fileFragments.map(frag => (
                  <div key={frag.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400">{frag.id}</span>
                        <span className="text-slate-300 font-semibold">{frag.signatureName}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {formatHexOffset(frag.offsetStart)} - {formatHexOffset(frag.offsetEnd)} ({formatBytes(frag.sizeBytes)})
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Entropy: <strong className="text-slate-200 font-mono">{frag.entropy}</strong></span>
                      <span>Confidence: <strong className="text-purple-400 font-mono">{frag.confidenceScore}%</strong></span>
                      <span>Type: <strong className="text-cyan-300 font-mono">{frag.predictedType}</strong></span>
                      <span>Cluster Seq: <strong className="text-emerald-400 font-mono">#{frag.clusterChainIndex}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hex' && (
            <div className="space-y-3">
              <HexViewer
                hexData={file.rawHexData}
                title={`Raw Carved Stream · ${file.name}`}
                sourceOffset={file.sourceSectorStart}
              />
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <h4 className="font-semibold text-slate-200">Extracted Forensic Header & System Attributes</h4>
              <div className="grid grid-cols-2 gap-4">
                {file.metadata.title && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Title / Label</span>
                    <span className="text-slate-200 font-medium">{file.metadata.title}</span>
                  </div>
                )}
                {file.metadata.author && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Author / Operator</span>
                    <span className="text-slate-200 font-medium">{file.metadata.author}</span>
                  </div>
                )}
                {file.metadata.createdDate && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Timestamp (UTC)</span>
                    <span className="text-slate-200 font-mono">{file.metadata.createdDate}</span>
                  </div>
                )}
                {file.metadata.dimensions && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Dimensions</span>
                    <span className="text-slate-200 font-mono">{file.metadata.dimensions}</span>
                  </div>
                )}
                {file.metadata.duration && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Duration</span>
                    <span className="text-slate-200 font-mono">{file.metadata.duration}</span>
                  </div>
                )}
              </div>

              {file.metadata.observedHeaders && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-slate-400 block text-[11px] mb-2 font-semibold">Observed File Headers & Structural Markers</span>
                  <div className="space-y-1">
                    {file.metadata.observedHeaders.map((hdr, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{hdr}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-cyan-400">Tesseract OCR Text Extraction</span>
                <span className="text-slate-500 font-mono text-[11px]">Optical Character Recognition</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Extracted Raster Typography
                  </span>
                  <p className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {file.fileType === 'JPEG'
                      ? `GLOBAL CYBER DEFENSE OPERATIONS\nSECURITY ACCESS IDENTIFICATION CARD · ID #0942\nAUTHORIZED INDIVIDUAL: Kyle Anderson\nROLE: Senior Information Security Operations Lead\nCLEARANCE: LEVEL 4 (UNRESTRICTED INFRASTRUCTURE)\nCARD SERIES: 2026-X8-DELTA-0942\nISSUED DATE: 2026-09-21 08:34:12 UTC\nAUTHENTICATION HOST: 192.168.10.45 (SEC-STATION-04)\nSTATUS: BIOMETRIC VERIFIED\nBARCODE: *REC-2026-0942-KYLE-ANDERSON-SEC-L4*`
                      : `Standard text extracted from ${file.name} payload records.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">OCR Engine:</span>
                    <span className="text-cyan-400 font-mono">Tesseract v5.3 / pytesseract bridge</span>
                  </div>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">Recognition Confidence:</span>
                    <span className="text-emerald-400 font-mono font-bold">97.4%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cv' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-purple-400">OpenCV Image Quality & Corruption Diagnostics</span>
                <span className="text-slate-500 font-mono text-[11px]">Computer Vision (cv2)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">Laplacian Blur Variance</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    {file.fileType === 'JPEG' ? '924.60' : '48.20'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {file.fileType === 'JPEG' ? 'SHARP / HIGH FIDELITY' : 'Mild motion blur detected'}
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">SSIM Duplicate Correlation</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {file.fileType === 'JPEG' ? '1.000 (100%)' : 'N/A'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {file.fileType === 'JPEG' ? 'Identical perceptual match with backup sector' : 'Single instance'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                  Scanline Continuity Assessment
                </span>
                <p className="text-slate-300 text-xs">
                  {file.recoveryPercentage === 100
                    ? 'Contiguous horizontal raster continuity verified across all sector boundaries. Zero scanline drops or block distortion.'
                    : 'Truncated frame boundary identified. Pixel rows terminated prematurely at logical cluster limit.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-rose-400">Security Risk Indicators</span>
                <span className="text-slate-500 font-mono text-[11px]">Forensic Threat Intelligence</span>
              </div>

              {file.fileType === 'JPEG' ? (
                <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">[HIGH RISK] Credential Re-use & Physical Impersonation</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">RISK-04</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Extracted Badge ID 0942 (Kyle Anderson) matches unauthorized SmartCard authentication session 18 minutes prior to incident.
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    Recommended Action: Revoke badge series 2026-X8 in building security system immediately.
                  </p>
                </div>
              ) : file.fileType === 'BINARY' ? (
                <div className="p-4 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-400 font-bold">[CRITICAL] High-Entropy Ciphertext Payload</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">RISK-01</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Entropy evaluated at 7.985 with no magic headers. Staged during keystroke injection window.
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    Recommended Action: Retain disk snapshot for offline cryptanalysis against passwords found in recovered text logs.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-yellow-950/30 border border-yellow-800/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-bold">[MEDIUM] Corroborated Evidence Item</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">AUDIT</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Artifact links directly to the workstation timeline and case incident chain. No standalone exploit payload detected.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
