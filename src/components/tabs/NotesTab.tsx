import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Pin, 
  Sparkles, 
  Tag, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Calendar 
} from 'lucide-react';
import { StudyNote, Subject } from '../../types';
import { COLOR_MAP } from '../../utils/helpers';
import { ConfirmModal } from '../modals/ConfirmModal';

interface NotesTabProps {
  notes: StudyNote[];
  subjects: Subject[];
  searchQuery: string;
  onSelectNote: (note: StudyNote) => void;
  onAddNote: () => void;
  onEditNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (note: StudyNote) => void;
}

export const NotesTab: React.FC<NotesTabProps> = ({
  notes,
  subjects,
  searchQuery,
  onSelectNote,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTogglePin,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [noteToDelete, setNoteToDelete] = useState<StudyNote | null>(null);

  const filteredNotes = notes
    .filter((n) => {
      const matchesSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        n.chapter?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubject = selectedSubjectId === 'all' || n.subjectId === selectedSubjectId;

      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="p-4 space-y-4 pb-24 animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Study Notes & Flashcards</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Summaries, formulas & active recall questions</p>
        </div>
        <button
          id="tab-add-note-btn"
          onClick={onAddNote}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter by Subject Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            selectedSubjectId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Notes ({notes.length})
        </button>
        {subjects.map((sub) => {
          const count = notes.filter((n) => n.subjectId === sub.id).length;
          const isSelected = selectedSubjectId === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSelectedSubjectId(sub.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sub.code} ({count})
            </button>
          );
        })}
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 text-xs space-y-3">
          <BookOpen size={32} className="mx-auto text-slate-400 dark:text-slate-500 opacity-70" />
          <p>No study notes found.</p>
          <button
            onClick={onAddNote}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredNotes.map((note) => {
            const sub = subjects.find((s) => s.id === note.subjectId);
            const colorDef = sub ? COLOR_MAP[sub.color] : COLOR_MAP.indigo;

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`p-4 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 rounded-xl border transition-all cursor-pointer group shadow-sm ${
                  note.isPinned
                    ? 'border-amber-300 dark:border-amber-600/80 bg-amber-50/15 dark:bg-amber-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Note Top Bar */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {sub && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colorDef.badgeBg} ${colorDef.badgeText}`}>
                        {sub.code}
                      </span>
                    )}
                    {note.chapter && (
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {note.chapter}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(note);
                      }}
                      className={`p-1.5 rounded-lg transition ${
                        note.isPinned
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin size={13} className={note.isPinned ? 'fill-amber-600 dark:fill-amber-400' : ''} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditNote(note);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Edit Note"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Note Title */}
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mt-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  {note.title}
                </h3>

                {/* Summary or Preview snippet */}
                {note.summary ? (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    💡 {note.summary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`[\]]/g, '')}
                  </p>
                )}

                {/* Tags and Flashcard count badges */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {note.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      >
                        #{t}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-slate-400 dark:text-slate-500">+{note.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-medium">
                    {note.flashcards && note.flashcards.length > 0 && (
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60">
                        <Sparkles size={11} />
                        {note.flashcards.length} cards
                      </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500">
                      {new Date(note.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!noteToDelete}
        title="Delete Study Note?"
        message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
        confirmLabel="Delete Note"
        isDestructive={true}
        onConfirm={() => {
          if (noteToDelete) {
            onDeleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        onClose={() => setNoteToDelete(null)}
      />
    </div>
  );
};
