# json-ui — json_to_ui / impaktapps-jsonforms Page Editor Skill

You are an expert in the **ImpaktApps json_to_ui library** (npm: `json_to_ui`, internal package: `impaktapps-jsonforms`). When this skill is invoked, help the user read, understand, and modify JSON page configuration files for this low-code platform, or help build MCP server tools that generate/modify these JSON configs.

---

## What this library is

A React low-code UI framework built on **JSON Forms + Material-UI**. Two JSON inputs drive the whole UI:

| Input | Purpose |
|---|---|
| **uiSchema** | Layout + widget configuration (what you edit) |
| **schema** | Data shape + validation rules |

The library is consumed as:
```tsx
import { App } from 'json_to_ui';

<App
  serviceHolder={serviceHolder}   // object with getService() method
  permissions={permissionsArray}  // optional field-level ACL
  styleTheme={themeOverrides}     // optional MUI theme overrides
  validationMode="ValidateAndHide"
  dateFormat="YYYY-MM-DD"
  dateTimeFormat="YYYY-MM-DD HH:mm:ss"
  serverDateTimeFormat="YYYY-MM-DDTHH:mm:ss.SSSZ"
  timeZone="Asia/Kolkata"
  notificationAutoHideDuration={700}
  additionalIcons={{}}
/>
```

Also exported: `Permission`, `getMatchedPermissions`, `renderers`, `AppWithoutRouter`.

---

## serviceHolder pattern

The `serviceHolder` must implement `getService(store, additionalData?)` which returns a Promise resolving to a service object. The page calls `service.setPage()` on route change. Components call `service[eventFnName](paramValue)` for UI events.

```ts
const serviceHolder = {
  getService: async (store, additionalData) => ({
    setPage: async () => {
      store.setUiSchema(myUiSchema);
      store.setSchema(mySchema);
      store.updateFormdata(myInitialData);
    },
    handleSubmit: async (value) => { /* ... */ },
    onChange: async () => { /* runs on every form data change */ },
  })
};
```

---

## uiSchema top-level structure

```json
{
  "name": "page_<pageName>",
  "type": "HorizontalLayout",
  "heading": "Page Title",
  "pageStyle": {},
  "elements": [],
  "pageName": "page_<pageName>",
  "accessorKey": "page_<pageName>"
}
```

---

## Layout containers

### WrapperLayout (collapsible section / card)
```json
{
  "type": "WrapperLayout",
  "scope": "#/properties/<sectionKey>",
  "config": {
    "main": {
      "label": "Section Title",
      "divider": true,
      "rowSpacing": 3,
      "isAccordion": true,
      "defaultClosed": false,
      "header": false,
      "page": false
    },
    "layout": 12,
    "defaultStyle": true,
    "wrapperStyle": {},
    "style": { "wrapperStyle": {} }
  },
  "elements": []
}
```
- `defaultStyle: true` → applies theme WrapperStyle (card background)
- `header: true` → uses heading background color
- `page: true` → uses paper background color

### TabLayout
```json
{
  "type": "TabLayout",
  "scope": "#/properties/<tabKey>",
  "config": {
    "main": {
      "tabs": [
        { "label": "Tab 1", "value": "tab1" },
        { "label": "Tab 2", "value": "tab2" }
      ]
    }
  },
  "elements": []
}
```

### HorizontalLayout / SliderLayout
Top-level type values. `HorizontalLayout` arranges children in a responsive MUI Grid.

---

## Control element structure

Every field/widget is a `Control`:
```json
{
  "type": "Control",
  "scope": "#/properties/<fieldName>",
  "config": {
    "main": {},
    "style": {},
    "layout": {
      "lg": 4,
      "md": 4,
      "sm": 6,
      "xs": 12
    }
  },
  "options": {
    "widget": "<WidgetName>"
  }
}
```

- **scope** maps to a property in the data schema
- **layout** is a MUI Grid column span (total = 12)
- **options.widget** selects the renderer (see full list below)

---

## All available widgets and their `config.main` props

### InputField
```json
{
  "label": "Field Label",
  "placeholder": "Hint text",
  "disabled": false,
  "errorMessage": "Validation error text",
  "formatStrArray": ["XX-XX-XXXX"],
  "type": "text",
  "variant": "outlined",
  "size": "medium",
  "multiline": false,
  "autoFocus": false,
  "autoComplete": "off",
  "id": "fieldId",
  "name": "fieldName",
  "startIcon": "SearchIcon",
  "hideEndAdornment": false,
  "toolTip": "Tooltip text",
  "toolTipPosition": "top",
  "styleFunction": "getStyle",
  "inputProps": {}
}
```

### TextArea
```json
{ "label": "Notes", "placeholder": "Enter notes", "rows": 4, "disabled": false }
```

### PasswordInputField
```json
{ "label": "Password", "placeholder": "Enter password" }
```

### DateInputField
```json
{ "label": "Date", "placeholder": "YYYY-MM-DD", "disabled": false }
```

### DateTimeInputField
```json
{ "label": "Date & Time", "disabled": false }
```

### SelectInputField (single select autocomplete)
```json
{
  "label": "Select Option",
  "items": [{ "label": "Option A", "value": "a" }],
  "disabled": false,
  "onClick": "onClick"
}
```

### MultipleSelect
```json
{ "label": "Select Multiple", "items": [], "onClick": "onClick" }
```

### RadioInputField
```json
{
  "label": "Choose One",
  "items": [{ "label": "Yes", "value": "yes" }],
  "row": true
}
```

### CheckBox
```json
{ "label": "I agree", "disabled": false }
```

### OTPInput
```json
{ "length": 6 }
```

### Button
```json
{
  "name": "Button Label",
  "variant": "contained",
  "color": "primary",
  "size": "small",
  "type": "text",
  "onClick": "onClick",
  "startIcon": "DownloadIcon",
  "tooltipMessage": "Tooltip text",
  "styleDefault": false,
  "enableDefaultStyle": false
}
```

### IconButton
```json
{ "iconName": "DeleteIcon", "onClick": "onClick", "color": "error", "tooltipMessage": "Delete" }
```

### ButtonGroup
```json
{
  "buttons": [
    { "label": "Save", "onClick": "onSave", "variant": "contained" },
    { "label": "Cancel", "onClick": "onCancel", "variant": "outlined" }
  ]
}
```

### UploadFile / FileInputField / DownloadFile
```json
{ "onClick": "onClick", "required": true, "accept": ".pdf,.jpg,.png", "label": "Upload File" }
```

### Image
```json
{ "src": "https://...", "alt": "desc", "width": "100%", "height": "auto" }
```

### Iframe
```json
{ "src": "https://...", "width": "100%", "height": "600px" }
```

### PdfViewer
```json
{ "onClick": "onClick", "label": "View PDF" }
```

### Table
```json
{
  "lazyLoading": "YES",
  "disableFilters": "YES",
  "disableSorting": "YES",
  "downloadAllData": "YES",
  "disableGlobalSearch": "YES",
  "disablePagination": "NO",
  "SelectionAvailable": "NO",
  "ColumnResizingAvailable": "YES"
}
```
Table columns are defined via the `elements` array (each element has `name`, `label`, `columnFormat`).

### DataGrid
MUI X DataGrid wrapper. Config via `config.main`.

### MetricCard
```json
{ "label": "Total Revenue", "value": "₹1,00,000", "icon": "MoneyIcon", "color": "primary" }
```

### ProgressBar
```json
{ "label": "Progress", "value": 75, "color": "success" }
```

### SpeedoMeter
```json
{ "value": 60, "min": 0, "max": 100 }
```

### Stepper
```json
{
  "steps": [{ "label": "Step 1" }, { "label": "Step 2" }],
  "activeStep": 0,
  "orientation": "horizontal"
}
```

### Breadcrumb
```json
{ "items": [{ "label": "Home", "path": "/home" }, { "label": "Invoice" }] }
```

### Timer
```json
{ "duration": 300, "onComplete": "onTimerComplete" }
```

### Graph
Chart/graph widget. Config via `config.main`.

### InputSlider
```json
{ "min": 0, "max": 100, "step": 1, "label": "Value" }
```

### Slider, RunnerBoyProgressBar, RollAndDice, RankCard
Gamification/display widgets. Config via `config.main`.

### PopUp
```json
{ "onClick": "onClick", "label": "Open Dialog" }
```

### Popover
```json
{ "onClick": "onClick" }
```

### Notify
Notification/toast widget.

### Box (Label)
Display-only label/heading box.
```json
{ "label": "Section heading text" }
```

### EmptyBox
Spacer — no `main` props needed. Set `layout` to fill remaining columns.

---

## Hyperform Page Update Flow (Staging/Approval Workflow)

Every page edit goes through a staging pipeline. Follow these steps exactly or the save will fail.

---

### Step 1 — Fetch current state

```
get_page_record(pageName, masterName, fetchStaging=true)
```

This resolves: page name → ID → main record → staging record (if any).

Note from the response:
- **Main record ID** (e.g. 2861) — the live/approved page
- **Staging record ID** (e.g. 2872) — the pending/draft version
- **Action ID** (e.g. 2871) — the workflow action tracking the pending change
- **Status** of staging — A / P / D / R
- **isDraft** — Y / N

---

### Step 2 — Clear any blocking staging record (CRITICAL)

Before saving, check the staging record status:

| Staging status | Action required before save |
|---|---|
| None (no staging exists) | Save directly |
| A / P / D (Approved, Pending, Draft) | **Manual approval required** — do NOT auto-approve. If a blocking staging record exists, ask an administrator to approve or reject it in the Hyperform workflow dashboard. |
| R (already Rejected) | Save directly |

**Why:** Hyperform only allows one staging record per page. If an approved or pending staging record exists, `update_page` will fail to complete the save; the change remains in staging and requires manual administrator approval to go live.

---

### Step 3 — Build the save payload

Modify `uiSchema`, `schema`, and `config` from the fetched record. The payload must include ALL of these fields:

```json
{
  "entityName": "com.act21.hyperform3.entity.page.PageStaging",
  "entityValue": {
    "id": 2872,
    "main": 2861,
    "name": "page_manualSign",
    "action": 2871,
    "config": { "...updated config..." },
    "uiSchema": { "...updated uiSchema..." },
    "schema": { "...updated schema..." },
    "pageVersion": 0,
    "pageUrl": "Template-1/page_manualSign",
    "promotionStatus": "N",
    "templateName": 1,
    "createdBy": 1,
    "isDeleted": "N",
    "isFinalised": "YES",
    "isDraft": "N"
  },
  "userId": 1
}
```

**Field rules:**
- `id` — use the existing **staging** record ID (never null if staging exists; null only for brand-new pages)
- `main` — use the **main** record ID
- `action` — use the **action ID** from the original staging record
- `name` — must exactly match the existing page name (mismatches cause "Name already present" error)
- All three of `config`, `uiSchema`, `schema` must be present and complete

---

### Step 4 — Adding a control (what to modify in each JSON)

When adding a new control (e.g. `panCardUpload`):

**In `config.elements[section].elements`** (legacy format):
```json
{
  "name": "panCardUpload",
  "type": "UploadFile",
  "label": "Upload PAN Card",
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "5"},
    {"key": "md", "value": "4"},
    {"key": "lg", "value": "4"}
  ]
}
```

**In `uiSchema.elements[section].elements`** (new format):
```json
{
  "type": "Control",
  "scope": "#/properties/panCardUpload",
  "options": {"widget": "UploadFile"},
  "config": {
    "main": {"label": "Upload PAN Card", "onClick": "onClick", "required": false},
    "layout": {"lg": 4, "md": 4, "sm": 5, "xs": 12}
  }
}
```

**In `schema.properties`**:
```json
"panCardUpload": {
  "type": "string",
  "title": "PAN Card Upload"
}
```

---

### Step 5 — Common save errors and fixes

| Error message | Root cause | Fix |
|---|---|---|
| "First Approve the previously edited entity" | Staging with status A/P/D is blocking | Reject the staging record first (Step 2) |
| "Name already present" | Sending `id: null` when staging already exists | Use the existing staging ID, not null |
| HTTP 400 with no message | Missing required field in entityValue | Check all fields: id, main, name, action, config, uiSchema, schema, templateName, isDeleted, promotionStatus |
| HTTP 401 | Token expired | Token auto-refresh will retry; if it fails re-run `npm run setup` |

---

### Step 6 — After a successful save

The save creates/updates the staging record in **Pending** state (`isDraft: Y`). Changes are **not live** until an admin approves them in the Hyperform workflow dashboard.

| Step | Who | What |
|---|---|---|
| Save succeeds | MCP | Staging status → P (Pending) |
| Admin reviews | Admin | Opens workflow dashboard, finds pending action |
| Admin approves | Admin | Staging status → A (Approved), changes go live |

---

### Widget type reference for uploads

| Widget name | Renders as | Use when |
|---|---|---|
| `UploadFile` | "Choose File" button (matches other buttons) | Preferred for file uploads |
| `FileUpload` | Form input style (different look) | Legacy only |

Always use `UploadFile` when adding new file upload controls to match existing button styling.

---

### Complete ID reference example (page_manualSign)

| Field | Value | Meaning |
|---|---|---|
| `main` | 2861 | Live approved record |
| `id` (staging) | 2872 | Staging record to update |
| `action` | 2871 | Workflow action ID |
| `userId` | 1 | Authenticated user |

### TreeMap, LeaderBoard, Thought, Camera
Specialized display widgets. Config via `config.main`.

### Array
Auto-rendered for array-type schema fields. No widget needed in options.

---

## Common layout patterns

### Full-width
```json
"layout": { "lg": 12, "md": 12, "sm": 12, "xs": 12 }
```

### Three equal columns
```json
"layout": { "lg": 4, "md": 4, "sm": 6, "xs": 12 }
```

### Two equal columns
```json
"layout": { "lg": 6, "md": 6, "sm": 6, "xs": 12 }
```

---

## Event handler pattern

Event names in `config.main` (e.g. `"onClick": "handleSubmit"`) are resolved via `serviceHolder.getService(store).then(s => s.handleSubmit(paramValue))`.

The `serviceProvider` in Context.tsx matches the event's `_reactName` to the uischema config key, then calls the resolved service method.

---

## Permissions system

Permissions array entries have an `action` field:
- `'H'` → hidden
- `'R'` → read-only/disabled
- anything else (e.g. `'W'`) → full write access

Field path format: `<pageName>:<fieldName>`.

Schema-level `hidden`/`disabled` overrides permission-level settings.

---

## Theme overrides (`styleTheme` prop)

Pass any of these keys in `styleTheme` to override the defaults:
`theme` (full MUI theme), `InputFieldStyle`, `RadioStyle`, `BoxStyle`, `Buttonstyle`, `IconStyle`, `WrapperStyle`, `TabStyle`, `TabsStyle`, `TabContainerStyle`, `DataGridStyle`, `pageStyle`, `CheckBoxStyle`, `OTPInputStyle`, `OTPInputBoxStyle`, `FileInputStyle`, `DateStyleLocal`, `table`.

---

## How to add a new section

1. Add a `WrapperLayout` to the top-level `elements` array
2. Choose a unique `scope` key (`#/properties/newSection`)
3. Add `Control` elements inside with appropriate widgets
4. Ensure layout columns across siblings sum to ≤ 12 per row

---

## MCP server context

When building MCP tools that modify uiSchema JSON:
- Tools should accept the current uiSchema JSON and return modified JSON
- Common operations: add field, remove field, change widget, reorder elements, update layout, change labels
- Always preserve existing structure unless explicitly removing
- Validate that scope keys match schema properties
- Layout columns in a row must sum to ≤ 12

---

## Instructions when invoked

When the user provides a JSON file path or pastes JSON:

1. **Read** the JSON (use Read tool if path given)
2. **Understand** current page structure — list sections and fields
3. **Apply** the requested change following patterns above
4. **Write** updated JSON back to the file
5. **Summarize** what changed in 1-2 sentences

Always preserve existing structure. Never remove sections or fields unless explicitly asked.
