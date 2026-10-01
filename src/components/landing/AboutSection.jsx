import React from "react";
import { CheckCircle2, ShieldCheck, Flag } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="w-full py-24 sm:py-32 scroll-mt-12 border-t border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 text-xs font-mono tracking-widest text-sky-400 uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>05 — MISSION & CONSTRAINTS</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-sans font-light tracking-tight text-white leading-relaxed">
          "ReCoveryAI is an AI-assisted digital evidence investigation platform designed to recover fragmented artifacts, reconstruct relationships, and help investigators explore connected evidence."
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#080D1A]/85 border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <h4 className="font-sans text-sm uppercase tracking-wider text-white font-semibold">
                Controlled Forensic Demonstration
              </h4>
            </div>
            <p className="text-sm font-sans font-normal text-slate-300/80 leading-relaxed">
              Developed for the CalmStacks 24-Hour Hackathon, ReCoveryAI operates on synthetic damaged storage images to demonstrably test carving accuracy, orphan classification, and RAG grounding.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#080D1A]/85 border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-sky-400" />
              <h4 className="font-sans text-sm uppercase tracking-wider text-white font-semibold">
                Ethical Non-Goals
              </h4>
            </div>
            <p className="text-sm font-sans font-normal text-slate-300/80 leading-relaxed">
              ReCoveryAI does not claim raw physical disk forensic certification (such as certified NTFS/EXT4 hardware parsers). It demonstrates the reasoning layer that turns fragmented data into investigative clarity.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
