package com.example.aura.data.model

import org.json.JSONArray
import org.json.JSONObject

data class Subtask(
    val text: String,
    val completed: Boolean = false
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("text", text)
        put("completed", completed)
    }

    companion object {
        fun fromJson(json: JSONObject): Subtask = Subtask(
            text = json.optString("text", ""),
            completed = json.optBoolean("completed", false)
        )
    }
}

data class RecurringConfig(
    val type: String // "daily", "weekly", "monthly"
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("type", type)
    }

    companion object {
        fun fromJson(json: JSONObject): RecurringConfig = RecurringConfig(
            type = json.optString("type", "daily")
        )
    }
}

data class AttachmentMeta(
    val id: String,
    val name: String,
    val type: String
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("name", name)
        put("type", type)
    }

    companion object {
        fun fromJson(json: JSONObject): AttachmentMeta = AttachmentMeta(
            id = json.optString("id", ""),
            name = json.optString("name", ""),
            type = json.optString("type", "")
        )
    }
}

data class Task(
    val id: Long,
    val text: String,
    val completed: Boolean = false,
    val priority: Int = 2, // 1 = low, 2 = medium, 3 = high
    val category: String = "General",
    val timeOfDay: String = "afternoon", // "morning", "afternoon", "evening"
    val deadline: String? = null,
    val subtasks: List<Subtask> = emptyList(),
    val win: String? = null,
    val completionDate: String? = null,
    val recurring: RecurringConfig? = null,
    val dependsOn: Long? = null,
    val notes: String = "",
    val attachments: List<AttachmentMeta> = emptyList(),
    val tags: List<String> = emptyList(),
    val isPinned: Boolean = false,
    val focusSessions: Int = 0,
    val isArchived: Boolean = false
) {
    fun toJson(): JSONObject = JSONObject().apply {
        put("id", id)
        put("text", text)
        put("completed", completed)
        put("priority", priority)
        put("category", category)
        put("timeOfDay", timeOfDay)
        put("deadline", deadline ?: JSONObject.NULL)
        val subtasksArray = JSONArray()
        subtasks.forEach { subtasksArray.put(it.toJson()) }
        put("subtasks", subtasksArray)
        put("win", win ?: JSONObject.NULL)
        put("completionDate", completionDate ?: JSONObject.NULL)
        if (recurring != null) {
            put("recurring", recurring.toJson())
        } else {
            put("recurring", JSONObject.NULL)
        }
        put("dependsOn", dependsOn ?: JSONObject.NULL)
        put("notes", notes)
        val attachmentsArray = JSONArray()
        attachments.forEach { attachmentsArray.put(it.toJson()) }
        put("attachments", attachmentsArray)
        val tagsArray = JSONArray()
        tags.forEach { tagsArray.put(it) }
        put("tags", tagsArray)
        put("isPinned", isPinned)
        put("focusSessions", focusSessions)
        put("isArchived", isArchived)
    }

    companion object {
        fun fromJson(json: JSONObject): Task {
            val subtasks = mutableListOf<Subtask>()
            json.optJSONArray("subtasks")?.let { arr ->
                for (i in 0 until arr.length()) {
                    arr.optJSONObject(i)?.let { subtasks.add(Subtask.fromJson(it)) }
                }
            }

            val attachments = mutableListOf<AttachmentMeta>()
            json.optJSONArray("attachments")?.let { arr ->
                for (i in 0 until arr.length()) {
                    arr.optJSONObject(i)?.let { attachments.add(AttachmentMeta.fromJson(it)) }
                }
            }

            val tags = mutableListOf<String>()
            json.optJSONArray("tags")?.let { arr ->
                for (i in 0 until arr.length()) {
                    tags.add(arr.optString(i))
                }
            }

            val recurring = if (json.has("recurring") && !json.isNull("recurring")) {
                val recObj = json.optJSONObject("recurring")
                if (recObj != null) RecurringConfig.fromJson(recObj) else null
            } else null

            return Task(
                id = json.optLong("id", System.currentTimeMillis()),
                text = json.optString("text", ""),
                completed = json.optBoolean("completed", false),
                priority = json.optInt("priority", 2),
                category = json.optString("category", "General"),
                timeOfDay = json.optString("timeOfDay", "afternoon"),
                deadline = if (json.has("deadline") && !json.isNull("deadline")) json.optString("deadline") else null,
                subtasks = subtasks,
                win = if (json.has("win") && !json.isNull("win")) json.optString("win") else null,
                completionDate = if (json.has("completionDate") && !json.isNull("completionDate")) json.optString("completionDate") else null,
                recurring = recurring,
                dependsOn = if (json.has("dependsOn") && !json.isNull("dependsOn")) json.optLong("dependsOn") else null,
                notes = json.optString("notes", ""),
                attachments = attachments,
                tags = tags,
                isPinned = json.optBoolean("isPinned", false),
                focusSessions = json.optInt("focusSessions", 0),
                isArchived = json.optBoolean("isArchived", false)
            )
        }
    }
}
