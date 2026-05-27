---
name: add-graph
description: Add Graph (chart) components to Hyperform pages. Use this skill whenever you need data visualization — BarGraph, LineGraph, PieGraph, StackBarGraph, HorizontalStackBarGraph, or HorizontalBarGraph for dashboards, sales reports, trend analysis, KPI displays, or multi-series comparisons. Covers graphType, heading, axis labels, pieArcColors vs colorMap (multi-series), data format per graph type, uiSchema widget config, and layout sizing.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Graph Component

**Pattern Reference:** page_insuranceDashboard, page_managerContestDashboard, page_ContestDashboard  
**Version:** 2.0  
**Status:** Production Ready

---

## How to Add Graph Components to Your Page

Graph components display data visualizations including:
- **Single-Series Graphs:** BarGraph, LineGraph, PieGraph
- **Multi-Series Graphs:** StackBarGraph, HorizontalStackBarGraph, HorizontalBarGraph

---

## Graph Types Quick Reference

| Use Case | graphType | Data Format |
|---|---|---|
| Single bar chart | BarGraph | `[{label, value}]` |
| Trend over time | LineGraph | `[{xKey, yKey}]` |
| Distribution/composition | PieGraph | `[{label, value}]` |
| Monthly breakdown by product | StackBarGraph | `[{label, Series1, Series2, ...}]` |
| Quarterly breakdown (horizontal) | HorizontalStackBarGraph | `[{label, Series1, Series2, ...}]` |
| Planned vs Actual / Target vs Achievement | HorizontalBarGraph | `[{label, Series1, Series2}]` |

---

## Step 1: Add to config.elements

### BarGraph (Single-Series)

```json
{
  "name": "salesByRegion",
  "type": "Graph",
  "label": "Sales by Region",
  "events": [
    {
      "body": [
        {"key": "reportName", "value": "salesByRegion"},
        {"key": "messageType", "value": "generateReport"}
      ],
      "path": "/HyperformMessage/process",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ],
  "heading": "Sales Breakdown",
  "graphType": "BarGraph",
  "leftLabel": "Sales Amount",
  "bottomLabel": "Regions",
  "pieArcColors": []
}
```

### StackBarGraph (Multi-Series)

```json
{
  "name": "monthlySalesByProduct",
  "type": "Graph",
  "label": "Monthly Sales Breakdown",
  "events": [],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"}
  ],
  "heading": "Monthly Sales Breakdown by Product",
  "graphType": "StackBarGraph",
  "leftLabel": "Number of Policies Sold",
  "bottomLabel": "Month(2024)",
  "pieArcColors": [
    {"key": "Health Insurance", "value": "#1F6F78"},
    {"key": "Life Insurance", "value": "#2C9C9C"},
    {"key": "Auto Insurance", "value": "#6FB7B7"}
  ],
  "bottomAxisAngle": "No",
  "legendDirection": "Row"
}
```

### HorizontalBarGraph (Multi-Series, grouped)

```json
{
  "name": "targetVsActual",
  "type": "Graph",
  "graphType": "HorizontalBarGraph",
  "heading": "Planned vs Actual Sales by Quarter",
  "leftLabel": "Quarters",
  "bottomLabel": "Sales Volume",
  "events": [],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"}
  ],
  "pieArcColors": [
    {"key": "Planned Sales", "value": "#6FB7B7"},
    {"key": "Actual Sales", "value": "#1F6F78"}
  ]
}
```

### PieGraph

```json
{
  "name": "policyDistribution",
  "type": "Graph",
  "label": "Policy Distribution",
  "events": [],
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "12"}
  ],
  "heading": "Policy Types Distribution",
  "graphType": "PieGraph",
  "xAxisValue": "label",
  "yAxisValue": "value",
  "pieArcColors": []
}
```

---

## Step 2: Add to uiSchema.elements

### BarGraph / LineGraph

```json
{
  "type": "Control",
  "scope": "#/properties/salesByRegion",
  "config": {
    "main": {
      "type": "BarGraph",
      "header": "Sales Breakdown",
      "leftLabel": "Sales Amount",
      "bottomLabel": "Regions"
    },
    "style": {
      "barStyle": {},
      "labelStyle": {
        "margin": {"left": "85"}
      },
      "containerStyle": {}
    },
    "layout": {
      "lg": 6,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "Graph"
  }
}
```

### StackBarGraph / HorizontalStackBarGraph / HorizontalBarGraph (Multi-Series)

```json
{
  "type": "Control",
  "scope": "#/properties/monthlySalesByProduct",
  "config": {
    "main": {
      "type": "StackBarGraph",
      "header": "Monthly Sales Breakdown by Product",
      "leftLabel": "Number of Policies Sold",
      "bottomLabel": "Month(2024)",
      "bottomAxisAngle": false,
      "legendDirection": "row"
    },
    "style": {
      "colorMap": {
        "Health Insurance": "#1F6F78",
        "Life Insurance": "#2C9C9C",
        "Auto Insurance": "#6FB7B7"
      },
      "labelStyle": {
        "margin": {}
      },
      "containerStyle": {}
    },
    "layout": {
      "lg": 12,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "Graph"
  }
}
```

### PieGraph

```json
{
  "type": "Control",
  "scope": "#/properties/policyDistribution",
  "config": {
    "main": {
      "type": "PieGraph",
      "header": "Policy Types Distribution",
      "xAxisValue": "label"
    },
    "style": {
      "pieStyle": {},
      "labelStyle": {
        "margin": {}
      },
      "containerStyle": {}
    },
    "layout": {
      "lg": 6,
      "md": 12,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "Graph"
  }
}
```

---

## Step 3: Data Formats

### BarGraph / LineGraph

```json
[
  {"label": "North", "value": 45000},
  {"label": "South", "value": 38000},
  {"label": "East",  "value": 52000}
]
```

### StackBarGraph / HorizontalStackBarGraph / HorizontalBarGraph (multi-series)

```json
[
  {"label": "January", "Health Insurance": 180, "Life Insurance": 150, "Auto Insurance": 120},
  {"label": "February","Health Insurance": 200, "Life Insurance": 170, "Auto Insurance": 130},
  {"label": "March",   "Health Insurance": 220, "Life Insurance": 180, "Auto Insurance": 140}
]
```

Each object has a `"label"` key plus one key per series — the series key names must exactly match the `colorMap` keys in uiSchema style and `pieArcColors` keys in config.

### PieGraph

```json
[
  {"label": "Health Insurance", "value": 45},
  {"label": "Life Insurance",   "value": 35},
  {"label": "Auto Insurance",   "value": 20}
]
```

---

## Key Configuration Points

| Property | Where | Purpose | Example |
|---|---|---|---|
| graphType (config) | config | Must match one of 6 types | "StackBarGraph" |
| type (uiSchema main) | uiSchema | Must match graphType | "StackBarGraph" |
| heading / header | config = heading, uiSchema = header | Graph title | "Monthly Sales" |
| leftLabel | config + uiSchema main | Y-axis label | "Amount (₹)" |
| bottomLabel | config + uiSchema main | X-axis label | "Regions" |
| pieArcColors | config | Series colors (array format) | `[{"key": "Health", "value": "#1F6F78"}]` |
| colorMap | uiSchema style | Series colors for multi-series (object format) | `{"Health": "#1F6F78"}` |
| xAxisValue / yAxisValue | config + uiSchema main | Key mapping for Line/Pie | "Month", "Revenue" |
| bottomAxisAngle | config = "No"/"Yes" string, uiSchema = boolean | Rotate X-axis labels | false |
| legendDirection | config = "Row"/"Column", uiSchema = "row"/"column" | Legend layout | "row" |

---

## pieArcColors vs colorMap

**Single-series graphs (BarGraph, LineGraph, PieGraph):**
- Use `pieArcColors: []` in config (empty array is fine)
- No `colorMap` needed in uiSchema

**Multi-series graphs (StackBarGraph, HorizontalStackBarGraph, HorizontalBarGraph):**
- Use `pieArcColors` array in config: `[{"key": "SeriesName", "value": "#hex"}]`
- Use `colorMap` object in uiSchema style: `{"SeriesName": "#hex"}`
- Series key names in data, `pieArcColors`, and `colorMap` must all match exactly

---

## Step 4: schema.properties

Graphs don't require detailed schema — just empty objects:

```json
{
  "salesByRegion": {},
  "monthlySalesByProduct": {},
  "policyDistribution": {}
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** `heading` vs `header` — config uses `heading`, uiSchema `config.main` uses `header`. Both must be set.

**Mistake 2:** `graphType` in config vs `type` in uiSchema — these are different keys but must hold the same value.

**Mistake 3:** For multi-series graphs, series key names in data must exactly match `colorMap` keys in uiSchema — any mismatch makes series invisible.

**Mistake 4:** `bottomAxisAngle` format differs — config uses string `"No"`/`"Yes"`, uiSchema uses boolean `false`/`true`.

**Mistake 5:** `legendDirection` format differs — config uses `"Row"`/`"Column"` (capitalized), uiSchema uses `"row"`/`"column"` (lowercase).

---

## Testing Checklist

- [ ] Graph renders with correct type
- [ ] Data loads from API or custom event
- [ ] Colors match configuration
- [ ] Axis labels display correctly
- [ ] Legend shows for multi-series graphs
- [ ] Series keys in data match colorMap keys
- [ ] Responsive on all screen sizes
- [ ] Tooltip shows values on hover

---

## Reference

**Based on:** page_insuranceDashboard, page_managerContestDashboard, page_ContestDashboard  
**Widget:** Graph  
**Version:** 2.0 — Added StackBarGraph, HorizontalStackBarGraph, HorizontalBarGraph  
**Status:** Production Ready
