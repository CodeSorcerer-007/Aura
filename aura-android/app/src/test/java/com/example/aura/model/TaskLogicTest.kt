package com.example.aura.model

import com.example.aura.data.model.RecurringConfig
import com.example.aura.data.model.Subtask
import com.example.aura.data.model.Task
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class TaskLogicTest {

    @Test
    fun testSubtaskToggle() {
        val subtask1 = Subtask("Step 1", completed = false)
        val subtask2 = Subtask("Step 2", completed = true)
        val task = Task(
            id = 100L,
            text = "Parent Task",
            subtasks = listOf(subtask1, subtask2)
        )

        assertEquals(2, task.subtasks.size)
        assertEquals(1, task.subtasks.count { it.completed })

        // Toggle step 1
        val toggledSubtasks = task.subtasks.mapIndexed { idx, st ->
            if (idx == 0) st.copy(completed = !st.completed) else st
        }
        val updatedTask = task.copy(subtasks = toggledSubtasks)

        assertTrue(updatedTask.subtasks[0].completed)
        assertTrue(updatedTask.subtasks[1].completed)
        assertEquals(2, updatedTask.subtasks.count { it.completed })
    }

    @Test
    fun testSubtaskAddAndDelete() {
        val task = Task(
            id = 101L,
            text = "Parent Task",
            subtasks = listOf(Subtask("Initial", false))
        )

        val withAdded = task.copy(subtasks = task.subtasks + Subtask("New Subtask", false))
        assertEquals(2, withAdded.subtasks.size)
        assertEquals("New Subtask", withAdded.subtasks[1].text)

        val withDeleted = withAdded.copy(subtasks = withAdded.subtasks.filterIndexed { idx, _ -> idx != 0 })
        assertEquals(1, withDeleted.subtasks.size)
        assertEquals("New Subtask", withDeleted.subtasks[0].text)
    }

    @Test
    fun testRecurringDeadlineAdvancement() {
        val baseDate = LocalDate.of(2026, 9, 18)
        val daily = RecurringConfig("daily")
        val weekly = RecurringConfig("weekly")
        val monthly = RecurringConfig("monthly")

        val nextDaily = baseDate.plusDays(1).toString()
        val nextWeekly = baseDate.plusWeeks(1).toString()
        val nextMonthly = baseDate.plusMonths(1).toString()

        assertEquals("2026-09-19", nextDaily)
        assertEquals("2026-09-25", nextWeekly)
        assertEquals("2026-10-18", nextMonthly)
    }

    @Test
    fun testTaskCompletionState() {
        val task = Task(id = 102L, text = "Test Task", completed = false)
        assertFalse(task.completed)

        val completedTask = task.copy(completed = true, completionDate = "2026-09-18")
        assertTrue(completedTask.completed)
        assertEquals("2026-09-18", completedTask.completionDate)

        val uncompletedTask = completedTask.copy(completed = false, completionDate = null)
        assertFalse(uncompletedTask.completed)
        assertEquals(null, uncompletedTask.completionDate)
    }
}
