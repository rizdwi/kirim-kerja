'use client';

import React from 'react';
import { LayoutDashboard, Compass, Briefcase, Clock, Menu } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  waitingCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  waitingCount,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'explore', label: 'Jelajah', icon: Compass },
    { id: 'jobs', label: 'Lowongan', icon: Briefcase },
    {
      id: 'queue',
      label: 'Antrean',
      icon: Clock,
      badge: waitingCount > 0 ? waitingCount : undefined,
    },
    { id: 'more', label: 'Lainnya', icon: Menu },
  ];

  return (
    <nav
      aria-label="Navigasi bawah"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0D1117]/90 backdrop-blur-md border-t border-gray-200/80 dark:border-white/[0.08] px-2 pt-1 safe-bottom"
      style={{ boxShadow: '0 -8px 24px rgb(16 24 40 / 0.06)' }}
    >
      <div className="flex items-stretch justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'more' && ['tracking', 'documents', 'settings'].includes(currentTab));

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'more') {
                  onTabChange('tracking');
                } else {
                  onTabChange(tab.id);
                }
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] rounded-xl transition-all duration-150 relative active:scale-95 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-300 font-bold'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium'
              }`}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute top-0.5 w-8 h-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
                />
              )}
              <span className="relative">
                <Icon size={21} strokeWidth={isActive ? 2.4 : 2} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-gradient-to-b from-warning-400 to-warning-600 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold tabular-nums shadow-card">
                    {tab.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
