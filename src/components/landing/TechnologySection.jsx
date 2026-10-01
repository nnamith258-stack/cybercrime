import React from "react";
import { Terminal, Cpu, Network, Layers, Image, Database } from "lucide-react";

const TECHNOLOGIES = [
  {
    name: "Python 3.11 & FastAPI",
    category: "Core Engine & WebSocket Bus",
    detail: "Asynchronous backend executing sub-minute sector carving, Pydantic data modeling, and streaming live progress events over native WebSockets.",
    icon: Terminal
  },
  {
    name: "Claude 3.5 Sonnet",
    category: "Intelligence & Reasoning Layer",
    detail: "Classifies signature-less orphan fragments, infers complex relationship explanations between candidate pairs, and synthesizes cited answers.",
    icon: Cpu
  },
  {
    name: "NetworkX",
    category: "Graph Theory & Topology",
    detail: "Constructs and computes relational topology across artifacts, evaluating temporal proximity, same-session overlap, and corroboration edges.",
    icon: Network
  },
  {
    name: "Sentence Transformers & MiniLM",
    category: "Semantic Vector Embeddings",
    detail: "Generates 384-dimensional dense semantic embeddings for text fragments and natural-language investigative question retrieval.",
    icon: Layers
  },
  {
    name: "ImageHash (pHash)",
    category: "Perceptual Image Hashing",
    detail: "Calculates normalized Hamming distance across perceptual visual hashes to correlate damaged and duplicate images without metadata.",
    icon: Image
  },
  {
    name: "Scikit-Learn (DBSCAN)",
    category: "Clustering Algorithms",
    detail: "Assembles scattered physical storage fragments into reconstructed artifact entities using byte offset proximity and feature distance.",
    icon: Database
  }
];

export default function TechnologySection() {
  return (
    <section id="technology" className="w-full py-24 sm:py-32 scroll-mt-12 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-sky-400 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>04 — TECHNICAL FOUNDATION</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-sans font-light tracking-tight text-white max-w-2xl leading-[1.1]">
          Engineered for <span className="font-semibold text-sky-400">reproducible rigor.</span>
        </h2>
        <p className="mt-3 text-base font-sans text-slate-300/80 max-w-xl">
          Technologies strictly selected and verified within the active codebase. 13/13 backend tests passing with zero placeholder frameworks.
        </p>

        {/* 2-Column Grid with Dark Glass Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECHNOLOGIES.map((tech) => {
            const Icon = tech.icon;
            return (
              <div 
                key={tech.name} 
                className="p-6 rounded-2xl bg-[#080D1A]/85 border border-white/[0.08] hover:border-sky-500/40 hover:bg-[#0c152a] transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-sky-400 tracking-wider uppercase font-bold">
                      {tech.category}
                    </span>
                    <Icon className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <h3 className="text-xl font-sans font-semibold text-white mb-2 group-hover:text-sky-300 transition-colors">
                    {tech.name}
                  </h3>
                  
                  <p className="text-sm font-sans font-normal text-slate-300/80 leading-relaxed">
                    {tech.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
