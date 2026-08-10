import { create } from 'zustand';

export const useUIStore = create((set) => ({
    currentView: 'flow', // 'flow' | 'grove' | 'journal' | 'projects' | 'review'
    activeFilter: { type: 'all', value: null },
    toastMessage: null,
    achievementToast: null,
    assistantMessage: null,
    focusTaskId: null,
    winModalTaskId: null,
    
    // Modal Visibility States
    isSettingsOpen: false,
    isPlanting: false,
    isSearchOpen: false,
    isMindfulMinuteOpen: false,
    isThemeCreatorOpen: false,
    isArchiveOpen: false,
    isShareSummaryOpen: false,
    isCommandPaletteOpen: false,
    detailModal: { isOpen: false, taskId: null },
    shutdownRitual: false,

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

    setIsSettingsOpen: (open) => set({ isSettingsOpen: open }),
    setIsPlanting: (planting) => set({ isPlanting: planting }),
    setIsSearchOpen: (open) => set({ isSearchOpen: open }),
    setIsMindfulMinuteOpen: (open) => set({ isMindfulMinuteOpen: open }),
    setIsThemeCreatorOpen: (open) => set({ isThemeCreatorOpen: open }),
    setIsArchiveOpen: (open) => set({ isArchiveOpen: open }),
    setIsShareSummaryOpen: (open) => set({ isShareSummaryOpen: open }),
    setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
    setDetailModal: (modal) => set({ detailModal: modal }),
    setShutdownRitual: (active) => set({ shutdownRitual: active })
}));
