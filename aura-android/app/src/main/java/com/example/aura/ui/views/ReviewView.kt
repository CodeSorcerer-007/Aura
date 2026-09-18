package com.example.aura.ui.views

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private data class HeatmapDay(
    val date: LocalDate,
    val count: Int,
    val isToday: Boolean,
    val isFuture: Boolean
)

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
    val categoryCounts = remember(completedTasks) {
        completedTasks.groupingBy { it.category }.eachCount().toList().sortedByDescending { it.second }
    }
    val tagCounts = remember(completedTasks) {
        completedTasks.flatMap { it.tags }.groupingBy { it }.eachCount().toList().sortedByDescending { it.second }
    }
    val totalCompleted = remember(completedTasks) { completedTasks.size }

    // Stale tasks: uncompleted tasks created more than 14 days ago
    val staleTasks = remember(tasks) {
        val twoWeeksAgo = System.currentTimeMillis() - (14L * 24 * 60 * 60 * 1000)
        tasks.filter { !it.completed && it.id < twoWeeksAgo }
    }

    // GitHub-style 53 Weeks x 7 Days Contribution Heatmap
    val today = remember { LocalDate.now() }
    val todayDayOfWeekIndex = remember(today) {
        if (today.dayOfWeek == DayOfWeek.SUNDAY) 0 else today.dayOfWeek.value
    }
    val currentWeekSunday = remember(today, todayDayOfWeekIndex) {
        today.minusDays(todayDayOfWeekIndex.toLong())
    }
    val totalWeeks = 53
    val startSunday = remember(currentWeekSunday) {
        currentWeekSunday.minusWeeks((totalWeeks - 1).toLong())
    }

    val completedCountMap = remember(completedTasks) {
        completedTasks.groupingBy { it.completionDate ?: "" }.eachCount()
    }

    val weeksData = remember(completedCountMap, today, startSunday) {
        val list = mutableListOf<List<HeatmapDay>>()
        for (w in 0 until totalWeeks) {
            val weekSunday = startSunday.plusWeeks(w.toLong())
            val daysInWeek = mutableListOf<HeatmapDay>()
            for (d in 0 until 7) {
                val cellDate = weekSunday.plusDays(d.toLong())
                val isFuture = cellDate.isAfter(today)
                val isToday = cellDate == today
                val count = if (isFuture) 0 else (completedCountMap[cellDate.toString()] ?: 0)
                daysInWeek.add(HeatmapDay(cellDate, count, isToday, isFuture))
            }
            list.add(daysInWeek)
        }
        list
    }

    val monthLabels = remember(weeksData) {
        var lastMonth = -1
        weeksData.map { week ->
            val firstDay = week.first().date
            val firstOfMonthDay = week.find { it.date.dayOfMonth == 1 }?.date
            val targetDate = firstOfMonthDay ?: if (firstDay.monthValue != lastMonth) firstDay else null
            if (targetDate != null && targetDate.monthValue != lastMonth) {
                lastMonth = targetDate.monthValue
                targetDate.format(DateTimeFormatter.ofPattern("MMM"))
            } else {
                ""
            }
        }
    }

    var selectedDay by remember {
        mutableStateOf<HeatmapDay?>(
            weeksData.lastOrNull()?.find { it.isToday }
        )
    }

    val heatmapScrollState = rememberScrollState()
    LaunchedEffect(Unit) {
        heatmapScrollState.scrollTo(heatmapScrollState.maxValue)
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 8.dp, bottom = bottomPadding + 40.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Your Review",
                color = theme.textPrimaryColor,
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "Reflect on your productivity and progress.",
                color = theme.textSecondaryColor,
                fontSize = 13.5.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 2.dp, bottom = 14.dp)
            )

            // Productivity Heatmap Card (Faithful GitHub-Style Activity Grid)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(theme.bgSecondaryColor)
                    .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Productivity Heatmap",
                            color = theme.textPrimaryColor,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$totalCompleted completed",
                            color = theme.textSecondaryColor,
                            fontSize = 12.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Heatmap Area: Weekday labels on left + Horizontally scrollable 53 weeks
                    Row(modifier = Modifier.fillMaxWidth()) {
                        // Fixed Day of Week Labels (Mon, Wed, Fri)
                        Column(
                            modifier = Modifier
                                .width(22.dp)
                                .padding(top = 16.dp), // offset for month header
                            verticalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            listOf("", "M", "", "W", "", "F", "").forEach { label ->
                                Box(
                                    modifier = Modifier
                                        .size(10.dp),
                                    contentAlignment = Alignment.CenterStart
                                ) {
                                    if (label.isNotEmpty()) {
                                        Text(
                                            text = label,
                                            color = theme.textSecondaryColor.copy(alpha = 0.65f),
                                            fontSize = 8.5.sp,
                                            fontWeight = FontWeight.Medium,
                                            lineHeight = 10.sp
                                        )
                                    }
                                }
                            }
                        }

                        // Horizontally scrollable 53 week columns
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .horizontalScroll(heatmapScrollState)
                        ) {
                            Column {
                                // Month labels row
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(3.dp),
                                    modifier = Modifier.padding(bottom = 3.dp)
                                ) {
                                    monthLabels.forEach { label ->
                                        Box(
                                            modifier = Modifier.width(10.dp),
                                            contentAlignment = Alignment.CenterStart
                                        ) {
                                            if (label.isNotEmpty()) {
                                                Text(
                                                    text = label,
                                                    color = theme.textSecondaryColor.copy(alpha = 0.75f),
                                                    fontSize = 8.5.sp,
                                                    fontWeight = FontWeight.SemiBold,
                                                    maxLines = 1,
                                                    softWrap = false
                                                )
                                            }
                                        }
                                    }
                                }

                                // 53 Week Columns x 7 Days
                                Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                                    weeksData.forEach { week ->
                                        Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                            week.forEach { day ->
                                                if (day.isFuture) {
                                                    Box(modifier = Modifier.size(10.dp))
                                                } else {
                                                    val cellColor = when {
                                                        day.count >= 4 -> theme.accentColor
                                                        day.count >= 3 -> theme.accentColor.copy(alpha = 0.85f)
                                                        day.count >= 2 -> theme.accentColor.copy(alpha = 0.60f)
                                                        day.count >= 1 -> theme.accentColor.copy(alpha = 0.35f)
                                                        else -> theme.bgColor.copy(alpha = 0.85f)
                                                    }

                                                    val isDaySelected = selectedDay?.date == day.date
                                                    val borderModifier = when {
                                                        day.isToday -> Modifier.border(
                                                            width = 1.5.dp,
                                                            color = theme.accentColor,
                                                            shape = RoundedCornerShape(2.dp)
                                                        )
                                                        isDaySelected -> Modifier.border(
                                                            width = 1.dp,
                                                            color = theme.textPrimaryColor,
                                                            shape = RoundedCornerShape(2.dp)
                                                        )
                                                        day.count == 0 -> Modifier.border(
                                                            width = 0.5.dp,
                                                            color = theme.borderColor.copy(alpha = 0.25f),
                                                            shape = RoundedCornerShape(2.dp)
                                                        )
                                                        else -> Modifier
                                                    }

                                                    Box(
                                                        modifier = Modifier
                                                            .size(10.dp)
                                                            .clip(RoundedCornerShape(2.dp))
                                                            .background(cellColor)
                                                            .then(borderModifier)
                                                            .clickable { selectedDay = day }
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Heatmap Footer: Interactive Day Info + Less/More Legend
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val activeDay = selectedDay ?: weeksData.lastOrNull()?.find { it.isToday }
                        val dateFormatted = activeDay?.date?.format(DateTimeFormatter.ofPattern("EEE, MMM d")) ?: "Today"
                        val count = activeDay?.count ?: 0
                        val isTodayTag = if (activeDay?.isToday == true) " (Today)" else ""

                        Text(
                            text = if (count == 0) "No tasks on $dateFormatted$isTodayTag" else "$count task${if (count > 1) "s" else ""} on $dateFormatted$isTodayTag",
                            color = theme.textSecondaryColor,
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium
                        )

                        // GitHub Style Legend
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Text(
                                text = "Less",
                                color = theme.textSecondaryColor.copy(alpha = 0.7f),
                                fontSize = 10.sp
                            )
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(1.5.dp))
                                    .background(theme.bgColor.copy(alpha = 0.85f))
                                    .border(0.5.dp, theme.borderColor.copy(alpha = 0.25f), RoundedCornerShape(1.5.dp))
                            )
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(1.5.dp))
                                    .background(theme.accentColor.copy(alpha = 0.35f))
                            )
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(1.5.dp))
                                    .background(theme.accentColor.copy(alpha = 0.60f))
                            )
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(1.5.dp))
                                    .background(theme.accentColor.copy(alpha = 0.85f))
                            )
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(RoundedCornerShape(1.5.dp))
                                    .background(theme.accentColor)
                            )
                            Text(
                                text = "More",
                                color = theme.textSecondaryColor.copy(alpha = 0.7f),
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

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
                        val safeTotal = if (totalCompleted > 0) totalCompleted.toFloat() else 1f
                        categoryCounts.forEach { (cat, count) ->
                            val catStyle = allCategories[cat] ?: defaultCategoriesMap["General"] ?: CategoryStyle(
                                name = "General",
                                bgHex = 0x4D64748B,
                                borderHex = 0x8094A3B8,
                                textHex = 0xFFE2E8F0,
                                solidHex = 0xFF475569,
                                glowHex = 0xFF94A3B8
                            )
                            val progress = (count.toFloat() / safeTotal).coerceIn(0.05f, 1f)

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

                        val safeTotal = if (totalCompleted > 0) totalCompleted.toFloat() else 1f
                        tagCounts.forEach { (tag, count) ->
                            val progress = (count.toFloat() / safeTotal).coerceIn(0.05f, 1f)
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
