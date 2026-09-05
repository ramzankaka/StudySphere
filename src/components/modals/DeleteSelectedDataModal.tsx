import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  X, 
  Search, 
  Layers, 
  FileText, 
  CalendarClock, 
  BookOpen, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';
import { Subject, Material, Deadline, StudyNote } from '../../types';

interface DeleteSelectedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  materials: Material[];
  deadlines: Deadline[];
  notes: StudyNote[];
  onDeleteSelected: (selection: {
    subjectIds: string[];
    materialIds: string[];
    deadlineIds: string[];
    noteIds: string[];
  }) => Promise<void> | void;
}

type ItemType = 'all' | 'subjects' | 'materials' | 'deadlines' | 'notes';

export const DeleteSelectedDataModal: React.FC<DeleteSelectedDataModalProps> = ({
  isOpen,
  onClose,
  subjects,
  materials,
  deadlines,
  notes,
  onDeleteSelected,
}) => {
  const [activeType, setActiveType] = useState<ItemType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [selectedDeadlineIds, setSelectedDeadlineIds] = useState<Set<string>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  // Filter items
  const filteredSubjects = useMemo(() => {
    if (activeType !== 'all' && activeType !== 'subjects') return [];
    return subjects.filter((s) => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery, activeType]);

  const filteredMaterials = useMemo(() => {
    if (activeType !== 'all' && activeType !== 'materials') return [];
    return materials.filter((m) => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [materials, searchQuery, activeType]);

  const filteredDeadlines = useMemo(() => {
    if (activeType !== 'all' && activeType !== 'deadlines') return [];
    return deadlines.filter((d) => 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deadlines, searchQuery, activeType]);

  const filteredNotes = useMemo(() => {
    if (activeType !== 'all' && activeType !== 'notes') return [];
    return notes.filter((n) => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery, activeType]);

  const totalSelectedCount = 
    selectedSubjectIds.size + 
    selectedMaterialIds.size + 
    selectedDeadlineIds.size + 
    selectedNoteIds.size;

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    const next = new Set(selectedSubjectIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSubjectIds(next);
  };

  const toggleMaterial = (id: string) => {
    const next = new Set(selectedMaterialIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMaterialIds(next);
  };

  const toggleDeadline = (id: string) => {
    const next = new Set(selectedDeadlineIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedDeadlineIds(next);
  };

  const toggleNote = (id: string) => {
    const next = new Set(selectedNoteIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedNoteIds(next);
  };

  const handleSelectAllFiltered = () => {
    const newSubjects = new Set(selectedSubjectIds);
    filteredSubjects.forEach((s) => newSubjects.add(s.id));
    setSelectedSubjectIds(newSubjects);

    const newMaterials = new Set(selectedMaterialIds);
    filteredMaterials.forEach((m) => newMaterials.add(m.id));
    setSelectedMaterialIds(newMaterials);

    const newDeadlines = new Set(selectedDeadlineIds);
    filteredDeadlines.forEach((d) => newDeadlines.add(d.id));
    setSelectedDeadlineIds(newDeadlines);

    const newNotes = new Set(selectedNoteIds);
    filteredNotes.forEach((n) => newNotes.add(n.id));
    setSelectedNoteIds(newNotes);
  };

  const handleClearSelection = () => {
    setSelectedSubjectIds(new Set());
    setSelectedMaterialIds(new Set());
    setSelectedDeadlineIds(new Set());
    setSelectedNoteIds(new Set());
  };

  const handleExecuteDelete = async () => {
    if (totalSelectedCount === 0 || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDeleteSelected({
        subjectIds: Array.from(selectedSubjectIds),
        materialIds: Array.from(selectedMaterialIds),
        deadlineIds: Array.from(selectedDeadlineIds),
        noteIds: Array.from(selectedNoteIds),
      });
      handleClearSelection();
      setConfirmStep(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-selected-title"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 id="delete-selected-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Delete Selected Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose specific subjects, documents, tasks, or notes to remove
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by title, code, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
              />
            </div>

            {/* Selection Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                Select Filtered
              </button>
              {totalSelectedCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
                >
                  Clear ({totalSelectedCount})
                </button>
              )}
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {[
              { id: 'all' as ItemType, label: 'All Items' },
              { id: 'subjects' as ItemType, label: `Subjects (${subjects.length})`, icon: Layers },
              { id: 'materials' as ItemType, label: `Documents (${materials.length})`, icon: FileText },
              { id: 'deadlines' as ItemType, label: `Deadlines (${deadlines.length})`, icon: CalendarClock },
              { id: 'notes' as ItemType, label: `Notes (${notes.length})`, icon: BookOpen },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition ${
                  activeType === tab.id
                    ? 'bg-rose-500 text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Subjects Group */}
          {filteredSubjects.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <Layers size={13} />
                <span>Subjects ({filteredSubjects.length})</span>
              </div>
              <div className="space-y-1">
                {filteredSubjects.map((s) => {
                  const isChecked = selectedSubjectIds.has(s.id);
                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSubject(s.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {s.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {s.code} • {s.term}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        Subject
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Materials Group */}
          {filteredMaterials.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <FileText size={13} />
                <span>Course Documents ({filteredMaterials.length})</span>
              </div>
              <div className="space-y-1">
                {filteredMaterials.map((m) => {
                  const isChecked = selectedMaterialIds.has(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMaterial(m.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {m.title}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {m.fileName} • {m.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        Document
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Deadlines Group */}
          {filteredDeadlines.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <CalendarClock size={13} />
                <span>Deadlines ({filteredDeadlines.length})</span>
              </div>
              <div className="space-y-1">
                {filteredDeadlines.map((d) => {
                  const isChecked = selectedDeadlineIds.has(d.id);
                  return (
                    <div
                      key={d.id}
                      onClick={() => toggleDeadline(d.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {d.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Due {new Date(d.dueDate).toLocaleDateString()} • {d.category}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        Deadline
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes Group */}
          {filteredNotes.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                <BookOpen size={13} />
                <span>Study Notes ({filteredNotes.length})</span>
              </div>
              <div className="space-y-1">
                {filteredNotes.map((n) => {
                  const isChecked = selectedNoteIds.has(n.id);
                  return (
                    <div
                      key={n.id}
                      onClick={() => toggleNote(n.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer select-none ${
                        isChecked
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <Square size={16} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">
                            {n.content.slice(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                        Note
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filteredSubjects.length === 0 &&
            filteredMaterials.length === 0 &&
            filteredDeadlines.length === 0 &&
            filteredNotes.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                No items match your filter criteria.
              </div>
            )}
        </div>

        {/* Confirmation Step Sub-banner if confirmStep is active */}
        {confirmStep && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/40 flex items-center justify-between gap-3 text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-600 shrink-0" />
              <span>
                Permanently delete these <strong>{totalSelectedCount}</strong> selected items?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmStep(false)}
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-rose-100/50 rounded-lg text-xs"
              >
                No, cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition shadow-2xs"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Selected:{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {totalSelectedCount}
            </strong>{' '}
            items
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl transition"
            >
              Close
            </button>
            {!confirmStep && (
              <button
                id="execute-delete-selected-btn"
                type="button"
                disabled={totalSelectedCount === 0}
                onClick={() => setConfirmStep(true)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white transition shadow-xs ${
                  totalSelectedCount > 0
                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-98 cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 size={14} />
                <span>Delete Selected ({totalSelectedCount})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
