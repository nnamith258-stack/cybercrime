import React, { Suspense, lazy, useState, useEffect } from "react";
import LandingHeader from "./LandingHeader";
import HeroEditorial from "./HeroEditorial";
import BottomNavigation from "./BottomNavigation";
import CapabilitiesSection from "./CapabilitiesSection";
import HowItWorksSection from "./HowItWorksSection";
import ProductSection from "./ProductSection";
import TechnologySection from "./TechnologySection";
import AboutSection from "./AboutSection";
import FinalCTA from "./FinalCTA";
import LandingFooter from "./LandingFooter";

const EvidenceScene = lazy(() => import("../three/EvidenceScene"));

export default function LandingPage({ isAuthenticated = false, onGetStarted = () => {} }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [activeCapability, setActiveCapability] = useState(null);

  // Track active section for floating bottom nav pill
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "capabilities", "how-it-works", "product", "technology", "about"];
      const scrollPosition = window.scrollY + 250;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigate = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="recoveryai-landing min-h-screen bg-[#060A12] text-[#F8FAFC] font-sans relative selection:bg-sky-500 selection:text-slate-950 overflow-x-hidden">
      {/* ============================================================== */}
      {/* Layer 1: Atmospheric Azure / Cobalt Gradient Light Nebulae     */}
      {/* (Faithfully reproducing the UnioMind reference background)     */}
      {/* ============================================================== */}
      <div className="fixed top-0 right-0 w-[75vw] h-[600px] bg-[radial-gradient(circle_at_70%_25%,rgba(37,99,235,0.32),rgba(56,189,248,0.14)_35%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed top-1/3 left-0 w-[60vw] h-[550px] bg-[radial-gradient(circle_at_20%_50%,rgba(30,64,175,0.25),rgba(14,165,233,0.08)_45%,transparent_70%)] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[65vw] h-[500px] bg-[radial-gradient(circle_at_75%_80%,rgba(29,78,216,0.22),transparent_65%)] pointer-events-none z-0" />

      {/* Layer 2: 3D Floating Metallic Azure Cubes & Scene (pointer-events-none) */}
      <Suspense fallback={<div className="fixed inset-0 pointer-events-none z-[1] bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.1),transparent_65%)]" aria-hidden="true" />}>
        <EvidenceScene activeCapability={activeCapability} />
      </Suspense>

      {/* ============================================================== */}
      {/* Layer 3: INITIAL VIEWPORT — Centered Floating Master Panel     */}
      {/* ============================================================== */}
      <div 
        id="hero" 
        className="w-full min-h-screen flex items-center justify-center p-3 sm:p-6 lg:p-10 relative z-10"
      >
        <div 
          className="w-full max-w-[1400px] min-h-[82vh] lg:h-[86vh] rounded-[28px] sm:rounded-[36px] lg:rounded-[40px] bg-[#080D1A]/85 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.95)] p-6 sm:p-10 lg:px-14 lg:py-10 flex flex-col justify-between relative overflow-hidden transition-all duration-300 after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-sky-400/40 after:to-transparent"
        >
          {/* Subtle Corner Lighting Sheen */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_65%)] pointer-events-none" />

          {/* Layer 4: HTML Typography and Controls */}
          <div className="relative z-20 w-full flex flex-col justify-between h-full">
            {/* Top Navigation with requested links: Home, Capabilities, How It Works, Product, Technology, About */}
            <LandingHeader isAuthenticated={isAuthenticated} onGetStarted={onGetStarted} />

            {/* Central Editorial Hero & Capabilities */}
            <HeroEditorial 
              isAuthenticated={isAuthenticated} 
              onCapabilityHover={setActiveCapability} 
              onGetStarted={onGetStarted}
            />

            {/* Bottom Floating Nav Pill inside Panel */}
            <div className="w-full flex justify-center pt-4 sm:pt-6">
              <BottomNavigation activeSection={activeSection} onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CORE EDITORIAL SECTIONS (STRICTLY REQUESTED SET: NO PRICING)   */}
      {/* ============================================================== */}
      <main className="relative z-10 bg-[#060A12]/80 backdrop-blur-xs">
        {/* 01. Capabilities */}
        <CapabilitiesSection />

        {/* 02. How It Works */}
        <HowItWorksSection />

        {/* 03. Product */}
        <ProductSection onGetStarted={onGetStarted} />

        {/* 04. Technology */}
        <TechnologySection />

        {/* 05. About */}
        <AboutSection />

        {/* Final CTA */}
        <FinalCTA isAuthenticated={isAuthenticated} onGetStarted={onGetStarted} />
      </main>

      {/* Dark Footer */}
      <LandingFooter />
    </div>
  );
}
