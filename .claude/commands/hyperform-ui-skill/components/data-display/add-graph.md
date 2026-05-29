---
name: add-graph
description: Add Graph (chart) components to Hyperform pages. Use this skill whenever you need data visualization — BarGraph, LineGraph, PieGraph, StackBarGraph, HorizontalStackBarGraph, or HorizontalBarGraph. Covers graphType, heading, axis labels, height, leftMargin, legendHide, xAxisValue/yAxisValue, pieArcColors for multi-series, and onLoad API event pattern.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Graph Component

**Version:** 2.0
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## Graph Types

| graphType | Use case | Data shape |
|---|---|---|
| `BarGraph` | Single-series bar chart (categories vs values) | `[{"label": "...", "value": 123}]` |
| `LineGraph` | Trend over time | `[{"xKey": "...", "yKey": 123}]` |
| `PieGraph` | Distribution / composition | `[{"label": "...", "value": 45}]` |
| `StackBarGraph` | Multi-series stacked bars | `[{"label": "...", "Series1": 10, "Series2": 20}]` |
| `HorizontalStackBarGraph` | Multi-series horizontal stacked | same as StackBarGraph |
| `HorizontalBarGraph` | Grouped horizontal bars (e.g. target vs actual) | `[{"label": "...", "Series1": 10, "Series2": 20}]` |

---

## Config Structure

```
{
  name:          unique field name (camelCase)
  type:          "Graph"                    ← capital G
  label:         display name (optional)
  graphType:     one of the 6 types above
  heading:       chart title shown in UI
  leftLabel:     Y-axis label
  bottomLabel:   X-axis label
  height:        chart height in px as string  ← "400" recommended
  leftMargin:    left margin for Y-axis label  ← "120" recommended
  legendHide:    "YES" | "NO"              ← case-sensitive: "YES" hides, "NO" shows
  xAxisValue:    data key mapped to X axis    ← for BarGraph/LineGraph
  yAxisValue:    data key mapped to Y axis    ← for BarGraph/LineGraph
  pieArcColors:  [] for single-series, [{key, value}] for multi-series
  layout:        responsive grid sizing
  events:        [ onLoad API event ]
}
```

---

## Step 1: BarGraph (single-series)

```json
{
  "name": "myBarChart",
  "type": "Graph",
  "label": "My Bar Chart",
  "graphType": "BarGraph",
  "heading": "Sales by Region",
  "leftLabel": "Sales Amount",
  "bottomLabel": "Region",
  "height": "400",
  "leftMargin": "120",
  "legendHide": "NO",
  "xAxisValue": "label",
  "yAxisValue": "value",
  "pieArcColors": [],
  "events": [
    {
      "body": [
        {"key": "reportName",    "value": "<your-report-name>"},
        {"key": "messageType",   "value": "generateReport"},
        {"key": "reportType",    "value": "dashboard"},
        {"key": "componentType", "value": "graph"},
        {"key": "artifactId",    "value": "<your-artifact-id>"}
      ],
      "path": "/HyperformMessage/process",
      "events": [],
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
  ]
}
```

**`xAxisValue` and `yAxisValue`** must match the key names in your API response data.  
If your data is `[{"Status": "Pending", "Count": 5}]` then use `"xAxisValue": "Status"`, `"yAxisValue": "Count"`.

---

## Step 2: PieGraph (POST with body)

Use when your API requires a POST request with a body.

```json
{
  "name": "myPieChart",
  "type": "Graph",
  "label": "Policy Distribution",
  "graphType": "PieGraph",
  "heading": "Policy Type Distribution",
  "leftLabel": "",
  "bottomLabel": "",
  "height": "400",
  "leftMargin": "120",
  "legendHide": "NO",
  "xAxisValue": "label",
  "yAxisValue": "value",
  "pieArcColors": [],
  "events": [
    {
      "body": [
        {"key": "reportName",    "value": "<your-report-name>"},
        {"key": "messageType",   "value": "generateReport"},
        {"key": "reportType",    "value": "dashboard"},
        {"key": "componentType", "value": "graph"},
        {"key": "artifactId",    "value": "<your-artifact-id>"}
      ],
      "path": "/HyperformMessage/process",
      "events": [],
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
  ]
}
```

---

## Step 2b: PieGraph (GET request — no body)

Use when your API is a simple GET endpoint (no body required). Omit `body`, set `method: "get"`, and include `elements: []`.

```json
{
  "name": "myPieChart",
  "type": "Graph",
  "label": "Distribution",
  "graphType": "PieGraph",
  "heading": "My Distribution Chart",
  "elements": [],
  "events": [
    {
      "path": "https://your-api-endpoint.com/data",
      "events": [],
      "method": "get",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Notes for GET-based graphs:**
- No `body` array needed — omit it entirely
- `elements: []` is included (empty array)
- `height`, `leftMargin`, `legendHide`, `xAxisValue`, `yAxisValue` can be omitted if the chart renders correctly without them
- The API must return data in the expected PieGraph shape: `[{"label": "...", "value": 45}]`

---

## Step 3: StackBarGraph / HorizontalBarGraph (multi-series)

Multi-series graphs need `pieArcColors` — one entry per series. The `key` must exactly match the series key in your API response data.

```json
{
  "name": "myStackChart",
  "type": "Graph",
  "label": "Monthly Breakdown",
  "graphType": "StackBarGraph",
  "heading": "Monthly Sales Breakdown",
  "leftLabel": "Number of Sales",
  "bottomLabel": "Month",
  "height": "400",
  "leftMargin": "120",
  "legendHide": "NO",
  "bottomAxisAngle": "NO",
  "legendDirection": "Row",
  "pieArcColors": [
    {"key": "SeriesOne",   "value": "#1F6F78"},
    {"key": "SeriesTwo",   "value": "#2C9C9C"},
    {"key": "SeriesThree", "value": "#6FB7B7"}
  ],
  "events": [
    {
      "body": [
        {"key": "reportName",    "value": "<your-report-name>"},
        {"key": "messageType",   "value": "generateReport"},
        {"key": "reportType",    "value": "dashboard"},
        {"key": "componentType", "value": "graph"},
        {"key": "artifactId",    "value": "<your-artifact-id>"}
      ],
      "path": "/HyperformMessage/process",
      "events": [],
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
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

**Replace `SeriesOne`, `SeriesTwo`, `SeriesThree`** with the exact key names your API returns.  
Example: if your data is `[{"Month": "Jan", "Approved": 10, "Pending": 5}]` then use `"key": "Approved"` and `"key": "Pending"`.

---

## Field Reference

| Field | Required | Purpose | Notes |
|---|---|---|---|
| `name` | YES | Unique field name | camelCase |
| `type` | YES | Always `"Graph"` (capital G) | |
| `graphType` | YES | Chart type | one of 6 values |
| `heading` | YES | Title shown on chart | |
| `leftLabel` | YES | Y-axis label | empty string `""` for PieGraph |
| `bottomLabel` | YES | X-axis label | empty string `""` for PieGraph |
| `height` | YES | Chart height in px (string) | `"400"` is standard |
| `leftMargin` | YES | Space for Y-axis label | `"120"` is standard |
| `legendHide` | YES | `"NO"` = show legend, `"YES"` = hide | case-sensitive: ONLY `"YES"` hides; `"NO"`, `"No"`, `"no"` all show |
| `xAxisValue` | For Bar/Line/Pie | Data key for X axis | must match API response key |
| `yAxisValue` | For Bar/Line | Data key for Y axis | must match API response key |
| `pieArcColors` | YES | `[]` for single-series; `[{key,value}]` for multi | key must match data key |
| `bottomAxisAngle` | Multi-series only | `"NO"` = straight, `"YES"` = angled labels | case-sensitive: only `"YES"` angles |
| `legendDirection` | Multi-series only | `"Row"` = horizontal, anything else = vertical | |
| `layout` | YES | Responsive grid sizing | |
| `elements` | NO | Include as `[]` when using GET-based events | `[]` or omit |
| `events` | YES | `[]` static or onLoad API | |

---

## Expected API Response Data Shapes

### BarGraph / LineGraph
```json
[
  {"label": "Category A", "value": 1200},
  {"label": "Category B", "value": 950},
  {"label": "Category C", "value": 1450}
]
```
`xAxisValue` = `"label"`, `yAxisValue` = `"value"` (or whatever keys your API uses)

### PieGraph
```json
[
  {"label": "Type A", "value": 45},
  {"label": "Type B", "value": 35},
  {"label": "Type C", "value": 20}
]
```

### StackBarGraph / HorizontalBarGraph (multi-series)
```json
[
  {"label": "Jan", "SeriesOne": 180, "SeriesTwo": 120},
  {"label": "Feb", "SeriesOne": 200, "SeriesTwo": 140},
  {"label": "Mar", "SeriesOne": 170, "SeriesTwo": 110}
]
```
Series key names in data must **exactly match** the `key` values in `pieArcColors`.

---

## onLoad Event — Body Keys Reference

| Key | When to include | Value |
|---|---|---|
| `reportName` | Always | Your backend report identifier |
| `messageType` | When using `/HyperformMessage/process` | Varies by backend rule — e.g. `"generateReport"`, `"insuranceGraphRule"`. Use what your backend expects. |
| `reportType` | When backend needs component category | `"dashboard"` or omit |
| `componentType` | When backend needs component type | `"graph"` or omit |
| `artifactId` | When using rule-engine backend | Your artifact ID |
| `fromDate` | Only if page has date filters | `"$fromDate"` |
| `endDate` | Only if page has date filters | `"$endDate"` |
| `userName` | Only if backend needs current user | `"$userValue.username"` |

Only include keys your backend API actually uses.

---

## Layout Options

```json
"layout": [{"key": "lg", "value": "6"},  {"key": "md", "value": "12"}, {"key": "sm", "value": "12"}, {"key": "xs", "value": "12"}]
```
Half-width (side-by-side charts): `lg: 6`
Full-width (single chart): `lg: 12`

---

## Common Mistakes

**Mistake 1:** `type: "graph"` (lowercase) — must be `"Graph"` (capital G).

**Mistake 2:** `xAxisValue` / `yAxisValue` don't match API response keys — the chart renders empty. Check exact key names in the API response.

**Mistake 3:** For multi-series, `pieArcColors[].key` doesn't match the series key name in API data — the series is invisible.

**Mistake 4:** Missing `height` — chart renders very small. Always set `"height": "400"`.

**Mistake 5:** Missing `leftMargin` — Y-axis label overlaps the chart. Always set `"leftMargin": "120"`.

**Mistake 6:** `bottomAxisAngle`/`legendHide` case mismatch — these use `"YES"`/`"NO"` (all caps). The comparison is case-sensitive: `"Yes"` does NOT work, only `"YES"` triggers the feature. `legendDirection` uses `"Row"` (capital R) for horizontal, anything else for vertical.

**Mistake 7:** Forgetting `"events": []` nested inside the onLoad event object.

**Mistake 8:** Adding a `body` array to a GET request — GET events have no body. Use `method: "get"` and omit `body` entirely.

**Mistake 9:** Assuming `messageType` is always `"generateReport"` — it depends entirely on your backend handler. Use whatever value your backend rule expects.

---

## Testing Checklist

- [ ] Chart renders with the correct `graphType`
- [ ] Data loads from API
- [ ] `xAxisValue` and `yAxisValue` match the API response keys
- [ ] For multi-series: series names in `pieArcColors` match data keys exactly
- [ ] Axis labels (`leftLabel`, `bottomLabel`) display correctly
- [ ] Chart height (`height: "400"`) is sufficient — not too small
- [ ] Legend shows when `legendHide: "No"`
- [ ] Responsive at all screen sizes
