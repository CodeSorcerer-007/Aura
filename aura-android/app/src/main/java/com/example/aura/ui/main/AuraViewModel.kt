package com.example.aura.ui.main

import android.app.Application
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import androidx.core.content.FileProvider
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.aura.audio.SoundPlayer
import com.example.aura.data.local.AuraDbHelper
import com.example.aura.data.local.PreferencesRepository
import com.example.aura.data.model.Achievement
import com.example.aura.data.model.AttachmentMeta
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.DailyStats
import com.example.aura.data.model.GroveTree
import com.example.aura.data.model.JournalEntry
import com.example.aura.data.model.Quote
import com.example.aura.data.model.RecurringConfig
import com.example.aura.data.model.Task
import com.example.aura.data.model.Template
import com.example.aura.data.model.TemplateTask
import com.example.aura.data.model.UserStats
import com.example.aura.data.model.achievementsList
import com.example.aura.data.model.builtInThemes
import com.example.aura.data.model.defaultCategoriesMap
import com.example.aura.data.model.demoTasks
import com.example.aura.data.model.getTodayDateString
import com.example.aura.data.model.motivationalQuotes
import com.example.aura.data.parser.TaskParser
import com.example.aura.notifications.AuraNotificationManager
import com.example.aura.ui.components.FilterState
import com.example.aura.ui.components.ToastMessage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

class AuraViewModel(application: Application) : AndroidViewModel(application) {

    private val dbHelper = AuraDbHelper(application)
    private val prefsRepo = PreferencesRepository(application)
    private val notificationManager = AuraNotificationManager(application)

    // --- Core State ---
    private val _tasks = MutableStateFlow<List<Task>>(emptyList())
    val tasks: StateFlow<List<Task>> = _tasks.asStateFlow()

    private val _currentView = MutableStateFlow("flow")
    val currentView: StateFlow<String> = _currentView.asStateFlow()

    private val _activeTheme = MutableStateFlow(builtInThemes.first { it.id == "dark" })
    val activeTheme: StateFlow<AuraThemeModel> = _activeTheme.asStateFlow()

    private val _customThemes = MutableStateFlow<List<AuraThemeModel>>(emptyList())
    val customThemes: StateFlow<List<AuraThemeModel>> = _customThemes.asStateFlow()

    private val _customCategories = MutableStateFlow<Map<String, CategoryStyle>>(defaultCategoriesMap)
    val customCategories: StateFlow<Map<String, CategoryStyle>> = _customCategories.asStateFlow()

    private val _userStats = MutableStateFlow(UserStats())
    val userStats: StateFlow<UserStats> = _userStats.asStateFlow()

    private val _unlockedAchievements = MutableStateFlow<Set<String>>(emptySet())
    val unlockedAchievements: StateFlow<Set<String>> = _unlockedAchievements.asStateFlow()

    private val _trees = MutableStateFlow<List<GroveTree>>(emptyList())
    val trees: StateFlow<List<GroveTree>> = _trees.asStateFlow()

    private val _templates = MutableStateFlow<List<Template>>(emptyList())
    val templates: StateFlow<List<Template>> = _templates.asStateFlow()

    private val _journalEntries = MutableStateFlow<List<JournalEntry>>(emptyList())
    val journalEntries: StateFlow<List<JournalEntry>> = _journalEntries.asStateFlow()

    private val _activeFilter = MutableStateFlow(FilterState("all", null))
    val activeFilter: StateFlow<FilterState> = _activeFilter.asStateFlow()

    // --- Daily Quote ---
    val dailyQuote: Quote = run {
        val dayOfYear = LocalDate.now().dayOfYear
        motivationalQuotes[dayOfYear % motivationalQuotes.size]
    }

    // --- Modals and Overlays State ---
    private val _activeAchievement = MutableStateFlow<Achievement?>(null)
    val activeAchievement: StateFlow<Achievement?> = _activeAchievement.asStateFlow()

    private val _activeToast = MutableStateFlow<ToastMessage?>(null)
    val activeToast: StateFlow<ToastMessage?> = _activeToast.asStateFlow()

    private val _winModalTask = MutableStateFlow<Task?>(null)
    val winModalTask: StateFlow<Task?> = _winModalTask.asStateFlow()

    private val _focusTask = MutableStateFlow<Task?>(null)
    val focusTask: StateFlow<Task?> = _focusTask.asStateFlow()

    private val _detailTask = MutableStateFlow<Task?>(null)
    val detailTask: StateFlow<Task?> = _detailTask.asStateFlow()

    private val _isSettingsOpen = MutableStateFlow(false)
    val isSettingsOpen: StateFlow<Boolean> = _isSettingsOpen.asStateFlow()

    private val _isMindfulOpen = MutableStateFlow(false)
    val isMindfulOpen: StateFlow<Boolean> = _isMindfulOpen.asStateFlow()

    private val _isSearchOpen = MutableStateFlow(false)
    val isSearchOpen: StateFlow<Boolean> = _isSearchOpen.asStateFlow()

    private val _isCommandPaletteOpen = MutableStateFlow(false)
    val isCommandPaletteOpen: StateFlow<Boolean> = _isCommandPaletteOpen.asStateFlow()

    private val _isThemeCreatorOpen = MutableStateFlow(false)
    val isThemeCreatorOpen: StateFlow<Boolean> = _isThemeCreatorOpen.asStateFlow()

    private val _isArchiveOpen = MutableStateFlow(false)
    val isArchiveOpen: StateFlow<Boolean> = _isArchiveOpen.asStateFlow()

    private val _isShareSummaryOpen = MutableStateFlow(false)
    val isShareSummaryOpen: StateFlow<Boolean> = _isShareSummaryOpen.asStateFlow()

    private val _isFocusOpen = MutableStateFlow(false)
    val isFocusOpen: StateFlow<Boolean> = _isFocusOpen.asStateFlow()

    private val _isPlantingAnimationOpen = MutableStateFlow(false)
    val isPlantingAnimationOpen: StateFlow<Boolean> = _isPlantingAnimationOpen.asStateFlow()

    private val _suggestedTemplate = MutableStateFlow<Template?>(null)
    val suggestedTemplate: StateFlow<Template?> = _suggestedTemplate.asStateFlow()

    // --- Settings Preferences State ---
    private val _soundEffectsEnabled = MutableStateFlow(true)
    val soundEffectsEnabled: StateFlow<Boolean> = _soundEffectsEnabled.asStateFlow()

    private val _autoArchiveEnabled = MutableStateFlow(true)
    val autoArchiveEnabled: StateFlow<Boolean> = _autoArchiveEnabled.asStateFlow()

    private val _notificationsEnabled = MutableStateFlow(false)
    val notificationsEnabled: StateFlow<Boolean> = _notificationsEnabled.asStateFlow()

    private val _shutdownTime = MutableStateFlow("18:00")
    val shutdownTime: StateFlow<String> = _shutdownTime.asStateFlow()

    init {
        loadPreferences()
        loadInitialData()
    }

    private fun loadPreferences() {
        _soundEffectsEnabled.value = prefsRepo.soundEffectsEnabled
        _autoArchiveEnabled.value = prefsRepo.autoArchiveEnabled
        _notificationsEnabled.value = prefsRepo.notificationsEnabled
        _shutdownTime.value = prefsRepo.shutdownTime
        _unlockedAchievements.value = prefsRepo.unlockedAchievements
        _userStats.value = prefsRepo.userStats

        val savedCustomThemes = prefsRepo.customThemes
        _customThemes.value = savedCustomThemes

        val allCategories = defaultCategoriesMap.toMutableMap()
        allCategories.putAll(prefsRepo.customCategories)
        _customCategories.value = allCategories

        resolveTheme(prefsRepo.theme)
    }

    private fun resolveTheme(themeId: String) {
        val allThemes = builtInThemes + _customThemes.value
        _activeTheme.value = allThemes.find { it.id == themeId } ?: builtInThemes.first { it.id == "dark" }
    }

    private fun loadInitialData() {
        viewModelScope.launch(Dispatchers.IO) {
            var loadedTasks = dbHelper.getAllTasks()

            // Check if first launch or empty: populate demo tasks
            if (loadedTasks.isEmpty()) {
                dbHelper.insertTasks(demoTasks)
                prefsRepo.hasLaunched = true
                loadedTasks = dbHelper.getAllTasks()
            }

            // Check auto archive
            if (prefsRepo.autoArchiveEnabled) {
                val today = getTodayDateString()
                val (toKeep, toArchive) = loadedTasks.partition {
                    it.completionDate == null || it.completionDate == today || it.isArchived
                }
                if (toArchive.isNotEmpty()) {
                    toArchive.forEach {
                        dbHelper.updateTask(it.copy(isArchived = true))
                    }
                    loadedTasks = dbHelper.getAllTasks()
                }
            }

            // Check streak
            checkDailyStreak()

            _tasks.value = loadedTasks

            // Grove Trees
            var loadedTrees = dbHelper.getAllTrees()
            if (loadedTrees.isEmpty()) {
                val starterTree = GroveTree(id = System.currentTimeMillis(), growthPoints = 2, maxGrowth = 10, type = "oak")
                dbHelper.insertTree(starterTree)
                loadedTrees = listOf(starterTree)
            }
            _trees.value = loadedTrees

            // Templates
            _templates.value = dbHelper.getAllTemplates()

            // Journal
            _journalEntries.value = dbHelper.getAllJournalEntries()
        }
    }

    private fun checkDailyStreak() {
        val today = LocalDate.now()
        val stats = prefsRepo.userStats
        val lastDateStr = stats.lastActiveDate

        if (lastDateStr != null) {
            val lastDate = LocalDate.parse(lastDateStr)
            val daysDiff = ChronoUnit.DAYS.between(lastDate, today)

            if (daysDiff > 1) {
                // Streak broken
                val updatedStats = stats.copy(streak = 0)
                prefsRepo.userStats = updatedStats
                _userStats.value = updatedStats
            }
        }
    }

    // --- Computed Daily Stats ---
    fun getDailyStats(): DailyStats {
        val today = getTodayDateString()
        val completedToday = _tasks.value.count { it.completed && it.completionDate == today }
        val focusSessionsToday = _tasks.value.filter { it.completionDate == today }.sumOf { it.focusSessions }
        val achievementsCount = _unlockedAchievements.value.size
        return DailyStats(
            completed = completedToday,
            focusSessions = focusSessionsToday,
            achievements = achievementsCount
        )
    }

    fun getMomentumProgress(): Float {
        val completedToday = getDailyStats().completed
        return (completedToday / 5f).coerceIn(0f, 1f)
    }

    // --- Task Actions ---

    fun addTask(rawInput: String) {
        if (rawInput.isBlank()) return

        val parsed = TaskParser.parse(rawInput)
        val newTask = Task(
            id = System.currentTimeMillis(),
            text = parsed.title,
            completed = false,
            priority = parsed.priority,
            category = parsed.category,
            timeOfDay = parsed.timeOfDay,
            deadline = parsed.deadline,
            tags = parsed.tags,
            recurring = parsed.recurring,
            subtasks = emptyList(),
            notes = "",
            attachments = emptyList(),
            isPinned = false,
            focusSessions = 0,
            isArchived = false
        )

        viewModelScope.launch(Dispatchers.IO) {
            dbHelper.insertTask(newTask, sortOrder = 0)
            _tasks.value = listOf(newTask) + _tasks.value

            if (_soundEffectsEnabled.value) {
                SoundPlayer.playAddSound()
            }

            // Check template suggestions
            checkTemplateMatch(parsed.title)
        }
    }

    private fun checkTemplateMatch(text: String) {
        val lower = text.lowercase()
        val matchingTemplate = _templates.value.find { template ->
            lower.contains(template.name.lowercase())
        }
        if (matchingTemplate != null) {
            _suggestedTemplate.value = matchingTemplate
        }
    }

    fun dismissTemplateSuggestion() {
        _suggestedTemplate.value = null
    }

    fun applyTemplate(template: Template) {
        viewModelScope.launch(Dispatchers.IO) {
            val newTasks = template.tasks.mapIndexed { index, tTask ->
                Task(
                    id = System.currentTimeMillis() + index,
                    text = tTask.text,
                    completed = false,
                    priority = tTask.priority,
                    category = tTask.category,
                    timeOfDay = tTask.timeOfDay,
                    deadline = null,
                    tags = emptyList(),
                    recurring = null,
                    subtasks = emptyList(),
                    notes = "",
                    attachments = emptyList(),
                    isPinned = false,
                    focusSessions = 0,
                    isArchived = false
                )
            }
            dbHelper.insertTasks(newTasks)
            _tasks.value = newTasks + _tasks.value
            _suggestedTemplate.value = null
            showToast("Template '${template.name}' applied!", "success")
        }
    }

    fun toggleTask(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId } ?: return

        viewModelScope.launch(Dispatchers.IO) {
            val today = getTodayDateString()

            if (task.completed) {
                // Uncomplete
                val updated = task.copy(completed = false, completionDate = null)
                dbHelper.updateTask(updated)
                _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            } else {
                // Complete task
                val updated = task.copy(completed = true, completionDate = today)
                dbHelper.updateTask(updated)

                var currentTasks = _tasks.value.map { if (it.id == taskId) updated else it }

                // Play sound
                if (_soundEffectsEnabled.value) {
                    SoundPlayer.playCompleteSound()
                }

                // Check achievements
                unlockAchievement("first_task")
                if (task.priority == 3) {
                    unlockAchievement("high_priority")
                }

                // Update Streak & Stats
                updateStreakOnCompletion()

                // Check Grove Growth
                growActiveTree()

                // If recurring task: create next occurrence
                if (task.recurring != null) {
                    val nextDeadline = calculateNextDeadline(task.deadline, task.recurring)
                    val nextTask = task.copy(
                        id = System.currentTimeMillis(),
                        completed = false,
                        completionDate = null,
                        deadline = nextDeadline
                    )
                    dbHelper.insertTask(nextTask)
                    currentTasks = listOf(nextTask) + currentTasks
                }

                // Check Win Modal for high-priority non-recurring tasks
                if (task.priority >= 3 && task.recurring == null) {
                    _winModalTask.value = updated
                }

                _tasks.value = currentTasks

                // Check Daily Momentum (5 tasks = 1 Golden Seed)
                checkDailyMomentum()
            }
        }
    }

    private fun calculateNextDeadline(currentDeadline: String?, recurring: RecurringConfig): String {
        val baseDate = if (!currentDeadline.isNullOrEmpty()) {
            try { LocalDate.parse(currentDeadline) } catch (_: Exception) { LocalDate.now() }
        } else {
            LocalDate.now()
        }

        val nextDate = when (recurring.type.lowercase()) {
            "daily" -> baseDate.plusDays(1)
            "weekly" -> baseDate.plusWeeks(1)
            "monthly" -> baseDate.plusMonths(1)
            else -> baseDate.plusDays(1)
        }
        return nextDate.toString()
    }

    private fun updateStreakOnCompletion() {
        val today = LocalDate.now()
        val stats = prefsRepo.userStats
        val lastActive = stats.lastActiveDate

        if (lastActive == null) {
            val updated = stats.copy(streak = 1, lastActiveDate = today.toString())
            prefsRepo.userStats = updated
            _userStats.value = updated
        } else {
            val lastDate = LocalDate.parse(lastActive)
            val daysDiff = ChronoUnit.DAYS.between(lastDate, today)

            if (daysDiff == 1L) {
                val newStreak = stats.streak + 1
                val updated = stats.copy(streak = newStreak, lastActiveDate = today.toString())
                prefsRepo.userStats = updated
                _userStats.value = updated
                if (newStreak >= 3) {
                    unlockAchievement("streak_3")
                }
            } else if (daysDiff == 0L) {
                // Same day, streak intact
            } else {
                // Streak was broken, restart
                val updated = stats.copy(streak = 1, lastActiveDate = today.toString())
                prefsRepo.userStats = updated
                _userStats.value = updated
            }
        }
    }

    private fun checkDailyMomentum() {
        val today = getTodayDateString()
        val completedToday = _tasks.value.count { it.completed && it.completionDate == today }

        if (completedToday >= 5 && prefsRepo.momentumAwardedDate != today) {
            prefsRepo.momentumAwardedDate = today
            val currentStats = prefsRepo.userStats
            val updated = currentStats.copy(goldenSeeds = currentStats.goldenSeeds + 1)
            prefsRepo.userStats = updated
            _userStats.value = updated

            unlockAchievement("golden_seed")
            showToast("Daily Momentum Achieved! +1 Golden Seed ✨", "success")
        }
    }

    private fun growActiveTree() {
        val currentTrees = _trees.value
        val treeToGrow = currentTrees.find { it.growthPoints < it.maxGrowth } ?: return

        val newGrowth = treeToGrow.growthPoints + 1
        val updatedTree = treeToGrow.copy(growthPoints = newGrowth)
        dbHelper.updateTree(updatedTree)

        _trees.value = currentTrees.map { if (it.id == updatedTree.id) updatedTree else it }

        if (newGrowth >= updatedTree.maxGrowth) {
            unlockAchievement("tree_grower")
            showToast("Your tree has reached full maturity! 🌳", "success")
        }
    }

    fun recordTaskWin(taskId: Long, winReflection: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val task = _tasks.value.find { it.id == taskId } ?: return@launch
            val updated = task.copy(win = winReflection)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            unlockAchievement("first_win")
            _winModalTask.value = null
        }
    }

    fun dismissWinModal() {
        _winModalTask.value = null
    }

    fun deleteTask(taskId: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            val task = _tasks.value.find { it.id == taskId }
            task?.attachments?.forEach { att ->
                deleteAttachmentFile(att.id)
            }

            dbHelper.deleteTask(taskId)
            _tasks.value = _tasks.value.filter { it.id != taskId }
        }
    }

    fun togglePin(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updated = task.copy(isPinned = !task.isPinned)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
        }
    }

    fun archiveTask(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updated = task.copy(isArchived = true)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            showToast("Task archived", "success")
        }
    }

    fun restoreArchivedTask(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updated = task.copy(isArchived = false)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            showToast("Task restored", "success")
        }
    }

    fun reorderTask(taskId: Long, direction: String) {
        val list = _tasks.value.toMutableList()
        val index = list.indexOfFirst { it.id == taskId }
        if (index == -1) return

        val targetIndex = if (direction == "up") index - 1 else index + 1
        if (targetIndex in list.indices) {
            val temp = list[index]
            list[index] = list[targetIndex]
            list[targetIndex] = temp

            _tasks.value = list
            viewModelScope.launch(Dispatchers.IO) {
                dbHelper.saveTasksOrder(list)
            }
        }
    }

    fun updateTaskDetails(taskId: Long, text: String, notes: String, tags: List<String>) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updated = task.copy(text = text, notes = notes, tags = tags)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            _detailTask.value = updated
        }
    }

    fun setTaskDependency(taskId: Long, dependencyId: Long?) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updated = task.copy(dependsOn = dependencyId)
            dbHelper.updateTask(updated)
            _tasks.value = _tasks.value.map { if (it.id == taskId) updated else it }
            _detailTask.value = updated
        }
    }

    // --- Attachment Handling ---

    fun addAttachmentFromUri(taskId: Long, uri: Uri) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        val context = getApplication<Application>()

        viewModelScope.launch(Dispatchers.IO) {
            try {
                var fileName = "attachment"
                var mimeType = "application/octet-stream"

                context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                    val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                    if (cursor.moveToFirst() && nameIndex != -1) {
                        fileName = cursor.getString(nameIndex)
                    }
                }
                context.contentResolver.getType(uri)?.let { mimeType = it }

                val attId = UUID.randomUUID().toString()
                val attachmentsDir = File(context.filesDir, "attachments").apply { mkdirs() }
                val targetFile = File(attachmentsDir, attId)

                context.contentResolver.openInputStream(uri)?.use { input ->
                    FileOutputStream(targetFile).use { output ->
                        input.copyTo(output)
                    }
                }

                val newMeta = AttachmentMeta(
                    id = attId,
                    name = fileName,
                    type = mimeType
                )

                val updatedTask = task.copy(attachments = task.attachments + newMeta)
                dbHelper.updateTask(updatedTask)

                withContext(Dispatchers.Main) {
                    _tasks.value = _tasks.value.map { if (it.id == taskId) updatedTask else it }
                    if (_detailTask.value?.id == taskId) {
                        _detailTask.value = updatedTask
                    }
                    showToast("Attached: $fileName", "success")
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showToast("Failed to attach file", "error")
                }
            }
        }
    }

    fun deleteAttachment(taskId: Long, attachment: AttachmentMeta) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            deleteAttachmentFile(attachment.id)

            val updatedTask = task.copy(attachments = task.attachments.filter { it.id != attachment.id })
            dbHelper.updateTask(updatedTask)

            withContext(Dispatchers.Main) {
                _tasks.value = _tasks.value.map { if (it.id == taskId) updatedTask else it }
                if (_detailTask.value?.id == taskId) {
                    _detailTask.value = updatedTask
                }
            }
        }
    }

    private fun deleteAttachmentFile(attachmentId: String) {
        val context = getApplication<Application>()
        val file = File(File(context.filesDir, "attachments"), attachmentId)
        if (file.exists()) file.delete()
    }

    fun openAttachment(attachment: AttachmentMeta) {
        val context = getApplication<Application>()
        val file = File(File(context.filesDir, "attachments"), attachment.id)
        if (!file.exists()) {
            showToast("Attachment file not found", "error")
            return
        }

        try {
            val contentUri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                file
            )
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, attachment.type)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            showToast("No application available to open this file", "error")
        }
    }

    // --- Focus Timer ---

    fun startFocus(task: Task) {
        _focusTask.value = task
        _isFocusOpen.value = true
    }

    fun closeFocusModal() {
        _isFocusOpen.value = false
        _focusTask.value = null
    }

    fun finishFocusSession(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId } ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val updatedTask = task.copy(
                focusSessions = task.focusSessions + 1,
                completed = true,
                completionDate = getTodayDateString()
            )
            dbHelper.updateTask(updatedTask)

            val stats = prefsRepo.userStats
            val updatedStats = stats.copy(focusedTasksCompleted = stats.focusedTasksCompleted + 1)
            prefsRepo.userStats = updatedStats
            _userStats.value = updatedStats

            unlockAchievement("focused_finish")

            if (_notificationsEnabled.value) {
                notificationManager.showNotification(
                    "Focus Session Complete",
                    "Great work on finishing '${task.text}'!"
                )
            }

            withContext(Dispatchers.Main) {
                _tasks.value = _tasks.value.map { if (it.id == taskId) updatedTask else it }
                _isFocusOpen.value = false
                _focusTask.value = null
                showToast("Deep focus session completed!", "success")
            }
        }
    }

    // --- Grove Planting ---

    fun plantSeed(treeType: String) {
        val stats = prefsRepo.userStats
        if (stats.goldenSeeds < 1) {
            showToast("Not enough Golden Seeds! Complete 5 daily tasks to earn one.", "error")
            return
        }

        viewModelScope.launch(Dispatchers.IO) {
            val updatedStats = stats.copy(goldenSeeds = stats.goldenSeeds - 1)
            prefsRepo.userStats = updatedStats
            _userStats.value = updatedStats

            val newTree = GroveTree(
                id = System.currentTimeMillis(),
                growthPoints = 0,
                maxGrowth = 10,
                type = treeType
            )
            dbHelper.insertTree(newTree)
            _trees.value = _trees.value + newTree

            withContext(Dispatchers.Main) {
                _isPlantingAnimationOpen.value = true
            }
        }
    }

    fun dismissPlantingAnimation() {
        _isPlantingAnimationOpen.value = false
    }

    // --- Journal ---

    fun saveJournalEntry(entry: JournalEntry) {
        viewModelScope.launch(Dispatchers.IO) {
            dbHelper.saveJournalEntry(entry)
            _journalEntries.value = listOf(entry) + _journalEntries.value.filter { it.date != entry.date }
            showToast("Journal entry saved", "success")
        }
    }

    // --- Templates ---

    fun saveTemplateFromTasks(name: String, tasks: List<Task>) {
        if (name.isBlank() || tasks.isEmpty()) return

        val templateTasks = tasks.map {
            TemplateTask(
                text = it.text,
                category = it.category,
                priority = it.priority,
                timeOfDay = it.timeOfDay
            )
        }
        val template = Template(
            id = System.currentTimeMillis(),
            name = name,
            tasks = templateTasks
        )

        viewModelScope.launch(Dispatchers.IO) {
            dbHelper.insertTemplate(template)
            _templates.value = _templates.value + template
            showToast("Template '$name' saved!", "success")
        }
    }

    // --- Themes & Custom Themes ---

    fun selectTheme(themeId: String) {
        prefsRepo.theme = themeId
        resolveTheme(themeId)
    }

    fun addCustomTheme(theme: AuraThemeModel) {
        val current = _customThemes.value
        val updated = current + theme
        _customThemes.value = updated
        prefsRepo.customThemes = updated
        selectTheme(theme.id)
        showToast("Theme '${theme.name}' created!", "success")
    }

    // --- Categories ---

    fun addCategory(categoryName: String) {
        if (categoryName.isBlank()) return
        val current = _customCategories.value.toMutableMap()
        if (current.containsKey(categoryName)) return

        val newCat = CategoryStyle(
            name = categoryName,
            bgHex = 0x4D64748B,
            borderHex = 0x8094A3B8,
            textHex = 0xFFE2E8F0,
            solidHex = 0xFF475569,
            glowHex = 0xFF94A3B8
        )
        current[categoryName] = newCat
        _customCategories.value = current
        prefsRepo.customCategories = current.filterKeys { !defaultCategoriesMap.containsKey(it) }
        showToast("Category '$categoryName' added", "success")
    }

    fun removeCategory(categoryName: String) {
        val current = _customCategories.value.toMutableMap()
        current.remove(categoryName)
        _customCategories.value = current
        prefsRepo.customCategories = current.filterKeys { !defaultCategoriesMap.containsKey(it) }
    }

    // --- Settings Toggles ---

    fun toggleSoundEffects(enabled: Boolean) {
        _soundEffectsEnabled.value = enabled
        prefsRepo.soundEffectsEnabled = enabled
    }

    fun toggleAutoArchive(enabled: Boolean) {
        _autoArchiveEnabled.value = enabled
        prefsRepo.autoArchiveEnabled = enabled
    }

    fun toggleNotifications(enabled: Boolean) {
        _notificationsEnabled.value = enabled
        prefsRepo.notificationsEnabled = enabled
    }

    fun updateShutdownTime(time: String) {
        _shutdownTime.value = time
        prefsRepo.shutdownTime = time
    }

    // --- Achievements ---

    private fun unlockAchievement(id: String) {
        if (_unlockedAchievements.value.contains(id)) return

        val achievement = achievementsList.find { it.id == id } ?: return
        val updated = _unlockedAchievements.value + id
        _unlockedAchievements.value = updated
        prefsRepo.unlockedAchievements = updated

        if (_soundEffectsEnabled.value) {
            SoundPlayer.playAchievementSound()
        }

        _activeAchievement.value = achievement
    }

    fun dismissAchievementToast() {
        _activeAchievement.value = null
    }

    // --- Toasts & Navigation ---

    fun showToast(text: String, type: String = "success") {
        _activeToast.value = ToastMessage(type, text)
    }

    fun dismissToast() {
        _activeToast.value = null
    }

    fun navigateTo(viewId: String) {
        _currentView.value = viewId
    }

    fun setFilter(filter: FilterState) {
        _activeFilter.value = filter
    }

    // --- Modal Openers / Closers ---

    fun openTaskDetail(taskId: Long) {
        val task = _tasks.value.find { it.id == taskId }
        _detailTask.value = task
    }

    fun closeTaskDetail() {
        _detailTask.value = null
    }

    fun setSettingsOpen(open: Boolean) { _isSettingsOpen.value = open }
    fun setMindfulOpen(open: Boolean) { _isMindfulOpen.value = open }
    fun setSearchOpen(open: Boolean) { _isSearchOpen.value = open }
    fun setCommandPaletteOpen(open: Boolean) { _isCommandPaletteOpen.value = open }
    fun setThemeCreatorOpen(open: Boolean) { _isThemeCreatorOpen.value = open }
    fun setArchiveOpen(open: Boolean) { _isArchiveOpen.value = open }
    fun setShareSummaryOpen(open: Boolean) { _isShareSummaryOpen.value = open }

    // --- Backup Import / Export ---

    fun exportBackupJson(): String {
        val root = JSONObject()
        val tasksArr = JSONArray()
        _tasks.value.forEach { tasksArr.put(it.toJson()) }
        root.put("tasks", tasksArr)

        val treesArr = JSONArray()
        _trees.value.forEach { treesArr.put(it.toJson()) }
        root.put("grove", treesArr)

        val journalArr = JSONArray()
        _journalEntries.value.forEach { journalArr.put(it.toJson()) }
        root.put("journal", journalArr)

        val templatesArr = JSONArray()
        _templates.value.forEach { templatesArr.put(it.toJson()) }
        root.put("templates", templatesArr)

        val statsObj = JSONObject().apply {
            put("goldenSeeds", _userStats.value.goldenSeeds)
            put("streak", _userStats.value.streak)
            put("lastActiveDate", _userStats.value.lastActiveDate)
            put("focusedTasksCompleted", _userStats.value.focusedTasksCompleted)
        }
        root.put("userStats", statsObj)
        root.put("unlockedAchievements", JSONArray(_unlockedAchievements.value))

        return root.toString(2)
    }

    fun importBackupJson(jsonString: String): Boolean {
        return try {
            val root = JSONObject(jsonString)

            viewModelScope.launch(Dispatchers.IO) {
                // Tasks
                root.optJSONArray("tasks")?.let { arr ->
                    val taskList = mutableListOf<Task>()
                    for (i in 0 until arr.length()) {
                        arr.optJSONObject(i)?.let { taskList.add(Task.fromJson(it)) }
                    }
                    dbHelper.replaceAllTasks(taskList)
                    _tasks.value = taskList
                }

                // Trees
                root.optJSONArray("grove")?.let { arr ->
                    val treeList = mutableListOf<GroveTree>()
                    for (i in 0 until arr.length()) {
                        arr.optJSONObject(i)?.let { treeList.add(GroveTree.fromJson(it)) }
                    }
                    dbHelper.replaceAllTrees(treeList)
                    _trees.value = treeList
                }

                // Journal
                root.optJSONArray("journal")?.let { arr ->
                    val journalList = mutableListOf<JournalEntry>()
                    for (i in 0 until arr.length()) {
                        arr.optJSONObject(i)?.let { journalList.add(JournalEntry.fromJson(it)) }
                    }
                    dbHelper.replaceAllJournalEntries(journalList)
                    _journalEntries.value = journalList
                }

                // Templates
                root.optJSONArray("templates")?.let { arr ->
                    val templateList = mutableListOf<Template>()
                    for (i in 0 until arr.length()) {
                        arr.optJSONObject(i)?.let { templateList.add(Template.fromJson(it)) }
                    }
                    dbHelper.replaceAllTemplates(templateList)
                    _templates.value = templateList
                }

                // Stats
                root.optJSONObject("userStats")?.let { statsObj ->
                    val importedStats = UserStats(
                        goldenSeeds = statsObj.optInt("goldenSeeds", 0),
                        streak = statsObj.optInt("streak", 0),
                        lastActiveDate = if (statsObj.has("lastActiveDate")) statsObj.optString("lastActiveDate") else null,
                        focusedTasksCompleted = statsObj.optInt("focusedTasksCompleted", 0)
                    )
                    prefsRepo.userStats = importedStats
                    _userStats.value = importedStats
                }

                // Achievements
                root.optJSONArray("unlockedAchievements")?.let { achArr ->
                    val achSet = mutableSetOf<String>()
                    for (i in 0 until achArr.length()) {
                        achArr.optString(i)?.let { achSet.add(it) }
                    }
                    prefsRepo.unlockedAchievements = achSet
                    _unlockedAchievements.value = achSet
                }

                withContext(Dispatchers.Main) {
                    showToast("Backup restored successfully!", "success")
                }
            }
            true
        } catch (e: Exception) {
            showToast("Failed to parse backup JSON", "error")
            false
        }
    }
}
