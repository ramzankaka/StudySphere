import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  X, 
  Search, 
  Layers, 
  FileText, 
  CalendarClock, 
  BookOpen, 
  CheckSquare, 
  Square,
  UploadCloud,
  CheckCircle2
} from 'lucide-react';
import { Subject, Material, Deadline, StudyNote } from '../../types';
import { 
  DEFAULT_SUBJECTS, 
  DEFAULT_MATERIALS, 
  DEFAULT_DEADLINES, 
  DEFAULT_NOTES 
} from '../../db/storage';

interface RestoreSelectedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSelected: (items: {
    subjects?: Subject[];
    materials?: Material[];
    deadlines?: Deadline[];
    notes?: StudyNote[];
  }) => Promise<void> | void;
}

type RestoreSource = 'catalog' | 'file';

export const RestoreSelectedDataModal: React.FC<RestoreSelectedDataModalProps> = ({
  isOpen,
  onClose,
  onRestoreSelected,
}) => {
  const [source, setSource] = useState<RestoreSource>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileData, setFileData] = useState<{
    subjects: Subject[];
    materials: Material[];
    deadlines: Deadline[];
    notes: StudyNote[];
  } | null>(null);

  // Selection states
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<Set<string>>(new Set());
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [selectedDeadlineIds, setSelectedDeadlineIds] = useState<Set<string>>(new Set());
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [isRestoring, setIsRestoring] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Available pools based on source
  const availablePool = useMemo(() => {
    if (source === 'file' && fileData) {
      return fileData;
    }
    return {
      subjects: DEFAULT_SUBJECTS,
      materials: DEFAULT_MATERIALS,
      deadlines: DEFAULT_DEADLINES,
      notes: DEFAULT_NOTES,
    };
  }, [source, fileData]);

  // Filtered lists
  const filteredSubjects = useMemo(() => {
    return availablePool.subjects.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePool.subjects, searchQuery]);

  const filteredMaterials = useMemo(() => {
    return availablePool.materials.filter((m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePool.materials, searchQuery]);

  const filteredDeadlines = useMemo(() => {
    return availablePool.deadlines.filter((d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePool.deadlines, searchQuery]);

  const filteredNotes = useMemo(() => {
    return availablePool.notes.filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePool.notes, searchQuery]);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setFileData({
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
          materials: Array.isArray(parsed.materials) ? parsed.materials : [],
          deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        });
        setSource('file');
        handleClearSelection();
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteRestore = async () => {
    if (totalSelectedCount === 0 || isRestoring) return;
    setIsRestoring(true);
    try {
      const subjectsToRestore = availablePool.subjects.filter((s) => selectedSubjectIds.has(s.id));
      const materialsToRestore = availablePool.materials.filter((m) => selectedMaterialIds.has(m.id));
      const deadlinesToRestore = availablePool.deadlines.filter((d) => selectedDeadlineIds.has(d.id));
      const notesToRestore = availablePool.notes.filter((n) => selectedNoteIds.has(n.id));

      await onRestoreSelected({
        subjects: subjectsToRestore,
        materials: materialsToRestore,
        deadlines: deadlinesToRestore,
        notes: notesToRestore,
      });

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onClose();
      }, 1000);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="restore-selected-title"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 id="restore-selected-title" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Restore Selected Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose which sample courses or backup items to restore into your workspace
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

        {/* Source Switcher */}
        <div className="px-6 pt-3 pb-2 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSource('catalog');
                handleClearSelection();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                source === 'catalog'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Academic Catalog Samples
            </button>

            <label className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              source === 'file'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}>
              <UploadCloud size={14} />
              <span>{fileData ? 'Backup File Loaded' : 'Load from JSON File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
            >
              Select Filtered
            </button>
            {totalSelectedCount > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items to restore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
            />
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
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
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
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
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
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
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
                          ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-900/50'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
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
        </div>

        {/* Success Feedback Banner */}
        {showSuccessToast && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-t border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 size={16} />
            <span>Selected items restored successfully into your workspace!</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Selected to restore:{' '}
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
              Cancel
            </button>
            <button
              id="execute-restore-selected-btn"
              type="button"
              disabled={totalSelectedCount === 0 || isRestoring}
              onClick={handleExecuteRestore}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white transition shadow-xs ${
                totalSelectedCount > 0 && !isRestoring
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-98 cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={14} />
              <span>{isRestoring ? 'Restoring...' : `Restore Selected (${totalSelectedCount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
