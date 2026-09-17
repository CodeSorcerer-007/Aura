package com.example.aura.data.model

import java.time.LocalDate

fun getTodayDateString(): String = LocalDate.now().toString()

val demoTasks: List<Task>
    get() {
        val today = getTodayDateString()
        return listOf(
            Task(
                id = 1L,
                text = "Welcome to Aura! Try capturing a thought below. Add tags like @home",
                completed = false,
                priority = 2,
                category = "General",
                timeOfDay = "morning",
                deadline = null,
                subtasks = emptyList(),
                win = null,
                completionDate = null,
                recurring = null,
                dependsOn = null,
                notes = "",
                attachments = emptyList(),
                tags = listOf("home"),
                isPinned = false,
                focusSessions = 0,
                isArchived = false
            ),
            Task(
                id = 2L,
                text = "Mark a task as complete by clicking the circle",
                completed = true,
                priority = 2,
                category = "General",
                timeOfDay = "morning",
                deadline = null,
                subtasks = emptyList(),
                win = null,
                completionDate = today,
                recurring = null,
                dependsOn = null,
                notes = "You can un-complete it too!",
                attachments = emptyList(),
                tags = emptyList(),
                isPinned = false,
                focusSessions = 1,
                isArchived = false
            ),
            Task(
                id = 3L,
                text = "Create a high-priority task by adding '!' #Urgent",
                completed = false,
                priority = 3,
                category = "Urgent",
                timeOfDay = "afternoon",
                deadline = today,
                subtasks = emptyList(),
                win = null,
                completionDate = null,
                recurring = null,
                dependsOn = null,
                notes = "",
                attachments = emptyList(),
                tags = emptyList(),
                isPinned = true,
                focusSessions = 0,
                isArchived = false
            ),
            Task(
                id = 4L,
                text = "This task repeats every day @routine",
                completed = false,
                priority = 2,
                category = "Personal",
                timeOfDay = "evening",
                deadline = today,
                subtasks = emptyList(),
                win = null,
                completionDate = null,
                recurring = RecurringConfig(type = "daily"),
                dependsOn = null,
                notes = "",
                attachments = emptyList(),
                tags = listOf("routine"),
                isPinned = false,
                focusSessions = 0,
                isArchived = false
            ),
            Task(
                id = 5L,
                text = "Organize project with subtasks",
                completed = false,
                priority = 2,
                category = "Work",
                timeOfDay = "afternoon",
                deadline = null,
                subtasks = listOf(
                    Subtask(text = "Outline proposal", completed = true),
                    Subtask(text = "Draft initial designs", completed = false),
                    Subtask(text = "Get feedback", completed = false)
                ),
                win = null,
                completionDate = null,
                recurring = null,
                dependsOn = null,
                notes = "Subtasks help break down complex goals.",
                attachments = emptyList(),
                tags = emptyList(),
                isPinned = false,
                focusSessions = 0,
                isArchived = false
            ),
            Task(
                id = 6L,
                text = "Explore different views using the bottom navigation",
                completed = false,
                priority = 1,
                category = "Ideas",
                timeOfDay = "evening",
                deadline = null,
                subtasks = emptyList(),
                win = null,
                completionDate = null,
                recurring = null,
                dependsOn = null,
                notes = "Each view gives a different perspective on your tasks.",
                attachments = emptyList(),
                tags = emptyList(),
                isPinned = false,
                focusSessions = 0,
                isArchived = false
            )
        )
    }
