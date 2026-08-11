import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';

export function useCommandPaletteConfig() {
    const setTheme = useSettingsStore(s => s.setTheme);
    const setIsSearchOpen = useUIStore(s => s.setIsSearchOpen);
    const setIsSettingsOpen = useUIStore(s => s.setIsSettingsOpen);
    const setCurrentView = useUIStore(s => s.setCurrentView);

    return React.useMemo(() => [
        { 
            id: 'cmd-new-task', 
            label: "New Task", 
            action: () => (document.querySelector('input[placeholder*="Capture a thought"]') as HTMLElement | null)?.focus(), 
            shortcut: "N" 
        },
        { id: 'cmd-search', label: "Open Search", action: () => setIsSearchOpen(true), shortcut: "" },
        { id: 'cmd-settings', label: "Open Settings", action: () => setIsSettingsOpen(true), shortcut: "S" },
        { id: 'cmd-theme-dark', label: "Toggle Theme: Dark", action: () => setTheme('dark'), shortcut: "" },
        { id: 'cmd-theme-light', label: "Toggle Theme: Light", action: () => setTheme('light'), shortcut: "" },
        { id: 'cmd-view-flow', label: "Go to Flow", action: () => setCurrentView('flow'), shortcut: "1" },
        { id: 'cmd-view-calendar', label: "Go to Calendar", action: () => setCurrentView('calendar'), shortcut: "2" },
        { id: 'cmd-view-projects', label: "Go to Projects", action: () => setCurrentView('constellations'), shortcut: "3" },
        { id: 'cmd-view-grove', label: "Go to Grove", action: () => setCurrentView('grove'), shortcut: "4" },
        { id: 'cmd-view-journal', label: "Go to Journal", action: () => setCurrentView('journal'), shortcut: "5" },
        { id: 'cmd-view-review', label: "Go to Review", action: () => setCurrentView('review'), shortcut: "6" },
    ], [setTheme, setIsSearchOpen, setIsSettingsOpen, setCurrentView]);
}
