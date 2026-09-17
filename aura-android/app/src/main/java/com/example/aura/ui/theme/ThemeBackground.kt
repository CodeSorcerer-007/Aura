package com.example.aura.ui.theme

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import com.example.aura.data.model.AuraThemeModel
import java.util.Random
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun ThemeBackground(theme: AuraThemeModel, modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition(label = "theme_anim")
    val animProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 10000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "progress"
    )
    val pulseProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Box(modifier = modifier.fillMaxSize()) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            // Base background
            drawRect(color = theme.bgColor)

            when (theme.id) {
                "dark" -> drawDarkTheme(pulseProgress, theme.accentColor)
                "light" -> drawLightTheme(animProgress)
                "cyberpunk" -> drawCyberpunkTheme(animProgress, theme.accentColor, theme.borderColor)
                "crimson" -> drawCrimsonTheme(animProgress, pulseProgress, theme.accentColor)
                "forest" -> drawForestTheme(animProgress, pulseProgress, theme.accentColor)
                "ocean" -> drawOceanTheme(animProgress, theme.accentColor, theme.textSecondaryColor)
                "dune" -> drawDuneTheme(animProgress, theme.textSecondaryColor)
                "sakura" -> drawSakuraTheme(animProgress)
                "solarized" -> drawSolarizedTheme(animProgress, theme.accentColor, theme.borderColor)
                "dracula" -> drawDraculaTheme(animProgress, pulseProgress)
                "nord" -> drawNordTheme(animProgress, theme.accentColor, theme.textSecondaryColor)
                "gruvbox" -> drawGruvboxTheme(animProgress, theme.borderColor)
                "monokai" -> drawMonokaiTheme(animProgress, theme.accentColor)
                "rose_pine" -> drawRosePineTheme(animProgress, pulseProgress, theme.accentColor)
                "matcha" -> drawMatchaTheme(animProgress, theme.accentColor, theme.borderColor)
                "latte" -> drawLatteTheme(animProgress, theme.borderColor)
                else -> {
                    // Custom or fallback: soft ambient glow
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(theme.accentColor.copy(alpha = 0.08f), Color.Transparent),
                            center = Offset(size.width * 0.5f, size.height * 0.3f),
                            radius = size.width * 0.7f
                        )
                    )
                }
            }
        }
    }
}

// 1. Dark: Pulse Aura Glow
private fun DrawScope.drawDarkTheme(pulse: Float, accent: Color) {
    val alpha = 0.04f + pulse * 0.06f
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(accent.copy(alpha = alpha), Color.Transparent),
            center = Offset(size.width * 0.5f, size.height * 0.2f),
            radius = size.width * (0.8f + pulse * 0.2f)
        )
    )
}

// 2. Light: Rotating Sun Rays
private fun DrawScope.drawLightTheme(progress: Float) {
    val center = Offset(size.width * 0.5f, size.height * 0.2f)
    rotate(degrees = progress * 360f, pivot = center) {
        val numRays = 12
        for (i in 0 until numRays) {
            val angle = (i * 360f / numRays) * (Math.PI / 180f).toFloat()
            val rayLength = size.width * 1.5f
            val endX = center.x + cos(angle) * rayLength
            val endY = center.y + sin(angle) * rayLength
            drawLine(
                color = Color(0xFFFDE047).copy(alpha = 0.05f),
                start = center,
                end = Offset(endX, endY),
                strokeWidth = 30f
            )
        }
    }
}

// 3. Cyberpunk: Matrix Code Rain & Grid
private fun DrawScope.drawCyberpunkTheme(progress: Float, accent: Color, border: Color) {
    // Grid
    val gridSize = 60f
    var x = 0f
    while (x < size.width) {
        drawLine(border.copy(alpha = 0.12f), Offset(x, 0f), Offset(x, size.height), strokeWidth = 1f)
        x += gridSize
    }
    var y = 0f
    while (y < size.height) {
        drawLine(border.copy(alpha = 0.12f), Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        y += gridSize
    }
    // Rain particles
    val rand = Random(42)
    for (i in 0 until 20) {
        val colX = (i.toFloat() / 20f) * size.width
        val speed = 0.5f + rand.nextFloat() * 0.5f
        val particleY = ((progress * speed + rand.nextFloat()) % 1f) * size.height
        drawCircle(accent.copy(alpha = 0.5f), radius = 2.5f, center = Offset(colX, particleY))
        drawLine(
            brush = Brush.verticalGradient(
                colors = listOf(Color.Transparent, accent.copy(alpha = 0.3f)),
                startY = particleY - 30f,
                endY = particleY
            ),
            start = Offset(colX, particleY - 30f),
            end = Offset(colX, particleY),
            strokeWidth = 2f
        )
    }
}

// 4. Crimson: Mist and Rising Embers
private fun DrawScope.drawCrimsonTheme(progress: Float, pulse: Float, accent: Color) {
    // Radial mist
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(accent.copy(alpha = 0.15f + pulse * 0.1f), Color.Transparent),
            center = Offset(size.width * 0.5f, size.height * 0.8f),
            radius = size.width * 0.9f
        )
    )
    // Embers
    val rand = Random(101)
    for (i in 0 until 18) {
        val emberX = rand.nextFloat() * size.width
        val speed = 0.6f + rand.nextFloat() * 0.8f
        val emberY = size.height - (((progress * speed + rand.nextFloat()) % 1f) * size.height)
        val alpha = (1f - (size.height - emberY) / size.height).coerceIn(0.1f, 0.8f)
        drawCircle(Color(0xFFFFCA28).copy(alpha = alpha), radius = 2.5f, center = Offset(emberX, emberY))
    }
}

// 5. Forest: Fireflies and Forest Trees
private fun DrawScope.drawForestTheme(progress: Float, pulse: Float, accent: Color) {
    // Trees silhouette at bottom
    val treePath = Path().apply {
        moveTo(0f, size.height)
        var curX = 0f
        val step = size.width / 8f
        while (curX <= size.width) {
            lineTo(curX + step * 0.5f, size.height - 120f)
            lineTo(curX + step, size.height)
            curX += step
        }
        close()
    }
    drawPath(treePath, color = Color(0xFF071F0D))

    // Fireflies
    val rand = Random(88)
    for (i in 0 until 14) {
        val driftX = (rand.nextFloat() * size.width + sin((progress + i) * 6.28f) * 30f).coerceIn(0f, size.width)
        val driftY = (rand.nextFloat() * (size.height * 0.7f) + cos((progress + i) * 6.28f) * 20f).coerceIn(0f, size.height)
        val blink = (sin((progress * 4f + i) * 3.14f) + 1f) / 2f
        drawCircle(Color(0xFFFDE047).copy(alpha = blink * 0.7f), radius = 3.5f, center = Offset(driftX, driftY))
    }
}

// 6. Ocean: Waves and Bubbles
private fun DrawScope.drawOceanTheme(progress: Float, accent: Color, textSec: Color) {
    // Wave 1
    val wavePath = Path().apply {
        moveTo(0f, size.height)
        var x = 0f
        while (x <= size.width) {
            val y = size.height - 180f + sin((x / size.width * 2f * Math.PI + progress * 2f * Math.PI).toFloat()) * 30f
            lineTo(x, y)
            x += 20f
        }
        lineTo(size.width, size.height)
        close()
    }
    drawPath(wavePath, color = accent.copy(alpha = 0.08f))

    // Bubbles
    val rand = Random(55)
    for (i in 0 until 15) {
        val bx = rand.nextFloat() * size.width
        val speed = 0.4f + rand.nextFloat() * 0.6f
        val by = size.height - (((progress * speed + rand.nextFloat()) % 1f) * size.height)
        drawCircle(color = textSec.copy(alpha = 0.25f), radius = 4f + rand.nextFloat() * 5f, center = Offset(bx, by), style = Stroke(1.5f))
    }
}

// 7. Dune: Sand Sweep
private fun DrawScope.drawDuneTheme(progress: Float, textSec: Color) {
    val rand = Random(33)
    for (i in 0 until 35) {
        val speed = 0.8f + rand.nextFloat() * 1.2f
        val sx = (((progress * speed + rand.nextFloat()) % 1f) * (size.width + 100f)) - 50f
        val sy = rand.nextFloat() * size.height
        drawLine(
            color = textSec.copy(alpha = 0.15f),
            start = Offset(sx, sy),
            end = Offset(sx + 15f, sy + 3f),
            strokeWidth = 1.5f
        )
    }
}

// 8. Sakura: Falling Cherry Petals
private fun DrawScope.drawSakuraTheme(progress: Float) {
    val rand = Random(77)
    for (i in 0 until 20) {
        val speed = 0.4f + rand.nextFloat() * 0.6f
        val py = (((progress * speed + rand.nextFloat()) % 1f) * (size.height + 60f)) - 30f
        val sway = sin((progress * 3f + i) * 6.28f) * 40f
        val px = (rand.nextFloat() * size.width + sway).coerceIn(0f, size.width)
        drawCircle(Color(0xFFFECDD3).copy(alpha = 0.65f), radius = 5f, center = Offset(px, py))
    }
}

// 9. Solarized: Blueprint Grid and Traces
private fun DrawScope.drawSolarizedTheme(progress: Float, accent: Color, border: Color) {
    val gridSize = 80f
    var x = 0f
    while (x < size.width) {
        drawLine(border.copy(alpha = 0.15f), Offset(x, 0f), Offset(x, size.height), strokeWidth = 1f)
        x += gridSize
    }
    var y = 0f
    while (y < size.height) {
        drawLine(border.copy(alpha = 0.15f), Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
        y += gridSize
    }
    // Traces
    val path = Path().apply {
        moveTo(0f, size.height * 0.2f)
        lineTo(size.width * 0.4f, size.height * 0.2f)
        lineTo(size.width * 0.4f, size.height * 0.6f)
        lineTo(size.width, size.height * 0.6f)
    }
    drawPath(path, color = accent.copy(alpha = 0.25f), style = Stroke(width = 2f))
}

// 10. Dracula: Moon & Fog
private fun DrawScope.drawDraculaTheme(progress: Float, pulse: Float) {
    // Moon
    val moonCenter = Offset(size.width * 0.82f, size.height * 0.15f)
    drawCircle(
        color = Color(0xFFF1FA8C).copy(alpha = 0.15f + pulse * 0.05f),
        radius = 55f,
        center = moonCenter
    )
    drawCircle(
        color = Color(0xFFF1FA8C),
        radius = 35f,
        center = moonCenter
    )
    // Bats
    val rand = Random(99)
    for (i in 0 until 4) {
        val bx = (((progress * 0.7f + i * 0.25f) % 1f) * (size.width + 80f)) - 40f
        val by = size.height * (0.25f + i * 0.12f) + sin((progress * 4f + i) * 6.28f) * 15f
        val wing = Path().apply {
            moveTo(bx - 10f, by)
            lineTo(bx, by - 6f)
            lineTo(bx + 10f, by)
            lineTo(bx, by + 4f)
            close()
        }
        drawPath(wing, color = Color.Black.copy(alpha = 0.6f))
    }
}

// 11. Nord: Aurora & Snow
private fun DrawScope.drawNordTheme(progress: Float, accent: Color, textSec: Color) {
    // Aurora sweep
    val sweep = sin(progress * 6.28f) * 50f
    drawRect(
        brush = Brush.verticalGradient(
            colors = listOf(accent.copy(alpha = 0.15f), textSec.copy(alpha = 0.05f), Color.Transparent),
            startY = 0f,
            endY = size.height * 0.45f + sweep
        )
    )
    // Snow flakes
    val rand = Random(12)
    for (i in 0 until 35) {
        val speed = 0.3f + rand.nextFloat() * 0.5f
        val sy = (((progress * speed + rand.nextFloat()) % 1f) * size.height)
        val sx = (rand.nextFloat() * size.width + sin((progress + i) * 3f) * 10f).coerceIn(0f, size.width)
        drawCircle(textSec.copy(alpha = 0.4f), radius = 2f + rand.nextFloat() * 2f, center = Offset(sx, sy))
    }
}

// 12. Gruvbox: Industrial Gears & Grid
private fun DrawScope.drawGruvboxTheme(progress: Float, border: Color) {
    val gearCenter = Offset(size.width * 0.85f, size.height * 0.2f)
    rotate(degrees = progress * 360f, pivot = gearCenter) {
        drawCircle(border.copy(alpha = 0.18f), radius = 60f, center = gearCenter, style = Stroke(width = 8f))
        for (i in 0 until 8) {
            val angle = (i * 45f) * (Math.PI / 180f).toFloat()
            val gx = gearCenter.x + cos(angle) * 65f
            val gy = gearCenter.y + sin(angle) * 65f
            drawCircle(border.copy(alpha = 0.2f), radius = 8f, center = Offset(gx, gy))
        }
    }
}

// 13. Monokai: Scanlines
private fun DrawScope.drawMonokaiTheme(progress: Float, accent: Color) {
    var y = 0f
    while (y < size.height) {
        drawLine(Color.Black.copy(alpha = 0.2f), Offset(0f, y), Offset(size.width, y), strokeWidth = 2f)
        y += 6f
    }
}

// 14. Rosé Pine: Starfield & Nebula
private fun DrawScope.drawRosePineTheme(progress: Float, pulse: Float, accent: Color) {
    // Nebula
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(accent.copy(alpha = 0.12f + pulse * 0.06f), Color.Transparent),
            center = Offset(size.width * 0.3f, size.height * 0.4f),
            radius = size.width * 0.8f
        )
    )
    // Twinkling stars
    val rand = Random(44)
    for (i in 0 until 40) {
        val sx = rand.nextFloat() * size.width
        val sy = rand.nextFloat() * size.height
        val twinkle = (sin((progress * 8f + i * 2f)) + 1f) / 2f
        drawCircle(Color.White.copy(alpha = 0.15f + twinkle * 0.6f), radius = 1.5f + rand.nextFloat() * 1.5f, center = Offset(sx, sy))
    }
}

// 15. Matcha: Water Ripples
private fun DrawScope.drawMatchaTheme(progress: Float, accent: Color, border: Color) {
    val center = Offset(size.width * 0.5f, size.height * 0.4f)
    for (i in 0 until 3) {
        val ringProgress = ((progress + i * 0.33f) % 1f)
        val radius = ringProgress * size.width * 0.7f
        val alpha = (1f - ringProgress) * 0.3f
        drawCircle(accent.copy(alpha = alpha), radius = radius, center = center, style = Stroke(width = 2f))
    }
}

// 16. Latte: Rising Steam
private fun DrawScope.drawLatteTheme(progress: Float, border: Color) {
    val rand = Random(66)
    for (i in 0 until 8) {
        val speed = 0.3f + rand.nextFloat() * 0.4f
        val sy = size.height - (((progress * speed + rand.nextFloat()) % 1f) * (size.height * 0.8f))
        val sx = size.width * 0.5f + sin((progress * 3f + i) * 3.14f) * 40f
        drawCircle(border.copy(alpha = 0.1f), radius = 25f + rand.nextFloat() * 20f, center = Offset(sx, sy))
    }
}
