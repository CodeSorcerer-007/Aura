package com.example.aura.data.local

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.example.aura.data.model.GroveTree
import com.example.aura.data.model.JournalEntry
import com.example.aura.data.model.Task
import com.example.aura.data.model.Template
import com.example.aura.data.model.TemplateTask
import org.json.JSONArray
import org.json.JSONObject

class AuraDbHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_NAME = "aura.db"
        const val DATABASE_VERSION = 1

        const val TABLE_TASKS = "tasks"
        const val TABLE_GROVE = "grove_trees"
        const val TABLE_JOURNAL = "journal_entries"
        const val TABLE_TEMPLATES = "templates"
    }

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("""
            CREATE TABLE $TABLE_TASKS (
                id INTEGER PRIMARY KEY,
                text TEXT NOT NULL,
                completed INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 2,
                category TEXT DEFAULT 'General',
                timeOfDay TEXT DEFAULT 'afternoon',
                deadline TEXT,
                subtasks TEXT,
                win TEXT,
                completionDate TEXT,
                recurring TEXT,
                dependsOn INTEGER,
                notes TEXT,
                attachments TEXT,
                tags TEXT,
                isPinned INTEGER DEFAULT 0,
                focusSessions INTEGER DEFAULT 0,
                isArchived INTEGER DEFAULT 0,
                sortOrder INTEGER DEFAULT 0
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE $TABLE_GROVE (
                id INTEGER PRIMARY KEY,
                growthPoints INTEGER DEFAULT 0,
                maxGrowth INTEGER DEFAULT 10,
                type TEXT NOT NULL
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE $TABLE_JOURNAL (
                date TEXT PRIMARY KEY,
                content TEXT NOT NULL
            )
        """.trimIndent())

        db.execSQL("""
            CREATE TABLE $TABLE_TEMPLATES (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                tasksJson TEXT NOT NULL
            )
        """.trimIndent())
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Handle migrations if needed
    }

    // --- Task Operations ---

    fun getAllTasks(): List<Task> {
        val tasks = mutableListOf<Task>()
        val db = readableDatabase
        val cursor: Cursor = db.query(TABLE_TASKS, null, null, null, null, null, "sortOrder ASC, id ASC")
        cursor.use {
            while (it.moveToNext()) {
                tasks.add(cursorToTask(it))
            }
        }
        return tasks
    }

    fun insertTask(task: Task, sortOrder: Int = 0): Long {
        val db = writableDatabase
        val values = taskToValues(task, sortOrder)
        return db.insertWithOnConflict(TABLE_TASKS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun updateTask(task: Task) {
        val db = writableDatabase
        val values = taskToValues(task)
        db.update(TABLE_TASKS, values, "id = ?", arrayOf(task.id.toString()))
    }

    fun deleteTask(id: Long) {
        val db = writableDatabase
        db.delete(TABLE_TASKS, "id = ?", arrayOf(id.toString()))
    }

    fun saveTasksOrder(orderedTasks: List<Task>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for ((index, task) in orderedTasks.withIndex()) {
                val cv = ContentValues().apply { put("sortOrder", index) }
                db.update(TABLE_TASKS, cv, "id = ?", arrayOf(task.id.toString()))
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun insertTasks(tasks: List<Task>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            for ((index, task) in tasks.withIndex()) {
                db.insertWithOnConflict(TABLE_TASKS, null, taskToValues(task, index), SQLiteDatabase.CONFLICT_REPLACE)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun replaceAllTasks(tasks: List<Task>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_TASKS, null, null)
            for ((index, task) in tasks.withIndex()) {
                db.insert(TABLE_TASKS, null, taskToValues(task, index))
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    private fun taskToValues(task: Task, sortOrder: Int? = null): ContentValues {
        val cv = ContentValues().apply {
            put("id", task.id)
            put("text", task.text)
            put("completed", if (task.completed) 1 else 0)
            put("priority", task.priority)
            put("category", task.category)
            put("timeOfDay", task.timeOfDay)
            put("deadline", task.deadline)
            val subtasksArr = JSONArray()
            task.subtasks.forEach { subtasksArr.put(it.toJson()) }
            put("subtasks", subtasksArr.toString())
            put("win", task.win)
            put("completionDate", task.completionDate)
            put("recurring", task.recurring?.toJson()?.toString())
            put("dependsOn", task.dependsOn)
            put("notes", task.notes)
            val attachArr = JSONArray()
            task.attachments.forEach { attachArr.put(it.toJson()) }
            put("attachments", attachArr.toString())
            val tagsArr = JSONArray()
            task.tags.forEach { tagsArr.put(it) }
            put("tags", tagsArr.toString())
            put("isPinned", if (task.isPinned) 1 else 0)
            put("focusSessions", task.focusSessions)
            put("isArchived", if (task.isArchived) 1 else 0)
        }
        if (sortOrder != null) {
            cv.put("sortOrder", sortOrder)
        }
        return cv
    }

    private fun cursorToTask(c: Cursor): Task {
        val json = JSONObject()
        json.put("id", c.getLong(c.getColumnIndexOrThrow("id")))
        json.put("text", c.getString(c.getColumnIndexOrThrow("text")))
        json.put("completed", c.getInt(c.getColumnIndexOrThrow("completed")) == 1)
        json.put("priority", c.getInt(c.getColumnIndexOrThrow("priority")))
        json.put("category", c.getString(c.getColumnIndexOrThrow("category")))
        json.put("timeOfDay", c.getString(c.getColumnIndexOrThrow("timeOfDay")))
        val dl = c.getString(c.getColumnIndexOrThrow("deadline"))
        if (!dl.isNullOrEmpty()) json.put("deadline", dl)
        val stStr = c.getString(c.getColumnIndexOrThrow("subtasks"))
        if (!stStr.isNullOrEmpty()) json.put("subtasks", JSONArray(stStr))
        val win = c.getString(c.getColumnIndexOrThrow("win"))
        if (!win.isNullOrEmpty()) json.put("win", win)
        val compDate = c.getString(c.getColumnIndexOrThrow("completionDate"))
        if (!compDate.isNullOrEmpty()) json.put("completionDate", compDate)
        val recStr = c.getString(c.getColumnIndexOrThrow("recurring"))
        if (!recStr.isNullOrEmpty()) json.put("recurring", JSONObject(recStr))
        val dep = c.getLong(c.getColumnIndexOrThrow("dependsOn"))
        if (!c.isNull(c.getColumnIndexOrThrow("dependsOn"))) json.put("dependsOn", dep)
        json.put("notes", c.getString(c.getColumnIndexOrThrow("notes")) ?: "")
        val attStr = c.getString(c.getColumnIndexOrThrow("attachments"))
        if (!attStr.isNullOrEmpty()) json.put("attachments", JSONArray(attStr))
        val tagStr = c.getString(c.getColumnIndexOrThrow("tags"))
        if (!tagStr.isNullOrEmpty()) json.put("tags", JSONArray(tagStr))
        json.put("isPinned", c.getInt(c.getColumnIndexOrThrow("isPinned")) == 1)
        json.put("focusSessions", c.getInt(c.getColumnIndexOrThrow("focusSessions")))
        json.put("isArchived", c.getInt(c.getColumnIndexOrThrow("isArchived")) == 1)
        return Task.fromJson(json)
    }

    // --- Grove Trees ---

    fun getAllTrees(): List<GroveTree> {
        val trees = mutableListOf<GroveTree>()
        val db = readableDatabase
        val cursor: Cursor = db.query(TABLE_GROVE, null, null, null, null, null, "id ASC")
        cursor.use {
            while (it.moveToNext()) {
                trees.add(
                    GroveTree(
                        id = it.getLong(it.getColumnIndexOrThrow("id")),
                        growthPoints = it.getInt(it.getColumnIndexOrThrow("growthPoints")),
                        maxGrowth = it.getInt(it.getColumnIndexOrThrow("maxGrowth")),
                        type = it.getString(it.getColumnIndexOrThrow("type"))
                    )
                )
            }
        }
        return trees
    }

    fun insertTree(tree: GroveTree): Long {
        val db = writableDatabase
        val cv = ContentValues().apply {
            put("id", tree.id)
            put("growthPoints", tree.growthPoints)
            put("maxGrowth", tree.maxGrowth)
            put("type", tree.type)
        }
        return db.insertWithOnConflict(TABLE_GROVE, null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun updateTree(tree: GroveTree) {
        val db = writableDatabase
        val cv = ContentValues().apply {
            put("growthPoints", tree.growthPoints)
            put("maxGrowth", tree.maxGrowth)
            put("type", tree.type)
        }
        db.update(TABLE_GROVE, cv, "id = ?", arrayOf(tree.id.toString()))
    }

    fun replaceAllTrees(trees: List<GroveTree>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_GROVE, null, null)
            for (t in trees) {
                val cv = ContentValues().apply {
                    put("id", t.id)
                    put("growthPoints", t.growthPoints)
                    put("maxGrowth", t.maxGrowth)
                    put("type", t.type)
                }
                db.insert(TABLE_GROVE, null, cv)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    // --- Journal Entries ---

    fun getAllJournalEntries(): List<JournalEntry> {
        val entries = mutableListOf<JournalEntry>()
        val db = readableDatabase
        val cursor: Cursor = db.query(TABLE_JOURNAL, null, null, null, null, null, "date DESC")
        cursor.use {
            while (it.moveToNext()) {
                entries.add(
                    JournalEntry(
                        date = it.getString(it.getColumnIndexOrThrow("date")),
                        content = it.getString(it.getColumnIndexOrThrow("content"))
                    )
                )
            }
        }
        return entries
    }

    fun saveJournalEntry(entry: JournalEntry) {
        val db = writableDatabase
        val cv = ContentValues().apply {
            put("date", entry.date)
            put("content", entry.content)
        }
        db.insertWithOnConflict(TABLE_JOURNAL, null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun replaceAllJournalEntries(entries: List<JournalEntry>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_JOURNAL, null, null)
            for (e in entries) {
                val cv = ContentValues().apply {
                    put("date", e.date)
                    put("content", e.content)
                }
                db.insert(TABLE_JOURNAL, null, cv)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    // --- Templates ---

    fun getAllTemplates(): List<Template> {
        val templates = mutableListOf<Template>()
        val db = readableDatabase
        val cursor: Cursor = db.query(TABLE_TEMPLATES, null, null, null, null, null, "id ASC")
        cursor.use {
            while (it.moveToNext()) {
                val id = it.getLong(it.getColumnIndexOrThrow("id"))
                val name = it.getString(it.getColumnIndexOrThrow("name"))
                val tasksJson = it.getString(it.getColumnIndexOrThrow("tasksJson"))
                val tasksList = mutableListOf<TemplateTask>()
                val arr = JSONArray(tasksJson)
                for (i in 0 until arr.length()) {
                    arr.optJSONObject(i)?.let { obj -> tasksList.add(TemplateTask.fromJson(obj)) }
                }
                templates.add(Template(id = id, name = name, tasks = tasksList))
            }
        }
        return templates
    }

    fun insertTemplate(template: Template): Long {
        val db = writableDatabase
        val arr = JSONArray()
        template.tasks.forEach { arr.put(it.toJson()) }
        val cv = ContentValues().apply {
            put("id", template.id)
            put("name", template.name)
            put("tasksJson", arr.toString())
        }
        return db.insertWithOnConflict(TABLE_TEMPLATES, null, cv, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun replaceAllTemplates(templates: List<Template>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_TEMPLATES, null, null)
            for (t in templates) {
                val arr = JSONArray()
                t.tasks.forEach { arr.put(it.toJson()) }
                val cv = ContentValues().apply {
                    put("id", t.id)
                    put("name", t.name)
                    put("tasksJson", arr.toString())
                }
                db.insert(TABLE_TEMPLATES, null, cv)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }
}
