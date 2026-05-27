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

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/leaderboard",
  "config": {
    "main": {
      "nameKey": "emp_name",
      "imageKey": "empImage",
      "scoreKey": "incentive",
      "firstImage": "https://media.istockphoto.com/id/1497142422/photo/close-up-photo-portrait-of-young-successful-entrepreneur-businessman-investor-wearing-glasses.jpg",
      "secondImage": "https://img.freepik.com/free-photo/portrait-businesswoman-window-1_1262-1490.jpg",
      "thirdImage": "https://img.freepik.com/premium-photo/indian-businessman-writing-document-while-sitting-desk-work-station_466689-45756.jpg"
    },
    "layout": {
      "lg": 12,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "LeaderBoard"
  },
  "elements": [
    {"header": "Rank", "accessorKey": "rank"},
    {"header": "Employee Code", "accessorKey": "emp_code"},
    {"header": "Emp Name", "accessorKey": "emp_name"},
    {"header": "Incentive", "accessorKey": "incentive"}
  ]
}
```

---

## Step 3: schema.properties

LeaderBoard doesn't need a schema entry — it renders array data returned by the API directly.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "LeaderBoard" | "LeaderBoard" |
| widget (uiSchema) | Must be "LeaderBoard" | "LeaderBoard" |
| nameKey | Data field for participant name | "emp_name" |
| imageKey | Data field for profile image URL | "empImage" |
| scoreKey | Data field for ranking score | "incentive" |
| firstImage | Image/medal URL for 1st place | gold medal URL |
| secondImage | Image/medal URL for 2nd place | silver medal URL |
| thirdImage | Image/medal URL for 3rd place | bronze medal URL |
| elements (config) | Column definitions with name + label | array of column objects |
| elements (uiSchema) | Column definitions with header + accessorKey | array of column objects |

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

### config.elements

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
  "thirdImage": "https://img.freepik.com/premium-photo/indian-businessman-writing-document-while-sitting-desk-work-station_466689-45756.jpg"
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/leaderboard",
  "config": {
    "main": {
      "nameKey": "emp_name",
      "imageKey": "empImage",
      "scoreKey": "incentive",
      "firstImage": "https://media.istockphoto.com/id/1497142422/photo/close-up-photo-portrait-of-young-successful-entrepreneur-businessman-investor-wearing-glasses.jpg",
      "secondImage": "https://img.freepik.com/free-photo/portrait-businesswoman-window-1_1262-1490.jpg",
      "thirdImage": "https://img.freepik.com/premium-photo/indian-businessman-writing-document-while-sitting-desk-work-station_466689-45756.jpg"
    },
    "layout": {
      "lg": 12,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "LeaderBoard"
  },
  "elements": [
    {"header": "Rank", "accessorKey": "rank"},
    {"header": "Employee Code", "accessorKey": "emp_code"},
    {"header": "Emp Name", "accessorKey": "emp_name"},
    {"header": "Incentive", "accessorKey": "incentive"}
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

**Mistake 1:** Wrong widget name
```json
// WRONG
"widget": "Leaderboard"

// CORRECT
"widget": "LeaderBoard"
```

**Mistake 2:** Mismatched keys — `nameKey`, `imageKey`, `scoreKey` in config must exactly match the field names in the API response data, and they must also be repeated in uiSchema `config.main`.

**Mistake 3:** Missing `elements` in uiSchema — unlike other components, LeaderBoard requires an `elements` array at the uiSchema level (not nested in config) to define the column headers and `accessorKey` mappings.

**Mistake 4:** Setting `nameKey`/`imageKey`/`scoreKey` only in config but not in uiSchema `config.main` — both must have these keys for the component to render correctly.

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
