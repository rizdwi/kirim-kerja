'use client';

import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  Clock,
  FileText,
  FolderOpen,
  Settings,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { EmailSettings } from '@/types';
import { QuotaBar } from '@/components/ui';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  waitingCount: number;
  emailSettings: EmailSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLanding: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  waitingCount,
  emailSettings,
  darkMode,
  onToggleDarkMode,
  onOpenLanding,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'explore', label: 'Jelajah Lowongan', icon: Compass },
    { id: 'jobs', label: 'Lowongan Saya', icon: Briefcase },
    {
      id: 'queue',
      label: 'Antrean Lamaran',
      icon: Clock,
      badge: waitingCount > 0 ? waitingCount : undefined,
    },
    { id: 'tracking', label: 'Lamaran Saya', icon: FileText },
    { id: 'documents', label: 'CV & Berkas', icon: FolderOpen },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0D1117] flex flex-col h-screen sticky top-0 select-none">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-3 text-left rounded-xl"
          aria-label="Kembali ke beranda"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-brand-400 to-brand-600 flex items-center justify-center text-white font-extrabold text-lg shadow-card">
            K
          </div>
          <div>
            <span className="font-extrabold text-gray-900 dark:text-white text-[15px] tracking-tight block leading-none">
              KirimKerja
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-1">
              Asisten lamaran pribadimu
            </span>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav aria-label="Navigasi utama" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 min-h-[44px] group ${
                isActive
                  ? 'bg-gradient-to-r from-brand-600/[0.12] to-brand-600/[0.04] dark:from-brand-400/[0.14] dark:to-transparent text-brand-700 dark:text-brand-200 font-semibold [box-shadow:inset_2px_0_0_0_#1F5F8B] dark:[box-shadow:inset_2px_0_0_0_#4E94C4]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-gray-100 font-medium'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={`transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-110'}`}
                />
                <span>{item.label}</span>
              </span>
              {item.badge !== undefined && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-warning-500/15 text-warning-700 dark:text-warning-300 border border-warning-500/25 tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: kuota + kontrol */}
      <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] space-y-3">
        <div className="card-flat p-3.5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Kuota harian</span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              {emailSettings.dailySentCount}/{emailSettings.dailyLimit}
            </span>
          </div>
          <QuotaBar used={emailSettings.dailySentCount} limit={emailSettings.dailyLimit} />
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2 leading-snug">
            1 email per lowongan — menjaga reputasi Gmail.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            className="btn-ghost btn-sm"
          >
            {darkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            <span>{darkMode ? 'Terang' : 'Gelap'}</span>
          </button>

          <button
            onClick={onOpenLanding}
            className="btn-ghost btn-sm"
            title="Buka halaman panduan"
          >
            <span>Panduan</span>
            <ExternalLink size={13} />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-danger-ghost btn-sm"
              title="Keluar dari sesi akun"
            >
              <LogOut size={14} />
              <span>Keluar</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
