import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  Trash2, 
  Mail, 
  MapPin, 
  GraduationCap, 
  UploadCloud, 
  CalendarClock, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus,
  Download
} from 'lucide-react';
import { Subject, Material, Deadline, StudyNote } from '../../types';
import { COLOR_MAP, getSubjectIcon, formatFileSize, formatRelativeDueDate, getPriorityBadge } from '../../utils/helpers';
import { ConfirmModal } from './ConfirmModal';
import { downloadMaterialFile } from '../../utils/fileViewer';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (subject: Subject) => void;
  onDelete: (id: string) => void;
  materials: Material[];
  deadlines: Deadline[];
  notes: StudyNote[];
  onSelectMaterial: (m: Material) => void;
  onSelectNote: (n: StudyNote) => void;
  onToggleDeadline: (d: Deadline) => void;
  onQuickUpload: () => void;
  onQuickAddDeadline: () => void;
  onQuickAddNote: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({
  subject,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  materials,
  deadlines,
  notes,
  onSelectMaterial,
  onSelectNote,
  onToggleDeadline,
  onQuickUpload,
  onQuickAddDeadline,
  onQuickAddNote,
}) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'deadlines' | 'notes' | 'info'>('materials');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !subject) return null;

  const colorDef = COLOR_MAP[subject.color];
  const IconComponent = getSubjectIcon(subject.icon);

  const subjectMaterials = materials.filter((m) => m.subjectId === subject.id);
  const subjectDeadlines = deadlines.filter((d) => d.subjectId === subject.id);
  const subjectNotes = notes.filter((n) => n.subjectId === subject.id);

  const pendingDeadlines = subjectDeadlines.filter((d) => d.status !== 'completed');
  const completedDeadlines = subjectDeadlines.filter((d) => d.status === 'completed');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-slate-800">
        {/* Banner Header with Subject's Color */}
        <div className={`p-5 bg-gradient-to-r ${colorDef.gradient} text-white shrink-0 relative overflow-hidden`}>
          {/* Subtle geometric pattern */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <IconComponent size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-black/30 backdrop-blur-xs text-white">
                    {subject.code}
                  </span>
                  <span className="text-xs opacity-90 font-medium">
                    {subject.credits} Credits • Goal: {subject.targetGrade}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold tracking-tight mt-1">{subject.name}</h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(subject)}
                className="p-2 bg-black/20 hover:bg-black/30 rounded-lg backdrop-blur-xs transition"
                title="Edit Subject"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-black/20 hover:bg-rose-600/80 rounded-lg backdrop-blur-xs transition"
                title="Delete Subject"
              >
                <Trash2 size={16} />
              </button>
              <button
                id="close-subject-detail-modal-btn"
                onClick={onClose}
                className="p-2 bg-black/20 hover:bg-black/30 rounded-lg backdrop-blur-xs transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick stats ribbon */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-center text-xs">
            <div>
              <span className="text-sm font-bold">{subjectMaterials.length}</span>
              <p className="text-[10px] opacity-80">Documents</p>
            </div>
            <div>
              <span className="text-sm font-bold">{pendingDeadlines.length}</span>
              <p className="text-[10px] opacity-80">Pending Tasks</p>
            </div>
            <div>
              <span className="text-sm font-bold">{subjectNotes.length}</span>
              <p className="text-[10px] opacity-80">Study Notes</p>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center justify-around bg-slate-50 border-b border-slate-200 px-2 py-1 text-xs shrink-0 select-none">
          {[
            { id: 'materials', label: `Docs (${subjectMaterials.length})`, icon: FileText },
            { id: 'deadlines', label: `Deadlines (${pendingDeadlines.length})`, icon: CalendarClock },
            { id: 'notes', label: `Notes (${subjectNotes.length})`, icon: BookOpen },
            { id: 'info', label: 'Syllabus & Info', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 font-semibold flex items-center gap-1.5 transition border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-700 bg-white font-bold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {/* MATERIALS TAB */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Subject Files & Cheatsheets</span>
                <button
                  onClick={onQuickUpload}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <UploadCloud size={14} />
                  <span>Upload</span>
                </button>
              </div>

              {subjectMaterials.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No materials uploaded for {subject.name} yet. Tap Upload to store slides, syllabi, or past exams.
                </div>
              ) : (
                <div className="space-y-2">
                  {subjectMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => onSelectMaterial(mat)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between gap-3 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{mat.title}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {mat.category} • {formatFileSize(mat.fileSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadMaterialFile(mat);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 transition"
                          title="Download File to Device"
                        >
                          <Download size={13} />
                        </button>
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-200/80 text-slate-700">
                          Options
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DEADLINES TAB */}
          {activeTab === 'deadlines' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Assignments & Exams</span>
                <button
                  onClick={onQuickAddDeadline}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus size={14} />
                  <span>Add Deadline</span>
                </button>
              </div>

              {subjectDeadlines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No upcoming deadlines recorded for this course.
                </div>
              ) : (
                <div className="space-y-2">
                  {subjectDeadlines.map((dl) => {
                    const isDone = dl.status === 'completed';
                    const relative = formatRelativeDueDate(dl.dueDate);
                    const pBadge = getPriorityBadge(dl.priority);

                    return (
                      <div
                        key={dl.id}
                        className={`p-3 bg-slate-50 rounded-xl border transition flex items-start gap-3 ${
                          isDone ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <button
                          onClick={() => onToggleDeadline(dl)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 size={14} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pBadge.bg} ${pBadge.text}`}>
                              {pBadge.label}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              {dl.type}
                            </span>
                            {dl.weightPercentage && (
                              <span className="text-[10px] font-mono font-semibold text-blue-600">
                                {dl.weightPercentage}%
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-bold mt-1 text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {dl.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                            <Clock size={12} />
                            <span className={relative.isOverdue && !isDone ? 'text-rose-600 font-semibold' : ''}>
                              {relative.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Course Study Notes</span>
                <button
                  onClick={onQuickAddNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  <Plus size={14} />
                  <span>New Note</span>
                </button>
              </div>

              {subjectNotes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  No notes recorded yet for this course. Start jotting key formulas and lecture takeaways!
                </div>
              ) : (
                <div className="space-y-2">
                  {subjectNotes.map((note) => (
                    <div
                      key={note.id}
                      onClick={() => onSelectNote(note)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer transition space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-blue-600">
                          {note.chapter || 'Lecture Notes'}
                        </span>
                        {note.flashcards && note.flashcards.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                            {note.flashcards.length} cards
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">{note.title}</h4>
                      {note.summary && (
                        <p className="text-[11px] text-slate-600 line-clamp-2">{note.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INFO & SYLLABUS TAB */}
          {activeTab === 'info' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-blue-600" />
                  <span>Course Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Term / Semester</span>
                    <span className="font-medium">{subject.term || 'Fall 2026'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Credits / Units</span>
                    <span className="font-medium">{subject.credits} Units</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Target Grade</span>
                    <span className="font-semibold text-emerald-600">{subject.targetGrade || 'A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Course Code</span>
                    <span className="font-mono font-medium">{subject.code}</span>
                  </div>
                </div>
              </div>

              {(subject.instructor || subject.room) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800">Instructor & Logistics</h4>
                  {subject.instructor && (
                    <p className="text-slate-700 font-medium">
                      Instructor: {subject.instructor}
                    </p>
                  )}
                  {subject.instructorEmail && (
                    <a
                      href={`mailto:${subject.instructorEmail}`}
                      className="flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Mail size={13} />
                      <span>{subject.instructorEmail}</span>
                    </a>
                  )}
                  {subject.room && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={13} />
                      <span>{subject.room}</span>
                    </div>
                  )}
                </div>
              )}

              {subject.description && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-800">Syllabus Overview</h4>
                  <p className="text-slate-700 leading-relaxed">{subject.description}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Subject?"
          message={`Are you sure you want to delete "${subject.name}" (${subject.code})? All associated documents, deadlines, and notes will remain in archive.`}
          confirmLabel="Delete Subject"
          isDestructive={true}
          onConfirm={() => {
            onDelete(subject.id);
            onClose();
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};
