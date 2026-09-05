import React, { useState, useEffect } from 'react';
import { X, CalendarClock, AlertCircle } from 'lucide-react';
import { Deadline, DeadlinePriority, DeadlineType, DeadlineStatus, Subject } from '../../types';

interface AddDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deadline: Deadline) => void;
  subjects: Subject[];
  initialDeadline?: Deadline | null;
  defaultSubjectId?: string;
}

const PRIORITIES: { id: DeadlinePriority; label: string; color: string }[] = [
  { id: 'urgent', label: 'Urgent (<48h)', color: 'text-rose-700 bg-rose-50 border-rose-200 ring-rose-200' },
  { id: 'high', label: 'High Priority', color: 'text-amber-700 bg-amber-50 border-amber-200 ring-amber-200' },
  { id: 'medium', label: 'Medium', color: 'text-blue-700 bg-blue-50 border-blue-200 ring-blue-200' },
  { id: 'low', label: 'Low', color: 'text-slate-600 bg-slate-50 border-slate-200 ring-slate-200' },
];

const TYPES: { id: DeadlineType; label: string }[] = [
  { id: 'assignment', label: 'Assignment / Homework' },
  { id: 'exam', label: 'Exam (Midterm/Final)' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'project', label: 'Course Project' },
  { id: 'lab', label: 'Lab Report' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'reading', label: 'Required Reading' },
];

export const AddDeadlineModal: React.FC<AddDeadlineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  initialDeadline,
  defaultSubjectId,
}) => {
  const getDefaultDate = () => {
    const d = new Date(Date.now() + 86400000 * 2);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [subjectId, setSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(getDefaultDate());
  const [priority, setPriority] = useState<DeadlinePriority>('high');
  const [type, setType] = useState<DeadlineType>('assignment');
  const [status, setStatus] = useState<DeadlineStatus>('pending');
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialDeadline) {
      setSubjectId(initialDeadline.subjectId);
      setTitle(initialDeadline.title || '');
      setDueDate(
        initialDeadline.dueDate
          ? initialDeadline.dueDate.slice(0, 16)
          : getDefaultDate()
      );
      setPriority(initialDeadline.priority || 'high');
      setType(initialDeadline.type || 'assignment');
      setStatus(initialDeadline.status || 'pending');
      setWeight(initialDeadline.weightPercentage);
      setDescription(initialDeadline.description || '');
      setErrorMsg('');
    } else {
      setSubjectId(defaultSubjectId || subjects[0]?.id || '');
      setTitle('');
      setDueDate(getDefaultDate());
      setPriority('high');
      setType('assignment');
      setStatus('pending');
      setWeight(undefined);
      setDescription('');
      setErrorMsg('');
    }
  }, [initialDeadline, isOpen, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please provide a title for this deadline.');
      return;
    }
    if (!subjectId) {
      setErrorMsg('Please choose a subject.');
      return;
    }

    const deadline: Deadline = {
      id: initialDeadline?.id || `dl-${Date.now()}`,
      subjectId,
      title: title.trim(),
      dueDate: new Date(dueDate).toISOString(),
      priority,
      type,
      status,
      weightPercentage: weight ? Number(weight) : undefined,
      description: description.trim() || undefined,
      completedAt: status === 'completed' ? initialDeadline?.completedAt || new Date().toISOString() : undefined,
    };

    onSave(deadline);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initialDeadline ? 'Edit Deadline' : 'Track New Deadline'}
            </h3>
            <p className="text-xs text-slate-500">Exams, assignments, and milestones</p>
          </div>
          <button
            id="close-add-deadline-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Task / Exam Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Midterm 1: Chapters 1-5 or Lab Report 2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Subject & Due Date */}
          <div className="grid grid-cols-2 gap-2.5">
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
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Type and Weight */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Category Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DeadlineType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Grade Weight (% of Total)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 15"
                value={weight ?? ''}
                onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Priority Selection */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition text-left ${
                      isSelected
                        ? `${p.color} ring-2 ring-blue-600 shadow-xs font-bold`
                        : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status (if editing) */}
          {initialDeadline && (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Status
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                {(['pending', 'in_progress', 'completed'] as DeadlineStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 py-1.5 rounded-md font-medium capitalize transition ${
                      status === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Instructions / Submission Guidelines
            </label>
            <textarea
              rows={2}
              placeholder="What to bring, submission portal link, or specific rubrics..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white resize-none transition"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              id="save-deadline-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              {initialDeadline ? 'Update Deadline' : 'Set Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
