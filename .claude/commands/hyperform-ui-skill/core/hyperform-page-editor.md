---
name: hyperform-page-editor
description: Master orchestration skill for creating and maintaining Hyperform page JSON end-to-end. Handles text instructions AND image-based requirements ("update page_X as shown in this image"). Correct flow: fetch page (MCP) → apply edits to CONFIG only in memory → render preview using preview_session_from_config (MCP, auto-derives uiSchema+schema) → screenshot (MCP) → compare against requirement → fix in memory and re-render if needed (repeat up to 3 times, NO intermediate saves) → save ONCE to staging via update_page(config only) (MCP) → close session → respond. Use for any "edit this page", "make it look like this image", "add X to page_Y", or "create a new page" request.
compatibility: hyperform-ui MCP server (server name: hyperform-ui-mcp) — required tools: get_page_record, update_page, preview_session_from_config, preview_screenshot, preview_close_session
---

# HyPerform Skill: Page Editor (Full Workflow)

**Version:** 3.0  
**MCP Server:** `hyperform-ui-mcp` — all fetch, save, and render operations use this server exclusively

---

## WORKFLOW AT A GLANCE

```
FETCH  →  EDIT  →  RENDER  →  SCREENSHOT  →  COMPARE
  ↑                                              |
  |                                    ✗ not matching
  |                                              ↓
  └──────── fix in memory, re-render ────────────┘
                (up to 3 times, NO saves)
                        |
                ✓ all items match
                        ↓
                  SAVE ONCE (MCP)
                        ↓
               CLOSE SESSION (MCP)
                        ↓
                  RESPOND TO USER
```

**Critical rule: `update_page` is called EXACTLY ONCE, at the end, after all screenshots pass. Never save during the fix loop.**

---

## MCP SERVER: hyperform-ui-mcp

All three core operations go through the **`hyperform-ui-mcp`** MCP server. Never call the Hyperform backend directly.

| Operation | hyperform-ui MCP tool | When called |
|---|---|---|
| **Fetch page** | `get_page_record` | Phase 1 — once, at the start |
| **Render from config** | `preview_session_from_config` | Phase 4 — each time a render is needed; pass config only, uiSchema+schema auto-derived |
| **Screenshot** | `preview_screenshot` | Phase 5 — after each render |
| **Close renderer** | `preview_close_session` | Phase 6 — once, after validation passes |
| **Save page** | `update_page` | Phase 6 — once, only after screenshots pass; pass config only |
| **Unblock staging** | Admin action | Phase 6 — Manual approval required; never auto-approve. If a blocking staging record exists (A/P/D), an administrator must resolve it in the Hyperform workflow dashboard. |

> **KEY PRINCIPLE:** You only ever build and edit the **`config`** object. `uiSchema` and `schema` are derived automatically inside `preview_session_from_config` and `update_page` via `buildUiSchema` / `buildSchema`. Never construct uiSchema or schema manually.

---

## TRIGGER PATTERNS

| User says | What to do |
|---|---|
| `"update page_manualSign as pasted image"` | Analyze image → fetch → edit → render → compare → fix loop → save |
| `"make page_X look like this"` + image | Same as above |
| `"add a progress bar to page_salesDashboard"` | Fetch → edit → render → screenshot → verify → save |
| `"create a new page for employee list"` | Build skeleton → render → screenshot → verify → save |
| `"show me how page_X looks right now"` | Fetch → render → screenshot → respond (no edit, no save) |

---

## MANDATORY RULES

1. **Use hyperform-ui MCP for everything** — fetch, render, screenshot, and save all go through `hyperform-ui-mcp`. Never call the Hyperform backend directly.
2. **Fetch before editing** — always call `get_page_record` first. Work on the JSON returned by the MCP server.
3. **Render before saving** — write the edited JSON to a preview file, launch the renderer, take screenshots, and confirm the result visually BEFORE calling `update_page`.
4. **Save ONCE at the end** — call `update_page` only after all screenshot comparisons pass. Never save during the fix loop.
5. **Fix loop is in-memory only** — during iteration, modify the JSON in memory, re-write the preview file, re-render, re-screenshot. No `update_page` calls.
6. **Max 3 render attempts** — if the page still doesn't match after 3 renders, save the best version, close the session, report what still differs, and ask the user for guidance.
7. **Always close the session** — call `preview_close_session` before sending any final response.
8. **masterName** = `com.act21.hyperform3.entity.page.PageStaging` — never `PageMaster`.
9. **userId** = `1` unless explicitly provided.
10. **Never guess widget types** — consult the component skill for every widget being added.

---

## COMPONENT SKILL LOOKUP TABLE

Before writing any JSON for a component, find it here and invoke the skill first.

| What to add | Skill to invoke |
|---|---|
| New list / form / tree / action page | `/hyperform-ui-skill:core:impaktapps-jsonforms-page-builder` |
| File upload button (single standalone) | `/hyperform-ui-skill:components:buttons:hyperform-upload-button` |
| Radio buttons (conditional show/hide) | `/hyperform-ui-skill:components:inputs:add-radiobutton-conditional` |
| Slider (amount, percentage, quantity) | `/hyperform-ui-skill:components:inputs:add-input-slider` |
| Tabs | `/hyperform-ui-skill:components:layout:add-tab-section` |
| Icon-only buttons (View/Edit/Delete/Add/Download) | `/hyperform-ui-skill:components:buttons:add-icon-button` |
| Bar / Line / Pie / StackBar / HorizontalBar chart | `/hyperform-ui-skill:components:data-display:add-graph` |
| KPI metric cards | `/hyperform-ui-skill:components:data-display:add-card` |
| Multi-line text (comments, notes) | `/hyperform-ui-skill:components:inputs:add-textarea` |
| File attachment (upload + download + delete) | `/hyperform-ui-skill:components:files:add-file-input` |
| Multi-value select (recipients, tags) | `/hyperform-ui-skill:components:inputs:add-multiple-select` |
| Button with icon + text label | `/hyperform-ui-skill:components:buttons:add-button-with-icon-and-text` |
| Progress bar (target vs achievement) | `/hyperform-ui-skill:components:data-display:add-progress-bar` |
| Checkbox (boolean toggle, row selector) | `/hyperform-ui-skill:components:inputs:add-checkbox` |
| Standalone upload button | `/hyperform-ui-skill:components:files:add-upload-file` |
| Standalone download button | `/hyperform-ui-skill:components:files:add-download-file` |
| Leaderboard (ranked list with medals) | `/hyperform-ui-skill:components:data-display:add-leaderboard` |
| Motivational thought banner | `/hyperform-ui-skill:components:gamification:add-thought` |
| Animated runner progress bar | `/hyperform-ui-skill:components:gamification:add-runner-boy-progress-bar` |
| Countdown timer | `/hyperform-ui-skill:components:gamification:add-timer` |
| Invisible grid spacer | `/hyperform-ui-skill:components:layout:add-empty-box` |
| Side-by-side multi-column container | `/hyperform-ui-skill:components:layout:add-horizontal-layout` |
| Static text label / section title | `/hyperform-ui-skill:components:layout:add-box` |
| User rank / position card | `/hyperform-ui-skill:components:data-display:add-rank-card` |
| Widget type / layout rule lookup | `/hyperform-ui-skill:core:json-ui` |
| Date picker / date range | `/hyperform-ui-skill:components:inputs:add-datepicker` |
| Dropdown (single / multi / LOV / dependent) | `/hyperform-ui-skill:components:inputs:add-dropdown` |

---

## FULL WORKFLOW — STEP BY STEP

---

### PHASE 0 — PARSE THE REQUEST

Do this before calling any tool.

#### 0A — Extract the page name

Look for the page name in the prompt:
- Explicit: `page_manualSign`, `page_salesDashboard`
- Implicit: `"the manual sign page"` → resolve to `page_manualSign`
- If no page name found → ask the user before proceeding

#### 0B — Identify the requirement source

| Request contains | Requirement source |
|---|---|
| Pasted image / screenshot | Analyze image (0C) |
| Text description only | Build spec from text (0D) |
| Both image + text | Use text to clarify the image |

#### 0C — Analyze the image (when provided)

Build a structured **Requirement Spec** from the image:

```
REQUIREMENT SPEC
================
Page name: page_<X>

Layout observed:
  Section "Basic Details" (accordion)
    Row 1: "Policy Number" (Input, lg:3), "Holder Name" (Input, lg:3), EmptyBox(lg:6)
    Row 2: "Sign Date" (DatePicker, lg:3), "Remarks" (Textarea, lg:9)
  Section "Documents" (accordion)
    Row 1: "Upload Signature" (UploadFile, lg:6), EmptyBox(lg:6)
  Action bar:
    "Save" (ButtonWithIconAndText, teal), "Cancel" (ButtonWithIconAndText, outlined)

Components to ADD:    [list]
Components to MODIFY: [list]
Components to KEEP:   [everything else — do not touch]
```

List every visible element. This spec is the ground truth used in Phase 5 comparison.

#### 0D — Build spec from text

Convert text descriptions into the same Requirement Spec format.

#### 0E — State the plan

Before calling any tool, output:
```
Plan:
1. Fetch page_<X> via hyperform-ui MCP (get_page_record)
2. Add/modify: [list from spec]
3. Keep unchanged: [list]
4. Render and compare screenshot against [image / description]
5. Save via hyperform-ui MCP (update_page) only after screenshots pass
```

---

### PHASE 1 — FETCH THE PAGE  *(hyperform-ui MCP → get_page_record)*

> **Never skip this step.** Always work from the live page JSON, not from memory or assumptions.

```
get_page_record(
  pageName:     "<page_name>",
  masterName:   "com.act21.hyperform3.entity.page.PageStaging",
  fetchStaging: true
)
```

Record from the response:
- `mainId` — live approved record ID  *(needed for the final save)*
- `stagingId` — staging record ID *(needed for the final save)*
- `actionId` — workflow action ID *(needed for the final save)*
- `stagingStatus` — A / P / D / R / null
- `config` — legacy element tree (keep a copy of the original)
- `uiSchema` — primary edit target
- `schema` — data shape + validation

**Keep the original `config`, `uiSchema`, `schema` in memory as a baseline.** All edits are applied on top of this baseline. If something breaks, you can revert to the baseline and re-apply changes more carefully.

Read the full `uiSchema` to understand every existing element before touching anything.

---

### PHASE 2 — PLAN THE CHANGES

#### 2A — Diff current page against requirement spec

```
ADD:    [in spec, not in current uiSchema]
MODIFY: [in both, but config/layout differs]
KEEP:   [not mentioned in spec — leave exactly as-is]
REMOVE: [only if spec or user explicitly says to remove]
```

#### 2B — Invoke component skills

For every component in ADD or MODIFY, invoke the matching skill from the lookup table before writing any JSON.

#### 2C — Check grid column totals

Every row must sum to 12 `lg` columns. Add `EmptyBox` spacers for gaps.

---

### PHASE 3 — APPLY CHANGES IN MEMORY (config only)

> **No save yet. Edit `config` only — do NOT build uiSchema or schema manually.**

`uiSchema` and `schema` are **auto-derived** by `buildUiSchema` / `buildSchema` inside both `preview_session_from_config` (render step) and `update_page` (save step). You never need to construct them yourself.

#### 3A — Edit `config.elements` only

| What to update | Where in config |
|---|---|
| Add a new component | `config.elements` array — append/insert the element object |
| Modify a label, type, layout | Find the element in `config.elements` by name and update its properties |
| Add events (onChange, onLoad, etc.) | `element.events` array inside the config element |
| Grid sizing | `element.layout` array: `[{ "labelGrid": ..., "xs": ..., "sm": ..., "md": ..., "lg": ... }]` |

The result is a single updated object — **`updatedConfig`** — held in memory. **Do not call `update_page` yet. Do not build uiSchema or schema.**

---

### PHASE 4 — RENDER THE PAGE  *(hyperform-ui MCP → preview_session_from_config)*

> **Tool source:** `hyperform-ui-mcp` → `preview_session_from_config`  
> Pass your `updatedConfig` — the tool derives uiSchema+schema automatically, writes the preview file, starts the renderer, opens Chromium, and returns an initial screenshot. You do NOT write any file manually.

```
preview_session_from_config(
  config:   <updatedConfig>,
  pageName: "<pageName>",
  headless: true
)
```

This calls `buildUiSchema(config, {})` and `buildSchema(config)` internally, writes the result to `D:\Act21files\mcp-server\preview\<pageName>.json`, starts `node start.js`, waits for `http://localhost:5173`, opens Chromium, navigates to the rendered UI, and returns an initial screenshot.

If it times out: check that `npm install` was run in `D:\Act21files\mcp-server\frontend\`.

---

### PHASE 5 — SCREENSHOT AND COMPARE  *(hyperform-ui MCP → preview_screenshot)*

> **Tool source:** `hyperform-ui-mcp` → `preview_screenshot`  
> Do NOT respond to the user until this phase passes.

#### 5A — Take the full-page screenshot

```
preview_screenshot(label: "attempt-1-full")
```

#### 5B — Take targeted screenshots for each key component

```
preview_screenshot(selector: ".MuiAccordion-root", label: "attempt-1-sections")
preview_screenshot(selector: ".MuiCard-root",       label: "attempt-1-cards")
preview_screenshot(selector: ".MuiTabs-root",        label: "attempt-1-tabs")
preview_screenshot(selector: ".MuiTextField-root",   label: "attempt-1-inputs")
preview_screenshot(selector: ".MuiButton-root",      label: "attempt-1-buttons")
```

Only take selectors relevant to the requirement spec.

**Common CSS selectors:**

| Component | Selector |
|---|---|
| Accordion sections | `.MuiAccordion-root` |
| KPI cards | `.MuiCard-root` |
| Buttons | `.MuiButton-root` |
| Text fields | `.MuiTextField-root` |
| Tables | `.MuiTable-root` |
| Tab bar | `.MuiTabs-root` |
| Form wrapper | `.MuiPaper-root` |
| Progress bar | `.MuiLinearProgress-root` |
| Select dropdown | `.MuiAutocomplete-root` |
| Checkbox | `.MuiCheckbox-root` |
| Slider | `.MuiSlider-root` |
| Chart container | `[class*="recharts"]` |

#### 5C — Compare against the Requirement Spec

Check every item from your Phase 0 spec:

```
COMPARISON — Attempt 1
=======================
[✓/✗] Section "Basic Details" — visible / missing
[✓/✗] Field "Policy Number" (Input, lg:3) — visible / wrong label / wrong size
[✓/✗] Field "Sign Date" (DatePicker, lg:3) — visible / not a date picker
[✓/✗] "Upload Signature" button — visible / missing
[✓/✗] "Save" button (teal) — visible / wrong color
...
```

For image-based requests: compare the screenshots directly against the pasted image, element by element.

#### 5D — Decision gate

```
ALL items ✓  →  go to Phase 6 (save + close + respond)
ANY item  ✗  →  go to Phase 5-FIX (fix in memory, re-render)
```

---

### PHASE 5-FIX — FIX IN MEMORY AND RE-RENDER  (up to 3 attempts total)

> **No `update_page` call here.** Fix the in-memory JSON, re-write the preview file, re-launch the renderer, re-take screenshots.

#### Diagnose each failing item:

| What the screenshot shows | Root cause | Fix |
|---|---|---|
| Component not visible | Wrong widget type, or scope not in schema | Fix `options.widget`; add to `schema.properties` |
| Wrong label text | `config.main.label` mismatch | Fix the label string |
| Wrong position | Wrong section or wrong element order | Move inside correct `WrapperSection`; reorder `elements` |
| Layout broken / overflow | Column totals exceed 12 | Recalculate; add/remove `EmptyBox` spacers |
| Card value blank | `config.main.value` / `heading` not set | Set explicit value in Box `heading` |
| Tab content blank | `tabLabels` count ≠ `sectionLabels` count | Match arrays exactly |
| Graph not rendering | Wrong `graphType` or missing data keys | Re-read `/hyperform-ui-skill:components:data-display:add-graph` |
| Slider not visible | Missing `min`/`max` | Re-read `/hyperform-ui-skill:components:inputs:add-input-slider` |
| Page completely blank | `uiSchema.name` ≠ `uiSchema.pageName` | Set both to the same page name |
| Wrong color/size vs image | Style properties missing | Add `config.style` overrides to match image |

#### Fix loop (each attempt):

1. List every failing item and its diagnosis
2. Apply ALL fixes to `updatedConfig` in one pass (config only — no manual uiSchema/schema editing)
3. `preview_session_from_config(config: updatedConfig, pageName: "<pageName>")` — re-render *(previous session is automatically closed and restarted; uiSchema+schema re-derived automatically)*
4. `preview_screenshot(label: "attempt-2-full")` (or attempt-3)
5. Re-run the comparison checklist

After 3 failed attempts: stop the fix loop, go to Phase 6 with the best version, and report in the response which items still differ.

---

### PHASE 6 — SAVE, CLOSE, RESPOND

Only reach this phase when screenshots pass (or after 3 attempts).

#### 6A — Save to Hyperform via hyperform-ui MCP  *(update_page)*

> **This is the ONLY `update_page` call in the entire workflow.**  
> **Tool source:** `hyperform-ui-mcp` → `update_page`  
> **Pass `config` only — never pass uiSchema or schema manually.**

```
update_page(
  pageName: "<page_name>",
  config:   <updatedConfig>,
  userId:   1
)
```

`update_page` builds `uiSchema` and `schema` from your `config` (via `buildUiSchema` / `buildSchema`) and attempts to save the result as a new staging record in the backend. It does NOT auto-approve staging records. If a blocking staging record exists, `update_page` may return an error and an administrator must approve or reject the existing staging record using the Hyperform workflow dashboard before the changes can go live.

**If `update_page` returns an error:**

| Error | Root cause | Fix |
|---|---|---|
| "First Approve the previously edited entity" | Staging A/P/D is blocking | This indicates a blocking staging record. Do NOT auto-approve — ask an administrator to approve or reject the blocking staging record in the Hyperform workflow dashboard, then retry `update_page`. |
| "Name already present" | `id: null` when staging record exists | Tool should use the existing staging ID from Phase 1 |
| HTTP 400 no message | Missing required field | Verify all three of config, uiSchema, schema are present |
| HTTP 401 | Token expired | Re-run `npm run setup` |

#### 6B — Close the preview session  *(preview_close_session)*

> **Tool source:** `hyperform-ui-mcp` → `preview_close_session`

```
preview_close_session()
```

Always call this, whether the save succeeded or failed.

#### 6C — Respond to the user

Your response MUST contain all four of these:

**1. Change summary**
```
Changes made to page_<X>:
  ✓ Added "Upload Signature" file upload button (Section: Documents, lg:6)
  ✓ Modified "Policy Number" label (was "Policy No")
  ✓ Added "Save" and "Cancel" buttons in action bar
```

**2. Screenshot evidence** — embed the final passing screenshots inline (returned as images by `preview_screenshot`)

**3. Comparison result**
```
Visual check: ALL ITEMS MATCHED ✓
  (or: X of Y items matched — see notes for remaining differences)
```

**4. Staging reminder**
```
Saved to staging (status: Pending). Changes go live after admin approval in the Hyperform workflow dashboard.
```

---

## COMPLETE EXAMPLE: Image-Based Request

**User:** "update page_manualSign as pasted image" + [image showing new Signature Upload section]

```
PHASE 0 — PARSE
  Page name: page_manualSign
  Requirement: image
  Spec:
    - Keep: "Basic Details" accordion (unchanged)
    - ADD: "Signature Upload" accordion with:
        "Upload Signature" (UploadFile, lg:6), "Sign Date" (DatePicker, lg:3), EmptyBox(lg:3)
        "Remarks" (Textarea, lg:12)
    - ADD: Action bar with "Save" + "Cancel" (ButtonWithIconAndText)

PHASE 1 — FETCH (hyperform-ui MCP)
  get_page_record("page_manualSign", masterName, fetchStaging=true)
  → mainId=2861, stagingId=2872, actionId=2871
  → Read uiSchema: has "Basic Details" only

PHASE 2 — PLAN
  ADD: signatureUploadSection, uploadSignature, signDate, spacer, remarks, saveBtn, cancelBtn
  Invoke component skills for UploadFile, DatePicker, Textarea, ButtonWithIconAndText

PHASE 3 — EDIT IN MEMORY (config only)
  Apply changes to updatedConfig.elements only
  Do NOT build uiSchema or schema manually
  (NO update_page call yet)

PHASE 4 — RENDER (hyperform-ui MCP)
  preview_session_from_config(config: updatedConfig, pageName: "page_manualSign")
  → MCP derives uiSchema+schema, writes preview file, launches renderer
  → Browser opens at localhost:5173, initial screenshot returned

PHASE 5 — SCREENSHOT & COMPARE (hyperform-ui MCP)
  preview_screenshot(label: "attempt-1-full")
  preview_screenshot(selector: ".MuiAccordion-root", label: "attempt-1-sections")
  preview_screenshot(selector: ".MuiButton-root", label: "attempt-1-buttons")

  Comparison:
  [✓] "Basic Details" — unchanged, present
  [✓] "Signature Upload" accordion — visible
  [✓] "Upload Signature" button — visible, lg:6
  [✗] "Sign Date" — showing as text Input, not DatePicker
  [✓] "Remarks" textarea — visible
  [✓] "Save" + "Cancel" buttons — visible

  → 1 item failed → PHASE 5-FIX

PHASE 5-FIX — ATTEMPT 2
  Diagnosis: signDate widget is wrong — its config element type needs to be "DateInputField"
  Fix updatedConfig: change the signDate element type to "DateInputField"
  preview_session_from_config(config: updatedConfig, pageName: "page_manualSign")  ← re-render, uiSchema auto-derived
  preview_screenshot(label: "attempt-2-full")
  preview_screenshot(selector: ".MuiAccordion-root", label: "attempt-2-sections")

  Comparison:
  [✓] All items now match

  → ALL PASS → PHASE 6

PHASE 6 — SAVE + CLOSE + RESPOND (hyperform-ui MCP)
  update_page(pageName: "page_manualSign", config: updatedConfig, userId: 1)
  → MCP calls buildUiSchema/buildSchema internally, saves staging record
  preview_close_session()
  Respond with change summary + inline screenshots + staging reminder
```

---

## WORKING WITH EXISTING PAGES vs NEW PAGES

### Editing an existing page
1. `get_page_record` → fetch, note all IDs
2. Read full `uiSchema` — understand every existing element
3. Edit in memory — preserve everything not in the spec
4. Render → screenshot → compare (fix loop if needed)
5. `update_page` once at end

### Creating a brand new page
1. Invoke `/hyperform-ui-skill:core:impaktapps-jsonforms-page-builder`
2. Build `config` from scratch (do NOT build uiSchema or schema manually)
3. `preview_session_from_config(config, pageName)` → screenshot → verify
4. `update_page(pageName, config, userId)` once (stagingId = null, mainId = null for new pages)

### Read-only view (no edits)
1. `get_page_record` → extract `config`
2. `preview_session_from_config(config, pageName)` → `preview_screenshot`
3. `preview_close_session`
4. Respond with screenshot (no `update_page`)

---

## STAGING WORKFLOW REMINDER

```
update_page (called once, end of workflow)
        ↓
  Staging record created (status: Pending)
        ↓
  Admin reviews in Hyperform workflow dashboard
        ↓
  Admin approves → changes go Live
```

Never auto-approve. Always tell the user their changes are in staging.

---

## SCREENSHOT STORAGE

```
D:\Act21files\mcp-server\playwright-results\screenshots\
  session-start-<timestamp>.png       ← from preview_launch_session
  screenshot-<label>-<timestamp>.png  ← from preview_screenshot
```

Include both the inline image and the file path in your response.

---

## FINAL CHECKLIST (before sending response)

- [ ] Phase 0 requirement spec written (image analyzed or text converted)
- [ ] `get_page_record` called — original config and all IDs noted
- [ ] All component skills invoked before writing any config JSON
- [ ] **Only `config` edited** — no manual uiSchema or schema construction
- [ ] `preview_session_from_config(config, pageName)` called — renderer + browser open, initial screenshot returned
- [ ] Additional screenshots taken for each key component (`preview_screenshot`)
- [ ] Comparison checklist run item-by-item against requirement spec
- [ ] Fix loop (if needed): only `updatedConfig` modified → `preview_session_from_config` again → re-compare
- [ ] **`update_page(pageName, config, userId)` called exactly once — after screenshots pass**
- [ ] `preview_close_session` called
- [ ] Response includes: change summary + inline screenshots + comparison result + staging reminder
