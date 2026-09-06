import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenInstallModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenInstallModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem('studysphere_pwa_banner_dismissed');
      if (wasDismissed) {
        setDismissed(true);
      }
    } catch {}
  }, []);

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('studysphere_pwa_banner_dismissed', 'true');
    } catch {}
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome === 'accepted') {
        setDismissed(true);
        return;
      }
    }
    onOpenInstallModal();
  };

  return (
    <aside
      id="pwa-install-mobile-banner"
      aria-label="Install App"
      className="fixed bottom-18 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-30 bg-slate-900/95 dark:bg-slate-800/95 text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-slate-700/60 backdrop-blur-md animate-slideUp flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-xs">
          <Smartphone size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold text-white truncate">Install StudySphere</h4>
            <span className="hidden xs:inline-block px-1.5 py-0.2 bg-blue-500/30 text-blue-300 text-[9px] font-semibold rounded">
              Offline Ready
            </span>
          </div>
          <p className="text-[11px] text-slate-300 truncate">
            Add to your home screen or desktop
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
        >
          <Download size={13} />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
