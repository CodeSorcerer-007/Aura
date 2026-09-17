package com.example.aura.ui.views

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.Task
import com.example.aura.ui.components.CheckIcon
import com.example.aura.ui.components.DayDatePanel
import com.example.aura.ui.components.FilterBar
import com.example.aura.ui.components.FilterState
import com.example.aura.ui.components.MoonIcon
import com.example.aura.ui.components.PinIcon
import com.example.aura.ui.components.SunIcon
import com.example.aura.ui.components.SunsetIcon
import com.example.aura.ui.components.TaskBubble
import java.time.LocalDate

@Composable
fun FlowView(
    tasks: List<Task>,
    allCategories: Map<String, CategoryStyle>,
    theme: AuraThemeModel,
    activeFilter: FilterState,
    bottomPadding: Dp,
    onFilterChange: (FilterState) -> Unit,
    onToggle: (Long) -> Unit,
    onDelete: (Long) -> Unit,
    onFocus: (Long) -> Unit,
    onTogglePin: (Long) -> Unit,
    onArchive: (Long) -> Unit,
    onReorder: (Long, String) -> Unit,
    onOpenDetail: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val categoriesList = remember(allCategories) { allCategories.keys.toList() }
    val allTags = remember(tasks) { tasks.flatMap { it.tags }.distinct() }

    // Filter tasks
    val nonArchived = tasks.filter { !it.isArchived }
    val filteredTasks = remember(nonArchived, activeFilter) {
        when (activeFilter.type) {
            "priority" -> nonArchived.filter { it.priority == 3 }
            "category" -> nonArchived.filter { it.category == activeFilter.value }
            "tag" -> nonArchived.filter { it.tags.contains(activeFilter.value) }
            "due_this_week" -> {
                val today = LocalDate.now()
                val endOfWeek = today.plusDays((7 - today.dayOfWeek.value).toLong())
                nonArchived.filter {
                    if (it.completed || it.deadline == null) false
                    else {
                        try {
                            val dl = LocalDate.parse(it.deadline)
                            !dl.isBefore(today) && !dl.isAfter(endOfWeek)
                        } catch (_: Exception) {
                            false
                        }
                    }
                }
            }
            else -> nonArchived
        }
    }

    val pinnedTasks = filteredTasks.filter { it.isPinned && !it.completed }
    val uncompletedTasks = filteredTasks.filter { !it.isPinned && !it.completed }
    val morningTasks = uncompletedTasks.filter { it.timeOfDay == "morning" }
    val afternoonTasks = uncompletedTasks.filter { it.timeOfDay == "afternoon" }
    val eveningTasks = uncompletedTasks.filter { it.timeOfDay == "evening" }
    val completedTasks = filteredTasks.filter { it.completed }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 4.dp, bottom = bottomPadding + 24.dp)
    ) {
        // Date & Filter controls
        item {
            DayDatePanel(theme = theme)
            FilterBar(
                activeFilter = activeFilter,
                categories = categoriesList,
                allTags = allTags,
                theme = theme,
                onFilterChange = onFilterChange
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Pinned Section
        if (pinnedTasks.isNotEmpty()) {
            item {
                SectionHeader(title = "Pinned", icon = { PinIcon(modifier = Modifier.size(24.dp), tint = theme.textPrimaryColor) }, theme = theme)
            }
            items(pinnedTasks, key = { it.id }) { task ->
                val dependency = task.dependsOn?.let { depId -> tasks.find { it.id == depId } }
                val isMet = dependency == null || dependency.completed
                TaskBubble(
                    task = task,
                    theme = theme,
                    allCategories = allCategories,
                    isDependencyMet = isMet,
                    onToggle = onToggle,
                    onDelete = onDelete,
                    onFocus = onFocus,
                    onTogglePin = onTogglePin,
                    onArchive = onArchive,
                    onReorder = onReorder,
                    onOpenDetail = onOpenDetail
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }

        // Morning Section
        if (morningTasks.isNotEmpty()) {
            item {
                SectionHeader(title = "Morning", icon = { SunIcon(modifier = Modifier.size(24.dp), tint = theme.textPrimaryColor) }, theme = theme)
            }
            items(morningTasks, key = { it.id }) { task ->
                val dependency = task.dependsOn?.let { depId -> tasks.find { it.id == depId } }
                val isMet = dependency == null || dependency.completed
                TaskBubble(
                    task = task,
                    theme = theme,
                    allCategories = allCategories,
                    isDependencyMet = isMet,
                    onToggle = onToggle,
                    onDelete = onDelete,
                    onFocus = onFocus,
                    onTogglePin = onTogglePin,
                    onArchive = onArchive,
                    onReorder = onReorder,
                    onOpenDetail = onOpenDetail
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }

        // Afternoon Section
        if (afternoonTasks.isNotEmpty()) {
            item {
                SectionHeader(title = "Afternoon", icon = { SunsetIcon(modifier = Modifier.size(24.dp), tint = theme.textPrimaryColor) }, theme = theme)
            }
            items(afternoonTasks, key = { it.id }) { task ->
                val dependency = task.dependsOn?.let { depId -> tasks.find { it.id == depId } }
                val isMet = dependency == null || dependency.completed
                TaskBubble(
                    task = task,
                    theme = theme,
                    allCategories = allCategories,
                    isDependencyMet = isMet,
                    onToggle = onToggle,
                    onDelete = onDelete,
                    onFocus = onFocus,
                    onTogglePin = onTogglePin,
                    onArchive = onArchive,
                    onReorder = onReorder,
                    onOpenDetail = onOpenDetail
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }

        // Evening Section
        if (eveningTasks.isNotEmpty()) {
            item {
                SectionHeader(title = "Evening", icon = { MoonIcon(modifier = Modifier.size(24.dp), tint = theme.textPrimaryColor) }, theme = theme)
            }
            items(eveningTasks, key = { it.id }) { task ->
                val dependency = task.dependsOn?.let { depId -> tasks.find { it.id == depId } }
                val isMet = dependency == null || dependency.completed
                TaskBubble(
                    task = task,
                    theme = theme,
                    allCategories = allCategories,
                    isDependencyMet = isMet,
                    onToggle = onToggle,
                    onDelete = onDelete,
                    onFocus = onFocus,
                    onTogglePin = onTogglePin,
                    onArchive = onArchive,
                    onReorder = onReorder,
                    onOpenDetail = onOpenDetail
                )
            }
            item { Spacer(modifier = Modifier.height(16.dp)) }
        }

        // Completed Section
        if (completedTasks.isNotEmpty()) {
            item {
                SectionHeader(title = "Completed", icon = { CheckIcon(modifier = Modifier.size(24.dp), tint = theme.textPrimaryColor) }, theme = theme)
            }
            items(completedTasks, key = { it.id }) { task ->
                TaskBubble(
                    task = task,
                    theme = theme,
                    allCategories = allCategories,
                    isDependencyMet = true,
                    onToggle = onToggle,
                    onDelete = onDelete,
                    onFocus = onFocus,
                    onTogglePin = onTogglePin,
                    onArchive = onArchive,
                    onReorder = onReorder,
                    onOpenDetail = onOpenDetail
                )
            }
        }
    }
}

@Composable
private fun SectionHeader(
    title: String,
    icon: @Composable () -> Unit,
    theme: AuraThemeModel
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        icon()
        Spacer(modifier = Modifier.width(10.dp))
        Text(
            text = title,
            color = theme.textPrimaryColor.copy(alpha = 0.9f),
            fontSize = 22.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
