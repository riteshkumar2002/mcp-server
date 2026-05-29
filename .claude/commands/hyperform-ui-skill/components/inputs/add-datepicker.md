---
name: add-datepicker
description: Add Date picker fields to Hyperform pages. Use this skill whenever you need to add a date input, date range (start/end), or any date picker control to a Hyperform page config. Only the config needs to be changed — uiSchema and schema are auto-derived by buildUiSchema/buildConfig/buildSchema from uiBuilder.js.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Date Picker

**Pattern Reference:** page_WorkflowStatus  
**Version:** 2.0 — MCP Server Edition

---

## IMPORTANT: Only Modify config

In the MCP server, **never manually construct uiSchema or schema**.  
After modifying `config`, the `update_page` tool automatically calls:

```ts
import { buildUiSchema, buildConfig, buildSchema } from "../uiBuilder.js";
```

These functions derive the full uiSchema and schema from the config. Your only job is to get the config right.

---

## How to Add a Date Picker

### Single Date Field — add to config.elements

```json
{
  "name": "startDate",
  "type": "Date",
  "label": "Start Date"
}
```

### Date Range (Start + End) — add both to config.elements

```json
[
  {
    "name": "startDate",
    "type": "Date",
    "label": "Start Date"
  },
  {
    "name": "endDate",
    "type": "Date",
    "label": "End Date"
  }
]
```

That is all. Do NOT touch uiSchema or schema — they are generated automatically.

---

## Complete Config Example — Search Container with Date Range

Add this WrapperSection to `config.elements` (or nest inside an existing section):

```json
{
  "name": "searchContainer",
  "type": "WrapperSection",
  "label": "Search Container",
  "divider": "YES",
  "events": [],
  "elements": [
    {
      "name": "startDate",
      "type": "Date",
      "label": "Start Date"
    },
    {
      "name": "endDate",
      "type": "Date",
      "label": "End Date"
    },
    {
      "name": "searchButton",
      "type": "Button",
      "label": "Search",
      "iconName": "SearchIcon"
    }
  ]
}
```

`buildUiSchema` will automatically produce `DateInputField` controls with the correct layout (`lg:4, md:4, sm:4, xs:11`).

---

## Pass Dates to an API (Search Button event)

Add this event to the Search button element in config:

```json
{
  "body": [
    { "key": "startDate",   "value": "$startDate" },
    { "key": "endDate",     "value": "$endDate" },
    { "key": "reportName",  "value": "yourReportName" }
  ],
  "path": "/your/api/endpoint",
  "method": "post",
  "Handler": "api",
  "eventType": "onClick"
}
```

---

## Common Field Names

```
startDate / endDate             (standard date range)
fromDate  / toDate              (alternative date range)
cycleFromDate / cycleEndDate    (cycle period — page_WorkflowStatus style)
eventDate                       (single date)
dateOfBirth                     (birth date)
```

---

## Key Config Properties (for reference)

| Property | Value | Notes |
|---|---|---|
| `type` | `"Date"` or `"DateTime"` | The config element type — drives widget selection in buildUiSchema |
| `label` | String | Display label |
| `name`  | camelCase | Must be unique within the page; becomes the schema property key |
| `variant` | String | Optional input variant |
| `toolTip` | String | Optional tooltip text |
| `toolTipPosition` | String | Optional tooltip position |
| `style` | JSON string | Optional inline style |
| `layout` | Array of `{key,value}` | Responsive grid overrides (default: lg:4 md:4 sm:4 xs:11) |

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Workflow

1. Fetch the current page config with `get_page_record`
2. Add the `Date` element(s) to the appropriate place in `config.elements`
3. Call `update_page` with the modified config — it runs `buildUiSchema`, `buildConfig`, `buildSchema` internally and saves via staging
4. Do NOT auto-approve — leave for manual approval in the workflow dashboard
