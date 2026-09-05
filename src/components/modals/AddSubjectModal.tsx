import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Subject, SubjectColor } from '../../types';
import { COLOR_MAP, ICON_OPTIONS } from '../../utils/helpers';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  initialSubject?: Subject | null;
}

const COLORS: SubjectColor[] = ['indigo', 'emerald', 'rose', 'amber', 'cyan', 'purple', 'blue', 'orange'];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState<SubjectColor>('indigo');
  const [icon, setIcon] = useState('BookOpen');
  const [instructor, setInstructor] = useState('');
  const [instructorEmail, setInstructorEmail] = useState('');
  const [room, setRoom] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [credits, setCredits] = useState<number>(3);
  const [targetGrade, setTargetGrade] = useState('A');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name || '');
      setCode(initialSubject.code || '');
      setColor(initialSubject.color || 'indigo');
      setIcon(initialSubject.icon || 'BookOpen');
      setInstructor(initialSubject.instructor || '');
      setInstructorEmail(initialSubject.instructorEmail || '');
      setRoom(initialSubject.room || '');
      setTerm(initialSubject.term || 'Fall 2026');
      setCredits(initialSubject.credits || 3);
      setTargetGrade(initialSubject.targetGrade || 'A');
      setDescription(initialSubject.description || '');
    } else {
      setName('');
      setCode('');
      setColor('indigo');
      setIcon('BookOpen');
      setInstructor('');
      setInstructorEmail('');
      setRoom('');
      setTerm('Fall 2026');
      setCredits(3);
      setTargetGrade('A');
      setDescription('');
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subject: Subject = {
      id: initialSubject?.id || `subj-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || 'SUBJ-101',
      color,
      icon,
      instructor: instructor.trim() || undefined,
      instructorEmail: instructorEmail.trim() || undefined,
      room: room.trim() || undefined,
      term: term.trim() || 'Current Term',
      credits: Number(credits) || 3,
      targetGrade: targetGrade.trim() || 'A',
      description: description.trim() || undefined,
      createdAt: initialSubject?.createdAt || new Date().toISOString(),
    };

    onSave(subject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              {initialSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>
            <p className="text-xs text-slate-500">Course details, color coding & syllabus info</p>
          </div>
          <button
            id="close-add-subject-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* Subject Name & Code */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Subject / Course Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Data Structures"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Code
              </label>
              <input
                type="text"
                placeholder="CS-301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white uppercase transition"
              />
            </div>
          </div>

          {/* Color Scheme Picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((c) => {
                const colorDef = COLOR_MAP[c];
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full ${colorDef.accent} flex items-center justify-center transition-transform ${
                      isSelected ? 'ring-2 ring-offset-2 ring-blue-600 scale-110' : 'hover:scale-105 opacity-80'
                    }`}
                  >
                    {isSelected && <Check size={14} className="text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              Subject Icon
            </label>
            <div className="grid grid-cols-7 gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
              {ICON_OPTIONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2 rounded-lg flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                    }`}
                    title={item.label}
                  >
                    <IconComponent size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructor & Location */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                placeholder="Prof. John Doe"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Classroom / Link
              </label>
              <input
                type="text"
                placeholder="Hall 302 or Zoom"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Instructor Email & Term */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Instructor Email
              </label>
              <input
                type="email"
                placeholder="prof@univ.edu"
                value={instructorEmail}
                onChange={(e) => setInstructorEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Credits
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={credits}
                  onChange={(e) => setCredits(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Goal
                </label>
                <input
                  type="text"
                  placeholder="A"
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 uppercase focus:outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Description / Syllabus Notes */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Course Description / Syllabus Overview
            </label>
            <textarea
              rows={2}
              placeholder="Key topics covered, exam policies..."
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
              id="save-subject-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              {initialSubject ? 'Save Changes' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
