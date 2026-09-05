import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pin, 
  Sparkles, 
  Eye, 
  Edit3, 
  CheckSquare, 
  Code, 
  Heading, 
  Bold, 
  Plus, 
  Trash2, 
  Share2, 
  Check 
} from 'lucide-react';
import { StudyNote, Flashcard, Subject } from '../../types';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: StudyNote) => void;
  subjects: Subject[];
  initialNote?: StudyNote | null;
  defaultSubjectId?: string;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialNote,
  defaultSubjectId,
}) => {
  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  // UI state: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'flashcards'>('edit');
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // New flashcard inputs
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    if (initialNote) {
      setSubjectId(initialNote.subjectId);
      setTitle(initialNote.title || '');
      setChapter(initialNote.chapter || '');
      setContent(initialNote.content || '');
      setSummary(initialNote.summary || '');
      setIsPinned(initialNote.isPinned || false);
      setTags(initialNote.tags || []);
      setFlashcards(initialNote.flashcards || []);
      setActiveTab('edit');
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setTitle('');
      setChapter('');
      setContent('');
      setSummary('');
      setIsPinned(false);
      setTags([]);
      setFlashcards([]);
      setActiveTab('edit');
    }
  }, [initialNote, isOpen, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleInsertFormatting = (prefix: string, suffix = '') => {
    const textarea = document.getElementById('note-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || 'text') + suffix;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
  };

  const handleAddFlashcard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFlashcards([
      ...flashcards,
      {
        id: `fc-${Date.now()}`,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      },
    ]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleRemoveFlashcard = (id: string) => {
    setFlashcards(flashcards.filter((fc) => fc.id !== id));
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(`# ${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const note: StudyNote = {
      id: initialNote?.id || `note-${Date.now()}`,
      subjectId,
      title: title.trim(),
      chapter: chapter.trim() || undefined,
      content,
      summary: summary.trim() || undefined,
      isPinned,
      tags,
      flashcards,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-lg border transition ${
                isPinned
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'border-slate-200 text-slate-400 hover:text-slate-700'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin size={16} className={isPinned ? 'fill-amber-500' : ''} />
            </button>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialNote ? 'Edit Study Note' : 'New Study Note'}
              </h3>
              <p className="text-[11px] text-slate-500">Organize key concepts, formulas & flashcards</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              title="Copy as Markdown"
            >
              {copied ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>
            <button
              id="close-note-editor-modal-btn"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-2 py-2.5 shrink-0 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'edit'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Edit3 size={13} />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Eye size={13} />
            <span>Read View</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'flashcards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={13} />
            <span>Flashcards ({flashcards.length})</span>
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1">
          {activeTab === 'edit' && (
            <>
              {/* Title & Subject */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Note Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Theorem & Recurrence Relations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Subject *
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter & Key Summary */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Chapter / Topic Module
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Module 3: Divide & Conquer"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Quick Key Takeaway
                  </label>
                  <input
                    type="text"
                    placeholder="One sentence summary..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Quick Markdown Toolbar */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('# ')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 font-semibold"
                  title="H1 Heading"
                >
                  <Heading size={13} /> H1
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('## ')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 font-semibold"
                  title="H2 Heading"
                >
                  <Heading size={11} /> H2
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('**', '**')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1 font-bold"
                  title="Bold"
                >
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('- [ ] ')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1"
                  title="Checklist Item"
                >
                  <CheckSquare size={13} /> Task
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('```\n', '\n```')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-1"
                  title="Code Block"
                >
                  <Code size={13} /> Code
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertFormatting('- ')}
                  className="px-2 py-1 hover:bg-slate-200 rounded text-slate-700"
                  title="Bullet Point"
                >
                  • Bullet
                </button>
              </div>

              {/* Content Textarea */}
              <div>
                <textarea
                  id="note-content-textarea"
                  rows={9}
                  placeholder="Write your study notes, formulas, theorems, and exam checklists here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none leading-relaxed transition"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Midterm, Chapter2, Formulas"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-600"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-blue-600 font-semibold tracking-wider uppercase">
                  {chapter || 'General Study Note'}
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-0.5">{title || 'Untitled Note'}</h2>
                {summary && (
                  <p className="text-xs text-slate-700 mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                    💡 <span className="font-semibold text-blue-900">Takeaway:</span> {summary}
                  </p>
                )}
              </div>

              <div className="prose max-w-none text-xs leading-relaxed space-y-2 text-slate-700">
                {content ? (
                  content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return (
                        <h1 key={idx} className="text-sm font-bold text-slate-900 mt-3 pb-1 border-b border-slate-200">
                          {line.replace('# ', '')}
                        </h1>
                      );
                    }
                    if (line.startsWith('## ')) {
                      return (
                        <h2 key={idx} className="text-xs font-bold text-slate-900 mt-2">
                          {line.replace('## ', '')}
                        </h2>
                      );
                    }
                    if (line.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-xs font-semibold text-slate-800 mt-1.5">
                          {line.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (line.startsWith('- [x] ') || line.startsWith('- [ ] ')) {
                      const isChecked = line.startsWith('- [x] ');
                      return (
                        <div key={idx} className="flex items-center gap-2 pl-1 py-0.5 text-slate-700">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={isChecked ? 'line-through text-slate-400' : ''}>
                            {line.replace(/- \[[ x]\] /, '')}
                          </span>
                        </div>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <li key={idx} className="list-disc list-inside text-slate-700 pl-1">
                          {line.replace('- ', '')}
                        </li>
                      );
                    }
                    if (line.startsWith('```')) {
                      return null;
                    }
                    if (!line.trim()) {
                      return <div key={idx} className="h-1" />;
                    }
                    return <p key={idx} className="text-slate-700">{line}</p>;
                  })
                ) : (
                  <p className="text-slate-400 italic">No note content written yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="space-y-4">
              {/* Interactive Flashcard Preview */}
              {flashcards.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Card {activeFlashcardIndex + 1} of {flashcards.length}</span>
                    <span>Tap card to reveal answer</span>
                  </div>

                  {/* 3D Flashcard */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="min-h-[160px] p-5 rounded-xl bg-linear-to-br from-blue-50/50 via-white to-slate-50 border border-blue-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer transition-transform hover:scale-[1.01] relative select-none"
                  >
                    <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 mb-2">
                      {isFlipped ? 'Answer' : 'Question / Prompt'}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                      {isFlipped
                        ? flashcards[activeFlashcardIndex]?.answer
                        : flashcards[activeFlashcardIndex]?.question}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-4">
                      {isFlipped ? 'Tap to see question' : 'Tap to flip'}
                    </span>
                  </div>

                  {/* Navigation between cards */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 rounded-lg transition"
                    >
                      ← Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFlipped(false);
                        setActiveFlashcardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs text-white rounded-lg transition font-medium shadow-xs"
                    >
                      Next Card →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  No flashcards attached yet. Add questions below for active recall study!
                </div>
              )}

              {/* Add New Flashcard Form */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Plus size={14} className="text-blue-600" />
                  <span>Create Flashcard</span>
                </span>
                <input
                  type="text"
                  placeholder="Question / Term (e.g. What is Dijkstra's time complexity?)"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition"
                />
                <textarea
                  rows={2}
                  placeholder="Answer / Key Formula"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none transition"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddFlashcard}
                    disabled={!newQuestion.trim() || !newAnswer.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white rounded-lg transition shadow-xs"
                  >
                    Add to Note
                  </button>
                </div>
              </div>

              {/* Card List with Delete */}
              {flashcards.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Attached Cards ({flashcards.length})</span>
                  {flashcards.map((fc, index) => (
                    <div
                      key={fc.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-semibold text-slate-800 truncate">
                          {index + 1}. {fc.question}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">{fc.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFlashcard(fc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            id="save-note-submit-btn"
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
          >
            {initialNote ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
};
