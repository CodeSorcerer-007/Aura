package com.example.aura.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aura.data.model.AuraThemeModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Composable
fun DayDatePanel(theme: AuraThemeModel, modifier: Modifier = Modifier) {
    val now = remember { LocalDate.now() }
    val day = remember { now.format(DateTimeFormatter.ofPattern("EEEE")) }
    val date = remember { now.format(DateTimeFormatter.ofPattern("MMMM d")) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 40.dp, vertical = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .background(theme.bgSecondaryColor)
                .border(1.dp, theme.borderColor, RoundedCornerShape(16.dp))
                .padding(horizontal = 28.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = day,
                color = theme.textPrimaryColor,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = date,
                color = theme.textSecondaryColor,
                fontSize = 14.sp,
                fontWeight = FontWeight.Normal
            )
        }
    }
}

data class FilterState(
    val type: String = "all", // "all", "priority", "due_this_week", "category", "tag"
    val value: String? = null
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun FilterBar(
    activeFilter: FilterState,
    categories: List<String>,
    allTags: List<String>,
    theme: AuraThemeModel,
    onFilterChange: (FilterState) -> Unit,
    modifier: Modifier = Modifier
) {
    var categoryDropdownOpen by remember { mutableStateOf(false) }
    var tagDropdownOpen by remember { mutableStateOf(false) }

    FlowRow(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // All
        FilterChip(
            label = "All",
            selected = activeFilter.type == "all",
            theme = theme,
            onClick = { onFilterChange(FilterState(type = "all")) }
        )

        Spacer(modifier = Modifier.width(6.dp))

        // High Priority
        FilterChip(
            label = "High Priority",
            selected = activeFilter.type == "priority",
            theme = theme,
            onClick = { onFilterChange(FilterState(type = "priority")) }
        )

        Spacer(modifier = Modifier.width(6.dp))

        // Due This Week
        FilterChip(
            label = "Due This Week",
            selected = activeFilter.type == "due_this_week",
            theme = theme,
            onClick = { onFilterChange(FilterState(type = "due_this_week")) }
        )

        Spacer(modifier = Modifier.width(6.dp))

        // Category dropdown
        Box {
            val catLabel = if (activeFilter.type == "category" && activeFilter.value != null) activeFilter.value else "Category..."
            val isCatSelected = activeFilter.type == "category"

            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isCatSelected) theme.textPrimaryColor.copy(alpha = 0.9f) else theme.bgSecondaryColor)
                    .border(1.dp, if (isCatSelected) Color.Transparent else theme.borderColor, RoundedCornerShape(20.dp))
                    .clickable { categoryDropdownOpen = true }
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = catLabel,
                    color = if (isCatSelected) theme.bgColor else theme.textSecondaryColor,
                    fontSize = 13.sp,
                    fontWeight = if (isCatSelected) FontWeight.SemiBold else FontWeight.Normal
                )
                Spacer(modifier = Modifier.width(4.dp))
                ChevronDownIcon(modifier = Modifier.size(12.dp), tint = if (isCatSelected) theme.bgColor else theme.textSecondaryColor)
            }

            DropdownMenu(
                expanded = categoryDropdownOpen,
                onDismissRequest = { categoryDropdownOpen = false }
            ) {
                categories.forEach { cat ->
                    DropdownMenuItem(
                        text = { Text(cat) },
                        onClick = {
                            categoryDropdownOpen = false
                            onFilterChange(FilterState(type = "category", value = cat))
                        }
                    )
                }
            }
        }

        // Tag dropdown (if tags exist)
        if (allTags.isNotEmpty()) {
            Spacer(modifier = Modifier.width(6.dp))
            Box {
                val tagLabel = if (activeFilter.type == "tag" && activeFilter.value != null) "@${activeFilter.value}" else "Tag..."
                val isTagSelected = activeFilter.type == "tag"

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isTagSelected) theme.textPrimaryColor.copy(alpha = 0.9f) else theme.bgSecondaryColor)
                        .border(1.dp, if (isTagSelected) Color.Transparent else theme.borderColor, RoundedCornerShape(20.dp))
                        .clickable { tagDropdownOpen = true }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = tagLabel,
                        color = if (isTagSelected) theme.bgColor else theme.textSecondaryColor,
                        fontSize = 13.sp,
                        fontWeight = if (isTagSelected) FontWeight.SemiBold else FontWeight.Normal
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    ChevronDownIcon(modifier = Modifier.size(12.dp), tint = if (isTagSelected) theme.bgColor else theme.textSecondaryColor)
                }

                DropdownMenu(
                    expanded = tagDropdownOpen,
                    onDismissRequest = { tagDropdownOpen = false }
                ) {
                    allTags.forEach { tag ->
                        DropdownMenuItem(
                            text = { Text("@$tag") },
                            onClick = {
                                tagDropdownOpen = false
                                onFilterChange(FilterState(type = "tag", value = tag))
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FilterChip(
    label: String,
    selected: Boolean,
    theme: AuraThemeModel,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(if (selected) theme.textPrimaryColor.copy(alpha = 0.9f) else theme.bgSecondaryColor)
            .border(1.dp, if (selected) Color.Transparent else theme.borderColor, RoundedCornerShape(20.dp))
            .clickable { onClick() }
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = label,
            color = if (selected) theme.bgColor else theme.textSecondaryColor,
            fontSize = 13.sp,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal
        )
    }
}
