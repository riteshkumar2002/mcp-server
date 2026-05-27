---
name: add-rank-card
description: Add RankCard components to Hyperform pages. Use this skill whenever you need to display a user's personal rank/position — contest standings, leaderboard position summary, achievement tier, or competitive ranking card. Covers config type "RankCard", rank and height properties, uiSchema widget "RankCard", gold/silver/bronze color coding for top 3, and onLoad patterns to derive rank from leaderboard data.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add RankCard Component

**Pattern Reference:** page_ContestDashboard1  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add RankCard to Your Page

RankCard Component displays a user's current rank/position with visual styling. Perfect for:
- User's personal rank in a contest
- Contest position indicator
- Leaderboard rank summary card
- Achievement tier display
- Performance ranking visualization
- Typically paired with a LeaderBoard component

---

## Step 1: Add to config.elements

```json
{
  "name": "rnk",
  "type": "RankCard",
  "label": "Your Rank",
  "rank": "2",
  "height": "200",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "lg", "value": "4"}
  ]
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/rnk",
  "config": {
    "main": {
      "rank": "2",
      "height": "200px"
    },
    "layout": {
      "lg": 4,
      "md": 4,
      "sm": 4,
      "xs": 12
    }
  },
  "options": {
    "widget": "RankCard"
  }
}
```

---

## Step 3: schema.properties

```json
{
  "rnk": {
    "type": ["string", "number"]
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Type | Example |
|---|---|---|---|
| type (config) | Must be "RankCard" | string | "RankCard" |
| widget (uiSchema) | Must be "RankCard" | string | "RankCard" |
| rank (config) | Static rank value | string | "2" |
| rank (uiSchema main) | Must match config rank | string | "2" |
| height (config) | Card height in px (number as string) | string | "200" |
| height (uiSchema main) | Must include "px" suffix | string | "200px" |
| label | Card title text | string | "Your Rank" |

**Note:** `rank` in config is just the number string (`"2"`), but in uiSchema `config.main` it also stays as `"2"`. `height` in config is `"200"` (no unit), but in uiSchema `config.main` it is `"200px"` (with px).

---

## Rank Color Coding (automatic)

| Rank | Color |
|---|---|
| 1 (1st) | Gold |
| 2 (2nd) | Silver |
| 3 (3rd) | Bronze |
| 4+ | Standard/Neutral |

---

## Complete Example: Contest Rank Display

### config.elements

```json
{
  "name": "rnk",
  "type": "RankCard",
  "label": "Your Rank",
  "rank": "2",
  "height": "200",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "async (store, dynamicData, userValue) => {\n  const userRank = store.ctx.core.data.leaderboard?.find(\n    item => item.empCode === userValue.username\n  )?.rank || 'N/A';\n  store.setFormdata((prev) => ({\n    ...prev,\n    rnk: userRank\n  }));\n}",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "lg", "value": "4"}
  ]
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/rnk",
  "config": {
    "main": {
      "rank": "2",
      "height": "200px"
    },
    "layout": {
      "lg": 4,
      "md": 4,
      "sm": 4,
      "xs": 12
    }
  },
  "options": {
    "widget": "RankCard"
  }
}
```

---

## Event Patterns

### Derive rank from leaderboard in formdata

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  const leaderboardData = store.ctx.core.data.leaderboard || [];\n  const currentUserRank = leaderboardData.find(\n    item => item.empId === userValue.username\n  )?.rank || 'N/A';\n  store.setFormdata((prev) => ({\n    ...prev,\n    rnk: currentUserRank\n  }));\n}",
  "eventType": "onLoad"
}
```

### Fetch from API

```json
{
  "Handler": "api",
  "path": "/api/contest/user-rank",
  "method": "get",
  "eventType": "onLoad"
}
```

---

## Height Reference

```
"200"  → compact card
"200"  → standard card  (recommended default)
"250"  → large card
"300"  → extra large card
```

---

## Pairing with LeaderBoard

RankCard is commonly placed alongside LeaderBoard — RankCard shows the user's personal position, LeaderBoard shows the full ranking:

```json
// config.elements — place both in same page
[
  { "name": "rnk", "type": "RankCard", "rank": "2", "height": "200", ... },
  { "name": "leaderboard", "type": "LeaderBoard", "nameKey": "emp_name", ... }
]
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong widget name
```json
// WRONG
"widget": "RankDisplay"

// CORRECT
"widget": "RankCard"
```

**Mistake 2:** `height` format inconsistency — in config use `"200"` (no units), in uiSchema `config.main` use `"200px"` (with px suffix).

**Mistake 3:** `rank` in config is a static fallback value. To show dynamic rank, update `rnk` in formdata via an `onLoad` event — the formdata value overrides the static config value.

---

## Testing Checklist

- [ ] RankCard displays correct rank number
- [ ] Top 3 colors (gold/silver/bronze) show correctly
- [ ] Card height is as configured
- [ ] Rank updates when formdata changes
- [ ] Responsive on all screen sizes
- [ ] Label displays correctly
- [ ] Works with numeric and text ranks ("Gold", "N/A", etc.)

---

## Reference

**Based on:** page_ContestDashboard1  
**Widget:** RankCard  
**Version:** 1.0  
**Status:** Production Ready
