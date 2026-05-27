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

## What is EmptyBox?

EmptyBox is a **layout utility component** — invisible space that fills grid columns to balance and align other elements within the 12-column grid system. It renders nothing visually.

---

## When to Use EmptyBox

- Create horizontal gaps between form elements
- Left-align a button (fill remaining columns with EmptyBox)
- Balance a row where elements don't naturally add up to 12
- Handle responsive layout shifts (different column widths per breakpoint)

---

## Step 1: Add to config.elements

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

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/spacer",
  "config": {
    "main": {},
    "style": {},
    "layout": {
      "lg": 6,
      "md": 6,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "EmptyBox"
  }
}
```

---

## Step 3: Add to schema.properties

```json
{
  "spacer": {}
}
```

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

### config.elements

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

### uiSchema.elements

```json
[
  {
    "type": "Control",
    "scope": "#/properties/ask",
    "config": {"main": {"label": "Ask"}, "layout": {"lg": 1.5, "md": 2.5, "sm": 3, "xs": 4}},
    "options": {"widget": "Button"}
  },
  {
    "type": "Control",
    "scope": "#/properties/spacer",
    "config": {"main": {}, "style": {}, "layout": {"lg": 10.5, "md": 9.5, "sm": 9, "xs": 8}},
    "options": {"widget": "EmptyBox"}
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

**Mistake 2:** Strings in uiSchema layout — config uses string values (`"6"`), uiSchema layout uses numbers (`6`).

**Mistake 3:** Missing schema entry — EmptyBox must have an empty object `{}` in schema.properties or the build will fail.

**Mistake 4:** Adding styles to EmptyBox — `main` and `style` must both be empty objects `{}`.

---

## Testing Checklist

- [ ] All rows sum to 12 at lg breakpoint
- [ ] All rows sum to 12 at md breakpoint
- [ ] All rows sum to 12 at sm breakpoint
- [ ] All rows sum to 12 at xs breakpoint
- [ ] EmptyBox entry present in schema.properties
- [ ] uiSchema layout uses numbers (not strings)
- [ ] No visible content renders where EmptyBox is placed

---

## Reference

**Based on:** page_systemBot, page_gridTracker  
**Widget:** EmptyBox  
**Version:** 1.0  
**Status:** Production Ready
