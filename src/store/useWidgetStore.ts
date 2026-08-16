import { create } from 'zustand';
import { WidgetItem, WidgetSize, WidgetType, CareerProfile } from '../types';
import { getDBItem, setDBItem, setDBItemDebounced } from '../utils/db';

export const DEFAULT_WIDGETS: WidgetItem[] = [
  { id: 'w-capture', type: 'capture', title: 'Quick Capture', size: 'wide', order: 0, visible: true },
  { id: 'w-triage', type: 'triage_deck', title: 'Task Triage Deck', size: 'medium', order: 1, visible: true, pluginId: 'core-card-triage' },
  { id: 'w-shuffled', type: 'shuffled_pinned', title: 'Priority Deck', size: 'medium', order: 2, visible: true, pluginId: 'core-shuffled-pinned' },
  { id: 'w-focus', type: 'focus_timer', title: 'Deep Work Timer', size: 'medium', order: 3, visible: true },
  { id: 'w-career', type: 'career_blocks', title: 'Career & Milestones', size: 'large', order: 4, visible: true, pluginId: 'core-career-blocks' },
  { id: 'w-momentum', type: 'momentum', title: 'Daily Velocity', size: 'medium', order: 5, visible: true, pluginId: 'core-analytics-pro' },
  { id: 'w-ambient', type: 'ambient', title: 'Focus Soundscape', size: 'small', order: 6, visible: true, pluginId: 'core-ambient-audio' },
  { id: 'w-grove', type: 'grove', title: 'The Grove Garden', size: 'small', order: 7, visible: true },
  { id: 'w-scratchpad', type: 'scratchpad', title: 'Scratchpad', size: 'small', order: 8, visible: true },
];

export const DEFAULT_CAREER_PROFILE: CareerProfile = {
  role: 'Senior Product Engineer & Architect',
  level: 'L6 • Master Craftsman',
  currentQuarter: 'Q3 2026',
  velocityScore: 94,
  goals: [
    { id: 'g-1', title: 'Ship Aura 3.0 Desktop Productivity OS', category: 'Engineering', quarter: 'Q3 2026', completed: false, progress: 95, metricLabel: 'Release Readiness', metricValue: '95%' },
    { id: 'g-2', title: 'Architect Watermelon UI Craft Component Registry', category: 'Design Systems', quarter: 'Q3 2026', completed: false, progress: 85, metricLabel: 'Components Built', metricValue: '18/20' },
    { id: 'g-3', title: 'Achieve 100 Consecutive Days of Deep Work', category: 'Mindfulness', quarter: 'Q3 2026', completed: false, progress: 70, metricLabel: 'Streak Progress', metricValue: '70/100' },
    { id: 'g-4', title: 'Publish Open-Source Offline SQLite & TanStack Sync Guide', category: 'Open Source', quarter: 'Q3 2026', completed: true, progress: 100, metricLabel: 'Stars Earned', metricValue: '1.2k' },
  ],
  milestones: [
    { id: 'm-1', title: 'Launched Aura 1.0 Offline First', date: '2025-11-15', role: 'Founder & Lead Dev', icon: '🚀', achievements: ['IndexedDB zero-latency sync', 'Tone.js procedural sounds'] },
    { id: 'm-2', title: 'Electron Native Desktop Architecture', date: '2026-03-20', role: 'Desktop Architect', icon: '💻', achievements: ['Frameless Quick Capture', 'Silent backup rotation'] },
    { id: 'm-3', title: 'Agndex Workspace & Widget OS', date: '2026-08-16', role: 'Principal Engineer', icon: '💎', achievements: ['Watermelon UI component suite', 'Drag & drop widgets canvas'] },
  ]
};

interface WidgetStoreState {
  widgets: WidgetItem[];
  isEditMode: boolean;
  isAddWidgetDrawerOpen: boolean;
  scratchpadNotes: string;
  careerProfile: CareerProfile;

  // Actions
  loadInitialData: () => Promise<void>;
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleEditMode: () => void;
  setIsAddWidgetDrawerOpen: (isOpen: boolean) => void;
  reorderWidgets: (newOrder: WidgetItem[]) => void;
  addWidget: (type: WidgetType, size?: WidgetSize, title?: string) => void;
  removeWidget: (id: string) => void;
  resizeWidget: (id: string, size: WidgetSize) => void;
  toggleWidgetVisibility: (id: string) => void;
  resetToDefaultLayout: () => void;
  setScratchpadNotes: (notes: string) => void;
  updateCareerProfile: (profile: Partial<CareerProfile>) => void;
  toggleCareerGoal: (goalId: string) => void;
  addCareerGoal: (goal: Omit<CareerProfile['goals'][0], 'id'>) => void;
}

export const useWidgetStore = create<WidgetStoreState>((set, get) => ({
  widgets: DEFAULT_WIDGETS,
  isEditMode: false,
  isAddWidgetDrawerOpen: false,
  scratchpadNotes: '',
  careerProfile: DEFAULT_CAREER_PROFILE,

  loadInitialData: async () => {
    try {
      const [savedWidgets, savedNotes, savedCareer] = await Promise.all([
        getDBItem<WidgetItem[]>('aura-widgets-layout'),
        getDBItem<string>('aura-scratchpad-notes'),
        getDBItem<CareerProfile>('aura-career-profile')
      ]);

      if (savedWidgets && Array.isArray(savedWidgets) && savedWidgets.length > 0) {
        set({ widgets: savedWidgets });
      }
      if (savedNotes !== null && savedNotes !== undefined) {
        set({ scratchpadNotes: savedNotes });
      }
      if (savedCareer) {
        set({ careerProfile: savedCareer });
      }
    } catch (e) {
      console.warn('Failed to load widget store data:', e);
    }
  },

  setIsEditMode: (val) => {
    set((state) => ({
      isEditMode: typeof val === 'function' ? val(state.isEditMode) : val
    }));
  },

  toggleEditMode: () => {
    set((state) => ({ isEditMode: !state.isEditMode }));
  },

  setIsAddWidgetDrawerOpen: (isOpen) => {
    set({ isAddWidgetDrawerOpen: isOpen });
  },

  reorderWidgets: (newOrder) => {
    const updated = newOrder.map((w, index) => ({ ...w, order: index }));
    set({ widgets: updated });
    setDBItemDebounced('aura-widgets-layout', updated);
  },

  addWidget: (type, size = 'medium', title) => {
    const state = get();
    const id = `w-${type}-${Date.now()}`;
    const defaultTitles: Record<WidgetType, string> = {
      capture: 'Quick Capture',
      shuffled_pinned: 'Priority Deck',
      focus_timer: 'Deep Work Timer',
      triage_deck: 'Task Triage Deck',
      career_blocks: 'Career & Milestones',
      grove: 'The Grove Garden',
      momentum: 'Daily Velocity',
      scratchpad: 'Scratchpad',
      ambient: 'Focus Soundscape',
      mini_calendar: 'Agenda & Calendar',
      zen_minute: 'Zen Minute'
    };

    const newWidget: WidgetItem = {
      id,
      type,
      title: title || defaultTitles[type] || 'Widget',
      size,
      order: state.widgets.length,
      visible: true,
    };

    const nextWidgets = [...state.widgets, newWidget];
    set({ widgets: nextWidgets });
    setDBItem('aura-widgets-layout', nextWidgets);
  },

  removeWidget: (id) => {
    set((state) => {
      const nextWidgets = state.widgets.filter(w => w.id !== id);
      setDBItem('aura-widgets-layout', nextWidgets);
      return { widgets: nextWidgets };
    });
  },

  resizeWidget: (id, size) => {
    set((state) => {
      const nextWidgets = state.widgets.map(w => w.id === id ? { ...w, size } : w);
      setDBItem('aura-widgets-layout', nextWidgets);
      return { widgets: nextWidgets };
    });
  },

  toggleWidgetVisibility: (id) => {
    set((state) => {
      const nextWidgets = state.widgets.map(w => w.id === id ? { ...w, visible: w.visible === false ? true : false } : w);
      setDBItem('aura-widgets-layout', nextWidgets);
      return { widgets: nextWidgets };
    });
  },

  resetToDefaultLayout: () => {
    set({ widgets: DEFAULT_WIDGETS });
    setDBItem('aura-widgets-layout', DEFAULT_WIDGETS);
  },

  setScratchpadNotes: (notes) => {
    set({ scratchpadNotes: notes });
    setDBItemDebounced('aura-scratchpad-notes', notes);
  },

  updateCareerProfile: (profile) => {
    set((state) => {
      const nextProfile = { ...state.careerProfile, ...profile };
      setDBItem('aura-career-profile', nextProfile);
      return { careerProfile: nextProfile };
    });
  },

  toggleCareerGoal: (goalId) => {
    set((state) => {
      const nextGoals = state.careerProfile.goals.map(g => {
        if (g.id === goalId) {
          const completed = !g.completed;
          return { ...g, completed, progress: completed ? 100 : g.progress === 100 ? 50 : g.progress };
        }
        return g;
      });
      const nextProfile = { ...state.careerProfile, goals: nextGoals };
      setDBItem('aura-career-profile', nextProfile);
      return { careerProfile: nextProfile };
    });
  },

  addCareerGoal: (goal) => {
    set((state) => {
      const id = `g-${Date.now()}`;
      const newGoal = { ...goal, id };
      const nextGoals = [...state.careerProfile.goals, newGoal];
      const nextProfile = { ...state.careerProfile, goals: nextGoals };
      setDBItem('aura-career-profile', nextProfile);
      return { careerProfile: nextProfile };
    });
  }
}));
