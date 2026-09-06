import React, { useState } from 'react';
import { Plus, X, Layers, UploadCloud, CalendarClock, BookOpen } from 'lucide-react';

interface SpeedDialFABProps {
  onAddSubject: () => void;
  onUploadMaterial: () => void;
  onAddDeadline: () => void;
  onAddNote: () => void;
}

export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  onAddSubject,
  onUploadMaterial,
  onAddDeadline,
  onAddNote,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      id: 'fab-add-note',
      label: 'New Note',
      icon: BookOpen,
      color: 'bg-emerald-600 hover:bg-emerald-500',
      action: () => {
        setIsOpen(false);
        onAddNote();
      },
    },
    {
      id: 'fab-add-deadline',
      label: 'Add Deadline',
      icon: CalendarClock,
      color: 'bg-rose-600 hover:bg-rose-500',
      action: () => {
        setIsOpen(false);
        onAddDeadline();
      },
    },
    {
      id: 'fab-upload-material',
      label: 'Upload Material',
      icon: UploadCloud,
      color: 'bg-blue-600 hover:bg-blue-500',
      action: () => {
        setIsOpen(false);
        onUploadMaterial();
      },
    },
    {
      id: 'fab-add-subject',
      label: 'New Subject',
      icon: Layers,
      color: 'bg-slate-900 hover:bg-slate-800',
      action: () => {
        setIsOpen(false);
        onAddSubject();
      },
    },
  ];

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 sm:right-8 z-30 flex flex-col items-end pointer-events-auto">
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Speed Dial Menu items */}
      <div
        className={`flex flex-col items-end gap-2.5 mb-3 transition-all duration-200 z-20 ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-center gap-2.5 group">
              <span className="bg-slate-900 text-white text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-800 shadow-md select-none whitespace-nowrap">
                {act.label}
              </span>
              <button
                id={act.id}
                onClick={act.action}
                className={`w-10 h-10 rounded-full ${act.color} text-white flex items-center justify-center shadow-md transition-transform active:scale-95`}
              >
                <Icon size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Primary Android FAB Button */}
      <button
        id="main-fab-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-13 h-13 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/30 transition-all duration-200 z-20 active:scale-95 ${
          isOpen ? 'rotate-45 bg-slate-900 hover:bg-slate-800 shadow-none' : ''
        }`}
        title="Quick Actions"
      >
        {isOpen ? <X size={22} /> : <Plus size={24} strokeWidth={2.5} />}
      </button>
    </div>
  );
};
