import React from 'react';
import { Home, Layers, FileText, CalendarClock, BookOpen } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavBarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  pendingDeadlinesCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  pendingDeadlinesCount,
}) => {
  const tabs: { 
    id: AppTab; 
    label: string; 
    icon: React.FC<{ size?: number; className?: string }>; 
    badge?: number;
    shortcut?: string;
  }[] = [
    { id: 'home', label: 'Overview', icon: Home, shortcut: '1' },
    { id: 'subjects', label: 'Subjects', icon: Layers, shortcut: '2' },
    { id: 'materials', label: 'Materials', icon: FileText, shortcut: '3' },
    { id: 'deadlines', label: 'Deadlines', icon: CalendarClock, badge: pendingDeadlinesCount, shortcut: '4' },
    { id: 'notes', label: 'Study Notes', icon: BookOpen, shortcut: '5' },
  ];

  return (
    <nav 
      aria-label="Application Navigation" 
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-2 sm:px-6 py-1 select-none transition-colors"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-xl transition-all outline-none group relative ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon 
                  size={19} 
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-110 text-blue-600 dark:text-blue-400' : 'group-hover:scale-105'
                  }`} 
                />

                {/* Notification Badge */}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-2xs">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>

              {/* Label */}
              <span className={`text-[11px] sm:text-xs tracking-tight transition-colors whitespace-nowrap ${
                isActive ? 'text-blue-700 dark:text-blue-300 font-bold' : 'text-slate-600 dark:text-slate-400 font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
