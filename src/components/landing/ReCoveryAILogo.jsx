import React from "react";

export default function ReCoveryAILogo({ className = "" }) {
  return (
    <a 
      href="#hero" 
      className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}
      aria-label="ReCoveryAI Home"
    >
      {/* Connected evidence fragments icon with glowing cyan/azure node */}
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-300 group-hover:text-sky-400 transition-colors duration-300"
      >
        {/* Hairline connecting filaments */}
        <line x1="6" y1="6" x2="18" y2="8" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="6" y1="6" x2="12" y2="18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="18" y1="8" x2="12" y2="18" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
        
        {/* Node A (Fragment) */}
        <circle cx="6" cy="6" r="2.5" fill="currentColor" />
        {/* Node B (Corroborated) */}
        <circle cx="18" cy="8" r="2.2" fill="currentColor" fillOpacity="0.75" />
        {/* Node C (Synthesized with vibrant azure core) */}
        <circle cx="12" cy="18" r="2.8" fill="#38bdf8" />
      </svg>

      <span className="text-sm font-sans font-semibold tracking-tight text-white group-hover:text-sky-300 transition-colors duration-300">
        ReCoveryAI
      </span>
    </a>
  );
}
