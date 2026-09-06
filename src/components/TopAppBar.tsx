import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Timer, 
  MoreVertical, 
  RotateCcw, 
  Trash2,
  GraduationCap,
  Sun,
  Moon,
  AlertTriangle,
  CheckSquare,
  Download,
  Smartphone
} from 'lucide-react';
import { AppTab, Subject } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface TopAppBarProps {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  pendingDeadlinesCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenTimer: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenDeleteAll: () => void;
  onOpenDeleteSelected: () => void;
  onOpenRestoreSelected: () => void;
  onOpenInstallModal: () => void;
  subjects?: Subject[];
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenTimer,
  theme,
  onToggleTheme,
  onOpenDeleteAll,
  onOpenDeleteSelected,
  onOpenRestoreSelected,
  onOpenInstallModal,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { isInstalled, isInstallable, install } = usePWAInstall();

  const handleQuickInstall = async () => {
    if (isInstallable) {
      const res = await install();
      if (res === 'accepted') return;
    }
    onOpenInstallModal();
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <GraduationCap size={20} />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-none block">
              StudySphere
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              Academic Hub
            </span>
          </div>
        </div>

        {/* Dedicated Universal Search Bar */}
        <div className="flex-1 max-w-2xl relative flex items-center">
          <Search size={16} className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            id="global-top-search-input"
            type="text"
            placeholder="Search subjects, documents, deadlines, notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onSearchChange('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-700 transition"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Utilities: Install App, Theme Toggle, Pomodoro Timer & Options Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Prominent Install App Button (Suppressed if running standalone) */}
          {!isInstalled && (
            <button
              id="header-install-app-btn"
              onClick={handleQuickInstall}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition"
              title="Install StudySphere on Mobile or PC"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Install App</span>
            </button>
          )}

          {/* Quick Theme Toggle Button (Light/White vs Dark) */}
          <button
            id="header-theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition active:scale-95 shadow-2xs"
            title={`Switch to ${theme === 'dark' ? 'White / Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${theme === 'dark' ? 'White / Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400" />
            ) : (
              <Moon size={17} className="text-slate-700" />
            )}
          </button>

          {/* Pomodoro Focus Timer Button */}
          <button
            id="header-timer-btn"
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-900/60 transition shadow-2xs active:scale-95"
            title="Open Pomodoro Focus Timer"
          >
            <Timer size={15} className="text-blue-600 dark:text-blue-400" />
            <span className="hidden md:inline">Focus Timer</span>
          </button>

          {/* Options / Workspace Settings Menu */}
          <div className="relative">
            <button
              id="more-options-menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700 shadow-2xs active:scale-95"
              title="Workspace Options"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-11 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium text-slate-700 dark:text-slate-200 animate-fadeIn">
                  {/* Install App in Dropdown */}
                  {!isInstalled && (
                    <>
                      <button
                        id="menu-install-app-btn"
                        onClick={() => {
                          setShowMenu(false);
                          handleQuickInstall();
                        }}
                        className="w-full px-3 py-2 flex items-center gap-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition text-left font-bold"
                      >
                        <Smartphone size={15} />
                        <span>Install StudySphere App</span>
                      </button>
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />
                    </>
                  )}

                  {/* Theme Mode Option */}
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                    Preferences & Theme
                  </div>

                  <button
                    id="menu-toggle-theme-btn"
                    onClick={() => {
                      onToggleTheme();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {theme === 'dark' ? (
                        <Sun size={15} className="text-amber-400" />
                      ) : (
                        <Moon size={15} className="text-blue-600 dark:text-blue-400" />
                      )}
                      <span>Theme Mood</span>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {theme === 'dark' ? 'Dark Mode' : 'White / Light'}
                    </span>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />

                  {/* Data Management Options */}
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                    Data Management
                  </div>

                  {/* Delete Selected Data */}
                  <button
                    id="menu-delete-selected-btn"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenDeleteSelected();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition text-left"
                  >
                    <CheckSquare size={15} className="text-slate-500 dark:text-slate-400" />
                    <span>Delete Selected Data</span>
                  </button>

                  {/* Restore Selected Data */}
                  <button
                    id="menu-restore-selected-btn"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenRestoreSelected();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition text-left"
                  >
                    <RotateCcw size={15} className="text-blue-600 dark:text-blue-400" />
                    <span>Restore Selected Data</span>
                  </button>

                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />

                  {/* Delete All Data with strict message */}
                  <button
                    id="menu-delete-all-btn"
                    onClick={() => {
                      setShowMenu(false);
                      onOpenDeleteAll();
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left font-semibold"
                  >
                    <AlertTriangle size={15} />
                    <span>Delete All Data</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
