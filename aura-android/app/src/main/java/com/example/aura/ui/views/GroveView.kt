package com.example.aura.ui.views

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
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.GroveTree
import com.example.aura.data.model.Task
import com.example.aura.data.model.defaultCategoriesMap
import com.example.aura.ui.components.QuoteIcon
import com.example.aura.ui.components.StarIcon
import java.time.LocalDate
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun GroveView(
    tasks: List<Task>,
    grove: List<GroveTree>,
    goldenSeeds: Int,
    allCategories: Map<String, CategoryStyle>,
    theme: AuraThemeModel,
    bottomPadding: Dp,
    onPlantSeed: () -> Unit,
    modifier: Modifier = Modifier
) {
    val wins = remember(tasks) { tasks.filter { !it.win.isNullOrEmpty() } }

    val currentMonth = remember { LocalDate.now().monthValue }
    val seasonGradient = remember(currentMonth) {
        when (currentMonth) {
            3, 4, 5 -> listOf(Color(0x33F472B6), Color(0x334ADE80)) // Spring: Pink to Green
            6, 7, 8 -> listOf(Color(0x3338BDF8), Color(0x33FACC15)) // Summer: Sky to Yellow
            9, 10, 11 -> listOf(Color(0x33FB923C), Color(0x33EF4444)) // Autumn: Orange to Red
            else -> listOf(Color(0x3360A5FA), Color(0x33818CF8)) // Winter: Blue to Indigo
        }
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(top = 12.dp, bottom = bottomPadding + 32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        item {
            Text(
                text = "Your Grove",
                color = theme.textPrimaryColor,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )
            Text(
                text = "A garden that grows with your efforts.",
                color = theme.textSecondaryColor,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
            )

            // Golden Seeds Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFFF59E0B).copy(alpha = 0.12f))
                    .border(1.dp, Color(0xFFF59E0B).copy(alpha = 0.35f), RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    StarIcon(modifier = Modifier.size(32.dp), tint = Color(0xFFFBBF24))
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Golden Seeds",
                            color = Color(0xFFFDE68A),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        val s = if (goldenSeeds == 1) "" else "s"
                        Text(
                            text = "You have $goldenSeeds seed$s. Plant one to grow something special.",
                            color = Color(0xFFFDE68A).copy(alpha = 0.8f),
                            fontSize = 12.5.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (goldenSeeds > 0) Color(0xFFFBBF24) else Color(0xFFFBBF24).copy(alpha = 0.4f))
                            .clickable(enabled = goldenSeeds > 0) { onPlantSeed() }
                            .padding(horizontal = 18.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "Plant",
                            color = Color.Black,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Seasonal Tree Garden Grid
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Brush.linearGradient(seasonGradient))
                    .border(1.dp, theme.borderColor.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                if (grove.isEmpty()) {
                    Text(
                        text = "Your grove is empty. Plant a golden seed to begin.",
                        color = theme.textSecondaryColor,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 36.dp)
                    )
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        val chunked = grove.chunked(3)
                        chunked.forEach { rowTrees ->
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                rowTrees.forEach { tree ->
                                    TreeCard(
                                        tree = tree,
                                        theme = theme,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                                for (empty in 0 until (3 - rowTrees.size)) {
                                    Spacer(modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Accomplishment Journal Heading
            Text(
                text = "Accomplishment Journal",
                color = theme.textPrimaryColor,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            )
        }

        // Accomplishment Wins List
        if (wins.isEmpty()) {
            item {
                Text(
                    text = "Complete high-priority tasks to record your wins here.",
                    color = theme.textSecondaryColor,
                    fontSize = 14.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp)
                )
            }
        } else {
            items(wins, key = { it.id }) { winTask ->
                val catStyle = allCategories[winTask.category] ?: defaultCategoriesMap["General"] ?: CategoryStyle(
                    name = "General",
                    bgHex = 0x4D64748B,
                    borderHex = 0x8094A3B8,
                    textHex = 0xFFE2E8F0,
                    solidHex = 0xFF475569,
                    glowHex = 0xFF94A3B8
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 6.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(catStyle.bgHex))
                        .border(1.dp, Color(catStyle.borderHex), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text(
                            text = winTask.text,
                            color = theme.textPrimaryColor,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(verticalAlignment = Alignment.Top) {
                            QuoteIcon(modifier = Modifier.size(16.dp), tint = theme.textSecondaryColor)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = winTask.win ?: "",
                                color = theme.textPrimaryColor.copy(alpha = 0.85f),
                                fontSize = 13.5.sp,
                                fontStyle = FontStyle.Italic
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TreeCard(tree: GroveTree, theme: AuraThemeModel, modifier: Modifier = Modifier) {
    val growthRatio = (tree.growthPoints.toFloat() / tree.maxGrowth.toFloat()).coerceIn(0.1f, 1f)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(theme.bgSecondaryColor.copy(alpha = 0.7f))
            .border(1.dp, theme.borderColor.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(modifier = Modifier.size(72.dp)) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    when (tree.type) {
                        "pine" -> drawPineTree(growthRatio, theme.textPrimaryColor)
                        "cherry" -> drawCherryBlossomTree(growthRatio, theme.textPrimaryColor)
                        else -> drawOakTree(growthRatio, theme.textPrimaryColor)
                    }
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "${tree.type.replaceFirstChar { it.uppercase() }} Tree",
                color = theme.textSecondaryColor,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

private fun DrawScope.drawOakTree(growth: Float, color: Color) {
    val w = size.width
    val h = size.height
    val trunkHeight = h * (0.18f + growth * 0.42f)
    val startY = h * 0.9f
    val endY = startY - trunkHeight

    // Trunk
    drawLine(color, Offset(w * 0.5f, startY), Offset(w * 0.5f, endY), strokeWidth = 3f, cap = StrokeCap.Round)

    // Oak foliage crown at top (always visible so saplings look alive!)
    val crownRadius = 7f + growth * 11f
    drawCircle(Color(0xFF4ADE80).copy(alpha = 0.85f), radius = crownRadius, center = Offset(w * 0.5f, endY))
    drawCircle(Color(0xFF22C55E).copy(alpha = 0.7f), radius = crownRadius * 0.8f, center = Offset(w * 0.5f - 3f, endY - 2f))
    drawCircle(Color(0xFF86EFAC).copy(alpha = 0.6f), radius = crownRadius * 0.6f, center = Offset(w * 0.5f + 3f, endY + 2f))

    // Branches
    val branchLevels = listOf(0.3f, 0.5f, 0.7f, 0.85f)
    branchLevels.forEachIndexed { i, level ->
        if (growth > level) {
            val by = startY - trunkHeight * level
            val bLen = w * 0.22f * ((growth - level) / (1f - level))
            val angle = if (i % 2 == 0) -35f else 35f
            val rad = angle * (Math.PI / 180f).toFloat()
            val ex = w * 0.5f + sin(rad) * bLen
            val ey = by - cos(rad) * bLen
            drawLine(color, Offset(w * 0.5f, by), Offset(ex, ey), strokeWidth = 2f, cap = StrokeCap.Round)
            // Foliage node
            drawCircle(Color(0xFF4ADE80).copy(alpha = 0.75f), radius = 5f * growth + 3f, center = Offset(ex, ey))
        }
    }
}

private fun DrawScope.drawPineTree(growth: Float, color: Color) {
    val w = size.width
    val h = size.height
    val trunkHeight = h * (0.2f + growth * 0.5f)
    val startY = h * 0.9f
    val endY = startY - trunkHeight

    // Trunk
    drawLine(color, Offset(w * 0.5f, startY), Offset(w * 0.5f, endY), strokeWidth = 3f, cap = StrokeCap.Round)

    // Top sapling crown triangle (always visible so young pines have a recognizable silhouette)
    val topWidth = 8f + growth * 10f
    val topHeight = 12f + growth * 8f
    val topPinePath = Path().apply {
        moveTo(w * 0.5f, endY - topHeight * 0.5f)
        lineTo(w * 0.5f + topWidth, endY + topHeight * 0.5f)
        lineTo(w * 0.5f - topWidth, endY + topHeight * 0.5f)
        close()
    }
    drawPath(topPinePath, color = Color(0xFF16A34A).copy(alpha = 0.9f))

    // Pine triangular layers
    val layers = listOf(0.3f to 0.35f, 0.6f to 0.28f, 0.85f to 0.20f)
    layers.forEach { (yLevel, widthRatio) ->
        if (growth > yLevel) {
            val layerY = startY - trunkHeight * yLevel
            val layerWidth = w * widthRatio * growth
            val pinePath = Path().apply {
                moveTo(w * 0.5f, layerY - 14f)
                lineTo(w * 0.5f + layerWidth, layerY)
                lineTo(w * 0.5f - layerWidth, layerY)
                close()
            }
            drawPath(pinePath, color = Color(0xFF16A34A).copy(alpha = 0.8f))
        }
    }
}

private fun DrawScope.drawCherryBlossomTree(growth: Float, color: Color) {
    val w = size.width
    val h = size.height
    val trunkHeight = h * (0.2f + growth * 0.4f)
    val startY = h * 0.9f
    val endY = startY - trunkHeight

    // Trunk
    drawLine(color, Offset(w * 0.5f, startY), Offset(w * 0.5f, endY), strokeWidth = 2.5f, cap = StrokeCap.Round)

    // Blossom cluster at crown (always visible)
    val crownRadius = 6f + growth * 6f
    drawCircle(Color(0xFFFECDD3), radius = crownRadius, center = Offset(w * 0.5f, endY))
    drawCircle(Color(0xFFF472B6), radius = crownRadius * 0.7f, center = Offset(w * 0.5f + 3f, endY - 2f))
    drawCircle(Color(0xFFFB7185).copy(alpha = 0.7f), radius = crownRadius * 0.5f, center = Offset(w * 0.5f - 2f, endY + 2f))

    // Branches & Blossoms
    val branches = listOf(
        Triple(0.35f, -40f, w * 0.25f),
        Triple(0.50f, 40f, w * 0.25f),
        Triple(0.70f, -55f, w * 0.18f),
        Triple(0.80f, 55f, w * 0.18f)
    )
    branches.forEach { (level, angle, len) ->
        if (growth > level) {
            val by = startY - trunkHeight * level
            val bLen = len * ((growth - level) / (1f - level))
            val rad = angle * (Math.PI / 180f).toFloat()
            val ex = w * 0.5f + sin(rad) * bLen
            val ey = by - cos(rad) * bLen
            drawLine(color, Offset(w * 0.5f, by), Offset(ex, ey), strokeWidth = 1.8f, cap = StrokeCap.Round)
            // Pink cherry blossoms!
            drawCircle(Color(0xFFFECDD3), radius = 5f, center = Offset(ex, ey))
            drawCircle(Color(0xFFF472B6), radius = 3.5f, center = Offset(ex + 4f, ey - 3f))
        }
    }
}
