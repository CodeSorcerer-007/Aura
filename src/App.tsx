import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppLogic } from './hooks/useAppLogic';
import { useCommandPaletteConfig } from './hooks/useCommandPaletteConfig';
import { useDashboardMetrics } from './hooks/useDashboardMetrics';
import { useGamificationActions } from './hooks/useGamificationActions';

import { useUIStore } from './store/useUIStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useTaskStore } from './store/useTaskStore';
import { SHUTDOWN_RITUAL_MESSAGES, SHUTDOWN_RITUAL_STEP_COUNT } from './utils/ritualMessages';

// Components
import { Header, AssistantPrompt } from './components/layout/Header';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { BottomNav } from './components/layout/BottomNav';
import { CaptureInput } from './components/layout/CaptureInput';
import { ThemeBackground } from './components/layout/ThemeBackground';
import { LoadingScreen } from './components/layout/ToastsAndLoading';
import { ModalContainer } from './components/layout/ModalContainer';

// Views
import { FlowView } from './components/views/FlowView';
const AgndexDashboardView = React.lazy(() => import('./components/views/AgndexDashboardView').then(m => ({ default: m.AgndexDashboardView })));
const CalendarView = React.lazy(() => import('./components/views/CalendarView').then(m => ({ default: m.CalendarView })));
const ConstellationsView = React.lazy(() => import('./components/views/ConstellationsView').then(m => ({ default: m.ConstellationsView })));
const GroveView = React.lazy(() => import('./components/views/GroveView').then(m => ({ default: m.GroveView })));
const JournalView = React.lazy(() => import('./components/views/JournalView').then(m => ({ default: m.JournalView })));
const ReviewView = React.lazy(() => import('./components/views/ReviewView').then(m => ({ default: m.ReviewView })));

export default function App() {
    // Run headless background logic (sub-hooks handle streaks, achievements, etc.)
    useAppLogic();

    // Custom hooks for app actions & metrics
    const commands = useCommandPaletteConfig();
    const metrics = useDashboardMetrics();

    // Direct Store selectors for layout/view state
    const isLoading = useTaskStore(s => s.isLoading);
    const tasks = useTaskStore(s => s.tasks);
    const templates = useTaskStore(s => s.templates);
    const journalEntries = useTaskStore(s => s.journalEntries);

    const theme = useSettingsStore(s => s.theme);
    const customThemes = useSettingsStore(s => s.customThemes);

    const currentView = useUIStore(s => s.currentView);
    const setCurrentView = useUIStore(s => s.setCurrentView);
    const assistantMessage = useUIStore(s => s.assistantMessage);
    const setAssistantMessage = useUIStore(s => s.setAssistantMessage);
    const shutdownRitual = useUIStore(s => s.shutdownRitual);
    const setShutdownRitual = useUIStore(s => s.setShutdownRitual);
    const activeFilter = useUIStore(s => s.activeFilter);
    const setActiveFilter = useUIStore(s => s.setActiveFilter);
    const setFocusTaskId = useUIStore(s => s.setFocusTaskId);
    const setDetailModal = useUIStore(s => s.setDetailModal);
    const setIsSettingsOpen = useUIStore(s => s.setIsSettingsOpen);
    const setIsSearchOpen = useUIStore(s => s.setIsSearchOpen);
    const setIsMindfulMinuteOpen = useUIStore(s => s.setIsMindfulMinuteOpen);
    const setIsShareSummaryOpen = useUIStore(s => s.setIsShareSummaryOpen);
    const setIsShortcutsOpen = useUIStore(s => s.setIsShortcutsOpen);
    const setIsPluginsOpen = useUIStore(s => s.setIsPluginsOpen);

    // Pull task actions and gamification directly
    const toggleTask = useTaskStore(s => s.toggleTask);
    const deleteTask = useTaskStore(s => s.deleteTask);
    const archiveTask = useTaskStore(s => s.archiveTask);
    const updateTaskOrderAndSection = useTaskStore(s => s.updateTaskOrderAndSection);
    const toggleSubtask = useTaskStore(s => s.toggleSubtask);
    const togglePin = useTaskStore(s => s.togglePin);
    const saveTemplate = useTaskStore(s => s.saveTemplate);
    const setJournalEntries = useTaskStore(s => s.setJournalEntries);
    const addTask = useTaskStore(s => s.addTask);

    const grove = useSettingsStore(s => s.grove);
    const stats = useSettingsStore(s => s.stats);
    const unlockedAchievements = useSettingsStore(s => s.unlockedAchievements);

    const { handlePlantSeed } = useGamificationActions();

    return (
        <div className={`theme-wrapper theme-${theme} min-h-screen font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text-primary)] flex overflow-x-hidden`}>
            <ThemeBackground theme={theme} />
            <AnimatePresence>
                {isLoading && <LoadingScreen key="loading" />}
            </AnimatePresence>

            {!isLoading && (
                <div className="flex flex-1 min-h-screen relative z-10">
                    {/* Desktop Sidebar Rail */}
                    <DesktopSidebar
                        currentView={currentView}
                        onSelectView={setCurrentView}
                        allCategories={metrics.allCategories}
                        onOpenPlugins={() => setIsPluginsOpen(true)}
                    />

                    {/* Main Content Area */}
                    <motion.div
                        key="main-app"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col flex-1 min-w-0 main-container"
                    >
                        <main className="flex-grow pt-6 pb-44 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto w-full">
                            {currentView !== 'workspace' && (
                                <Header
                                    momentumProgress={metrics.momentumProgress}
                                    onSettingsClick={() => setIsSettingsOpen(true)}
                                    onSearchClick={() => setIsSearchOpen(true)}
                                    onShortcutsClick={() => setIsShortcutsOpen(true)}
                                    onMindfulClick={() => setIsMindfulMinuteOpen(true)}
                                    dailyQuote={metrics.dailyQuote}
                                    onShare={() => setIsShareSummaryOpen(true)}
                                />
                            )}

                            <AnimatePresence>
                                {assistantMessage && (
                                    <AssistantPrompt
                                        message={
                                            typeof assistantMessage === 'string'
                                                ? assistantMessage
                                                : (assistantMessage as any)?.message
                                        }
                                        action={(assistantMessage as any)?.action}
                                        onAction={() => {}}
                                        onClose={() => setAssistantMessage(null)}
                                        showNext={
                                            shutdownRitual.active &&
                                            shutdownRitual.step < SHUTDOWN_RITUAL_STEP_COUNT - 1
                                        }
                                        onNext={() => {
                                            const nextStep = shutdownRitual.step + 1;
                                            if (nextStep >= SHUTDOWN_RITUAL_STEP_COUNT) {
                                                setShutdownRitual({ active: false, step: 0 });
                                            } else {
                                                setShutdownRitual(s => ({ ...s, step: nextStep }));
                                            }
                                        }}
                                    />
                                )}
                            </AnimatePresence>

                            <Suspense fallback={<div className="flex justify-center items-center h-64 text-sm opacity-50">Loading view...</div>}>
                                <AnimatePresence mode="wait">
                                    {currentView === 'workspace' ? (
                                        <AgndexDashboardView
                                            key="workspace"
                                            tasks={tasks}
                                            onAddTask={addTask}
                                            onToggleTask={toggleTask}
                                            onDeleteTask={deleteTask}
                                            onArchiveTask={archiveTask}
                                            onTogglePin={togglePin}
                                            onFocusTask={setFocusTaskId}
                                            onOpenDetail={(id: string) => setDetailModal({ isOpen: true, taskId: id })}
                                            onPlantSeed={handlePlantSeed}
                                            allCategories={metrics.allCategories}
                                            allTags={metrics.allTags || []}
                                        />
                                    ) : currentView === 'flow' ? (
                                        <FlowView
                                            key="flow"
                                            tasks={metrics.filteredTasks}
                                            toggleTask={toggleTask}
                                            deleteTask={deleteTask}
                                            onFocus={setFocusTaskId}
                                            activeFilter={activeFilter}
                                            setActiveFilter={setActiveFilter}
                                            updateTaskOrderAndSection={updateTaskOrderAndSection}
                                            onToggleSubtask={toggleSubtask}
                                            allTasks={tasks}
                                            allCategories={metrics.allCategories}
                                            onOpenDetail={(id: string) => setDetailModal({ isOpen: true, taskId: id })}
                                            onTogglePin={togglePin}
                                            onArchive={archiveTask}
                                        />
                                    ) : currentView === 'calendar' ? (
                                        <CalendarView
                                            key="calendar"
                                            tasks={tasks}
                                            toggleTask={toggleTask}
                                            onFocus={setFocusTaskId}
                                            onOpenDetail={(id: string) => setDetailModal({ isOpen: true, taskId: id })}
                                            allCategories={metrics.allCategories}
                                        />
                                    ) : currentView === 'constellations' ? (
                                        <ConstellationsView
                                            key="constellations"
                                            tasks={tasks}
                                            toggleTask={toggleTask}
                                            onSaveTemplate={saveTemplate}
                                            templates={templates}
                                            allCategories={metrics.allCategories}
                                        />
                                    ) : currentView === 'grove' ? (
                                        <GroveView
                                            key="grove"
                                            tasks={tasks}
                                            grove={grove}
                                            goldenSeeds={stats.goldenSeeds}
                                            onPlantSeed={handlePlantSeed}
                                            allCategories={metrics.allCategories}
                                        />
                                    ) : currentView === 'journal' ? (
                                        <JournalView
                                            key="journal"
                                            journalEntries={journalEntries}
                                            setJournalEntries={setJournalEntries}
                                            completedTasks={tasks.filter(t => t.completed && !t.isArchived)}
                                        />
                                    ) : currentView === 'review' ? (
                                        <ReviewView
                                            key="review"
                                            tasks={tasks}
                                            achievements={unlockedAchievements}
                                            allCategories={metrics.allCategories}
                                            stats={stats}
                                            onDeleteStale={deleteTask}
                                        />
                                    ) : null}
                                </AnimatePresence>
                            </Suspense>
                        </main>

                        {/* Bottom Navigation & Floating Capture */}
                        <motion.div 
                            initial={{ y: 100 }} 
                            animate={{ y: 0 }} 
                            transition={{ type: 'spring', stiffness: 100 }} 
                            className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none pt-6 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/90 to-transparent flex justify-center"
                        >
                            <div className="max-w-2xl w-full mx-auto flex flex-col items-center gap-3">
                                <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
                                {currentView !== 'workspace' && <CaptureInput onAddTask={addTask} />}
                            </div>
                        </motion.div>
                        <ModalContainer commands={commands} />
                    </motion.div>
                </div>
            )}
            {customThemes.length > 0 && (
                <style>
                    {customThemes
                        .map(
                            t =>
                                `.theme-${t.id} { --color-bg: ${t.bg}; --color-bg-secondary: ${t.bgSecondary}; --color-bg-secondary-hover: ${t.bgSecondary}cc; --color-bg-input: ${t.bgSecondary}80; --color-text-primary: ${t.textPrimary}; --color-text-secondary: ${t.textSecondary}; --color-border: ${t.accent}40; --color-accent: ${t.accent}; }`
                        )
                        .join('\n')}
                </style>
            )}
        </div>
    );
}
