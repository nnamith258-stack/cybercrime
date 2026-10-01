import React, { useState } from 'react';
import { ActiveTab } from '../types/forensics';
import {
  Sparkles,
  Shield,
  Menu,
  X,
  Smartphone,
  Tablet,
  Laptop,
  Maximize2,
  Layers,
  FileCheck,
  FolderOpen,
  GitBranch,
  Wrench,
  FileText,
  Scissors,
  Sun,
  Moon,
  Database,
  User,
  LogIn,
  LogOut,
  Lock
} from 'lucide-react';

export type DeviceViewMode = 'auto' | 'laptop' | 'tablet' | 'mobile';

interface Props {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  onLoadDemo: () => void;
  deviceMode?: DeviceViewMode;
  onDeviceModeChange?: (mode: DeviceViewMode) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  userEmail?: string | null;
  onOpenAuth?: () => void;
  onOpenSavedCases?: () => void;
  onSignOut?: () => void;
}

export const TopBar: React.FC<Props> = ({
  activeTab,
  onNavigateTab,
  onLoadDemo,
  deviceMode = 'auto',
  onDeviceModeChange,
  theme = 'dark',
  onToggleTheme,
  userEmail,
  onOpenAuth,
  onOpenSavedCases,
  onSignOut
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'upload', label: 'Upload & Scan', icon: <FolderOpen className="w-3.5 h-3.5" /> },
    { id: 'fragments', label: 'Fragments', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'recovered', label: 'Recovered', icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: 'defragmenter', label: 'Defrag & Carve', icon: <Scissors className="w-3.5 h-3.5" />, badge: 'Form' },
    { id: 'restoration', label: 'Restoration Lab', icon: <Sparkles className="w-3.5 h-3.5" />, badge: 'AI Lab' },
    { id: 'graph', label: 'Evidence Graph', icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: 'tools', label: 'Forensic Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Audit Report', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tabId: ActiveTab) => {
    onNavigateTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* Primary Top Bar */}
      <header className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        {/* Left: Brand & Mobile Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleTabClick('dashboard')}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="p-1 sm:p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800/80 group-hover:border-cyan-500 transition-colors shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap block leading-tight">
                ReCoveryAI
              </span>
              <span className="hidden xs:inline-block text-[10px] font-mono text-slate-400 block leading-none">
                Forensics Workbench
              </span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links (Large Laptop / Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-cyan-300 font-bold bg-cyan-950/70 border border-cyan-800 shadow-sm shadow-cyan-950/50'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right: Database, Auth, Theme Toggle, Device Viewport Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cloud Database / Saved Cases Button */}
          {onOpenSavedCases && (
            <button
              onClick={onOpenSavedCases}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-800 hover:border-cyan-600 text-cyan-300 hover:text-cyan-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shadow-cyan-950"
              title="Open Evidence Cases Database (Cloud Firestore)"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Database</span>
            </button>
          )}

          {/* Authentication Status Button */}
          {userEmail ? (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 sm:p-1">
              <button
                onClick={onOpenSavedCases}
                className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-emerald-400 font-mono truncate max-w-[120px] sm:max-w-[150px] cursor-pointer"
                title={`Signed in as ${userEmail}`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">{userEmail.split('@')[0]}</span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-amber-950/70 border border-amber-800/80 hover:border-amber-600 text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Unauthorized — Click to Sign In (Demo Mode Active)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Demo (Sign In)</span>
              </button>
            )
          )}

          {/* Light / Dark Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle light or dark theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="hidden xl:inline text-[11px]">Dark</span>
                </>
              )}
            </button>
          )}

          {/* Device Size Switcher Control */}
          {onDeviceModeChange && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <button
                onClick={() => onDeviceModeChange('auto')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  deviceMode === 'auto'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Auto Responsive: Scales naturally to fit your screen width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">Auto</span>
              </button>

              <button
                onClick={() => onDeviceModeChange('laptop')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  deviceMode === 'laptop'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Laptop View (1200px constraint)"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">Laptop</span>
              </button>

              <button
                onClick={() => onDeviceModeChange('tablet')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  deviceMode === 'tablet'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Tablet View (768px constraint / iPad form factor)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">Tablet</span>
              </button>

              <button
                onClick={() => onDeviceModeChange('mobile')}
                className={`p-1 sm:px-2 sm:py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] cursor-pointer ${
                  deviceMode === 'mobile'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Mobile Phone View (390px constraint / Smartphone form factor)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden 2xl:inline">Phone</span>
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Horizontal Scrollable Tab Strip for Tablet & Phone (Quick Thumb Navigation) */}
      <div className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-t border-slate-900 bg-slate-950/80 text-xs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/98 border-b border-slate-800 p-4 space-y-3 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-mono text-cyan-400 uppercase font-semibold">Forensic Navigation</span>
            <div className="flex items-center gap-2">
              {onOpenSavedCases && (
                <button
                  onClick={() => {
                    onOpenSavedCases();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-950 border border-cyan-800 text-xs text-cyan-300"
                >
                  <Database className="w-3 h-3" />
                  <span>Database</span>
                </button>
              )}

              {onToggleTheme && (
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* User Auth Banner in Drawer */}
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            {userEmail ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-slate-200 truncate">{userEmail}</span>
                </div>
                {onSignOut && (
                  <button
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-400 hover:text-red-300 text-[11px] underline"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Local Mode
                </span>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setMobileMenuOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px]"
                  >
                    Sign In to Save
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`p-2.5 rounded-xl text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-850 hover:text-slate-100 border border-slate-800/80'
                }`}
              >
                <div className={`p-1 rounded-md ${activeTab === tab.id ? 'bg-cyan-900/60 text-cyan-300' : 'bg-slate-950 text-slate-400'}`}>
                  {tab.icon}
                </div>
                <div className="truncate">
                  <span className="block truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] font-mono text-emerald-400">{tab.badge}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                onLoadDemo();
                setMobileMenuOpen(false);
              }}
              className="text-slate-300 hover:text-cyan-400 flex items-center gap-1.5 py-1 px-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reload Demo Case</span>
            </button>

            <span className="text-[10px] font-mono text-slate-500">
              Read-Only Certified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
