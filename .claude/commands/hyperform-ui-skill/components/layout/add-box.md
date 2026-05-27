---
name: add-box
description: Add Box (static text/heading) components to Hyperform pages. Use this skill whenever you need a read-only label, section title, or caption — above a table, inside a HorizontalLayout column, or as a visual section divider. Covers config type "Box", label property, uiSchema widget "Box" with config.main.heading and iconName, schema empty-object entry, and common use as a header above tables.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Box Component

**Pattern Reference:** page_schemeDashboard  
**Version:** 1.0  
**Status:** Production Ready

---

## What is Box?

Box is a **display-only component** that renders static text — a section title, table label, or caption. It has no input, no events, and no data binding. It is the standard way to add visible headings inside layout containers.

---

## When to Use Box

- Section headers above tables or charts
- Column labels inside HorizontalLayout
- Descriptive captions for data sections
- Any short static text display

---

## Step 1: Add to config.elements

```json
{
  "name": "sectionLabel",
  "type": "Box",
  "label": "Sales Data",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ]
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/sectionLabel",
  "config": {
    "main": {
      "heading": "Sales Data",
      "iconName": ""
    },
    "style": {},
    "layout": {
      "lg": 12,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "Box"
  }
}
```

---

## Step 3: schema.properties

```json
{
  "sectionLabel": {}
}
```

---

## Key Configuration Points

| Property | Config | uiSchema |
|---|---|---|
| type | `"Box"` | widget: `"Box"` |
| text content | `label` | `config.main.heading` |
| icon | not in config | `config.main.iconName` (empty string if none) |
| layout values | strings (`"12"`) | numbers (`12`) |
| style | not needed | `config.style: {}` (empty object) |

**Both `label` in config and `heading` in uiSchema `config.main` must be set to the same text.**

---

## Complete Example: Table Header (from page_schemeDashboard)

### config.elements

```json
{
  "name": "label-1",
  "type": "Box",
  "label": "Average Yield Slabs",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ]
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/label-1",
  "config": {
    "main": {
      "heading": "Average Yield Slabs",
      "iconName": ""
    },
    "style": {},
    "layout": {
      "lg": 12,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "Box"
  }
}
```

---

## With Icon

```json
// uiSchema config.main
{
  "heading": "Analytics Dashboard",
  "iconName": "AnalyticsIcon"
}
```

Common icon names: `SearchIcon`, `AnalyticsIcon`, `DashboardIcon`, `ReportIcon`, `SettingsIcon`, `InfoIcon`

---

## Common Mistakes to Avoid

**Mistake 1:** Using `label` in uiSchema `config.main` instead of `heading` — Box uiSchema uses `heading`, not `label`.

**Mistake 2:** Omitting `iconName` — always include `"iconName": ""` even when no icon is needed, otherwise the component may error.

**Mistake 3:** Missing schema entry — Box must have an empty `{}` in schema.properties.

**Mistake 4:** Using Box for clickable content — Box has no onClick event. Use Button instead.

---

## Testing Checklist

- [ ] Text displays correctly
- [ ] Icon shows (if configured)
- [ ] Layout is full-width or correct column size
- [ ] No overflow or truncation
- [ ] Schema has the entry

---

## Reference

**Based on:** page_schemeDashboard  
**Widget:** Box  
**Version:** 1.0  
**Status:** Production Ready
