package com.example.aura.ui.modals

import android.app.TimePickerDialog
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import java.util.Locale
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.aura.audio.SoundPlayer
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.DailyStats
import com.example.aura.data.model.Task
import com.example.aura.ui.components.ArchiveIcon
import com.example.aura.ui.components.ClockIcon
import com.example.aura.ui.components.DownloadIcon
import com.example.aura.ui.components.PaintbrushIcon
import com.example.aura.ui.components.PlayIcon
import com.example.aura.ui.components.SearchIcon
import com.example.aura.ui.components.SettingsIcon
import com.example.aura.ui.components.UploadIcon
import com.example.aura.ui.components.XIcon
import kotlinx.coroutines.delay

// --- Settings Modal ---
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SettingsModal(
    isOpen: Boolean,
    currentThemeId: String,
    allThemes: List<AuraThemeModel>,
    customCategories: Map<String, CategoryStyle>,
    soundEffectsEnabled: Boolean,
    autoArchiveEnabled: Boolean,
    notificationsEnabled: Boolean,
    shutdownTime: String,
    theme: AuraThemeModel,
    onClose: () -> Unit,
    onSelectTheme: (String) -> Unit,
    onToggleSoundEffects: (Boolean) -> Unit,
    onToggleAutoArchive: (Boolean) -> Unit,
    onToggleNotifications: (Boolean) -> Unit,
    onUpdateShutdownTime: (String) -> Unit,
    onAddCategory: (String) -> Unit,
    onRemoveCategory: (String) -> Unit,
    onOpenThemeCreator: () -> Unit,
    onOpenArchive: () -> Unit,
    onExportData: () -> Unit,
    onImportData: () -> Unit
) {
    if (!isOpen) return

    val context = LocalContext.current
    var newCategoryName by remember { mutableStateOf("") }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.75f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) { onClose() }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.88f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                    .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) {}
            ) {
                // Fixed Header: Title Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(start = 20.dp, end = 20.dp, top = 20.dp, bottom = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        com.example.aura.ui.components.AuraLogoEmblem(
                            modifier = Modifier.size(24.dp),
                            glowAlpha = 0.5f
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Settings",
                            color = theme.textPrimaryColor,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .clickable { onClose() },
                        contentAlignment = Alignment.Center
                    ) {
                        XIcon(modifier = Modifier.size(20.dp), tint = theme.textSecondaryColor)
                    }
                }

                // Scrollable Content
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f, fill = false)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 20.dp)
                        .padding(bottom = 24.dp)
                ) {
                    // Theme Section Header with active theme name
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Theme",
                            color = theme.textPrimaryColor,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        val activeThemeName = allThemes.find { it.id == currentThemeId }?.name ?: "Custom"
                        Text(
                            text = activeThemeName,
                            color = theme.accentColor,
                            fontSize = 12.5.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Spacer(modifier = Modifier.height(10.dp))

                    // Evenly Distributed Full-Width 3-Column Theme Grid
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val chunks = allThemes.chunked(3)
                        val lastChunk = chunks.lastOrNull() ?: emptyList()
                        val completeChunks = if (lastChunk.size == 3) chunks else chunks.dropLast(1)

                        completeChunks.forEach { rowThemes ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                rowThemes.forEach { t ->
                                    val isSelected = currentThemeId == t.id
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(38.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(t.bgColor)
                                            .border(
                                                width = if (isSelected) 2.dp else 1.dp,
                                                color = if (isSelected) theme.accentColor else theme.borderColor.copy(alpha = 0.5f),
                                                shape = RoundedCornerShape(10.dp)
                                            )
                                            .clickable { onSelectTheme(t.id) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = t.name,
                                            color = t.textPrimaryColor,
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                            textAlign = TextAlign.Center,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            modifier = Modifier.padding(horizontal = 4.dp)
                                        )
                                    }
                                }
                            }
                        }

                        if (lastChunk.size == 1) {
                            val t = lastChunk[0]
                            val isSelected = currentThemeId == t.id
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(38.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(t.bgColor)
                                        .border(
                                            width = if (isSelected) 2.dp else 1.dp,
                                            color = if (isSelected) theme.accentColor else theme.borderColor.copy(alpha = 0.5f),
                                            shape = RoundedCornerShape(10.dp)
                                        )
                                        .clickable { onSelectTheme(t.id) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = t.name,
                                        color = t.textPrimaryColor,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                        textAlign = TextAlign.Center,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.padding(horizontal = 4.dp)
                                    )
                                }

                                Row(
                                    modifier = Modifier
                                        .weight(2f)
                                        .height(38.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(theme.bgColor)
                                        .border(1.dp, theme.accentColor, RoundedCornerShape(10.dp))
                                        .clickable { onOpenThemeCreator() },
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    PaintbrushIcon(modifier = Modifier.size(15.dp), tint = theme.accentColor)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = "Custom Theme",
                                        color = theme.accentColor,
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        } else if (lastChunk.size == 2) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                lastChunk.forEach { t ->
                                    val isSelected = currentThemeId == t.id
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(38.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(t.bgColor)
                                            .border(
                                                width = if (isSelected) 2.dp else 1.dp,
                                                color = if (isSelected) theme.accentColor else theme.borderColor.copy(alpha = 0.5f),
                                                shape = RoundedCornerShape(10.dp)
                                            )
                                            .clickable { onSelectTheme(t.id) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = t.name,
                                            color = t.textPrimaryColor,
                                            fontSize = 11.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.SemiBold,
                                            textAlign = TextAlign.Center,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                            modifier = Modifier.padding(horizontal = 4.dp)
                                        )
                                    }
                                }

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(38.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(theme.bgColor)
                                        .border(1.dp, theme.accentColor, RoundedCornerShape(10.dp))
                                        .clickable { onOpenThemeCreator() },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.Center
                                    ) {
                                        PaintbrushIcon(modifier = Modifier.size(15.dp), tint = theme.accentColor)
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = "Custom",
                                            color = theme.accentColor,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                }
                            }
                        } else {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(38.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(theme.bgColor)
                                    .border(1.dp, theme.accentColor, RoundedCornerShape(10.dp))
                                    .clickable { onOpenThemeCreator() },
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                                ) {
                                    PaintbrushIcon(modifier = Modifier.size(15.dp), tint = theme.accentColor)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Create Custom Theme",
                                        color = theme.accentColor,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // General Switches
                    Text(
                        text = "General",
                        color = theme.textPrimaryColor,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    SettingsToggleRow(
                        title = "Enable Sound Effects",
                        checked = soundEffectsEnabled,
                        theme = theme,
                        onCheckedChange = onToggleSoundEffects
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    SettingsToggleRow(
                        title = "Auto-archive yesterday's tasks",
                        checked = autoArchiveEnabled,
                        theme = theme,
                        onCheckedChange = onToggleAutoArchive
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    SettingsToggleRow(
                        title = "Enable Notifications",
                        checked = notificationsEnabled,
                        theme = theme,
                        onCheckedChange = onToggleNotifications
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Custom Categories
                    Text(
                        text = "Custom Categories",
                        color = theme.textPrimaryColor,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(42.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                                .padding(horizontal = 12.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            BasicTextField(
                                value = newCategoryName,
                                onValueChange = { newCategoryName = it },
                                textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 14.sp),
                                singleLine = true,
                                cursorBrush = SolidColor(theme.accentColor),
                                decorationBox = { inner ->
                                    if (newCategoryName.isEmpty()) {
                                        Text("New category name...", color = theme.textSecondaryColor, fontSize = 13.sp)
                                    }
                                    inner()
                                }
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Box(
                            modifier = Modifier
                                .height(42.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.accentColor)
                                .clickable {
                                    if (newCategoryName.isNotBlank()) {
                                        onAddCategory(newCategoryName.trim())
                                        newCategoryName = ""
                                    }
                                }
                                .padding(horizontal = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Add", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }

                    if (customCategories.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            customCategories.keys.forEach { catName ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(theme.bgColor)
                                        .padding(horizontal = 12.dp, vertical = 8.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = catName, color = theme.textPrimaryColor, fontSize = 13.5.sp)
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clickable { onRemoveCategory(catName) },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        XIcon(modifier = Modifier.size(16.dp), tint = Color(0xFFF43F5E))
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Productivity Section (End of Day Time)
                    Text(
                        text = "Productivity",
                        color = theme.textPrimaryColor,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(theme.bgColor)
                            .border(1.dp, theme.borderColor.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
                            .padding(horizontal = 14.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "End of Day Time", color = theme.textPrimaryColor, fontSize = 14.sp)
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(theme.bgSecondaryColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(8.dp))
                                .clickable {
                                    val parts = shutdownTime.split(":")
                                    val h = parts.getOrNull(0)?.toIntOrNull() ?: 18
                                    val m = parts.getOrNull(1)?.toIntOrNull() ?: 0
                                    TimePickerDialog(context, { _, hourOfDay, minute ->
                                        val formatted = String.format(Locale.US, "%02d:%02d", hourOfDay, minute)
                                        onUpdateShutdownTime(formatted)
                                    }, h, m, true).show()
                                }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(text = shutdownTime, color = theme.accentColor, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Data Management Section
                    Text(
                        text = "Data Management",
                        color = theme.textPrimaryColor,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                                .clickable { onExportData() }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                DownloadIcon(modifier = Modifier.size(16.dp), tint = theme.textPrimaryColor)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Export", color = theme.textPrimaryColor, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                                .clickable { onImportData() }
                                .padding(vertical = 12.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                UploadIcon(modifier = Modifier.size(16.dp), tint = theme.textPrimaryColor)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Import", color = theme.textPrimaryColor, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(theme.bgColor)
                            .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                            .clickable { onOpenArchive() }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            ArchiveIcon(modifier = Modifier.size(16.dp), tint = theme.textPrimaryColor)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("View Archive", color = theme.textPrimaryColor, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }

                    Spacer(modifier = Modifier.height(28.dp))
                }
            }
        }
    }
}

@Composable
private fun SettingsToggleRow(
    title: String,
    checked: Boolean,
    theme: AuraThemeModel,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(theme.bgColor)
            .border(1.dp, theme.borderColor.copy(alpha = 0.5f), RoundedCornerShape(10.dp))
            .padding(horizontal = 14.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = title, color = theme.textPrimaryColor, fontSize = 13.5.sp)
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color.White,
                checkedTrackColor = theme.accentColor,
                uncheckedThumbColor = Color.LightGray,
                uncheckedTrackColor = Color.DarkGray
            )
        )
    }
}

// --- Focus Timer Modal ---
@Composable
fun FocusModal(
    task: Task?,
    theme: AuraThemeModel,
    onClose: () -> Unit,
    onComplete: (Long) -> Unit
) {
    if (task == null) return

    val coroutineScope = rememberCoroutineScope()
    var durationMinutes by remember { mutableIntStateOf(25) }
    var timeLeftSeconds by remember { mutableIntStateOf(durationMinutes * 60) }
    var isActive by remember { mutableStateOf(false) }
    var soundType by remember { mutableStateOf("off") } // "off", "pink", "brown", "white"

    LaunchedEffect(durationMinutes) {
        if (!isActive) {
            timeLeftSeconds = durationMinutes * 60
        }
    }

    LaunchedEffect(isActive, timeLeftSeconds) {
        if (isActive && timeLeftSeconds > 0) {
            delay(1000)
            timeLeftSeconds--
        } else if (timeLeftSeconds <= 0 && isActive) {
            isActive = false
            SoundPlayer.stopNoise()
            onComplete(task.id)
            onClose()
        }
    }

    LaunchedEffect(isActive, soundType) {
        if (isActive && soundType != "off") {
            SoundPlayer.startNoise(soundType, coroutineScope)
        } else {
            SoundPlayer.stopNoise()
        }
    }

    val minutes = timeLeftSeconds / 60
    val seconds = timeLeftSeconds % 60
    val progress = ((durationMinutes * 60 - timeLeftSeconds).toFloat() / (durationMinutes * 60).toFloat()).coerceIn(0f, 1f)

    Dialog(
        onDismissRequest = {
            SoundPlayer.stopNoise()
            onClose()
        },
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.92f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Focusing on:",
                    color = Color.White.copy(alpha = 0.7f),
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = task.text,
                    color = Color.White,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Duration adjustment
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = if (isActive) 0.05f else 0.15f))
                            .clickable(enabled = !isActive) {
                                durationMinutes = (durationMinutes - 5).coerceAtLeast(5)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("-", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        text = "Set Timer: $durationMinutes min",
                        color = Color.White.copy(alpha = 0.85f),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.width(16.dp))

                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color.White.copy(alpha = if (isActive) 0.05f else 0.15f))
                            .clickable(enabled = !isActive) {
                                durationMinutes += 5
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text("+", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Circular Progress Timer
                Box(
                    modifier = Modifier.size(190.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val strokeW = 8.dp.toPx()
                        drawCircle(
                            color = Color.White.copy(alpha = 0.1f),
                            radius = size.width / 2f - strokeW / 2f,
                            style = Stroke(strokeW)
                        )
                        drawArc(
                            color = Color(0xFF2DD4BF),
                            startAngle = -90f,
                            sweepAngle = 360f * progress,
                            useCenter = false,
                            style = Stroke(strokeW, cap = StrokeCap.Round)
                        )
                    }
                    Text(
                        text = String.format("%02d:%02d", minutes, seconds),
                        color = Color.White,
                        fontSize = 38.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Spacer(modifier = Modifier.height(28.dp))

                // Start/Pause & End Session
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(24.dp))
                            .background(if (isActive) Color(0xFFEF4444) else Color(0xFF2DD4BF))
                            .clickable { isActive = !isActive }
                            .padding(horizontal = 28.dp, vertical = 12.dp)
                    ) {
                        Text(
                            text = if (isActive) "Pause" else "Start",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(24.dp))
                            .background(Color.White.copy(alpha = 0.1f))
                            .clickable {
                                SoundPlayer.stopNoise()
                                onClose()
                            }
                            .padding(horizontal = 22.dp, vertical = 12.dp)
                    ) {
                        Text(
                            text = "End Session",
                            color = Color.White,
                            fontSize = 15.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Ambient Sound selector (Off, Pink, Brown, White)
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("off" to "Off", "pink" to "Pink", "brown" to "Brown", "white" to "White").forEach { (type, label) ->
                        val isSelected = soundType == type
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) Color.White.copy(alpha = 0.25f) else Color.White.copy(alpha = 0.08f))
                                .clickable { soundType = type }
                                .padding(horizontal = 14.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = label,
                                color = if (isSelected) Color.White else Color.White.copy(alpha = 0.7f),
                                fontSize = 12.5.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }
        }
    }
}

// --- Win Modal ---
@Composable
fun WinModal(
    task: Task?,
    theme: AuraThemeModel,
    onSave: (Long, String) -> Unit,
    onSkip: () -> Unit
) {
    if (task == null) return
    var winText by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onSkip) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .clip(RoundedCornerShape(24.dp))
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                .padding(24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Great Work!",
                    color = theme.textPrimaryColor,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "You completed: ${task.text}",
                    color = theme.textPrimaryColor.copy(alpha = 0.9f),
                    fontSize = 14.5.sp,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "Optionally, add a note about this accomplishment to your Grove.",
                    color = theme.textSecondaryColor,
                    fontSize = 12.5.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(90.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(theme.bgColor)
                        .border(1.dp, theme.borderColor, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    BasicTextField(
                        value = winText,
                        onValueChange = { winText = it },
                        modifier = Modifier.fillMaxSize(),
                        textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 14.sp),
                        cursorBrush = SolidColor(theme.accentColor),
                        decorationBox = { inner ->
                            if (winText.isEmpty()) {
                                Text("e.g., 'Finally cracked the issue...'", color = theme.textSecondaryColor, fontSize = 13.5.sp)
                            }
                            inner()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(theme.bgColor)
                            .clickable { onSkip() }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Skip", color = theme.textSecondaryColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF10B981))
                            .clickable { onSave(task.id, winText) }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Save Win", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

// --- Mindful Minute Modal ---
@Composable
fun MindfulMinuteModal(
    isOpen: Boolean,
    theme: AuraThemeModel,
    onClose: () -> Unit
) {
    if (!isOpen) return

    val prompts = listOf("Breathe in...", "Hold...", "Breathe out...")
    val durations = listOf(4000L, 2000L, 6000L)
    var promptIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(isOpen) {
        while (isOpen) {
            delay(durations[promptIndex])
            promptIndex = (promptIndex + 1) % prompts.size
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "breathe")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.3f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 6000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.95f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Expanding / Contracting Circle
                Box(
                    modifier = Modifier
                        .size((160.dp * scale))
                        .clip(CircleShape)
                        .border(2.5.dp, theme.accentColor, CircleShape)
                        .background(theme.accentColor.copy(alpha = 0.1f * scale))
                )

                Spacer(modifier = Modifier.height(44.dp))

                Text(
                    text = prompts[promptIndex],
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(48.dp))

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color.White.copy(alpha = 0.1f))
                        .clickable { onClose() }
                        .padding(horizontal = 24.dp, vertical = 10.dp)
                ) {
                    Text("End Session", color = Color.White, fontSize = 14.sp)
                }
            }
        }
    }
}

// --- Theme Creator Modal ---
@Composable
fun ThemeCreatorModal(
    isOpen: Boolean,
    theme: AuraThemeModel,
    onSave: (AuraThemeModel) -> Unit,
    onClose: () -> Unit
) {
    if (!isOpen) return

    var name by remember { mutableStateOf("") }
    var bg by remember { mutableStateOf("000000") }
    var bgSecondary by remember { mutableStateOf("111827") }
    var textPrimary by remember { mutableStateOf("F9FAFB") }
    var textSecondary by remember { mutableStateOf("9CA3AF") }
    var accent by remember { mutableStateOf("2DD4BF") }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.75f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) { onClose() }
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
                    .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) {}
                    .padding(20.dp)
            ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Create a Theme",
                    color = theme.textPrimaryColor,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(14.dp))

                // Name input
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(theme.bgColor)
                        .border(1.dp, theme.borderColor, RoundedCornerShape(10.dp))
                        .padding(horizontal = 12.dp),
                    contentAlignment = Alignment.CenterStart
                ) {
                    BasicTextField(
                        value = name,
                        onValueChange = { name = it },
                        textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 14.sp),
                        singleLine = true,
                        cursorBrush = SolidColor(theme.accentColor),
                        decorationBox = { inner ->
                            if (name.isEmpty()) {
                                Text("Theme Name", color = theme.textSecondaryColor, fontSize = 13.5.sp)
                            }
                            inner()
                        }
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                ColorHexField("Background (Hex)", bg) { bg = it }
                ColorHexField("Secondary BG", bgSecondary) { bgSecondary = it }
                ColorHexField("Primary Text", textPrimary) { textPrimary = it }
                ColorHexField("Secondary Text", textSecondary) { textSecondary = it }
                ColorHexField("Accent", accent) { accent = it }

                Spacer(modifier = Modifier.height(18.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(theme.bgColor)
                            .clickable { onClose() }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Cancel", color = theme.textSecondaryColor, fontSize = 13.5.sp, fontWeight = FontWeight.SemiBold)
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(theme.accentColor)
                            .clickable {
                                if (name.isNotBlank()) {
                                    val newTheme = AuraThemeModel(
                                        id = name.lowercase().replace(" ", "_"),
                                        name = name,
                                        bg = parseHexColor(bg, 0xFF000000),
                                        bgSecondary = parseHexColor(bgSecondary, 0xFF111827),
                                        bgSecondaryHover = parseHexColor(bgSecondary, 0xFF1F2937),
                                        bgInput = 0x80111827,
                                        textPrimary = parseHexColor(textPrimary, 0xFFF9FAFB),
                                        textSecondary = parseHexColor(textSecondary, 0xFF9CA3AF),
                                        border = 0xFF374151,
                                        accent = parseHexColor(accent, 0xFF2DD4BF),
                                        isLight = false,
                                        isCustom = true
                                    )
                                    onSave(newTheme)
                                    onClose()
                                }
                            }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("Save", color = Color.Black, fontSize = 13.5.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
}

@Composable
private fun ColorHexField(label: String, hexValue: String, onValueChange: (String) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, color = Color.LightGray, fontSize = 13.sp)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(22.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(parseHexColor(hexValue, 0xFFFFFFFF)))
                    .border(1.dp, Color.White.copy(alpha = 0.3f), RoundedCornerShape(4.dp))
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .width(90.dp)
                    .height(34.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color.Black.copy(alpha = 0.3f))
                    .padding(horizontal = 8.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                BasicTextField(
                    value = hexValue,
                    onValueChange = { if (it.length <= 6) onValueChange(it) },
                    textStyle = TextStyle(color = Color.White, fontSize = 13.sp, fontFamily = FontFamily.Monospace),
                    singleLine = true,
                    cursorBrush = SolidColor(Color.White)
                )
            }
        }
    }
}

private fun parseHexColor(hex: String, defaultVal: Long): Long {
    return try {
        val clean = hex.replace("#", "").trim()
        if (clean.length == 6) {
            (0xFF000000L or clean.toLong(16))
        } else defaultVal
    } catch (_: Exception) {
        defaultVal
    }
}

// --- Archive Modal ---
@Composable
fun ArchiveModal(
    isOpen: Boolean,
    archivedTasks: List<Task>,
    theme: AuraThemeModel,
    onRestore: (Long) -> Unit,
    onDelete: (Long) -> Unit,
    onClose: () -> Unit
) {
    if (!isOpen) return

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.75f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) { onClose() }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.96f)
                    .fillMaxHeight(0.88f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                    .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) {}
                    .padding(20.dp)
            ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Archived Tasks",
                        color = theme.textPrimaryColor,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clickable { onClose() },
                        contentAlignment = Alignment.Center
                    ) {
                        XIcon(modifier = Modifier.size(20.dp), tint = theme.textSecondaryColor)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (archivedTasks.isEmpty()) {
                    Text(
                        text = "Your archive is empty.",
                        color = theme.textSecondaryColor,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(vertical = 24.dp)
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f, fill = false),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(archivedTasks, key = { it.id }) { task ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(theme.bgColor)
                                    .padding(horizontal = 12.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = task.text,
                                        color = theme.textPrimaryColor.copy(alpha = 0.8f),
                                        fontSize = 13.5.sp,
                                        textDecoration = TextDecoration.LineThrough
                                    )
                                    task.completionDate?.let {
                                        Text(text = "Completed: $it", color = theme.textSecondaryColor, fontSize = 11.sp)
                                    }
                                }
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Text(
                                        text = "Restore",
                                        color = Color(0xFF34D399),
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier.clickable { onRestore(task.id) }
                                    )
                                    Text(
                                        text = "Delete",
                                        color = Color(0xFFF43F5E),
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        modifier = Modifier.clickable { onDelete(task.id) }
                                    )
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }
}
}

// --- Share Summary Modal ---
@Composable
fun ShareSummaryModal(
    isOpen: Boolean,
    dailyStats: DailyStats,
    theme: AuraThemeModel,
    onClose: () -> Unit
) {
    if (!isOpen) return

    val context = LocalContext.current
    var copied by remember { mutableStateOf(false) }

    val summaryText = "Aura Daily Summary ✨\n\n✅ Tasks Completed: ${dailyStats.completed}\n⏰ Focus Sessions: ${dailyStats.focusSessions}\n🏆 Achievements: ${dailyStats.achievements}"

    val handleCopy = {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
        val clip = ClipData.newPlainText("Aura Summary", summaryText)
        clipboard.setPrimaryClip(clip)
        copied = true
    }

    LaunchedEffect(copied) {
        if (copied) {
            delay(2000)
            copied = false
        }
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.75f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) { onClose() }
                .padding(horizontal = 16.dp, vertical = 10.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .clip(RoundedCornerShape(24.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                    .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) {}
                    .padding(20.dp)
            ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Today's Wins",
                        color = theme.textPrimaryColor,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clickable { onClose() },
                        contentAlignment = Alignment.Center
                    ) {
                        XIcon(modifier = Modifier.size(20.dp), tint = theme.textSecondaryColor)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(theme.bgColor)
                        .padding(16.dp)
                ) {
                    Text(
                        text = summaryText,
                        color = theme.textPrimaryColor,
                        fontSize = 14.5.sp,
                        lineHeight = 22.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(theme.accentColor)
                        .clickable { handleCopy() }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (copied) "Copied to Clipboard!" else "Copy Summary",
                        color = Color.Black,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
}

// --- Command Palette Modal ---
data class CommandItem(
    val label: String,
    val shortcut: String = "",
    val action: () -> Unit
)

@Composable
fun CommandPaletteModal(
    isOpen: Boolean,
    commands: List<CommandItem>,
    theme: AuraThemeModel,
    onClose: () -> Unit
) {
    if (!isOpen) return

    var query by remember { mutableStateOf("") }
    val filtered = remember(query, commands) {
        if (query.isEmpty()) commands
        else commands.filter { it.label.contains(query, ignoreCase = true) }
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.8f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) { onClose() }
                .padding(horizontal = 16.dp, vertical = 16.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .padding(top = 40.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(20.dp))
                    .clickable(indication = null, interactionSource = remember { MutableInteractionSource() }) {}
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        BasicTextField(
                            value = query,
                            onValueChange = { query = it },
                            textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 16.sp),
                            singleLine = true,
                            cursorBrush = SolidColor(theme.accentColor),
                            decorationBox = { inner ->
                                if (query.isEmpty()) {
                                    Text("Type a command or search...", color = theme.textSecondaryColor, fontSize = 16.sp)
                                }
                                inner()
                            }
                        )
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(theme.borderColor)
                    )

                    LazyColumn(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(260.dp)
                    ) {
                        items(filtered) { cmd ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        cmd.action()
                                        onClose()
                                    }
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = cmd.label, color = theme.textPrimaryColor, fontSize = 14.sp)
                                if (cmd.shortcut.isNotEmpty()) {
                                    Text(text = cmd.shortcut, color = theme.textSecondaryColor, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Search Modal ---
@Composable
fun SearchModal(
    isOpen: Boolean,
    tasks: List<Task>,
    theme: AuraThemeModel,
    onTaskClick: (Long) -> Unit,
    onClose: () -> Unit
) {
    if (!isOpen) return

    var query by remember { mutableStateOf("") }
    val searchResults = remember(query, tasks) {
        if (query.isBlank()) emptyList()
        else {
            val q = query.lowercase().trim()
            tasks.filter { task ->
                task.text.lowercase().contains(q) ||
                task.category.lowercase().contains(q) ||
                task.notes.lowercase().contains(q) ||
                task.tags.any { it.lowercase().contains(q) }
            }
        }
    }

    Dialog(
        onDismissRequest = onClose,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.85f))
                .windowInsetsPadding(WindowInsets.statusBars)
                .windowInsetsPadding(WindowInsets.navigationBars)
                .windowInsetsPadding(WindowInsets.ime)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clip(RoundedCornerShape(24.dp))
                            .background(theme.bgInputColor)
                            .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = query,
                            onValueChange = { query = it },
                            textStyle = TextStyle(color = theme.textPrimaryColor, fontSize = 15.sp),
                            singleLine = true,
                            cursorBrush = SolidColor(theme.accentColor),
                            decorationBox = { inner ->
                                if (query.isEmpty()) {
                                    Text("Search tasks, categories, or @tags...", color = theme.textSecondaryColor, fontSize = 14.sp)
                                }
                                inner()
                            }
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .clickable { onClose() },
                        contentAlignment = Alignment.Center
                    ) {
                        XIcon(modifier = Modifier.size(24.dp), tint = theme.textSecondaryColor)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(searchResults, key = { it.id }) { task ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(theme.bgSecondaryColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(12.dp))
                                .clickable {
                                    onTaskClick(task.id)
                                    onClose()
                                }
                                .padding(14.dp)
                        ) {
                            Column {
                                Text(
                                    text = task.text,
                                    color = theme.textPrimaryColor,
                                    fontSize = 14.5.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = task.category,
                                    color = theme.textSecondaryColor,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

// --- Template Suggestion Modal ---
@Composable
fun TemplateSuggestionModal(
    templateName: String?,
    taskText: String?,
    theme: AuraThemeModel,
    onApply: () -> Unit,
    onContinueAsWritten: () -> Unit,
    onClose: () -> Unit
) {
    if (templateName == null) return

    Dialog(onDismissRequest = onClose) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .clip(RoundedCornerShape(24.dp))
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor, RoundedCornerShape(24.dp))
                .padding(24.dp)
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Template Found",
                    color = theme.textPrimaryColor,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(10.dp))
                Text(
                    text = "Your new task matches the \"$templateName\" template. How would you like to proceed?",
                    color = theme.textSecondaryColor,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(20.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF6366F1))
                        .clickable { onApply() }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Apply Template", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(theme.bgColor)
                        .clickable { onContinueAsWritten() }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Add Task as Written", color = theme.textPrimaryColor, fontSize = 14.sp)
                }
            }
        }
    }
}

// --- Planting Animation Modal ---
@Composable
fun PlantingAnimationModal(
    isOpen: Boolean,
    onComplete: () -> Unit
) {
    if (!isOpen) return

    val infiniteTransition = rememberInfiniteTransition(label = "seed_pulse")
    val seedScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.4f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "seed"
    )

    LaunchedEffect(isOpen) {
        delay(2200)
        onComplete()
    }

    Dialog(
        onDismissRequest = {},
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f)),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.size(140.dp)) {
                val cx = size.width / 2f
                val cy = size.height * 0.8f
                // Seed
                drawCircle(
                    color = Color(0xFFFBBF24),
                    radius = 8.dp.toPx() * seedScale,
                    center = Offset(cx, cy)
                )
                // Sprout
                val sproutPath = Path().apply {
                    moveTo(cx, cy)
                    cubicTo(cx - 20f, cy - 40f, cx - 10f, cy - 70f, cx, cy - 90f)
                }
                drawPath(sproutPath, color = Color(0xFFA3E635), style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round))
            }
        }
    }
}
