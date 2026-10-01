/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveTab, ForensicScanResult, ReconstructedFile } from './types/forensics';
import { createEmptyScanResult, runForensicDemo } from './services/recoveryApi';
import { TopBar, DeviceViewMode } from './components/TopBar';
import { DashboardView } from './components/DashboardView';
import { UploadScanView } from './components/UploadScanView';
import { FragmentExplorerView } from './components/FragmentExplorerView';
import { RecoveredFilesView } from './components/RecoveredFilesView';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { ForensicToolsView } from './components/ForensicToolsView';
import { AnalysisReportView } from './components/AnalysisReportView';
import { FragmentedImageDefragView } from './components/FragmentedImageDefragView';
import { ImageRestorationLabView } from './components/ImageRestorationLabView';
import { FileDetailsModal } from './components/FileDetailsModal';
import { SavedCasesModal } from './components/SavedCasesModal';
import LandingPage from './components/landing/LandingPage';
import {
  auth,
  onAuthStateChanged,
  logOut,
  testFirestoreConnection
} from './services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  Shield,
  CheckCircle2,
  Laptop,
  Tablet,
  Smartphone,
  Database,
  User,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [hasEnteredWorkspace, setHasEnteredWorkspace] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [deviceMode, setDeviceMode] = useState<DeviceViewMode>('auto');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [scanResult, setScanResult] = useState<ForensicScanResult>(() => createEmptyScanResult());
  const [selectedFile, setSelectedFile] = useState<ReconstructedFile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication & Database State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [savedCasesModalOpen, setSavedCasesModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Firebase Auth listener and verify connection
  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        setUserEmail(user.email || user.displayName || 'Analyst');
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const saved = (localStorage.getItem('recoveryai_theme') || localStorage.getItem('recoveai_theme'));
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark' || !hasEnteredWorkspace) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('recoveryai_theme', theme);
  }, [theme, hasEnteredWorkspace]);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Theme`);
      return next;
    });
  };

  const handleSignOut = async () => {
    await logOut();
    setUserEmail(null);
    showToast('Signed out of investigator session. Switched to Demo Mode.');
  };

  const handleLoadDemo = async (): Promise<boolean> => {
    try {
      const result = await runForensicDemo();
      setScanResult(result);
      setActiveTab('dashboard');
      setHasEnteredWorkspace(true);
      showToast(`Sample analysis complete: ${result.reconstructedFiles.length} recovered artifact`);
      return true;
    } catch (error) {
      showToast(error instanceof Error && error.message.includes('Failed to fetch')
        ? 'Start the FastAPI backend on port 8000 to run the sample demo.'
        : error instanceof Error ? error.message : 'The sample demo could not run.');
      return false;
    }
  };

  const handleScanComplete = (result: ForensicScanResult) => {
    setScanResult(result);
    showToast(`Scan complete: ${result.reconstructedFiles.length} artifacts reconstructed`);
  };

  // Device Container Styling based on active mode
  const getDeviceContainerClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-full max-w-[400px] mx-auto px-3 sm:px-4 py-4 my-4 rounded-3xl border-2 border-slate-800 shadow-2xl bg-slate-950/95 ring-1 ring-cyan-500/20';
      case 'tablet':
        return 'w-full max-w-[780px] mx-auto px-4 sm:px-6 py-5 my-4 rounded-2xl border-2 border-slate-800 shadow-2xl bg-slate-950/95 ring-1 ring-cyan-500/20';
      case 'laptop':
        return 'w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6';
      case 'auto':
      default:
        return 'w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6';
    }
  };

  if (!hasEnteredWorkspace) {
    return <LandingPage onGetStarted={() => setHasEnteredWorkspace(true)} isAuthenticated={Boolean(userEmail)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar with Device Size Switcher & Mobile Menu */}
      <TopBar
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onLoadDemo={handleLoadDemo}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        userEmail={userEmail}
        onOpenSavedCases={() => setSavedCasesModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Responsive Forensic Environment & Auth Status Notice Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-100">ReCoveryAI Forensic Sandbox</strong> · Certified read-only execution
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-400 font-mono text-[10px] sm:text-[11px] self-end sm:self-auto">
          {/* Local workbench status */}
          {userEmail ? (
            <button
              onClick={() => setSavedCasesModalOpen(true)}
              className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 flex items-center gap-1 cursor-pointer hover:border-emerald-600 transition-colors"
              title="Cloud Database Connected — Click to manage saved cases"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{userEmail}</span>
            </button>
          ) : (
            <span className="text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/80 flex items-center gap-1">
              <Shield className="w-3 h-3 text-cyan-400" />
              <span>Local Mode</span>
            </span>
          )}

          {deviceMode !== 'auto' && (
            <span className="text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 flex items-center gap-1">
              {deviceMode === 'mobile' && <Smartphone className="w-3 h-3 text-cyan-400" />}
              {deviceMode === 'tablet' && <Tablet className="w-3 h-3 text-cyan-400" />}
              {deviceMode === 'laptop' && <Laptop className="w-3 h-3 text-cyan-400" />}
              <span>{deviceMode.toUpperCase()} VIEW</span>
            </span>
          )}

          <span className="hidden xs:inline text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Target Unaltered
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport with Adaptive Width Container */}
      <main className={`flex-1 transition-all duration-300 ${getDeviceContainerClass()}`}>
        {/* Device preview header pill if active */}
        {deviceMode !== 'auto' && (
          <div className="mb-4 pb-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="font-mono text-cyan-300 text-[11px]">
                {deviceMode === 'mobile' ? 'Mobile Phone Simulator (400px width)' :
                 deviceMode === 'tablet' ? 'Tablet Simulator (780px width)' : 'Laptop Workstation (1240px width)'}
              </span>
            </div>
            <button
              onClick={() => setDeviceMode('auto')}
              className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 underline cursor-pointer"
            >
              Reset to Auto
            </button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            scanResult={scanResult}
            onSelectFile={setSelectedFile}
            onNavigateTab={setActiveTab}
            onLoadDemo={handleLoadDemo}
            onOpenSavedCases={() => setSavedCasesModalOpen(true)}
            userEmail={userEmail}
          />
        )}

        {activeTab === 'upload' && (
          <UploadScanView
            onScanComplete={handleScanComplete}
            onLoadDemo={handleLoadDemo}
            onNavigateTab={setActiveTab}
            userEmail={userEmail}
            onOpenSavedCases={() => setSavedCasesModalOpen(true)}
          />
        )}

        {activeTab === 'fragments' && (
          <FragmentExplorerView
            fragments={scanResult.fragments}
          />
        )}

        {activeTab === 'recovered' && (
          <RecoveredFilesView
            files={scanResult.reconstructedFiles}
            onSelectFile={setSelectedFile}
          />
        )}

        {activeTab === 'defragmenter' && (
          <FragmentedImageDefragView
            onFileRecovered={(recoveredFile) => {
              setScanResult(prev => {
                const updatedFiles = [recoveredFile, ...prev.reconstructedFiles.filter(f => f.id !== recoveredFile.id)];
                return {
                  ...prev,
                  reconstructedFiles: updatedFiles,
                  stats: {
                    ...prev.stats,
                    reconstructedFiles: updatedFiles.length,
                    fullyRecoveredFiles: updatedFiles.filter(f => f.status === 'RECOVERED').length
                  }
                };
              });
              showToast(`Recovered "${recoveredFile.name}" and formatted for download`);
            }}
            onNavigateTab={setActiveTab}
            currentFiles={scanResult.reconstructedFiles}
          />
        )}

        {activeTab === 'restoration' && (
          <ImageRestorationLabView
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'graph' && (
          <EvidenceGraphView
            scanResult={scanResult}
            onSelectFile={setSelectedFile}
          />
        )}

        {activeTab === 'tools' && (
          <ForensicToolsView
            tools={scanResult.toolsInfo}
          />
        )}

        {activeTab === 'report' && (
          <AnalysisReportView
            scanResult={scanResult}
            onSelectFile={setSelectedFile}
          />
        )}
      </main>

      {/* File Inspector Modal */}
      {selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          fragments={scanResult.fragments}
          onClose={() => setSelectedFile(null)}
          onNavigateToFile={id => {
            const target = scanResult.reconstructedFiles.find(f => f.id === id);
            if (target) setSelectedFile(target);
          }}
        />
      )}

      {/* Saved Evidence Cases Cloud Database Modal */}
      <SavedCasesModal
        isOpen={savedCasesModalOpen}
        onClose={() => setSavedCasesModalOpen(false)}
        currentScanResult={scanResult}
        onLoadCase={(loadedResult) => {
          setScanResult(loadedResult);
          showToast(`Loaded evidence case: "${loadedResult.datasetName}"`);
        }}
        userEmail={userEmail}
      />

    </div>
  );
}
