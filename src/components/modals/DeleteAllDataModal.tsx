import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, ShieldAlert } from 'lucide-react';

interface DeleteAllDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  itemCounts: {
    subjects: number;
    materials: number;
    deadlines: number;
    notes: number;
  };
}

export const DeleteAllDataModal: React.FC<DeleteAllDataModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCounts,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const CONFIRM_PHRASE = 'DELETE ALL';
  const isMatch = confirmationInput.trim().toUpperCase() === CONFIRM_PHRASE;
  const totalItems = itemCounts.subjects + itemCounts.materials + itemCounts.deadlines + itemCounts.notes;

  const handleDelete = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      setConfirmationInput('');
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-all-title"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-2xl overflow-hidden transition-colors"
      >
        {/* Header with Danger Warning */}
        <div className="bg-rose-50 dark:bg-rose-950/40 px-6 py-4 border-b border-rose-100 dark:border-rose-900/40 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 id="delete-all-title" className="text-base font-bold text-rose-900 dark:text-rose-200">
                Delete All Academic Data
              </h3>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Strict Confirmation Required
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-rose-50/80 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-xl space-y-2">
            <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>DANGER: This action is permanent and completely irreversible!</span>
            </div>
            <p className="text-xs text-rose-600/90 dark:text-rose-400/90 leading-relaxed pl-6">
              Executing this will permanently delete all {totalItems} items stored on your device:
            </p>
            <div className="grid grid-cols-2 gap-2 pl-6 pt-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
              <div>• {itemCounts.subjects} Enrolled Subjects</div>
              <div>• {itemCounts.materials} Course Documents</div>
              <div>• {itemCounts.deadlines} Assignment Deadlines</div>
              <div>• {itemCounts.notes} Study Notes</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              To confirm this permanent wipe, type <span className="font-mono font-bold text-rose-600 dark:text-rose-400 select-all">{CONFIRM_PHRASE}</span> below:
            </label>
            <input
              id="confirm-delete-all-input"
              type="text"
              autoFocus
              placeholder={`Type "${CONFIRM_PHRASE}" here`}
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-all-btn"
            type="button"
            onClick={handleDelete}
            disabled={!isMatch || isDeleting}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white transition shadow-xs ${
              isMatch && !isDeleting
                ? 'bg-rose-600 hover:bg-rose-700 active:scale-98 cursor-pointer'
                : 'bg-rose-300 dark:bg-rose-900/40 cursor-not-allowed opacity-60'
            }`}
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting Everything...' : 'Permanently Delete All Data'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
