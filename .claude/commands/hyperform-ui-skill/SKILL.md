---
name: hyperform-ui-skill
description: Master index for all Hyperform UI skills. Lists every skill in this package, its folder path, and when to invoke it. Read this file to find the right skill before doing any page work.
---

# Hyperform UI Skill Package

**29 skills** for building and maintaining Hyperform3 page JSON (uiSchema / schema / config).

---

## QUICK REFERENCE — Skill Invocation Paths

### Core (orchestration + foundation)

| Skill | Invoke as | When to use |
|---|---|---|
| Master page editor (full loop) | `/hyperform-ui-skill:core:hyperform-page-editor` | Any "edit/create page + validate visually" request |
| Page builder (list/form/tree/action pages) | `/hyperform-ui-skill:core:impaktapps-jsonforms-page-builder` | Building a full page from scratch |
| Widget + layout reference | `/hyperform-ui-skill:core:json-ui` | Looking up any widget type, layout rule, or uiSchema structure |
| Playwright validation rules | `/hyperform-ui-skill:core:playwright-validation` | Before calling `validate_page` — how to build validationChecks |

### Components — Inputs

| Skill | Invoke as | When to use |
|---|---|---|
| Checkbox | `/hyperform-ui-skill:components:inputs:add-checkbox` | Boolean toggle, row selection, agreement |
| Date picker | `/hyperform-ui-skill:components:inputs:add-datepicker` | Date input, date range (start/end) |
| Dropdown (Select) | `/hyperform-ui-skill:components:inputs:add-dropdown` | Single select, multi, LOV-loaded, dependent |
| Input Slider | `/hyperform-ui-skill:components:inputs:add-input-slider` | Amount range, percentage, quantity |
| Multiple Select | `/hyperform-ui-skill:components:inputs:add-multiple-select` | Multi-value selection (recipients, tags) |
| Radio (conditional) | `/hyperform-ui-skill:components:inputs:add-radiobutton-conditional` | Radio buttons that show/hide fields |
| Textarea | `/hyperform-ui-skill:components:inputs:add-textarea` | Multi-line text (comments, notes, message body) |

### Components — Buttons

| Skill | Invoke as | When to use |
|---|---|---|
| Button with icon + text | `/hyperform-ui-skill:components:buttons:add-button-with-icon-and-text` | Prominent action buttons (Refresh, Export, Approve) |
| Icon button | `/hyperform-ui-skill:components:buttons:add-icon-button` | Compact icon-only actions (View/Edit/Delete in table) |
| Upload button trigger | `/hyperform-ui-skill:components:buttons:hyperform-upload-button` | File/document upload control wired to a page |

### Components — Layout

| Skill | Invoke as | When to use |
|---|---|---|
| Box (static label) | `/hyperform-ui-skill:components:layout:add-box` | Read-only label, section title, caption |
| Empty box (spacer) | `/hyperform-ui-skill:components:layout:add-empty-box` | Fill remaining grid columns, align elements |
| Horizontal layout | `/hyperform-ui-skill:components:layout:add-horizontal-layout` | Side-by-side multi-column container |
| Tab section | `/hyperform-ui-skill:components:layout:add-tab-section` | Tabbed content (multiple reports, different views) |

### Components — Data Display

| Skill | Invoke as | When to use |
|---|---|---|
| Card (KPI) | `/hyperform-ui-skill:components:data-display:add-card` | Dashboard KPI cards (stats, metrics, summaries) |
| Graph (chart) | `/hyperform-ui-skill:components:data-display:add-graph` | Bar, Line, Pie, StackBar, HorizontalBar charts |
| Leaderboard | `/hyperform-ui-skill:components:data-display:add-leaderboard` | Ranked list with medals and scores |
| Progress bar | `/hyperform-ui-skill:components:data-display:add-progress-bar` | Target vs achievement tracking |
| Rank card | `/hyperform-ui-skill:components:data-display:add-rank-card` | User's personal rank / position display |

### Components — Files

| Skill | Invoke as | When to use |
|---|---|---|
| File input (upload+download+delete) | `/hyperform-ui-skill:components:files:add-file-input` | Attachment widget (upload + download + delete in one) |
| Upload file (standalone) | `/hyperform-ui-skill:components:files:add-upload-file` | Standalone upload button (invoice, certificate, CSV) |
| Download file (standalone) | `/hyperform-ui-skill:components:files:add-download-file` | Standalone download button for previously uploaded files |

### Components — Gamification

| Skill | Invoke as | When to use |
|---|---|---|
| Runner boy progress bar | `/hyperform-ui-skill:components:gamification:add-runner-boy-progress-bar` | Animated gamified goal tracking |
| Thought banner | `/hyperform-ui-skill:components:gamification:add-thought` | Motivational / inspirational message banner |
| Countdown timer | `/hyperform-ui-skill:components:gamification:add-timer` | Contest / campaign deadline countdown |

---

## FOLDER STRUCTURE

```
hyperform-ui-skill/
├── README.md                              ← this file (master index)
│
├── core/                                  ← orchestration + foundation
│   ├── hyperform-page-editor.md           ← full retrieve→edit→save→preview→validate loop
│   ├── impaktapps-jsonforms-page-builder.md  ← full page skeleton patterns
│   ├── json-ui.md                         ← widget catalog + layout rules
│   └── playwright-validation.md           ← validationChecks + retry loop
│
└── components/
    ├── inputs/                            ← form input controls
    │   ├── add-checkbox.md
    │   ├── add-datepicker.md
    │   ├── add-dropdown.md
    │   ├── add-input-slider.md
    │   ├── add-multiple-select.md
    │   ├── add-radiobutton-conditional.md
    │   └── add-textarea.md
    │
    ├── buttons/                           ← action buttons + upload trigger
    │   ├── add-button-with-icon-and-text.md
    │   ├── add-icon-button.md
    │   └── hyperform-upload-button.md
    │
    ├── layout/                            ← structural / container widgets
    │   ├── add-box.md
    │   ├── add-empty-box.md
    │   ├── add-horizontal-layout.md
    │   └── add-tab-section.md
    │
    ├── data-display/                      ← cards, charts, leaderboards, progress
    │   ├── add-card.md
    │   ├── add-graph.md
    │   ├── add-leaderboard.md
    │   ├── add-progress-bar.md
    │   └── add-rank-card.md
    │
    ├── files/                             ← file upload / download widgets
    │   ├── add-download-file.md
    │   ├── add-file-input.md
    │   └── add-upload-file.md
    │
    └── gamification/                      ← animated + motivational widgets
        ├── add-runner-boy-progress-bar.md
        ├── add-thought.md
        └── add-timer.md
```

---

## HOW TO USE THESE SKILLS

**For a complete page edit with visual validation:**
```
/hyperform-ui-skill:core:hyperform-page-editor
```
This skill orchestrates the full loop: retrieve page → apply changes → save → launch preview → screenshot → validate → fix → respond.

**For a specific component:**
1. Look up the component in the Quick Reference table above
2. Invoke the matching skill — e.g. `/hyperform-ui-skill:components:data-display:add-card`
3. Follow its Step 1 / Step 2 / Step 3 patterns (config → uiSchema → schema)
4. Then call `validate_page` or use the page editor's preview flow to confirm it renders

**For a brand new page from scratch:**
```
/hyperform-ui-skill:core:impaktapps-jsonforms-page-builder
```

**To look up any widget type or layout rule:**
```
/hyperform-ui-skill:core:json-ui
```

---

## MANDATORY RULES (apply to all skills in this package)

1. **Never write page JSON from memory** — always invoke the matching skill first
2. **Never invent widget types** — only use types defined in the skills
3. **Always save through staging** — use `update_page` tool (handles reject-staging → build → save)
4. **Never auto-approve** — leave saves in staging for admin approval
5. **Always validate visually** — take screenshots via `preview_launch_session` + `preview_screenshot`
6. **masterName** for all page operations = `com.act21.hyperform3.entity.page.PageStaging`
7. **userId** = `1` unless explicitly specified

---

## MCP TOOLS REFERENCE

| Tool | Purpose |
|---|---|
| `get_page_record` | Fetch current page JSON + IDs (mainId, stagingId, actionId) |
| `update_page` | Save changes through staging workflow |
| `approve_or_reject_record` | Manually reject a blocking staging record |
| `preview_launch_session` | Start renderer + open Playwright browser (keeps session open) |
| `preview_screenshot` | Take full-page or element-scoped screenshot |
| `preview_close_session` | Shut down browser and renderer |
| `launch_preview` | Start renderer only (no browser — use for quick check) |
| `close_preview` | Stop the launch_preview renderer |
| `validate_page` | One-shot Playwright test run (start → check assertions → stop) |
