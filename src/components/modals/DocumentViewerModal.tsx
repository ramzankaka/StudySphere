import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  FileText, 
  Check, 
  Copy, 
  Tag, 
  Edit3, 
  Calendar,
  Maximize2,
  Minimize2,
  BookOpen,
  Code,
  Image as ImageIcon,
  ExternalLink,
  Smartphone,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Material, Subject } from '../../types';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';
import { materialToFile, openWithDeviceApp, openInBrowserTab, downloadMaterialFile } from '../../utils/fileViewer';

interface DocumentViewerModalProps {
  material: Material | null;
  subject?: Subject;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (material: Material) => void;
  onDelete: (id: string) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  material,
  subject,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [openStatus, setOpenStatus] = useState<string | null>(null);

  // Generate a clean Blob URL whenever the material changes
  useEffect(() => {
    if (material) {
      try {
        const { url } = materialToFile(material);
        setBlobUrl(url);
        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.warn('Failed to construct blob URL for preview:', err);
      }
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleOpenDevice = async () => {
    setOpenStatus('Opening device app picker...');
    const res = await openWithDeviceApp(material);
    if (res.success) {
      setOpenStatus(res.method === 'share_sheet' ? 'Opened in app!' : 'Opened document!');
    } else {
      setOpenStatus('Downloaded to device');
    }
    setTimeout(() => setOpenStatus(null), 1500);
  };

  const handleBrowserTab = () => {
    openInBrowserTab(material);
  };

  const handleDownload = () => {
    downloadMaterialFile(material);
  };

  const handleCopyText = () => {
    const textToCopy =
      material.fileData &&
      !material.fileData.startsWith('data:image') &&
      !material.fileData.startsWith('data:application/pdf')
        ? material.fileData
        : `${material.title}\n\n${material.description || ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subjectColor = subject ? COLOR_MAP[subject.color] : COLOR_MAP.indigo;

  const isImageDataUrl =
    material.fileType === 'image' && material.fileData && material.fileData.startsWith('data:image');
  const isReadableText =
    material.fileData &&
    !material.fileData.startsWith('data:application/pdf') &&
    !material.fileData.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div
        className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-all ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-4xl h-[88vh]'
        }`}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
              {material.fileType === 'pdf' ? (
                <FileText size={20} className="text-rose-500 dark:text-rose-400" />
              ) : material.fileType === 'code' ? (
                <Code size={20} className="text-amber-500 dark:text-amber-400" />
              ) : material.fileType === 'image' ? (
                <ImageIcon size={20} className="text-emerald-500 dark:text-emerald-400" />
              ) : (
                <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{material.title}</h3>
                {subject && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${subjectColor.badgeBg} ${subjectColor.badgeText}`}
                  >
                    {subject.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                <span className="font-mono truncate">{material.fileName}</span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  {material.category}
                </span>
                <span>•</span>
                <span className="font-mono shrink-0">{formatFileSize(material.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Direct Open in Device App Button */}
            <button
              onClick={handleOpenDevice}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              title="Open with WPS Office, CamScanner, Drive, Acrobat, etc."
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Open in Device App</span>
            </button>

            {/* Open in Browser Tab */}
            <button
              onClick={handleBrowserTab}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Open in Full Browser Window"
            >
              <ExternalLink size={16} />
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:flex"
              title="Copy Text"
            >
              {copied ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={16} />}
            </button>

            {/* Edit Material Button */}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(material);
                  onClose();
                }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
                title="Edit Document Details"
              >
                <Edit3 size={16} />
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition"
              title="Download to Device"
            >
              <Download size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition"
              title="Delete Document"
            >
              <Trash2 size={16} />
            </button>

            {/* Close Button */}
            <button
              id="close-doc-viewer-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {openStatus && (
          <div className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold text-center animate-fadeIn">
            {openStatus}
          </div>
        )}

        {/* Quick Mobile Bar for Device Apps */}
        <div className="px-4 py-2 bg-blue-50/80 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Smartphone size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Open in <strong>WPS Office</strong>, <strong>CamScanner</strong>, <strong>Google Drive</strong>, or <strong>Acrobat</strong>:</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenDevice}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shadow-xs transition"
            >
              Launch Device App
            </button>
            <button
              onClick={handleBrowserTab}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold rounded-lg text-[11px] transition"
            >
              Open in Tab
            </button>
          </div>
        </div>

        {/* Main Document Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 relative">
          {/* 1. PDF Documents */}
          {material.fileType === 'pdf' ? (
            <div className="w-full flex flex-col gap-4">
              {/* Embedded PDF Viewer via Blob URL */}
              {blobUrl ? (
                <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <iframe
                    src={blobUrl}
                    title={material.title}
                    className="w-full h-[520px] border-0"
                  />
                </div>
              ) : null}

              {/* Study Notes & Outline Overview */}
              <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                      {material.title} — Reading Overview
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    {material.fileName}
                  </span>
                </div>

                {material.description && (
                  <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 rounded-lg text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                    <span className="font-bold block mb-1">Key Context & Scope:</span>
                    {material.description}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Uploaded: {new Date(material.uploadDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenDevice}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition"
                    >
                      <Smartphone size={13} />
                      <span>Open in Device App</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold transition"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isImageDataUrl ? (
            /* 2. Image Document */
            <div className="w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <img
                src={material.fileData}
                alt={material.title}
                className="max-h-[65vh] object-contain rounded-lg shadow-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenDevice}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Smartphone size={14} />
                  <span>Open in Gallery / CamScanner</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Download size={14} />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
          ) : isReadableText ? (
            /* 3. Text / Markdown / Code Document */
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono leading-relaxed whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900 text-slate-800 dark:text-slate-200">
              <div
                className={`${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                }`}
              >
                {material.fileData}
              </div>
            </div>
          ) : (
            /* 4. Binary Document Fallback (Word, PPT, etc.) */
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                <FileText size={32} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{material.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                  {material.fileName} • {formatFileSize(material.fileSize)}
                </p>
                {material.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-left">
                    {material.description}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl text-left space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                  <Smartphone size={15} />
                  <span>Open with Device Document Viewer</span>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                  Tap below to launch this file in <strong>WPS Office</strong>, <strong>Microsoft Office</strong>, <strong>Google Drive</strong>, or your PC viewer.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={handleOpenDevice}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                >
                  <Smartphone size={16} />
                  <span>Open in WPS Office / Drive</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download size={16} />
                  <span>Download File</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Document?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete "{material.title}"? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(material.id);
                  setShowConfirmDelete(false);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
