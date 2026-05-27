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

## Step 2: Add to uiSchema.elements

Note: widget is `"Button"` (not `"ButtonWithIconAndText"`). The distinction is in config, not the widget name. Use `startIcon` to set the icon.

```json
{
  "type": "Control",
  "scope": "#/properties/refresh",
  "config": {
    "main": {
      "icon": "",
      "name": "Refresh",
      "size": "small",
      "type": "text",
      "onClick": "onClick",
      "variant": "contained",
      "startIcon": "RefreshIcon",
      "styleDefault": false,
      "enableDefaultStyle": false
    },
    "style": {},
    "layout": {
      "lg": 1.5,
      "md": 2,
      "sm": 2.5,
      "xs": 4
    }
  },
  "options": {
    "widget": "Button"
  }
}
```

---

## Step 3: Add to schema.properties

```json
{
  "refresh": {},
  "export": {}
}
```

---

## Key Configuration Points

| Property | Location | Purpose | Example |
|---|---|---|---|
| buttonType | config | Identifies button style | "ButtonWithIconAndText" |
| iconName | config | Icon shown on button | "RefreshIcon" |
| defaultStyle | config | Use theme defaults | "true" or "false" |
| widget | uiSchema options | Always "Button" | "Button" |
| startIcon | uiSchema main | Icon name for rendering | "RefreshIcon" |
| name | uiSchema main | Button label text | "Refresh" |
| variant | uiSchema main | Button style | "contained", "outlined", "text" |

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

### uiSchema.elements

```json
[
  {
    "type": "Control",
    "scope": "#/properties/export",
    "config": {
      "main": {
        "icon": "DownloadIcon",
        "name": "Export Report",
        "size": "small",
        "type": "text",
        "color": "success",
        "onClick": "onClick",
        "variant": "contained",
        "startIcon": "DownloadIcon",
        "styleDefault": false
      },
      "layout": {"lg": 2, "md": 3, "sm": 4, "xs": 6}
    },
    "options": {"widget": "Button"}
  },
  {
    "type": "Control",
    "scope": "#/properties/refresh",
    "config": {
      "main": {
        "icon": "",
        "name": "Refresh",
        "size": "small",
        "type": "text",
        "onClick": "onClick",
        "variant": "contained",
        "startIcon": "RefreshIcon",
        "styleDefault": false,
        "enableDefaultStyle": false
      },
      "layout": {"lg": 1.5, "md": 2, "sm": 2.5, "xs": 4}
    },
    "options": {"widget": "Button"}
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

**Mistake 1:** Wrong widget in uiSchema — always `"Button"`, not `"ButtonWithIconAndText"`
```json
// WRONG
"options": {"widget": "ButtonWithIconAndText"}

// CORRECT
"options": {"widget": "Button"}
```

**Mistake 2:** Missing `startIcon` in uiSchema `config.main` — this is what actually renders the icon
```json
// WRONG — icon won't appear
"main": {"name": "Refresh", "variant": "contained"}

// CORRECT
"main": {"name": "Refresh", "startIcon": "RefreshIcon", "variant": "contained"}
```

**Mistake 3:** Confusing `iconName` (config) with `startIcon` (uiSchema) — both must be set to the same icon name.

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
