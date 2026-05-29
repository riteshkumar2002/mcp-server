---
name: add-progress-bar
description: Add ProgressBar components to Hyperform pages. Use this skill whenever you need to visualize progress towards a target — achievement tracking, sales targets, KPI completion, performance metrics, or any actual vs target comparison. Covers config type "ProgressBar", uiSchema widget "ProgressBar", data shape {total, achieved}, onLoad population from API or custom event, and over-achievement (>100%) handling.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add ProgressBar Component

**Pattern Reference:** page_userPointDashboard  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## How to Add ProgressBar to Your Page

ProgressBar Component visualizes progress towards a target goal. Perfect for:
- Achievement tracking (actual vs target)
- Performance metrics
- Goal progress visualization
- Sales targets
- KPI tracking
- Completion status

---

## Step 1: Add to config.elements

```json
{
  "name": "targetVsAchivement",
  "type": "ProgressBar",
  "label": "Achievement Progress",
  "events": [],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

### All Config Properties for ProgressBar

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field name | `"targetVsAchivement"` |
| `type` | Always `"ProgressBar"` | `"ProgressBar"` |
| `label` | Heading shown above the bar | `"Achievement Progress"` |
| `variant` | Bar display variant | `"determinate"` / `"indeterminate"` / `"buffer"` / `"query"` |
| `size` | Bar thickness (number) | `10`, `15`, `20` |
| `bottomLabel_1` | Label at the left below the bar | `"Achieved"` |
| `bottomLabel_2` | Label in the middle below the bar | `"Target"` |
| `bottomLabel_3` | Label at the right below the bar | `"Remaining"` |
| `pieArcColors` | Array of color stops | `[{"key": "color1", "value": "#1F6F78"}]` |
| `layout` | Responsive grid sizing | see layout section |
| `events` | `onLoad` to populate data | always required |

### Full Example with All Properties

```json
{
  "name": "salesProgress",
  "type": "ProgressBar",
  "label": "Sales Achievement",
  "variant": "determinate",
  "size": 12,
  "bottomLabel_1": "Achieved",
  "bottomLabel_2": "Target",
  "bottomLabel_3": "Remaining",
  "pieArcColors": [
    {"key": "color1", "value": "#0FAFAF"},
    {"key": "color2", "value": "#e0e0e0"}
  ],
  "events": [],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Step 2: Populate with Data

ProgressBar reads `{ total, achieved }` from formdata. Set it in an `onLoad` event.

### From a custom event (hardcoded / calculated)

```json
{
  "Handler": "custom",
  "eventCode": "(store, dynamicData, userValue) => {\n  store.setFormdata((prev) => ({\n    ...prev,\n    targetVsAchivement: {\n      total: 100000,\n      achieved: 75000\n    }\n  }));\n}",
  "eventType": "onLoad"
}
```

### From an API response

```json
{
  "Handler": "api",
  "path": "/api/target/progress",
  "method": "get",
  "eventType": "onLoad",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "async (store, dynamicData, userValue, res) => {\n  store.setFormdata((prev) => ({\n    ...prev,\n    targetVsAchivement: {\n      total: res.data.targetAmount,\n      achieved: res.data.achievedAmount\n    }\n  }));\n}",
      "eventType": "Success"
    }
  ]
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field name | `"targetVsAchivement"` |
| `type` | Must be `"ProgressBar"` | `"ProgressBar"` |
| `label` | Heading shown above the bar | `"Achievement Progress"` |
| `variant` | Bar display variant | `"determinate"` |
| `size` | Bar thickness (number) | `12` |
| `bottomLabel_1` | Label at the left below bar | `"Achieved"` |
| `bottomLabel_2` | Label in the middle below bar | `"Target"` |
| `bottomLabel_3` | Label at the right below bar | `"Remaining"` |
| `pieArcColors` | Color stops array | `[{"key": "color1", "value": "#0FAFAF"}]` |
| `layout` | Responsive grid sizing | see layout section |
| `events` | `onLoad` to populate `{total, achieved}` in formdata | always required |

---

## Data Shape

```typescript
{
  total: number;     // Target / goal value
  achieved: number;  // Current achievement — can exceed total
}
```

### How It Calculates
```
Progress % = (achieved / total) * 100
Remaining % = 100 - Progress %
```

- If `achieved > total` → bar shows 100% filled (over-achievement handled gracefully)
- If `total = 0` → avoid this; use a safe default
- If data is null/undefined → bar shows 0%

---

## Complete Real Example: Target vs Achievement Dashboard

```json
{
  "name": "targetVsAchivement",
  "type": "ProgressBar",
  "label": "Achievement Progress",
  "variant": "determinate",
  "size": 12,
  "bottomLabel_1": "Achieved",
  "bottomLabel_2": "Target",
  "bottomLabel_3": "Remaining",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "(store, dynamicData, userValue, res) => {\n  store.setFormdata((pre) => ({\n    ...pre,\n    targetVsAchivement: { \n      total: 81000,\n      achieved: 115000\n    }\n  }));\n}",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

Result: 100% filled bar (115,000 achieved vs 81,000 target — exceeded by 34,000 points)

---

## Sales Target Example (API-driven)

```json
{
  "name": "monthlySalesTarget",
  "type": "ProgressBar",
  "label": "Monthly Sales Target",
  "variant": "determinate",
  "size": 12,
  "bottomLabel_1": "Achieved",
  "bottomLabel_2": "Target",
  "bottomLabel_3": "Remaining to Target",
  "events": [
    {
      "path": "/api/sales/monthlyProgress",
      "method": "get",
      "Handler": "api",
      "eventType": "onLoad",
      "events": [
        {
          "Handler": "custom",
          "eventCode": "async (store, dynamicData, userValue, res) => {\n  store.setFormdata((prev) => ({\n    ...prev,\n    monthlySalesTarget: {\n      total: res.data.targetAmount,\n      achieved: res.data.salesAchieved\n    }\n  }));\n}",
          "eventType": "Success"
        }
      ]
    }
  ],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Dynamic Update on Button Click

```json
{
  "name": "updateProgress",
  "type": "Button",
  "label": "Refresh Progress",
  "events": [
    {
      "path": "/api/target/current",
      "method": "get",
      "Handler": "api",
      "eventType": "onClick",
      "events": [
        {
          "Handler": "custom",
          "eventCode": "async (store, dynamicData, userValue, res) => {\n  store.setFormdata((prev) => ({\n    ...prev,\n    targetVsAchivement: {\n      total: res.data.target,\n      achieved: res.data.current\n    }\n  }));\n}",
          "eventType": "Success"
        }
      ]
    }
  ]
}
```

## Calculate from Other Form Fields

```javascript
async (store) => {
  const targetAmount = store.ctx.core.data.goalAmount;
  const achieved = store.ctx.core.data.currentAmount;
  
  store.setFormdata((prev) => ({
    ...prev,
    progress: { total: targetAmount, achieved: achieved }
  }));
}
```

---

## Common Use Cases

| Scenario | total | achieved | Result |
|---|---|---|---|
| 75% progress | 100000 | 75000 | 75% bar |
| Exceeded target | 50000 | 65000 | 100% (130%) |
| 85% KPI | 1000 | 850 | 85% bar |
| 84% loan portfolio | 5000000 | 4200000 | 84% bar |

---

## Layout Options

### Full Width (recommended for ProgressBar)
```json
"layout": {"lg": 12, "md": 12, "sm": 12, "xs": 12}
```

### Half Width
```json
"layout": {"lg": 6, "md": 6, "sm": 12, "xs": 12}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Not setting data in formdata — the widget reads `{ total, achieved }` from formdata, it does not auto-fetch. Always set it in an `onLoad` event.

**Mistake 2:** Setting `total: 0` — causes division by zero. Always ensure total > 0.

**Mistake 3:** Wrong `type` name — must be exactly `"ProgressBar"` (capital P and B, no trailing underscore or space).

**Mistake 4:** Putting the data payload directly in config instead of formdata — ProgressBar reads `{total, achieved}` from `store.ctx.core.data.<fieldName>`, not from config properties.

---

## Testing Checklist

- [ ] ProgressBar displays with correct percentage
- [ ] Achieved value renders correctly
- [ ] Remaining percentage calculates correctly
- [ ] Over-achievement (>100%) handled gracefully
- [ ] Data updates dynamically when refreshed
- [ ] heading and bottomLabel_3 show correctly
- [ ] Responsive on all screen sizes
- [ ] Colors are visually clear

---

## Reference

**Based on:** page_userPointDashboard  
**Widget:** ProgressBar  
**Version:** 1.0  
**Status:** Production Ready
