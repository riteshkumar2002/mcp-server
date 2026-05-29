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

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

This skill contains **config-only** examples. Never construct or edit uiSchema or schema by hand.

---

## What is HorizontalLayout?

HorizontalLayout is a **container** that arranges child elements side-by-side in a responsive multi-column grid. Children (Table, Box, Card, Graph, EmptyBox, etc.) are placed horizontally within it.

---

## When to Use HorizontalLayout

- Two or more content blocks side-by-side (tables, charts, cards)
- Multi-column dashboard sections
- Responsive 2-column or 3-column layouts

---

## Add to config.elements

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

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Config | Notes |
|---|---|---|
| type | `"HorizontalLayout"` | Required — identifies the container |
| divider | `"No"` / `"YES"` | String value |
| isAccordion | `"No"` / `"YES"` | String value; `"No"` disables accordion |
| layout values | strings (`"6"`) | Per-breakpoint column width for the container |
| style | JSON string | Optional custom CSS |
| elements | Array | Child components placed side-by-side |

---

## Complete Example: Two Tables Side-by-Side (from page_schemeDashboard)

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

---

## Example: With Accordion (config)

```json
{
  "name": "dataSection",
  "type": "HorizontalLayout",
  "label": "Data Section",
  "events": [],
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ],
  "divider": "No",
  "isAccordion": "YES",
  "defaultClosed": "NO",
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

**Mistake 1:** `divider` and `isAccordion` values — config always uses string values (`"No"`, `"YES"`), never booleans.

**Mistake 2:** Column totals — the `layout` value on HorizontalLayout is the width of **the container**, not each child. Set `layout` on each child element separately, using 12-column math within the container.

**Mistake 3:** Nesting too deeply — HorizontalLayout can contain Tables, Box, Card, Graph, EmptyBox, etc., but avoid nesting HorizontalLayout inside another HorizontalLayout unless the page design specifically requires it.

---

## Testing Checklist

- [ ] Children appear side-by-side on desktop (lg)
- [ ] Children stack correctly on mobile (xs)
- [ ] Column layout math is correct
- [ ] Accordion open/close works (if configured)
- [ ] Divider shows/hides correctly

---

## Reference

**Based on:** page_schemeDashboard  
**Widget:** HorizontalLayout  
**Version:** 1.0  
**Status:** Production Ready
