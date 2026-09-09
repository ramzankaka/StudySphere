export type SubjectColor = 
  | 'indigo'
  | 'emerald'
  | 'rose'
  | 'amber'
  | 'cyan'
  | 'purple'
  | 'blue'
  | 'orange';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: SubjectColor;
  icon: string;
  instructor?: string;
  instructorEmail?: string;
  room?: string;
  term?: string;
  credits?: number;
  description?: string;
  targetGrade?: string;
  createdAt: string;
}

export type MaterialCategory = 
  | 'Lecture Slides'
  | 'Syllabus'
  | 'Textbook'
  | 'Assignment Spec'
  | 'Past Exam'
  | 'Cheat Sheet'
  | 'Lab Manual'
  | 'Study Guide'
  | 'Other';

export interface Material {
  id: string;
  subjectId: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'doc' | 'slides' | 'code' | 'text' | 'archive' | 'other';
  mimeType: string;
  fileSize: number; // in bytes
  fileData?: string; // Data URL or text content
  uploadDate: string;
  category: MaterialCategory;
  tags: string[];
  description?: string;
}

export type DeadlinePriority = 'low' | 'medium' | 'high' | 'urgent';

export type DeadlineType = 
  | 'assignment'
  | 'exam'
  | 'quiz'
  | 'project'
  | 'lab'
  | 'reading'
  | 'presentation';

export type DeadlineStatus = 'pending' | 'in_progress' | 'completed';

export interface Deadline {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string YYYY-MM-DDTHH:mm
  priority: DeadlinePriority;
  type: DeadlineType;
  status: DeadlineStatus;
  weightPercentage?: number;
  completedAt?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export interface StudyNote {
  id: string;
  subjectId: string;
  title: string;
  content: string; // Markdown or rich text
  summary?: string;
  tags: string[];
  chapter?: string;
  isPinned?: boolean;
  flashcards?: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export type AppTab = 'home' | 'subjects' | 'materials' | 'deadlines' | 'notes';
