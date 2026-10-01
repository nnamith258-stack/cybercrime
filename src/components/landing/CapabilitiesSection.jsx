import React from "react";

const CAPABILITY_ITEMS = [
  {
    number: "01",
    title: "Evidence Recovery",
    subtitle: "Deterministic Signature & Heuristic Sector Carving",
    description: "Carves raw fragments out of damaged storage images where partition tables have been destroyed. Employs PhotoRec integration with a hand-rolled magic-byte scanner as an automatic fallback."
  },
  {
    number: "02",
    title: "Artifact Reconstruction",
    subtitle: "Perceptual & Semantic Cluster Assembly",
    description: "Clusters disjointed fragments into coherent forensic artifacts using offset proximity, container headers, and embedding similarities. Computes cluster completeness percentages without fabricating data."
  },
  {
    number: "03",
    title: "Relationship Mapping",
    subtitle: "Multi-Source Corroboration Graph",
    description: "Builds a NetworkX relationship graph identifying temporal proximity, session concurrency, and cross-document references. Every edge is accompanied by an AI-inferred strength and explanation."
  },
  {
    number: "04",
    title: "AI Investigation",
    subtitle: "Cited Retrieval-Augmented Generation",
    description: "Allows investigators to interrogate the case in plain English. Queries are retrieved via cosine similarity and synthesized strictly from carved evidence with clickable artifact citation IDs."
  },
  {
    number: "05",
    title: "Confidence Analysis",
    subtitle: "Deterministic 40/20/20/20 Factor Scoring",
    description: "Evaluates completeness (40%), signature validity (20%), graph corroboration (20%), and semantic coherence (20%). The score is 100% deterministic, backed by factor-specific plain-English reasoning."
  }
];

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="w-full py-24 sm:py-32 scroll-mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-sky-400 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>01 — CAPABILITIES</span>
        </div>

        <h2 className="text-3xl sm:text-5xl md:text-6xl font-sans font-light tracking-tight text-white max-w-3xl leading-[1.1]">
          Evidence becomes <span className="font-semibold text-sky-400">intelligence.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg font-sans text-slate-300/80 max-w-2xl leading-relaxed">
          Forensic recovery often halts at listing recovered files. ReCoveryAI applies a reasoning layer across sectors to reveal the narrative encoded within fragmented evidence.
        </p>

        {/* Minimalist Editorial List with Dark Glass Dividers */}
        <div className="mt-16 border-t border-white/[0.08]">
          {CAPABILITY_ITEMS.map((item) => (
            <div 
              key={item.number}
              className="py-10 border-b border-white/[0.06] grid grid-cols-1 lg:grid-cols-[120px_1fr_1.4fr] gap-6 items-baseline group hover:bg-white/[0.02] transition-colors duration-200 px-4 -mx-4 rounded-xl"
            >
              <div className="font-mono text-sm text-sky-400 font-bold">
                {item.number}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-sans font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  {item.subtitle}
                </div>
              </div>

              <p className="text-sm font-sans font-light text-slate-300/80 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
