import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Cpu } from "lucide-react";

const CAPABILITIES = [
  { id: "recovery", label: "Evidence Recovery", detail: "Sector carving across unallocated space" },
  { id: "reconstruction", label: "Artifact Reconstruction", detail: "DBSCAN & semantic cluster assembly" },
  { id: "mapping", label: "Relationship Mapping", detail: "Corroboration & session network graph" },
  { id: "investigation", label: "AI Investigation", detail: "Natural language case interrogation" },
  { id: "confidence", label: "Confidence Analysis", detail: "Deterministic 40/20/20/20 factor scoring" },
  { id: "intelligence", label: "Case Intelligence", detail: "Forensic hypothesis corroboration" }
];

export default function HeroEditorial({ isAuthenticated = false, onCapabilityHover, onGetStarted = () => {} }) {
  const [hoveredCap, setHoveredCap] = useState(null);

  const handleMouseEnter = (id) => {
    setHoveredCap(id);
    if (onCapabilityHover) onCapabilityHover(id);
  };

  const handleMouseLeave = () => {
    setHoveredCap(null);
    if (onCapabilityHover) onCapabilityHover(null);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-12 lg:gap-16 items-center my-auto py-6">
      {/* Left: Asymmetric Hero Typography & Editorial CTAs */}
      <div className="flex flex-col justify-center">
        {/* Subtle Pill Tag with Azure Glow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium text-sky-300 bg-sky-950/60 border border-sky-500/30 mb-6 w-fit shadow-[0_0_20px_rgba(56,189,248,0.18)]">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span className="tracking-wide uppercase">AI-POWERED FORENSIC REASONING</span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="tracking-tight select-none">
          {/* Top Line: Boldest White */}
          <span className="block text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-sans font-normal text-white leading-[1.05] tracking-tight">
            RECOVERYAI —
          </span>

          {/* Line 2: Muted Slate */}
          <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-sans font-light text-slate-400 leading-[1.1] tracking-tight mt-2 sm:mt-3">
            Recover the fragments.
          </span>

          {/* Line 3: Luminous Azure Gradient */}
          <span className="block text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-sans font-light text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-300 leading-[1.1] tracking-tight mt-1 sm:mt-2">
            Reconstruct the story.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg font-sans font-light text-slate-300/80 max-w-xl leading-relaxed">
          "We don't just recover your files — we reconstruct the story your data was trying to tell." Autonomous sector carving, orphan classification, and court-admissible reasoning.
        </p>

        {/* Refined Azure Editorial CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Primary CTA */}
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2.5 text-sm sm:text-base font-sans font-semibold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-7 py-3 rounded-full transition-all duration-300 cursor-pointer shadow-[0_0_25px_rgba(56,189,248,0.35)] hover:shadow-[0_0_35px_rgba(56,189,248,0.5)]"
          >
            <span>Start an Investigation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
          </button>

          {/* Secondary Link CTA */}
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 text-sm font-mono text-slate-200 hover:text-white px-6 py-3 rounded-full border border-slate-700/80 hover:border-sky-500/50 bg-slate-900/80 hover:bg-slate-800 transition-all duration-300 cursor-pointer shadow-sm"
          >
            <span>Explore Demo</span>
            <span className="text-sky-400 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </button>
        </div>
      </div>

      {/* Right: Minimalist Capabilities List */}
      <div className="flex flex-col justify-center lg:pl-10 lg:border-l lg:border-white/[0.08]">
        {/* Section Pill */}
        <div className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-6 sm:mb-8 flex items-center gap-2">
          <span>[</span>
          <span className="text-sky-400 font-medium">CAPABILITIES</span>
          <span>]</span>
        </div>

        {/* Vertical List */}
        <ul className="space-y-4 sm:space-y-5">
          {CAPABILITIES.map((cap) => {
            const isHovered = hoveredCap === cap.id;
            return (
              <li
                key={cap.id}
                onMouseEnter={() => handleMouseEnter(cap.id)}
                onMouseLeave={handleMouseLeave}
                className="group cursor-default transition-all duration-300"
              >
                <div className="flex items-center gap-2.5 transform transition-transform duration-300 ease-out group-hover:translate-x-1.5">
                  {/* Subtle azure indicator dot appearing on hover */}
                  <span 
                    className={`inline-block w-2 h-2 rounded-full bg-sky-400 transition-all duration-300 ${
                      isHovered ? "opacity-100 scale-100 shadow-[0_0_8px_rgba(56,189,248,0.9)]" : "opacity-0 scale-50"
                    }`} 
                  />

                  {/* Capability Label */}
                  <span 
                    className={`text-base sm:text-lg font-sans transition-colors duration-300 ${
                      isHovered ? "text-white font-medium" : "text-slate-300/70 font-normal"
                    }`}
                  >
                    {cap.label}
                  </span>
                </div>

                {/* Micro detail hint */}
                <div 
                  className={`text-[11px] font-mono pl-4.5 transition-all duration-300 overflow-hidden ${
                    isHovered ? "max-h-6 opacity-100 mt-0.5 text-sky-300 font-medium" : "max-h-0 opacity-0 text-slate-500"
                  }`}
                >
                  {cap.detail}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
