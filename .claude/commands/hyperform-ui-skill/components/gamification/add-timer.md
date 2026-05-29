---
name: add-timer
description: Add Timer (countdown) components to Hyperform pages. Use this skill whenever you need a live countdown showing days, hours, minutes, and seconds remaining — contest deadlines, campaign end dates, limited-time offers, or event countdowns. Covers config type "Timer", uiSchema widget "Timer", data shape {startDate, endDate} in ISO 8601 format, and onLoad event patterns for static and dynamic date loading.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Timer Component

**Pattern Reference:** page_ContestDashboard1  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## How to Add Timer to Your Page

Timer Component displays a live countdown showing days, hours, minutes, and seconds remaining. Perfect for:
- Contest/competition countdowns
- Campaign end date timers
- Deadline countdowns
- Limited-time offer displays
- Seasonal promotion timers
- Sales competition end times

---

## Step 1: Add to config.elements

```json
{
  "name": "timer",
  "type": "Timer",
  "label": "Contest Ends In",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "lg", "value": "6"}
  ]
}
```

---


> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Format | Example |
|---|---|---|---|
| `name` | Unique field name | string | `"timer"` |
| `type` | Must be `"Timer"` | string | `"Timer"` |
| `label` | Display label above the countdown | string | `"Contest Ends In"` |
| `layout` | Responsive grid sizing | array | see layout section |
| `events` | `onLoad` to set `{startDate, endDate}` in formdata | array | always required |

**Data keys set via onLoad event (in formdata):**

| Key | Format | Example |
|---|---|---|
| `startDate` | ISO 8601 with timezone | `"2026-01-04T13:15:03-08:00"` |
| `endDate` | ISO 8601 with timezone | `"2027-01-04T13:15:03-08:00"` |

---

## Data Shape

```json
{
  "timer": {
    "startDate": "2026-01-04T13:15:03-08:00",
    "endDate": "2027-01-04T13:15:03-08:00"
  }
}
```

Timer runs client-side — it only needs the dates on load, then counts down independently.

---

## Complete Example: Contest Countdown

```json
{
  "name": "timer",
  "type": "Timer",
  "label": "Contest Ends In",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "async (store, dynamicData, userValue) => {\n  const now = new Date();\n  const endDate = new Date();\n  endDate.setMonth(endDate.getMonth() + 1);\n  store.setFormdata((prev) => ({\n    ...prev,\n    timer: {\n      startDate: now.toISOString(),\n      endDate: endDate.toISOString()\n    }\n  }));\n}",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "lg", "value": "6"}
  ]
}
```

---

## Event Patterns

### Set fixed end date

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  store.setFormdata((prev) => ({\n    ...prev,\n    timer: {\n      startDate: '2026-06-01T00:00:00+05:30',\n      endDate: '2026-06-30T23:59:59+05:30'\n    }\n  }));\n}",
  "eventType": "onLoad"
}
```

### Fetch from API

```json
{
  "Handler": "api",
  "path": "/api/contest/timer",
  "method": "get",
  "eventType": "onLoad"
}
```

---

## Common Date Patterns

```javascript
// 30 days from now
const endDate = new Date();
endDate.setDate(endDate.getDate() + 30);

// End of current month
const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

// Specific date
const specificDate = new Date('2026-06-30T23:59:59+05:30').toISOString();
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong `type` name — must be `"Timer"`, not `"Countdown"` or `"timer"`.

**Mistake 2:** Providing dates without timezone — always use ISO 8601 with timezone offset (e.g., `+05:30` for IST, `-08:00` for PST) to avoid countdown mismatches across time zones.

**Mistake 3:** Setting `endDate` in the past — Timer will show expired state. Always verify dates are in the future.

---

## Testing Checklist

- [ ] Timer displays correctly with days/hours/minutes/seconds
- [ ] Countdown updates every second
- [ ] Label displays correctly
- [ ] Time calculation is accurate for the given timezone
- [ ] Timer handles expired dates gracefully
- [ ] Responsive on all screen sizes
- [ ] API data loads correctly

---

## Reference

**Based on:** page_ContestDashboard1  
**Widget:** Timer  
**Version:** 1.0  
**Status:** Production Ready
