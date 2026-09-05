import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, Check, AlertCircle } from 'lucide-react';
import { Material, MaterialCategory, Subject } from '../../types';
import { formatFileSize } from '../../utils/helpers';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Material) => void;
  subjects: Subject[];
  defaultSubjectId?: string;
}

const CATEGORIES: MaterialCategory[] = [
  'Lecture Slides',
  'Syllabus',
  'Textbook',
  'Assignment Spec',
  'Past Exam',
  'Cheat Sheet',
  'Lab Manual',
  'Study Guide',
  'Other',
];

export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  defaultSubjectId,
}) => {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Lecture Slides');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Selected file details
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileType, setFileType] = useState<Material['fileType']>('other');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleProcessFile = (selectedFile: File) => {
    setErrorMsg('');
    setFile(selectedFile);

    if (!title) {
      // Auto-populate title from clean filename
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Determine type
    const mime = selectedFile.type;
    const name = selectedFile.name.toLowerCase();
    let detectedType: Material['fileType'] = 'other';

    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      detectedType = 'pdf';
    } else if (mime.startsWith('image/')) {
      detectedType = 'image';
    } else if (name.endsWith('.md') || name.endsWith('.txt')) {
      detectedType = 'text';
    } else if (name.endsWith('.py') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.java') || name.endsWith('.cpp') || name.endsWith('.c')) {
      detectedType = 'code';
    } else if (mime.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) {
      detectedType = 'doc';
    }
    setFileType(detectedType);

    // Read as Data URL or text for browser persistence & immediate preview
    const reader = new FileReader();
    if (detectedType === 'text' || detectedType === 'code') {
      reader.onload = (e) => {
        setFileDataUrl((e.target?.result as string) || '');
      };
      reader.readAsText(selectedFile);
    } else {
      reader.onload = (e) => {
        setFileDataUrl((e.target?.result as string) || '');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please specify a title for this document.');
      return;
    }
    if (!subjectId) {
      setErrorMsg('Please select a subject.');
      return;
    }

    const material: Material = {
      id: `mat-${Date.now()}`,
      subjectId,
      title: title.trim(),
      fileName: file ? file.name : `${title.replace(/\s+/g, '_')}.pdf`,
      fileType,
      mimeType: file ? file.type : 'application/pdf',
      fileSize: file ? file.size : 150000,
      fileData: fileDataUrl || undefined,
      uploadDate: new Date().toISOString(),
      category,
      tags,
      description: description.trim() || undefined,
    };

    onSave(material);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Upload Study Material</h3>
            <p className="text-xs text-slate-500">PDFs, lecture slides, cheatsheets & documents</p>
          </div>
          <button
            id="close-upload-modal-btn"
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
          {/* Drag and Drop Zone */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
              Select Document or File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50'
                  : file
                  ? 'border-emerald-500/60 bg-emerald-50/40'
                  : 'border-slate-300 bg-slate-50 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.txt,.md,.py,.java,.cpp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex items-center gap-3 text-left w-full px-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {formatFileSize(file.size)} • {fileType.toUpperCase()}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                    <Check size={14} /> Ready
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Tap or drag & drop files here
                    </p>
                    <p className="text-[10px] text-slate-500">
                      PDF, Slides, Images, Text, Cheat sheets up to 50MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Material Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Lecture Notes & Slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Subject & Category Row */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                Subject Course *
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
                Material Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Topic Tags (Press Enter or Add)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Midterm, Formulas, Lab"
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

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Short Description / Key Points
            </label>
            <textarea
              rows={2}
              placeholder="What is inside this document? Any important warnings?"
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
              id="upload-material-submit-btn"
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
            >
              Save Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
