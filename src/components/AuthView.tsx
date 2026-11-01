'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile, EmailSettings } from '@/types';

interface AuthViewProps {
  onSuccess: (profile: Partial<UserProfile>, emailSettings: Partial<EmailSettings>) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = () => {
    setIsLoading(true);
    // Simulating instant Google OAuth flow
    setTimeout(() => {
      const googleEmail = email.trim() || 'pengguna.gmail@gmail.com';
      const name = fullName.trim() || 'Pengguna Baru';
      onSuccess(
        {
          fullName: name,
          email: googleEmail,
          onboardingCompleted: true,
        },
        {
          gmailConnected: true,
          gmailEmail: googleEmail,
        }
      );
      setIsLoading(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email dan password wajib diisi.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi untuk pendaftaran.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      onSuccess(
        {
          fullName: fullName.trim() || email.split('@')[0],
          email: email.trim(),
          onboardingCompleted: true,
        },
        {
          gmailConnected: email.includes('gmail'),
          gmailEmail: email.includes('gmail') ? email.trim() : '',
        }
      );
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-surface-1 dark:bg-[#0D1117] flex flex-col justify-center items-center p-4 sm:p-6 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md bg-white dark:bg-[#161B22] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            K
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            KirimKerja
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {mode === 'register'
              ? 'Daftar akun untuk mulai menyiapkan lamaran terarah'
              : 'Masuk ke akun kerja kamu'}
          </p>
        </div>

        {/* 1-Click Google Login Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 font-semibold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-sm min-h-[46px]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
            <span>Lanjutkan dengan Akun Google / Gmail</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
          <span className="bg-white dark:bg-[#161B22] px-3 text-[11px] uppercase font-bold text-gray-400 dark:text-gray-500 absolute">
            atau daftar langsung
          </span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900/30 border border-danger-200 dark:border-danger-800 text-danger-700 dark:text-danger-300 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-danger-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Direct Email/Password Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Nama Lengkap:
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap kamu"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-surface-1 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Alamat Email:
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-1 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1"
            >
              Kata Sandi:
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-1 dark:bg-gray-900/60 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-60 min-h-[44px]"
          >
            <span>{isLoading ? 'Memproses...' : mode === 'register' ? 'Daftar Sekarang' : 'Masuk ke Aplikasi'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
          {mode === 'register' ? (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                }}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline min-h-[36px] px-1"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg(null);
                }}
                className="font-bold text-brand-600 dark:text-brand-400 hover:underline min-h-[36px] px-1"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 text-center">
          <ShieldCheck size={14} className="text-success-600 shrink-0" />
          <span>Data pribadi terlindungi sesuai UU PDP No. 27/2022</span>
        </div>
      </div>
    </div>
  );
};
