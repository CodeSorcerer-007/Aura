package com.example.aura.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel

data class NavItem(
    val id: String,
    val label: String
)

val navItems = listOf(
    NavItem("flow", "Flow"),
    NavItem("constellations", "Projects"),
    NavItem("grove", "Grove"),
    NavItem("journal", "Journal"),
    NavItem("review", "Review")
)

@Composable
fun AuraBottomDock(
    currentView: String,
    theme: AuraThemeModel,
    onNavigate: (String) -> Unit,
    onAddTask: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.Transparent,
                        theme.bgColor.copy(alpha = 0.85f),
                        theme.bgColor
                    )
                )
            )
            .windowInsetsPadding(WindowInsets.ime)
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(start = 16.dp, end = 16.dp, top = 4.dp, bottom = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Floating Bottom Navigation Pill (Adaptive, never clipped on any screen width!)
        AuraBottomNav(
            currentView = currentView,
            theme = theme,
            onNavigate = onNavigate
        )

        // Floating Capture Thought Bar (Rendered only on Flow view to keep other views clean & unblocked)
        AnimatedVisibility(
            visible = currentView == "flow",
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            AuraCaptureInput(
                theme = theme,
                onAddTask = onAddTask
            )
        }
    }
}

@Composable
fun AuraBottomNav(
    currentView: String,
    theme: AuraThemeModel,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(theme.bgSecondaryColor.copy(alpha = 0.92f))
            .border(1.dp, theme.borderColor.copy(alpha = 0.6f), RoundedCornerShape(32.dp))
            .padding(horizontal = 4.dp, vertical = 4.dp)
    ) {
        val isWideScreen = maxWidth >= 480.dp

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            navItems.forEach { item ->
                val isSelected = currentView == item.id
                val interactionSource = remember { MutableInteractionSource() }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            if (isSelected) theme.bgSecondaryHoverColor else Color.Transparent
                        )
                        .clickable(
                            interactionSource = interactionSource,
                            indication = null
                        ) { onNavigate(item.id) }
                        .padding(vertical = if (isWideScreen) 8.dp else 4.dp, horizontal = 2.dp),
                    contentAlignment = Alignment.Center
                ) {
                    val iconColor = if (isSelected) theme.accentColor else theme.textSecondaryColor
                    val textColor = if (isSelected) theme.textPrimaryColor else theme.textSecondaryColor

                    if (isWideScreen) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            when (item.id) {
                                "flow" -> SunIcon(modifier = Modifier.size(17.dp), tint = iconColor)
                                "constellations" -> SparklesIcon(modifier = Modifier.size(17.dp), tint = iconColor)
                                "grove" -> LeafIcon(modifier = Modifier.size(17.dp), tint = iconColor)
                                "journal" -> BookOpenIcon(modifier = Modifier.size(17.dp), tint = iconColor)
                                "review" -> BarChartIcon(modifier = Modifier.size(17.dp), tint = iconColor)
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = item.label,
                                color = textColor,
                                fontSize = 11.5.sp,
                                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                                maxLines = 1
                            )
                        }
                    } else {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            when (item.id) {
                                "flow" -> SunIcon(modifier = Modifier.size(18.dp), tint = iconColor)
                                "constellations" -> SparklesIcon(modifier = Modifier.size(18.dp), tint = iconColor)
                                "grove" -> LeafIcon(modifier = Modifier.size(18.dp), tint = iconColor)
                                "journal" -> BookOpenIcon(modifier = Modifier.size(18.dp), tint = iconColor)
                                "review" -> BarChartIcon(modifier = Modifier.size(18.dp), tint = iconColor)
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = item.label,
                                color = textColor,
                                fontSize = 10.5.sp,
                                fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium,
                                maxLines = 1,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AuraCaptureInput(
    theme: AuraThemeModel,
    onAddTask: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var text by remember { mutableStateOf("") }

    val handleSubmit = {
        if (text.isNotBlank()) {
            onAddTask(text.trim())
            text = ""
        }
    }

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .clip(RoundedCornerShape(26.dp))
            .background(theme.bgInputColor)
            .border(1.dp, theme.borderColor.copy(alpha = 0.7f), RoundedCornerShape(26.dp))
            .padding(start = 18.dp, end = 6.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        BasicTextField(
            value = text,
            onValueChange = { text = it },
            modifier = Modifier.weight(1f),
            textStyle = TextStyle(
                color = theme.textPrimaryColor,
                fontSize = 15.sp
            ),
            cursorBrush = SolidColor(theme.accentColor),
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
            keyboardActions = KeyboardActions(onDone = { handleSubmit() }),
            decorationBox = { innerTextField ->
                if (text.isEmpty()) {
                    Text(
                        text = "Capture a thought... e.g., 'Weekly' (N)",
                        color = theme.textSecondaryColor.copy(alpha = 0.7f),
                        fontSize = 14.sp
                    )
                }
                innerTextField()
            }
        )

        Spacer(modifier = Modifier.width(8.dp))

        // Plus Submit Button
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor.copy(alpha = 0.5f), CircleShape)
                .clickable { handleSubmit() },
            contentAlignment = Alignment.Center
        ) {
            PlusIcon(modifier = Modifier.size(18.dp), tint = theme.textPrimaryColor)
        }
    }
}
