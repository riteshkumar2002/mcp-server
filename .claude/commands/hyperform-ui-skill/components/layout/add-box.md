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

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

This skill contains **config-only** examples. Never construct or edit uiSchema or schema by hand.

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

## Add to config.elements

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

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Config | Notes |
|---|---|---|
| type | `"Box"` | Required — identifies the component |
| label | String | The text displayed as the heading/caption |
| iconName | String | Optional MUI icon name (e.g. `"AnalyticsIcon"`); auto-derived into uiSchema |
| layout | Array | Per-breakpoint column widths; full-width (`"12"`) is typical |
| style | JSON string | Optional custom CSS |

---

## Complete Example: Table Header (from page_schemeDashboard)

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

---

## With Icon

Add `iconName` to the config element to display an icon alongside the heading text:

```json
{
  "name": "dashboardHeader",
  "type": "Box",
  "label": "Analytics Dashboard",
  "iconName": "AnalyticsIcon",
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ]
}
```

Common icon names: `SearchIcon`, `AnalyticsIcon`, `DashboardIcon`, `ReportIcon`, `SettingsIcon`, `InfoIcon`

---

## Common Mistakes to Avoid

**Mistake 1:** Using Box for input or interaction — Box is display-only. It has no onClick event. Use Button instead.

**Mistake 2:** Leaving `label` empty — `label` is the heading text rendered on screen; it must be set to a non-empty string.

**Mistake 3:** Using an invalid icon name — only MUI icon names are supported (e.g. `"AnalyticsIcon"`). An invalid name will silently render no icon.

---

## Testing Checklist

- [ ] Text displays correctly
- [ ] Icon shows (if configured)
- [ ] Layout is full-width or correct column size
- [ ] No overflow or truncation

---

## Reference

**Based on:** page_schemeDashboard  
**Widget:** Box  
**Version:** 1.0  
**Status:** Production Ready
