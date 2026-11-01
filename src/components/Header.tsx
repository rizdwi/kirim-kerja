'use client';

import React from 'react';
import { Plus, CheckCircle2, ShieldAlert, LogOut } from 'lucide-react';
import { EmailSettings, UserProfile } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  profile: UserProfile;
  emailSettings: EmailSettings;
  onOpenAddJob: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  profile,
  emailSettings,
  onOpenAddJob,
  onLogout,
}) => {
  return (
    <header className="bg-white/85 dark:bg-[#0D1117]/85 backdrop-blur-md border-b border-gray-200/80 dark:border-white/[0.07] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sticky top-0 z-30">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Gmail Status Badge */}
        {emailSettings.gmailConnected ? (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-900/25 text-success-700 dark:text-success-300 text-xs font-semibold border border-success-200/70 dark:border-success-800/60">
            <CheckCircle2 size={14} />
            <span className="max-w-[180px] truncate">{emailSettings.gmailEmail}</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-50 dark:bg-warning-900/25 text-warning-700 dark:text-warning-300 text-xs font-semibold border border-warning-200/70 dark:border-warning-800/60">
            <ShieldAlert size={14} />
            <span>Gmail belum terhubung</span>
          </div>
        )}

        {/* Primary CTA */}
        <button onClick={onOpenAddJob} className="btn-primary btn-sm sm:!min-h-[44px] sm:!text-sm sm:!px-4">
          <Plus size={16} strokeWidth={2.5} />
          <span className="hidden sm:inline">Tambah Lowongan</span>
          <span className="sm:hidden">Tambah</span>
        </button>

        {/* User initials & Logout */}
        <div className="flex items-center gap-1">
          <div
            title={profile.fullName || 'Profil Pelamar'}
            className="w-9 h-9 rounded-full bg-gradient-to-b from-brand-500/20 to-brand-500/5 border border-brand-200/70 dark:border-brand-700/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs select-none"
          >
            {profile.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'KK'}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-icon text-gray-400 hover:text-danger-500 dark:hover:text-danger-300 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
              title="Keluar dari akun"
              aria-label="Keluar dari akun"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
