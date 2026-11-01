'use client';

import React from 'react';
import {
  Briefcase,
  FileText,
  Clock,
  Send,
  Settings,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { EmailSettings } from '@/types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  waitingCount: number;
  emailSettings: EmailSettings;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenLanding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  waitingCount,
  emailSettings,
  darkMode,
  onToggleDarkMode,
  onOpenLanding,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Briefcase },
    { id: 'jobs', label: 'Lowongan', icon: Send },
    {
      id: 'queue',
      label: 'Antrean Lamaran',
      icon: Clock,
      badge: waitingCount > 0 ? waitingCount : undefined,
    },
    { id: 'tracking', label: 'Lamaran Saya', icon: FileText },
    { id: 'documents', label: 'CV & Berkas', icon: FileText },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#161B22] flex flex-col h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
        >
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            K
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white text-base tracking-tight block">
              KirimKerja
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-normal">
              Asisten Semi-Otomatis
            </span>
          </div>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-400'}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-warning-50 text-warning-700 border border-warning-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section: Quota meter and controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-3.5">
        {/* Daily Quota Card */}
        <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-lg border border-gray-200/80 dark:border-gray-700/60">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1.5">
            <span>Batas Harian Email</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {emailSettings.dailySentCount} / {emailSettings.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                emailSettings.dailySentCount >= emailSettings.dailyLimit
                  ? 'bg-danger-600'
                  : 'bg-brand-600'
              }`}
              style={{
                width: `${Math.min(100, (emailSettings.dailySentCount / emailSettings.dailyLimit) * 100)}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            Satu email per lowongan, perlindungan reputasi Gmail.
          </p>
        </div>

        {/* Action buttons: Theme toggle & Landing Page */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
          >
            {darkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
          </button>

          <button
            onClick={onOpenLanding}
            className="text-xs text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-300 flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 min-h-[44px]"
            title="Buka Halaman Info Publik"
          >
            <span>Panduan</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
};
