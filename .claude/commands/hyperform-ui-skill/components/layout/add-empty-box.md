---
name: add-empty-box
description: Add EmptyBox (invisible layout spacer) to Hyperform pages. Use this skill whenever you need responsive grid spacing — aligning buttons left, centering content, filling remaining columns, or handling responsive layout shifts. EmptyBox renders no visible content; its sole purpose is occupying grid columns so row totals reach 12. Covers config type "EmptyBox", column math per breakpoint, uiSchema widget "EmptyBox", and schema empty-object entry.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add EmptyBox Component

**Pattern Reference:** page_systemBot, page_gridTracker  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

This skill contains **config-only** examples. Never construct or edit uiSchema or schema by hand.

---

## What is EmptyBox?

EmptyBox is a **layout utility component** — invisible space that fills grid columns to balance and align other elements within the 12-column grid system. It renders nothing visually.

---

## When to Use EmptyBox

- Create horizontal gaps between form elements
- Left-align a button (fill remaining columns with EmptyBox)
- Balance a row where elements don't naturally add up to 12
- Handle responsive layout shifts (different column widths per breakpoint)

---

## Add to config.elements

```json
{
  "name": "spacer",
  "type": "EmptyBox",
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

No `events`, no `label`, no other properties needed.

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## The Core Rule: Columns Must Sum to 12

For every row, at every breakpoint, all element column values must add up to 12.

```
Element (3) + EmptyBox (9) = 12 ✓
Button (1.5) + EmptyBox (10.5) = 12 ✓
Col1 (6) + Col2 (6) = 12 ✓
```

---

## Real Example: Left-Align a Button (from page_systemBot)

Button takes 1.5 columns, EmptyBox fills the remaining 10.5:

```json
[
  {
    "name": "query",
    "type": "TextArea",
    "layout": [
      {"key": "lg", "value": "12"},
      {"key": "md", "value": "12"},
      {"key": "sm", "value": "12"},
      {"key": "xs", "value": "12"}
    ]
  },
  {
    "name": "ask",
    "type": "Button",
    "label": "Ask",
    "layout": [
      {"key": "lg", "value": "1.5"},
      {"key": "md", "value": "2.5"},
      {"key": "sm", "value": "3"},
      {"key": "xs", "value": "4"}
    ]
  },
  {
    "name": "spacer",
    "type": "EmptyBox",
    "layout": [
      {"key": "lg", "value": "10.5"},
      {"key": "md", "value": "9.5"},
      {"key": "sm", "value": "9"},
      {"key": "xs", "value": "8"}
    ]
  }
]
```

---

## Real Example: Dropdown + Spacer (from page_systemBot)

Dropdown at 3 columns, spacer fills the remaining 9:

```json
[
  {
    "name": "category",
    "type": "Select",
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ]
  },
  {
    "name": "spacer1",
    "type": "EmptyBox",
    "layout": [
      {"key": "lg", "value": "9"},
      {"key": "md", "value": "8"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ]
  }
]
```

Grid math: lg 3+9=12 ✓, md 4+8=12 ✓, sm 6+6=12 ✓, xs 12+12 (wraps) ✓

---

## Common Mistakes to Avoid

**Mistake 1:** Column total ≠ 12
```json
// WRONG — 3 + 8 = 11
{"lg": "3"}, {"lg": "8"}

// CORRECT — 3 + 9 = 12
{"lg": "3"}, {"lg": "9"}
```

**Mistake 2:** Adding extra properties to EmptyBox — only `name`, `type`, and `layout` are needed. No `label`, no `events`.

**Mistake 3:** Adding styles to EmptyBox — the component renders nothing; style properties have no effect.

---

## Testing Checklist

- [ ] All rows sum to 12 at lg breakpoint
- [ ] All rows sum to 12 at md breakpoint
- [ ] All rows sum to 12 at sm breakpoint
- [ ] All rows sum to 12 at xs breakpoint
- [ ] No visible content renders where EmptyBox is placed
- [ ] Adjacent elements align correctly

---

## Reference

**Based on:** page_systemBot, page_gridTracker  
**Widget:** EmptyBox  
**Version:** 1.0  
**Status:** Production Ready
