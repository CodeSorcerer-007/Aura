package com.example.aura.ui.modals

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.AttachmentMeta
import com.example.aura.data.model.Task
import com.example.aura.ui.components.AuraIcons
import com.example.aura.ui.components.CheckIcon
import com.example.aura.ui.components.XIcon

@Composable
fun TaskDetailModal(
    isOpen: Boolean,
    task: Task?,
    allTasks: List<Task>,
    theme: AuraThemeModel,
    onClose: () -> Unit,
    onSave: (taskId: Long, text: String, notes: String, tags: List<String>) -> Unit,
    onSetDependency: (taskId: Long, dependencyId: Long?) -> Unit,
    onAddAttachment: (taskId: Long) -> Unit,
    onDeleteAttachment: (taskId: Long, attachment: AttachmentMeta) -> Unit,
    onOpenAttachment: (attachment: AttachmentMeta) -> Unit,
    onToggleSubtask: (taskId: Long, index: Int) -> Unit = { _, _ -> },
    onAddSubtask: (taskId: Long, text: String) -> Unit = { _, _ -> },
    onDeleteSubtask: (taskId: Long, index: Int) -> Unit = { _, _ -> }
) {
    var text by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var tags by remember { mutableStateOf("") }
    var newSubtaskText by remember { mutableStateOf("") }
    var showDependencySelector by remember { mutableStateOf(false) }

    LaunchedEffect(task) {
        if (task != null) {
            text = task.text
            notes = task.notes
            tags = task.tags.joinToString(", ")
        }
    }

    AnimatedVisibility(
        visible = isOpen && task != null,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        if (task == null) return@AnimatedVisibility

        val dependencyTask = remember(task.dependsOn, allTasks) {
            task.dependsOn?.let { depId -> allTasks.find { it.id == depId } }
        }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.85f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { onClose() }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.96f)
                    .fillMaxHeight(0.92f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* prevent close */ }
                    .padding(20.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                ) {
                    // Title & Close Action
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Task Details",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = theme.accentColor
                        )
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(theme.bgColor)
                                .clickable { onClose() },
                            contentAlignment = Alignment.Center
                        ) {
                            XIcon(
                                modifier = Modifier.size(14.dp),
                                tint = theme.textSecondaryColor
                            )
                        }
                    }

                    BasicTextField(
                        value = text,
                        onValueChange = { text = it },
                        textStyle = TextStyle(
                            color = theme.textPrimaryColor,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        ),
                        cursorBrush = SolidColor(theme.accentColor),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp)
                    )

                    // Notes Textarea
                    Text(
                        text = "Notes",
                        fontSize = 12.sp,
                        color = theme.textSecondaryColor,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(theme.bgColor)
                            .border(1.dp, theme.borderColor, RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        if (notes.isEmpty()) {
                            Text(
                                text = "Add notes...",
                                color = theme.textSecondaryColor.copy(alpha = 0.5f),
                                fontSize = 14.sp
                            )
                        }
                        BasicTextField(
                            value = notes,
                            onValueChange = { notes = it },
                            textStyle = TextStyle(
                                color = theme.textPrimaryColor,
                                fontSize = 14.sp
                            ),
                            cursorBrush = SolidColor(theme.accentColor),
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Tags Input
                    Text(
                        text = "Tags (comma separated)",
                        fontSize = 12.sp,
                        color = theme.textSecondaryColor,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(theme.bgColor)
                            .border(1.dp, theme.borderColor, RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 10.dp)
                    ) {
                        if (tags.isEmpty()) {
                            Text(
                                text = "work, urgent, reading",
                                color = theme.textSecondaryColor.copy(alpha = 0.5f),
                                fontSize = 14.sp
                            )
                        }
                        BasicTextField(
                            value = tags,
                            onValueChange = { tags = it },
                            textStyle = TextStyle(
                                color = theme.textPrimaryColor,
                                fontSize = 14.sp
                            ),
                            cursorBrush = SolidColor(theme.accentColor),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Subtasks Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Subtasks (${task.subtasks.size})",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = theme.textPrimaryColor
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    if (task.subtasks.isNotEmpty()) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            task.subtasks.forEachIndexed { index, subtask ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(theme.bgColor)
                                        .border(1.dp, theme.borderColor.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                                        .padding(horizontal = 10.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    // Checkbox circle
                                    Box(
                                        modifier = Modifier
                                            .size(20.dp)
                                            .clip(CircleShape)
                                            .background(if (subtask.completed) Color(0xFF2DD4BF) else Color.Transparent)
                                            .border(
                                                width = 1.5.dp,
                                                color = if (subtask.completed) Color(0xFF2DD4BF) else theme.textPrimaryColor.copy(alpha = 0.5f),
                                                shape = CircleShape
                                            )
                                            .clickable { onToggleSubtask(task.id, index) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        if (subtask.completed) {
                                            CheckIcon(modifier = Modifier.size(12.dp), tint = Color.Black)
                                        }
                                    }

                                    Spacer(modifier = Modifier.width(10.dp))

                                    Text(
                                        text = subtask.text,
                                        fontSize = 13.5.sp,
                                        color = if (subtask.completed) theme.textSecondaryColor else theme.textPrimaryColor,
                                        textDecoration = if (subtask.completed) TextDecoration.LineThrough else TextDecoration.None,
                                        modifier = Modifier.weight(1f)
                                    )

                                    Box(
                                        modifier = Modifier
                                            .clickable { onDeleteSubtask(task.id, index) }
                                            .padding(4.dp)
                                    ) {
                                        AuraIcons.X(
                                            color = Color(0xFFF43F5E),
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // Add Subtask Input Row
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(38.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                                .padding(horizontal = 10.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            BasicTextField(
                                value = newSubtaskText,
                                onValueChange = { newSubtaskText = it },
                                textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 13.sp),
                                singleLine = true,
                                cursorBrush = SolidColor(theme.accentColor),
                                decorationBox = { inner ->
                                    if (newSubtaskText.isEmpty()) {
                                        Text("Add a subtask...", color = theme.textSecondaryColor.copy(alpha = 0.6f), fontSize = 13.sp)
                                    }
                                    inner()
                                }
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .height(38.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.accentColor)
                                .clickable {
                                    if (newSubtaskText.isNotBlank()) {
                                        onAddSubtask(task.id, newSubtaskText.trim())
                                        newSubtaskText = ""
                                    }
                                }
                                .padding(horizontal = 14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("+ Add", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Attachments Section
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Attachments (${task.attachments.size})",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = theme.textPrimaryColor
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    if (task.attachments.isNotEmpty()) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            task.attachments.forEach { att ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(theme.bgColor)
                                        .border(1.dp, theme.borderColor.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                                        .padding(horizontal = 10.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .weight(1f)
                                            .clickable { onOpenAttachment(att) },
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        AuraIcons.Paperclip(
                                            color = theme.accentColor,
                                            modifier = Modifier.size(14.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = att.name,
                                            fontSize = 13.sp,
                                            color = theme.textPrimaryColor,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clickable { onDeleteAttachment(task.id, att) }
                                            .padding(4.dp)
                                    ) {
                                        AuraIcons.X(
                                            color = Color(0xFFF43F5E),
                                            modifier = Modifier.size(14.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0x226366F1))
                            .clickable { onAddAttachment(task.id) }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AuraIcons.Paperclip(
                                color = Color(0xFFA5B4FC),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Add Attachment",
                                color = Color(0xFFA5B4FC),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Dependency Section
                    Row(
                        modifier = Modifier
                            .clickable { showDependencySelector = true }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AuraIcons.Link(
                            color = Color(0xFFFBBF24),
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (dependencyTask != null) "Change Dependency" else "Set Dependency",
                            color = Color(0xFFFBBF24),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    if (dependencyTask != null) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 6.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgColor)
                                .border(1.dp, Color(0x44FBBF24), RoundedCornerShape(10.dp))
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Depends on: ${dependencyTask.text}",
                                fontSize = 12.sp,
                                color = theme.textPrimaryColor,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                modifier = Modifier.weight(1f)
                            )
                            Box(
                                modifier = Modifier
                                    .clickable { onSetDependency(task.id, null) }
                                    .padding(4.dp)
                            ) {
                                AuraIcons.X(
                                    color = Color(0xFFF43F5E),
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Action Buttons
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(theme.bgSecondaryHoverColor)
                                .clickable { onClose() }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Cancel",
                                color = theme.textSecondaryColor,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0D9488))
                                .clickable {
                                    val parsedTags = tags.split(",")
                                        .map { it.trim() }
                                        .filter { it.isNotEmpty() }
                                    onSave(task.id, text, notes, parsedTags)
                                    onClose()
                                }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Save",
                                color = Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }

        // Sub-modal for selecting dependency
        if (showDependencySelector) {
            DependencySelectorModal(
                isOpen = true,
                currentTaskId = task.id,
                tasks = allTasks,
                theme = theme,
                onClose = { showDependencySelector = false },
                onSelect = { selectedId ->
                    onSetDependency(task.id, selectedId)
                    showDependencySelector = false
                }
            )
        }
    }
}

@Composable
fun DependencySelectorModal(
    isOpen: Boolean,
    currentTaskId: Long,
    tasks: List<Task>,
    theme: AuraThemeModel,
    onClose: () -> Unit,
    onSelect: (Long) -> Unit
) {
    if (!isOpen) return

    val potentialDependencies = remember(tasks, currentTaskId) {
        tasks.filter { task ->
            !task.completed &&
            task.id != currentTaskId &&
            task.dependsOn != currentTaskId // Prevent direct circular dependencies
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.85f))
            .windowInsetsPadding(WindowInsets.statusBars)
            .windowInsetsPadding(WindowInsets.navigationBars)
            .windowInsetsPadding(WindowInsets.ime)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClose() }
            .padding(horizontal = 16.dp, vertical = 10.dp),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(20.dp))
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor, RoundedCornerShape(20.dp))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null
                ) { /* prevent close */ }
                .padding(20.dp)
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Select Prerequisite Task",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = theme.textPrimaryColor,
                    modifier = Modifier.padding(bottom = 14.dp)
                )

                if (potentialDependencies.isEmpty()) {
                    Text(
                        text = "No available tasks to depend on.",
                        fontSize = 14.sp,
                        color = theme.textSecondaryColor,
                        modifier = Modifier.padding(vertical = 16.dp)
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 240.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(potentialDependencies, key = { it.id }) { depTask ->
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(theme.bgColor)
                                    .clickable { onSelect(depTask.id) }
                                    .padding(horizontal = 14.dp, vertical = 10.dp)
                            ) {
                                Text(
                                    text = depTask.text,
                                    fontSize = 14.sp,
                                    color = theme.textPrimaryColor,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(theme.bgSecondaryHoverColor)
                        .clickable { onClose() }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Cancel",
                        color = theme.textSecondaryColor,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }
    }
}
