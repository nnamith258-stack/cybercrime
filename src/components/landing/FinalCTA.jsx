import React from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA({ isAuthenticated = false, onGetStarted = () => {} }) {
  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-[#091b38] via-[#0d2754] to-[#091834] border border-sky-500/30 p-10 sm:p-16 text-center relative overflow-hidden shadow-[0_0_80px_rgba(56,189,248,0.22)]">
        {/* Soft radial blue illumination */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(56,189,248,0.18),transparent_65%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono text-sky-300 bg-sky-950/70 border border-sky-500/40 mb-6 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>RECONSTRUCTION INITIALIZED</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sans font-normal tracking-tight text-white leading-[1.15]">
            Reconstruct the story your data was <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-400">trying to tell.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg font-sans font-light text-slate-300/80 max-w-xl mx-auto leading-relaxed">
            Upload raw disk images or inspect pre-loaded forensic test sectors. Deterministic carving meets autonomous case intelligence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 text-sm sm:text-base font-sans font-semibold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-8 py-3.5 rounded-full transition-all duration-300 cursor-pointer shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/40"
            >
              <span>Start an Investigation</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300 ease-out" />
            </button>

            <button
              onClick={onGetStarted}
              className="group inline-flex items-center gap-2 text-sm font-mono text-white hover:text-sky-200 px-6 py-3.5 rounded-full border border-white/20 hover:border-sky-500/50 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-xs"
            >
              <span>Explore Demo</span>
              <span className="text-sky-400 group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
