---
name: add-horizontal-layout
description: Add HorizontalLayout container to Hyperform pages. Use this skill whenever you need side-by-side content — two tables next to each other, multi-column dashboards, or any 50/50, 33/67, or 25/75 horizontal split. Covers config type "HorizontalLayout", elements array, divider, isAccordion, uiSchema HorizontalLayout type with colorMap/rowSpacing, schema empty-object entry, and column math rules.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add HorizontalLayout Component

**Pattern Reference:** page_schemeDashboard  
**Version:** 1.0  
**Status:** Production Ready

---

## What is HorizontalLayout?

HorizontalLayout is a **container** that arranges child elements side-by-side in a responsive multi-column grid. Children (Table, Box, Card, Graph, EmptyBox, etc.) are placed horizontally within it.

---

## When to Use HorizontalLayout

- Two or more content blocks side-by-side (tables, charts, cards)
- Multi-column dashboard sections
- Responsive 2-column or 3-column layouts

---

## Step 1: Add to config.elements

```json
{
  "name": "dataSection",
  "type": "HorizontalLayout",
  "label": "Data Analysis",
  "events": [],
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ],
  "divider": "No",
  "isAccordion": "No",
  "elements": [
    // child elements here
  ]
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "HorizontalLayout",
  "scope": "#/properties/dataSection",
  "config": {
    "main": {
      "divider": false,
      "rowSpacing": 3
    },
    "layout": {
      "lg": 6,
      "md": 6,
      "sm": 12,
      "xs": 12
    },
    "defaultStyle": true
  },
  "elements": [
    // child Controls here
  ]
}
```

**Note:** uiSchema uses `"type": "HorizontalLayout"` (not `"type": "Control"`).

---

## Step 3: schema.properties

```json
{
  "dataSection": {}
}
```

---

## Key Configuration Points

| Property | Config | uiSchema |
|---|---|---|
| type | `"HorizontalLayout"` | `"HorizontalLayout"` (not "Control") |
| divider | `"No"` / `"YES"` (string) | `false` / `true` (boolean) |
| isAccordion | `"No"` / `"YES"` (string) | `true` / `false` in `config.main` |
| layout values | strings (`"6"`) | numbers (`6`) |
| rowSpacing | not in config | number in `config.main` (default 3) |
| defaultStyle | not in config | `true` in config root |

---

## Complete Example: Two Tables Side-by-Side (from page_schemeDashboard)

### config.elements

```json
{
  "name": "achievementSlab",
  "type": "HorizontalLayout",
  "label": "Achievement Slab",
  "events": [],
  "layout": [
    {"key": "md", "value": "6"},
    {"key": "lg", "value": "6"}
  ],
  "divider": "No",
  "isAccordion": "No",
  "elements": [
    {
      "name": "label-1",
      "type": "Box",
      "label": "Average Yield Slabs",
      "layout": [
        {"key": "xs", "value": "12"},
        {"key": "sm", "value": "12"},
        {"key": "md", "value": "12"},
        {"key": "lg", "value": "12"}
      ]
    },
    {
      "name": "avg_yield_slab",
      "type": "Table",
      "events": [],
      "elements": []
    },
    {
      "name": "label-2",
      "type": "Box",
      "label": "KPIs & Respective Weights",
      "layout": [
        {"key": "xs", "value": "12"},
        {"key": "sm", "value": "12"},
        {"key": "md", "value": "12"},
        {"key": "lg", "value": "12"}
      ]
    },
    {
      "name": "KPIs_and_Respective_Weights",
      "type": "Table",
      "events": [],
      "elements": []
    }
  ]
}
```

### uiSchema.elements

```json
{
  "type": "HorizontalLayout",
  "scope": "#/properties/achievementSlab",
  "config": {
    "main": {
      "label": "Achievement Slab",
      "divider": false,
      "rowSpacing": 3
    },
    "layout": {
      "lg": 6,
      "md": 6,
      "sm": 12,
      "xs": 12
    },
    "defaultStyle": true
  },
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/label-1",
      "config": {"main": {"heading": "Average Yield Slabs", "iconName": ""}, "style": {}, "layout": {"lg": 12, "md": 12}},
      "options": {"widget": "Box"}
    },
    {
      "type": "Control",
      "scope": "#/properties/avg_yield_slab",
      "config": {"main": {"columns": {"dataColumns": [], "actionColumns": []}}, "layout": 12},
      "options": {"widget": "Table"},
      "elements": []
    },
    {
      "type": "Control",
      "scope": "#/properties/label-2",
      "config": {"main": {"heading": "KPIs & Respective Weights", "iconName": ""}, "style": {}, "layout": {"lg": 12, "md": 12}},
      "options": {"widget": "Box"}
    },
    {
      "type": "Control",
      "scope": "#/properties/KPIs_and_Respective_Weights",
      "config": {"main": {"columns": {"dataColumns": [], "actionColumns": []}}, "layout": 12},
      "options": {"widget": "Table"},
      "elements": []
    }
  ]
}
```

---

## Example: With Accordion

```json
{
  "type": "HorizontalLayout",
  "scope": "#/properties/dataSection",
  "config": {
    "main": {
      "divider": false,
      "rowSpacing": 3,
      "isAccordion": true,
      "defaultClosed": false
    },
    "layout": {"lg": 6, "md": 6, "sm": 12, "xs": 12},
    "defaultStyle": true
  },
  "elements": [...]
}
```

---

## Common Split Patterns

| Split | lg layout value | Notes |
|---|---|---|
| 50/50 | `"6"` | Each child gets 6 cols |
| 33/67 | `"4"` left / `"8"` right | Unequal split |
| 25/75 | `"3"` left / `"9"` right | Sidebar + main |
| Three equal | `"4"` | Each child gets 4 cols |

---

## Common Mistakes to Avoid

**Mistake 1:** Using `"type": "Control"` in uiSchema — HorizontalLayout uses `"type": "HorizontalLayout"` (not `"Control"`).

**Mistake 2:** `divider` and `isAccordion` format — config uses strings (`"No"`, `"YES"`), uiSchema `config.main` uses booleans (`false`, `true`).

**Mistake 3:** Column totals — the layout value is the width of **each child column**, not the container. For 2 children at `lg: 6`, each child takes 6 cols (total 12). For 3 children at `lg: 4`, each takes 4 cols (total 12).

**Mistake 4:** Missing schema entry — the HorizontalLayout container name needs an empty `{}` in schema.properties, but children also need their own entries.

---

## Testing Checklist

- [ ] Children appear side-by-side on desktop (lg)
- [ ] Children stack correctly on mobile (xs)
- [ ] Column layout math is correct
- [ ] Schema has entries for container and all children
- [ ] Accordion open/close works (if configured)
- [ ] Divider shows/hides correctly

---

## Reference

**Based on:** page_schemeDashboard  
**Widget:** HorizontalLayout  
**Version:** 1.0  
**Status:** Production Ready
