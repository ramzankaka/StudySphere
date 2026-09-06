import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ExternalLink, 
  BookOpen, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Code, 
  File, 
  Share2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Material, Subject } from '../../types';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';
import { openWithDeviceApp, openInBrowserTab, downloadMaterialFile, shareMaterialFile } from '../../utils/fileViewer';

interface OpenMaterialOptionsModalProps {
  material: Material | null;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
  onOpenInAppReader: (material: Material) => void;
}

export const OpenMaterialOptionsModal: React.FC<OpenMaterialOptionsModalProps> = ({
  material,
  subject,
  isOpen,
  onClose,
  onOpenInAppReader,
}) => {
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  if (!isOpen || !material) return null;

  const subjectColor = subject ? COLOR_MAP[subject.color] : COLOR_MAP.indigo;

  const handleOpenDeviceApp = async () => {
    setActionStatus('Opening document preview...');
    const result = await openWithDeviceApp(material);
    if (result.success) {
      setActionStatus('Document opened in preview window!');
    } else {
      setActionStatus('Pop-up blocked. Opening in reader...');
      onOpenInAppReader(material);
    }
    setTimeout(() => {
      setActionStatus(null);
      onClose();
    }, 1200);
  };

  const handleShare = async () => {
    setActionStatus('Opening share...');
    const shared = await shareMaterialFile(material);
    if (shared) {
      setActionStatus('Shared successfully!');
    }
    setTimeout(() => {
      setActionStatus(null);
      onClose();
    }, 1200);
  };

  const handleBrowserTab = () => {
    openInBrowserTab(material);
    onClose();
  };

  const handleDownload = () => {
    downloadMaterialFile(material);
    setActionStatus('Downloading file to device...');
    setTimeout(() => {
      setActionStatus(null);
      onClose();
    }, 1200);
  };

  const handleInApp = () => {
    onClose();
    onOpenInAppReader(material);
  };

  const renderIcon = () => {
    if (material.fileType === 'pdf') {
      return <FileText size={24} className="text-rose-600 dark:text-rose-400" />;
    }
    if (material.fileType === 'image') {
      return <ImageIcon size={24} className="text-emerald-600 dark:text-emerald-400" />;
    }
    if (material.fileType === 'code') {
      return <Code size={24} className="text-amber-600 dark:text-amber-400" />;
    }
    return <File size={24} className="text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100 animate-scaleUp">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
              {renderIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                  {material.category}
                </span>
                {subject && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${subjectColor.badgeBg} ${subjectColor.badgeText}`}>
                    {subject.code} — {subject.name}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 truncate">
                {material.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                {material.fileName} • {formatFileSize(material.fileSize)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Toast */}
        {actionStatus && (
          <div className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 size={15} />
            <span>{actionStatus}</span>
          </div>
        )}

        {/* Body Content - Choices */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Choose how to view or open this material
          </p>

          {/* Option 1: Read Inside StudySphere App (Highlighted Default) */}
          <button
            id="open-in-app-reader-btn"
            onClick={handleInApp}
            className="w-full text-left p-4 rounded-xl border-2 border-blue-500/50 bg-blue-50/40 dark:bg-blue-950/30 hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition flex items-start gap-3.5 group cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
              <BookOpen size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Read Inside StudySphere
                </h4>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Instant full-screen reader with zoom, text search, study summaries, and custom font scaling. No downloading required!
              </p>
            </div>
          </button>

          {/* Option 2: Open in New Browser Tab / Preview */}
          <button
            id="open-in-browser-tab-btn"
            onClick={handleBrowserTab}
            className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3.5 group cursor-pointer active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <ExternalLink size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                Open in Full Browser Tab
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Displays the document in a full-sized tab with browser zoom, text selection, and print tools.
              </p>
            </div>
          </button>

          {/* Option 3: Download to Device (Explicit Only) */}
          <button
            id="download-material-btn"
            onClick={handleDownload}
            className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3.5 group cursor-pointer active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <Download size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                Download to Device
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saves the file directly into your device's Downloads folder for offline access outside the app.
              </p>
            </div>
          </button>

          {/* Option 5: Share Document (WhatsApp, Bluetooth, etc.) */}
          <button
            id="share-material-btn"
            onClick={handleShare}
            className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-3.5 group cursor-pointer active:scale-[0.99]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <Share2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                Share Document to Apps
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Send this file to WhatsApp, Telegram, Gmail, Bluetooth, or Quick Share.
              </p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-600 dark:text-blue-400" />
            Works offline with your installed apps
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
