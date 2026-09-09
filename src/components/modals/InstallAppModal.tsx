import React from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  WifiOff, 
  Laptop, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const outcome = await install();
    if (outcome === 'accepted') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-slate-800 dark:text-slate-100 animate-scaleUp">
        {/* Header with App Identity */}
        <div className="relative p-5 pb-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
            title="Close"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center justify-center shadow-md">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Install StudySphere
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Run natively on Mobile & Desktop
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-medium text-blue-100">
            <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <WifiOff size={12} /> Complete Offline Mode
            </span>
            <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
              <CheckCircle2 size={12} /> Instant 0s Launch
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {isInstalled ? (
            <div className="text-center py-4 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                StudySphere is Installed!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                You are currently running the installed application. All data is cached and runs 100% offline.
              </p>
              <button
                onClick={onClose}
                className="mt-3 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          ) : isInstallable ? (
            /* 1-Click Native Install Prompt (Chromium, Android, Windows, Mac) */
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Click below to add StudySphere to your home screen or desktop. It installs instantly with zero download wait and functions offline.
              </p>

              <button
                id="modal-trigger-install-btn"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 active:scale-98 transition"
              >
                <Download size={18} />
                <span>Install StudySphere App</span>
              </button>
            </div>
          ) : isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                How to Install on iPhone / iPad:
              </h4>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <span>Tap the </span>
                    <strong className="text-blue-600 dark:text-blue-400 inline-flex items-center gap-1 font-semibold">
                      <Share size={12} /> Share button
                    </strong>
                    <span> in Safari's bottom toolbar.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <span>Scroll down and select </span>
                    <strong className="text-slate-900 dark:text-white inline-flex items-center gap-1 font-semibold">
                      <PlusSquare size={12} /> Add to Home Screen
                    </strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <span>Tap </span>
                    <strong className="text-blue-600 dark:text-blue-400 font-semibold">Add</strong>
                    <span> in the top right corner. The app icon will appear on your home screen!</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Android / Desktop Manual Instructions Fallback */
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                How to Install from Your Browser:
              </h4>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <span>Tap your browser's menu (the </span>
                    <strong className="font-semibold text-slate-900 dark:text-white">three dots ⋮</strong>
                    <span> in the top or bottom corner).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <span>Tap </span>
                    <strong className="text-blue-600 dark:text-blue-400 font-semibold">"Install app"</strong>
                    <span> or </span>
                    <strong className="text-slate-900 dark:text-white font-semibold">"Add to Home screen"</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <span>Confirm installation. Once added, <strong>open StudySphere directly from your phone's Home Screen or App Drawer</strong>. It will run in its own standalone window without Chrome bars, working 100% offline!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Standalone vs Chrome Mode Guidance */}
          <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-xs text-amber-800 dark:text-amber-300">
              <Smartphone size={14} />
              <span>Opening in Chrome mode instead of App mode?</span>
            </h5>
            <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
              If Chrome's address bar is visible, your phone created a bookmark shortcut instead of installing the WebAPK app. In Chrome menu (⋮), tap <strong>"Install app"</strong> (with the download arrow), not "Add to Home screen bookmark". It will then launch in 100% full-screen app mode without Chrome bars!
            </p>
          </div>

          {/* Offline & Performance Feature Note */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-500" />
              IndexedDB local storage enabled
            </span>
            <button
              onClick={onClose}
              className="font-semibold text-slate-700 dark:text-slate-300 hover:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
