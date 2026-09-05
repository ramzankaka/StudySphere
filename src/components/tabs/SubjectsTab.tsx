import React, { useState } from 'react';
import { Plus, Search, FileText, CalendarClock, BookOpen, MoreVertical, Edit3, Trash2 } from 'lucide-react';
import { Subject, Material, Deadline, StudyNote } from '../../types';
import { COLOR_MAP, getSubjectIcon } from '../../utils/helpers';
import { ConfirmModal } from '../modals/ConfirmModal';

interface SubjectsTabProps {
  subjects: Subject[];
  materials: Material[];
  deadlines: Deadline[];
  notes: StudyNote[];
  searchQuery: string;
  onSelectSubject: (subject: Subject) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  materials,
  deadlines,
  notes,
  searchQuery,
  onSelectSubject,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
}) => {
  const [activeTermFilter, setActiveTermFilter] = useState<string>('All');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Available terms for chips
  const terms = ['All', ...Array.from(new Set(subjects.map((s) => s.term).filter(Boolean)))];

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructor?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTerm = activeTermFilter === 'All' || s.term === activeTermFilter;

    return matchesSearch && matchesTerm;
  });

  return (
    <div className="p-4 space-y-4 pb-24 animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Header with Title & Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Enrolled Subjects</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage courses, instructors & requirements</p>
        </div>
        <button
          id="add-subject-btn"
          onClick={onAddSubject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>New Subject</span>
        </button>
      </div>

      {/* Term Filter Chips (if multiple terms exist) */}
      {terms.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {terms.map((term) => (
            <button
              key={term as string}
              onClick={() => setActiveTermFilter(term as string)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTermFilter === term
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 text-xs space-y-2">
          <p>No subjects found matching your criteria.</p>
          <button
            onClick={onAddSubject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Add Your First Subject
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSubjects.map((sub) => {
            const colorDef = COLOR_MAP[sub.color];
            const Icon = getSubjectIcon(sub.icon);
            const subMaterials = materials.filter((m) => m.subjectId === sub.id);
            const subDeadlines = deadlines.filter((d) => d.subjectId === sub.id && d.status !== 'completed');
            const subNotes = notes.filter((n) => n.subjectId === sub.id);

            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Top Accent bar */}
                <div className={`h-1.5 w-full ${colorDef.accent}`} />

                <div className="p-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      onClick={() => onSelectSubject(sub)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    >
                      <div className={`w-11 h-11 rounded-xl ${colorDef.badgeBg} ${colorDef.text} flex items-center justify-center shrink-0 shadow-xs`}>
                        <Icon size={22} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                            {sub.code}
                          </span>
                          {sub.targetGrade && (
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-md">
                              Goal: {sub.targetGrade}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1 truncate hover:text-blue-600 dark:hover:text-blue-400 transition">
                          {sub.name}
                        </h3>
                      </div>
                    </div>

                    {/* Context Action Menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuId(actionMenuId === sub.id ? null : sub.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {actionMenuId === sub.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1 z-20 text-xs font-medium text-slate-700 dark:text-slate-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuId(null);
                                onEditSubject(sub);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                              <Edit3 size={13} className="text-blue-600 dark:text-blue-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuId(null);
                                setSubjectToDelete(sub);
                              }}
                              className="w-full px-3 py-1.5 flex items-center gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Instructor & Location info */}
                  {(sub.instructor || sub.room) && (
                    <div className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      {sub.instructor && <span>Prof. {sub.instructor}</span>}
                      {sub.room && <span>• {sub.room}</span>}
                    </div>
                  )}

                  {/* Metrics Footer */}
                  <div
                    onClick={() => onSelectSubject(sub)}
                    className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold">{subMaterials.length}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">docs</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <CalendarClock size={13} className="text-rose-600 dark:text-rose-400" />
                      <span className="font-semibold">{subDeadlines.length}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">tasks</span>
                    </div>

                    <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-300">
                      <BookOpen size={13} className="text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">{subNotes.length}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">notes</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!subjectToDelete}
        title="Delete Subject?"
        message={`Are you sure you want to delete "${subjectToDelete?.name}" (${subjectToDelete?.code})?`}
        confirmLabel="Delete Subject"
        isDestructive={true}
        onConfirm={() => {
          if (subjectToDelete) {
            onDeleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
          }
        }}
        onClose={() => setSubjectToDelete(null)}
      />
    </div>
  );
};
