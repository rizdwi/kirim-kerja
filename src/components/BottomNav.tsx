'use client';

import React from 'react';
import { Briefcase, Send, Clock, Menu, Sparkles } from 'lucide-react';

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
    { id: 'dashboard', label: 'Beranda', icon: Briefcase },
    { id: 'explore', label: 'Jelajah', icon: Sparkles },
    { id: 'jobs', label: 'Lowongan', icon: Send },
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
      aria-label="Navigasi Bawah Ponsel"
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161B22] border-t border-gray-200 dark:border-gray-800 z-40 px-2 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around">
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
              className={`flex-1 flex flex-col items-center justify-center py-2 min-h-[48px] rounded-lg transition-colors relative ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 bg-warning-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
