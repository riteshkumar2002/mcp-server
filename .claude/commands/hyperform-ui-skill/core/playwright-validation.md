---
name: playwright-validation
description: Playwright validation rules for rendered Hyperform pages. Use this skill before calling validate_page — covers how to build validationChecks, which check types to use (text/label/selector), what to always validate, common failure patterns and fixes, and the correct retry loop (up to 3 attempts).
compatibility: Hyperform MCP server, validate_page tool
---

# HyPerform Skill: Playwright Page Validation

**Tool:** `validate_page`  
**Version:** 1.0

---

## MANDATORY RULE

**After building or modifying any page, you MUST call `validate_page`.**  
Never assume a page renders correctly based on schema alone. Always validate actual rendering.

---

## How `validate_page` works

1. Saves `{ schema, uiSchema }` → `frontend/generated/generated-schema.json`
2. Starts the renderer: `node start.js <path>` (backend on port 4000 + Vite on port 5173)
3. Waits until `http://localhost:5173` is accessible
4. Runs Playwright with your `validationChecks`
5. Captures screenshots (pass and fail)
6. Stops the renderer
7. Returns: pass/fail, screenshot paths, error details

---

## validationChecks — three types

| type | Matches | When to use |
|---|---|---|
| `"text"` | Visible text content anywhere on the page | Page titles, metric values, card labels, descriptions, button text |
| `"label"` | `<label>` elements or ARIA labels (form fields) | Date pickers, dropdowns, text inputs, checkboxes |
| `"selector"` | CSS selector or Playwright locator string | When text/label won't uniquely identify the element |

**Prefer `"text"` and `"label"` over `"selector"` — they are more readable and resilient to DOM changes.**

---

## What to always include in validationChecks

### 1. Page title / section headings
```json
{ "type": "text", "value": "Dashboard Title", "description": "Main page heading" }
```

### 2. All form field labels
```json
{ "type": "label", "value": "Start Date", "description": "Start Date filter" },
{ "type": "label", "value": "End Date", "description": "End Date filter" },
{ "type": "label", "value": "Contest", "description": "Contest dropdown" }
```

### 3. Metric card text (label + value + description)
```json
{ "type": "text", "value": "Participation", "description": "Participation card label" },
{ "type": "text", "value": "61.2%", "description": "Participation percentage value" },
{ "type": "text", "value": "306 out of 500", "description": "Participation detail text" }
```

### 4. Table column headers (if page has a table)
```json
{ "type": "text", "value": "Agreement No.", "description": "Table column header" }
```

### 5. Button labels
```json
{ "type": "text", "value": "Search", "description": "Search button" }
```

---

## Full example call

```typescript
await validate_page({
  schema: { /* JSON Schema object */ },
  uiSchema: { /* uiSchema object */ },
  pageName: "page_contestDashboard",
  attemptNumber: 1,
  validationChecks: [
    // Page title
    { type: "text", value: "Insurance Contest Dashboard", description: "Page title" },

    // Filter controls
    { type: "label", value: "Start Date", description: "Start Date filter" },
    { type: "label", value: "End Date", description: "End Date filter" },
    { type: "label", value: "Contest", description: "Contest dropdown" },
    { type: "label", value: "Seasonality", description: "Seasonality dropdown" },

    // Metric cards — always validate label + value + description text
    { type: "text", value: "Participation", description: "Participation card" },
    { type: "text", value: "61.2%", description: "Participation value" },
    { type: "text", value: "306 out of 500", description: "Participation detail" },

    { type: "text", value: "Target", description: "Target card" },
    { type: "text", value: "300", description: "Target value" },
    { type: "text", value: "Score to Achieve", description: "Target detail" },

    { type: "text", value: "Achievement", description: "Achievement card" },
    { type: "text", value: "200", description: "Achievement value" },

    { type: "text", value: "Payout", description: "Payout card" },
    { type: "text", value: "23,000", description: "Payout value" },
    { type: "text", value: "Earned Reward", description: "Payout detail" }
  ]
})
```

---

## Retry loop — up to 3 attempts

When `validate_page` returns a failure:

1. **Read the error details carefully** — the message names the exact element that was not found.
2. **Fix the root cause** in the uiSchema/schema:
   - Wrong widget type → switch to the correct widget
   - Missing field in schema → add the property
   - Wrong label text → fix `config.main.label`
   - Styling issue preventing visibility → remove or simplify conflicting style
3. **Call `validate_page` again** with the corrected schema and `attemptNumber` incremented.
4. After 3 failed attempts, stop and report the issue with all screenshot paths.

```typescript
// Attempt 1
const r1 = await validate_page({ ..., attemptNumber: 1 })
if (!r1.passed) {
  // fix schema...
  const r2 = await validate_page({ ..., attemptNumber: 2 })
  if (!r2.passed) {
    // fix schema again...
    const r3 = await validate_page({ ..., attemptNumber: 3 })
  }
}
```

---

## Common failure causes and fixes

| Error message | Root cause | Fix |
|---|---|---|
| `Element not found: "Start Date" (type: label)` | DatePicker label mismatch | Verify `config.main.label` exactly matches the check value |
| `Element not found: "61.2%" (type: text)` | Card widget not rendering value | Confirm `config.main.value` is set; check widget type is `"card"` not `"Box"` |
| `Element not found: "Search" (type: text)` | Button not rendered | Check widget is `"Button"` or `"ButtonWithIconAndText"`; verify it's inside a WrapperLayout |
| `networkidle timeout` | Renderer not started / port conflict | Check `node start.js` is running; kill processes on ports 4000 and 5173 first |
| `Page renders blank` | Schema parse error or missing `pageName` in uiSchema | Verify top-level `uiSchema.scope` matches the page name; validate JSON structure |
| `TextArea doesn't show background` | Widget doesn't support style props | Replace TextArea with a `Box` or `card` widget for styled containers |
| `HorizontalLayout not wrapping` | Column sizes exceed 12 | Ensure all `layout.lg` values in the layout sum to ≤ 12 |

---

## Screenshots

Every `validate_page` run saves screenshots to:
```
D:\Act21files\mcp-server\playwright-results\screenshots\
  pass-<timestamp>.png   ← full page on success
  fail-<timestamp>.png   ← full page at the moment of failure
```

Always include screenshot paths in your final response so the user can inspect visually.

---

## Validation checklist before calling validate_page

- [ ] `schema` has all properties referenced in `uiSchema` scopes
- [ ] Every `uiSchema` element has a matching `config.main.label` that matches your check value
- [ ] Metric card `value` fields in `config.main` contain the expected display values
- [ ] `pageName` in `uiSchema` top-level scope matches the page being built
- [ ] `validationChecks` covers: heading, all labels, all key values, all buttons
- [ ] `attemptNumber` starts at `1` and increments on each retry
