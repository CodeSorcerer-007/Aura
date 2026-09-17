package com.example.aura.data.local

import android.content.Context
import android.content.SharedPreferences
import com.example.aura.data.model.AuraThemeModel
import com.example.aura.data.model.CategoryStyle
import com.example.aura.data.model.UserStats
import org.json.JSONArray
import org.json.JSONObject

class PreferencesRepository(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("aura_preferences", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_THEME = "aura-theme"
        private const val KEY_CUSTOM_THEMES = "aura-custom-themes"
        private const val KEY_CUSTOM_CATEGORIES = "aura-custom-categories"
        private const val KEY_GOLDEN_SEEDS = "aura-golden-seeds"
        private const val KEY_STREAK = "aura-streak"
        private const val KEY_LAST_ACTIVE_DATE = "aura-last-active-date"
        private const val KEY_FOCUSED_COMPLETED = "aura-focused-completed"
        private const val KEY_ACHIEVEMENTS = "aura-achievements"
        private const val KEY_SHUTDOWN_TIME = "aura-shutdown-time"
        private const val KEY_SOUND_EFFECTS = "aura-sound-effects"
        private const val KEY_AUTO_ARCHIVE = "aura-auto-archive"
        private const val KEY_NOTIFICATIONS = "aura-notifications"
        private const val KEY_HAS_LAUNCHED = "aura-has-launched"
        private const val KEY_MOMENTUM_AWARDED_DATE = "aura-momentum-awarded-date"
        private const val KEY_LAST_ASSISTANT_DATE = "aura-last-assistant-date"
    }

    var theme: String
        get() = prefs.getString(KEY_THEME, "dark") ?: "dark"
        set(value) = prefs.edit().putString(KEY_THEME, value).apply()

    var customThemes: List<AuraThemeModel>
        get() {
            val jsonStr = prefs.getString(KEY_CUSTOM_THEMES, null) ?: return emptyList()
            val list = mutableListOf<AuraThemeModel>()
            try {
                val arr = JSONArray(jsonStr)
                for (i in 0 until arr.length()) {
                    arr.optJSONObject(i)?.let { list.add(AuraThemeModel.fromJson(it)) }
                }
            } catch (_: Exception) {}
            return list
        }
        set(value) {
            val arr = JSONArray()
            value.forEach { arr.put(it.toJson()) }
            prefs.edit().putString(KEY_CUSTOM_THEMES, arr.toString()).apply()
        }

    var customCategories: Map<String, CategoryStyle>
        get() {
            val jsonStr = prefs.getString(KEY_CUSTOM_CATEGORIES, null) ?: return emptyMap()
            val map = mutableMapOf<String, CategoryStyle>()
            try {
                val obj = JSONObject(jsonStr)
                val keys = obj.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    val catObj = obj.getJSONObject(key)
                    map[key] = CategoryStyle(
                        name = key,
                        bgHex = catObj.optLong("bg", 0x4D64748B),
                        borderHex = catObj.optLong("border", 0x8094A3B8),
                        textHex = catObj.optLong("text", 0xFFE2E8F0),
                        solidHex = catObj.optLong("solid", 0xFF475569),
                        glowHex = catObj.optLong("glowColor", 0xFF94A3B8)
                    )
                }
            } catch (_: Exception) {}
            return map
        }
        set(value) {
            val obj = JSONObject()
            value.forEach { (k, v) ->
                val catObj = JSONObject().apply {
                    put("bg", v.bgHex)
                    put("border", v.borderHex)
                    put("text", v.textHex)
                    put("solid", v.solidHex)
                    put("glowColor", v.glowHex)
                }
                obj.put(k, catObj)
            }
            prefs.edit().putString(KEY_CUSTOM_CATEGORIES, obj.toString()).apply()
        }

    var userStats: UserStats
        get() = UserStats(
            goldenSeeds = prefs.getInt(KEY_GOLDEN_SEEDS, 0),
            streak = prefs.getInt(KEY_STREAK, 0),
            lastActiveDate = prefs.getString(KEY_LAST_ACTIVE_DATE, null),
            focusedTasksCompleted = prefs.getInt(KEY_FOCUSED_COMPLETED, 0)
        )
        set(value) {
            prefs.edit()
                .putInt(KEY_GOLDEN_SEEDS, value.goldenSeeds)
                .putInt(KEY_STREAK, value.streak)
                .putString(KEY_LAST_ACTIVE_DATE, value.lastActiveDate)
                .putInt(KEY_FOCUSED_COMPLETED, value.focusedTasksCompleted)
                .apply()
        }

    var unlockedAchievements: Set<String>
        get() = prefs.getStringSet(KEY_ACHIEVEMENTS, emptySet()) ?: emptySet()
        set(value) = prefs.edit().putStringSet(KEY_ACHIEVEMENTS, value).apply()

    var shutdownTime: String
        get() = prefs.getString(KEY_SHUTDOWN_TIME, "18:00") ?: "18:00"
        set(value) = prefs.edit().putString(KEY_SHUTDOWN_TIME, value).apply()

    var soundEffectsEnabled: Boolean
        get() = prefs.getBoolean(KEY_SOUND_EFFECTS, true)
        set(value) = prefs.edit().putBoolean(KEY_SOUND_EFFECTS, value).apply()

    var autoArchiveEnabled: Boolean
        get() = prefs.getBoolean(KEY_AUTO_ARCHIVE, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTO_ARCHIVE, value).apply()

    var notificationsEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATIONS, false)
        set(value) = prefs.edit().putBoolean(KEY_NOTIFICATIONS, value).apply()

    var hasLaunched: Boolean
        get() = prefs.getBoolean(KEY_HAS_LAUNCHED, false)
        set(value) = prefs.edit().putBoolean(KEY_HAS_LAUNCHED, value).apply()

    var momentumAwardedDate: String?
        get() = prefs.getString(KEY_MOMENTUM_AWARDED_DATE, null)
        set(value) = prefs.edit().putString(KEY_MOMENTUM_AWARDED_DATE, value).apply()

    var lastAssistantDate: String?
        get() = prefs.getString(KEY_LAST_ASSISTANT_DATE, null)
        set(value) = prefs.edit().putString(KEY_LAST_ASSISTANT_DATE, value).apply()
}
