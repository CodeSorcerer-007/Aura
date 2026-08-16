import { useEffect } from 'react';
import { useUIStore } from '../store/useUIStore';

/**
 * Registers app-wide keyboard shortcuts:
 * - Ctrl/Cmd+P   → command palette
 * - Escape        → close topmost modal/overlay
 * - n             → focus the capture input
 * - s             → open settings
 * - ?             → toggle shortcuts modal
 * - 1–6           → switch views
 */
export function useGlobalKeybindings() {
    const isCommandPaletteOpen = useUIStore(state => state.isCommandPaletteOpen);
    const setIsCommandPaletteOpen = useUIStore(state => state.setIsCommandPaletteOpen);
    const isSearchOpen = useUIStore(state => state.isSearchOpen);
    const setIsSearchOpen = useUIStore(state => state.setIsSearchOpen);
    const isSettingsOpen = useUIStore(state => state.isSettingsOpen);
    const setIsSettingsOpen = useUIStore(state => state.setIsSettingsOpen);
    const isShortcutsOpen = useUIStore(state => state.isShortcutsOpen);
    const setIsShortcutsOpen = useUIStore(state => state.setIsShortcutsOpen);
    const detailModal = useUIStore(state => state.detailModal);
    const setDetailModal = useUIStore(state => state.setDetailModal);
    const focusTaskId = useUIStore(state => state.focusTaskId);
    const setFocusTaskId = useUIStore(state => state.setFocusTaskId);
    const isMindfulMinuteOpen = useUIStore(state => state.isMindfulMinuteOpen);
    const setIsMindfulMinuteOpen = useUIStore(state => state.setIsMindfulMinuteOpen);
    const isThemeCreatorOpen = useUIStore(state => state.isThemeCreatorOpen);
    const setIsThemeCreatorOpen = useUIStore(state => state.setIsThemeCreatorOpen);
    const setCurrentView = useUIStore(state => state.setCurrentView);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const activeEl = document.activeElement as HTMLElement | null;
            const isInputFocused = activeEl
                ? activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA'
                : false;

            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                setIsCommandPaletteOpen(!isCommandPaletteOpen);
            }

            if (e.key === 'Escape') {
                if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
                else if (isSearchOpen) setIsSearchOpen(false);
                else if (isSettingsOpen) setIsSettingsOpen(false);
                else if (isShortcutsOpen) setIsShortcutsOpen(false);
                else if (detailModal.isOpen) setDetailModal({ isOpen: false, taskId: null });
                else if (focusTaskId) setFocusTaskId(null);
                else if (isMindfulMinuteOpen) setIsMindfulMinuteOpen(false);
                else if (isThemeCreatorOpen) setIsThemeCreatorOpen(false);
                else if (useUIStore.getState().isPluginsOpen) useUIStore.getState().setIsPluginsOpen(false);
            }

            if (isInputFocused) return;

            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    (
                        document.querySelector(
                            'input[placeholder*="Capture a thought"]'
                        ) as HTMLElement | null
                    )?.focus();
                    break;
                case 's':
                    e.preventDefault();
                    setIsSettingsOpen(true);
                    break;
                case '?':
                    e.preventDefault();
                    setIsShortcutsOpen(!isShortcutsOpen);
                    break;
                case '1': setCurrentView('workspace'); break;
                case '2': setCurrentView('flow'); break;
                case '3': setCurrentView('calendar'); break;
                case '4': setCurrentView('constellations'); break;
                case '5': setCurrentView('grove'); break;
                case '6': setCurrentView('journal'); break;
                case '7': setCurrentView('review'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isCommandPaletteOpen, isSearchOpen, isSettingsOpen, isShortcutsOpen,
        detailModal.isOpen, focusTaskId, isMindfulMinuteOpen, isThemeCreatorOpen,
        setIsCommandPaletteOpen, setIsSearchOpen, setIsSettingsOpen, setIsShortcutsOpen,
        setDetailModal, setFocusTaskId, setIsMindfulMinuteOpen, setIsThemeCreatorOpen,
        setCurrentView,
    ]);
}
