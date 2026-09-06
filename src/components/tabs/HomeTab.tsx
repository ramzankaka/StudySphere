import React from 'react';
import { 
  CalendarClock, 
  Layers, 
  FileText, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  UploadCloud, 
  ArrowRight, 
  Timer, 
  AlertCircle,
  Plus,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Subject, Material, Deadline, StudyNote, AppTab } from '../../types';
import { COLOR_MAP, getSubjectIcon, formatRelativeDueDate, getPriorityBadge } from '../../utils/helpers';
import { openWithDeviceApp } from '../../utils/fileViewer';

interface HomeTabProps {
  subjects: Subject[];
  materials: Material[];
  deadlines: Deadline[];
  notes: StudyNote[];
  onNavigateTab: (tab: AppTab) => void;
  onSelectSubject: (subject: Subject) => void;
  onSelectMaterial: (material: Material) => void;
  onSelectNote: (note: StudyNote) => void;
  onToggleDeadline: (deadline: Deadline) => void;
  onOpenTimer: () => void;
  onQuickUpload: () => void;
  onQuickAddDeadline: () => void;
  onQuickAddSubject: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  subjects,
  materials,
  deadlines,
  notes,
  onNavigateTab,
  onSelectSubject,
  onSelectMaterial,
  onSelectNote,
  onToggleDeadline,
  onOpenTimer,
  onQuickUpload,
  onQuickAddDeadline,
}) => {
  const pendingDeadlines = deadlines
    .filter((d) => d.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const urgentDeadlines = pendingDeadlines.filter((d) => {
    const diffHours = (new Date(d.dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
    return diffHours < 48 || d.priority === 'urgent';
  });

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
    .slice(0, 3);

  const completedCount = deadlines.filter((d) => d.status === 'completed').length;
  const completionRate = deadlines.length > 0 ? Math.round((completedCount / deadlines.length) * 100) : 100;

  return (
    <div className="p-4 space-y-5 pb-24 animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Subject Overview & Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Academic Dashboard
            </span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
              Current Term Progress
            </h2>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-md uppercase tracking-wide border border-blue-100 dark:border-blue-900/50">
            {completionRate}% Tasks Done
          </span>
        </div>

        {/* Metric Triad Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div 
            onClick={() => onNavigateTab('materials')}
            className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Resources</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{materials.length} Files</div>
          </div>
          <div 
            onClick={() => onNavigateTab('notes')}
            className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Study Notes</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{notes.length} Drafts</div>
          </div>
          <div 
            onClick={() => onNavigateTab('deadlines')}
            className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-slate-200 dark:hover:border-slate-700 transition"
          >
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Pending</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{pendingDeadlines.length} Tasks</div>
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex-wrap">
          <button
            id="home-quick-focus-btn"
            onClick={onOpenTimer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Timer size={14} />
            <span>Focus Timer</span>
          </button>
          <button
            id="home-quick-upload-btn"
            onClick={onQuickUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs transition active:scale-95"
          >
            <UploadCloud size={14} className="text-blue-600 dark:text-blue-400" />
            <span>Upload File</span>
          </button>
          <button
            id="home-quick-deadline-btn"
            onClick={onQuickAddDeadline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs transition active:scale-95"
          >
            <Plus size={14} className="text-rose-600 dark:text-rose-400" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive 2-Column on Desktop, Single Column on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Deadlines & Documents */}
        <div className="space-y-5">
          {/* Upcoming Deadlines Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">Upcoming Deadlines</h3>
                {urgentDeadlines.length > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                    {urgentDeadlines.length} Urgent
                  </span>
                )}
              </div>
              <button
                onClick={() => onNavigateTab('deadlines')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {pendingDeadlines.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                🎉 All scheduled assignments and exams are cleared!
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingDeadlines.slice(0, 4).map((dl) => {
                  const sub = subjects.find((s) => s.id === dl.subjectId);
                  const relative = formatRelativeDueDate(dl.dueDate);
                  const dateObj = new Date(dl.dueDate);
                  const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' });
                  const dayStr = dateObj.getDate();

                  return (
                    <div
                      key={dl.id}
                      className={`flex items-start gap-3.5 p-3 rounded-lg border transition ${
                        relative.isUrgent
                          ? 'border-rose-100 dark:border-rose-900/50 bg-rose-50/60 dark:bg-rose-950/30'
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Calendar Date Block */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex flex-col items-center justify-center ${
                          relative.isUrgent
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase leading-tight">{monthStr}</span>
                        <span className="text-base font-bold leading-none">{dayStr}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {sub && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                              {sub.code}
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {dl.type}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate">
                          {dl.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className={relative.isUrgent ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                            {relative.label}
                          </span>
                          {dl.weightPercentage && (
                            <span>• {dl.weightPercentage}% weight</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleDeadline(dl)}
                        className="mt-1 w-5 h-5 rounded border border-slate-300 dark:border-slate-600 hover:border-blue-600 dark:hover:border-blue-400 flex items-center justify-center text-transparent hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0"
                        title="Mark as completed"
                      >
                        <CheckCircle2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Document Library Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Document Library</h3>
              <button
                onClick={() => onNavigateTab('materials')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-2">File Name</th>
                    <th className="pb-2 text-center">Type</th>
                    <th className="pb-2 text-right">Uploaded</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-50 dark:divide-slate-800/60">
                  {recentMaterials.map((mat) => {
                    const sub = subjects.find((s) => s.id === mat.subjectId);
                    const typeBadgeClass =
                      mat.fileType === 'pdf'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : mat.fileType === 'code'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';

                    return (
                      <tr
                        key={mat.id}
                        onClick={() => onSelectMaterial(mat)}
                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="py-2.5 font-medium text-slate-700 dark:text-slate-200 truncate max-w-[170px]">
                          <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition block truncate">
                            {mat.fileName}
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                            {sub?.code || 'Doc'} • {mat.title}
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeBadgeClass}`}>
                            {mat.fileType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          <div className="flex items-center justify-end gap-1">
                            <span>{new Date(mat.uploadDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openWithDeviceApp(mat);
                              }}
                              className="p-1 rounded-md text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                              title="Open in WPS Office, CamScanner, Drive, etc."
                            >
                              <Smartphone size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Enrolled Subjects & Tip */}
        <div className="space-y-5">
          {/* Enrolled Subjects Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Enrolled Subjects</h3>
              <button
                onClick={() => onNavigateTab('subjects')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition"
              >
                <span>Manage All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {subjects.map((sub) => {
                const colorDef = COLOR_MAP[sub.color];
                const subMats = materials.filter((m) => m.subjectId === sub.id);
                const subDls = deadlines.filter((d) => d.subjectId === sub.id && d.status !== 'completed');

                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubject(sub)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full ${colorDef.dot} shrink-0`} />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition block truncate">
                          {sub.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {sub.code} • Prof. {sub.instructor || 'TBD'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                      <span>{subMats.length} files</span>
                      {subDls.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold border border-rose-100 dark:border-rose-900/50">
                          {subDls.length} due
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study Smart Tip Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 dark:from-blue-950 dark:to-slate-900 rounded-xl p-5 text-white shadow-sm border border-blue-800/40">
            <h3 className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-300" />
              <span>Study Smart Tip</span>
            </h3>
            <p className="text-xs text-blue-200 dark:text-blue-300 leading-relaxed italic">
              "Spaced repetition for conceptual subjects solidifies abstract theorems. Review your notes for 15 minutes before sleep to reinforce memory consolidation."
            </p>
            <div className="mt-3.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
                AI Insights Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
