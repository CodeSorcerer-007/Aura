package com.example.aura.ui.main

import android.content.Context
import androidx.activity.compose.BackHandler
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.example.aura.data.model.builtInThemes
import com.example.aura.ui.components.AchievementToast
import com.example.aura.ui.components.AuraBottomDock
import com.example.aura.ui.components.AuraHeader
import com.example.aura.ui.components.GenericToast
import com.example.aura.ui.modals.ArchiveModal
import com.example.aura.ui.modals.CommandItem
import com.example.aura.ui.modals.CommandPaletteModal
import com.example.aura.ui.modals.FocusModal
import com.example.aura.ui.modals.MindfulMinuteModal
import com.example.aura.ui.modals.PlantingAnimationModal
import com.example.aura.ui.modals.SearchModal
import com.example.aura.ui.modals.SettingsModal
import com.example.aura.ui.modals.ShareSummaryModal
import com.example.aura.ui.modals.TaskDetailModal
import com.example.aura.ui.modals.TemplateSuggestionModal
import com.example.aura.ui.modals.ThemeCreatorModal
import com.example.aura.ui.modals.WinModal
import com.example.aura.ui.theme.ThemeBackground
import com.example.aura.ui.views.ConstellationsView
import com.example.aura.ui.views.FlowView
import com.example.aura.ui.views.GroveView
import com.example.aura.ui.views.JournalView
import com.example.aura.ui.views.ReviewView

@Composable
fun MainScreen(
    viewModel: AuraViewModel,
    onPickAttachment: (Long) -> Unit,
    onExportBackup: () -> Unit,
    onImportBackup: () -> Unit
) {
    val context = LocalContext.current

    val tasks by viewModel.tasks.collectAsState()
    val currentView by viewModel.currentView.collectAsState()
    val activeTheme by viewModel.activeTheme.collectAsState()
    val customThemes by viewModel.customThemes.collectAsState()
    val customCategories by viewModel.customCategories.collectAsState()
    val userStats by viewModel.userStats.collectAsState()
    val unlockedAchievements by viewModel.unlockedAchievements.collectAsState()
    val trees by viewModel.trees.collectAsState()
    val templates by viewModel.templates.collectAsState()
    val journalEntries by viewModel.journalEntries.collectAsState()
    val activeFilter by viewModel.activeFilter.collectAsState()

    // Modals
    val activeAchievement by viewModel.activeAchievement.collectAsState()
    val activeToast by viewModel.activeToast.collectAsState()
    val winModalTask by viewModel.winModalTask.collectAsState()
    val focusTask by viewModel.focusTask.collectAsState()
    val detailTask by viewModel.detailTask.collectAsState()
    val isFocusOpen by viewModel.isFocusOpen.collectAsState()
    val isSettingsOpen by viewModel.isSettingsOpen.collectAsState()
    val isMindfulOpen by viewModel.isMindfulOpen.collectAsState()
    val isSearchOpen by viewModel.isSearchOpen.collectAsState()
    val isCommandPaletteOpen by viewModel.isCommandPaletteOpen.collectAsState()
    val isThemeCreatorOpen by viewModel.isThemeCreatorOpen.collectAsState()
    val isArchiveOpen by viewModel.isArchiveOpen.collectAsState()
    val isShareSummaryOpen by viewModel.isShareSummaryOpen.collectAsState()
    val isPlantingAnimationOpen by viewModel.isPlantingAnimationOpen.collectAsState()
    val suggestedTemplate by viewModel.suggestedTemplate.collectAsState()

    // Settings
    val soundEffectsEnabled by viewModel.soundEffectsEnabled.collectAsState()
    val autoArchiveEnabled by viewModel.autoArchiveEnabled.collectAsState()
    val notificationsEnabled by viewModel.notificationsEnabled.collectAsState()
    val shutdownTime by viewModel.shutdownTime.collectAsState()

    // Command palette items
    val commands = remember(viewModel) {
        listOf(
            CommandItem("Go to Flow", "1") { viewModel.navigateTo("flow") },
            CommandItem("Go to Projects (Constellations)", "2") { viewModel.navigateTo("constellations") },
            CommandItem("Go to Grove", "3") { viewModel.navigateTo("grove") },
            CommandItem("Go to Journal", "4") { viewModel.navigateTo("journal") },
            CommandItem("Go to Review", "5") { viewModel.navigateTo("review") },
            CommandItem("Search Tasks", "/") { viewModel.setSearchOpen(true) },
            CommandItem("Mindful Minute", "M") { viewModel.setMindfulOpen(true) },
            CommandItem("Open Settings", "S") { viewModel.setSettingsOpen(true) },
            CommandItem("Archived Tasks", "A") { viewModel.setArchiveOpen(true) },
            CommandItem("Share Daily Summary", "") { viewModel.setShareSummaryOpen(true) }
        )
    }

    // Predictive BackHandler hierarchy
    val isAnyModalOpen = isSettingsOpen || isMindfulOpen || isSearchOpen ||
            isCommandPaletteOpen || isThemeCreatorOpen || isArchiveOpen ||
            isShareSummaryOpen || isFocusOpen || winModalTask != null ||
            detailTask != null || suggestedTemplate != null

    BackHandler(enabled = isAnyModalOpen || currentView != "flow") {
        when {
            detailTask != null -> viewModel.closeTaskDetail()
            isThemeCreatorOpen -> viewModel.setThemeCreatorOpen(false)
            isArchiveOpen -> viewModel.setArchiveOpen(false)
            isSettingsOpen -> viewModel.setSettingsOpen(false)
            isMindfulOpen -> viewModel.setMindfulOpen(false)
            isSearchOpen -> viewModel.setSearchOpen(false)
            isCommandPaletteOpen -> viewModel.setCommandPaletteOpen(false)
            isShareSummaryOpen -> viewModel.setShareSummaryOpen(false)
            isFocusOpen -> viewModel.closeFocusModal()
            winModalTask != null -> viewModel.dismissWinModal()
            suggestedTemplate != null -> viewModel.dismissTemplateSuggestion()
            currentView != "flow" -> viewModel.navigateTo("flow")
        }
    }

    // Root Container
    Box(modifier = Modifier.fillMaxSize()) {
        // 1. Dynamic Animated Theme Background (Deep Black + Custom Glow Canvas)
        ThemeBackground(
            theme = activeTheme,
            modifier = Modifier.fillMaxSize()
        )

        // 2. Main Content Column
        Column(
            modifier = Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.statusBars)
        ) {
            // Mindful Header (Momentum bar, Quote, Action icons)
            AuraHeader(
                momentumProgress = viewModel.getMomentumProgress(),
                dailyQuote = viewModel.dailyQuote,
                theme = activeTheme,
                onMindfulClick = { viewModel.setMindfulOpen(true) },
                onShareClick = { viewModel.setShareSummaryOpen(true) },
                onSearchClick = { viewModel.setSearchOpen(true) },
                onSettingsClick = { viewModel.setSettingsOpen(true) }
            )

            // Content Area with Smooth Crossfade Transition across the 5 Primary Views
            // Reserving 148.dp bottomPadding guarantees task cards and inputs NEVER collide or get obscured by the dock!
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                Crossfade(
                    targetState = currentView,
                    animationSpec = tween(280),
                    label = "view_transition"
                ) { targetView ->
                    when (targetView) {
                        "flow" -> FlowView(
                            tasks = tasks,
                            allCategories = customCategories,
                            theme = activeTheme,
                            activeFilter = activeFilter,
                            bottomPadding = 148.dp,
                            onFilterChange = { viewModel.setFilter(it) },
                            onToggle = { viewModel.toggleTask(it) },
                            onDelete = { viewModel.deleteTask(it) },
                            onFocus = { taskId ->
                                tasks.find { it.id == taskId }?.let { viewModel.startFocus(it) }
                            },
                            onTogglePin = { viewModel.togglePin(it) },
                            onArchive = { viewModel.archiveTask(it) },
                            onReorder = { id, dir -> viewModel.reorderTask(id, dir) },
                            onOpenDetail = { viewModel.openTaskDetail(it) }
                        )

                        "constellations" -> ConstellationsView(
                            tasks = tasks,
                            templates = templates,
                            allCategories = customCategories,
                            theme = activeTheme,
                            bottomPadding = 148.dp,
                            onToggleTask = { viewModel.toggleTask(it) },
                            onSaveTemplate = { name, catTasks ->
                                viewModel.saveTemplateFromTasks(name, catTasks)
                            }
                        )

                        "grove" -> GroveView(
                            tasks = tasks,
                            grove = trees,
                            goldenSeeds = userStats.goldenSeeds,
                            allCategories = customCategories,
                            theme = activeTheme,
                            bottomPadding = 148.dp,
                            onPlantSeed = {
                                viewModel.plantSeed("oak")
                            }
                        )

                        "journal" -> JournalView(
                            journalEntries = journalEntries,
                            completedTasks = tasks.filter { it.completed },
                            theme = activeTheme,
                            bottomPadding = 148.dp,
                            onSaveEntry = { viewModel.saveJournalEntry(it) }
                        )

                        "review" -> ReviewView(
                            tasks = tasks,
                            userStats = userStats,
                            unlockedAchievements = unlockedAchievements,
                            allCategories = customCategories,
                            theme = activeTheme,
                            bottomPadding = 148.dp,
                            onDeleteStaleTask = { viewModel.deleteTask(it) }
                        )
                    }
                }
            }
        }

        // 3. Floating Bottom Dock (Equal-width 5-item pill + Capture Thought Input with IME handling)
        AuraBottomDock(
            currentView = currentView,
            theme = activeTheme,
            onNavigate = { viewModel.navigateTo(it) },
            onAddTask = { viewModel.addTask(it) },
            modifier = Modifier.align(Alignment.BottomCenter)
        )

        // 4. Overlays & Modals

        // Settings Modal
        SettingsModal(
            isOpen = isSettingsOpen,
            currentThemeId = activeTheme.id,
            allThemes = builtInThemes + customThemes,
            customCategories = customCategories,
            soundEffectsEnabled = soundEffectsEnabled,
            autoArchiveEnabled = autoArchiveEnabled,
            notificationsEnabled = notificationsEnabled,
            shutdownTime = shutdownTime,
            theme = activeTheme,
            onClose = { viewModel.setSettingsOpen(false) },
            onSelectTheme = { viewModel.selectTheme(it) },
            onToggleSoundEffects = { viewModel.toggleSoundEffects(it) },
            onToggleAutoArchive = { viewModel.toggleAutoArchive(it) },
            onToggleNotifications = { viewModel.toggleNotifications(it) },
            onUpdateShutdownTime = { viewModel.updateShutdownTime(it) },
            onAddCategory = { viewModel.addCategory(it) },
            onRemoveCategory = { viewModel.removeCategory(it) },
            onOpenThemeCreator = {
                viewModel.setSettingsOpen(false)
                viewModel.setThemeCreatorOpen(true)
            },
            onOpenArchive = {
                viewModel.setSettingsOpen(false)
                viewModel.setArchiveOpen(true)
            },
            onExportData = onExportBackup,
            onImportData = onImportBackup
        )

        // Focus Timer Modal
        FocusModal(
            task = focusTask,
            theme = activeTheme,
            onClose = { viewModel.closeFocusModal() },
            onComplete = { viewModel.finishFocusSession(it) }
        )

        // Win Modal
        WinModal(
            task = winModalTask,
            theme = activeTheme,
            onSave = { taskId, text -> viewModel.recordTaskWin(taskId, text) },
            onSkip = { viewModel.dismissWinModal() }
        )

        // Mindful Minute Modal
        MindfulMinuteModal(
            isOpen = isMindfulOpen,
            theme = activeTheme,
            onClose = { viewModel.setMindfulOpen(false) }
        )

        // Theme Creator Modal
        ThemeCreatorModal(
            isOpen = isThemeCreatorOpen,
            theme = activeTheme,
            onSave = { viewModel.addCustomTheme(it) },
            onClose = { viewModel.setThemeCreatorOpen(false) }
        )

        // Archive Modal
        ArchiveModal(
            isOpen = isArchiveOpen,
            archivedTasks = tasks.filter { it.isArchived },
            theme = activeTheme,
            onRestore = { viewModel.restoreArchivedTask(it) },
            onDelete = { viewModel.deleteTask(it) },
            onClose = { viewModel.setArchiveOpen(false) }
        )

        // Share Summary Modal
        ShareSummaryModal(
            isOpen = isShareSummaryOpen,
            dailyStats = viewModel.getDailyStats(),
            theme = activeTheme,
            onClose = { viewModel.setShareSummaryOpen(false) }
        )

        // Command Palette Modal
        CommandPaletteModal(
            isOpen = isCommandPaletteOpen,
            commands = commands,
            theme = activeTheme,
            onClose = { viewModel.setCommandPaletteOpen(false) }
        )

        // Search Modal
        SearchModal(
            isOpen = isSearchOpen,
            tasks = tasks,
            theme = activeTheme,
            onTaskClick = { taskId ->
                viewModel.setSearchOpen(false)
                viewModel.openTaskDetail(taskId)
            },
            onClose = { viewModel.setSearchOpen(false) }
        )

        // Template Suggestion Modal
        TemplateSuggestionModal(
            templateName = suggestedTemplate?.name,
            taskText = suggestedTemplate?.name,
            theme = activeTheme,
            onApply = {
                suggestedTemplate?.let { viewModel.applyTemplate(it) }
            },
            onContinueAsWritten = { viewModel.dismissTemplateSuggestion() },
            onClose = { viewModel.dismissTemplateSuggestion() }
        )

        // Planting Animation Modal
        PlantingAnimationModal(
            isOpen = isPlantingAnimationOpen,
            onComplete = { viewModel.dismissPlantingAnimation() }
        )

        // Task Detail Modal
        TaskDetailModal(
            isOpen = detailTask != null,
            task = detailTask,
            allTasks = tasks,
            theme = activeTheme,
            onClose = { viewModel.closeTaskDetail() },
            onSave = { id, text, notes, tags ->
                viewModel.updateTaskDetails(id, text, notes, tags)
            },
            onSetDependency = { id, depId ->
                viewModel.setTaskDependency(id, depId)
            },
            onAddAttachment = { taskId ->
                onPickAttachment(taskId)
            },
            onDeleteAttachment = { id, att ->
                viewModel.deleteAttachment(id, att)
            },
            onOpenAttachment = { att ->
                viewModel.openAttachment(att)
            }
        )

        // 5. Floating Toasts
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .windowInsetsPadding(WindowInsets.statusBars)
                .align(Alignment.TopCenter)
        ) {
            AchievementToast(
                achievement = activeAchievement,
                onClose = { viewModel.dismissAchievementToast() }
            )

            GenericToast(
                message = activeToast,
                onClose = { viewModel.dismissToast() }
            )
        }
    }
}
