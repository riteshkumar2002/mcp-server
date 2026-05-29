---
name: add-icon-button
description: Add Icon Buttons to Hyperform pages. Use this skill whenever you need compact icon-only action buttons — in table row columns (View, Edit, Delete) or table header (Add, Download, Export). Covers iconName, buttonType, elementType, color, tooltipMessage, and placement in uiSchema headerIcons vs column elements.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Icon Button

**Pattern Reference:** page_NotificationLogs  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add Icon Button to Your Page

Icon Button displays only an icon with optional tooltip. Perfect for:
- Table action buttons (View, Edit, Delete)
- Table header buttons (Add, Download, Export)
- Compact button bars
- Icon-only actions

---

## Step 1: Add to config.elements (In Table)

### Icon Button in Table Column

```json
{
  "name": "viewBtn",
  "type": "Button",
  "color": "primary",
  "label": "View",
  "events": [
    {
      "eventType": "onClick",
      "Handler": "custom",
      "eventCode": "async(store, dynamic, user, body) => {\n  const rowId = dynamic?.rowData.id;\n  store.navigate(`/Template-1/page_view?id=${rowId}`);\n}"
    }
  ],
  "iconName": "ViewIcon",
  "buttonType": "IconButton",
  "defaultStyle": "true",
  "enableFilter": "No"
}
```

### Icon Button in Table Header

```json
{
  "name": "addBtn",
  "type": "Button",
  "label": "Add",
  "events": [
    {
      "eventType": "onClick",
      "Handler": "custom",
      "eventCode": "async(store) => { store.navigate(\"/Template-1/page_create\") }"
    }
  ],
  "iconName": "TableAddIcon",
  "buttonType": "IconButton",
  "elementType": "tableHeader",
  "defaultStyle": "false",
  "tooltipMessage": "Add New Record"
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Array Type — Repeatable Row Group

`Array` is a special container type that lets users add/remove multiple rows of the same fields. Each row is an instance of its child elements.

```json
{
  "name": "addException",
  "type": "Array",
  "label": "Add Exception",
  "events": [],
  "validation": [],
  "elements": [
    {
      "name": "adjustmentType",
      "type": "Select",
      "label": "Adjustment Type",
      "value": [
        {"label": "Option A", "value": "option_a"},
        {"label": "Option B", "value": "option_b"}
      ],
      "events": [],
      "layout": [{"key": "lg", "value": "4"}, {"key": "md", "value": "4"}, {"key": "sm", "value": "6"}, {"key": "xs", "value": "12"}],
      "validation": [{"validationType": "required", "validationValue": "true"}]
    },
    {
      "name": "remarks",
      "type": "Text",
      "label": "Remarks",
      "events": [],
      "layout": [{"key": "lg", "value": "4"}, {"key": "md", "value": "4"}, {"key": "sm", "value": "6"}, {"key": "xs", "value": "12"}],
      "validation": [{"validationType": "required", "validationValue": "true"}]
    }
  ]
}
```

**Rules:**
- `type: "Array"` — the container
- `elements` — the fields for each row (same as any form section)
- `validation: []` — always empty array on the Array itself; put validation on child fields
- The data is stored as an array of objects in formdata: `store.ctx.core.data.addException = [{adjustmentType: "...", remarks: "..."}, ...]`
- Reference the whole array in event body with `"$addException"` (the field name prefixed with `$`)

### Sending Array data in event body

```json
{"key": "body", "value": "$addException"}
```

This passes the entire array as the value for that body key. The backend receives the full list.

### Checking Array length in onStart

```javascript
async (store) => {
  const data = store.ctx.core.data.addException;
  if (data && data.length > 0) {
    store.setValidation("ValidateAndShow");
    return true;
  }
  store.setNotify({ FailMessage: "Please add at least one row first!", Fail: true });
  return false;
}
```

### Clearing/resetting an Array field in Success

```javascript
async (store, dynamicData, userValue, res) => {
  store.setFormdata((prev) => ({ ...prev, addException: [] }));
  store.setNotify({ SuccessMessage: "Submitted successfully", Success: true });
}
```

---

## Multiple Success Events on the Same onClick

A single API event can have multiple `Success` handlers. They run in order after the API responds successfully. Use this when you need to: show a notification AND refresh a table after the same action.

```json
{
  "body": [...],
  "path": "/HyperformMessage/process",
  "events": [
    {
      "events": [],
      "Handler": "custom",
      "eventCode": "async (store, dynamicData, userValue, res) => {\n  if (res?.data?.isRequestValid === false) {\n    store.setNotify({ FailMessage: res?.data?.message, Fail: true });\n    return;\n  }\n  store.setNotify({ SuccessMessage: 'Action completed successfully', Success: true });\n}",
      "eventType": "Success"
    },
    {
      "events": [],
      "Handler": "refresh",
      "eventType": "Success",
      "refreshElements": [{"value": "myTable"}, {"value": "anotherTable"}]
    }
  ],
  "method": "post",
  "Handler": "api",
  "eventType": "onClick"
}
```

**Order:** The first Success handler runs first. If you need to show a notification AND refresh, put the custom notification handler before the refresh handler.

### Checking API response for business validation errors

Some APIs return HTTP 200 but include a `isRequestValid: false` flag in the response body when business rules fail:

```javascript
async (store, dynamicData, userValue, res) => {
  if (res?.data?.isRequestValid === false) {
    store.setNotify({ FailMessage: res?.data?.message, Fail: true });
    return;
  }
  // happy path
  store.setNotify({ SuccessMessage: "Done!", Success: true });
}
```

---

## store.setNotify — Notification Patterns

```javascript
// Success notification
store.setNotify({ SuccessMessage: "Action completed", Success: true });

// Failure/error notification
store.setNotify({ FailMessage: "Something went wrong", Fail: true });

// Warning
store.setNotify({ WarningMessage: "Please check input", Warning: true });
```

---

## Custom Handler onLoad for Table (manual fetch + setFormdata)

Use this when you need full control over the API call — custom query params, complex headers, or setting table data from a non-standard response shape.

Instead of `Handler: "api"`, use `Handler: "custom"` with `eventCode` that calls `service.get` / `service.post` manually and sets the table data via `store.setFormdata`.

```json
{
  "name": "myTable",
  "type": "Table",
  "events": [
    {
      "body": [],
      "path": "/api/getData",
      "events": [],
      "method": "get",
      "Handler": "custom",
      "eventCode": "async (store, dynamicData, user, body, service) => {\n  const id = store.searchParams?.get('id');\n  try {\n    const res = await service.get('/api/getData', {\n      params: { source: 'MY_SOURCE', sourceId: id }\n    });\n    store.setFormdata((prev) => ({\n      ...prev,\n      myTable: res.data\n    }));\n  } catch (error) {\n    console.error('Error fetching data:', error);\n  }\n}",
      "eventType": "onLoad"
    }
  ],
  "elements": [...]
}
```

**Critical:** `store.setFormdata(prev => ({...prev, myTable: res.data}))` — the key must match the table's `name` exactly. This is how a custom handler populates a Table component.

### headers — Custom HTTP headers on an event

Add a `headers` array to an event to send custom HTTP headers with the request:

```json
{
  "path": "/api/endpoint",
  "headers": [
    {"key": "source",   "value": "MY_SOURCE"},
    {"key": "sourceId", "value": "$urlParams.caseId"}
  ],
  "method": "get",
  "Handler": "api",
  "eventType": "onLoad"
}
```

Headers support `$variable` references the same as body keys.

---

## isSync on Button Events

Add `"isSync": "Yes"` to an event when it must complete synchronously before the next handler runs:

```json
{
  "events": [],
  "isSync": "Yes",
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue, response, service) => {\n  store.navigate('/Page?id=' + dynamicData?.rowData?.id);\n}",
  "eventType": "onClick"
}
```

---

## Table Config Flags

All Table feature flags are **strings** in config (`"YES"` / `"NO"`), not booleans. Add only the ones you need.

```json
{
  "name": "myTable",
  "type": "Table",
  "lazyLoading":           "YES",
  "DragAvailable":         "NO",
  "SelectionAvailable":    "NO",
  "ColumnResizingAvailable": "YES",
  "disableFilters":        "YES",
  "disableSorting":        "YES",
  "disablePagination":     "NO",
  "disableColumnFilter":   "YES",
  "disableGlobalSearch":   "YES",
  "disableDensityToggle":  "NO",
  "disableEditColumn":     "NO",
  "disableDownloadFile":   "YES",
  "downloadAllData":       "YES",
  "events": [...],
  "elements": [...]
}
```

| Flag | Purpose | Common value |
|---|---|---|
| `lazyLoading` | Load data on demand | `"YES"` for large datasets |
| `DragAvailable` | Allow row drag-and-drop | `"NO"` usually |
| `SelectionAvailable` | Enable row checkboxes for selection | `"NO"` usually |
| `ColumnResizingAvailable` | Allow column width resize | `"YES"` for wide tables |
| `disableFilters` | Hide all column filter controls | `"YES"` for simple tables |
| `disableSorting` | Disable column sort | `"YES"` for report tables |
| `disablePagination` | Hide pagination controls | `"NO"` usually |
| `disableColumnFilter` | Disable per-column filter | `"YES"` for simple tables |
| `disableGlobalSearch` | Hide global search bar | `"YES"` for report tables |
| `disableDensityToggle` | Hide density toggle | `"NO"` usually |
| `disableEditColumn` | Hide column visibility editor | `"NO"` usually |
| `disableDownloadFile` | Hide built-in download button | `"YES"` when custom download provided |
| `downloadAllData` | Download all data (not just visible page) | `"YES"` for export |

### sizeHolder — Column Width Overrides

Use `sizeHolder` to set explicit widths for specific columns by their data key name:

```json
{
  "name": "myTable",
  "type": "Table",
  "sizeHolder": [
    {"value": "270", "keyName": "columnName1"},
    {"value": "240", "keyName": "columnName2"},
    {"value": "280", "keyName": "columnName3"}
  ],
  "events": [...],
  "elements": [...]
}
```

`value` is the width in pixels as a string. `keyName` must match the column's `name` in the elements array.

### columnFormat on Table Columns

Add `columnFormat` to a table column element to apply automatic value formatting:

```json
{"name": "payable_amount", "label": "Payable Amount",  "events": [], "columnFormat": "amount"},
{"name": "cycle_start",    "label": "Cycle Start Date", "events": [], "columnFormat": "date"},
{"name": "created_on",     "label": "Created On",       "events": [], "columnFormat": "dateTime"}
```

| `columnFormat` value | Formats |
|---|---|
| `"amount"` | Currency (₹ symbol, 2 decimal places) |
| `"date"` | Date only — e.g. `DD/MM/YYYY` |
| `"dateTime"` | Date + time — e.g. `DD/MM/YYYY HH:mm` |

---

## onStart Pre-Condition on Events

`onStart` is a **pre-condition guard** placed inside a parent event's nested `events` array. It runs before the parent event executes. If it returns `false`, the parent event is skipped entirely.

**Use when:** the event should only fire if certain conditions are met (e.g. URL params exist, form fields are filled, user has permission).

```json
{
  "body": [...],
  "path": "/HyperformMessage/process",
  "events": [
    {
      "events": [],
      "Handler": "custom",
      "eventCode": "async (store) => {\n  if (store.searchParams?.get('requiredParam')) {\n    return true;\n  }\n  return false;\n}",
      "eventType": "onStart"
    }
  ],
  "method": "post",
  "Handler": "api",
  "elements": [],
  "eventType": "onLoad"
}
```

**Rules:**
- Return `true` → parent event executes normally
- Return `false` → parent event is skipped (no API call made)
- Placed inside the parent event's `events: [...]` array
- The parent event must also have `"elements": []` when using `onStart`
- Can read `store.searchParams`, `store.formData`, `userValue`, or any other store value

**Common `onStart` checks:**

```javascript
// Check URL params exist
async (store) => {
  return !!(store.searchParams?.get('programId') && store.searchParams?.get('agentId'));
}

// Check form field is filled (via store.formData)
async (store) => {
  return !!store.formData.selectedId;
}

// Check form field via store.ctx.core.data (alternative formdata access)
async (store) => {
  return !!(store?.ctx?.core?.data?.programId);
}

// Check multiple form fields with ctx.core.data
async (store) => {
  const data = store?.ctx?.core?.data;
  return !!(data?.programId && data?.programCycle);
}

// Check user has required role
async (store, dynamicData, userValue) => {
  return userValue.userType === 'admin';
}
```

**`store.formData` vs `store.ctx.core.data` vs `store.newData`:**

| Path | Use when |
|---|---|
| `store.newData.field` | Field value from the latest change event; use in `onChange` and `onStart` to check what just changed |
| `'field' in store.newData` | Check whether a specific field was part of the current change |
| `store.formData.field` | Current form value; reliable in `onLoad` and `apiBody` |
| `store.ctx.core.data.field` | Same as formData; more reliable inside nested handlers |

---

## $urlParams Variables

Use `$urlParams.paramName` in event body values to read URL query parameters at runtime.

```json
{"key": "programId",   "value": "$urlParams.programId"},
{"key": "agentId",     "value": "$urlParams.agentId"},
{"key": "businessKey", "value": "$urlParams.businessKey"}
```

These resolve to the value of `?programId=...&agentId=...` from the current page URL.

**Other common `$` variables:**

| Variable | Resolves to |
|---|---|
| `$urlParams.paramName` | URL query parameter value |
| `$userValue.username` | Logged-in user's username |
| `$userValue.userId` | Logged-in user's numeric ID |
| `$userValue.userType` | User's role — e.g. `"agent"`, `"manager"` |
| `$userValue.positionName` | User's position name |
| `$fromDate` | Value of `fromDate` field in formdata |
| `$endDate` | Value of `endDate` field in formdata |
| `$programId` | Value of `programId` field in formdata |
| `$programCycle` | Value of `programCycle` field in formdata |
| `$case_id` | Value of `case_id` field in formdata |

**Hardcoded literal values in body:**

Body key values can also be **plain string literals** instead of `$variable` references — use this when the value is fixed and does not come from the form:

```json
{"key": "programId", "value": "845"}
```

Mix freely with variable references in the same body array:
```json
[
  {"key": "programId",  "value": "845"},
  {"key": "reportType", "value": "fileDownload"},
  {"key": "userName",   "value": "$userValue.username"},
  {"key": "startDate",  "value": "$startDate"}
]
```

---

## Row Button with API Call + File Download (apiBody + inBuiltFunction)

Use this pattern when a table row button needs to call an API using row data and then trigger a file download.

```json
{
  "name": "downloadBtn",
  "type": "Button",
  "label": "Download",
  "iconName": "DownloadIcon",
  "buttonType": "IconButton",
  "defaultStyle": "true",
  "elements": [],
  "events": [
    {
      "path": "/externalData/getById",
      "events": [
        {
          "events": [],
          "Handler": "inBuiltFunction",
          "eventType": "Success",
          "funcParametersCode": "(store, dynamicData, userValue, parentEventOutput, service) => {\n  return parentEventOutput.data;\n}",
          "inBuiltFunctionType": "downloadFile"
        }
      ],
      "method": "post",
      "Handler": "api",
      "apiBody": "(store, dynamicData, userValue, body, service) => {\n  if (!dynamicData?.rowData?.fileId) {\n    throw new Error('No file attached to this row');\n  }\n  return {\n    id: dynamicData.rowData.fileId,\n    withData: true,\n    toBeDeleted: false\n  };\n}",
      "eventType": "onClick"
    }
  ]
}
```

**How it works:**
1. User clicks the button on a table row
2. `apiBody` reads the file ID from `dynamicData.rowData.fileId` (the row's data)
3. POSTs `{id, withData: true}` to `/externalData/getById`
4. On success, `inBuiltFunction "downloadFile"` extracts `parentEventOutput.data` and triggers browser download

**Replace `fileId`** with the actual column name in your table data that holds the file reference.

**Guard for missing attachment:**
```javascript
if (!dynamicData?.rowData?.attachmentField) {
  throw new Error('No attachment on this row');
}
```
Throwing an error inside `apiBody` prevents the API call from firing.

---

## Complete Example: Table with Action Buttons

### config.elements

```json
{
  "name": "logsTable",
  "type": "Table",
  "lazyLoading": "YES",
  "events": [
    {
      "body": [
        {"key": "reportName", "value": "myReport"},
        {"key": "messageType", "value": "generateReport"},
        {"key": "programId",  "value": "$urlParams.programId"}
      ],
      "path": "/HyperformMessage/process",
      "events": [
        {
          "events": [],
          "Handler": "custom",
          "eventCode": "async (store) => {\n  return !!store.searchParams?.get('programId');\n}",
          "eventType": "onStart"
        }
      ],
      "method": "post",
      "Handler": "api",
      "elements": [],
      "eventType": "onLoad"
    }
  ],
  "elements": [
    {"name": "name", "label": "Name"},
    {"name": "status", "label": "Status"},
    {
      "name": "viewBtn",
      "type": "Button",
      "label": "View",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store, dynamic) => {\n  store.navigate(`/page_detail?id=${dynamic.rowData.id}`);\n}"
        }
      ],
      "iconName": "ViewIcon",
      "buttonType": "IconButton",
      "defaultStyle": "true"
    },
    {
      "name": "deleteBtn",
      "type": "Button",
      "label": "Delete",
      "color": "error",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store, dynamic) => {\n  if (confirm('Delete this record?')) {\n    store.navigate(`/api/delete/${dynamic.rowData.id}`);\n  }\n}"
        }
      ],
      "iconName": "DeleteIcon",
      "buttonType": "IconButton",
      "defaultStyle": "true"
    },
    {
      "name": "addBtn",
      "type": "Button",
      "label": "Add",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store) => { store.navigate('/page_create'); }"
        }
      ],
      "iconName": "TableAddIcon",
      "buttonType": "IconButton",
      "elementType": "tableHeader",
      "defaultStyle": "false",
      "tooltipMessage": "Add New Record"
    },
    {
      "name": "downloadBtn",
      "type": "Button",
      "label": "Download",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "api",
          "path": "/api/downloadLogs",
          "method": "post"
        }
      ],
      "iconName": "TableDownloadIcon",
      "buttonType": "IconButton",
      "elementType": "tableHeader",
      "tooltipMessage": "Download Data"
    }
  ]
}
```

---

## Common Icon Names

| Icon | Name |
|---|---|
| View | `ViewIcon` |
| Edit | `EditIcon` |
| Delete | `DeleteIcon` |
| Add | `TableAddIcon` |
| Download (table header) | `TableDownloadIcon` |
| Download (row action) | `DownloadIcon` |
| Search | `SearchIcon` |
| Approve | `ApproveIcon` |
| Reject | `RejectIcon` |
| Send | `SendIcon` |
| Info | `InfoIcon` |

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| iconName | Icon to display | "ViewIcon" |
| buttonType | Must be "IconButton" | "IconButton" |
| defaultStyle | Icon-only (true) vs text+icon (false) | "true" |
| color | Button color | "primary", "error", "success" |
| tooltipMessage | Hover text | "View Details" |
| elementType | "tableHeader" for header placement | "tableHeader" |
| size | Button size | "small", "medium", "large" |

---

## Colors Available

```json
"color": "primary"    // Blue
"color": "secondary"  // Gray
"color": "success"    // Green
"color": "error"      // Red
"color": "warning"    // Orange
"color": "info"       // Light Blue
```

---

## Button Actions

### Navigate to Detail Page
```javascript
async(store, dynamic) => {
  const id = dynamic?.rowData.id;
  store.navigate(`/page_detail?id=${id}`);
}
```

### Open Modal/Dialog
```javascript
async(store, dynamic) => {
  store.setSchema((pre) => ({
    ...pre,
    properties: { ...pre.properties, modal: { visible: true } }
  }));
}
```

### API Call
```javascript
async(store, dynamic) => {
  const id = dynamic?.rowData.id;
  await service.post(`/api/delete/${id}`);
  store.refreshTable();
}
```

### Copy to Clipboard
```javascript
async(store, dynamic) => {
  navigator.clipboard.writeText(dynamic?.rowData.email);
  store.setNotify({ SuccessMessage: "Copied!", Success: true });
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Missing `iconName`
```json
// WRONG
{"buttonType": "IconButton"}

// CORRECT
{"buttonType": "IconButton", "iconName": "ViewIcon"}
```

**Mistake 2:** Header buttons placed in column elements instead of `headerIcons.elements` — use `elementType: "tableHeader"` in config to place header buttons correctly. The auto-derived uiSchema will handle placement automatically.

**Mistake 4:** Using `$urlParams.paramName` without an `onStart` guard — if the URL param doesn't exist the API call fires with a null value. Always pair `$urlParams` variables with an `onStart` check.

**Mistake 5:** Forgetting `"elements": []` on the parent event when using `onStart` — the `elements` field is required on the event object when a nested `events` array is present.

**Mistake 6:** Using `dynamic.rowData` in a custom handler but `dynamicData.rowData` in `apiBody` — the parameter name differs between handler types. In `apiBody` the second parameter is named `dynamicData`.

---

## Testing Checklist

- [ ] Icon displays correctly
- [ ] Tooltip appears on hover
- [ ] Button is clickable
- [ ] Click action executes
- [ ] Row data accessible via `dynamic.rowData`
- [ ] Color is correct
- [ ] Header icons appear in table toolbar
- [ ] Works on mobile

---

## Reference

**Based on:** page_NotificationLogs  
**Widget:** IconButton (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
