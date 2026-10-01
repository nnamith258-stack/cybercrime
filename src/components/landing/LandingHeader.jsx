import React, { useState } from "react";
import ReCoveryAILogo from "./ReCoveryAILogo";
import { X, Mail, ArrowUpRight } from "lucide-react";

export default function LandingHeader({ isAuthenticated = false, onGetStarted = () => {} }) {
  const [showContactModal, setShowContactModal] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navLinks = [
    { label: "Home", id: "hero" },
    { label: "Capabilities", id: "capabilities" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Product", id: "product" },
    { label: "Technology", id: "technology" },
    { label: "About", id: "about" },
  ];

  return (
    <>
      <header className="w-full flex items-center justify-between py-2">
        {/* Left: Minimalist Logo */}
        <ReCoveryAILogo />

        {/* Center: Clean Modern Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-xs lg:text-sm font-sans font-medium text-slate-300 hover:text-sky-400 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right: Contact & Auth Buttons */}
        <div className="flex items-center gap-3">
          {/* Contact Pill */}
          <button
            onClick={() => setShowContactModal(true)}
            className="px-3.5 py-1.5 rounded-full text-xs font-mono text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-sky-500/40 transition-all duration-300 flex items-center gap-2 cursor-pointer group shadow-sm"
            aria-label="Open contact information"
          >
            <span>Contact</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:shadow-[0_0_8px_rgba(56,189,248,0.9)] transition-shadow duration-300" />
          </button>

          {/* Authentication Link */}
          {isAuthenticated ? (
            <button
              onClick={onGetStarted}
              className="px-4 py-1.5 rounded-full text-xs font-mono text-sky-200 hover:text-white bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 transition-all duration-300 flex items-center gap-1.5 cursor-pointer font-medium shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
            </button>
          ) : (
            <button
              onClick={onGetStarted}
              className="px-4 py-1.5 rounded-full text-xs font-mono text-slate-950 bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all duration-300 cursor-pointer font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Dark Frosted Glass Contact Modal */}
      {showContactModal && (
        <div 
          className="recoveryai-contact-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="relative w-full max-w-md p-7 rounded-2xl bg-[#080D1A] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <h4 className="text-xs font-mono tracking-widest text-slate-400 uppercase">
                  INVESTIGATIVE DISPATCH
                </h4>
              </div>
              <button 
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close contact modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm font-light text-slate-300 leading-relaxed">
                ReCoveryAI is developed for the CalmStacks 24-Hour Hackathon forensic challenge. For technical questions or validation of the recovery pipeline:
              </p>

              <div className="p-4 rounded-xl bg-[#050811] border border-sky-900/40 flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="text-xs font-mono">
                  <div className="text-slate-400 text-[10px] uppercase">DIRECT INQUIRIES</div>
                  <div className="text-sky-300 font-semibold">inquiries@recoveryai.forensics</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
