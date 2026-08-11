/**
 * Aura Core Type Definitions
 */

export type ViewType = 'flow' | 'calendar' | 'constellations' | 'grove' | 'journal' | 'review';

export interface CategoryStyle {
  bg: string;
  border: string;
  text: string;
  solid: string;
  glowColor?: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  bg: string;
  text?: string;
  bgSecondary?: string;
  textPrimary?: string;
  textSecondary?: string;
  accent?: string;
}

export interface Achievement {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
}

export interface ToastMessage {
  text: string;
  type?: 'success' | 'info' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size?: number;
  type?: string;
  path?: string;
}

export type TaskAttachment = Attachment;

export interface RecurringRule {
  type: 'daily' | 'weekly' | 'monthly';
}

export interface Task {
  id: string;
  createdAt: number;
  text: string;
  completed: boolean;
  priority: number; // 1, 2, 3
  category: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  deadline: string | null;
  subtasks: Subtask[];
  win: string | null;
  completionDate: string | null;
  recurring: RecurringRule | null;
  notes: string;
  attachments: Attachment[];
  tags: string[];
  isPinned: boolean;
  focusSessions: number;
  isArchived: boolean;
  dependsOn?: string;
  estimatedMinutes?: number;
  isGolden?: boolean;
}

export interface TemplateTask {
  text: string;
  category: string;
  priority: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export interface Template {
  id: string;
  name: string;
  tasks: TemplateTask[];
}

export type ProjectTemplate = Template;

export interface DistractionLog {
  text: string;
  time: string;
}

export type Distraction = DistractionLog;

export interface JournalEntry {
  date: string; // YYYY-MM-DD
  content: string;
  distractions?: DistractionLog[];
}

export interface GroveTree {
  id: number;
  growthPoints: number;
  maxGrowth: number;
  type: 'oak' | 'pine' | 'cherry' | string;
}

export interface CustomTheme {
  id: string;
  name: string;
  bg: string;
  bgSecondary: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export interface UserStats {
  goldenSeeds: number;
  streak: number;
  lastActiveDate: string | null;
  focusedTasksCompleted: number;
}

export interface ActiveFilter {
  type: 'all' | 'priority' | 'category' | 'tag' | 'due_this_week';
  value?: string | number | null;
}

export interface BackupDataPayload {
  tasks: Task[];
  templates: Template[];
  journalEntries: JournalEntry[];
  grove: GroveTree[];
  stats: UserStats;
  achievements: string[];
}

export interface ElectronAPI {
  openFileDialog: (taskId: string) => Promise<Attachment[]>;
  openAttachment: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  deleteAttachment: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  sendShutdownTime: (time: string) => void;
  sendMorningTime?: (time: string) => void;
  getStartupEnabled?: () => Promise<boolean>;
  setStartupEnabled?: (enabled: boolean) => void;
  onTriggerMorningRitual?: (callback: () => void) => () => void;
  submitQuickCapture?: (text: string) => void;
  cancelQuickCapture?: () => void;
  backupData: (data: BackupDataPayload | Record<string, unknown>) => Promise<{ success: boolean; filepath?: string; error?: string }>;
  restoreData: () => Promise<{ success: boolean; data?: BackupDataPayload; canceled?: boolean; error?: string }>;
  onAddTaskFromCapture: (callback: (text: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

