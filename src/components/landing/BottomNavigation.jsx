import React from "react";

const NAV_ITEMS = [
  { id: "hero", label: "Home" },
  { id: "capabilities", label: "Capabilities" },
  { id: "how-it-works", label: "How It Works" },
  { id: "product", label: "Product" },
  { id: "technology", label: "Technology" },
  { id: "about", label: "About" }
];

export default function BottomNavigation({ activeSection = "hero", onNavigate }) {
  const handleClick = (e, id) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav 
      aria-label="Landing page sections"
      className="inline-flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap p-1 sm:gap-1.5 sm:p-1.5 rounded-full bg-[#080D1A]/90 backdrop-blur-md border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={(e) => handleClick(e, item.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 cursor-pointer ${
              isActive
                ? "bg-sky-950/80 text-sky-300 border border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.25)] font-semibold"
                : "text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
