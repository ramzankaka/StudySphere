import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  Filter, 
  Tag, 
  Trash2, 
  Code, 
  Image as ImageIcon, 
  FileCheck,
  Edit3,
  Presentation,
  Eye,
  Share2
} from 'lucide-react';
import { Material, Subject, MaterialCategory } from '../../types';
import { formatFileSize, COLOR_MAP } from '../../utils/helpers';
import { ConfirmModal } from '../modals/ConfirmModal';
import { downloadMaterialFile } from '../../utils/fileViewer';

interface MaterialsTabProps {
  materials: Material[];
  subjects: Subject[];
  searchQuery: string;
  onSelectMaterial: (material: Material) => void;
  onPreviewMaterial?: (material: Material) => void;
  onUploadClick: () => void;
  onEditMaterial: (material: Material) => void;
  onDeleteMaterial: (id: string) => void;
}

const CATEGORIES: ('All' | MaterialCategory)[] = [
  'All',
  'Lecture Slides',
  'Syllabus',
  'Textbook',
  'Assignment Spec',
  'Past Exam',
  'Cheat Sheet',
  'Lab Manual',
  'Study Guide',
];

export const MaterialsTab: React.FC<MaterialsTabProps> = ({
  materials,
  subjects,
  searchQuery,
  onSelectMaterial,
  onPreviewMaterial,
  onUploadClick,
  onEditMaterial,
  onDeleteMaterial,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubjectId === 'all' || m.subjectId === selectedSubjectId;
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    return matchesSearch && matchesSubject && matchesCategory;
  });

  const getFileIcon = (type: Material['fileType']) => {
    switch (type) {
      case 'pdf':
        return <FileText size={20} className="text-rose-500 dark:text-rose-400" />;
      case 'slides':
        return <Presentation size={20} className="text-amber-500 dark:text-amber-400" />;
      case 'image':
        return <ImageIcon size={20} className="text-emerald-500 dark:text-emerald-400" />;
      case 'code':
        return <Code size={20} className="text-amber-500 dark:text-amber-400" />;
      case 'doc':
      case 'text':
      default:
        return <FileText size={20} className="text-indigo-500 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-fadeIn select-none bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Course Materials</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">PDFs, lecture slides, past exams & cheatsheets</p>
        </div>
        <button
          id="tab-upload-material-btn"
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <UploadCloud size={15} />
          <span>Upload File</span>
        </button>
      </div>

      {/* Filter by Subject Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
            selectedSubjectId === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
        >
          All Subjects ({materials.length})
        </button>
        {subjects.map((sub) => {
          const count = materials.filter((m) => m.subjectId === sub.id).length;
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

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Material List */}
      {filteredMaterials.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-slate-500 dark:text-slate-400 text-xs space-y-3">
          <UploadCloud size={32} className="mx-auto text-slate-400 dark:text-slate-500 opacity-70" />
          <p>No documents found matching your filters.</p>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Upload Document Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMaterials.map((mat) => {
            const sub = subjects.find((s) => s.id === mat.subjectId);
            const colorDef = sub ? COLOR_MAP[sub.color] : COLOR_MAP.indigo;

            return (
              <div
                key={mat.id}
                onClick={() => onSelectMaterial(mat)}
                className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition flex items-start justify-between gap-3 cursor-pointer group"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                    {getFileIcon(mat.fileType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {sub && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${colorDef.badgeBg} ${colorDef.badgeText}`}>
                          {sub.code}
                        </span>
                      )}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {mat.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {formatFileSize(mat.fileSize)}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mt-1 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {mat.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{mat.fileName}</p>

                    {/* Tags */}
                    {mat.tags && mat.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {mat.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(mat.uploadDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-1">
                    {onPreviewMaterial && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewMaterial(mat);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                        title="Preview in StudySphere (In-App Reader)"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMaterial(mat);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Open with Device App (Drive, CamScanner, etc.)"
                    >
                      <Share2 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadMaterialFile(mat);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Download File to Device"
                    >
                      <Download size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditMaterial(mat);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                      title="Edit Document"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMaterialToDelete(mat);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete File"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!materialToDelete}
        title="Delete Document?"
        message={`Are you sure you want to delete "${materialToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Delete Document"
        isDestructive={true}
        onConfirm={() => {
          if (materialToDelete) {
            onDeleteMaterial(materialToDelete.id);
            setMaterialToDelete(null);
          }
        }}
        onClose={() => setMaterialToDelete(null)}
      />
    </div>
  );
};
