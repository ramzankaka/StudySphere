import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Check, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Image as ImageIcon, 
  Code, 
  File as FileIcon 
} from 'lucide-react';
import { Material, MaterialCategory, Subject } from '../../types';
import { formatFileSize } from '../../utils/helpers';

interface UploadMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (material: Material) => Promise<void> | void;
  subjects: Subject[];
  defaultSubjectId?: string;
  onOpenAddSubject?: () => void;
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
  onOpenAddSubject,
}) => {
  const [subjectId, setSubjectId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('Lecture Slides');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // Selected file details
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileType, setFileType] = useState<Material['fileType']>('other');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Synchronize subject selection whenever modal opens or subjects change
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setIsSubmitting(false);
      setIsReadingFile(false);

      // Determine initial subject
      if (defaultSubjectId && subjects.some((s) => s.id === defaultSubjectId)) {
        setSubjectId(defaultSubjectId);
      } else if (subjects.length > 0) {
        setSubjectId((prev) => (prev && subjects.some((s) => s.id === prev) ? prev : subjects[0].id));
      } else {
        setSubjectId('');
      }
    } else {
      // Reset form when closed
      setTitle('');
      setFile(null);
      setFileDataUrl('');
      setCategory('Lecture Slides');
      setTagInput('');
      setTags([]);
      setDescription('');
      setErrorMsg('');
    }
  }, [isOpen, defaultSubjectId, subjects]);

  if (!isOpen) return null;

  const handleProcessFile = (selectedFile: File) => {
    setErrorMsg('');
    setFile(selectedFile);

    // Auto-populate title from clean filename if title is currently empty
    if (!title.trim()) {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Determine type
    const mime = selectedFile.type.toLowerCase();
    const name = selectedFile.name.toLowerCase();
    let detectedType: Material['fileType'] = 'other';

    if (mime.includes('pdf') || name.endsWith('.pdf')) {
      detectedType = 'pdf';
    } else if (mime.startsWith('image/')) {
      detectedType = 'image';
    } else if (name.endsWith('.md') || name.endsWith('.txt')) {
      detectedType = 'text';
    } else if (
      name.endsWith('.py') ||
      name.endsWith('.js') ||
      name.endsWith('.ts') ||
      name.endsWith('.java') ||
      name.endsWith('.cpp') ||
      name.endsWith('.c') ||
      name.endsWith('.html') ||
      name.endsWith('.css') ||
      name.endsWith('.json')
    ) {
      detectedType = 'code';
    } else if (
      mime.includes('word') ||
      name.endsWith('.docx') ||
      name.endsWith('.doc') ||
      name.endsWith('.rtf')
    ) {
      detectedType = 'doc';
    }
    setFileType(detectedType);

    // Read file for offline caching & in-app viewer
    setIsReadingFile(true);
    const reader = new FileReader();

    if (detectedType === 'text' || detectedType === 'code') {
      reader.onload = (e) => {
        setFileDataUrl((e.target?.result as string) || '');
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setErrorMsg('Could not read text contents of the selected file.');
        setIsReadingFile(false);
      };
      reader.readAsText(selectedFile);
    } else {
      reader.onload = (e) => {
        setFileDataUrl((e.target?.result as string) || '');
        setIsReadingFile(false);
      };
      reader.onerror = () => {
        setErrorMsg('Could not process the selected file for preview.');
        setIsReadingFile(false);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify a title for this material.');
      return;
    }

    if (!subjectId) {
      setErrorMsg('Please select a course/subject. If you do not have any subjects yet, please create one first.');
      return;
    }

    if (isReadingFile) {
      setErrorMsg('File is still loading. Please wait a second and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
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

      await onSave(material);
      onClose();
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to save material to storage.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFileIcon = () => {
    if (fileType === 'pdf') return <FileText size={22} className="text-rose-600 dark:text-rose-400" />;
    if (fileType === 'image') return <ImageIcon size={22} className="text-emerald-600 dark:text-emerald-400" />;
    if (fileType === 'code') return <Code size={22} className="text-amber-600 dark:text-amber-400" />;
    return <FileIcon size={22} className="text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xl relative flex flex-col max-h-[92vh] overflow-y-auto text-slate-800 dark:text-slate-100 animate-scaleUp">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload Course Material</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add lecture slides, past exams, syllabus & notes</p>
          </div>
          <button
            id="close-upload-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div className="flex-1">
              <span>{errorMsg}</span>
              {subjects.length === 0 && onOpenAddSubject && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddSubject();
                    }}
                    className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-200 underline hover:no-underline"
                  >
                    <Plus size={13} /> Create your first subject now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          {/* File Picker / Drag & Drop Target */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Select Document or File
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40'
                  : file
                  ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.ppt,.pptx,.txt,.md,.py,.java,.cpp,.c,.html,.css,.json"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleProcessFile(e.target.files[0]);
                  }
                }}
              />

              {file ? (
                <div className="flex items-center gap-3 text-left w-full px-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    {renderFileIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)} • {fileType.toUpperCase()}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {isReadingFile ? (
                      <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <Loader2 size={13} className="animate-spin" /> Loading
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={14} /> Ready
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <UploadCloud size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Click to browse or drag & drop files here
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      PDF, Slides, Images, Cheat sheets, Source Code, Notes
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Subject & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Subject / Course *
                </label>
                {onOpenAddSubject && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAddSubject();
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                  >
                    + New Subject
                  </button>
                )}
              </div>
              {subjects.length > 0 ? (
                <select
                  id="upload-material-subject-select"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} — {sub.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
                  No subjects created yet.
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                id="upload-material-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Material Title *
            </label>
            <input
              id="upload-material-title-input"
              type="text"
              required
              placeholder="e.g. Chapter 4 Lecture Slides & Problem Sets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Topic Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type tag & press Enter (e.g. Midterm, Lab 2)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl transition"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Description / Study Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Key concepts covered, page references, or reminder..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 resize-none transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              id="upload-material-submit-btn"
              type="submit"
              disabled={isSubmitting || isReadingFile || subjects.length === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Material</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
