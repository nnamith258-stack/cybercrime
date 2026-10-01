import React from "react";
import { HardDrive, Cpu, GitFork, MessageSquareQuote } from "lucide-react";

const STEPS = [
  {
    step: "01",
    phase: "Recover",
    headline: "Sector-Level Carving",
    summary: "PhotoRec & heuristic scanners carve raw byte sectors from corrupted images, isolating intact fragments and unlabeled orphans.",
    icon: HardDrive
  },
  {
    step: "02",
    phase: "Reconstruct",
    headline: "AI Cluster Assembly",
    summary: "Claude AI classifies orphan fragments. Embeddings and DBSCAN cluster fragments into coherent forensic artifacts with completeness metrics.",
    icon: Cpu
  },
  {
    step: "03",
    phase: "Connect",
    headline: "Corroboration Graph",
    summary: "Pre-filtering isolates candidate pairs. NetworkX generates relationship edges detailing same-session, temporal, and reference links.",
    icon: GitFork
  },
  {
    step: "04",
    phase: "Investigate",
    headline: "Cited Case Interrogation",
    summary: "Investigators ask unscripted questions in plain English, receiving synthesized answers strictly grounded in cited artifacts.",
    icon: MessageSquareQuote
  }
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-24 sm:py-32 scroll-mt-12 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-sky-400 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>02 — HOW IT WORKS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tight text-white max-w-3xl leading-[1.1]">
          The autonomous <span className="font-semibold text-sky-400">forensic loop.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-sans text-slate-300/80 max-w-2xl leading-relaxed">
          From unallocated corrupted bytes to corroborated evidentiary reasoning in four deterministic stages.
        </p>

        {/* 4 Cards Grid with Dark Frosted Glass & Sky Blue Glows */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.step} 
                className="p-6 rounded-2xl bg-[#080D1A]/85 border border-white/[0.08] hover:border-sky-500/40 hover:bg-[#0c152a] transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-mono text-sky-300 font-bold bg-sky-950/70 px-2.5 py-0.5 rounded-full border border-sky-500/40">
                      PHASE {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-sans font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors">
                    {item.headline}
                  </h3>

                  <p className="text-sm font-sans font-light text-slate-300/80 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  {item.phase} Stage
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
