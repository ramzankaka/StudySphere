import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Coffee, BookOpen, CheckCircle2 } from 'lucide-react';
import { Subject } from '../../types';

interface StudyTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export const StudyTimerModal: React.FC<StudyTimerModalProps> = ({
  isOpen,
  onClose,
  subjects,
}) => {
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (mode === 'study') {
        setSessionsCompleted((c) => c + 1);
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('study');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  if (!isOpen) return null;

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent =
    mode === 'study'
      ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
      : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-slate-800">
        {/* Close Button */}
        <button
          id="close-timer-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X size={20} />
        </button>

        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          {mode === 'study' ? (
            <BookOpen size={18} className="text-blue-600" />
          ) : (
            <Coffee size={18} className="text-emerald-600" />
          )}
          <span>{mode === 'study' ? 'Deep Study Session' : 'Quick Rest Break'}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">Pomodoro focus technique</p>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-5">
          <button
            onClick={() => switchMode('study')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'study'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study (25m)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              mode === 'break'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Break (5m)
          </button>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-44 h-44 flex items-center justify-center mb-5">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="88"
              cy="88"
              r="76"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-100"
              fill="transparent"
            />
            <circle
              cx="88"
              cy="88"
              r="76"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={477}
              strokeDashoffset={477 - (477 * progressPercent) / 100}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                mode === 'study' ? 'text-blue-600' : 'text-emerald-500'
              }`}
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold font-mono text-slate-900 tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
              {isActive ? 'In Progress' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Subject Assignment */}
        {subjects.length > 0 && mode === 'study' && (
          <div className="w-full mb-5">
            <label className="text-[11px] text-slate-700 block mb-1.5 font-medium">
              Studying for Subject:
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition border border-slate-200"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={toggleTimer}
            className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm transition active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>
        </div>

        {/* Sessions stats */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500 font-medium">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>Completed focus blocks today: {sessionsCompleted}</span>
        </div>
      </div>
    </div>
  );
};
