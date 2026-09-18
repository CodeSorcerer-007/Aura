package com.example.aura.parser

import com.example.aura.data.parser.TaskParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalDate

class TaskParserTest {

    private val fixedDate = LocalDate.of(2026, 9, 18) // Friday

    @Test
    fun testDefaultTaskParsing() {
        val res = TaskParser.parse("Buy milk", now = fixedDate)
        assertEquals("Buy milk", res.title)
        assertEquals(2, res.priority)
        assertEquals("General", res.category)
        assertEquals("afternoon", res.timeOfDay)
        assertNull(res.deadline)
        assertNull(res.recurring)
        assertTrue(res.tags.isEmpty())
    }

    @Test
    fun testPriorityExtraction() {
        val highExclamation = TaskParser.parse("Submit report!", now = fixedDate)
        assertEquals(3, highExclamation.priority)
        assertEquals("Submit report", highExclamation.title)

        val highUrgent = TaskParser.parse("Fix server crash urgent", now = fixedDate)
        assertEquals(3, highUrgent.priority)
        assertEquals("Fix server crash", highUrgent.title)

        val low = TaskParser.parse("Clean desk low priority", now = fixedDate)
        assertEquals(1, low.priority)
        assertEquals("Clean desk", low.title)
    }

    @Test
    fun testCategoryExtraction() {
        val workTask = TaskParser.parse("Design new landing page #Design", now = fixedDate)
        assertEquals("Design", workTask.category)
        assertEquals("Design new landing page", workTask.title)

        val personalTask = TaskParser.parse("Call mom #personal", now = fixedDate)
        assertEquals("Personal", personalTask.category)
        assertEquals("Call mom", personalTask.title)
    }

    @Test
    fun testTimeOfDayExtraction() {
        val morningTask = TaskParser.parse("Morning run", now = fixedDate)
        assertEquals("morning", morningTask.timeOfDay)

        val eveningTask = TaskParser.parse("Read book evening", now = fixedDate)
        assertEquals("evening", eveningTask.timeOfDay)
    }

    @Test
    fun testTagExtraction() {
        val taskWithTags = TaskParser.parse("Review pull request @urgent @work", now = fixedDate)
        assertEquals(listOf("urgent", "work"), taskWithTags.tags)
        assertEquals("Review pull request", taskWithTags.title)
    }

    @Test
    fun testRecurrenceExtraction() {
        val daily = TaskParser.parse("Drink water every day", now = fixedDate)
        assertNotNull(daily.recurring)
        assertEquals("daily", daily.recurring?.type)
        assertEquals(fixedDate.toString(), daily.deadline)

        val weekly = TaskParser.parse("Team sync every week", now = fixedDate)
        assertNotNull(weekly.recurring)
        assertEquals("weekly", weekly.recurring?.type)

        val monthly = TaskParser.parse("Pay rent every month", now = fixedDate)
        assertNotNull(monthly.recurring)
        assertEquals("monthly", monthly.recurring?.type)
    }

    @Test
    fun testRelativeDeadlines() {
        val tomorrow = TaskParser.parse("Dentist appointment tomorrow", now = fixedDate)
        assertEquals(fixedDate.plusDays(1).toString(), tomorrow.deadline)

        val in3Days = TaskParser.parse("Finish essay in 3 days", now = fixedDate)
        assertEquals(fixedDate.plusDays(3).toString(), in3Days.deadline)

        val in2Weeks = TaskParser.parse("Sprint review in 2 weeks", now = fixedDate)
        assertEquals(fixedDate.plusWeeks(2).toString(), in2Weeks.deadline)
    }
}
