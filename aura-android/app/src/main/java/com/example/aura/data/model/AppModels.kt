package com.example.aura.data.model

import org.json.JSONArray
import org.json.JSONObject

data class JournalEntry(
    val date: String, // YYYY-MM-DD
    val content: String
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("date", date)
        put("content", content)
    }

    companion object {
        fun fromJson(json: JSONObject): JournalEntry = JournalEntry(
            date = json.optString("date", ""),
            content = json.optString("content", "")
        )
    }
}

data class GroveTree(
    val id: Long,
    val growthPoints: Int = 0,
    val maxGrowth: Int = 10,
    val type: String // "oak", "pine", "cherry"
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("growthPoints", growthPoints)
        put("maxGrowth", maxGrowth)
        put("type", type)
    }

    companion object {
        fun fromJson(json: JSONObject): GroveTree = GroveTree(
            id = json.optLong("id", System.currentTimeMillis()),
            growthPoints = json.optInt("growthPoints", 0),
            maxGrowth = json.optInt("maxGrowth", 10),
            type = json.optString("type", "oak")
        )
    }
}

data class TemplateTask(
    val text: String,
    val category: String,
    val priority: Int,
    val timeOfDay: String
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("text", text)
        put("category", category)
        put("priority", priority)
        put("timeOfDay", timeOfDay)
    }

    companion object {
        fun fromJson(json: JSONObject): TemplateTask = TemplateTask(
            text = json.optString("text", ""),
            category = json.optString("category", "General"),
            priority = json.optInt("priority", 2),
            timeOfDay = json.optString("timeOfDay", "afternoon")
        )
    }
}

data class Template(
    val id: Long = System.currentTimeMillis(),
    val name: String,
    val tasks: List<TemplateTask>
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("name", name)
        val arr = JSONArray()
        tasks.forEach { arr.put(it.toJson()) }
        put("tasks", arr)
    }

    companion object {
        fun fromJson(json: JSONObject): Template {
            val tasks = mutableListOf<TemplateTask>()
            json.optJSONArray("tasks")?.let { arr ->
                for (i in 0 until arr.length()) {
                    arr.optJSONObject(i)?.let { tasks.add(TemplateTask.fromJson(it)) }
                }
            }
            return Template(
                id = json.optLong("id", System.currentTimeMillis()),
                name = json.optString("name", ""),
                tasks = tasks
            )
        }
    }
}

data class UserStats(
    val goldenSeeds: Int = 0,
    val streak: Int = 0,
    val lastActiveDate: String? = null,
    val focusedTasksCompleted: Int = 0
)

data class DailyStats(
    val completed: Int = 0,
    val focusSessions: Int = 0,
    val achievements: Int = 0
)

data class Achievement(
    val id: String,
    val title: String,
    val description: String
)

val achievementsList = listOf(
    Achievement("first_task", "First Step", "Complete your first task."),
    Achievement("high_priority", "Task Master", "Complete a high-priority task."),
    Achievement("first_win", "Big Win!", "Record your first win in the Grove."),
    Achievement("golden_seed", "Golden Touch", "Earn your first Golden Seed."),
    Achievement("streak_3", "On a Roll", "Complete a task 3 days in a row."),
    Achievement("focused_finish", "Deep Focus", "Complete a task using the Focus Timer."),
    Achievement("tree_grower", "Tree Grower", "Fully grow your first tree.")
)

data class Quote(
    val quote: String,
    val author: String
)

val motivationalQuotes = listOf(
    Quote("The secret of getting ahead is getting started.", "Mark Twain"),
    Quote("It's not the load that breaks you down, it's the way you carry it.", "Lou Holtz"),
    Quote("The best way to predict the future is to create it.", "Peter Drucker"),
    Quote("Believe you can and you're halfway there.", "Theodore Roosevelt"),
    Quote("Well done is better than well said.", "Benjamin Franklin"),
    Quote("A year from now you may wish you had started today.", "Karen Lamb")
)

data class CategoryStyle(
    val name: String,
    val bgHex: Long,
    val borderHex: Long,
    val textHex: Long,
    val solidHex: Long,
    val glowHex: Long
)

val defaultCategoriesMap = mapOf(
    "Work" to CategoryStyle("Work", 0x4D0EA5E9, 0x8038BDF8, 0xFFBAE6FD, 0xFF0284C7, 0xFF38BDF8),
    "Personal" to CategoryStyle("Personal", 0x4D84CC16, 0x80A3E635, 0xFFD9F99D, 0xFF65A30D, 0xFFA3E635),
    "Design" to CategoryStyle("Design", 0x4DD946EF, 0x80E879F9, 0xFFF5D0FE, 0xFFC026D3, 0xFFD946EF),
    "Development" to CategoryStyle("Development", 0x4D6366F1, 0x80818CF8, 0xFFC7D2FE, 0xFF4F46E5, 0xFF818CF8),
    "Study" to CategoryStyle("Study", 0x4DF59E0B, 0x80FBBF24, 0xFFFDE68A, 0xFFD97706, 0xFFFBBD23),
    "Urgent" to CategoryStyle("Urgent", 0x4DF43F5E, 0x80FB7185, 0xFFFECDD3, 0xFFE11D48, 0xFFFB7185),
    "Health" to CategoryStyle("Health", 0x4D22C55E, 0x804ADE80, 0xFFBBF7D0, 0xFF16A34A, 0xFF4ADE80),
    "Finance" to CategoryStyle("Finance", 0x4D14B8A6, 0x802DD4BF, 0xFF99F6E4, 0xFF0D9488, 0xFF2DD4BF),
    "Ideas" to CategoryStyle("Ideas", 0x4DF97316, 0x80FB923C, 0xFFFED7AA, 0xFFEA580C, 0xFFFB923C),
    "Chores" to CategoryStyle("Chores", 0x4D78716C, 0x80A8A29E, 0xFFE7E5E4, 0xFF57534E, 0xFFA8A29E),
    "General" to CategoryStyle("General", 0x4D64748B, 0x8094A3B8, 0xFFE2E8F0, 0xFF475569, 0xFF94A3B8)
)
