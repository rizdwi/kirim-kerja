'use client';

import React from 'react';
import { Plus, CheckCircle2, ShieldAlert } from 'lucide-react';
import { EmailSettings, UserProfile } from '@/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  profile: UserProfile;
  emailSettings: EmailSettings;
  onOpenAddJob: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  profile,
  emailSettings,
  onOpenAddJob,
}) => {
  return (
    <header className="bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sticky top-0 z-30">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Gmail Status Badge */}
        {emailSettings.gmailConnected ? (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 dark:bg-success-900/30 text-success-700 dark:text-success-300 text-xs font-medium border border-success-200 dark:border-success-800">
            <CheckCircle2 size={14} className="text-success-600 dark:text-success-400" />
            <span>Gmail: {emailSettings.gmailEmail}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-50 dark:bg-warning-900/30 text-warning-700 dark:text-warning-300 text-xs font-medium border border-warning-200 dark:border-warning-800">
            <ShieldAlert size={14} className="text-warning-600" />
            <span>Gmail Belum Terhubung</span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          onClick={onOpenAddJob}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 min-h-[44px]"
        >
          <Plus size={16} />
          <span>Tambah Lowongan</span>
        </button>

        {/* User initials */}
        <div
          title={profile.fullName || 'Profil Pelamar'}
          className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-sm border border-brand-200 dark:border-brand-700 shrink-0 select-none"
        >
          {profile.fullName ? profile.fullName.slice(0, 2).toUpperCase() : 'KK'}
        </div>
      </div>
    </header>
  );
};
