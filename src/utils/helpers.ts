import React from 'react';
import { 
  BookOpen, 
  Code, 
  Calculator, 
  Atom, 
  FlaskConical, 
  Globe, 
  Palette, 
  Brain, 
  Layers, 
  GraduationCap, 
  FileText, 
  Cpu, 
  Activity, 
  Bookmark,
  LucideIcon
} from 'lucide-react';
import { SubjectColor, DeadlinePriority, Deadline } from '../types';

export const COLOR_MAP: Record<SubjectColor, {
  bg: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  accent: string;
  gradient: string;
  ring: string;
  text: string;
  dot: string;
}> = {
  indigo: {
    bg: 'bg-indigo-50/60',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700',
    border: 'border-slate-200 hover:border-indigo-300',
    accent: 'bg-indigo-600',
    gradient: 'from-indigo-600 to-indigo-800',
    ring: 'focus:ring-indigo-500',
    text: 'text-indigo-600',
    dot: 'bg-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-50/60',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    border: 'border-slate-200 hover:border-emerald-300',
    accent: 'bg-emerald-600',
    gradient: 'from-emerald-600 to-emerald-800',
    ring: 'focus:ring-emerald-500',
    text: 'text-emerald-600',
    dot: 'bg-emerald-400',
  },
  rose: {
    bg: 'bg-rose-50/60',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-700',
    border: 'border-slate-200 hover:border-rose-300',
    accent: 'bg-rose-600',
    gradient: 'from-rose-600 to-rose-800',
    ring: 'focus:ring-rose-500',
    text: 'text-rose-600',
    dot: 'bg-rose-400',
  },
  amber: {
    bg: 'bg-amber-50/60',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    border: 'border-slate-200 hover:border-amber-300',
    accent: 'bg-amber-600',
    gradient: 'from-amber-600 to-amber-800',
    ring: 'focus:ring-amber-500',
    text: 'text-amber-600',
    dot: 'bg-amber-400',
  },
  cyan: {
    bg: 'bg-cyan-50/60',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-700',
    border: 'border-slate-200 hover:border-cyan-300',
    accent: 'bg-cyan-600',
    gradient: 'from-cyan-600 to-cyan-800',
    ring: 'focus:ring-cyan-500',
    text: 'text-cyan-600',
    dot: 'bg-cyan-400',
  },
  purple: {
    bg: 'bg-purple-50/60',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
    border: 'border-slate-200 hover:border-purple-300',
    accent: 'bg-purple-600',
    gradient: 'from-purple-600 to-purple-800',
    ring: 'focus:ring-purple-500',
    text: 'text-purple-600',
    dot: 'bg-purple-400',
  },
  blue: {
    bg: 'bg-blue-50/60',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    border: 'border-slate-200 hover:border-blue-300',
    accent: 'bg-blue-600',
    gradient: 'from-blue-600 to-blue-800',
    ring: 'focus:ring-blue-500',
    text: 'text-blue-600',
    dot: 'bg-blue-400',
  },
  orange: {
    bg: 'bg-orange-50/60',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
    border: 'border-slate-200 hover:border-orange-300',
    accent: 'bg-orange-600',
    gradient: 'from-orange-600 to-orange-800',
    ring: 'focus:ring-orange-500',
    text: 'text-orange-600',
    dot: 'bg-orange-400',
  },
};

export const ICON_OPTIONS: { name: string; label: string; icon: LucideIcon }[] = [
  { name: 'BookOpen', label: 'Book', icon: BookOpen },
  { name: 'Code', label: 'Computer Science', icon: Code },
  { name: 'Calculator', label: 'Mathematics', icon: Calculator },
  { name: 'Atom', label: 'Physics', icon: Atom },
  { name: 'FlaskConical', label: 'Chemistry/Bio', icon: FlaskConical },
  { name: 'Globe', label: 'Humanities/Geo', icon: Globe },
  { name: 'Palette', label: 'Arts/Design', icon: Palette },
  { name: 'Brain', label: 'Psychology/AI', icon: Brain },
  { name: 'Layers', label: 'General Study', icon: Layers },
  { name: 'GraduationCap', label: 'Academic', icon: GraduationCap },
  { name: 'FileText', label: 'Literature', icon: FileText },
  { name: 'Cpu', label: 'Engineering', icon: Cpu },
  { name: 'Activity', label: 'Health/Medicine', icon: Activity },
  { name: 'Bookmark', label: 'Reference', icon: Bookmark },
];

export function getSubjectIcon(name: string): LucideIcon {
  const match = ICON_OPTIONS.find((item) => item.name === name);
  return match ? match.icon : BookOpen;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatRelativeDueDate(dateStr: string): { label: string; isOverdue: boolean; isUrgent: boolean } {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const isOverdue = diffMs < 0;
  const isUrgent = diffMs > 0 && diffHours <= 36;

  if (isOverdue) {
    const absHours = Math.abs(diffHours);
    if (absHours < 24) {
      return { label: `Overdue by ${absHours}h`, isOverdue: true, isUrgent: true };
    }
    const absDays = Math.abs(diffDays);
    return { label: `Overdue by ${absDays}d`, isOverdue: true, isUrgent: true };
  }

  if (diffHours <= 1) {
    return { label: 'Due in < 1 hour', isOverdue: false, isUrgent: true };
  }
  if (diffHours < 24) {
    return { label: `Due today (${diffHours}h left)`, isOverdue: false, isUrgent: true };
  }
  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isUrgent: true };
  }
  if (diffDays <= 7) {
    return { label: `Due in ${diffDays} days`, isOverdue: false, isUrgent: false };
  }

  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
    isUrgent: false,
  };
}

export function getPriorityBadge(priority: DeadlinePriority): { label: string; bg: string; text: string } {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', bg: 'bg-rose-100 border-rose-200', text: 'text-rose-700' };
    case 'high':
      return { label: 'High', bg: 'bg-amber-100 border-amber-200', text: 'text-amber-700' };
    case 'medium':
      return { label: 'Medium', bg: 'bg-blue-100 border-blue-200', text: 'text-blue-700' };
    case 'low':
      return { label: 'Low', bg: 'bg-slate-100 border-slate-200', text: 'text-slate-600' };
  }
}

// Lightweight native Canvas confetti particle burst
export function triggerConfetti() {
  try {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }

    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      rotation: number;
      rotSpeed: number;
      alpha: number;
    }[] = [];

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 100,
        y: height * 0.45 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 12 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        alpha: 1,
      });
    }

    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };

    requestAnimationFrame(animate);
  } catch (e) {
    console.log('Confetti effect failed silently', e);
  }
}
