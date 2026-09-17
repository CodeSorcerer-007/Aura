package com.example.aura.ui.views

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.JournalEntry
import com.example.aura.data.model.Task
import com.example.aura.ui.components.CalendarIcon
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun JournalView(
    journalEntries: List<JournalEntry>,
    completedTasks: List<Task>,
    theme: AuraThemeModel,
    bottomPadding: Dp,
    onSaveEntry: (JournalEntry) -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedDate by remember { mutableStateOf(LocalDate.now().toString()) }
    var entryContent by remember { mutableStateOf("") }
    var isSaved by remember { mutableStateOf(false) }
    var showDatePicker by remember { mutableStateOf(false) }

    LaunchedEffect(selectedDate, journalEntries) {
        val entry = journalEntries.find { it.date == selectedDate }
        entryContent = entry?.content ?: ""
    }

    val prompts = listOf(
        "What went well today?",
        "What am I grateful for?",
        "What was the biggest challenge?",
        "One thing I learned today is...",
        "How can I make tomorrow better?"
    )

    val tasksForDate = remember(completedTasks, selectedDate) {
        completedTasks.filter { it.completionDate == selectedDate }
    }

    val handleSave = {
        onSaveEntry(JournalEntry(date = selectedDate, content = entryContent))
        isSaved = true
    }

    LaunchedEffect(isSaved) {
        if (isSaved) {
            delay(2000)
            isSaved = false
        }
    }

    // Material 3 Date Picker Dialog
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = LocalDate.parse(selectedDate).atStartOfDay(ZoneId.systemDefault()).toInstant().toEpochMilli()
        )
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        selectedDate = Instant.ofEpochMilli(millis).atZone(ZoneId.systemDefault()).toLocalDate().toString()
                    }
                    showDatePicker = false
                }) {
                    Text("OK", color = theme.accentColor)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) {
                    Text("Cancel", color = theme.textSecondaryColor)
                }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 12.dp, bottom = bottomPadding + 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Daily Journal",
                color = theme.textPrimaryColor,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(10.dp))

            // Date selector button
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .clickable { showDatePicker = true }
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                CalendarIcon(modifier = Modifier.size(16.dp), tint = theme.accentColor)
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = LocalDate.parse(selectedDate).format(DateTimeFormatter.ofPattern("EEE, MMMM d, yyyy")),
                    color = theme.textPrimaryColor,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Prompts Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "Prompts",
                    color = theme.textPrimaryColor,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    prompts.forEach { prompt ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(theme.bgSecondaryColor)
                                .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                                .clickable {
                                    entryContent += (if (entryContent.isNotEmpty()) "\n\n" else "") + "**$prompt**\n"
                                }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = prompt,
                                color = theme.textSecondaryColor,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Journal Text Area
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .height(260.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                BasicTextField(
                    value = entryContent,
                    onValueChange = { entryContent = it },
                    modifier = Modifier.fillMaxSize(),
                    textStyle = TextStyle(
                        color = theme.textPrimaryColor,
                        fontSize = 15.sp,
                        lineHeight = 22.sp
                    ),
                    cursorBrush = SolidColor(theme.accentColor),
                    decorationBox = { innerTextField ->
                        if (entryContent.isEmpty()) {
                            Text(
                                text = "How was your day? What's on your mind?",
                                color = theme.textSecondaryColor.copy(alpha = 0.6f),
                                fontSize = 15.sp
                            )
                        }
                        innerTextField()
                    }
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Save row with "Saved!" indicator
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                AnimatedVisibility(visible = isSaved, enter = fadeIn(), exit = fadeOut()) {
                    Text(
                        text = "Saved!",
                        color = Color(0xFF34D399),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(end = 12.dp)
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(theme.accentColor)
                        .clickable { handleSave() }
                        .padding(horizontal = 24.dp, vertical = 10.dp)
                ) {
                    Text(
                        text = "Save",
                        color = Color.Black,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Completed on selected date
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "Completed on ${LocalDate.parse(selectedDate).format(DateTimeFormatter.ofPattern("MMM d"))}",
                    color = theme.textPrimaryColor,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(10.dp))
                if (tasksForDate.isEmpty()) {
                    Text(
                        text = "No tasks completed on this day.",
                        color = theme.textSecondaryColor,
                        fontSize = 13.5.sp
                    )
                } else {
                    tasksForDate.forEach { task ->
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(theme.bgSecondaryColor.copy(alpha = 0.6f))
                                .border(1.dp, theme.borderColor.copy(alpha = 0.4f), RoundedCornerShape(10.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = task.text,
                                color = theme.textPrimaryColor.copy(alpha = 0.85f),
                                fontSize = 13.5.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
