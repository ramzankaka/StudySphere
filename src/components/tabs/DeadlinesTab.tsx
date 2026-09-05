import React, { useState } from 'react';
import { 
  CalendarClock, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  Award 
} from 'lucide-react';
import { Deadline, Subject, DeadlineStatus } from '../../types';
import { formatRelativeDueDate, getPriorityBadge, COLOR_MAP } from '../../utils/helpers';
import { ConfirmModal } from '../modals/ConfirmModal';

interface DeadlinesTabProps {
  deadlines: Deadline[];
  subjects: Subject[];
  searchQuery: string;
  onToggleDeadline: (deadline: Deadline) => void;
  onAddDeadline: () => void;
  onEditDeadline: (deadline: Deadline) => void;
  onDeleteDeadline: (id: string) => void;
}

export const DeadlinesTab: React.FC<DeadlinesTabProps> = ({
  deadlines,
  subjects,
  searchQuery,
  onToggleDeadline,
  onAddDeadline,
  onEditDeadline,
  onDeleteDeadline,
}) => {
  const [statusFilter, setStatusFilter] = useState<'upcoming' | 'overdue' | 'completed' | 'all'>('upcoming');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [deadlineToDelete, setDeadlineToDelete] = useState<Deadline | null>(null);

  const now = new Date().getTime();

  const filteredDeadlines = deadlines.filter((d) => {
    const isCompleted = d.status === 'completed';
    const isPast = new Date(d.dueDate).getTime() < now && !isCompleted;

    const matchesSearch =
      !searchQuery ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectId === 'all' || d.subjectId === selectedSubjectId;

    let matchesStatus = true;
    if (statusFilter === 'upcoming') {
      matchesStatus = !isCompleted;
    } else if (statusFilter === 'overdue') {
      matchesStatus = isPast;
    } else if (statusFilter === 'completed') {
      matchesStatus = isCompleted;
    }

    return matchesSearch && matchesSubject && matchesStatus;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Metrics
  const pendingCount = deadlines.filter((d) => d.status !== 'completed').length;
  const overdueCount = deadlines.filter(
    (d) => d.status !== 'completed' && new Date(d.dueDate).getTime() < now
  ).length;
  const completedCount = deadlines.filter((d) => d.status === 'completed').length;

  return (
    <div className="p-4 space-y-4 pb-24 animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Deadlines & Tasks</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Never miss an assignment, quiz, or final exam</p>
        </div>
        <button
          id="tab-add-deadline-btn"
          onClick={onAddDeadline}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus size={15} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Metric summary banner */}
      <div className="grid grid-cols-3 gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center text-xs">
        <button
          onClick={() => setStatusFilter('upcoming')}
          className={`py-1.5 rounded-lg transition ${
            statusFilter === 'upcoming'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm font-extrabold block text-slate-800 dark:text-white">{pendingCount}</span>
          <span className="text-[10px]">Active</span>
        </button>
        <button
          onClick={() => setStatusFilter('overdue')}
          className={`py-1.5 rounded-lg transition ${
            statusFilter === 'overdue'
              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold border border-rose-100 dark:border-rose-900/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm font-extrabold block text-rose-600 dark:text-rose-400">{overdueCount}</span>
          <span className="text-[10px]">Overdue</span>
        </button>
        <button
          onClick={() => setStatusFilter('completed')}
          className={`py-1.5 rounded-lg transition ${
            statusFilter === 'completed'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-900/50'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span className="text-sm font-extrabold block text-emerald-600 dark:text-emerald-400">{completedCount}</span>
          <span className="text-[10px]">Completed</span>
        </button>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            selectedSubjectId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Subjects
        </button>
        {subjects.map((sub) => {
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
              {sub.code}
            </button>
          );
        })}
      </div>

      {/* Deadlines List */}
      {filteredDeadlines.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 text-xs space-y-2">
          <CalendarClock size={32} className="mx-auto text-slate-400 dark:text-slate-500 opacity-70" />
          <p>No deadlines found in this category.</p>
          <button
            onClick={onAddDeadline}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Create New Deadline
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDeadlines.map((dl) => {
            const isCompleted = dl.status === 'completed';
            const sub = subjects.find((s) => s.id === dl.subjectId);
            const colorDef = sub ? COLOR_MAP[sub.color] : COLOR_MAP.indigo;
            const relative = formatRelativeDueDate(dl.dueDate);
            const pBadge = getPriorityBadge(dl.priority);

            return (
              <div
                key={dl.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 relative shadow-xs ${
                  isCompleted
                    ? 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/60 dark:bg-slate-900/40'
                    : relative.isOverdue
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Complete Checkbox */}
                <button
                  onClick={() => onToggleDeadline(dl)}
                  className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-transform active:scale-90 shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-slate-300 dark:border-slate-600 hover:border-blue-600 dark:hover:border-blue-400 text-transparent'
                  }`}
                  title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                >
                  <CheckCircle size={16} />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {sub && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colorDef.badgeBg} ${colorDef.badgeText}`}>
                        {sub.code}
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${pBadge.bg} ${pBadge.text}`}>
                      {pBadge.label}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      {dl.type}
                    </span>
                    {dl.weightPercentage && (
                      <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                        <Award size={11} />
                        {dl.weightPercentage}%
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xs font-bold text-slate-800 dark:text-white mt-1 leading-snug ${
                      isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {dl.title}
                  </h3>

                  {dl.description && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {dl.description}
                    </p>
                  )}

                  {/* Due Date & Countdown */}
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock size={12} className={relative.isUrgent && !isCompleted ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'} />
                    <span className={relative.isOverdue && !isCompleted ? 'text-rose-600 dark:text-rose-400 font-bold' : relative.isUrgent && !isCompleted ? 'text-amber-600 dark:text-amber-400 font-bold' : ''}>
                      {relative.label}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-mono">
                      • {new Date(dl.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEditDeadline(dl)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit Deadline"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => setDeadlineToDelete(dl)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="Delete Deadline"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deadlineToDelete}
        title="Delete Deadline?"
        message={`Are you sure you want to delete "${deadlineToDelete?.title}"?`}
        confirmLabel="Delete Deadline"
        isDestructive={true}
        onConfirm={() => {
          if (deadlineToDelete) {
            onDeleteDeadline(deadlineToDelete.id);
            setDeadlineToDelete(null);
          }
        }}
        onClose={() => setDeadlineToDelete(null)}
      />
    </div>
  );
};
