---
name: add-leaderboard
description: Add LeaderBoard components to Hyperform pages. Use this skill whenever you need a ranked list with scores, images, and medals — sales leaderboards, performance rankings, competition results, or any top-N display with gold/silver/bronze distinction. Covers config type "LeaderBoard", nameKey/imageKey/scoreKey, firstImage/secondImage/thirdImage medals, elements columns, uiSchema widget "LeaderBoard", and onLoad API event.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add LeaderBoard Component

**Pattern Reference:** page_employeePerformanceDashboard_backup  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## How to Add LeaderBoard to Your Page

LeaderBoard Component displays a ranked list of participants with scores, images, and medals/badges. Perfect for:
- Sales leaderboards (top performers)
- Performance rankings
- Competition leaderboards
- Team rankings
- Achievement displays
- Employee/agent rankings with incentives
- Contest results
- Gamification displays

---

## Step 1: Add to config.elements

```json
{
  "name": "leaderboard",
  "type": "LeaderBoard",
  "events": [
    {
      "body": [
        {
          "key": "reportName",
          "value": "leaderboard"
        },
        {
          "key": "messageType",
          "value": "generateReport"
        }
      ],
      "path": "/HyperformMessage/process",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "nameKey": "emp_name",
  "imageKey": "empImage",
  "scoreKey": "incentive",
  "elements": [
    {"name": "rank", "label": "Rank", "events": []},
    {"name": "emp_code", "label": "Employee Code", "events": []},
    {"name": "emp_name", "label": "Emp Name", "events": []},
    {"name": "incentive", "label": "Incentive", "events": []}
  ],
  "firstImage": "https://media.istockphoto.com/id/1497142422/photo/close-up-photo-portrait-of-young-successful-entrepreneur-businessman-investor-wearing-glasses.jpg",
  "secondImage": "https://img.freepik.com/free-photo/portrait-businesswoman-window-1_1262-1490.jpg",
  "thirdImage": "https://img.freepik.com/premium-photo/indian-businessman-writing-document-while-sitting-desk-work-station_466689-45756.jpg"
}
```

---


> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field name | `"leaderboard"` |
| `type` | Must be `"LeaderBoard"` | `"LeaderBoard"` |
| `label` | Display label | `"Top Performers"` |
| `nameKey` | Data field for participant name | `"emp_name"` |
| `imageKey` | Data field for profile image URL | `"empImage"` |
| `scoreKey` | Data field for ranking score | `"incentive"` |
| `isScoreAmount` | Format score as currency | `"YES"` / `"NO"` |
| `firstImage` | Image/medal URL for 1st place | gold medal URL |
| `secondImage` | Image/medal URL for 2nd place | silver medal URL |
| `thirdImage` | Image/medal URL for 3rd place | bronze medal URL |
| `elements` | Column definitions: `[{name, label, events?}]` | array of column objects |
| `style` | JSON string for custom styles | `"{}"` |
| `layout` | Responsive grid sizing | see layout section |
| `events` | `onLoad` API or custom event | always required |

---

## Display Features

### Top 3 Medals
The LeaderBoard automatically displays:
- **1st Place:** Custom image/medal (firstImage)
- **2nd Place:** Custom image/medal (secondImage)
- **3rd Place:** Custom image/medal (thirdImage)
- **4+:** Rank number displayed

### Profile Images
- **Rank 1-3:** Custom medal image shows instead of profile photo
- **Rank 4+:** User's profile image (from imageKey field) displays

---

## Data Shape (API Response)

```json
[
  {
    "rank": 1,
    "emp_name": "Alice Johnson",
    "emp_code": "EMP001",
    "empImage": "https://...",
    "incentive": 150000
  },
  {
    "rank": 2,
    "emp_name": "Bob Smith",
    "emp_code": "EMP002",
    "empImage": "https://...",
    "incentive": 125000
  },
  {
    "rank": 3,
    "emp_name": "Carol White",
    "emp_code": "EMP003",
    "empImage": "https://...",
    "incentive": 100000
  }
]
```

---

## Complete Example: Employee Performance LeaderBoard

```json
{
  "name": "leaderboard",
  "type": "LeaderBoard",
  "events": [
    {
      "body": [
        {"key": "reportName", "value": "leaderboard"},
        {"key": "messageType", "value": "generateReport"},
        {"key": "fromDate", "value": "$fromDate"},
        {"key": "endDate", "value": "$endDate"},
        {"key": "userName", "value": "$userValue.username"},
        {"key": "userType", "value": "$userValue.positionType"},
        {"key": "reportType", "value": "dashboard"},
        {"key": "componentType", "value": "leaderboard"}
      ],
      "path": "/HyperformMessage/process",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "nameKey": "emp_name",
  "imageKey": "empImage",
  "scoreKey": "incentive",
  "elements": [
    {"name": "rank", "label": "Rank", "events": []},
    {"name": "emp_code", "label": "Employee Code", "events": []},
    {"name": "emp_name", "label": "Emp Name", "events": []},
    {"name": "incentive", "label": "Incentive", "events": []}
  ],
  "firstImage": "https://media.istockphoto.com/id/1497142422/photo/close-up-photo-portrait-of-young-successful-entrepreneur-businessman-investor-wearing-glasses.jpg",
  "secondImage": "https://img.freepik.com/free-photo/portrait-businesswoman-window-1_1262-1490.jpg",
  "thirdImage": "https://img.freepik.com/premium-photo/indian-businessman-writing-document-while-sitting-desk-work-station_466689-45756.jpg",
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Event Patterns

### Refresh on Button Click

```json
{
  "name": "search",
  "type": "Button",
  "events": [
    {
      "Handler": "refresh",
      "eventType": "onClick",
      "refreshElements": ["leaderboard"]
    }
  ]
}
```

### Custom onLoad

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  const data = await fetchLeaderboard(userValue);\n  store.setFormdata((prev) => ({ ...prev, leaderboard: data }));\n}",
  "eventType": "onLoad"
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong `type` casing — must be `"LeaderBoard"` (capital L and B), not `"Leaderboard"` or `"leaderboard"`.

**Mistake 2:** Mismatched keys — `nameKey`, `imageKey`, `scoreKey` in config must exactly match the field names in the API response data.

**Mistake 3:** Missing `elements` array in config — the LeaderBoard requires `elements` to define which columns to display, each with `name` and `label`.

**Mistake 4:** Forgetting `"events": []` on each element object inside the `elements` array.

---

## Testing Checklist

- [ ] LeaderBoard displays with correct data
- [ ] Top 3 show custom medal images
- [ ] Rank 4+ show rank numbers
- [ ] Profile images load correctly
- [ ] Score/incentive values display
- [ ] Column headers show correctly
- [ ] API data fetches and displays on load
- [ ] Refresh/update works
- [ ] Responsive on all screen sizes

---

## Reference

**Based on:** page_employeePerformanceDashboard_backup  
**Widget:** LeaderBoard  
**Version:** 1.0  
**Status:** Production Ready
