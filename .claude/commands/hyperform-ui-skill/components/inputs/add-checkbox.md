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

---

## Step 2: Add to uiSchema.elements

### Standalone CheckBox

```json
{
  "type": "Control",
  "scope": "#/properties/agreeToTerms",
  "config": {
    "main": {
      "label": "I agree to the terms and conditions"
    },
    "layout": {
      "lg": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "CheckBox"
  }
}
```

### CheckBox in Table Column

```json
{
  "size": 180,
  "header": "Select",
  "widget": {
    "type": "Control",
    "scope": "#/properties/Select",
    "config": {
      "main": {},
      "layout": {
        "lg": 3,
        "md": 4,
        "sm": 6,
        "xs": 6
      }
    },
    "options": {
      "widget": "CheckBox"
    }
  },
  "accessorKey": "Select",
  "enableSorting": true,
  "enableColumnFilter": true
}
```

---

## Step 3: Add to schema.properties

```json
{
  "agreeToTerms": {
    "type": "boolean"
  }
}
```

For table row checkboxes, the `Select` field is part of the table row schema:
```json
{
  "paymentFailedRecords": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "Select": {"type": "boolean"},
        "id": {},
        "status": {}
      }
    }
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "CheckBox" | "CheckBox" |
| widget (uiSchema) | Must be "CheckBox" | "CheckBox" |
| label | Text shown beside checkbox | "I agree to terms" |
| default | Initial checked state | true or false |
| disabled | Disable checkbox | true or false |

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

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/paymentFailedRecords",
  "config": {
    "main": {
      "columns": {"dataColumns": [], "actionColumns": []},
      "disableSorting": false
    },
    "layout": 12
  },
  "options": {"widget": "Table"},
  "elements": [
    {
      "size": 180,
      "header": "Select",
      "widget": {
        "type": "Control",
        "scope": "#/properties/Select",
        "config": {
          "main": {},
          "layout": {"lg": 3, "md": 4, "sm": 6, "xs": 6}
        },
        "options": {"widget": "CheckBox"}
      },
      "accessorKey": "Select",
      "enableSorting": true,
      "enableColumnFilter": true
    },
    {"size": 180, "header": "Id", "accessorKey": "id"},
    {"size": 180, "header": "Status", "accessorKey": "status"},
    {"size": 180, "header": "Payee Name", "accessorKey": "payeeName"}
  ]
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

**Mistake 1:** Wrong schema type — must be `"boolean"`, not `"string"`
```json
// WRONG
"agreeToTerms": {"type": "string"}

// CORRECT
"agreeToTerms": {"type": "boolean"}
```

**Mistake 2:** Reading checked state incorrectly — use `dynamicData?.changeEvent?.target?.checked` in `onChange`, not `dynamicData.value`

**Mistake 3:** For table row checkboxes, the field name `"Select"` must match in config `elements`, uiSchema `accessorKey`, and `scope` — all three must be consistent.

**Mistake 4:** Missing `selectKey` on the Table config when using row selection — add `"selectKey": "Select12121"` (or any unique string) to enable proper selection tracking.

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
