import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-slate-800 dark:text-slate-100 animate-scaleUp">
        {/* Header with Icon */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDestructive 
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' 
              : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
          }`}>
            {isDestructive ? <AlertTriangle size={20} /> : <Trash2 size={20} />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            id="confirm-modal-cancel-btn"
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-modal-action-btn"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition active:scale-95 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
