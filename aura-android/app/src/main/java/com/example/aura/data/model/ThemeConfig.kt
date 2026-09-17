package com.example.aura.data.model

import androidx.compose.ui.graphics.Color
import org.json.JSONObject

data class AuraThemeModel(
    val id: String,
    val name: String,
    val bg: Long,
    val bgSecondary: Long,
    val bgSecondaryHover: Long,
    val bgInput: Long,
    val textPrimary: Long,
    val textSecondary: Long,
    val border: Long,
    val accent: Long,
    val isLight: Boolean = false,
    val isCustom: Boolean = false
) {
    val bgColor: Color get() = Color(bg)
    val bgSecondaryColor: Color get() = Color(bgSecondary)
    val bgSecondaryHoverColor: Color get() = Color(bgSecondaryHover)
    val bgInputColor: Color get() = Color(bgInput)
    val textPrimaryColor: Color get() = Color(textPrimary)
    val textSecondaryColor: Color get() = Color(textSecondary)
    val borderColor: Color get() = Color(border)
    val accentColor: Color get() = Color(accent)

    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("name", name)
        put("bg", bg)
        put("bgSecondary", bgSecondary)
        put("bgSecondaryHover", bgSecondaryHover)
        put("bgInput", bgInput)
        put("textPrimary", textPrimary)
        put("textSecondary", textSecondary)
        put("border", border)
        put("accent", accent)
        put("isLight", isLight)
        put("isCustom", isCustom)
    }

    companion object {
        fun fromJson(json: JSONObject): AuraThemeModel = AuraThemeModel(
            id = json.optString("id", "custom"),
            name = json.optString("name", "Custom"),
            bg = json.optLong("bg", 0xFF000000),
            bgSecondary = json.optLong("bgSecondary", 0xFF111827),
            bgSecondaryHover = json.optLong("bgSecondaryHover", 0xFF1F2937),
            bgInput = json.optLong("bgInput", 0x80111827),
            textPrimary = json.optLong("textPrimary", 0xFFF9FAFB),
            textSecondary = json.optLong("textSecondary", 0xFF9CA3AF),
            border = json.optLong("border", 0xFF374151),
            accent = json.optLong("accent", 0xFF2DD4BF),
            isLight = json.optBoolean("isLight", false),
            isCustom = true
        )
    }
}

val builtInThemes: List<AuraThemeModel> get() = baseThemesList

val baseThemesList = listOf(
    AuraThemeModel(
        id = "dark",
        name = "OLED Dark",
        bg = 0xFF000000,
        bgSecondary = 0xFF111827,
        bgSecondaryHover = 0xFF1F2937,
        bgInput = 0x80111827,
        textPrimary = 0xFFF9FAFB,
        textSecondary = 0xFF9CA3AF,
        border = 0xFF374151,
        accent = 0xFF2DD4BF,
        isLight = false
    ),
    AuraThemeModel(
        id = "light",
        name = "Clean Light",
        bg = 0xFFF9FAFB,
        bgSecondary = 0xFFFFFFFF,
        bgSecondaryHover = 0xFFF3F4F6,
        bgInput = 0x80FFFFFF,
        textPrimary = 0xFF1F2937,
        textSecondary = 0xFF6B7280,
        border = 0xFFD1D5DB,
        accent = 0xFF10B981,
        isLight = true
    ),
    AuraThemeModel(
        id = "cyberpunk",
        name = "Cyberpunk",
        bg = 0xFF0D0221,
        bgSecondary = 0xE61A021D,
        bgSecondaryHover = 0xE62E0433,
        bgInput = 0x801A021D,
        textPrimary = 0xFFF0FDF4,
        textSecondary = 0xFFA78BFA,
        border = 0xFFEC4899,
        accent = 0xFF06B6D4,
        isLight = false
    ),
    AuraThemeModel(
        id = "crimson",
        name = "Crimson",
        bg = 0xFF120000,
        bgSecondary = 0xFF2C0B0E,
        bgSecondaryHover = 0xFF401014,
        bgInput = 0x802C0B0E,
        textPrimary = 0xFFFEF2F2,
        textSecondary = 0xFFFCA5A5,
        border = 0xFF7F1D1D,
        accent = 0xFFEF4444,
        isLight = false
    ),
    AuraThemeModel(
        id = "forest",
        name = "Forest",
        bg = 0xFF0B2E13,
        bgSecondary = 0xFF11421C,
        bgSecondaryHover = 0xFF165329,
        bgInput = 0x800B2E13,
        textPrimary = 0xFFF0FFF4,
        textSecondary = 0xFFA3B899,
        border = 0xFF2F603A,
        accent = 0xFF34D399,
        isLight = false
    ),
    AuraThemeModel(
        id = "ocean",
        name = "Ocean",
        bg = 0xFF021027,
        bgSecondary = 0xFF002B4D,
        bgSecondaryHover = 0xFF003366,
        bgInput = 0x80001F3F,
        textPrimary = 0xFFE0F7FA,
        textSecondary = 0xFF81D4FA,
        border = 0xFF0288D1,
        accent = 0xFF29B6F6,
        isLight = false
    ),
    AuraThemeModel(
        id = "dune",
        name = "Dune",
        bg = 0xFF422D1C,
        bgSecondary = 0xFF5A3D2B,
        bgSecondaryHover = 0xFF734D3A,
        bgInput = 0x80422D1C,
        textPrimary = 0xFFFDF6E3,
        textSecondary = 0xFFE3D5B8,
        border = 0xFF7A5C35,
        accent = 0xFFF59E0B,
        isLight = false
    ),
    AuraThemeModel(
        id = "sakura",
        name = "Sakura",
        bg = 0xFFFFF0F3,
        bgSecondary = 0xFFFFFFFF,
        bgSecondaryHover = 0xFFFDF2F2,
        bgInput = 0x80FFFFFF,
        textPrimary = 0xFF5E2D2D,
        textSecondary = 0xFFC08497,
        border = 0xFFF2D7D9,
        accent = 0xFFEF4444,
        isLight = true
    ),
    AuraThemeModel(
        id = "solarized",
        name = "Solarized",
        bg = 0xFF002B36,
        bgSecondary = 0xFF073642,
        bgSecondaryHover = 0xFF0A4657,
        bgInput = 0x80073642,
        textPrimary = 0xFFEEE8D5,
        textSecondary = 0xFF93A1A1,
        border = 0xFF268BD2,
        accent = 0xFF2AA198,
        isLight = false
    ),
    AuraThemeModel(
        id = "dracula",
        name = "Dracula",
        bg = 0xFF282A36,
        bgSecondary = 0xFF44475A,
        bgSecondaryHover = 0xFF5A5E78,
        bgInput = 0x8044475A,
        textPrimary = 0xFFF8F8F2,
        textSecondary = 0xFFBD93F9,
        border = 0xFF6272A4,
        accent = 0xFF50FA7B,
        isLight = false
    ),
    AuraThemeModel(
        id = "nord",
        name = "Nord",
        bg = 0xFF2E3440,
        bgSecondary = 0xFF3B4252,
        bgSecondaryHover = 0xFF434C5E,
        bgInput = 0x803B4252,
        textPrimary = 0xFFE5E9F0,
        textSecondary = 0xFF81A1C1,
        border = 0xFF4C566A,
        accent = 0xFF88C0D0,
        isLight = false
    ),
    AuraThemeModel(
        id = "gruvbox",
        name = "Gruvbox",
        bg = 0xFF282828,
        bgSecondary = 0xFF3C3836,
        bgSecondaryHover = 0xFF504945,
        bgInput = 0x803C3836,
        textPrimary = 0xFFEBDBB2,
        textSecondary = 0xFFB8BB26,
        border = 0xFF665C54,
        accent = 0xFFFE8019,
        isLight = false
    ),
    AuraThemeModel(
        id = "monokai",
        name = "Monokai",
        bg = 0xFF272822,
        bgSecondary = 0xFF3E3D32,
        bgSecondaryHover = 0xFF49483E,
        bgInput = 0x803E3D32,
        textPrimary = 0xFFF8F8F2,
        textSecondary = 0xFFE6DB74,
        border = 0xFF75715E,
        accent = 0xFFA6E22E,
        isLight = false
    ),
    AuraThemeModel(
        id = "rose_pine",
        name = "Rosé Pine",
        bg = 0xFF191724,
        bgSecondary = 0xFF1F1D2E,
        bgSecondaryHover = 0xFF26233A,
        bgInput = 0x801F1D2E,
        textPrimary = 0xFFE0DEF4,
        textSecondary = 0xFFC4A7E7,
        border = 0xFFEB6F92,
        accent = 0xFF31748F,
        isLight = false
    ),
    AuraThemeModel(
        id = "matcha",
        name = "Matcha",
        bg = 0xFF243029,
        bgSecondary = 0xFF354A3D,
        bgSecondaryHover = 0xFF425C4D,
        bgInput = 0x80354A3D,
        textPrimary = 0xFFD8D8D8,
        textSecondary = 0xFF88B495,
        border = 0xFF557E62,
        accent = 0xFF73C088,
        isLight = false
    ),
    AuraThemeModel(
        id = "latte",
        name = "Latte",
        bg = 0xFFEFF1F5,
        bgSecondary = 0xFFE6E9EF,
        bgSecondaryHover = 0xFFDCE0E8,
        bgInput = 0x80E6E9EF,
        textPrimary = 0xFF4C4F69,
        textSecondary = 0xFFFE640B,
        border = 0xFFBCC0CC,
        accent = 0xFF1E66F5,
        isLight = true
    )
)
