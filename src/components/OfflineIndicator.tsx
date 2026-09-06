import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-banner"
      className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-4 py-2 bg-amber-500/95 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-xs animate-fadeIn"
      role="status"
    >
      <WifiOff size={14} className="shrink-0 animate-pulse" />
      <span>Offline Mode Active — All notes & materials are saved locally</span>
      <Database size={13} className="shrink-0 opacity-80" />
    </div>
  );
};
