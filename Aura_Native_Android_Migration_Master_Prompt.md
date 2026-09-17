# Aura — Native Android Migration Master Prompt

You are a senior Android engineer, Jetpack Compose UI engineer, and software migration specialist.

I have an existing application called **Aura**.

I originally built Aura as a React web application and then attempted to package it for Android using a web wrapper / Capacitor-style approach. The result technically runs, but the Android version has serious layout, safe-area, scrolling, keyboard, bottom-navigation, and responsive issues.

I am **NOT** asking you to redesign Aura.

I am **NOT** asking you to improve Aura.

I am **NOT** asking you to add more features.

I am asking you to **REBUILD THE EXISTING AURA APP AS A TRUE NATIVE ANDROID APPLICATION** while preserving the existing app's functionality, visual identity, interactions, terminology, animations, information architecture, and overall appearance as faithfully as technically possible.

The original source code and reference screenshots are provided to you.

## The single most important requirement

> **EXISTING AURA APP = SOURCE OF TRUTH**

The original JavaScript/React source defines the application's behavior and functionality.

The supplied Android screenshots define the visual target and demonstrate the defects that must be corrected.

Build the native Android application so that it is functionally the **same Aura application**, visually the **same Aura application**, but without the limitations and layout defects caused by the web wrapper.

---

## 1. Absolute scope lock

Do **not** turn this into a product redesign.

Do **not** add features because you think they would make a better productivity application.

Do **not** add:

- user accounts
- sign-in
- cloud sync
- backend
- server
- AI assistant
- AI task generation
- subscriptions
- advertisements
- analytics
- social features
- collaboration
- cloud backup
- widgets
- home-screen shortcuts
- wearable support
- calendar integration
- email integration
- location features
- contacts integration
- new reminder systems
- additional task types
- additional navigation destinations
- onboarding screens that did not exist
- tutorials that did not exist
- new settings
- new productivity metrics
- a new gamification system
- Material You redesign
- redesigned cards
- redesigned colors
- redesigned navigation
- replacement of Aura's visual identity with generic Android UI

Do not simplify existing functionality.

Do not remove existing functionality.

Do not rename existing concepts unless there is a technical Android requirement.

Do not change the application's information architecture.

Do not turn existing modals into unrelated Android screens.

Do not replace the visual design with standard Material 3 components just because they are easier.

Use Android/Jetpack components internally where appropriate, but the **USER-FACING DESIGN must remain Aura**.

The final application should feel like:

> **"the exact Aura application I already built, but properly engineered as a native Android app."**

---

## 2. Technology requirements

Build a **real native Android application**.

### Do NOT use

- WebView
- Capacitor
- Cordova
- Electron
- a browser wrapper
- HTML/CSS pretending to be native
- an embedded React website

### Use

- Kotlin
- Jetpack Compose
- AndroidX
- a single Activity architecture
- ViewModel/state-driven UI
- Kotlin Coroutines
- StateFlow where appropriate
- Room for structured persistent application data
- DataStore for preferences/settings where appropriate
- Android platform APIs for files, notifications, clipboard, sharing, lifecycle, etc.

Use the latest stable Android/Kotlin/Compose/AndroidX toolchain available in the development environment, while targeting:

```text
targetSdk = 36
Android 16 / API 36
```

Use a sensible minimum SDK that provides broad modern Android support, preferably API 26+ unless the project/environment requires another value.

Do not use obsolete Android APIs simply because they resemble the old web implementation.

---

## 3. Migration philosophy

This is a **PORT, not a redesign**.

Think of the task as:

```text
React/JavaScript implementation
        ↓
Native Kotlin/Compose implementation
```

The implementation details may change.

The user-visible application must not.

### Implementation substitutions

| Existing web mechanism | Native Android implementation |
|---|---|
| `localStorage` | DataStore / Room |
| IndexedDB | native app-private file storage + Room metadata |
| Browser Notification API | Android NotificationManager / notification channels |
| Tone.js | native Android audio |
| HTML file input | Android Storage Access Framework |
| Browser clipboard API | Android ClipboardManager |
| browser "open attachment in new tab" | Android `ACTION_VIEW` / content URI |
| CSS fixed positioning | Compose layout architecture |
| CSS safe-area variables | Android WindowInsets |

These are **implementation substitutions only**.

They must **not** result in changed user-facing behavior.

---

## 4. First task: complete source audit

Before writing the Android code, fully inspect the supplied Aura JavaScript source.

Do **not** rely on only the first portion of the file.

The original file contains:

- state
- business logic
- task parsing
- storage
- UI components
- animations
- themes
- modals
- achievement logic
- Grove logic
- focus timer
- journal
- review calculations
- import/export
- attachment handling
- notification handling
- keyboard shortcuts
- command palette
- archive functionality
- custom themes
- categories
- dependencies
- templates
- and more

Create an internal **feature parity checklist** before implementation.

Every feature found in the original code must be represented in the native implementation.

If something exists in the source, do not silently omit it.

If something does **not** exist in the source, do not invent it.

The screenshots are **visual references**.

The source code is the **behavioral reference**.

Do not use screenshots alone to infer functionality.

---

## 5. Existing Aura data model

Preserve the application's task model.

Tasks contain concepts including:

- `id`
- `text`
- `completed`
- `priority`
- `category`
- `timeOfDay`
- `deadline`
- `subtasks`
- `win`
- `completionDate`
- `recurring`
- `dependsOn`
- `notes`
- `attachments`
- `tags`
- `isPinned`
- `focusSessions`
- `isArchived`

Do not replace this model with a simplistic "title + completed" todo structure.

The migration must retain all meaningful information.

The backup/import format should preserve the same logical data so that Aura's data model remains compatible and understandable.

The original application stores attachments separately and stores their metadata on tasks. Preserve this architecture conceptually.

---

## 6. Existing storage behavior

The original app uses:

- localStorage for persistent application preferences/data
- IndexedDB named `AuraDB`
- an `attachments` object store for attached files

### Native implementation

#### Structured data

Use Room for tasks and other relational/application entities.

#### Preferences

Use DataStore for settings/preferences such as:

- selected theme
- sound effects enabled
- auto archive enabled
- notifications enabled
- shutdown/end-of-day time
- launch state
- other simple preferences from the source

#### Attachments

Store attachment binaries in app-private internal storage, for example:

```text
filesDir/attachments/<uuid>
```

Store metadata in Room:

- id
- original filename
- MIME type
- task ID
- storage path/reference

Do **not** request broad filesystem access just to implement Aura.

Use Android's modern storage model.

For user-facing import/export, use the system document picker.

---

## 7. Aura features that must all remain

The native version must include the same five primary views:

1. Flow
2. Projects / Constellations
3. Grove
4. Journal
5. Review

Keep the same bottom navigation concept and visual hierarchy.

Do not add a sixth navigation destination.

---

## 8. Flow view

Preserve the existing Flow behavior.

The Flow view contains:

- current day/date panel
- filters
- pinned tasks
- morning tasks
- afternoon tasks
- evening tasks
- completed tasks

Filters include:

- All
- High Priority
- Due This Week
- Category
- Tag

Preserve their behavior.

Task cards must continue supporting the existing behaviors:

- complete/uncomplete
- delete
- pin/unpin
- focus
- archive
- reorder
- task detail
- tags
- deadlines
- recurring indicators
- focus session count
- attachment count
- dependency state
- subtask progress
- category styling
- priority-based visual glow

Do not simplify the task card.

---

## 9. Task card visual behavior

The original task card has:

- rounded rectangular card
- category-dependent translucent background
- category-dependent border
- category badge
- priority-dependent glow
- completion state
- pin state
- action icons
- tags
- deadline
- recurring information
- dependency indicator
- subtask progress
- focus session counter
- attachment counter

Recreate these visually in Compose.

Do **not** replace them with a generic Material card.

Do **not** remove the glow effect.

Do **not** replace the iconography with unrelated icons.

Use vector/custom Compose icons faithful to the original SVG icon paths.

---

## 10. Intelligent task creation must remain

The original task input is not merely plain text.

Preserve the existing natural-language parsing logic.

The parser currently supports recurring patterns such as:

- every day
- every week
- every month

Deadline patterns including:

- in N days
- in N weeks
- in N months
- today
- tomorrow
- next Monday
- next Tuesday
- etc.
- next week
- by Monday
- on Monday
- month/day style input such as Jan 12

Tags:

```text
@tag
```

Category:

```text
#Category
```

Priority:

```text
!
urgent
low priority
```

Time-of-day words:

```text
morning
evening
night
```

Default behaviors must remain equivalent to the source.

For example:

```text
Finish report tomorrow ! #Work @college
```

must continue to produce equivalent task metadata.

Do **not** replace this with a completely different parser.

---

## 11. Recurring task behavior

Preserve the existing recurrence semantics.

For recurring tasks:

- completing the current instance advances the next deadline
- a completed historical instance is retained as a completed task entry
- recurring state is not simply discarded
- daily recurrence advances one day
- weekly recurrence advances seven days
- monthly recurrence advances one month

Do not turn recurring tasks into a generic Android reminder.

---

## 12. Completion / growth / wins

Preserve the existing completion behavior.

Completing a task:

- updates completion state
- records completion date
- updates Grove growth where applicable
- triggers sound effects when enabled
- can trigger the existing Win modal for qualifying tasks
- updates achievements
- updates streak logic

High-priority non-recurring tasks can trigger the existing:

> **"Great Work!"**

win flow.

Do not remove this.

---

## 13. Grove

Preserve the existing Grove concept.

Grove includes:

- Golden Seeds
- planting
- tree growth
- different tree types
- seasonal background treatment
- accomplishment journal

Tree types include the existing types in the source.

The existing achievement system controls access to some tree types.

Preserve that relationship.

Do not replace Grove with a generic statistics screen.

Do not redesign it into a normal chart.

The screen should still feel like Aura.

---

## 14. Achievements

Preserve the existing achievements.

The current achievement concepts include:

- First Step
- Task Master
- Big Win!
- Golden Touch
- On a Roll
- Deep Focus
- Tree Grower

Preserve:

- trigger conditions
- unlock state
- descriptions
- visual feedback

The existing achievement toast should remain.

---

## 15. Focus Timer

Preserve the Focus Timer exactly.

Existing behavior includes:

- default 25 minutes
- minus 5 minutes
- plus 5 minutes
- cannot change duration while active
- circular progress indicator
- start
- pause
- end session
- sound options:
  - Off
  - Pink
  - Brown
  - White

Preserve:

- countdown
- progress animation
- completion behavior
- focus session counter
- focused-task statistics
- completion notification

### Important

Do not depend on Tone.js or browser audio.

Implement the same user-facing sound behavior using native Android audio.

Use an appropriate native audio solution capable of generating/playing pink, brown, and white noise.

The audio must work offline.

---

## 16. Focus timer + background behavior

The focus timer must behave correctly when the app is:

- foregrounded
- backgrounded
- screen temporarily locked

Do **not** make the timer rely on a JavaScript `setInterval` surviving indefinitely.

Calculate remaining time using real elapsed time / monotonic clock semantics.

When the focus session reaches zero:

- complete the task using Aura's existing behavior
- increment focus session statistics
- show the existing completion notification when notifications are enabled

Do not create an entirely new notification system.

You are only making the existing behavior reliable on Android.

---

## 17. Daily Momentum

Preserve Daily Momentum.

The source uses a goal of five completed tasks.

The progress indicator should visually behave like the existing implementation.

When the existing threshold is reached, preserve the Golden Seed award logic.

Do not modify the progression model.

---

## 18. Streak and auto-archive

Preserve the existing streak logic.

The app tracks:

- current streak
- last active date
- today's task completion

Preserve the existing relationship between consecutive active days.

Preserve automatic archiving of yesterday's tasks when that setting is enabled.

Do not turn this into a new background productivity system.

---

## 19. Projects / Constellations

This screen must remain visually recognizable as:

> **Your Constellations**

with:

> **An overview of your projects and goals.**

Projects are derived from task categories.

Each category has a central visual node with surrounding task nodes.

Preserve:

- central category circle
- category colors
- connecting lines
- task nodes
- priority-dependent node size
- task completion visual state
- animation
- save-template action

Do **not** redesign Constellations into a normal RecyclerView or grid of project cards.

It is supposed to look like a constellation.

The layout can become responsive so it works correctly on Android, but the visual concept, proportions, hierarchy, and atmosphere must remain the same.

---

## 20. Grove visuals

Preserve the custom drawn tree visuals.

The original implementation contains:

- Oak
- Pine
- Cherry Blossom

with animated growth.

Reimplement them using Compose Canvas, Path, or vector drawing as appropriate.

Do not substitute stock icons.

---

## 21. Journal

Preserve Journal functionality:

- Daily Journal title
- selected date
- date picker
- prompt chips
- journal text area
- Save
- saved confirmation
- completed tasks for selected date

Existing prompts include concepts such as:

- "What went well today?"
- "What am I grateful for?"
- "What was the biggest challenge?"
- "One thing I learned today is..."
- "How can I make tomorrow better?"

Preserve the existing content and behavior from the source.

---

## 22. Review

Preserve the Review screen.

It currently contains concepts including:

- Productivity Heatmap
- Current Streak
- Category Breakdown
- Tag Breakdown
- Unfinished Business / stale tasks
- Achievements

Preserve all existing calculations.

Do not redesign the Review page into something else.

The heatmap must remain visually similar to the original.

The category and tag breakdowns must continue to reflect actual task data.

---

## 23. Search

Preserve Search.

Search currently supports:

- task text
- category
- notes
- tags

Search results open the corresponding task detail.

The search overlay should behave like the original.

Use native Compose controls, but keep the same visual treatment:

- dark overlay
- rounded input
- result list
- Aura styling

---

## 24. Task detail

Preserve Task Detail.

It allows:

- edit task text
- edit notes
- edit tags
- view attachments
- add attachment
- remove attachment
- set dependency
- remove dependency
- save
- cancel

Do not remove attachments or dependencies just because they are inconvenient to port.

---

## 25. Attachments

The original allows attaching files to tasks.

Native version:

Use Android's system document picker.

Prefer:

```text
ACTION_OPEN_DOCUMENT
```

with suitable MIME configuration so the user can select files.

Support arbitrary file formats as the original intent does.

When an attachment is selected:

- copy/store it in Aura's app-private attachment storage
- save metadata
- display the original filename

When the user taps an attachment:

- open it with the appropriate installed application
- use a safe content URI / FileProvider approach
- do not expose raw private filesystem paths

Deleting a task should clean up its attachment files, matching the source behavior.

---

## 26. Dependencies

Preserve task dependencies.

The user must still be able to:

- choose a prerequisite task
- see the dependency
- have tasks become locked when the dependency is not complete
- complete the prerequisite
- subsequently interact with the dependent task

Preserve the existing anti-circular-dependency behavior.

---

## 27. Templates

Preserve:

- Save Template
- saved state
- template suggestion
- Apply Template
- Add Task as Written

Do not remove template-related behavior.

---

## 28. Settings

Preserve the existing Settings contents.

Current settings include concepts such as:

- Theme
- Sound Effects
- Auto-archive yesterday's tasks
- Notifications
- Custom Categories
- End of Day Time
- Export
- Import
- View Archive
- Create Custom Theme

Do not add unrelated Android settings into this screen.

---

## 29. Themes

This is **VERY IMPORTANT**.

Aura already has an extensive theme system.

Preserve **ALL built-in themes** from the source.

The source includes themes including:

- OLED Dark
- Clean Light
- Cyberpunk
- Crimson
- Forest
- Ocean
- Dune
- Sakura
- Solarized
- Dracula
- Nord
- Gruvbox
- Monokai
- Rosé Pine
- Matcha
- Latte

Preserve the actual colors defined by the source.

Preserve their distinctive animated backgrounds/effects.

Examples include:

- dark aura pulse
- light sun-ray movement
- cyberpunk grid/scanline
- forest particles/fireflies
- sakura falling petals
- crimson mist/embers
- ocean waves/bubbles/fish
- dune sand/haze
- solarized circuit/blueprint effect
- Nord aurora/snow
- Monokai scanlines/glitch
- Latte steam
- Gruvbox gears/grid
- Rosé Pine stars/nebula
- Matcha ripples

Do not flatten all themes into simple static background colors.

Do not replace them with generic Material dynamic colors.

If Compose Canvas, shaders, paths, particles, or animated DrawScope are needed, use them.

The final themes should remain recognizably Aura.

---

## 30. Custom Theme Creator

Preserve Custom Theme Creator.

It currently allows the user to create a named theme with configurable colors including:

- Background
- Secondary Background
- Primary Text
- Secondary Text
- Accent

Persist custom themes.

Allow them to be selected just like existing themes.

---

## 31. Mindful Minute

Preserve Mindful Minute.

The existing behavior has the breathing sequence:

- Breathe in...
- Hold...
- Breathe out...

with the existing timing sequence from the source.

Preserve:

- dark fullscreen overlay
- animated expanding/contracting circle
- prompt text
- End Session

Do not turn it into a completely different meditation application.

---

## 32. Shutdown Ritual

Preserve the existing "end of day" ritual logic.

The application already has an End of Day Time setting.

The existing ritual contains multiple messages and a Next flow.

Preserve the interaction.

Do not expand it into a new reminder system.

If Android background scheduling is required to make an **existing** behavior reliable, use the minimum Android mechanism necessary.

Do not add new user-visible functionality.

---

## 33. Archive

Preserve:

- Archived Tasks
- Restore
- Delete
- completed date
- archived task state

The archive must remain accessible from Settings.

---

## 34. Share / Today's Wins

Preserve the existing Today's Wins flow.

The source generates a summary containing:

- Tasks Completed
- Focus Sessions
- Achievements

The existing modal allows the user to copy the summary.

Use Android `ClipboardManager` for the copy operation.

Do not automatically add additional share UI that was not in the original.

---

## 35. Command Palette

Preserve the command palette concept.

The source supports commands such as:

- New Task
- Open Search
- Open Settings
- Toggle Theme: Dark
- Toggle Theme: Light
- Go to Flow
- Go to Projects
- Go to Grove
- Go to Journal
- Go to Review

Keep the same concept and visual style.

On Android, adapt keyboard behavior naturally, but do not create random new commands.

---

## 36. Keyboard shortcuts

The existing desktop/web implementation has keyboard shortcuts.

Preserve the logical shortcuts where a hardware keyboard is available.

Existing concepts include:

```text
N = new task
S = settings
1 = Flow
2 = Projects
3 = Grove
4 = Journal
5 = Review
Ctrl/Cmd + P = command palette
Escape = close active overlay/modal
```

On touch-only devices, these should simply be irrelevant.

Do not create visible buttons for keyboard shortcuts that did not exist.

---

## 37. The most important UI requirement: Android layout / safe areas

The screenshots clearly show the wrapper suffering from Android layout problems.

Fix these at the **native layout architecture level**.

Do **not** patch them with random hard-coded top/bottom margins.

Android 16 uses edge-to-edge behavior.

Therefore:

- render correctly edge-to-edge
- consume WindowInsets correctly
- handle status bars
- handle gesture/navigation bars
- handle IME/keyboard insets
- handle cutouts if present
- avoid double-applying inset padding
- never place visible content underneath system UI accidentally

Use appropriate Android WindowInsets / Compose insets APIs.

The content should visually begin at the same place as intended by the Aura design, not be pushed down by arbitrary extra blank space.

---

## 38. Fix the status bar problem

In the screenshots:

- status bar content sits at the top
- the application content is too close to / can interact incorrectly with the system area
- the web safe-area mechanism is not behaving like a proper native Android layout

Fix this.

The status bar area must remain visually consistent with the current Aura theme.

For the dark theme:

- black/dark background
- light system icons

For light themes:

- appropriate light background
- dark system icons

Do not add an ugly permanent fake status-bar rectangle.

Use native system window behavior.

---

## 39. Fix the bottom navigation overlap

**THIS IS ONE OF THE MOST IMPORTANT BUGS.**

In the screenshots:

the bottom navigation pill sits above the screen bottom,

the Capture Thought bar sits beneath/near it,

and page content is allowed to continue underneath them.

This causes:

- Review content to be hidden
- Grove content to be hidden
- Flow sections to be hidden
- project/constellation content to be hidden
- achievements to be obscured
- headings to be obscured

The native app must preserve the floating visual style but **never allow important content to be permanently covered**.

Implement the bottom UI as a known bottom dock/layout region.

The scrolling content must reserve enough bottom space for:

- bottom navigation
- Capture Thought bar
- system navigation/gesture inset
- a small visual breathing margin

Do not simply increase generic `paddingBottom` until it "looks okay."

Calculate the actual occupied bottom layout.

The result must work across different screen heights.

---

## 40. Fix the Capture Thought bar

Preserve the floating Capture Thought field.

It should visually resemble the existing one:

- rounded pill
- dark translucent background
- border
- text input
- plus button
- bottom placement

But on Android:

- it must never be behind the gesture navigation indicator
- it must never be cut off
- it must not overlap the bottom navigation
- it must move correctly when the keyboard appears
- the user must still be able to scroll through content underneath it
- the IME must not hide the input

When the keyboard opens, use proper IME insets.

Do not use arbitrary `y` offsets.

---

## 41. Fix the five-item bottom navigation

The screenshots show the five-item bottom nav becoming cramped/clipped.

The navigation items are:

- Flow
- Projects
- Grove
- Journal
- Review

The final Android version must make all five usable on narrow phones.

Do not let:

- Review get clipped
- labels disappear accidentally
- items overlap
- icons overlap labels
- the navigation pill exceed screen bounds

Use a responsive five-column/equal-weight arrangement or equivalent native layout.

Each destination should have a comfortable Android touch target.

Keep the same visual treatment:

- dark translucent pill
- rounded shape
- active-item capsule/background
- line-art icon style
- same general spacing and proportions

Do **not** redesign the navigation into a conventional full-width Android NavigationBar.

Keep Aura's floating pill aesthetic.

---

## 42. Fix Flow task text wrapping

One screenshot exposes a serious responsive problem:

a long task text is forced into an extremely narrow vertical column because the right-side controls consume too much width.

For example, text is wrapping approximately like:

```text
Welcome
to Aura!
Try
capturing
a
thought
below.
```

That is **NOT** the intended Aura appearance.

The native task card must:

- give the task text the majority of available width
- allow normal multi-line wrapping
- keep the category/action controls aligned
- preserve all existing controls
- preserve the visual hierarchy

The task title/body should not collapse into a narrow column on normal portrait Android phones.

Do not simply reduce the font size until it fits.

Fix the actual layout.

---

## 43. Fix Constellations responsiveness

The constellation view currently uses large fixed visual regions.

In the screenshots, this leads to:

- large empty areas
- partial visual visibility
- content being obscured by bottom controls
- awkward scrolling behavior

Do **not** redesign the constellation concept.

Instead:

- maintain the same visual proportions
- make the constellation canvas responsive
- preserve centering
- allow natural vertical scrolling
- ensure bottom elements are not covered
- ensure the canvas remains completely reachable

The screen should still feel like the original desktop/web Aura design, just correctly adapted to a phone.

---

## 44. Fix Grove content visibility

In the screenshots:

the bottom of Grove content is being covered by the fixed UI.

The Accomplishment Journal heading/content must remain reachable.

Nothing important should sit permanently underneath:

- navigation
- capture bar
- gesture area

The native version must solve this structurally.

---

## 45. Fix Review content visibility

The same problem occurs in Review.

The Achievements section and lower content are partially hidden behind bottom controls.

Make the Review content fully scrollable.

Do **not** modify the Review data or metrics.

Only fix the layout/viewport behavior.

---

## 46. Modals must respect system insets

All existing modals should become proper native Compose overlays/dialog-like surfaces.

Examples:

- Settings
- Search
- Task Detail
- Dependency Selector
- Focus View
- Win Modal
- Template Suggestion
- Archive
- Share Summary
- Mindful Minute
- Theme Creator
- Command Palette
- Planting Animation
- Confirmation dialogs

Requirements:

- never clip at the status bar
- never clip at the bottom system area
- allow internal scrolling where content is tall
- respect keyboard/IME
- maintain existing dark overlay
- preserve rounded corners
- preserve visual hierarchy
- preserve animations

Do not replace every modal with the default Android AlertDialog appearance.

---

## 47. Back button / predictive back

Implement Android 16 predictive back correctly.

Do not rely on deprecated `onBackPressed()` behavior.

Back should intelligently close the currently active Aura overlay/modal first, following the existing source ordering.

For example:

1. command palette
2. search
3. settings
4. task detail
5. focus
6. mindful minute
7. theme creator
8. other active overlays

Only after appropriate overlays are closed should the Activity navigate/exit.

Preserve the existing logical behavior.

---

## 48. Notifications

Replace the browser Notification API with native Android notifications.

The source currently has notification functionality.

Preserve existing user-visible notification behavior.

Use:

- NotificationManager
- notification channel(s)
- `POST_NOTIFICATIONS` on Android 13+
- proper permission handling
- notification click behavior where relevant

The settings toggle must remain conceptually the same.

Do not add a large suite of new notification types.

Do not turn Aura into a notification-heavy task manager.

Only use native Android to make the already-existing notification behavior reliable.

---

## 49. Storage permissions

Do **not** request:

```text
MANAGE_EXTERNAL_STORAGE
```

Do **not** request broad storage permissions unnecessarily.

Use:

- app-private internal storage
- Room
- DataStore
- Storage Access Framework

for the functionality that Aura already has.

When exporting data, use:

```text
ACTION_CREATE_DOCUMENT
```

When importing data, use:

```text
ACTION_OPEN_DOCUMENT
```

The user should be able to choose where their Aura JSON backup is stored.

---

## 50. Import / export

Preserve the existing JSON backup concept.

The exported file should use the same naming convention:

```text
aura-backup-YYYY-MM-DD.json
```

Preserve the logical data fields contained in the source export, including:

- tasks
- templates
- stats
- achievements
- theme
- grove
- custom categories
- launch state
- journal entries
- custom themes
- shutdown time
- sound settings
- auto-archive setting
- notification setting

Do not silently drop data during export.

Import should validate malformed JSON gracefully.

Display the same conceptual success/error feedback.

---

## 51. Audio

The web implementation uses Tone.js.

Do **not** load JavaScript audio libraries from a CDN.

The native app must work offline.

Implement:

- add sound
- completion sound
- achievement sound
- focus ambient noise

using native Android audio mechanisms.

Respect the existing Sound Effects setting.

When sound is disabled, do not play UI sound effects.

---

## 52. Original animations

Aura has many animations.

Preserve the feel of:

- fade-in
- slide
- scale
- spring
- pulse
- glowing elements
- progress animation
- constellation expansion
- tree growth
- planting animation
- mindful breathing animation
- theme background animation
- achievement toast animation
- task transitions

Use Compose animation APIs instead of deleting animations because native implementation is harder.

Do **not** replace all animation with generic Material motion.

---

## 53. Visual design language

The dark Aura interface shown in the supplied screenshots must be treated as a primary reference.

Important visual characteristics:

- true/near-black overall background
- bright white primary typography
- muted gray secondary typography
- translucent slate/gray surfaces
- subtle borders
- rounded cards
- restrained neon-like accent colors
- soft glows
- minimalist line icons
- floating navigation
- floating capture input
- large centered headings
- generous spacing
- visually calm but slightly futuristic aesthetic

Do not make it look like:

- stock Google Tasks
- stock Material 3
- Notion
- Todoist
- Microsoft To Do
- generic "AI productivity app"

It must remain Aura.

---

## 54. Typography

The source uses a system-style sans-serif visual treatment.

Use an Android system sans-serif / Roboto-equivalent typography unless the source contains a specific font asset.

Preserve:

- weight hierarchy
- relative font sizes
- line height
- letter spacing
- primary/secondary text opacity
- italic treatment where used
- monospace timer typography where applicable

Do not introduce a fashionable new font merely to "make it nicer."

---

## 55. Iconography

The source contains custom SVG line icons including concepts such as:

- sun
- moon
- sunset
- plus
- check
- sparkles
- leaf
- calendar
- play
- quote
- bookmark
- zap
- star
- bar chart
- close
- chevrons
- trophy
- settings
- download
- upload
- search
- link
- volume
- bell
- file
- book
- wind
- paintbrush
- pin
- clock
- archive
- share
- paperclip

Recreate them as faithful Android vector/Compose icons.

Do not casually substitute mismatching Material icons.

---

## 56. First-launch experience

Preserve the existing first-launch behavior.

The original app has:

- Aura loading screen
- animated sparkles
- Aura title
- initial/demo task state

Do not add a completely new onboarding flow.

The demo/sample tasks in the source should remain available as the initial state where the source does that.

---

## 57. Responsive design requirement

This application must work correctly on Android phone screen sizes.

Do **not** optimize for only one emulator screenshot.

Test at minimum:

- 360dp-class narrow phone
- 390dp-class phone
- 412dp-class large phone

and multiple screen heights.

The layout must adapt without:

- clipped labels
- overlapping controls
- impossible scrolling
- text collapsing into one-word-per-line columns
- content hidden behind the bottom dock
- buttons being pushed off-screen

Do not change the visual identity just to obtain responsiveness.

The layout should adapt structurally.

---

## 58. Keyboard / IME behavior

Test:

- adding a task
- editing task title
- editing notes
- editing tags
- journal entry
- search
- custom category
- theme name
- command palette

When the keyboard opens:

- focused field remains visible
- input is not hidden
- dialogs can scroll
- bottom controls are adjusted correctly
- system bars remain correct

Use native Compose IME/window inset handling.

Do not use fake keyboard-height constants.

---

## 59. Scrolling architecture

Do **not** reproduce the old web mistake of placing everything in one giant root area while two independently fixed elements cover the content.

Structure the app so content has a real scrollable viewport.

A good approach is:

```text
Root
 ├─ Theme background
 ├─ Main content viewport
 │   └─ vertically scrollable view content
 └─ bottom Aura dock
     ├─ Bottom navigation
     └─ Capture Thought bar
```

The content viewport must account for the measured dock height and system insets.

Important:

The dock may **look floating**.

But the content layout must **know that the dock occupies space**.

Never allow critical content to disappear under it.

---

## 60. Edge-to-edge implementation

Because this is Android 16:

- support edge-to-edge properly
- use WindowInsets
- avoid deprecated opt-out mechanisms
- correctly handle status bar and navigation/gesture areas
- use safe drawing/content insets appropriately
- avoid double padding

### Important

Do not simply put:

```text
paddingValues.calculateTopPadding()
```

on every single component.

That can create double-inset bugs.

Define a clear inset strategy and apply each inset exactly where it belongs.

---

## 61. Screen-level layout rule

For each of the five screens, independently verify:

A. top content is reachable  
B. header is positioned correctly  
C. content scrolls  
D. bottom content is reachable  
E. bottom dock does not cover content  
F. keyboard does not cover text input  
G. status bar is correct  
H. gesture/navigation area is correct

Do this separately for:

- Flow
- Projects
- Grove
- Journal
- Review

---

## 62. No hard-coded "fix the screenshot" hacks

Do **not** write dozens of values such as:

```text
marginTop = 37.dp
marginBottom = 143.dp
offsetY = -18.dp
```

simply because they make one screenshot look right.

Solve the actual layout problem.

Use:

- constraints
- flexible widths
- weight
- Box
- Column
- Row
- LazyColumn
- contentPadding
- WindowInsets
- IME insets
- measured dock dimensions
- responsive sizing

where appropriate.

---

## 63. Preserve source logic, but fix web-only implementation details

You are allowed to replace implementation mechanisms that only exist because Aura was a web application.

Examples:

```text
localStorage → DataStore/Room
IndexedDB → native files
Browser Notifications → Android notifications
Tone.js → native audio
HTML input → SAF
CSS fixed positioning → Compose layout
CSS safe-area environment variables → Android WindowInsets
```

You are **not allowed** to change the actual user-facing product behavior merely because the native architecture makes it convenient.

---

## 64. Data integrity

Every important user action must survive app restarts.

Test:

- add task
- complete task
- uncomplete task
- delete task
- archive task
- restore task
- edit task
- add attachment
- remove attachment
- add dependency
- remove dependency
- create template
- create custom category
- change theme
- create custom theme
- write journal
- grow Grove
- gain achievement
- progress streak
- import backup
- export backup
- enable/disable sound
- enable/disable notifications
- change end-of-day time

Close the application.

Reopen it.

Verify persistence.

---

## 65. Backup / migration safety

The app should not lose existing data because a user upgrades from one version of Aura to another.

Implement a simple versioned local database/data migration strategy.

Do not require a cloud account.

Do not invent cloud sync.

---

## 66. Performance

Aura contains many animations and backgrounds.

Make them efficient.

Do not allow:

- runaway coroutines
- memory leaks
- animation loops that continue when unnecessary
- audio resources remaining active after leaving Focus
- attachment file handles remaining open
- bitmap/resource leaks
- Compose recomposition explosions

The app should remain smooth on normal Android devices.

Use lifecycle-aware state collection.

---

## 67. Accessibility

Do not redesign the UI, but make controls properly accessible.

Provide:

- content descriptions for icon-only controls
- adequate touch targets
- readable text
- sensible semantics
- screen-reader accessible labels

Accessibility must not alter the visual design.

---

## 68. Device configuration

Handle:

- rotation/configuration changes where practical
- process recreation
- Activity recreation
- app background/foreground lifecycle
- screen lock/unlock
- keyboard opening
- system bar changes

Do not rely on ephemeral UI state as the source of truth for persistent information.

---

## 69. What to do with the five supplied screenshots

Treat the screenshots as **visual QA references**.

Before implementation, explicitly identify:

1. top/status-area problem
2. bottom navigation problem
3. bottom Capture Thought bar problem
4. content occlusion problem
5. horizontal space problem
6. task text wrapping problem
7. Constellations viewport problem
8. Grove bottom-content problem
9. Review bottom-content problem
10. any other clipping or spacing defect

Then fix those defects in the native layout.

Do not redesign the screenshots.

The goal is:

```text
SAME DESIGN
+
CORRECT NATIVE LAYOUT
+
CORRECT ANDROID INSETS
+
CORRECT RESPONSIVENESS
```

---

## 70. Reference screenshot validation

After implementation, run the application on an Android emulator/device.

Capture screenshots of:

- Flow
- Projects
- Projects scrolled
- Grove
- Review

Compare them visually against the supplied reference screenshots.

Perform at least several iterations.

Check:

- x/y positioning
- spacing
- typography
- card dimensions
- icon sizes
- colors
- opacity
- rounded corners
- navigation dimensions
- bottom dock
- status bar
- system navigation area
- text wrapping
- content visibility

Do not stop after the application merely compiles.

The deliverable must be visually validated.

---

## 71. Build quality

The project must:

- compile successfully
- install successfully
- launch successfully
- survive process recreation
- run without WebView
- run without network dependency for core features
- have no JavaScript runtime requirement
- have no CDN dependency
- have no browser dependency

Any external assets required for Aura's functionality should be bundled locally.

---

## 72. Project structure

Organize the native application cleanly.

For example:

```text
data/
    database/
    datastore/
    repository/
    storage/

domain/
    model/
    parser/
    logic/

ui/
    theme/
    components/
    flow/
    constellations/
    grove/
    journal/
    review/
    dialogs/
    focus/

audio/

notifications/

navigation/
```

Do not dump the entire application into one giant Kotlin file.

However, do not introduce unnecessary architectural complexity.

---

## 73. Important source-of-truth rule

Whenever there is a choice between:

A. "What would be a better productivity app?"

and

B. "What does Aura already do?"

**ALWAYS choose B.**

Whenever there is a choice between:

A. "What would modern Android usually look like?"

and

B. "What does Aura already look like?"

**ALWAYS choose B for the USER INTERFACE.**

Use modern Android architecture behind the scenes.

Do not replace Aura with Android's default visual language.

---

## 74. Implementation order

Implement in this order:

### Phase 1
Complete source audit and feature parity checklist.

### Phase 2
Set up native Android project.

### Phase 3
Implement data model and persistence.

### Phase 4
Implement global Aura theme system.

### Phase 5
Implement root edge-to-edge/inset architecture.

### Phase 6
Implement bottom dock architecture.

### Phase 7
Implement Flow and task cards.

### Phase 8
Implement task parser.

### Phase 9
Implement task detail, attachments, dependencies.

### Phase 10
Implement Focus Timer and audio.

### Phase 11
Implement Projects/Constellations.

### Phase 12
Implement Grove.

### Phase 13
Implement Journal.

### Phase 14
Implement Review.

### Phase 15
Implement Settings, custom categories, themes, archive, import/export.

### Phase 16
Implement Search and Command Palette.

### Phase 17
Implement notifications and required Android permissions.

### Phase 18
Implement remaining animations and polish.

### Phase 19
Test against screenshots.

### Phase 20
Fix visual/layout mismatches.

---

## 75. Final acceptance criteria

Do **not** consider the project finished merely because:

- Gradle builds
- APK installs
- screens open
- buttons work

The application is finished only when all of the following are true:

1. It is a REAL native Android app.
2. It does NOT use WebView.
3. It does NOT use Capacitor.
4. It does NOT use Electron.
5. All existing Aura features are present.
6. No new unrelated features have been added.
7. The existing visual identity is preserved.
8. The dark Aura design matches the supplied screenshots closely.
9. The task cards no longer collapse into narrow text columns.
10. The bottom navigation no longer clips.
11. The five navigation destinations remain usable.
12. Flow content is never permanently hidden beneath the bottom dock.
13. Projects content is never permanently hidden beneath the bottom dock.
14. Grove content is never permanently hidden beneath the bottom dock.
15. Journal content is never permanently hidden beneath the bottom dock.
16. Review content is never permanently hidden beneath the bottom dock.
17. Capture Thought never overlaps system navigation/gesture UI.
18. The keyboard does not obscure active inputs.
19. Status bar handling is correct.
20. Android 16 edge-to-edge is handled correctly.
21. Android predictive back works correctly.
22. Notification permission handling works correctly.
23. Attachment storage works correctly.
24. Import/export works correctly.
25. Focus Timer works correctly.
26. Theme animations remain functional.
27. App state survives restarts.
28. The application remains offline-capable for core functionality.
29. There are no obvious crashes or broken interactions.
30. The five reference screenshots have been used for visual QA.

---

## 76. Do not ask me to redesign it

Do not come back saying:

> "Would you like a better navigation?"

> "Would you like a modern Material 3 design?"

> "Would you like a dashboard?"

> "Would you like AI?"

> "Would you like additional reminders?"

> "Would you like a new onboarding?"

The answer is **NO**.

The product has already been designed.

Your job is to faithfully rebuild it natively.

---

## 77. Final mindset

Think of the source code as an existing product specification.

Think of the supplied screenshots as visual regression tests.

Think of Android as the new execution environment.

You are **NOT designing Aura**.

You are **migrating Aura**.

The finished result should make me look at the Android application and think:

> **"This is the exact Aura app I built."**

not:

> **"This is a new Android app inspired by Aura."**

Preserve Aura's originality.

Preserve its personality.

Preserve its interaction model.

Preserve its visual language.

Preserve its features.

Fix only the things that are broken because of the old web/wrapper approach or because native Android requires a different implementation underneath.

**NO MORE.**

**NO LESS.**

Build the complete native Android project, compile it, run it, test it, compare it against the supplied screenshots, and iterate until the visual and functional parity is genuinely achieved.
