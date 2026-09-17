package com.example.aura.ui.views

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.Task
import com.example.aura.data.model.Template
import com.example.aura.data.model.defaultCategoriesMap
import com.example.aura.ui.components.BookmarkIcon
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun ConstellationsView(
    tasks: List<Task>,
    templates: List<Template>,
    allCategories: Map<String, CategoryStyle>,
    theme: AuraThemeModel,
    bottomPadding: Dp,
    onToggleTask: (Long) -> Unit,
    onSaveTemplate: (String, List<Task>) -> Unit,
    modifier: Modifier = Modifier
) {
    val nonArchived = remember(tasks) { tasks.filter { !it.isArchived } }
    val grouped = remember(nonArchived) {
        nonArchived.groupBy { it.category }.toList()
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 12.dp, bottom = bottomPadding + 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Your Constellations",
                color = theme.textPrimaryColor,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "An overview of your projects and goals.",
                color = theme.textSecondaryColor,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
            )
        }

        items(grouped, key = { it.first }) { (category, catTasks) ->
            ConstellationProject(
                category = category,
                tasks = catTasks,
                templates = templates,
                allCategories = allCategories,
                theme = theme,
                onToggleTask = onToggleTask,
                onSaveTemplate = onSaveTemplate
            )
            Spacer(modifier = Modifier.height(36.dp))
        }
    }
}

@Composable
private fun ConstellationProject(
    category: String,
    tasks: List<Task>,
    templates: List<Template>,
    allCategories: Map<String, CategoryStyle>,
    theme: AuraThemeModel,
    onToggleTask: (Long) -> Unit,
    onSaveTemplate: (String, List<Task>) -> Unit
) {
    val isTemplated = templates.any { it.name.equals(category, ignoreCase = true) }
    val catStyle = allCategories[category] ?: defaultCategoriesMap["General"] ?: CategoryStyle(
        name = "General",
        bgHex = 0x4D64748B,
        borderHex = 0x8094A3B8,
        textHex = 0xFFE2E8F0,
        solidHex = 0xFF475569,
        glowHex = 0xFF94A3B8
    )

    val solidColor = Color(catStyle.solidHex)
    val glowColor = Color(catStyle.glowHex)

    val infiniteTransition = rememberInfiniteTransition(label = "aura_pulse")
    val pulse by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(2500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    var hoveredTaskText by remember { mutableStateOf<String?>(null) }

    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth()
    ) {
        // Save Template Button
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor, RoundedCornerShape(20.dp))
                .clickable(enabled = !isTemplated) { onSaveTemplate(category, tasks) }
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                BookmarkIcon(modifier = Modifier.size(13.dp), tint = theme.textSecondaryColor)
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isTemplated) "Saved" else "Save Template",
                    color = theme.textSecondaryColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Constellation Canvas with central node and surrounding task nodes
        val canvasSize = 260.dp
        Box(
            modifier = Modifier.size(canvasSize),
            contentAlignment = Alignment.Center
        ) {
            // Connecting Lines Canvas
            Canvas(modifier = Modifier.fillMaxSize()) {
                val center = Offset(size.width / 2f, size.height / 2f)
                val numTasks = tasks.size
                tasks.forEachIndexed { index, _ ->
                    val angle = (index.toFloat() / numTasks.coerceAtLeast(1).toFloat()) * 2f * Math.PI.toFloat()
                    val radius = (size.width * 0.40f) + ((index % 3) * 10f)
                    val nodeX = center.x + cos(angle) * radius
                    val nodeY = center.y + sin(angle) * radius
                    drawLine(
                        color = Color.White.copy(alpha = 0.18f),
                        start = center,
                        end = Offset(nodeX, nodeY),
                        strokeWidth = 1.5f
                    )
                }
            }

            // Central Category Circle with animated glow
            Box(
                modifier = Modifier
                    .size(92.dp * pulse)
                    .clip(CircleShape)
                    .background(glowColor.copy(alpha = 0.25f))
            )
            Box(
                modifier = Modifier
                    .size(86.dp)
                    .clip(CircleShape)
                    .background(solidColor)
                    .border(2.dp, Color.White.copy(alpha = 0.3f), CircleShape)
                    .shadow(12.dp, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = category,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(4.dp)
                )
            }

            // Surrounding Task Nodes
            val numTasks = tasks.size
            tasks.forEachIndexed { index, task ->
                val angle = (index.toFloat() / numTasks.coerceAtLeast(1).toFloat()) * 2f * Math.PI.toFloat()
                val radius = (105f + ((index % 3) * 8f)) // dp offset
                val offsetX = (cos(angle) * radius).dp
                val offsetY = (sin(angle) * radius).dp

                val nodeSize = when (task.priority) {
                    3 -> 20.dp
                    1 -> 14.dp
                    else -> 16.dp
                }

                Box(
                    modifier = Modifier
                        .offset(x = offsetX, y = offsetY)
                        .size(nodeSize)
                        .clip(CircleShape)
                        .background(if (task.completed) Color(0xFF2DD4BF) else Color.White.copy(alpha = 0.9f))
                        .border(1.dp, Color.White.copy(alpha = 0.5f), CircleShape)
                        .shadow(6.dp, CircleShape)
                        .clickable {
                            onToggleTask(task.id)
                            hoveredTaskText = task.text
                        }
                )
            }

            // Task title tooltip
            hoveredTaskText?.let { tText ->
                Box(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .offset(y = 28.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(theme.bgSecondaryColor)
                        .border(1.dp, theme.borderColor, RoundedCornerShape(8.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = tText,
                        color = theme.textPrimaryColor,
                        fontSize = 12.sp,
                        maxLines = 1
                    )
                }
            }
        }
    }
}
