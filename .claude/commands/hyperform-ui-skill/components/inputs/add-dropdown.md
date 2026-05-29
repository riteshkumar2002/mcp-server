---
name: add-dropdown
description: Add searchable dropdown (Select) fields to Hyperform pages. Use this skill whenever you need to add a single dropdown, multi-dropdown, LOV-loaded select, or dependent dropdown to a Hyperform page config. Only the config needs to be changed — uiSchema and schema are auto-derived by buildUiSchema/buildConfig/buildSchema from uiBuilder.js.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Searchable Dropdown

**Pattern Reference:** page_WorkflowStatus / page_eSign  
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

## Static Dropdown (hardcoded options — no API)

Use the `value` array when the dropdown options are fixed and do not come from an API.

```json
{
  "name": "adjustmentType",
  "type": "Select",
  "label": "Adjustment Type",
  "value": [
    {"label": "Case Adjustment",  "value": "case_adjustment"},
    {"label": "Payee Adjustment", "value": "payee_adjustment"},
    {"label": "Case Rebooking",   "value": "case_rebooking"},
    {"label": "Documents",        "value": "documents"},
    {"label": "Cancellation",     "value": "cancellation"}
  ],
  "events": [],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "6"},
    {"key": "xs", "value": "12"}
  ],
  "validation": [
    {"validationType": "required", "validationValue": "true"}
  ]
}
```

**Key difference from LOV dropdown:**
- `value` array is set directly on the field (no `events` needed)
- Each entry has `label` (display text) and `value` (stored value)
- No API call — options are always the same
- `events: []` can be empty

---

## How to Add a Dropdown

### Single Dropdown — add to config.elements

```json
{
  "name": "programId",
  "type": "Select",
  "label": "Program Type*",
  "placeholder": "Program Type *",
  "searchable": true,
  "validation": [
    {
      "validationType": "required",
      "validationValue": "true"
    }
  ],
  "events": [
    {
      "path": "/page/getLOV",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad",
      "apiBody": "(store,dynamic,user,body)=>{\n  return {\n    ...body,\n    userId: user?.userId\n  }\n}",
      "body": [
        {
          "key": "type",
          "value": "program"
        }
      ]
    }
  ]
}
```

### Optional Dropdown (no validation block)

```json
{
  "name": "filterType",
  "type": "Select",
  "label": "Filter Type",
  "placeholder": "Select Filter Type",
  "searchable": true,
  "events": [
    {
      "path": "/page/getLOV",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad",
      "apiBody": "(store,dynamic,user,body)=>{ return { ...body, userId: user?.userId } }",
      "body": [
        { "key": "type", "value": "yourLovType" }
      ]
    }
  ]
}
```

That is all. Do NOT touch uiSchema or schema — they are generated automatically.  
`buildUiSchema` will produce a `SelectInputField` control with `searchable: true`, `freeSole: false`, and layout `lg:4, md:4, sm:4, xs:11`.

---

## Complete Config Example — Search Container with Multiple Dropdowns

Add this WrapperSection to `config.elements`:

```json
{
  "name": "searchContainer",
  "type": "WrapperSection",
  "label": "Search Container",
  "divider": "YES",
  "events": [],
  "elements": [
    {
      "name": "programId",
      "type": "Select",
      "label": "Program Type*",
      "placeholder": "Program Type *",
      "searchable": true,
      "validation": [
        { "validationType": "required", "validationValue": "true" }
      ],
      "events": [
        {
          "path": "/page/getLOV",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad",
          "apiBody": "(store,dynamic,user,body)=>{ return { ...body, userId: user?.userId } }",
          "body": [{ "key": "type", "value": "program" }]
        }
      ]
    },
    {
      "name": "channelId",
      "type": "Select",
      "label": "Channel*",
      "placeholder": "Select Channel *",
      "searchable": true,
      "validation": [
        { "validationType": "required", "validationValue": "true" }
      ],
      "events": [
        {
          "path": "/page/getLOV",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad",
          "apiBody": "(store,dynamic,user,body)=>{ return { ...body, userId: user?.userId } }",
          "body": [{ "key": "type", "value": "channel" }]
        }
      ]
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

---

## Passing Selected Values to an API (Search Button event)

Add this event to the Search button element in config:

```json
{
  "body": [
    { "key": "programId", "value": "$programId" },
    { "key": "channelId", "value": "$channelId" }
  ],
  "path": "/api/searchRecords",
  "method": "post",
  "Handler": "api",
  "eventType": "onClick"
}
```

Reading selected value in custom event code:
```js
const selectedProgram = store?.ctx?.core?.data?.programId;
const selectedChannel = store?.ctx?.core?.data?.channelId;
```

---

## Dependent Dropdowns (child depends on parent selection)

Add an `onChange` event to the parent dropdown in config:

```json
{
  "name": "programId",
  "type": "Select",
  "label": "Program Type*",
  "searchable": true,
  "events": [
    {
      "path": "/page/getLOV",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad",
      "apiBody": "(store,dynamic,user,body)=>{ return { ...body, userId: user?.userId } }",
      "body": [{ "key": "type", "value": "program" }]
    },
    {
      "Handler": "custom",
      "eventType": "onChange",
      "eventCode": "async (store, dynamicData, userValue, body, service) => {\n  const selectedProgram = store?.newData?.programId;\n  store.ctx.core.data.channelId = [];\n  if (!selectedProgram) return;\n  const res = await service.get(`/api/getChannels?programId=${selectedProgram}`);\n  const options = (res?.data || []).map(r => ({ const: r.id, title: r.name }));\n  if (options.length) store.setSchema((pre) => {\n    const p = {...pre.properties};\n    p.channelId = {...p.channelId, oneOf: options};\n    return {...pre, properties: p};\n  });\n}"
    }
  ]
}
```

Key rules for dependent dropdowns:
- Read parent value from `store?.newData?.parentField` (not `ctx.core.data`)
- Reset child with `store.ctx.core.data.childField = []`
- Always guard `setSchema` with `if (options.length)`

---

## Populating a Dropdown from Another Field's onLoad Event

Sometimes a dropdown's options depend on a value that isn't known until another event runs. You can populate a dropdown's `oneOf` options from **any** field's event — not just the dropdown itself.

**Pattern:** Add an `onLoad` event to any field (Text, Select, or even a container element). In its `Success` handler, map the API response to `oneOf` format and call `store.setSchema` to inject the options into the target dropdown's schema property.

```json
{
  "name": "triggerField",
  "type": "Text",
  "label": "Search Id",
  "events": [
    {
      "body": [
        {"key": "programId", "value": "$programId"},
        {"key": "messageType", "value": "generateReport"},
        {"key": "reportName",  "value": "<your-report-name>"}
      ],
      "path": "/HyperformMessage/process",
      "events": [
        {
          "events": [],
          "Handler": "custom",
          "eventCode": "async (store, dynamicData, userValue, res) => {\n  const isProgramIdPresent = 'programId' in store.newData;\n  const isManager = userValue.userType !== 'agent';\n  return isProgramIdPresent && isManager;\n}",
          "eventType": "onStart"
        },
        {
          "events": [],
          "Handler": "custom",
          "eventCode": "async (store, dynamicData, userValue, res) => {\n  const options = Array.isArray(res?.data)\n    ? res.data.map(item => ({ const: item.name, title: item.name }))\n    : [];\n  store.setSchema((pre) => ({\n    ...pre,\n    properties: { ...pre?.properties, targetDropdown: { oneOf: options } }\n  }));\n}",
          "eventType": "Success"
        }
      ],
      "method": "post",
      "Handler": "api",
      "apiBody": "(store, d, u, body) => {\n  return { ...body, programId: store.newData.programId };\n}",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Replace:**
- `triggerField` → the field name that triggers the load
- `targetDropdown` → the `name` of the Select field whose options you are populating
- `<your-report-name>` → your backend report/query identifier
- `item.name` → the key in your API response used as both `const` and `title`

**When to use this pattern:**
- The dropdown's options depend on a combination of filters not known at page load
- Another field (Text input, filter, etc.) acts as the trigger for re-loading the dropdown's options
- The `onStart` can gate the load — e.g. only fire when a parent programId is present AND the user is a manager

---

## Store Data Access Reference

Three ways to read form field values — use the right one for each context:

| Access path | Contains | Use when |
|---|---|---|
| `store.newData.fieldName` | The value **just changed** in the latest event | `onChange` handlers, `onStart` guards checking if a field was touched, `apiBody` needing the freshly-set value |
| `store.formData.fieldName` | All current form values (flat object) | `apiBody`, `onLoad`, reading any field's current value |
| `store.ctx.core.data.fieldName` | Same as formData but deeper in the store tree | More reliable inside nested Success handlers; use for resetting: `store.ctx.core.data.field = []` |

**Quick rules:**
- In `onChange` → always use `store.newData` to read the field that just changed
- In `apiBody` → prefer `store.newData` when you need the latest change, `store.formData` for stable values
- To reset a child dropdown → `store.ctx.core.data.childField = []`
- `'fieldName' in store.newData` → checks whether a specific field was part of the latest change event

### onStart: checking store.newData membership

```javascript
// Fire only if programId was part of this change event AND user is not agent
async (store, dynamicData, userValue, res) => {
  const isProgramIdPresent = 'programId' in store.newData;
  const isManager = userValue.userType !== 'agent';
  return isProgramIdPresent && isManager;
}
```

### userValue fields available in events

| Field | Value |
|---|---|
| `userValue.username` | Login username |
| `userValue.userId` | Numeric user ID |
| `userValue.userType` | Role string — e.g. `"agent"`, `"manager"`, `"admin"` |
| `userValue.positionName` | User's position |

---

## Common LOV Types

| Field Name | Label | LOV type value |
|---|---|---|
| `programId` | Program Type | `program` |
| `channelId` | Channel | `channel` |
| `hierarchyId` | Hierarchy | `hierarchy` |
| `designationId` | Designation | `designation` |
| `stateId` | State | `state` |
| `roleId` | Role | `role` |

---

## Key Config Properties (for reference)

| Property | Value | Notes |
|---|---|---|
| `type` | `Select` | Drives `SelectInputField` widget in buildUiSchema |
| `searchable` | `true` | Always true for searchable dropdowns |
| `placeholder` | String | Hint text when empty |
| `validation` | `[{validationType:"required", validationValue:"true"}]` | Omit for optional fields |
| `events[onLoad]` | LOV API call | Populates options on page load |
| `events[onChange]` | Custom handler | For dependent dropdowns |

The generated uiSchema will use:
- `widget: "SelectInputField"`
- `freeSole: false`
- `layout: { lg: 4, md: 4, sm: 4, xs: 11 }`

---

## Common Mistakes to Avoid

- Never use `widget: "Select"` — always `SelectInputField`
- Never set `freeSole: true` — always `false` (no custom entries)
- Never call `setSchema` with empty `oneOf` — guard with `if (options.length)`
- Never load `setFormdata` before LOVs in form onLoad — dropdowns will clear
- Use `xs: 11` not `xs: 12` on mobile (keeps the margin)

---

## Workflow

1. Fetch the current page config with `get_page_record`
2. Add the `Select` element(s) to the appropriate place in `config.elements`
3. Call `update_page` with the modified config — it runs `buildUiSchema`, `buildConfig`, `buildSchema` internally and saves via staging
4. Do NOT auto-approve — leave for manual approval in the workflow dashboard
