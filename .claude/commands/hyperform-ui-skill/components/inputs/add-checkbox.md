---
name: add-checkbox
description: Add CheckBox components to Hyperform pages. Use this skill whenever you need boolean input — row selection in tables (batch operations), agreement acceptance, feature toggles, or Yes/No form fields. Covers config type "CheckBox", uiSchema widget "CheckBox", table column placement, getting checked state from formdata, filtering selected rows, onChange event, and required validation.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add CheckBox Component

**Pattern Reference:** page_paymentDetailsManagement  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add CheckBox to Your Page

CheckBox Component provides a boolean input for selecting/deselecting items. Perfect for:
- Row selection in tables (batch operations)
- Boolean form fields (Yes/No)
- Agreement acceptance
- Feature toggles
- Batch operations (select multiple rows)

---

## Step 1: Add to config.elements

### Standalone CheckBox (in form)

```json
{
  "name": "agreeToTerms",
  "type": "CheckBox",
  "label": "I agree to the terms and conditions",
  "events": [],
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

### CheckBox in Table (row selection)

```json
{
  "name": "Select",
  "type": "CheckBox",
  "events": []
}
```

### CheckBox with onChange Event

```json
{
  "name": "enableFeature",
  "type": "CheckBox",
  "label": "Enable Advanced Features",
  "events": [
    {
      "Handler": "custom",
      "eventType": "onChange",
      "eventCode": "async (store, dynamicData) => {\n  const isChecked = dynamicData?.changeEvent?.target?.checked;\n  store.setFormdata((prev) => ({ ...prev, enableFeature: isChecked }));\n}"
    }
  ]
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field key | `"agreeToTerms"` |
| `type` | Must be `"CheckBox"` | `"CheckBox"` |
| `label` | Text shown beside checkbox | `"I agree to terms"` |
| `style` | JSON string for inline styles | `"{}"` |
| `layout` | Array of `{key,value}` | Default: lg:3 md:4 sm:6 xs:6 |

---

## Data Type

CheckBox stores boolean values:
- `true` = checked
- `false` = unchecked
- `null` = indeterminate

---

## Complete Example: Table with Row Selection

### config.elements

```json
{
  "name": "paymentFailedRecords",
  "type": "Table",
  "events": [
    {
      "body": [],
      "path": "/payment/getFailedRecords",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "elements": [
    {
      "name": "Select",
      "type": "CheckBox",
      "events": []
    },
    {"name": "id", "label": "Id", "events": []},
    {"name": "status", "label": "Status", "events": []},
    {"name": "payeeName", "label": "Payee Name", "events": []}
  ],
  "selectKey": "Select12121"
}
```

---

## Getting Selected Rows in Button Click

```json
{
  "name": "reinitiate",
  "type": "Button",
  "label": "Reinitiate",
  "events": [
    {
      "path": "/payment/reinitiate",
      "method": "post",
      "Handler": "api",
      "apiBody": "(store) => {\n  const selectedData = store.ctx.core.data.paymentFailedRecords\n    .filter(e => e.Select);\n  const paymentIds = selectedData.map(e => e.id);\n  return { paymentIds };\n}",
      "eventType": "onClick",
      "events": [
        {
          "Handler": "refresh",
          "eventType": "Success",
          "refreshElements": [{"value": "paymentFailedRecords"}]
        }
      ]
    }
  ]
}
```

---

## Reading CheckBox Values

### In a form
```javascript
const isChecked = store.ctx.core.data.agreeToTerms; // boolean
```

### In a table row
```javascript
const isSelected = store.ctx.core.data.tableName[rowIndex].Select; // boolean
```

### Get all selected rows
```javascript
const selectedRows = store.ctx.core.data.paymentFailedRecords
  .filter(row => row.Select === true);
const selectedIds = selectedRows.map(row => row.id);
```

---

## Setting CheckBox Values Programmatically

### Set checked
```javascript
store.setFormdata((prev) => ({ ...prev, agreeToTerms: true }));
```

### Initialize in onLoad
```json
{
  "Handler": "custom",
  "eventCode": "async (store) => {\n  store.setFormdata({ agreeToTerms: true });\n}",
  "eventType": "onLoad"
}
```

### Use in conditional logic
```javascript
if (store.ctx.core.data.agreeToTerms) {
  store.navigate('/next-page');
} else {
  store.setNotify({ FailMessage: 'Please agree to terms', Fail: true });
}
```

---

## Common Patterns

### Agreement Checkbox (required)
```json
{
  "name": "agreeToTerms",
  "type": "CheckBox",
  "label": "I accept the terms and conditions",
  "validation": [
    {"validationType": "required", "validationValue": "true"}
  ]
}
```

### Feature Toggle with onChange
```json
{
  "name": "enableAdvancedSearch",
  "type": "CheckBox",
  "label": "Enable Advanced Search",
  "events": [
    {
      "Handler": "custom",
      "eventCode": "async (store, dynamicData) => {\n  const enabled = dynamicData.changeEvent.target.checked;\n  store.setSchema((pre) => ({ ...pre, properties: { ...pre.properties, searchFields: { disabled: !enabled } } }));\n}",
      "eventType": "onChange"
    }
  ]
}
```

---

## Component Comparison

| Component | Purpose | Data Type |
|---|---|---|
| CheckBox | Single boolean selection | boolean |
| Select | Choose one from list | string |
| MultipleSelect | Choose many from list | array |
| Radio | Choose one (visible options) | string |

---

## Common Mistakes to Avoid

**Mistake 1:** Reading checked state incorrectly — use `dynamicData?.changeEvent?.target?.checked` in `onChange`, not `dynamicData.value`

**Mistake 2:** For table row checkboxes, the field name `"Select"` must be consistent across all config `elements` entries — the name used in config must match how the table references it.

**Mistake 3:** Missing `selectKey` on the Table config when using row selection — add `"selectKey": "Select12121"` (or any unique string) to enable proper selection tracking.

---

## Testing Checklist

- [ ] CheckBox displays with label (if provided)
- [ ] CheckBox can be toggled (checked/unchecked)
- [ ] Checked state persists in formdata
- [ ] onChange event fires correctly
- [ ] Boolean value returned (not string)
- [ ] Disabled state works
- [ ] Validation triggers (if configured)
- [ ] Table row selection filters correctly
- [ ] Keyboard navigation works (Tab, Space)

---

## Reference

**Based on:** page_paymentDetailsManagement  
**Widget:** CheckBox  
**Version:** 1.0  
**Status:** Production Ready
