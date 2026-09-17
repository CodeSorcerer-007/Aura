package com.example.aura.data.parser

import com.example.aura.data.model.RecurringConfig
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.Month
import java.time.temporal.TemporalAdjusters
import java.util.Locale
import java.util.regex.Pattern

data class ParsedTaskResult(
    val title: String,
    val priority: Int,
    val category: String,
    val timeOfDay: String,
    val deadline: String?,
    val recurring: RecurringConfig?,
    val tags: List<String>
)

object TaskParser {

    private val RECURRING_PATTERNS = listOf(
        Pair(Pattern.compile("every\\s+day", Pattern.CASE_INSENSITIVE), "daily"),
        Pair(Pattern.compile("every\\s+week", Pattern.CASE_INSENSITIVE), "weekly"),
        Pair(Pattern.compile("every\\s+month", Pattern.CASE_INSENSITIVE), "monthly")
    )

    private val IN_N_UNITS_PATTERN = Pattern.compile("in\\s+(\\d+)\\s+(day|week|month)s?", Pattern.CASE_INSENSITIVE)
    private val TODAY_TOMORROW_PATTERN = Pattern.compile("\\b(today|tomorrow)\\b", Pattern.CASE_INSENSITIVE)
    private val NEXT_DAY_PATTERN = Pattern.compile("next\\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|week)", Pattern.CASE_INSENSITIVE)
    private val BY_ON_DAY_PATTERN = Pattern.compile("(?:by|on)\\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)", Pattern.CASE_INSENSITIVE)
    private val MONTH_DAY_PATTERN = Pattern.compile("(?:on)?\\s*\\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\\s+(\\d{1,2})\\b", Pattern.CASE_INSENSITIVE)

    private val TAG_PATTERN = Pattern.compile("@(\\w+)")
    private val CATEGORY_PATTERN = Pattern.compile("#(\\w+)")

    fun parse(rawText: String, now: LocalDate = LocalDate.now()): ParsedTaskResult {
        var cleanedText = rawText.trim()
        var recurring: RecurringConfig? = null

        // 1. Recurrence
        for ((pattern, type) in RECURRING_PATTERNS) {
            val matcher = pattern.matcher(cleanedText)
            if (matcher.find()) {
                recurring = RecurringConfig(type)
                cleanedText = matcher.replaceFirst("").trim()
                break
            }
        }

        // 2. Deadlines
        var deadline: String? = null

        // in N days/weeks/months
        val inNMatcher = IN_N_UNITS_PATTERN.matcher(cleanedText)
        if (inNMatcher.find()) {
            val num = inNMatcher.group(1)?.toIntOrNull() ?: 0
            val unit = inNMatcher.group(2)?.lowercase(Locale.ROOT) ?: "day"
            val target = when (unit) {
                "day" -> now.plusDays(num.toLong())
                "week" -> now.plusWeeks(num.toLong())
                "month" -> now.plusMonths(num.toLong())
                else -> now
            }
            deadline = target.toString()
            cleanedText = inNMatcher.replaceFirst("").trim()
        }

        // today / tomorrow
        if (deadline == null) {
            val todayMatcher = TODAY_TOMORROW_PATTERN.matcher(cleanedText)
            if (todayMatcher.find()) {
                val matched = todayMatcher.group(1)?.lowercase(Locale.ROOT)
                val target = if (matched == "tomorrow") now.plusDays(1) else now
                deadline = target.toString()
                cleanedText = todayMatcher.replaceFirst("").trim()
            }
        }

        // next monday/etc/week
        if (deadline == null) {
            val nextMatcher = NEXT_DAY_PATTERN.matcher(cleanedText)
            if (nextMatcher.find()) {
                val dayStr = nextMatcher.group(1)?.lowercase(Locale.ROOT)
                val target = if (dayStr == "week") {
                    now.plusWeeks(1)
                } else {
                    val dow = parseDayOfWeek(dayStr)
                    if (dow != null) now.with(TemporalAdjusters.next(dow)) else now
                }
                deadline = target.toString()
                cleanedText = nextMatcher.replaceFirst("").trim()
            }
        }

        // by/on monday/etc
        if (deadline == null) {
            val byOnMatcher = BY_ON_DAY_PATTERN.matcher(cleanedText)
            if (byOnMatcher.find()) {
                val dayStr = byOnMatcher.group(1)?.lowercase(Locale.ROOT)
                val dow = parseDayOfWeek(dayStr)
                if (dow != null) {
                    var target = now.with(TemporalAdjusters.nextOrSame(dow))
                    if (target.isEqual(now)) target = now.plusWeeks(1)
                    deadline = target.toString()
                }
                cleanedText = byOnMatcher.replaceFirst("").trim()
            }
        }

        // Month Day (e.g., Jan 12)
        if (deadline == null) {
            val monthDayMatcher = MONTH_DAY_PATTERN.matcher(cleanedText)
            if (monthDayMatcher.find()) {
                val monthStr = monthDayMatcher.group(1)?.lowercase(Locale.ROOT)
                val dayNum = monthDayMatcher.group(2)?.toIntOrNull() ?: 1
                val month = parseMonth(monthStr)
                if (month != null) {
                    var year = now.year
                    var target = try {
                        LocalDate.of(year, month, dayNum.coerceIn(1, month.length(false)))
                    } catch (_: Exception) {
                        null
                    }
                    if (target != null && target.isBefore(now)) {
                        target = target.plusYears(1)
                    }
                    if (target != null) {
                        deadline = target.toString()
                    }
                }
                cleanedText = monthDayMatcher.replaceFirst("").trim()
            }
        }

        if (recurring != null && deadline == null) {
            deadline = now.toString()
        }

        // 3. Tags (@tag)
        val tags = mutableListOf<String>()
        val tagMatcher = TAG_PATTERN.matcher(cleanedText)
        while (tagMatcher.find()) {
            tagMatcher.group(1)?.let { tags.add(it) }
        }
        cleanedText = tagMatcher.replaceAll("").trim()

        // 4. Priority
        var priority = 2
        if (cleanedText.contains("!")) {
            priority = 3
            cleanedText = cleanedText.replace("!", "").trim()
        }
        val urgentMatcher = Pattern.compile("\\burgent\\b", Pattern.CASE_INSENSITIVE).matcher(cleanedText)
        if (urgentMatcher.find()) {
            priority = 3
            cleanedText = urgentMatcher.replaceAll("").trim()
        }
        val lowPriorityMatcher = Pattern.compile("\\blow\\s+priority\\b", Pattern.CASE_INSENSITIVE).matcher(cleanedText)
        if (lowPriorityMatcher.find()) {
            priority = 1
            cleanedText = lowPriorityMatcher.replaceAll("").trim()
        }

        // 5. Category (#Category)
        var category = "General"
        val catMatcher = CATEGORY_PATTERN.matcher(cleanedText)
        if (catMatcher.find()) {
            catMatcher.group(1)?.let {
                category = it.replaceFirstChar { c -> if (c.isLowerCase()) c.titlecase(Locale.ROOT) else c.toString() }
            }
            cleanedText = catMatcher.replaceAll("").trim()
        }

        // 6. Time of Day
        var timeOfDay = "afternoon"
        val morningMatcher = Pattern.compile("\\bmorning\\b", Pattern.CASE_INSENSITIVE).matcher(cleanedText)
        if (morningMatcher.find()) {
            timeOfDay = "morning"
            cleanedText = morningMatcher.replaceAll("").trim()
        }
        val eveningMatcher = Pattern.compile("\\b(evening|night)\\b", Pattern.CASE_INSENSITIVE).matcher(cleanedText)
        if (eveningMatcher.find()) {
            timeOfDay = "evening"
            cleanedText = eveningMatcher.replaceAll("").trim()
        }

        // Clean extra spaces
        cleanedText = cleanedText.replace("\\s+".toRegex(), " ").trim()

        return ParsedTaskResult(
            title = if (cleanedText.isEmpty()) rawText else cleanedText,
            priority = priority,
            category = category,
            timeOfDay = timeOfDay,
            deadline = deadline,
            recurring = recurring,
            tags = tags
        )
    }

    private fun parseDayOfWeek(str: String?): DayOfWeek? = when (str) {
        "monday" -> DayOfWeek.MONDAY
        "tuesday" -> DayOfWeek.TUESDAY
        "wednesday" -> DayOfWeek.WEDNESDAY
        "thursday" -> DayOfWeek.THURSDAY
        "friday" -> DayOfWeek.FRIDAY
        "saturday" -> DayOfWeek.SATURDAY
        "sunday" -> DayOfWeek.SUNDAY
        else -> null
    }

    private fun parseMonth(str: String?): Month? = when (str) {
        "jan" -> Month.JANUARY
        "feb" -> Month.FEBRUARY
        "mar" -> Month.MARCH
        "apr" -> Month.APRIL
        "may" -> Month.MAY
        "jun" -> Month.JUNE
        "jul" -> Month.JULY
        "aug" -> Month.AUGUST
        "sep" -> Month.SEPTEMBER
        "oct" -> Month.OCTOBER
        "nov" -> Month.NOVEMBER
        "dec" -> Month.DECEMBER
        else -> null
    }
}
