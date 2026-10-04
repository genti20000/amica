import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(false);
      setErrorMessage('');
      setIsSuccess(false);
      // Auto-focus the password input
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();

    // Password is "Joni" (accepting "Joni" or case-insensitive "joni" for great UX on mobile)
    if (trimmed.toLowerCase() === 'joni') {
      setIsSuccess(true);
      setError(false);
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setError(true);
      setErrorMessage('Incorrect password. Please try again.');
      inputRef.current?.select();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#180307] via-[#120205] to-[#0A0103] border border-[#DFBE7B]/40 rounded-xl p-6 sm:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(223,190,123,0.15)] text-[#FDFBF7] overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-[#DFBE7B] blur-[6px] opacity-70" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-[#DFBE7B]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#200A0E] border border-[#DFBE7B]/30 hover:border-[#DFBE7B] flex items-center justify-center text-[#DFBE7B] hover:text-[#FFEAA7] transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center select-none mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-b from-[#321118] to-[#1A0509] border border-[#DFBE7B]/60 shadow-[0_0_20px_rgba(223,190,123,0.2)] mb-3">
            <Lock className="w-5 h-5 text-[#DFBE7B]" />
          </div>

          <span className="text-[8px] font-sans tracking-[0.34em] uppercase text-[#DFBE7B]/80 block mb-1">
            23 FRITH STREET · SOHO
          </span>
          <h2
            id="login-modal-title"
            className="font-['Cinzel',serif] text-2xl sm:text-3xl tracking-[0.24em] text-[#E8CCA0] uppercase font-light"
          >
            AMICA
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 text-[#DFBE7B]">
            <span className="w-4 h-[1px] bg-[#DFBE7B]/80" />
            <span className="font-sans text-[7.5px] tracking-[0.36em] uppercase font-medium">
              MAIN SITE ACCESS
            </span>
            <span className="w-4 h-[1px] bg-[#DFBE7B]/80" />
          </div>

          <p className="mt-3 text-xs text-[#E8CCA0]/70 font-sans tracking-wide">
            Enter the private preview password to access the full site, dining & cocktail menus.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="site-password"
              className="block text-[10px] uppercase tracking-[0.2em] font-sans font-semibold text-[#DFBE7B] mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#DFBE7B]/70">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                ref={inputRef}
                id="site-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Enter password (e.g. Joni)"
                className={`w-full bg-[#0D0204] border ${
                  error
                    ? 'border-red-500/80 focus:border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : isSuccess
                    ? 'border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'border-[#DFBE7B]/40 focus:border-[#DFBE7B] shadow-inner'
                } rounded-lg pl-10 pr-11 py-3 text-sm text-[#FDFBF7] placeholder-[#DFBE7B]/30 tracking-wider focus:outline-none transition-colors`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#DFBE7B]/70 hover:text-[#DFBE7B] transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400 animate-fadeIn">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isSuccess && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 animate-fadeIn font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Password accepted. Welcome to AMICA SOHO...</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSuccess || !password.trim()}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-[#C5A059] via-[#DFBE7B] to-[#C5A059] hover:from-[#DFBE7B] hover:via-[#FFEAA7] hover:to-[#DFBE7B] text-[#120205] font-sans font-semibold text-xs tracking-[0.22em] uppercase transition-all duration-200 cursor-pointer shadow-[0_4px_16px_rgba(197,160,89,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>{isSuccess ? 'Opening Main Site...' : 'Enter Main Site'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-[#DFBE7B]/15 text-center">
          <p className="text-[9px] text-[#DFBE7B]/50 font-sans tracking-[0.2em] uppercase">
            Authorized Staff & VIP Guest Preview Access
          </p>
        </div>
      </div>
    </div>
  );
};
