import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Key,
  CheckCircle2,
  AlertTriangle,
  X,
  User,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { signInWithGoogle, signInWithCredentials } from '../services/firebase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      onSuccess(user.email || 'Authenticated Analyst');
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(err?.message || 'Authentication failed. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both investigator email and access key/password.');
      return;
    }
    if (password.length < 6) {
      setError('Credentials must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await signInWithCredentials(email, password);
      onSuccess(user.email || email);
      onClose();
    } catch (err: any) {
      console.error('Credential auth error:', err);
      setError(err?.message || 'Sign in failed. Check your credentials or try another method.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-950/60">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100">
            Investigator Authentication
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Sign in to unlock persistent Cloud Firestore database synchronization, manage evidentiary cases, and export chain-of-custody logs.
          </p>
        </div>

        {/* Demo Mode Notice for Unauthorized Users */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unauthorized Visitor Access: Demo Mode Only</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Unauthenticated users have interactive access to the <strong>demo dataset</strong> and forensic recovery tools. Sign in with credentials to store and sync your own evidence cases to the persistent database.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-100 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer hover:border-cyan-500/50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google Account</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
          <div className="flex-1 h-px bg-slate-800" />
          <span>or with credentials</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Investigator Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="analyst@agency.gov or user@domain.com"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Password / Access Key</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-950 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{isSignUp ? 'Register Investigator Account' : 'Sign In with Credentials'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer controls */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="hover:text-cyan-400 transition-colors underline underline-offset-2"
          >
            {isSignUp ? 'Existing user? Sign In' : 'Need credentials? Register'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <span>Continue as Demo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
