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
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Code, 
  Image as ImageIcon, 
  ExternalLink, 
  Share2, 
  Presentation, 
  FileSpreadsheet, 
  Smartphone, 
  Globe, 
  Link as LinkIcon, 
  Sparkles 
} from 'lucide-react';
import { Material, Subject } from '../../types';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';
import { 
  materialToFile, 
  openInBrowserTab, 
  downloadMaterialFile, 
  shareMaterialFile, 
  openWithDeviceApp,
  extractWebUrl,
  extractDecodedText,
  isPdfMaterial,
  isSlidesMaterial,
  isDocMaterial,
  isImageMaterial,
  isSpreadsheetMaterial
} from '../../utils/fileViewer';
import { PDFCanvasViewer } from '../PDFCanvasViewer';

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
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

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

  // Analysis of material content & real format
  const webUrl = extractWebUrl(material.fileData);
  const isPdf = isPdfMaterial(material);
  const isSlides = !isPdf && isSlidesMaterial(material);
  const isDoc = !isPdf && !isSlides && isDocMaterial(material);
  const isSpreadsheet = !isPdf && !isSlides && !isDoc && isSpreadsheetMaterial(material);
  const isImage = !isPdf && isImageMaterial(material);
  const decodedText = extractDecodedText(material.fileData);

  const subjectColor = subject ? COLOR_MAP[subject.color] : COLOR_MAP.indigo;

  const showToast = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  const handleOpenWithDevice = () => {
    const webUrl = extractWebUrl(material.fileData);
    if (webUrl) {
      window.open(webUrl, '_blank');
      showToast('Opening document link...');
      return;
    }
    downloadMaterialFile(material);
    showToast('File downloaded! Tap the notification to open in your installed app.');
  };

  const handleBrowserTab = () => {
    openInBrowserTab(material);
  };

  const handleShare = async () => {
    const shared = await shareMaterialFile(material);
    if (shared) {
      showToast('Shared successfully!');
    }
  };

  const handleDownload = () => {
    downloadMaterialFile(material);
    showToast('Downloaded to device! Tap notification to open.');
  };

  const handleCopyText = () => {
    const textToCopy =
      decodedText ||
      webUrl ||
      `${material.title}\n\n${material.description || ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Header Icon based on accurate type
  const renderHeaderIcon = () => {
    if (webUrl) {
      return <Globe size={20} className="text-cyan-500 dark:text-cyan-400" />;
    }
    if (isPdf) {
      return <FileText size={20} className="text-rose-500 dark:text-rose-400" />;
    }
    if (isSlides) {
      return <Presentation size={20} className="text-amber-500 dark:text-amber-400" />;
    }
    if (isSpreadsheet) {
      return <FileSpreadsheet size={20} className="text-emerald-500 dark:text-emerald-400" />;
    }
    if (isImage) {
      return <ImageIcon size={20} className="text-emerald-500 dark:text-emerald-400" />;
    }
    if (material.fileType === 'code') {
      return <Code size={20} className="text-amber-500 dark:text-amber-400" />;
    }
    return <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />;
  };

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
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-xs">
              {renderHeaderIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{material.title}</h3>
                {subject && (
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${subjectColor.badgeBg} ${subjectColor.badgeText}`}
                  >
                    {subject.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                <span className="font-mono truncate">{material.fileName}</span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium shrink-0">
                  {isSlides ? 'Lecture Slides' : material.category}
                </span>
                {material.fileSize > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-mono shrink-0">{formatFileSize(material.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Open with Installed App Button (PowerPoint, Word, Google Slides, etc.) */}
            <button
              onClick={handleOpenWithDevice}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition active:scale-95"
              title="Open with app installed on device (PowerPoint, Google Slides, Word, etc.)"
            >
              <Smartphone size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline">Open in App</span>
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95"
              title="Download File to Device"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Share to Device Apps */}
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Share Document"
            >
              <Share2 size={16} />
            </button>

            {/* Open in Browser Tab */}
            <button
              onClick={handleBrowserTab}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Open in Browser Window / Link"
            >
              <ExternalLink size={16} />
            </button>

            {/* Copy Button (if text or link exists) */}
            {(decodedText || webUrl) && (
              <button
                onClick={handleCopyText}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition hidden sm:flex"
                title="Copy Text or Link"
              >
                {copied ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={16} />}
              </button>
            )}

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
        {statusMsg && (
          <div className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold text-center animate-fadeIn shadow-xs">
            {statusMsg}
          </div>
        )}

        {/* Main Document Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 relative">
          {/* VIEW 1: Web Link / CamScanner / Cloud Document */}
          {webUrl ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-sm">
                  <Globe size={32} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-800 dark:text-cyan-300 text-xs font-bold mb-2">
                    <LinkIcon size={12} />
                    <span>Cloud / CamScanner Document Link</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{material.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {material.fileName}
                  </p>
                </div>

                {/* Link Box */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-left">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Address</span>
                    <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400 truncate mt-0.5">{webUrl}</p>
                  </div>
                  <button
                    onClick={() => handleCopyUrl(webUrl)}
                    className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition shrink-0"
                    title="Copy Link"
                  >
                    {copiedUrl ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => window.open(webUrl, '_blank')}
                    className="w-full sm:w-auto px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <ExternalLink size={15} />
                    <span>Open in CamScanner / Browser</span>
                  </button>
                  <button
                    onClick={handleOpenWithDevice}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Smartphone size={15} />
                    <span>Open in Installed App</span>
                  </button>
                </div>
              </div>

              {/* Study Notes & Context */}
              {material.description && (
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Study Notes & Overview
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {material.description}
                  </p>
                </div>
              )}
            </div>
          ) : isPdf ? (
            /* VIEW 2: PDF Document (Canvas Viewer with zero auto-downloads) */
            <div className="w-full flex flex-col gap-4">
              <PDFCanvasViewer
                dataUrlOrBlob={material.fileData || blobUrl || ''}
                title={material.title}
                fileName={material.fileName}
                description={material.description}
              />

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

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                  <span>
                    Uploaded: {new Date(material.uploadDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenWithDevice}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold transition text-xs"
                    >
                      <Smartphone size={13} />
                      <span>Open in Reader App</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-xs shadow-xs"
                    >
                      <Download size={13} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isSlides ? (
            /* VIEW 3: PowerPoint / Slides Presentation Hub */
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
                  <Presentation size={34} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-bold mb-2">
                    <Sparkles size={12} />
                    <span>Presentation Slide Deck</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{material.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {material.fileName} • {formatFileSize(material.fileSize)}
                  </p>
                </div>

                {/* Slides Overview / Description */}
                {material.description ? (
                  <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-left text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                    <span className="font-bold block mb-1">Lecture & Slide Overview:</span>
                    {material.description}
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                    Ready to view in Microsoft PowerPoint, Google Slides, WPS Office, or your device's preferred presentation viewer.
                  </div>
                )}

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Download size={16} />
                    <span>Download & Open in PowerPoint</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Share2 size={16} />
                    <span>Share to Apps (WhatsApp, Drive)</span>
                  </button>

                  <button
                    onClick={handleBrowserTab}
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition sm:col-span-2"
                  >
                    <ExternalLink size={15} />
                    <span>Safe Browser Preview</span>
                  </button>
                </div>

                {/* Visual Step-by-Step Device Opening Guide */}
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <Smartphone size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>How to open in PowerPoint / Google Slides:</span>
                  </div>
                  <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed pl-1">
                    <li>Tap <strong className="text-slate-800 dark:text-slate-200">Download & Open in PowerPoint</strong> above.</li>
                    <li>Tap the <strong className="text-slate-800 dark:text-slate-200">"Download complete"</strong> notification on your phone (or the download icon in your browser).</li>
                    <li>Select <strong className="text-slate-800 dark:text-slate-200">PowerPoint</strong>, <strong className="text-slate-800 dark:text-slate-200">Google Slides</strong>, or <strong className="text-slate-800 dark:text-slate-200">WPS Office</strong> when prompted.</li>
                  </ol>
                </div>
              </div>

              {/* Study Tags */}
              {material.tags && material.tags.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-slate-400 shrink-0" />
                  {material.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : isDoc ? (
            /* VIEW 4: Word / Document Hub */
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
                  <FileText size={34} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs font-bold mb-2">
                    <BookOpen size={12} />
                    <span>Word / Text Document</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{material.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {material.fileName} • {formatFileSize(material.fileSize)}
                  </p>
                </div>

                {material.description && (
                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-xl text-left text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                    <span className="font-bold block mb-1">Document Summary:</span>
                    {material.description}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={handleOpenWithDevice}
                    className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Smartphone size={15} />
                    <span>Open in Word / Google Docs App</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Download size={15} />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isSpreadsheet ? (
            /* VIEW 5: Spreadsheet Hub */
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <FileSpreadsheet size={34} />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                    <FileSpreadsheet size={12} />
                    <span>Spreadsheet / Data Sheet</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg">{material.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
                    {material.fileName} • {formatFileSize(material.fileSize)}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={handleOpenWithDevice}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Smartphone size={15} />
                    <span>Open in Excel / Sheets App</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                  >
                    <Download size={15} />
                    <span>Download Spreadsheet</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isImage ? (
            /* VIEW 6: Image Document */
            <div className="w-full flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <img
                src={material.fileData || blobUrl || ''}
                alt={material.title}
                className="max-h-[65vh] object-contain rounded-lg shadow-sm"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBrowserTab}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink size={14} />
                  <span>Full Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Download size={14} />
                  <span>Download Image</span>
                </button>
              </div>
            </div>
          ) : decodedText ? (
            /* VIEW 7: Code / Plain Text (ONLY when clean decoded text exists) */
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono leading-relaxed whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900 text-slate-800 dark:text-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-500">{material.fileName}</span>
                <div className="flex items-center gap-1">
                  {(['sm', 'base', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fontSize === sz
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {sz.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={`${
                  fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
                }`}
              >
                {decodedText}
              </div>
            </div>
          ) : (
            /* VIEW 8: Professional Fallback for Binary Files (NEVER showing raw base64) */
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

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-left space-y-1.5">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  This document is formatted for external viewers. You can open it in an installed app on your device, view it in a tab, or download it.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  onClick={handleOpenWithDevice}
                  className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                >
                  <Smartphone size={15} />
                  <span>Open in Installed App</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Download size={15} />
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
