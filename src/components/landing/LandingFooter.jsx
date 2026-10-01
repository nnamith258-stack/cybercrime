import React from "react";
import ReCoveryAILogo from "./ReCoveryAILogo";

export default function LandingFooter() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-white/[0.08] py-12 bg-[#04070D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <ReCoveryAILogo />
          <span className="text-xs font-mono text-white/20 hidden sm:inline">|</span>
          <span className="text-xs font-mono text-slate-400">
            &copy; 2026 ReCoveryAI • CalmStacks Hackathon Edition
          </span>
        </div>

        {/* Footer Navigation Links - Strictly matching user's requested sections */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-mono text-slate-400">
          <button onClick={() => scrollTo("capabilities")} className="hover:text-sky-400 transition-colors cursor-pointer">
            Capabilities
          </button>
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-sky-400 transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => scrollTo("product")} className="hover:text-sky-400 transition-colors cursor-pointer">
            Product
          </button>
          <button onClick={() => scrollTo("technology")} className="hover:text-sky-400 transition-colors cursor-pointer">
            Technology
          </button>
          <button onClick={() => scrollTo("about")} className="hover:text-sky-400 transition-colors cursor-pointer">
            About
          </button>
        </div>
      </div>
    </footer>
  );
}
