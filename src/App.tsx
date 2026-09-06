/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './db/storage';
import { Subject, Material, Deadline, StudyNote, AppTab } from './types';
import { triggerConfetti } from './utils/helpers';

// Components
import { TopAppBar } from './components/TopAppBar';
import { BottomNavBar } from './components/BottomNavBar';
import { SpeedDialFAB } from './components/SpeedDialFAB';

// Tabs
import { HomeTab } from './components/tabs/HomeTab';
import { SubjectsTab } from './components/tabs/SubjectsTab';
import { MaterialsTab } from './components/tabs/MaterialsTab';
import { DeadlinesTab } from './components/tabs/DeadlinesTab';
import { NotesTab } from './components/tabs/NotesTab';

// Modals
import { AddSubjectModal } from './components/modals/AddSubjectModal';
import { UploadMaterialModal } from './components/modals/UploadMaterialModal';
import { EditMaterialModal } from './components/modals/EditMaterialModal';
import { AddDeadlineModal } from './components/modals/AddDeadlineModal';
import { NoteEditorModal } from './components/modals/NoteEditorModal';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { OpenMaterialOptionsModal } from './components/modals/OpenMaterialOptionsModal';
import { SubjectDetailModal } from './components/modals/SubjectDetailModal';
import { StudyTimerModal } from './components/modals/StudyTimerModal';
import { DeleteAllDataModal } from './components/modals/DeleteAllDataModal';
import { DeleteSelectedDataModal } from './components/modals/DeleteSelectedDataModal';
import { RestoreSelectedDataModal } from './components/modals/RestoreSelectedDataModal';
import { InstallAppModal } from './components/modals/InstallAppModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Theme state: light (white) / dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('studysphere_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studysphere_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modals state
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeleteSelectedOpen, setIsDeleteSelectedOpen] = useState(false);
  const [isRestoreSelectedOpen, setIsRestoreSelectedOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDefaultSubjectId, setUploadDefaultSubjectId] = useState<string | undefined>();
  const [isEditMaterialOpen, setIsEditMaterialOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [isAddDeadlineOpen, setIsAddDeadlineOpen] = useState(false);
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null);
  const [deadlineDefaultSubjectId, setDeadlineDefaultSubjectId] = useState<string | undefined>();

  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<StudyNote | null>(null);
  const [noteDefaultSubjectId, setNoteDefaultSubjectId] = useState<string | undefined>();

  const [selectedMaterialForPreview, setSelectedMaterialForPreview] = useState<Material | null>(null);
  const [materialForOptions, setMaterialForOptions] = useState<Material | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<Subject | null>(null);

  // Load initial data from IndexedDB
  const loadData = async () => {
    try {
      const [fetchedSubjects, fetchedMaterials, fetchedDeadlines, fetchedNotes] = await Promise.all([
        db.getSubjects(),
        db.getMaterials(),
        db.getDeadlines(),
        db.getNotes(),
      ]);
      setSubjects(fetchedSubjects);
      setMaterials(fetchedMaterials);
      setDeadlines(fetchedDeadlines);
      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to load study data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- SUBJECT OPERATIONS ---
  const handleSaveSubject = async (subject: Subject) => {
    await db.saveSubject(subject);
    const updated = await db.getSubjects();
    setSubjects(updated);
    if (selectedSubjectDetail?.id === subject.id) {
      setSelectedSubjectDetail(subject);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    await db.deleteSubject(id);
    await loadData();
    if (selectedSubjectDetail?.id === id) {
      setSelectedSubjectDetail(null);
    }
  };

  // --- MATERIAL OPERATIONS ---
  const handleSaveMaterial = async (material: Material) => {
    await db.saveMaterial(material);
    const updated = await db.getMaterials();
    setMaterials(updated);
  };

  const handleDeleteMaterial = async (id: string) => {
    await db.deleteMaterial(id);
    const updated = await db.getMaterials();
    setMaterials(updated);
  };

  // --- DEADLINE OPERATIONS ---
  const handleSaveDeadline = async (deadline: Deadline) => {
    await db.saveDeadline(deadline);
    const updated = await db.getDeadlines();
    setDeadlines(updated);
  };

  const handleToggleDeadline = async (deadline: Deadline) => {
    const isNowCompleted = deadline.status !== 'completed';
    const updatedDeadline: Deadline = {
      ...deadline,
      status: isNowCompleted ? 'completed' : 'pending',
      completedAt: isNowCompleted ? new Date().toISOString() : undefined,
    };

    if (isNowCompleted) {
      triggerConfetti();
    }

    await db.saveDeadline(updatedDeadline);
    const updated = await db.getDeadlines();
    setDeadlines(updated);
  };

  const handleDeleteDeadline = async (id: string) => {
    await db.deleteDeadline(id);
    const updated = await db.getDeadlines();
    setDeadlines(updated);
  };

  // --- STUDY NOTE OPERATIONS ---
  const handleSaveNote = async (note: StudyNote) => {
    await db.saveNote(note);
    const updated = await db.getNotes();
    setNotes(updated);
  };

  const handleTogglePinNote = async (note: StudyNote) => {
    const updatedNote: StudyNote = {
      ...note,
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    };
    await db.saveNote(updatedNote);
    const updated = await db.getNotes();
    setNotes(updated);
  };

  const handleDeleteNote = async (id: string) => {
    await db.deleteNote(id);
    const updated = await db.getNotes();
    setNotes(updated);
  };

  // --- DATA MANAGEMENT OPERATIONS ---
  const handleDeleteAllData = async () => {
    await db.deleteAllData();
    await loadData();
    setSelectedSubjectDetail(null);
    setSelectedMaterialForPreview(null);
  };

  const handleDeleteSelectedData = async (selection: {
    subjectIds: string[];
    materialIds: string[];
    deadlineIds: string[];
    noteIds: string[];
  }) => {
    await db.deleteSelected(selection);
    await loadData();
    if (selectedSubjectDetail && selection.subjectIds.includes(selectedSubjectDetail.id)) {
      setSelectedSubjectDetail(null);
    }
    if (selectedMaterialForPreview && selection.materialIds.includes(selectedMaterialForPreview.id)) {
      setSelectedMaterialForPreview(null);
    }
  };

  const handleRestoreSelectedData = async (items: {
    subjects?: Subject[];
    materials?: Material[];
    deadlines?: Deadline[];
    notes?: StudyNote[];
  }) => {
    await db.restoreSelected(items);
    await loadData();
  };

  // Pending deadlines count for badge
  const pendingDeadlinesCount = deadlines.filter((d) => d.status !== 'completed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-3 font-sans transition-colors">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900/60 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Loading StudySphere...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Responsive Top Navigation Header */}
      <TopAppBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingDeadlinesCount={pendingDeadlinesCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTimer={() => setIsTimerOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenDeleteAll={() => setIsDeleteAllOpen(true)}
        onOpenDeleteSelected={() => setIsDeleteSelectedOpen(true)}
        onOpenRestoreSelected={() => setIsRestoreSelectedOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        subjects={subjects}
      />

      {/* Main Responsive Tab Viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] overflow-y-auto no-scrollbar relative">
        {currentTab === 'home' && (
          <HomeTab
            subjects={subjects}
            materials={materials}
            deadlines={deadlines}
            notes={notes}
            onNavigateTab={setCurrentTab}
            onSelectSubject={(s) => setSelectedSubjectDetail(s)}
            onSelectMaterial={(m) => setMaterialForOptions(m)}
            onSelectNote={(n) => {
              setEditingNote(n);
              setIsNoteEditorOpen(true);
            }}
            onToggleDeadline={handleToggleDeadline}
            onOpenTimer={() => setIsTimerOpen(true)}
            onQuickUpload={() => {
              setUploadDefaultSubjectId(undefined);
              setIsUploadOpen(true);
            }}
            onQuickAddDeadline={() => {
              setEditingDeadline(null);
              setDeadlineDefaultSubjectId(undefined);
              setIsAddDeadlineOpen(true);
            }}
            onQuickAddSubject={() => {
              setEditingSubject(null);
              setIsAddSubjectOpen(true);
            }}
          />
        )}

        {currentTab === 'subjects' && (
          <SubjectsTab
            subjects={subjects}
            materials={materials}
            deadlines={deadlines}
            notes={notes}
            searchQuery={searchQuery}
            onSelectSubject={(s) => setSelectedSubjectDetail(s)}
            onAddSubject={() => {
              setEditingSubject(null);
              setIsAddSubjectOpen(true);
            }}
            onEditSubject={(s) => {
              setEditingSubject(s);
              setIsAddSubjectOpen(true);
            }}
            onDeleteSubject={handleDeleteSubject}
          />
        )}

        {currentTab === 'materials' && (
          <MaterialsTab
            materials={materials}
            subjects={subjects}
            searchQuery={searchQuery}
            onSelectMaterial={(m) => setMaterialForOptions(m)}
            onUploadClick={() => {
              setUploadDefaultSubjectId(undefined);
              setIsUploadOpen(true);
            }}
            onEditMaterial={(m) => {
              setEditingMaterial(m);
              setIsEditMaterialOpen(true);
            }}
            onDeleteMaterial={handleDeleteMaterial}
          />
        )}

        {currentTab === 'deadlines' && (
          <DeadlinesTab
            deadlines={deadlines}
            subjects={subjects}
            searchQuery={searchQuery}
            onToggleDeadline={handleToggleDeadline}
            onAddDeadline={() => {
              setEditingDeadline(null);
              setDeadlineDefaultSubjectId(undefined);
              setIsAddDeadlineOpen(true);
            }}
            onEditDeadline={(d) => {
              setEditingDeadline(d);
              setDeadlineDefaultSubjectId(d.subjectId);
              setIsAddDeadlineOpen(true);
            }}
            onDeleteDeadline={handleDeleteDeadline}
          />
        )}

        {currentTab === 'notes' && (
          <NotesTab
            notes={notes}
            subjects={subjects}
            searchQuery={searchQuery}
            onSelectNote={(n) => {
              setEditingNote(n);
              setIsNoteEditorOpen(true);
            }}
            onAddNote={() => {
              setEditingNote(null);
              setNoteDefaultSubjectId(undefined);
              setIsNoteEditorOpen(true);
            }}
            onEditNote={(n) => {
              setEditingNote(n);
              setIsNoteEditorOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePinNote}
          />
        )}

        {/* Floating Action Button with Speed Dial */}
        <SpeedDialFAB
          onAddSubject={() => {
            setEditingSubject(null);
            setIsAddSubjectOpen(true);
          }}
          onUploadMaterial={() => {
            setUploadDefaultSubjectId(undefined);
            setIsUploadOpen(true);
          }}
          onAddDeadline={() => {
            setEditingDeadline(null);
            setDeadlineDefaultSubjectId(undefined);
            setIsAddDeadlineOpen(true);
          }}
          onAddNote={() => {
            setEditingNote(null);
            setNoteDefaultSubjectId(undefined);
            setIsNoteEditorOpen(true);
          }}
        />
      </main>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingDeadlinesCount={pendingDeadlinesCount}
      />

      {/* MODALS */}
      {/* 1. Add / Edit Subject Modal */}
      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => {
          setIsAddSubjectOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />

      {/* 2. Upload Material Document Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadDefaultSubjectId(undefined);
        }}
        onSave={handleSaveMaterial}
        subjects={subjects}
        defaultSubjectId={uploadDefaultSubjectId}
        onOpenAddSubject={() => setIsAddSubjectOpen(true)}
      />

      {/* 3. Add / Edit Deadline Modal */}
      <AddDeadlineModal
        isOpen={isAddDeadlineOpen}
        onClose={() => {
          setIsAddDeadlineOpen(false);
          setEditingDeadline(null);
          setDeadlineDefaultSubjectId(undefined);
        }}
        onSave={handleSaveDeadline}
        subjects={subjects}
        initialDeadline={editingDeadline}
        defaultSubjectId={deadlineDefaultSubjectId}
      />

      {/* 4. Note Editor & Study Mode Modal */}
      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => {
          setIsNoteEditorOpen(false);
          setEditingNote(null);
          setNoteDefaultSubjectId(undefined);
        }}
        onSave={handleSaveNote}
        subjects={subjects}
        initialNote={editingNote}
        defaultSubjectId={noteDefaultSubjectId}
      />

      {/* 5a. Open Material Options Modal (Device App, Browser, In-App, Download) */}
      <OpenMaterialOptionsModal
        isOpen={Boolean(materialForOptions)}
        material={materialForOptions}
        subject={subjects.find((s) => s.id === materialForOptions?.subjectId)}
        onClose={() => setMaterialForOptions(null)}
        onOpenInAppReader={(m) => {
          setSelectedMaterialForPreview(m);
        }}
      />

      {/* 5b. Document In-App Reader Modal */}
      <DocumentViewerModal
        isOpen={Boolean(selectedMaterialForPreview)}
        material={selectedMaterialForPreview}
        subject={subjects.find((s) => s.id === selectedMaterialForPreview?.subjectId)}
        onClose={() => setSelectedMaterialForPreview(null)}
        onEdit={(m) => {
          setEditingMaterial(m);
          setIsEditMaterialOpen(true);
        }}
        onDelete={handleDeleteMaterial}
      />

      {/* 5c. Edit Material Modal */}
      <EditMaterialModal
        isOpen={isEditMaterialOpen}
        material={editingMaterial}
        subjects={subjects}
        onClose={() => {
          setIsEditMaterialOpen(false);
          setEditingMaterial(null);
        }}
        onSave={handleSaveMaterial}
      />

      {/* 6. Subject Detail Hub Modal */}
      <SubjectDetailModal
        isOpen={Boolean(selectedSubjectDetail)}
        subject={selectedSubjectDetail}
        materials={materials}
        deadlines={deadlines}
        notes={notes}
        onClose={() => setSelectedSubjectDetail(null)}
        onEdit={(s) => {
          setEditingSubject(s);
          setIsAddSubjectOpen(true);
        }}
        onDelete={handleDeleteSubject}
        onSelectMaterial={(m) => setMaterialForOptions(m)}
        onSelectNote={(n) => {
          setEditingNote(n);
          setIsNoteEditorOpen(true);
        }}
        onToggleDeadline={handleToggleDeadline}
        onQuickUpload={() => {
          if (selectedSubjectDetail) {
            setUploadDefaultSubjectId(selectedSubjectDetail.id);
            setIsUploadOpen(true);
          }
        }}
        onQuickAddDeadline={() => {
          if (selectedSubjectDetail) {
            setEditingDeadline(null);
            setDeadlineDefaultSubjectId(selectedSubjectDetail.id);
            setIsAddDeadlineOpen(true);
          }
        }}
        onQuickAddNote={() => {
          if (selectedSubjectDetail) {
            setEditingNote(null);
            setNoteDefaultSubjectId(selectedSubjectDetail.id);
            setIsNoteEditorOpen(true);
          }
        }}
      />

      {/* 7. Study Focus Pomodoro Timer Modal */}
      <StudyTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        subjects={subjects}
      />

      {/* 8. Delete All Data Modal (with strict confirmation) */}
      <DeleteAllDataModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAllData}
        itemCounts={{
          subjects: subjects.length,
          materials: materials.length,
          deadlines: deadlines.length,
          notes: notes.length,
        }}
      />

      {/* 9. Delete Selected Data Modal */}
      <DeleteSelectedDataModal
        isOpen={isDeleteSelectedOpen}
        onClose={() => setIsDeleteSelectedOpen(false)}
        subjects={subjects}
        materials={materials}
        deadlines={deadlines}
        notes={notes}
        onDeleteSelected={handleDeleteSelectedData}
      />

      {/* 10. Restore Selected Data Modal */}
      <RestoreSelectedDataModal
        isOpen={isRestoreSelectedOpen}
        onClose={() => setIsRestoreSelectedOpen(false)}
        onRestoreSelected={handleRestoreSelectedData}
      />

      {/* 11. PWA In-App Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* PWA Mobile Floating Install Banner */}
      <PWAInstallBanner
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />
    </div>
  );
}

