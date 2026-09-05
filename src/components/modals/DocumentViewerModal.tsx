import React, { useState } from 'react';
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
  ZoomIn,
  ZoomOut,
  BookOpen,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import { Material, Subject } from '../../types';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';

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

  if (!isOpen || !material) return null;

  const handleDownload = () => {
    if (material.fileData) {
      const a = document.createElement('a');
      a.href = material.fileData.startsWith('data:')
        ? material.fileData
        : `data:${material.mimeType};charset=utf-8,` + encodeURIComponent(material.fileData);
      a.download = material.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      const blob = new Blob([
        `StudySphere Export: ${material.title}\nCategory: ${material.category}\nDate: ${material.uploadDate}\n\n${material.description || ''}`
      ], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName.replace(/\.[^/.]+$/, '') + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleCopyText = () => {
    const textToCopy = material.fileData && !material.fileData.startsWith('data:image') && !material.fileData.startsWith('data:application/pdf')
      ? material.fileData
      : `${material.title}\n\n${material.description || ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subjectColor = subject ? COLOR_MAP[subject.color] : COLOR_MAP.indigo;

  // Determine if file data can be directly rendered in iframe/object
  const isImageDataUrl = material.fileType === 'image' && material.fileData && material.fileData.startsWith('data:image');
  const isReadableText = material.fileData && !material.fileData.startsWith('data:application/pdf') && !material.fileData.startsWith('data:image');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 transition-all ${
        isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-4xl h-[88vh]'
      }`}>
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
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${subjectColor.badgeBg} ${subjectColor.badgeText}`}>
                    {subject.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                <span className="font-mono">{material.fileName}</span>
                <span>•</span>
                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {material.category}
                </span>
                <span>•</span>
                <span className="font-mono">{formatFileSize(material.fileSize)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
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
              title="Download File"
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

        {/* Viewer Sub-Header / Tool Controls */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">
              In-App Reader
            </span>
            {material.tags && material.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                {material.tags.map((t) => (
                  <span
                    key={t}
                    className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 text-[10px] font-mono"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Typography Zoom for Text & Notes */}
          {isReadableText && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 shadow-xs">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  fontSize === 'sm' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  fontSize === 'base' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition ${
                  fontSize === 'lg' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                A+
              </button>
            </div>
          )}
        </div>

        {/* Main Document Content Canvas (Always In-App) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 relative">
          {/* 1. PDF Documents */}
          {material.fileType === 'pdf' ? (
            <div className="w-full h-full flex flex-col gap-4">
              {/* If real PDF data URI exists with content */}
              {material.fileData && material.fileData.length > 100 ? (
                <div className="w-full flex-1 min-h-[450px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <object
                    data={material.fileData}
                    type="application/pdf"
                    className="w-full h-full min-h-[480px]"
                  >
                    <iframe
                      src={material.fileData}
                      title={material.title}
                      className="w-full h-full min-h-[480px] border-0"
                    />
                  </object>
                </div>
              ) : null}

              {/* Structured In-App Study Notes & Outline for the PDF */}
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

                {/* Simulated Study Points & Lecture Slide Takeaways */}
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                    Document Topics & Core Concepts:
                  </h5>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li>Comprehensive breakdown of core examination concepts and theoretical frameworks.</li>
                    <li>Refer to definitions, theorems, and step-by-step proofs highlighted throughout the text.</li>
                    <li>Cross-referenced with homework assignments and upcoming project milestones.</li>
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>Uploaded: {new Date(material.uploadDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-semibold transition"
                  >
                    <Download size={13} />
                    <span>Download Original PDF</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isImageDataUrl ? (
            /* 2. Image Document */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <img
                src={material.fileData}
                alt={material.title}
                className="max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isReadableText ? (
            /* 3. Text / Markdown / Code Document */
            <div className="bg-white dark:bg-slate-900 p-5 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono leading-relaxed whitespace-pre-wrap selection:bg-blue-100 dark:selection:bg-blue-900 text-slate-800 dark:text-slate-200">
              <div className={`${
                fontSize === 'sm' ? 'text-xs' : fontSize === 'base' ? 'text-sm' : 'text-base'
              }`}>
                {material.fileData}
              </div>
            </div>
          ) : (
            /* 4. Binary Document Fallback with In-App Notes */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{material.fileName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {material.category} • {formatFileSize(material.fileSize)}
                  </p>
                </div>
              </div>
              {material.description && (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                  {material.description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* In-App Confirmation Modal for Deletion */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-slate-800 dark:text-slate-100 animate-scaleUp">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Trash2 size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete Document?</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{material.title}"</span>? This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDelete(false);
                    onDelete(material.id);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  Delete Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
