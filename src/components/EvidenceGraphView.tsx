import React, { useState, useRef, useMemo } from 'react';
import { ForensicScanResult, ReconstructedFile, RiskIndicator, ExtractedEntity, Fragment } from '../types/forensics';
import { ZoomIn, ZoomOut, RotateCcw, Filter, AlertTriangle, ShieldAlert, Cpu, ArrowRight, Layers, FileCheck, User, Key, Server } from 'lucide-react';

interface Props {
  scanResult: ForensicScanResult;
  onSelectFile: (file: ReconstructedFile) => void;
}

interface Graph4TierNode {
  id: string;
  tier: 'fragment' | 'file' | 'entity' | 'risk';
  label: string;
  sublabel: string;
  x: number;
  y: number;
  color: string;
  severity?: string;
  dataRef?: any;
}

interface Graph4TierLink {
  id: string;
  source: string;
  target: string;
  label: string;
  tierTransition: 'frag_to_file' | 'file_to_entity' | 'entity_to_risk' | 'file_to_risk';
  stroke: string;
}

export const EvidenceGraphView: React.FC<Props> = ({ scanResult, onSelectFile }) => {
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 30, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('RISK-01');
  const [activeTierFilter, setActiveTierFilter] = useState<'all' | 'risk_pathways' | 'files_entities'>('all');

  const containerRef = useRef<HTMLDivElement>(null);

  // Generate 4-Tier Node and Link Coordinates
  const { nodes, links } = useMemo(() => {
    const nList: Graph4TierNode[] = [];
    const lList: Graph4TierLink[] = [];

    // Column positions (X coordinates for the 4 tiers)
    const colFragmentsX = 80;
    const colFilesX = 360;
    const colEntitiesX = 660;
    const colRisksX = 960;

    // 1. TIER 1: KEY FRAGMENTS
    const frags = scanResult.fragments.slice(0, 6);
    frags.forEach((frag, idx) => {
      const y = 80 + idx * 75;
      nList.push({
        id: frag.id,
        tier: 'fragment',
        label: frag.id,
        sublabel: `${frag.predictedType} · H: ${frag.entropy}`,
        x: colFragmentsX,
        y: y,
        color: '#06b6d4',
        dataRef: frag
      });
    });

    // 2. TIER 2: RECONSTRUCTED FILES
    const files = scanResult.reconstructedFiles;
    files.forEach((file, idx) => {
      const y = 70 + idx * 68;
      const colorMap: Record<string, string> = {
        JPEG: '#38bdf8',
        PDF: '#ef4444',
        TXT: '#10b981',
        DOCX: '#3b82f6',
        MP4: '#a855f7',
        BINARY: '#f59e0b'
      };

      nList.push({
        id: file.id,
        tier: 'file',
        label: file.name,
        sublabel: `${file.fileType} · ${file.recoveryPercentage}% Rec`,
        x: colFilesX,
        y: y,
        color: colorMap[file.fileType] || '#94a3b8',
        dataRef: file
      });
    });

    // Connect Tier 1 (Fragments) ──► Tier 2 (Files)
    // FRAG-001, FRAG-002, FRAG-003 -> FILE-REC-01
    lList.push({ id: 'L-F1-FILE1', source: 'FRAG-001', target: 'FILE-REC-01', label: 'header', tierTransition: 'frag_to_file', stroke: '#06b6d4' });
    lList.push({ id: 'L-F2-FILE1', source: 'FRAG-002', target: 'FILE-REC-01', label: 'body scan', tierTransition: 'frag_to_file', stroke: '#06b6d4' });
    lList.push({ id: 'L-F3-FILE1', source: 'FRAG-003', target: 'FILE-REC-01', label: 'eoi footer', tierTransition: 'frag_to_file', stroke: '#06b6d4' });
    // FRAG-004 -> FILE-REC-02
    lList.push({ id: 'L-F4-FILE2', source: 'FRAG-004', target: 'FILE-REC-02', label: 'pdf stream', tierTransition: 'frag_to_file', stroke: '#ef4444' });
    // FRAG-006 -> FILE-REC-03
    lList.push({ id: 'L-F6-FILE3', source: 'FRAG-006', target: 'FILE-REC-03', label: 'syslog text', tierTransition: 'frag_to_file', stroke: '#10b981' });

    // 3. TIER 3: EXTRACTED ENTITIES
    const entities = scanResult.entities;
    entities.forEach((ent, idx) => {
      const y = 80 + idx * 72;
      nList.push({
        id: ent.id,
        tier: 'entity',
        label: ent.value,
        sublabel: `${ent.type} (${ent.confidence}%)`,
        x: colEntitiesX,
        y: y,
        color: '#eab308',
        dataRef: ent
      });
    });

    // Connect Tier 2 (Files) ──► Tier 3 (Entities)
    lList.push({ id: 'L-FILE1-ENT1', source: 'FILE-REC-01', target: 'ENT-01', label: 'OCR: Person', tierTransition: 'file_to_entity', stroke: '#eab308' });
    lList.push({ id: 'L-FILE1-ENT2', source: 'FILE-REC-01', target: 'ENT-02', label: 'OCR: Badge ID', tierTransition: 'file_to_entity', stroke: '#eab308' });
    lList.push({ id: 'L-FILE3-ENT3', source: 'FILE-REC-03', target: 'ENT-03', label: 'parsed IP host', tierTransition: 'file_to_entity', stroke: '#eab308' });
    lList.push({ id: 'L-FILE2-ENT4', source: 'FILE-REC-02', target: 'ENT-04', label: 'endpoint path', tierTransition: 'file_to_entity', stroke: '#eab308' });
    lList.push({ id: 'L-FILE6-ENT5', source: 'FILE-REC-06', target: 'ENT-05', label: 'identical hash', tierTransition: 'file_to_entity', stroke: '#eab308' });
    lList.push({ id: 'L-FILE3-ENT6', source: 'FILE-REC-03', target: 'ENT-06', label: 'unlink timestamp', tierTransition: 'file_to_entity', stroke: '#eab308' });

    // 4. TIER 4: RISK INDICATORS
    const risks = scanResult.riskIndicators;
    risks.forEach((risk, idx) => {
      const y = 90 + idx * 95;
      const severityColor =
        risk.severity === 'CRITICAL' ? '#f43f5e' :
        risk.severity === 'HIGH' ? '#f97316' :
        risk.severity === 'MEDIUM' ? '#eab308' : '#38bdf8';

      nList.push({
        id: risk.id,
        tier: 'risk',
        label: risk.title,
        sublabel: `[${risk.severity}] · ${risk.category}`,
        x: colRisksX,
        y: y,
        color: severityColor,
        severity: risk.severity,
        dataRef: risk
      });
    });

    // Connect Tier 3 (Entities) or Tier 2 (Files) ──► Tier 4 (Risk Indicators)
    // ENT-04 -> RISK-01 (Encrypted payload at Workstation 12-West)
    lList.push({ id: 'L-ENT4-RISK1', source: 'ENT-04', target: 'RISK-01', label: 'staged on host', tierTransition: 'entity_to_risk', stroke: '#f43f5e' });
    // ENT-06 -> RISK-02 (Timestamp linked to deletion)
    lList.push({ id: 'L-ENT6-RISK2', source: 'ENT-06', target: 'RISK-02', label: 'deletion time', tierTransition: 'entity_to_risk', stroke: '#f97316' });
    // FILE-REC-04 -> RISK-03 (Surveillance truncation)
    lList.push({ id: 'L-FILE4-RISK3', source: 'FILE-REC-04', target: 'RISK-03', label: 'missing mdat', tierTransition: 'file_to_risk', stroke: '#eab308' });
    // ENT-02 -> RISK-04 (Badge ID impersonation risk)
    lList.push({ id: 'L-ENT2-RISK4', source: 'ENT-02', target: 'RISK-04', label: 'impersonation', tierTransition: 'entity_to_risk', stroke: '#f97316' });

    return { nodes: nList, links: lList };
  }, [scanResult]);

  // Filter nodes if needed
  const visibleNodes = useMemo(() => {
    if (activeTierFilter === 'risk_pathways') {
      return nodes.filter(n => n.tier === 'risk' || n.tier === 'entity' || n.id === 'FILE-REC-01' || n.id === 'FILE-REC-07');
    }
    if (activeTierFilter === 'files_entities') {
      return nodes.filter(n => n.tier === 'file' || n.tier === 'entity');
    }
    return nodes;
  }, [nodes, activeTierFilter]);

  const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
  const visibleLinks = links.filter(l => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target));

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="space-y-4">
      {/* Topology Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              4-Tier Evidentiary Causality Graph
            </h2>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-purple-400 font-mono">
              Fragments ──► Reconstructed Files ──► Extracted Entities ──► Risk Indicators
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive structural correlation linking raw storage sectors to assembled evidence, OCR/Syslog entities, and cyber risk flags.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Segmented Tier filter */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTierFilter('all')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                activeTierFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 4 Tiers
            </button>
            <button
              onClick={() => setActiveTierFilter('risk_pathways')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                activeTierFilter === 'risk_pathways'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Pathways Only
            </button>
            <button
              onClick={() => setActiveTierFilter('files_entities')}
              className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                activeTierFilter === 'files_entities'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Files & Entities
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.15))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoom(0.9);
              setPan({ x: 30, y: 30 });
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas + Telemetry Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* SVG Canvas Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-3 h-[600px] bg-slate-950 border border-slate-800 rounded-xl relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        >
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Column Header Titles for 4 Tiers */}
          <div className="absolute top-3 inset-x-0 grid grid-cols-4 px-8 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 pointer-events-none select-none z-10">
            <div className="text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>1. FRAGMENTS</span>
            </div>
            <div className="text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>2. RECONSTRUCTED FILES</span>
            </div>
            <div className="text-yellow-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>3. EXTRACTED ENTITIES</span>
            </div>
            <div className="text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>4. RISK INDICATORS</span>
            </div>
          </div>

          {/* SVG Canvas */}
          <svg className="w-full h-full">
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              <defs>
                <marker id="arrow-flow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                </marker>
                <marker id="arrow-risk" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
                </marker>
              </defs>

              {/* Links between tiers */}
              {visibleLinks.map(link => {
                const sNode = visibleNodes.find(n => n.id === link.source);
                const tNode = visibleNodes.find(n => n.id === link.target);
                if (!sNode || !tNode) return null;

                const isRiskLink = link.tierTransition === 'entity_to_risk' || link.tierTransition === 'file_to_risk';
                const isConnected = selectedNodeId === link.source || selectedNodeId === link.target;
                const opacity = selectedNodeId ? (isConnected ? 1 : 0.18) : 0.75;

                // Bezier curve connector
                const dx = tNode.x - sNode.x;
                const pathData = `M ${sNode.x} ${sNode.y} C ${sNode.x + dx * 0.5} ${sNode.y}, ${tNode.x - dx * 0.5} ${tNode.y}, ${tNode.x} ${tNode.y}`;

                return (
                  <g key={link.id} className="transition-opacity">
                    <path
                      d={pathData}
                      fill="none"
                      stroke={isRiskLink ? '#f43f5e' : link.stroke}
                      strokeWidth={isConnected ? 2.5 : isRiskLink ? 1.8 : 1.2}
                      strokeDasharray={isRiskLink ? '4 3' : 'none'}
                      opacity={opacity}
                      markerEnd={isRiskLink ? 'url(#arrow-risk)' : 'url(#arrow-flow)'}
                    />
                  </g>
                );
              })}

              {/* Nodes across 4 tiers */}
              {visibleNodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isRisk = node.tier === 'risk';
                const isFile = node.tier === 'file';
                const isEntity = node.tier === 'entity';
                const isFrag = node.tier === 'fragment';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedNodeId(node.id);
                      if (node.tier === 'file' && node.dataRef) {
                        onSelectFile(node.dataRef);
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Ring animation on selected */}
                    {isSelected && (
                      <circle
                        r={isRisk ? 28 : isFile ? 24 : 18}
                        fill="none"
                        stroke={node.color}
                        strokeWidth="2"
                        className="animate-ping opacity-35"
                      />
                    )}

                    {/* Node Circle Shape */}
                    <circle
                      r={isRisk ? 22 : isFile ? 18 : 14}
                      fill="#0f172a"
                      stroke={node.color}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-transform group-hover:scale-110"
                    />

                    {/* Core pip */}
                    <circle
                      r={isRisk ? 6 : 4}
                      fill={node.color}
                      opacity={0.9}
                    />

                    {/* Label Plate Below Node */}
                    <rect
                      x="-75"
                      y={isRisk ? 26 : isFile ? 22 : 18}
                      width="150"
                      height="26"
                      rx="4"
                      fill="#030712"
                      stroke="#1e293b"
                      strokeWidth="1"
                      className="group-hover:border-slate-500"
                    />

                    {/* Text Title */}
                    <text
                      x="0"
                      y={isRisk ? 38 : isFile ? 34 : 30}
                      fill="#f8fafc"
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-sans"
                    >
                      {node.label.length > 20 ? node.label.slice(0, 18) + '..' : node.label}
                    </text>

                    {/* Text Subtitle */}
                    <text
                      x="0"
                      y={isRisk ? 48 : isFile ? 44 : 40}
                      fill="#94a3b8"
                      fontSize="8"
                      textAnchor="middle"
                      className="font-mono pointer-events-none select-none"
                    >
                      {node.sublabel.length > 22 ? node.sublabel.slice(0, 20) + '..' : node.sublabel}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Canvas Bottom Legend */}
          <div className="absolute bottom-3 left-3 p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg backdrop-blur text-[11px] space-y-1 text-slate-400 pointer-events-none select-none">
            <div className="font-semibold text-slate-200 mb-1">Causality Flow</div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span>Fragments (Sectors)</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Reconstructed Files</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <span>Extracted Entities</span>
              <ArrowRight className="w-3 h-3 text-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>Risk Indicators</span>
            </div>
          </div>
        </div>

        {/* Selected Node Telemetry Drawer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Telemetry Inspector
              </span>
              {selectedNode && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  selectedNode.tier === 'risk' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  selectedNode.tier === 'entity' ? 'bg-yellow-950 text-yellow-300 border border-yellow-800' :
                  selectedNode.tier === 'file' ? 'bg-sky-950 text-sky-300 border border-sky-800' :
                  'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  Tier: {selectedNode.tier}
                </span>
              )}
            </div>

            {selectedNode ? (
              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400 uppercase tracking-wider block">Identifier</label>
                  <p className="text-sm font-bold text-slate-100 break-words mt-0.5">{selectedNode.label}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedNode.sublabel}</p>
                </div>

                {/* If selected node is a Risk Indicator */}
                {selectedNode.tier === 'risk' && selectedNode.dataRef && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Severity: {selectedNode.dataRef.severity}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedNode.dataRef.description}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[11px] font-semibold text-cyan-400 block">Recommended Action:</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedNode.dataRef.recommendedAction}
                      </p>
                    </div>
                  </div>
                )}

                {/* If selected node is an Extracted Entity */}
                {selectedNode.tier === 'entity' && selectedNode.dataRef && (
                  <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                    <div className="p-3 bg-yellow-950/30 border border-yellow-800/50 rounded-xl space-y-1">
                      <span className="text-[11px] font-semibold text-yellow-400 block">Corroborated Entity Context</span>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {selectedNode.dataRef.context}
                      </p>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Entity Confidence:</span>
                      <span className="text-emerald-400 font-mono font-bold">{selectedNode.dataRef.confidence}%</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Source Artifact:</span>
                      <span className="text-cyan-400 font-mono">{selectedNode.dataRef.sourceArtifactId}</span>
                    </div>
                  </div>
                )}

                {/* If selected node is a Reconstructed File */}
                {selectedNode.tier === 'file' && selectedNode.dataRef && (
                  <div className="space-y-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Recovery Ratio:</span>
                      <span className="text-cyan-400">{selectedNode.dataRef.recoveryPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Structural Integrity:</span>
                      <span className="text-emerald-400">{selectedNode.dataRef.integrityPercentage}%</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">AI Confidence:</span>
                      <span className="text-purple-400">{selectedNode.dataRef.aiConfidence}%</span>
                    </div>
                    <button
                      onClick={() => onSelectFile(selectedNode.dataRef)}
                      className="w-full mt-3 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-sans font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Inspect Artifact Deeply</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                Select any node on the graph canvas to inspect its 4-tier evidentiary causality trail.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
