---
name: add-button-with-icon-and-text
description: Add ButtonWithIconAndText components to Hyperform pages. Use this skill whenever you need buttons that show both an icon AND a text label — Refresh, Export, Approve, Reject, or any prominent action trigger. Covers buttonType "ButtonWithIconAndText", iconName, startIcon in uiSchema, widget "Button", color themes, layout sizing, and event handlers (refresh/api/navigate).
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add ButtonWithIconAndText Component

**Pattern Reference:** page_payoutException  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add ButtonWithIconAndText to Your Page

ButtonWithIconText Component displays a button with **both an icon AND text label**. Perfect for:
- Action buttons with visual indicators (Refresh, Export, Save)
- Navigation buttons with icons
- Approve / Reject workflow actions
- Accessible buttons (icon + text beats icon-only)

---

## Button Type Comparison

| Type | Display | Use Case |
|---|---|---|
| `Button` | Text only | Simple text buttons |
| `IconButton` | Icon only | Compact table row/header buttons |
| `ButtonWithIconAndText` | Icon + Text | Prominent, accessible action buttons |

---

## Step 1: Add to config.elements

### Basic ButtonWithIconAndText

```json
{
  "name": "refresh",
  "type": "Button",
  "label": "Refresh",
  "events": [
    {
      "events": [],
      "Handler": "refresh",
      "eventType": "onClick",
      "refreshElements": [
        {"value": "dataTable"}
      ]
    }
  ],
  "iconName": "RefreshIcon",
  "buttonType": "ButtonWithIconAndText",
  "defaultStyle": "true"
}
```

### With Custom Layout and Color

```json
{
  "name": "export",
  "type": "Button",
  "label": "Export Report",
  "events": [
    {
      "path": "/export/report",
      "method": "post",
      "Handler": "api",
      "eventType": "onClick"
    }
  ],
  "iconName": "DownloadIcon",
  "buttonType": "ButtonWithIconAndText",
  "color": "success",
  "defaultStyle": "false",
  "layout": [
    {"key": "lg", "value": "2"},
    {"key": "md", "value": "3"},
    {"key": "sm", "value": "4"},
    {"key": "xs", "value": "6"}
  ]
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| buttonType | Identifies button style | "ButtonWithIconAndText" |
| iconName | Icon shown on button | "RefreshIcon" |
| label | Button label text | "Refresh" |
| color | Button color theme | "primary", "success", "error" |
| defaultStyle | Use theme defaults | "true" or "false" |
| size | Button size | "small", "medium", "large" |
| layout | Responsive grid columns | `[{"key": "lg", "value": "2"}, ...]` |

---

## Complete Example: Export + Refresh Buttons

### config.elements

```json
[
  {
    "name": "export",
    "type": "Button",
    "label": "Export Report",
    "events": [
      {
        "path": "/reports/export",
        "method": "post",
        "Handler": "api",
        "apiBody": "(store) => {return {reportId: store.formData.reportId}}",
        "eventType": "onClick",
        "events": [
          {
            "Handler": "inBuiltFunction",
            "inBuiltFunctionType": "downloadFile",
            "eventType": "Success"
          }
        ]
      }
    ],
    "iconName": "DownloadIcon",
    "buttonType": "ButtonWithIconAndText",
    "color": "success",
    "layout": [
      {"key": "lg", "value": "2"},
      {"key": "md", "value": "3"},
      {"key": "sm", "value": "4"},
      {"key": "xs", "value": "6"}
    ]
  },
  {
    "name": "refresh",
    "type": "Button",
    "label": "Refresh",
    "events": [
      {
        "events": [],
        "Handler": "refresh",
        "eventType": "onClick",
        "refreshElements": [
          {"value": "reportTable"}
        ]
      }
    ],
    "iconName": "RefreshIcon",
    "buttonType": "ButtonWithIconAndText",
    "defaultStyle": "true",
    "layout": [
      {"key": "lg", "value": "2"},
      {"key": "md", "value": "3"},
      {"key": "sm", "value": "4"},
      {"key": "xs", "value": "6"}
    ]
  }
]
```

---

## Common Icon Names

```
RefreshIcon       — Reload/refresh
DownloadIcon      — Download files
SaveIcon          — Save/persist
DeleteIcon        — Delete action
ExportIcon        — Export data
ImportIcon        — Import data
UploadIcon        — Upload files
SearchIcon        — Search
FilterIcon        — Filter
PrintIcon         — Print
AddIcon           — Add/create
EditIcon          — Edit item
ViewIcon          — View/open
CheckIcon         — Confirm/approve
CloseIcon         — Close/reject
SendIcon          — Send message
ExceptionIcon     — Exception/error
WarningIcon       — Warning
InfoIcon          — Information
```

---

## Color Themes

```json
"color": "primary"    // Blue — main actions
"color": "success"    // Green — Export, Save, Approve
"color": "warning"    // Orange — caution actions
"color": "error"      // Red — Reject, Cancel, Delete
"color": "info"       // Light blue — informational
"color": "secondary"  // Gray — secondary actions
```

---

## Layout Options

### Compact
```json
"layout": {"lg": 1.5, "md": 2, "sm": 2.5, "xs": 4}
```

### Medium
```json
"layout": {"lg": 2, "md": 3, "sm": 4, "xs": 6}
```

### Wide
```json
"layout": {"lg": 4, "md": 4, "sm": 6, "xs": 12}
```

---

## Event Handler Patterns

### Refresh Table
```json
{
  "Handler": "refresh",
  "eventType": "onClick",
  "refreshElements": [{"value": "tableControlName"}]
}
```

### API Call
```json
{
  "path": "/api/action",
  "method": "post",
  "Handler": "api",
  "apiBody": "(store) => {return {...}}",
  "eventType": "onClick"
}
```

### Navigate
```json
{
  "Handler": "custom",
  "eventCode": "async (store) => { store.navigate('/page_name'); }",
  "eventType": "onClick"
}
```

---

## 2-Step Chained Download (Generate Report → Download File)

Use this pattern when downloading a report requires **two sequential API calls**:
1. First call generates the report and returns a `fileId`
2. Second call uses that `fileId` to fetch and download the file

The pattern uses **nested Success events** — a Success handler on the first API call that stores the fileId and triggers the second API call.

```json
{
  "name": "downloadReport",
  "type": "Button",
  "label": "Download",
  "iconName": "DownloadIcon",
  "buttonType": "ButtonWithIconAndText",
  "color": "primary",
  "events": [
    {
      "body": [
        {"key": "reportName",  "value": "<your-report-name>"},
        {"key": "messageType", "value": "generateReport"},
        {"key": "reportType",  "value": "fileDownload"},
        {"key": "startDate",   "value": "$startDate"},
        {"key": "endDate",     "value": "$endDate"},
        {"key": "programId",   "value": "$programId"}
      ],
      "path": "/HyperformMessage/process",
      "events": [
        {
          "events": [
            {
              "path": "/externalData/getById",
              "events": [
                {
                  "events": [],
                  "Handler": "inBuiltFunction",
                  "eventCode": "",
                  "eventType": "Success",
                  "funcParametersCode": "(store, dynamicData, userValue, parentEventOutput, service) => {\n  return parentEventOutput.data;\n}",
                  "inBuiltFunctionType": "downloadFile"
                }
              ],
              "method": "post",
              "Handler": "api",
              "apiBody": "(store, dynamicData, userValue, resp, service) => {\n  return {\n    id: localStorage.getItem('<your-fileId-key>'),\n    withData: true,\n    toBeDeleted: false\n  };\n}",
              "eventCode": "",
              "eventType": "Success"
            }
          ],
          "Handler": "custom",
          "apiBody": "",
          "eventCode": "async (store, d, user, res, service) => {\n  localStorage.setItem('<your-fileId-key>', res.data);\n}",
          "eventType": "Success"
        }
      ],
      "method": "post",
      "Handler": "api",
      "eventType": "onClick"
    }
  ],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Replace:**
- `<your-report-name>` → your backend report identifier
- `<your-fileId-key>` → a unique localStorage key to store the generated file ID (e.g. `"releaseReportFileId"`)
- Body keys → match what your backend expects
- `reportType: "fileDownload"` → tells the backend to generate a downloadable file (vs `"reports"` for table data)

**How the chain works:**
1. `onClick` → POST to `/HyperformMessage/process` with report params
2. Backend generates file, returns `fileId` in `res.data`
3. First `Success` (custom) → stores `fileId` in localStorage
4. Second `Success` (API) → POSTs `{id: fileId, withData: true}` to `/externalData/getById`
5. Third `Success` (inBuiltFunction downloadFile) → triggers browser download

**Why localStorage?** The `apiBody` on the inner API call needs the fileId but `res.data` from the outer call is not directly accessible in `apiBody`. Storing in localStorage bridges the two calls.

---

## Common Patterns

### Approve / Reject Row
```json
{
  "name": "approve",
  "type": "Button",
  "label": "Approve",
  "iconName": "CheckIcon",
  "buttonType": "ButtonWithIconAndText",
  "color": "success"
},
{
  "name": "reject",
  "type": "Button",
  "label": "Reject",
  "iconName": "CloseIcon",
  "buttonType": "ButtonWithIconAndText",
  "color": "error"
}
```

### Toolbar Button Group
```json
[
  {"name": "export", "iconName": "DownloadIcon", "label": "Export", "buttonType": "ButtonWithIconAndText"},
  {"name": "refresh", "iconName": "RefreshIcon", "label": "Refresh", "buttonType": "ButtonWithIconAndText"},
  {"name": "filter", "iconName": "FilterIcon", "label": "Filter", "buttonType": "ButtonWithIconAndText"}
]
```

---

## Common Mistakes to Avoid

**Mistake 1:** Missing `iconName` in config — this is required for the icon to render.
```json
// WRONG — icon won't appear
{"name": "refresh", "type": "Button", "buttonType": "ButtonWithIconAndText", "label": "Refresh"}

// CORRECT
{"name": "refresh", "type": "Button", "buttonType": "ButtonWithIconAndText", "label": "Refresh", "iconName": "RefreshIcon"}
```

**Mistake 2:** Using `buttonType: "Button"` instead of `"ButtonWithIconAndText"` — the buttonType must exactly match to get the icon+text rendering.

**Mistake 3:** Not setting `defaultStyle` — set `"true"` to use theme defaults or `"false"` to apply custom color.

---

## Testing Checklist

- [ ] Button displays with icon and text together
- [ ] Icon renders correctly
- [ ] Text label is readable
- [ ] Click event fires
- [ ] Color theme applied
- [ ] Hover state works
- [ ] Responsive on all screen sizes
- [ ] Accessible via keyboard

---

## Reference

**Based on:** page_payoutException  
**Widget:** Button (with startIcon)  
**Version:** 1.0  
**Status:** Production Ready
