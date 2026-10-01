import React, { useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';

interface Props {
  hexData: string;
  title?: string;
  sourceOffset?: number;
}

export const HexViewer: React.FC<Props> = ({ hexData, title = 'Raw Hex Byte Stream', sourceOffset = 0 }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const lines = hexData.trim().split('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(hexData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLines = searchTerm
    ? lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()))
    : lines;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-slate-300 font-semibold">{title}</span>
          <span className="text-slate-500 text-[11px]">
            Base Offset: 0x{sourceOffset.toString(16).toUpperCase().padStart(8, '0')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search hex / ASCII..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] rounded pl-7 pr-2 py-1 focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Hex'}</span>
          </button>
        </div>
      </div>

      {/* Hex columns guide */}
      <div className="px-4 py-1.5 bg-slate-900/50 border-b border-slate-800/80 text-slate-500 text-[10px] grid grid-cols-12 gap-2 select-none">
        <span className="col-span-2">OFFSET</span>
        <span className="col-span-7">HEX DUMP (00 01 02 03 04 05 06 07 | 08 09 0A 0B 0C 0D 0E 0F)</span>
        <span className="col-span-3 text-right">ASCII DECODE</span>
      </div>

      {/* Scrollable Hex Viewport */}
      <div className="p-4 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 space-y-0.5 selection:bg-cyan-500/30">
        {filteredLines.length > 0 ? (
          filteredLines.map((line, idx) => {
            const isMatch = searchTerm && line.toLowerCase().includes(searchTerm.toLowerCase());
            return (
              <div
                key={idx}
                className={`py-0.5 px-1 rounded flex items-center justify-between transition-colors ${
                  isMatch ? 'bg-cyan-950/60 text-cyan-200' : 'hover:bg-slate-900/60'
                }`}
              >
                <span className="text-cyan-500/80 select-none mr-3">{line.slice(0, 8)}</span>
                <span className="text-slate-300 flex-1">{line.slice(10, 50)}</span>
                <span className="text-emerald-400/90 font-mono ml-3 border-l border-slate-800 pl-3">
                  {line.slice(52)}
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-6 text-slate-500">No matching byte sequences found for "{searchTerm}"</div>
        )}
      </div>
    </div>
  );
};
