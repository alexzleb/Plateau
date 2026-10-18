import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ArrowLeft, ShieldCheck, Music2 } from 'lucide-react';
import { api } from '../services/api';
import { PyramidLogo } from '../components/PyramidLogo';

interface AdminLoginViewProps {
  onSuccess: () => void;
  onExit: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onSuccess, onExit }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMsg('Please enter the admin passcode');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.adminLogin(passcode.trim());
      if (res.success) {
        onSuccess();
      } else {
        setErrorMsg('Invalid passcode');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid admin passcode';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#0d0e12] text-white flex flex-col justify-between p-6 select-none relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-300 hover:text-white transition-colors border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Music Player</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Restricted Portal</span>
        </div>
      </div>

      {/* Center Passcode Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-10">
        <div className="bg-[#16181f]/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative">
          {/* Logo badge with PyramidLogo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neutral-900 to-black p-3 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/20 border border-amber-500/30">
            <PyramidLogo className="w-full h-full" />
          </div>

          <div className="text-center mb-8">
            <div className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-mono mb-1">
              PRZM STUDIO
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
              Plateau · Creator Portal
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Enter your creator passcode to manage the Plateau music catalog and PRZM studio masters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Admin Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder="Enter passcode..."
                  className="w-full bg-black/40 border border-white/10 focus:border-amber-400 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                  tabIndex={-1}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Unlock Content Manager</span>
                </>
              )}
            </button>
          </form>

          {/* Helper hint */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <p className="text-[11px] text-neutral-500">
              Default passcode: <code className="text-amber-400/90 font-mono bg-black/40 px-1.5 py-0.5 rounded">admin2026</code>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-neutral-600 z-10">
        Plateau by PRZM Studio · Catalog & Master Audio Management
      </div>
    </div>
  );
};
