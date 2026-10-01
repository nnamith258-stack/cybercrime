import React from "react";
import { Terminal, Shield, GitFork, ArrowUpRight, CheckCircle2, Activity, Database, Sparkles } from "lucide-react";

export default function ProductSection({ onGetStarted = () => {} }) {
  return (
    <section id="product" className="w-full py-24 sm:py-32 scroll-mt-12 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-sky-400 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>03 — PRODUCT COMPOSITION</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-white leading-[1.1]">
              A unified forensic <span className="font-semibold text-sky-400">command console.</span>
            </h2>
            <p className="mt-3 text-base font-sans text-slate-300/80 max-w-xl">
              One single pane of glass transitioning investigators from raw unallocated byte recovery to decision-ready case intelligence.
            </p>
          </div>

          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 text-xs font-mono text-sky-200 hover:text-white px-4 py-2.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 transition-all cursor-pointer shrink-0 font-medium shadow-sm"
          >
            <span>Launch Live Interactive Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
          </button>
        </div>

        {/* Dark Azure Forensic Command Console Preview */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#080D1A]/95 p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.9)] relative overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-40 bg-sky-500/10 blur-[90px] pointer-events-none" />

          {/* Forensic Window Header */}
          <div className="flex items-center justify-between pb-6 border-b border-white/[0.06] font-mono text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
              <span className="text-white font-semibold">SESSION: INCIDENT_2026_09_25_SERVER4</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-slate-300 font-medium">
              <span>SECTORS: 38 CARVED</span>
              <span>ORPHANS: 17 RESOLVED</span>
              <span className="text-sky-400">100% DETERMINISTIC</span>
            </div>
          </div>

          {/* Conceptual 4-Quadrant Visual Layout */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column 1: Carving Telemetry */}
            <div className="p-4 rounded-xl bg-[#050811]/90 border border-white/[0.06]">
              <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>01. SECTOR CARVER</span>
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1">
                <div>[0x0000] JPEG SOI Header</div>
                <div>[0x0800] Syslog Auth Chunk</div>
                <div>[0x0C00] Orphan Fragment (No Sig)</div>
                <div className="text-sky-300 font-semibold">&rarr; AI Classified: DOC</div>
              </div>
            </div>

            {/* Column 2: Reconstructed Artifacts */}
            <div className="p-4 rounded-xl bg-[#050811]/90 border border-white/[0.06]">
              <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>02. ARTIFACT CLUSTER</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-sans text-white font-medium">Server-4 SSH Auth Log</div>
                  <div className="text-[10px] font-mono text-slate-400">88% Confidence • 80% Complete</div>
                </div>
                <div>
                  <div className="text-xs font-sans text-white font-medium">Archive Key Manifest</div>
                  <div className="text-[10px] font-mono text-slate-400">92% Confidence • backup.enc</div>
                </div>
              </div>
            </div>

            {/* Column 3: Relationship Graph */}
            <div className="p-4 rounded-xl bg-[#050811]/90 border border-white/[0.06]">
              <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5" />
                <span>03. CASE GRAPH</span>
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1.5">
                <div className="text-[11px]">art_03 &rarr; art_04</div>
                <div className="text-sky-400 text-[10px] font-medium">[temporal_proximity] 88%</div>
                <div className="text-[11px]">art_05 &rarr; art_06</div>
                <div className="text-sky-400 text-[10px] font-medium">[corroborates] 92%</div>
              </div>
            </div>

            {/* Column 4: RAG Q&A Output */}
            <div className="p-4 rounded-xl bg-[#050811]/90 border border-white/[0.06]">
              <div className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>04. CITED INQUIRY</span>
              </div>
              <p className="text-xs font-sans text-slate-200 leading-relaxed italic">
                "Exfiltration confirmed at 02:42 AM via staging IP 198.51.100.44."
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-500/40 font-medium">
                  art_03
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950/80 text-sky-300 border border-sky-500/40 font-medium">
                  art_05
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
