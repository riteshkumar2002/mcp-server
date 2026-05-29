---
name: add-runner-boy-progress-bar
description: Add RunnerBoyProgressBar components to Hyperform pages. Use this skill whenever you need an animated progress bar with a running character — gamified goal tracking, sales target races, contest achievement progress, or any motivational progress display. Covers config type "RunnerBoyProgressBar", uiSchema widget "RunnerBoyProgressBar", data shape {total, achieve} (note: "achieve" not "achieved"), and onLoad event patterns.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add RunnerBoyProgressBar Component

**Pattern Reference:** page_ContestDashboard1  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## How to Add RunnerBoyProgressBar to Your Page

RunnerBoyProgressBar is an animated progress bar featuring a running character. Perfect for:
- Goal achievement tracking with fun visualization
- Sales target progress with animated runner
- Contest race/competition tracking
- Motivational progress indicators
- Employee performance tracking

---

## Step 1: Add to config.elements

```json
{
  "name": "proRunning",
  "type": "RunnerBoyProgressBar",
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

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field name | `"proRunning"` |
| `type` | Must be `"RunnerBoyProgressBar"` | `"RunnerBoyProgressBar"` |
| `layout` | Responsive grid sizing (usually full-width) | lg: 12, xs: 12 |
| `events` | `onLoad` to populate `{total, achieve}` in formdata | always required |

**Data keys set via onLoad event (in formdata):**

| Key | Purpose | Example |
|---|---|---|
| `total` | Target/goal value | `300` |
| `achieve` | Current achievement — **NOT** `"achieved"` | `200` |

**CRITICAL:** The data key is `achieve` — NOT `achieved` (unlike the standard ProgressBar which uses `achieved`).

---

## Data Shape

```json
{
  "proRunning": {
    "total": 300,
    "achieve": 200
  }
}
```

Progress % = (achieve / total) × 100. Runner position updates based on this percentage.

---

## Complete Example: Contest Target Runner

```json
{
  "name": "proRunning",
  "type": "RunnerBoyProgressBar",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "(store) => {\n  store.setFormdata((pre) => ({\n    ...pre,\n    proRunning: { total: 500, achieve: 250 }\n  }));\n}",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ]
}
```

---

## Event Patterns

### Set from custom data

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  const targetAchieved = store.ctx.core.data.totalIncentive || 0;\n  const targetAmount = 100000;\n  store.setFormdata((prev) => ({\n    ...prev,\n    proRunning: {\n      total: targetAmount,\n      achieve: targetAchieved\n    }\n  }));\n}",
  "eventType": "onLoad"
}
```

### Load from API

```json
{
  "body": [
    {"key": "reportName", "value": "salesProgress"},
    {"key": "fromDate", "value": "$fromDate"},
    {"key": "toDate", "value": "$toDate"}
  ],
  "path": "/HyperformMessage/process",
  "method": "post",
  "Handler": "api",
  "eventType": "onLoad"
}
```

---

## Comparison with ProgressBar

| Feature | ProgressBar | RunnerBoyProgressBar |
|---|---|---|
| Visual Style | Static bar | Animated runner character |
| Data key | `achieved` | `achieve` |
| Engagement | Professional metrics | Fun/Gamified |
| Use Case | Standard KPI dashboards | Motivational contest tracking |

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong `type` name — must be `"RunnerBoyProgressBar"`, not `"RunnerProgressBar"` or `"runnerBoyProgressBar"`.

**Mistake 2:** Using `achieved` instead of `achieve` — RunnerBoyProgressBar uses `achieve` (no "d"), unlike the standard ProgressBar which uses `achieved`.

**Mistake 3:** Missing `"events": []` on config element when no events needed.

---

## Testing Checklist

- [ ] RunnerBoyProgressBar displays correctly
- [ ] Runner character animates smoothly
- [ ] Progress percentage calculates correctly (achieve/total × 100)
- [ ] Runner reaches end at 100% progress
- [ ] Handles over-achievement gracefully
- [ ] Layout spans full width
- [ ] Responsive on all screen sizes

---

## Reference

**Based on:** page_ContestDashboard1  
**Widget:** RunnerBoyProgressBar  
**Version:** 1.0  
**Status:** Production Ready
