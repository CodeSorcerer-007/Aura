package com.example.aura.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

@Composable
fun SunIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawCircle(color = tint, radius = w * 0.2f, center = Offset(w * 0.5f, h * 0.5f), style = stroke)
        // Rays
        drawLine(tint, Offset(w * 0.5f, h * 0.08f), Offset(w * 0.5f, h * 0.17f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.5f, h * 0.83f), Offset(w * 0.5f, h * 0.92f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.08f, h * 0.5f), Offset(w * 0.17f, h * 0.5f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.83f, h * 0.5f), Offset(w * 0.92f, h * 0.5f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.2f, h * 0.2f), Offset(w * 0.27f, h * 0.27f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.73f, h * 0.73f), Offset(w * 0.8f, h * 0.8f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.2f, h * 0.8f), Offset(w * 0.27f, h * 0.73f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.73f, h * 0.27f), Offset(w * 0.8f, h * 0.2f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun MoonIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(size.width * 0.87f, size.height * 0.53f)
            cubicTo(
                size.width * 0.82f, size.height * 0.8f,
                size.width * 0.55f, size.height * 0.95f,
                size.width * 0.35f, size.height * 0.85f
            )
            cubicTo(
                size.width * 0.15f, size.height * 0.75f,
                size.width * 0.1f, size.height * 0.45f,
                size.width * 0.3f, size.height * 0.25f
            )
            cubicTo(
                size.width * 0.4f, size.height * 0.15f,
                size.width * 0.55f, size.height * 0.12f,
                size.width * 0.6f, size.height * 0.13f
            )
            cubicTo(
                size.width * 0.45f, size.height * 0.25f,
                size.width * 0.45f, size.height * 0.55f,
                size.width * 0.87f, size.height * 0.53f
            )
            close()
        }
        drawPath(path, color = tint, style = stroke)
    }
}

@Composable
fun SunsetIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawLine(tint, Offset(w * 0.5f, h * 0.42f), Offset(w * 0.5f, h * 0.08f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.08f, h * 0.75f), Offset(w * 0.17f, h * 0.75f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.83f, h * 0.75f), Offset(w * 0.92f, h * 0.75f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.08f, h * 0.92f), Offset(w * 0.92f, h * 0.92f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        val sunPath = Path().apply {
            moveTo(w * 0.67f, h * 0.75f)
            cubicTo(w * 0.67f, h * 0.58f, w * 0.33f, h * 0.58f, w * 0.33f, h * 0.75f)
        }
        drawPath(sunPath, tint, style = stroke)
    }
}

@Composable
fun PlusIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round)
        val w = size.width
        val h = size.height
        drawLine(tint, Offset(w * 0.2f, h * 0.5f), Offset(w * 0.8f, h * 0.5f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.5f, h * 0.2f), Offset(w * 0.5f, h * 0.8f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun CheckIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(size.width * 0.18f, size.height * 0.52f)
            lineTo(size.width * 0.42f, size.height * 0.74f)
            lineTo(size.width * 0.84f, size.height * 0.26f)
        }
        drawPath(path, color = tint, style = stroke)
    }
}

@Composable
fun SparklesIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.5f, h * 0.12f)
            lineTo(w * 0.42f, h * 0.36f)
            lineTo(w * 0.18f, h * 0.44f)
            lineTo(w * 0.42f, h * 0.52f)
            lineTo(w * 0.5f, h * 0.76f)
            lineTo(w * 0.58f, h * 0.52f)
            lineTo(w * 0.82f, h * 0.44f)
            lineTo(w * 0.58f, h * 0.36f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun LeafIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.46f, h * 0.83f)
            cubicTo(w * 0.25f, h * 0.83f, w * 0.17f, h * 0.65f, w * 0.17f, h * 0.54f)
            lineTo(w * 0.17f, h * 0.33f)
            cubicTo(w * 0.17f, h * 0.21f, w * 0.38f, h * 0.21f, w * 0.58f, h * 0.33f)
            lineTo(w * 0.58f, h * 0.54f)
            cubicTo(w * 0.58f, h * 0.71f, w * 0.54f, h * 0.83f, w * 0.46f, h * 0.83f)
        }
        drawPath(path, tint, style = stroke)
        val spine = Path().apply {
            moveTo(w * 0.83f, h * 0.33f)
            cubicTo(w * 0.62f, h * 0.33f, w * 0.42f, h * 0.54f, w * 0.42f, h * 0.75f)
        }
        drawPath(spine, tint, style = stroke)
    }
}

@Composable
fun BookOpenIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val leftPage = Path().apply {
            moveTo(w * 0.5f, h * 0.3f)
            cubicTo(w * 0.35f, h * 0.15f, w * 0.1f, h * 0.15f, w * 0.1f, h * 0.15f)
            lineTo(w * 0.1f, h * 0.85f)
            cubicTo(w * 0.1f, h * 0.85f, w * 0.35f, h * 0.85f, w * 0.5f, h * 0.95f)
            close()
        }
        val rightPage = Path().apply {
            moveTo(w * 0.5f, h * 0.3f)
            cubicTo(w * 0.65f, h * 0.15f, w * 0.9f, h * 0.15f, w * 0.9f, h * 0.15f)
            lineTo(w * 0.9f, h * 0.85f)
            cubicTo(w * 0.9f, h * 0.85f, w * 0.65f, h * 0.85f, w * 0.5f, h * 0.95f)
            close()
        }
        drawPath(leftPage, tint, style = stroke)
        drawPath(rightPage, tint, style = stroke)
    }
}

@Composable
fun BarChartIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
        val w = size.width
        val h = size.height
        drawLine(tint, Offset(w * 0.5f, h * 0.83f), Offset(w * 0.5f, h * 0.42f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.75f, h * 0.83f), Offset(w * 0.75f, h * 0.17f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.25f, h * 0.83f), Offset(w * 0.25f, h * 0.67f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun PinIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.88f, h * 0.12f)
            lineTo(w * 0.5f, h * 0.33f)
            lineTo(w * 0.42f, h * 0.42f)
            lineTo(w * 0.72f, h * 0.72f)
            lineTo(w * 0.9f, h * 0.8f)
        }
        drawPath(path, tint, style = stroke)
        drawLine(tint, Offset(w * 0.38f, h * 0.46f), Offset(w * 0.12f, h * 0.72f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun ClockIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawCircle(tint, radius = w * 0.42f, center = Offset(w * 0.5f, h * 0.5f), style = stroke)
        drawLine(tint, Offset(w * 0.5f, h * 0.25f), Offset(w * 0.5f, h * 0.5f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.5f, h * 0.5f), Offset(w * 0.67f, h * 0.58f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun PaperclipIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.89f, h * 0.46f)
            lineTo(w * 0.51f, h * 0.84f)
            cubicTo(w * 0.37f, h * 0.98f, w * 0.15f, h * 0.98f, w * 0.01f, h * 0.84f)
            cubicTo(-0.13f * w, h * 0.70f, -0.13f * w, h * 0.48f, w * 0.01f, h * 0.34f)
            lineTo(w * 0.54f, h * 0.01f)
            cubicTo(w * 0.64f, -0.09f * h, w * 0.80f, -0.09f * h, w * 0.90f, h * 0.01f)
            cubicTo(w * 1.0f, h * 0.11f, w * 1.0f, h * 0.27f, w * 0.90f, h * 0.37f)
            lineTo(w * 0.41f, h * 0.73f)
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun LinkIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val link1 = Path().apply {
            moveTo(w * 0.42f, h * 0.54f)
            cubicTo(w * 0.6f, h * 0.58f, w * 0.73f, h * 0.45f, w * 0.73f, h * 0.45f)
            lineTo(w * 0.85f, h * 0.33f)
            cubicTo(w * 0.95f, h * 0.23f, w * 0.95f, h * 0.07f, w * 0.85f, -0.03f * h)
            cubicTo(w * 0.75f, -0.13f * h, w * 0.59f, -0.13f * h, w * 0.49f, -0.03f * h)
            lineTo(w * 0.37f, h * 0.09f)
        }
        val link2 = Path().apply {
            moveTo(w * 0.58f, h * 0.46f)
            cubicTo(w * 0.4f, h * 0.42f, w * 0.27f, h * 0.55f, w * 0.27f, h * 0.55f)
            lineTo(w * 0.15f, h * 0.67f)
            cubicTo(w * 0.05f, h * 0.77f, w * 0.05f, h * 0.93f, w * 0.15f, 1.03f * h)
            cubicTo(w * 0.25f, 1.13f * h, w * 0.41f, 1.13f * h, w * 0.51f, 1.03f * h)
            lineTo(w * 0.63f, h * 0.91f)
        }
        drawPath(link1, tint, style = stroke)
        drawPath(link2, tint, style = stroke)
    }
}

@Composable
fun PlayIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(size.width * 0.28f, size.height * 0.15f)
            lineTo(size.width * 0.85f, size.height * 0.5f)
            lineTo(size.width * 0.28f, size.height * 0.85f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun XIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round)
        val w = size.width
        val h = size.height
        drawLine(tint, Offset(w * 0.25f, h * 0.25f), Offset(w * 0.75f, h * 0.75f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.75f, h * 0.25f), Offset(w * 0.25f, h * 0.75f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun ChevronUpIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(size.width * 0.75f, size.height * 0.62f)
            lineTo(size.width * 0.5f, size.height * 0.38f)
            lineTo(size.width * 0.25f, size.height * 0.62f)
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun ChevronDownIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val path = Path().apply {
            moveTo(size.width * 0.25f, size.height * 0.38f)
            lineTo(size.width * 0.5f, size.height * 0.62f)
            lineTo(size.width * 0.75f, size.height * 0.38f)
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun ArchiveIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawRoundRect(tint, Offset(w * 0.1f, h * 0.2f), Size(w * 0.8f, h * 0.2f), CornerRadius(2.dp.toPx()), style = stroke)
        val body = Path().apply {
            moveTo(w * 0.17f, h * 0.42f)
            lineTo(w * 0.17f, h * 0.88f)
            cubicTo(w * 0.17f, h * 0.92f, w * 0.25f, h * 0.92f, w * 0.25f, h * 0.92f)
            lineTo(w * 0.75f, h * 0.92f)
            cubicTo(w * 0.75f, h * 0.92f, w * 0.83f, h * 0.92f, w * 0.83f, h * 0.88f)
            lineTo(w * 0.83f, h * 0.42f)
        }
        drawPath(body, tint, style = stroke)
        drawLine(tint, Offset(w * 0.42f, h * 0.62f), Offset(w * 0.58f, h * 0.62f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun CalendarIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawRoundRect(tint, Offset(w * 0.12f, h * 0.17f), Size(w * 0.75f, h * 0.75f), CornerRadius(3.dp.toPx()), style = stroke)
        drawLine(tint, Offset(w * 0.67f, h * 0.08f), Offset(w * 0.67f, h * 0.25f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.33f, h * 0.08f), Offset(w * 0.33f, h * 0.25f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.12f, h * 0.42f), Offset(w * 0.88f, h * 0.42f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun ZapIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.54f, h * 0.08f)
            lineTo(w * 0.12f, h * 0.58f)
            lineTo(w * 0.5f, h * 0.58f)
            lineTo(w * 0.46f, h * 0.92f)
            lineTo(w * 0.88f, h * 0.42f)
            lineTo(w * 0.5f, h * 0.42f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun StarIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.5f, h * 0.08f)
            lineTo(w * 0.63f, h * 0.34f)
            lineTo(w * 0.92f, h * 0.38f)
            lineTo(w * 0.71f, h * 0.59f)
            lineTo(w * 0.76f, h * 0.88f)
            lineTo(w * 0.5f, h * 0.74f)
            lineTo(w * 0.24f, h * 0.88f)
            lineTo(w * 0.29f, h * 0.59f)
            lineTo(w * 0.08f, h * 0.38f)
            lineTo(w * 0.37f, h * 0.34f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun TrophyIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val cup = Path().apply {
            moveTo(w * 0.25f, h * 0.08f)
            lineTo(w * 0.75f, h * 0.08f)
            lineTo(w * 0.75f, h * 0.38f)
            cubicTo(w * 0.75f, h * 0.58f, w * 0.25f, h * 0.58f, w * 0.25f, h * 0.38f)
            close()
        }
        drawPath(cup, tint, style = stroke)
        drawLine(tint, Offset(w * 0.5f, h * 0.58f), Offset(w * 0.5f, h * 0.75f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        drawLine(tint, Offset(w * 0.25f, h * 0.92f), Offset(w * 0.75f, h * 0.92f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun SettingsIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawCircle(tint, radius = w * 0.18f, center = Offset(w * 0.5f, h * 0.5f), style = stroke)
        drawCircle(tint, radius = w * 0.4f, center = Offset(w * 0.5f, h * 0.5f), style = stroke)
    }
}

@Composable
fun SearchIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        drawCircle(tint, radius = w * 0.32f, center = Offset(w * 0.45f, h * 0.45f), style = stroke)
        drawLine(tint, Offset(w * 0.68f, h * 0.68f), Offset(w * 0.88f, h * 0.88f), strokeWidth = stroke.width, cap = StrokeCap.Round)
    }
}

@Composable
fun WindIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val p1 = Path().apply {
            moveTo(w * 0.1f, h * 0.35f)
            lineTo(w * 0.72f, h * 0.35f)
            cubicTo(w * 0.85f, h * 0.35f, w * 0.85f, h * 0.15f, w * 0.72f, h * 0.15f)
        }
        val p2 = Path().apply {
            moveTo(w * 0.1f, h * 0.6f)
            lineTo(w * 0.5f, h * 0.6f)
            cubicTo(w * 0.65f, h * 0.6f, w * 0.65f, h * 0.8f, w * 0.5f, h * 0.8f)
        }
        drawPath(p1, tint, style = stroke)
        drawPath(p2, tint, style = stroke)
    }
}

@Composable
fun Share2Icon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val c1 = Offset(w * 0.75f, h * 0.21f)
        val c2 = Offset(w * 0.25f, h * 0.5f)
        val c3 = Offset(w * 0.75f, h * 0.79f)
        drawLine(tint, c2, c1, strokeWidth = stroke.width)
        drawLine(tint, c2, c3, strokeWidth = stroke.width)
        drawCircle(tint, radius = w * 0.12f, center = c1, style = stroke)
        drawCircle(tint, radius = w * 0.12f, center = c2, style = stroke)
        drawCircle(tint, radius = w * 0.12f, center = c3, style = stroke)
    }
}

@Composable
fun BookmarkIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.79f, h * 0.88f)
            lineTo(w * 0.5f, h * 0.71f)
            lineTo(w * 0.21f, h * 0.88f)
            lineTo(w * 0.21f, h * 0.21f)
            cubicTo(w * 0.21f, h * 0.12f, w * 0.29f, h * 0.12f, w * 0.29f, h * 0.12f)
            lineTo(w * 0.71f, h * 0.12f)
            cubicTo(w * 0.71f, h * 0.12f, w * 0.79f, h * 0.12f, w * 0.79f, h * 0.21f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun QuoteIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val q1 = Path().apply {
            moveTo(w * 0.12f, h * 0.88f)
            cubicTo(w * 0.25f, h * 0.88f, w * 0.42f, h * 0.83f, w * 0.42f, h * 0.54f)
            lineTo(w * 0.42f, h * 0.21f)
            lineTo(w * 0.17f, h * 0.21f)
            lineTo(w * 0.17f, h * 0.54f)
            lineTo(w * 0.29f, h * 0.54f)
            cubicTo(w * 0.29f, h * 0.69f, w * 0.19f, h * 0.73f, w * 0.08f, h * 0.75f)
        }
        val q2 = Path().apply {
            moveTo(w * 0.58f, h * 0.88f)
            cubicTo(w * 0.71f, h * 0.88f, w * 0.88f, h * 0.83f, w * 0.88f, h * 0.54f)
            lineTo(w * 0.88f, h * 0.21f)
            lineTo(w * 0.63f, h * 0.21f)
            lineTo(w * 0.63f, h * 0.54f)
            lineTo(w * 0.75f, h * 0.54f)
            cubicTo(w * 0.75f, h * 0.69f, w * 0.65f, h * 0.73f, w * 0.54f, h * 0.75f)
        }
        drawPath(q1, tint, style = stroke)
        drawPath(q2, tint, style = stroke)
    }
}

@Composable
fun PaintbrushIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val path = Path().apply {
            moveTo(w * 0.71f, h * 0.12f)
            lineTo(w * 0.88f, h * 0.29f)
            lineTo(w * 0.31f, h * 0.85f)
            lineTo(w * 0.08f, h * 0.92f)
            lineTo(w * 0.15f, h * 0.69f)
            close()
        }
        drawPath(path, tint, style = stroke)
    }
}

@Composable
fun DownloadIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val tray = Path().apply {
            moveTo(w * 0.12f, h * 0.62f)
            lineTo(w * 0.12f, h * 0.88f)
            lineTo(w * 0.88f, h * 0.88f)
            lineTo(w * 0.88f, h * 0.62f)
        }
        drawPath(tray, tint, style = stroke)
        drawLine(tint, Offset(w * 0.5f, h * 0.12f), Offset(w * 0.5f, h * 0.62f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        val arrow = Path().apply {
            moveTo(w * 0.29f, h * 0.42f)
            lineTo(w * 0.5f, h * 0.62f)
            lineTo(w * 0.71f, h * 0.42f)
        }
        drawPath(arrow, tint, style = stroke)
    }
}

@Composable
fun UploadIcon(modifier: Modifier = Modifier.size(24.dp), tint: Color = Color.White) {
    Canvas(modifier = modifier) {
        val stroke = Stroke(width = 2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round)
        val w = size.width
        val h = size.height
        val tray = Path().apply {
            moveTo(w * 0.12f, h * 0.62f)
            lineTo(w * 0.12f, h * 0.88f)
            lineTo(w * 0.88f, h * 0.88f)
            lineTo(w * 0.88f, h * 0.62f)
        }
        drawPath(tray, tint, style = stroke)
        drawLine(tint, Offset(w * 0.5f, h * 0.62f), Offset(w * 0.5f, h * 0.12f), strokeWidth = stroke.width, cap = StrokeCap.Round)
        val arrow = Path().apply {
            moveTo(w * 0.29f, h * 0.33f)
            lineTo(w * 0.5f, h * 0.12f)
            lineTo(w * 0.71f, h * 0.33f)
        }
        drawPath(arrow, tint, style = stroke)
    }
}

@Composable
fun AuraLogoEmblem(
    modifier: Modifier = Modifier.size(36.dp),
    glowAlpha: Float = 0.5f
) {
    val haloBrush = androidx.compose.ui.graphics.Brush.linearGradient(
        colors = listOf(
            Color(0xFFFFB36B),
            Color(0xFFFF7F7F),
            Color(0xFFD77BDA),
            Color(0xFF9B78F5)
        ),
        start = Offset.Zero,
        end = Offset.Infinite
    )

    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val strokeWidth = (w * 0.08f).coerceAtLeast(2.dp.toPx())
        val glowWidth = strokeWidth * 2.2f
        val arcRect = androidx.compose.ui.geometry.Rect(
            left = w * 0.16f,
            top = h * 0.16f,
            right = w * 0.84f,
            bottom = h * 0.84f
        )

        // Outer glow
        drawArc(
            brush = haloBrush,
            startAngle = 195f,
            sweepAngle = 300f,
            useCenter = false,
            topLeft = Offset(arcRect.left, arcRect.top),
            size = Size(arcRect.width, arcRect.height),
            style = Stroke(width = glowWidth, cap = StrokeCap.Round),
            alpha = glowAlpha
        )

        // Core crisp arc
        drawArc(
            brush = haloBrush,
            startAngle = 195f,
            sweepAngle = 300f,
            useCenter = false,
            topLeft = Offset(arcRect.left, arcRect.top),
            size = Size(arcRect.width, arcRect.height),
            style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
        )
    }
}

object AuraIcons {
    @Composable
    fun Logo(modifier: Modifier = Modifier.size(36.dp), glowAlpha: Float = 0.5f) = AuraLogoEmblem(modifier = modifier, glowAlpha = glowAlpha)

    @Composable
    fun Paperclip(modifier: Modifier = Modifier, color: Color = Color.White) = PaperclipIcon(modifier = modifier, tint = color)

    @Composable
    fun Link(modifier: Modifier = Modifier, color: Color = Color.White) = LinkIcon(modifier = modifier, tint = color)

    @Composable
    fun X(modifier: Modifier = Modifier, color: Color = Color.White) = XIcon(modifier = modifier, tint = color)
}
