/**
 * Aura Core Type Definitions
 */

export type ViewType = 'workspace' | 'flow' | 'calendar' | 'constellations' | 'grove' | 'journal' | 'review';

export interface CategoryStyle {
  bg: string;
  border: string;
  text: string;
  solid: string;
  glowColor?: string;
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'wide' | 'banner';

export type WidgetType = 
  | 'capture'
  | 'shuffled_pinned'
  | 'focus_timer'
  | 'triage_deck'
  | 'career_blocks'
  | 'grove'
  | 'momentum'
  | 'scratchpad'
  | 'ambient'
  | 'mini_calendar'
  | 'zen_minute'
  | 'voice_memo';

export interface WidgetItem {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  order: number;
  config?: Record<string, any>;
  pluginId?: string;
  visible?: boolean;
}

export interface CareerGoal {
  id: string;
  title: string;
  category: string;
  quarter: string; // e.g. "Q3 2026"
  targetDate?: string;
  completed: boolean;
  progress: number; // 0 - 100
  metricLabel?: string;
  metricValue?: string;
}

export interface CareerMilestone {
  id: string;
  title: string;
  date: string;
  role: string;
  company?: string;
  icon?: string;
  achievements?: string[];
}

export interface CareerProfile {
  role: string;
  level: string;
  currentQuarter: string;
  velocityScore: number;
  goals: CareerGoal[];
  milestones: CareerMilestone[];
}

export interface AuraPluginSetting {
  key: string;
  label: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  value: any;
  options?: { label: string; value: any }[];
}

export interface AuraPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  author: string;
  enabled: boolean;
  builtin: boolean;
  category: 'productivity' | 'audio' | 'gamification' | 'analytics' | 'lifestyle';
  providedWidgets?: WidgetType[];
  settings?: AuraPluginSetting[];
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
  audioUrl?: string;
  audioDuration?: number;
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
  audioUrl?: string;
  audioDuration?: number;
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
  widgets?: WidgetItem[];
  careerProfile?: CareerProfile;
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

