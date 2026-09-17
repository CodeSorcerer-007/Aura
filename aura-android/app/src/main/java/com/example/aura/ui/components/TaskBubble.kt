package com.example.aura.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.Task
import com.example.aura.data.model.defaultCategoriesMap
import java.time.LocalDate

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun TaskBubble(
    task: Task,
    theme: AuraThemeModel,
    allCategories: Map<String, CategoryStyle>,
    isDependencyMet: Boolean,
    onToggle: (Long) -> Unit,
    onDelete: (Long) -> Unit,
    onFocus: (Long) -> Unit,
    onTogglePin: (Long) -> Unit,
    onArchive: (Long) -> Unit,
    onReorder: (Long, String) -> Unit,
    onOpenDetail: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val categoryStyle = allCategories[task.category] ?: defaultCategoriesMap["General"] ?: CategoryStyle(
        name = "General",
        bgHex = 0x4D64748B,
        borderHex = 0x8094A3B8,
        textHex = 0xFFE2E8F0,
        solidHex = 0xFF475569,
        glowHex = 0xFF94A3B8
    )

    val isLocked = !isDependencyMet
    val isOverdue = task.deadline?.let {
        try {
            LocalDate.parse(it).isBefore(LocalDate.now()) && !task.completed
        } catch (_: Exception) {
            false
        }
    } ?: false

    val cardBg = Color(categoryStyle.bgHex)
    val cardBorder = if (task.isPinned) Color(0xFFFBBF24) else Color(categoryStyle.borderHex)
    val glowColor = Color(categoryStyle.glowHex)

    val completedSubtasks = task.subtasks.count { it.completed }
    val totalSubtasks = task.subtasks.size
    val subtaskProgress = if (totalSubtasks > 0) completedSubtasks.toFloat() / totalSubtasks.toFloat() else 0f

    val alpha = when {
        task.completed -> 0.6f
        isLocked -> 0.7f
        else -> 1f
    }

    // Custom shadow/glow drawing
    val glowRadius = if (!task.completed) (task.priority * 4).dp else 0.dp

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .drawGlow(glowColor, glowRadius)
            .clip(RoundedCornerShape(20.dp))
            .background(cardBg)
            .border(
                width = if (task.isPinned) 1.5.dp else 1.dp,
                color = cardBorder,
                shape = RoundedCornerShape(20.dp)
            )
            .alpha(alpha)
            .clickable { onOpenDetail(task.id) }
            .padding(14.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Main row: Reorder arrows, Checkbox, Text (FLEXIBLE WIDTH!), Category badge & Actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                // Reorder controls
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(end = 6.dp, top = 2.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .clickable { onReorder(task.id, "up") },
                        contentAlignment = Alignment.Center
                    ) {
                        ChevronUpIcon(modifier = Modifier.size(16.dp), tint = theme.textPrimaryColor.copy(alpha = 0.4f))
                    }
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .clickable { onReorder(task.id, "down") },
                        contentAlignment = Alignment.Center
                    ) {
                        ChevronDownIcon(modifier = Modifier.size(16.dp), tint = theme.textPrimaryColor.copy(alpha = 0.4f))
                    }
                }

                // Checkbox circle
                Box(
                    modifier = Modifier
                        .padding(end = 12.dp, top = 2.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(if (task.completed) Color(0xFF2DD4BF) else Color.Transparent)
                        .border(
                            width = 2.dp,
                            color = if (task.completed) Color(0xFF2DD4BF) else theme.textPrimaryColor.copy(alpha = 0.5f),
                            shape = CircleShape
                        )
                        .clickable(enabled = !isLocked) { onToggle(task.id) },
                    contentAlignment = Alignment.Center
                ) {
                    if (task.completed) {
                        CheckIcon(modifier = Modifier.size(16.dp), tint = Color.Black)
                    }
                }

                // Center Column: Task Title text takes all remaining space! Multi-line wrapping!
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 8.dp)
                ) {
                    Text(
                        text = task.text,
                        color = if (task.completed) theme.textPrimaryColor.copy(alpha = 0.6f) else theme.textPrimaryColor,
                        fontSize = 15.sp,
                        lineHeight = 20.sp,
                        fontWeight = FontWeight.Normal,
                        textDecoration = if (task.completed) TextDecoration.LineThrough else TextDecoration.None
                    )

                    // Tags row
                    if (task.tags.isNotEmpty()) {
                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.padding(top = 6.dp)
                        ) {
                            task.tags.forEach { tag ->
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color.White.copy(alpha = 0.12f))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "@$tag",
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }

                    // Metadata chips: Deadline, Focus count, Attachments count, Dependency
                    Row(
                        modifier = Modifier.padding(top = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        task.deadline?.let { dl ->
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                CalendarIcon(
                                    modifier = Modifier.size(13.dp),
                                    tint = if (isOverdue) Color(0xFFFB7185) else theme.textSecondaryColor
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                val recLabel = if (task.recurring != null) " (${task.recurring.type})" else ""
                                Text(
                                    text = "$dl$recLabel",
                                    color = if (isOverdue) Color(0xFFFB7185) else theme.textSecondaryColor,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }

                        if (task.focusSessions > 0) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                ClockIcon(modifier = Modifier.size(13.dp), tint = theme.textSecondaryColor)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${task.focusSessions}",
                                    color = theme.textSecondaryColor,
                                    fontSize = 11.sp
                                )
                            }
                        }

                        if (task.attachments.isNotEmpty()) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                PaperclipIcon(modifier = Modifier.size(13.dp), tint = theme.textSecondaryColor)
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${task.attachments.size}",
                                    color = theme.textSecondaryColor,
                                    fontSize = 11.sp
                                )
                            }
                        }
                    }

                    if (task.dependsOn != null) {
                        Row(
                            modifier = Modifier.padding(top = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            LinkIcon(modifier = Modifier.size(13.dp), tint = Color(0xFFFBBF24))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Depends on another task",
                                color = Color(0xFFFBBF24).copy(alpha = 0.9f),
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                // Right column: Category pill & Action buttons
                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Category pill
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(categoryStyle.solidHex).copy(alpha = 0.35f))
                            .border(1.dp, Color(categoryStyle.borderHex).copy(alpha = 0.6f), RoundedCornerShape(12.dp))
                            .padding(horizontal = 10.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = task.category,
                            color = Color(categoryStyle.textHex),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    // Action buttons row (Pin, Archive / Focus, Delete)
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (!task.completed) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { onTogglePin(task.id) },
                                contentAlignment = Alignment.Center
                            ) {
                                PinIcon(
                                    modifier = Modifier.size(18.dp),
                                    tint = if (task.isPinned) Color(0xFFFBBF24) else theme.textPrimaryColor.copy(alpha = 0.4f)
                                )
                            }
                        }

                        if (task.completed) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable { onArchive(task.id) },
                                contentAlignment = Alignment.Center
                            ) {
                                ArchiveIcon(
                                    modifier = Modifier.size(18.dp),
                                    tint = theme.textPrimaryColor.copy(alpha = 0.4f)
                                )
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .clickable(enabled = !isLocked) { onFocus(task.id) },
                                contentAlignment = Alignment.Center
                            ) {
                                PlayIcon(
                                    modifier = Modifier.size(18.dp),
                                    tint = if (isLocked) theme.textPrimaryColor.copy(alpha = 0.2f) else theme.textPrimaryColor.copy(alpha = 0.5f)
                                )
                            }
                        }

                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clickable { onDelete(task.id) },
                            contentAlignment = Alignment.Center
                        ) {
                            XIcon(
                                modifier = Modifier.size(18.dp),
                                tint = theme.textPrimaryColor.copy(alpha = 0.4f)
                            )
                        }
                    }
                }
            }

            // Subtask progress bar
            if (totalSubtasks > 0) {
                Spacer(modifier = Modifier.height(10.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(3.dp)
                        .clip(RoundedCornerShape(1.5.dp))
                        .background(theme.textPrimaryColor.copy(alpha = 0.1f))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(subtaskProgress)
                            .height(3.dp)
                            .clip(RoundedCornerShape(1.5.dp))
                            .background(Color(0xFF2DD4BF))
                    )
                }
            }
        }
    }
}

// Custom blur/glow modifier using framework canvas
private fun Modifier.drawGlow(color: Color, radius: Dp): Modifier = this.drawBehind {
    if (radius <= 0.dp) return@drawBehind
    drawIntoCanvas { canvas ->
        val paint = Paint().apply {
            asFrameworkPaint().apply {
                isAntiAlias = true
                this.color = color.toArgb()
                setShadowLayer(radius.toPx(), 0f, 0f, color.toArgb())
            }
        }
        canvas.drawRoundRect(
            0f, 0f, size.width, size.height,
            20.dp.toPx(), 20.dp.toPx(),
            paint
        )
    }
}
