import React, { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useTaskStore } from '../../store/useTaskStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useUIStore } from '../../store/useUIStore';
import { useTaskActions } from '../../hooks/useTaskActions';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { useDataSync } from '../../hooks/useDataSync';
import { useGamificationActions } from '../../hooks/useGamificationActions';
import { isElectron } from '../../utils/electronBridge';
import { CustomTheme, Task } from '../../types';

// Lazy load modals for optimal bundle splitting and performance
const SettingsModal = React.lazy(() => import('../modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
const FocusView = React.lazy(() => import('../modals/FocusView').then(m => ({ default: m.FocusView })));
const TaskDetailModal = React.lazy(() => import('../modals/TaskDetailModal').then(m => ({ default: m.TaskDetailModal })));
const SearchModal = React.lazy(() => import('../modals/SearchModal').then(m => ({ default: m.SearchModal })));
const MindfulMinuteModal = React.lazy(() => import('../modals/MindfulMinuteModal').then(m => ({ default: m.MindfulMinuteModal })));
const ThemeCreatorModal = React.lazy(() => import('../modals/ThemeCreatorModal').then(m => ({ default: m.ThemeCreatorModal })));
const ArchiveModal = React.lazy(() => import('../modals/ArchiveModal').then(m => ({ default: m.ArchiveModal })));
const ShareSummaryModal = React.lazy(() => import('../modals/ShareSummaryModal').then(m => ({ default: m.ShareSummaryModal })));
const CommandPalette = React.lazy(() => import('../modals/CommandPalette').then(m => ({ default: m.CommandPalette })));
const WinModal = React.lazy(() => import('../modals/WinModal').then(m => ({ default: m.WinModal })));
const MorningRitualModal = React.lazy(() => import('../modals/MorningRitualModal').then(m => ({ default: m.MorningRitualModal })));
const QuickCaptureOverlay = React.lazy(() => import('../modals/QuickCaptureOverlay').then(m => ({ default: m.QuickCaptureOverlay })));
const ShortcutsModal = React.lazy(() => import('../modals/ShortcutsModal').then(m => ({ default: m.ShortcutsModal })));
const PluginsModal = React.lazy(() => import('../modals/PluginsModal').then(m => ({ default: m.PluginsModal })));
const PlantingAnimation = React.lazy(() => import('../views/GroveView').then(m => ({ default: m.PlantingAnimation })));

// Toast components are lightweight layout components
import { AchievementToast, GenericToast } from './ToastsAndLoading';

interface ModalContainerProps {
    commands: any[];
}

export const ModalContainer: React.FC<ModalContainerProps> = ({ commands }) => {
    // Custom Hooks
    const {
        addTask,
        toggleTask,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        reorderTask,
        toggleSubtask,
        togglePin,
        logDistraction,
        setTasks,
    } = useTaskActions();

    const { dailyStats, allCategories, allThemes } = useDashboardMetrics();
    const { handleExport, handleImport } = useDataSync();
    const { finishPlanting, handleFocusComplete, handleSetMITs } = useGamificationActions();

    // Task Store
    const tasks = useTaskStore(s => s.tasks);
    const customCategories = useTaskStore(s => s.customCategories);
    const setCustomCategories = useTaskStore(s => s.setCustomCategories);

    // Settings Store
    const theme = useSettingsStore(s => s.theme);
    const setTheme = useSettingsStore(s => s.setTheme);
    const customThemes = useSettingsStore(s => s.customThemes);
    const soundEffectsEnabled = useSettingsStore(s => s.soundEffectsEnabled);
    const setSoundEffectsEnabled = useSettingsStore(s => s.setSoundEffectsEnabled);
    const autoArchiveEnabled = useSettingsStore(s => s.autoArchiveEnabled);
    const setAutoArchiveEnabled = useSettingsStore(s => s.setAutoArchiveEnabled);
    const notificationsEnabled = useSettingsStore(s => s.notificationsEnabled);
    const setNotificationsEnabled = useSettingsStore(s => s.setNotificationsEnabled);
    const autoStartEnabled = useSettingsStore(s => s.autoStartEnabled);
    const setAutoStartEnabled = useSettingsStore(s => s.setAutoStartEnabled);
    const shutdownTime = useSettingsStore(s => s.shutdownTime);
    const setShutdownTime = useSettingsStore(s => s.setShutdownTime);
    const morningTime = useSettingsStore(s => s.morningTime);
    const setMorningTime = useSettingsStore(s => s.setMorningTime);
    const setCustomThemes = useSettingsStore(s => s.setCustomThemes);

    // UI Store
    const focusTaskId = useUIStore(s => s.focusTaskId);
    const setFocusTaskId = useUIStore(s => s.setFocusTaskId);
    const winModalTaskId = useUIStore(s => s.winModalTaskId);
    const setWinModalTaskId = useUIStore(s => s.setWinModalTaskId);
    const achievementToast = useUIStore(s => s.achievementToast);
    const setAchievementToast = useUIStore(s => s.setAchievementToast);
    const toastMessage = useUIStore(s => s.toastMessage);
    const setToastMessage = useUIStore(s => s.setToastMessage);
    const detailModal = useUIStore(s => s.detailModal);
    const setDetailModal = useUIStore(s => s.setDetailModal);
    const isSettingsOpen = useUIStore(s => s.isSettingsOpen);
    const setIsSettingsOpen = useUIStore(s => s.setIsSettingsOpen);
    const isPlanting = useUIStore(s => s.isPlanting);
    const isSearchOpen = useUIStore(s => s.isSearchOpen);
    const setIsSearchOpen = useUIStore(s => s.setIsSearchOpen);
    const isMindfulMinuteOpen = useUIStore(s => s.isMindfulMinuteOpen);
    const setIsMindfulMinuteOpen = useUIStore(s => s.setIsMindfulMinuteOpen);
    const isThemeCreatorOpen = useUIStore(s => s.isThemeCreatorOpen);
    const setIsThemeCreatorOpen = useUIStore(s => s.setIsThemeCreatorOpen);
    const isArchiveOpen = useUIStore(s => s.isArchiveOpen);
    const setIsArchiveOpen = useUIStore(s => s.setIsArchiveOpen);
    const isShortcutsOpen = useUIStore(s => s.isShortcutsOpen);
    const setIsShortcutsOpen = useUIStore(s => s.setIsShortcutsOpen);
    const isShareSummaryOpen = useUIStore(s => s.isShareSummaryOpen);
    const setIsShareSummaryOpen = useUIStore(s => s.setIsShareSummaryOpen);
    const isCommandPaletteOpen = useUIStore(s => s.isCommandPaletteOpen);
    const setIsCommandPaletteOpen = useUIStore(s => s.setIsCommandPaletteOpen);
    const isMorningRitualOpen = useUIStore(s => s.isMorningRitualOpen);
    const setIsMorningRitualOpen = useUIStore(s => s.setIsMorningRitualOpen);
    const isQuickCaptureOpen = useUIStore(s => s.isQuickCaptureOpen);
    const setIsQuickCaptureOpen = useUIStore(s => s.setIsQuickCaptureOpen);
    const isPluginsOpen = useUIStore(s => s.isPluginsOpen);
    const setIsPluginsOpen = useUIStore(s => s.setIsPluginsOpen);
    const importInputRef = useUIStore(s => s.importInputRef);

    const detailTask = React.useMemo(() => tasks.find(t => t.id === detailModal.taskId), [tasks, detailModal.taskId]);
    const focusTask = React.useMemo(() => tasks.find(t => t.id === focusTaskId), [tasks, focusTaskId]);

    return (
        <Suspense fallback={null}>
            <AnimatePresence>
                {isSettingsOpen && (
                    <SettingsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        theme={theme}
                        setTheme={setTheme}
                        customCategories={customCategories}
                        setCustomCategories={setCustomCategories}
                        allThemes={allThemes}
                        onOpenThemeCreator={() => setIsThemeCreatorOpen(true)}
                        shutdownTime={shutdownTime}
                        onSetShutdownTime={setShutdownTime}
                        morningTime={morningTime}
                        onSetMorningTime={setMorningTime}
                        soundEffectsEnabled={soundEffectsEnabled}
                        onSetSoundEffectsEnabled={setSoundEffectsEnabled}
                        onOpenArchive={() => setIsArchiveOpen(true)}
                        autoArchiveEnabled={autoArchiveEnabled}
                        onSetAutoArchiveEnabled={setAutoArchiveEnabled}
                        notificationsEnabled={notificationsEnabled}
                        onSetNotificationsEnabled={setNotificationsEnabled}
                        autoStartEnabled={autoStartEnabled}
                        onSetAutoStartEnabled={setAutoStartEnabled}
                        onExport={handleExport}
                        onTriggerImport={() => {
                            if (isElectron()) {
                                handleImport(null);
                            } else {
                                importInputRef.current?.click();
                            }
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>{isPlanting && <PlantingAnimation onComplete={finishPlanting} />}</AnimatePresence>
            <AnimatePresence>{focusTask && <FocusView task={focusTask} onClose={() => setFocusTaskId(null)} onComplete={handleFocusComplete} onLogDistraction={logDistraction} />}</AnimatePresence>
            <AnimatePresence>{winModalTaskId && <WinModal task={tasks.find(t => t.id === winModalTaskId)} onSaveWin={(id: string, winText: string) => { setTasks((prev: Task[]) => prev.map(t => t.id === id ? { ...t, win: winText, isGolden: true } : t)); useSettingsStore.getState().setStats(s => ({ ...s, goldenSeeds: (s.goldenSeeds || 0) + 1 })); setWinModalTaskId(null); }} onClose={() => setWinModalTaskId(null)} />}</AnimatePresence>
            
            <AnimatePresence>{achievementToast && <AchievementToast achievement={achievementToast} onClose={() => setAchievementToast(null)} />}</AnimatePresence>
            <AnimatePresence>{toastMessage && <GenericToast message={toastMessage} onClose={() => setToastMessage(null)} />}</AnimatePresence>
            
            <div className="sr-only" aria-live="polite" aria-atomic="true">
                {toastMessage ? toastMessage.text : ''}
            </div>

            <AnimatePresence><SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} tasks={tasks.filter(t => !t.isArchived)} toggleTask={toggleTask} deleteTask={deleteTask} onFocus={setFocusTaskId} onReorder={reorderTask} onToggleSubtask={toggleSubtask} allCategories={allCategories} onOpenDetail={(id: string) => setDetailModal({ isOpen: true, taskId: id })} onTogglePin={togglePin} onArchive={archiveTask} /></AnimatePresence>
            <AnimatePresence><TaskDetailModal isOpen={detailModal.isOpen} onClose={() => setDetailModal({ isOpen: false, taskId: null })} task={detailTask} onSave={saveTaskDetail} onSetDependency={setTaskDependency} allTasks={tasks.filter(t => !t.isArchived)} onAddAttachment={addAttachmentToTask} onDeleteAttachment={deleteAttachmentFromTask} /></AnimatePresence>
            <AnimatePresence><MindfulMinuteModal isOpen={isMindfulMinuteOpen} onClose={() => setIsMindfulMinuteOpen(false)} /></AnimatePresence>
            <AnimatePresence><ThemeCreatorModal isOpen={isThemeCreatorOpen} onClose={() => setIsThemeCreatorOpen(false)} onSave={(newTheme: CustomTheme) => setCustomThemes(ct => [...ct, newTheme])} /></AnimatePresence>
            <AnimatePresence><ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} archivedTasks={tasks.filter(t => t.isArchived)} onRestore={restoreTask} onDelete={deleteTask} /></AnimatePresence>
            <AnimatePresence><ShareSummaryModal isOpen={isShareSummaryOpen} onClose={() => setIsShareSummaryOpen(false)} dailyStats={dailyStats} /></AnimatePresence>
            <AnimatePresence><CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} commands={commands} /></AnimatePresence>
            <AnimatePresence>{isMorningRitualOpen && <MorningRitualModal isOpen={isMorningRitualOpen} tasks={tasks} onClose={() => setIsMorningRitualOpen(false)} onSetMITs={handleSetMITs} />}</AnimatePresence>
            <AnimatePresence>{isQuickCaptureOpen && <QuickCaptureOverlay onAddTask={addTask} onClose={() => setIsQuickCaptureOpen(false)} />}</AnimatePresence>
            <AnimatePresence>{isShortcutsOpen && <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />}</AnimatePresence>
            <AnimatePresence>{isPluginsOpen && <PluginsModal isOpen={isPluginsOpen} onClose={() => setIsPluginsOpen(false)} />}</AnimatePresence>
            
            <input type="file" ref={importInputRef as any} onChange={handleImport} className="hidden" accept=".json" />
        </Suspense>
    );
};
