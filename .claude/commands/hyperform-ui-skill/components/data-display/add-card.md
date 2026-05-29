---
name: add-card
description: Add Card components to Hyperform pages. Use this skill whenever you need KPI metric cards — dashboard stats, performance indicators, summary cards, or quick-stat displays with icon, value, and description. Covers config type "card", label as initial value, description as subtitle, columnFormat, icon URL, responsive layout, and onLoad API event pattern.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Card Component

**Version:** 2.0
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

---

## What is a Card?

A Card displays a single KPI metric — an icon, a large number (the value), and a subtitle (description). The value starts as a placeholder and is replaced by API data on load.

**Use when you need:**
- Dashboard KPI numbers (totals, counts, amounts)
- Performance metrics (achievement %, target vs actual)
- Summary stats (agents, invoices, disbursements)
- Any single numeric value with a label

---

## Config Structure

```
{
  name:         unique field name (string, camelCase)
  type:         "card"                          ← always lowercase
  label:        initial placeholder value       ← shown before API loads ("0", "0.0", "-")
  url:          SVG icon URL                    ← shown top-right of card (optional)
  description:  subtitle below the value        ← explains what the number represents (optional)
  style:        ""                              ← always empty string, include when present in page
  columnFormat: "amount" | omit                 ← "amount" adds currency formatting
  layout:       responsive grid sizing
  events:       [ onLoad API event ]
}
```

---

## Step 1: Minimal Card (static value, no API)

Use this when the value is static or will be set by a parent event.

```json
{
  "name": "totalAgents",
  "type": "card",
  "label": "0",
  "url": "https://www.svgrepo.com/show/507884/users.svg",
  "description": "Total Active Agents",
  "events": [],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "6"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Step 2: Card with onLoad API event

Use this when the card loads its value from the backend on page load.

```json
{
  "name": "totalPayout",
  "type": "card",
  "label": "0.0",
  "url": "https://www.svgrepo.com/show/502817/rupee-coin.svg",
  "description": "Total Payout [in Lakhs]",
  "columnFormat": "amount",
  "events": [
    {
      "body": [
        {"key": "reportName",    "value": "<your-report-name>"},
        {"key": "fromDate",      "value": "$fromDate"},
        {"key": "endDate",       "value": "$endDate"},
        {"key": "messageType",   "value": "generateReport"},
        {"key": "reportType",    "value": "dashboard"},
        {"key": "componentType", "value": "card"},
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
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "6"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Replace:**
- `<your-report-name>` → the report identifier expected by your backend rule
- `<your-artifact-id>` → your backend artifact/rule ID
- Add or remove body keys to match what your backend API expects
- `$fromDate` / `$endDate` → only include if your page has date filter fields; remove if not needed

---

## Step 3: Card with apiBody (dynamic body computation)

Use `apiBody` when the request body needs values computed at runtime — reading from `store.formData`, `localStorage`, or `userValue` — beyond what static `$variable` references can do.

`apiBody` is a **JavaScript function string** with the signature:
```
(store, dynamicData, userValue, body, sec) => { return modifiedBody; }
```

| Parameter | What it contains |
|---|---|
| `store` | Access `store.formData` to read current form field values |
| `userValue` | Current logged-in user object (`userValue.username`, `userValue.positionName`, etc.) |
| `body` | The static body array already resolved (spread it to keep all existing keys) |
| `dynamicData` | Additional dynamic data passed by the framework |
| `sec` | Security/session context |

### Example: read programId from formData, fall back to localStorage

```json
{
  "name": "myCard",
  "type": "card",
  "label": "0.0",
  "style": "",
  "url": "https://www.svgrepo.com/show/502817/rupee-coin.svg",
  "description": "Total Amount",
  "events": [
    {
      "body": [
        {"key": "reportName", "value": "myReport"},
        {"key": "messageType", "value": "<your-message-type>"},
        {"key": "fromDate",    "value": "$fromDate"},
        {"key": "endDate",     "value": "$endDate"},
        {"key": "userName",    "value": "$userValue.username"}
      ],
      "path": "/HyperformMessage/process",
      "events": [],
      "method": "post",
      "Handler": "api",
      "apiBody": "(store, dynamicData, userValue, body, sec) => { const fallback = localStorage.getItem('<your-localStorage-key>'); const myField = store.formData.myField ? store.formData.myField : fallback; return { ...body, myField: myField }; }",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "6"},
    {"key": "sm", "value": "6"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Replace:**
- `<your-message-type>` → your backend message type identifier
- `<your-localStorage-key>` → the localStorage key that holds the fallback value
- `myField` → the field name in `store.formData` and what the backend expects in the body

### When to use apiBody vs static body

| Scenario | Use |
|---|---|
| Value always comes from a dropdown / filter on the page | `apiBody` reading `store.formData.fieldName` |
| Value has a localStorage fallback | `apiBody` with `localStorage.getItem(...)` |
| All values are static or simple `$variable` references | Static `body` array only — no `apiBody` needed |

---

## Field Reference

| Field | Required | Purpose | Example values |
|---|---|---|---|
| `name` | YES | Unique field name — used as the data key | `"totalPayout"`, `"agentCount"` |
| `type` | YES | Always lowercase `"card"` | `"card"` |
| `label` | YES | Placeholder shown before API loads (the big number area) | `"0"`, `"0.0"`, `"-"` |
| `url` | NO | SVG icon URL shown in top-right corner | any SVG URL |
| `style` | NO | Always set to empty string `""` when present | `""` |
| `description` | NO | Subtitle below the value | `"Total Payout [in Lakhs]"` |
| `columnFormat` | NO | `"amount"` formats value with currency symbol | `"amount"` or omit |
| `layout` | YES | Responsive 12-column grid sizing | see layout options below |
| `events` | YES | Use `[]` for static, or add `onLoad` API event | |
| `apiBody` (on event) | NO | JS function string to compute body dynamically at runtime | see Step 3 |

---

## Layout Options

### 4 cards per row (lg desktop)
```json
"layout": [
  {"key": "lg", "value": "3"},
  {"key": "md", "value": "4"},
  {"key": "sm", "value": "6"},
  {"key": "xs", "value": "12"}
]
```

### 3 cards per row (lg desktop)
```json
"layout": [
  {"key": "lg", "value": "4"},
  {"key": "md", "value": "4"},
  {"key": "sm", "value": "6"},
  {"key": "xs", "value": "12"}
]
```

### 2 cards per row (lg desktop)
```json
"layout": [
  {"key": "lg", "value": "6"},
  {"key": "md", "value": "6"},
  {"key": "sm", "value": "12"},
  {"key": "xs", "value": "12"}
]
```

---

## Complete Example: 3-Card KPI Row

This shows how to build a row of 3 cards — adapt the names, descriptions, and API body to your use case.

```json
[
  {
    "name": "totalCount",
    "type": "card",
    "label": "0",
    "url": "https://www.svgrepo.com/show/509344/documents.svg",
    "description": "Total Records",
    "events": [
      {
        "body": [
          {"key": "reportName",    "value": "totalCount"},
          {"key": "messageType",   "value": "generateReport"},
          {"key": "reportType",    "value": "dashboard"},
          {"key": "componentType", "value": "card"},
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
      {"key": "lg", "value": "4"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ]
  },
  {
    "name": "totalAmount",
    "type": "card",
    "label": "0.0",
    "url": "https://www.svgrepo.com/show/502817/rupee-coin.svg",
    "description": "Total Amount",
    "columnFormat": "amount",
    "events": [
      {
        "body": [
          {"key": "reportName",    "value": "totalAmount"},
          {"key": "messageType",   "value": "generateReport"},
          {"key": "reportType",    "value": "dashboard"},
          {"key": "componentType", "value": "card"},
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
      {"key": "lg", "value": "4"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ]
  },
  {
    "name": "activeUsers",
    "type": "card",
    "label": "0",
    "url": "https://www.svgrepo.com/show/507884/users.svg",
    "description": "Active Users",
    "events": [
      {
        "body": [
          {"key": "reportName",    "value": "activeUsers"},
          {"key": "messageType",   "value": "generateReport"},
          {"key": "reportType",    "value": "dashboard"},
          {"key": "componentType", "value": "card"},
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
      {"key": "lg", "value": "4"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ]
  }
]
```

---

## onLoad Event — Body Keys Reference

The body keys sent to the backend depend on what your API expects. Common keys:

| Key | When to include | Value |
|---|---|---|
| `reportName` | Always | Identifies which query/report to run — your backend determines this |
| `messageType` | When using `/HyperformMessage/process` | Varies by backend rule — e.g. `"generateReport"`, `"insuranceDashboard"`. Use whatever your backend expects. |
| `reportType` | When backend needs component category | `"dashboard"` or omit if backend doesn't require it |
| `componentType` | When backend needs to know the component | `"card"` or omit if backend doesn't require it |
| `artifactId` | When using rule-engine backend | Your rule/artifact ID |
| `fromDate` | Only if page has date filters | `"$fromDate"` |
| `endDate` | Only if page has date filters | `"$endDate"` |
| `userName` | Only if backend needs current user | `"$userValue.username"` |
| `candidateUser` | Only if backend needs user's role/position | `"$userValue.positionName"` |

Only include the keys your backend actually uses — do not blindly include all of them.

---

## Icon URLs

```
Documents / Files:  https://www.svgrepo.com/show/509344/documents.svg
Users / People:     https://www.svgrepo.com/show/507884/users.svg
Users (alt):        https://www.svgrepo.com/show/509999/users.svg
Rupee coin:         https://www.svgrepo.com/show/502817/rupee-coin.svg
Rupee circle:       https://www.svgrepo.com/show/508166/rupee-circle.svg
Percentage:         https://www.svgrepo.com/show/510118/percent-symbol.svg
Chart / Growth:     https://www.svgrepo.com/show/510077/chart-growth.svg
```

Browse more at https://www.svgrepo.com — copy the direct `.svg` URL.

---

## Common Mistakes

**Mistake 1:** Wrong `type` casing — must be lowercase `"card"`, not `"Card"`.

**Mistake 2:** Setting `label` to the card title text — `label` is the **initial numeric value** (`"0"`, `"0.0"`), not a heading. The heading comes from `description`.

**Mistake 3:** Including body keys your backend doesn't need (e.g. adding `fromDate`/`endDate` when there are no date filters on the page).

**Mistake 4:** Forgetting `"events": []` inside the event object — this nested empty array is required by the schema.

**Mistake 5:** Using `apiBody` when simple `$variable` references are enough — only add `apiBody` when you need runtime computation (reading from `store.formData` or `localStorage`). Static values should stay in the `body` array.

**Mistake 6:** Assuming `messageType` is always `"generateReport"` — the value depends on your backend rule/handler. Check what your backend expects.

---

## Testing Checklist

- [ ] Card renders at the correct grid size
- [ ] Placeholder value (`label`) shows before API loads
- [ ] API response replaces the value correctly
- [ ] `columnFormat: "amount"` formats with currency where needed
- [ ] Description text is visible below the value
- [ ] Icon appears in top-right corner (if `url` provided)
- [ ] Responsive on mobile and desktop
