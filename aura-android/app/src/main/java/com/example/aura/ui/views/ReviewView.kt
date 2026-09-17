package com.example.aura.ui.views

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.Achievement
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.Task
import com.example.aura.data.model.UserStats
import com.example.aura.data.model.achievementsList
import com.example.aura.data.model.defaultCategoriesMap
import com.example.aura.ui.components.TrophyIcon
import com.example.aura.ui.components.XIcon
import java.time.LocalDate

@Composable
fun ReviewView(
    tasks: List<Task>,
    userStats: UserStats,
    unlockedAchievements: Set<String>,
    allCategories: Map<String, CategoryStyle>,
    theme: AuraThemeModel,
    bottomPadding: Dp,
    onDeleteStaleTask: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    val completedTasks = remember(tasks) { tasks.filter { it.completed && !it.completionDate.isNullOrEmpty() } }
    val totalCompleted = completedTasks.size.coerceAtLeast(1)

    // Category breakdown
    val categoryCounts = remember(completedTasks) {
        completedTasks.groupingBy { it.category }.eachCount().toList().sortedByDescending { it.second }
    }

    // Tag breakdown
    val tagCounts = remember(completedTasks) {
        completedTasks.flatMap { it.tags }.groupingBy { it }.eachCount().toList().sortedByDescending { it.second }.take(5)
    }

    // Stale tasks (> 14 days old and uncompleted)
    val staleTasks = remember(tasks) {
        val twoWeeksAgo = System.currentTimeMillis() - (14L * 24 * 60 * 60 * 1000)
        tasks.filter { !it.completed && it.id < twoWeeksAgo }
    }

    // 365 Days Heatmap
    val today = remember { LocalDate.now() }
    val heatmapDays = remember(completedTasks, today) {
        val map = completedTasks.groupingBy { it.completionDate ?: "" }.eachCount()
        val days = mutableListOf<Int>() // count for past 365 days
        for (i in 364 downTo 0) {
            val d = today.minusDays(i.toLong()).toString()
            days.add(map[d] ?: 0)
        }
        days
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 12.dp, bottom = bottomPadding + 36.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Your Review",
                color = theme.textPrimaryColor,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Reflect on your productivity and progress.",
                color = theme.textSecondaryColor,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
            )

            // Productivity Heatmap Card (exact match with Screenshot 4)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text(
                        text = "Productivity Heatmap",
                        color = theme.textPrimaryColor,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    // Grid of 52 weeks x 7 days
                    // Display compact rows
                    val columns = 28
                    val rows = 13
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        for (r in 0 until rows) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(3.dp)
                            ) {
                                for (c in 0 until columns) {
                                    val idx = r * columns + c
                                    val count = if (idx < heatmapDays.size) heatmapDays[idx] else 0
                                    val cellColor = when {
                                        count >= 4 -> theme.accentColor
                                        count >= 2 -> theme.accentColor.copy(alpha = 0.7f)
                                        count >= 1 -> theme.accentColor.copy(alpha = 0.4f)
                                        else -> theme.bgColor.copy(alpha = 0.8f)
                                    }
                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(9.dp)
                                            .clip(RoundedCornerShape(1.5.dp))
                                            .background(cellColor)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Current Streak Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(20.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Current Streak",
                        color = theme.textPrimaryColor,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "${userStats.streak}",
                        color = Color(0xFFFBBF24),
                        fontSize = 54.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (userStats.streak == 1) "day" else "days",
                        color = theme.textSecondaryColor,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Category Breakdown Card (exact match with Screenshot 4)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Category Breakdown",
                        color = theme.textPrimaryColor,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    if (categoryCounts.isEmpty()) {
                        Text(
                            text = "No completed tasks with categories yet.",
                            color = theme.textSecondaryColor,
                            fontSize = 13.5.sp
                        )
                    } else {
                        categoryCounts.forEach { (cat, count) ->
                            val catStyle = allCategories[cat] ?: defaultCategoriesMap["General"] ?: CategoryStyle(
                                name = "General",
                                bgHex = 0x4D64748B,
                                borderHex = 0x8094A3B8,
                                textHex = 0xFFE2E8F0,
                                solidHex = 0xFF475569,
                                glowHex = 0xFF94A3B8
                            )
                            val progress = (count.toFloat() / totalCompleted.toFloat()).coerceIn(0.05f, 1f)

                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = cat,
                                        color = theme.textPrimaryColor,
                                        fontSize = 13.5.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "$count tasks",
                                        color = theme.textSecondaryColor,
                                        fontSize = 12.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(theme.bgColor)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth(progress)
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp))
                                            .background(Color(catStyle.solidHex))
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Tag Breakdown Card
            if (tagCounts.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(theme.bgSecondaryColor)
                        .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Tag Breakdown",
                            color = theme.textPrimaryColor,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        tagCounts.forEach { (tag, count) ->
                            val progress = (count.toFloat() / totalCompleted.toFloat()).coerceIn(0.05f, 1f)
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(
                                        text = "@$tag",
                                        color = theme.textPrimaryColor,
                                        fontSize = 13.5.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = "$count tasks",
                                        color = theme.textSecondaryColor,
                                        fontSize = 12.sp
                                    )
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(6.dp)
                                        .clip(RoundedCornerShape(3.dp))
                                        .background(theme.bgColor)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth(progress)
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp))
                                            .background(Color(0xFFC084FC))
                                    )
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Unfinished Business (Stale Tasks)
            if (staleTasks.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(theme.bgSecondaryColor)
                        .border(1.dp, Color(0xFFF43F5E).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = "Unfinished Business",
                            color = theme.textPrimaryColor,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "These tasks were created over two weeks ago. Consider completing, rescheduling, or deleting them.",
                            color = theme.textSecondaryColor,
                            fontSize = 12.5.sp,
                            modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                        )
                        staleTasks.forEach { staleTask ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(theme.bgColor)
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = staleTask.text,
                                    color = theme.textPrimaryColor,
                                    fontSize = 13.sp,
                                    modifier = Modifier.weight(1f)
                                )
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .clickable { onDeleteStaleTask(staleTask.id) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    XIcon(modifier = Modifier.size(16.dp), tint = Color(0xFFF43F5E))
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Achievements Card (Now completely visible and scrollable!)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Text(
                        text = "Achievements",
                        color = theme.textPrimaryColor,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    val chunkedAchievements = achievementsList.chunked(2)
                    chunkedAchievements.forEach { rowAchs ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            rowAchs.forEach { ach ->
                                val isUnlocked = unlockedAchievements.contains(ach.id)
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isUnlocked) Color(0xFFF59E0B).copy(alpha = 0.15f) else Color(0xFF334155).copy(alpha = 0.4f))
                                        .border(
                                            1.dp,
                                            if (isUnlocked) Color(0xFFF59E0B).copy(alpha = 0.4f) else Color.Transparent,
                                            RoundedCornerShape(12.dp)
                                        )
                                        .padding(12.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        TrophyIcon(
                                            modifier = Modifier.size(28.dp),
                                            tint = if (isUnlocked) Color(0xFFFBBF24) else Color(0xFF64748B)
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = ach.title,
                                            color = theme.textPrimaryColor,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            textAlign = TextAlign.Center
                                        )
                                        Text(
                                            text = ach.description,
                                            color = theme.textSecondaryColor,
                                            fontSize = 11.sp,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                            if (rowAchs.size == 1) {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }
        }
    }
}
