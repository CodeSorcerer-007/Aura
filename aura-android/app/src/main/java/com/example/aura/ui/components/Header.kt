package com.example.aura.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.Quote

@Composable
fun AuraHeader(
    momentumProgress: Float,
    dailyQuote: Quote,
    theme: AuraThemeModel,
    onMindfulClick: () -> Unit,
    onShareClick: () -> Unit,
    onSearchClick: () -> Unit,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val animatedMomentum by animateFloatAsState(
        targetValue = momentumProgress.coerceIn(0f, 1f),
        label = "momentum"
    )

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top action bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left actions: Mindful & Share
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable { onMindfulClick() },
                    contentAlignment = Alignment.Center
                ) {
                    WindIcon(modifier = Modifier.size(22.dp), tint = theme.textSecondaryColor)
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable { onShareClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Share2Icon(modifier = Modifier.size(22.dp), tint = theme.textSecondaryColor)
                }
            }

            // Right actions: Search & Settings
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable { onSearchClick() },
                    contentAlignment = Alignment.Center
                ) {
                    SearchIcon(modifier = Modifier.size(22.dp), tint = theme.textSecondaryColor)
                }
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable { onSettingsClick() },
                    contentAlignment = Alignment.Center
                ) {
                    SettingsIcon(modifier = Modifier.size(22.dp), tint = theme.textSecondaryColor)
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Title with official Aura Logo
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            AuraLogoEmblem(
                modifier = Modifier.size(38.dp),
                glowAlpha = 0.6f
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "Aura",
                color = theme.textPrimaryColor,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
            )
        }

        // Subtitle Quote
        Text(
            text = "\"${dailyQuote.quote}\" — ${dailyQuote.author}",
            color = theme.textSecondaryColor,
            fontSize = 13.sp,
            fontStyle = FontStyle.Italic,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 14.dp, start = 16.dp, end = 16.dp)
        )

        // Daily Momentum
        Column(
            modifier = Modifier.width(180.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                ZapIcon(modifier = Modifier.size(14.dp), tint = Color(0xFFFBBF24))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Daily Momentum",
                    color = Color(0xFFFBBF24),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(theme.textPrimaryColor.copy(alpha = 0.12f))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(animatedMomentum)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(Color(0xFFFBBF24))
                )
            }
        }
    }
}
