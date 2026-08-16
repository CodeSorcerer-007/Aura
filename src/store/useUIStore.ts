import { create } from 'zustand';
import { ActiveFilter, ViewType } from '../types';

export interface ToastMessage {
    text: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    undoAction?: () => void;
}

export interface AchievementToast {
    title: string;
    description: string;
}

export interface DetailModalState {
    isOpen: boolean;
    taskId: string | null;
}

export interface ShutdownRitualState {
    active: boolean;
    step: number;
}

export interface UIState {
    currentView: ViewType;
    activeFilter: ActiveFilter;
    toastMessage: ToastMessage | null;
    achievementToast: AchievementToast | null;
    assistantMessage: string | null;
    focusTaskId: string | null;
    winModalTaskId: string | null;
    templateSuggestion: string | null;
    importInputRef: { current: HTMLInputElement | null };

    // Modal Visibility States
    isSettingsOpen: boolean;
    isPlanting: boolean;
    isSearchOpen: boolean;
    isMindfulMinuteOpen: boolean;
    isThemeCreatorOpen: boolean;
    isArchiveOpen: boolean;
    isShortcutsOpen: boolean;
    isShareSummaryOpen: boolean;
    isCommandPaletteOpen: boolean;
    isMorningRitualOpen: boolean;
    isQuickCaptureOpen: boolean;
    isPluginsOpen: boolean;
    detailModal: DetailModalState;
    shutdownRitual: ShutdownRitualState;

    // Actions
    setCurrentView: (view: ViewType) => void;
    setActiveFilter: (filter: ActiveFilter) => void;
    setToastMessage: (msg: ToastMessage | null) => void;
    setAchievementToast: (toast: AchievementToast | null) => void;
    setAssistantMessage: (msg: string | null) => void;
    setFocusTaskId: (id: string | null) => void;
    setWinModalTaskId: (id: string | null) => void;
    setTemplateSuggestion: (suggestion: string | null) => void;
    setImportInputRef: (ref: { current: HTMLInputElement | null }) => void;

    setIsSettingsOpen: (open: boolean) => void;
    setIsPlanting: (planting: boolean) => void;
    setIsSearchOpen: (open: boolean) => void;
    setIsMindfulMinuteOpen: (open: boolean) => void;
    setIsThemeCreatorOpen: (open: boolean) => void;
    setIsArchiveOpen: (open: boolean) => void;
    setIsShortcutsOpen: (open: boolean) => void;
    setIsShareSummaryOpen: (open: boolean) => void;
    setIsCommandPaletteOpen: (open: boolean) => void;
    setIsMorningRitualOpen: (open: boolean) => void;
    setIsQuickCaptureOpen: (open: boolean) => void;
    setIsPluginsOpen: (open: boolean) => void;
    setDetailModal: (modal: DetailModalState) => void;
    setShutdownRitual: (ritual: ShutdownRitualState | boolean | ((prev: ShutdownRitualState) => ShutdownRitualState)) => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentView: 'workspace',
    activeFilter: { type: 'all', value: null },
    toastMessage: null,
    achievementToast: null,
    assistantMessage: null,
    focusTaskId: null,
    winModalTaskId: null,
    templateSuggestion: null,
    importInputRef: { current: null },
    
    // Modal Visibility States
    isSettingsOpen: false,
    isPlanting: false,
    isSearchOpen: false,
    isMindfulMinuteOpen: false,
    isThemeCreatorOpen: false,
    isArchiveOpen: false,
    isShortcutsOpen: false,
    isShareSummaryOpen: false,
    isCommandPaletteOpen: false,
    isMorningRitualOpen: false,
    isQuickCaptureOpen: false,
    isPluginsOpen: false,
    detailModal: { isOpen: false, taskId: null },
    shutdownRitual: { active: false, step: 0 },

    // Actions
    setCurrentView: (view) => set({ currentView: view }),
    setActiveFilter: (filter) => set({ activeFilter: filter }),
    
    setToastMessage: (msg) => {
        set({ toastMessage: msg });
        if (msg) {
            setTimeout(() => {
                set((state) => state.toastMessage === msg ? { toastMessage: null } : state);
            }, msg.duration || 4000);
        }
    },

    setAchievementToast: (toast) => set({ achievementToast: toast }),
    setAssistantMessage: (msg) => set({ assistantMessage: msg }),
    setFocusTaskId: (id) => set({ focusTaskId: id }),
    setWinModalTaskId: (id) => set({ winModalTaskId: id }),
    setTemplateSuggestion: (suggestion) => set({ templateSuggestion: suggestion }),
    setImportInputRef: (ref) => set({ importInputRef: ref }),

    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setIsPlanting: (planting) => set({ isPlanting: planting }),
    setIsSearchOpen: (open) => set({ isSearchOpen: open }),
    setIsMindfulMinuteOpen: (open) => set({ isMindfulMinuteOpen: open }),
    setIsThemeCreatorOpen: (open) => set({ isThemeCreatorOpen: open }),
    setIsArchiveOpen: (open) => set({ isArchiveOpen: open }),
    setIsShortcutsOpen: (open) => set({ isShortcutsOpen: open }),
    setIsShareSummaryOpen: (open) => set({ isShareSummaryOpen: open }),
    setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
    setIsMorningRitualOpen: (open) => set({ isMorningRitualOpen: open }),
    setIsQuickCaptureOpen: (open) => set({ isQuickCaptureOpen: open }),
    setIsPluginsOpen: (open) => set({ isPluginsOpen: open }),
    setDetailModal: (modal) => set({ detailModal: modal }),
    setShutdownRitual: (activeOrStateOrFn) => set((state) => {
        let next: ShutdownRitualState;
        if (typeof activeOrStateOrFn === 'function') {
            next = activeOrStateOrFn(state.shutdownRitual);
        } else if (typeof activeOrStateOrFn === 'boolean') {
            next = { active: activeOrStateOrFn, step: activeOrStateOrFn ? 1 : 0 };
        } else {
            next = activeOrStateOrFn;
        }
        return { shutdownRitual: next };
    })
}));
