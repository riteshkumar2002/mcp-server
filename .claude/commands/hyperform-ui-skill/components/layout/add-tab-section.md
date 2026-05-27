---
name: add-tab-section
description: Add Tab Section (TabLayout) to Hyperform pages. Use this skill whenever you need to organize content into tabs — multiple reports, different data views, summary vs details, or any tabbed layout. Covers TabSection config, TabLayout uiSchema, nested tables/forms, sectionLabels, vertical/horizontal orientation, and lazy loading.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Tab Section

**Pattern Reference:** page_builderPayoutReview  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add Tab Section to Your Page

Tab Section (TabLayout) organizes content into tabs. Perfect for:
- Multiple reports in tabs
- Different views of same data
- Organizing related sections
- Cleaner page layouts

---

## Step 1: Add to config.elements

```json
{
  "name": "TabSection",
  "type": "TabSection",
  "label": "TabSection",
  "style": ".css-1nti06h { padding: 24px 24px 24px 24px; }",
  "events": [],
  "layout": [],
  "elements": [
    {
      "name": "reportOne",
      "type": "Table",
      "label": "Transaction Report",
      "events": [
        {
          "body": [
            {"key": "reportName", "value": "transactionReport"}
          ],
          "path": "/HyperformMessage/process",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad"
        }
      ],
      "elements": [
        {"name": "id", "label": "ID"},
        {"name": "name", "label": "Name"},
        {"name": "amount", "label": "Amount", "columnFormat": "amount"}
      ]
    }
  ],
  "sectionLabels": [
    {"label": "Transaction Report"}
  ],
  "verticalOrientation": "YES",
  "lazyLoad": "NO"
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "TabLayout",
  "scope": "#/properties/TabSection",
  "config": {
    "main": {
      "id": "TabSection",
      "layout": 12,
      "lazyLoad": false,
      "tabLabels": [
        "Transaction Report"
      ]
    }
  },
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/reportOne",
      "config": {
        "main": {
          "columns": {
            "dataColumns": [],
            "actionColumns": []
          },
          "onMount": "onMount",
          "Selection": false,
          "allRowData": [],
          "enableDrag": false,
          "lazyLoading": false,
          "disableSorting": true,
          "downloadAllData": true,
          "enableExpandAll": true,
          "disableColumnFilter": true,
          "disableDownloadFile": false,
          "disableGlobalSearch": true
        }
      },
      "options": {
        "widget": "Table"
      },
      "elements": [
        {
          "size": 180,
          "header": "ID",
          "accessorKey": "id",
          "enableColumnFilter": true
        },
        {
          "size": 180,
          "header": "Name",
          "accessorKey": "name",
          "enableColumnFilter": true
        },
        {
          "size": 180,
          "type": "amount",
          "header": "Amount",
          "accessorKey": "amount",
          "enableColumnFilter": true
        }
      ]
    }
  ]
}
```

---

## Step 3: Add to schema.properties

```json
{
  "reportOne": {
    "type": "array",
    "items": {
      "type": "object",
      "required": [],
      "properties": {}
    }
  }
}
```

---

## Complete Example: Multiple Tabs with Tables

### config.elements

```json
{
  "name": "TabSection",
  "type": "TabSection",
  "label": "Reports",
  "style": ".css-1nti06h { padding: 24px 24px 24px 24px; }",
  "events": [],
  "elements": [
    {
      "name": "payeeReport",
      "type": "Table",
      "label": "Payee Level Report",
      "events": [
        {
          "body": [
            {"key": "reportName", "value": "payeeReport"}
          ],
          "path": "/HyperformMessage/process",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad"
        }
      ],
      "elements": [
        {"name": "dsa_code", "label": "Agent Code"},
        {"name": "dsa_name", "label": "Agent Name"},
        {"name": "branch_name", "label": "Branch"},
        {"name": "final_payout", "label": "Final Payout", "columnFormat": "amount"}
      ]
    },
    {
      "name": "transactionReport",
      "type": "Table",
      "label": "Transaction Report",
      "events": [
        {
          "body": [
            {"key": "reportName", "value": "transactionReport"}
          ],
          "path": "/HyperformMessage/process",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad"
        }
      ],
      "elements": [
        {"name": "transaction_id", "label": "Transaction ID"},
        {"name": "application_number", "label": "Application No."},
        {"name": "customer_name", "label": "Customer Name"},
        {"name": "disbursed_amount", "label": "Amount", "columnFormat": "amount"}
      ]
    }
  ],
  "sectionLabels": [
    {"label": "Payee Level Report"},
    {"label": "Transaction Report"}
  ],
  "verticalOrientation": "YES",
  "lazyLoad": "NO"
}
```

### uiSchema.elements

```json
{
  "type": "TabLayout",
  "scope": "#/properties/TabSection",
  "config": {
    "main": {
      "id": "TabSection",
      "layout": 12,
      "lazyLoad": false,
      "tabLabels": [
        "Payee Level Report",
        "Transaction Report"
      ]
    }
  },
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/payeeReport",
      "config": {
        "main": {
          "columns": {"dataColumns": [], "actionColumns": []},
          "Selection": false,
          "disableSorting": true,
          "downloadAllData": true,
          "disableColumnFilter": true,
          "disableDownloadFile": false
        }
      },
      "options": {"widget": "Table"},
      "elements": [
        {"size": 180, "header": "Agent Code", "accessorKey": "dsa_code"},
        {"size": 180, "header": "Agent Name", "accessorKey": "dsa_name"},
        {"size": 180, "header": "Branch", "accessorKey": "branch_name"},
        {"size": 180, "type": "amount", "header": "Final Payout", "accessorKey": "final_payout"}
      ]
    },
    {
      "type": "Control",
      "scope": "#/properties/transactionReport",
      "config": {
        "main": {
          "columns": {"dataColumns": [], "actionColumns": []},
          "Selection": false,
          "disableSorting": true,
          "downloadAllData": true,
          "disableColumnFilter": true,
          "disableDownloadFile": false
        }
      },
      "options": {"widget": "Table"},
      "elements": [
        {"size": 180, "header": "Transaction ID", "accessorKey": "transaction_id"},
        {"size": 180, "header": "Application No.", "accessorKey": "application_number"},
        {"size": 180, "header": "Customer Name", "accessorKey": "customer_name"},
        {"size": 180, "type": "amount", "header": "Amount", "accessorKey": "disbursed_amount"}
      ]
    }
  ]
}
```

### schema.properties

```json
{
  "payeeReport": {
    "type": "array",
    "items": {"type": "object", "properties": {}}
  },
  "transactionReport": {
    "type": "array",
    "items": {"type": "object", "properties": {}}
  }
}
```

---

## Key Configuration Points

| Property | Type | Purpose | Example |
|---|---|---|---|
| type (config) | TabSection | Tab container | "TabSection" |
| type (uiSchema) | TabLayout | Tab renderer | "TabLayout" |
| sectionLabels | Array | Tab names in config | [{"label": "Report 1"}] |
| tabLabels | Array | Tab names in uiSchema | ["Report 1", "Report 2"] |
| verticalOrientation | String | Vertical tabs? | "YES" or "NO" |
| lazyLoad | String | Load on demand? | "YES" or "NO" |
| style | String | Custom CSS | ".css-xxx { padding: 24px; }" |
| elements | Array | Nested components | Tables, Forms, etc. |

---

## Tab Orientation

### Horizontal Tabs
```json
"verticalOrientation": "NO"
```
```
┌─────────┬─────────┬─────────┐
│ Tab 1   │ Tab 2   │ Tab 3   │
├─────────────────────────────┤
│ Content                     │
└─────────────────────────────┘
```

### Vertical Tabs
```json
"verticalOrientation": "YES"
```
```
┌─────────┬───────────────────┐
│ Tab 1   │ Content           │
│ Tab 2   │ of selected tab   │
│ Tab 3   │                   │
└─────────┴───────────────────┘
```

---

## Lazy Loading

### lazyLoad: "NO" (All Load on Page Load)
- All tab content loads immediately
- Faster switching between tabs
- Heavier initial load

### lazyLoad: "YES" (Load on Demand)
- Tabs load content only when clicked
- Lighter initial load
- Slower tab switching

---

## Common Mistakes to Avoid

**Mistake 1:** Missing `type` on nested elements
```json
// WRONG
"elements": [{"name": "report1", "label": "Report 1"}]

// CORRECT
"elements": [{"name": "report1", "type": "Table", "label": "Report 1"}]
```

**Mistake 2:** Mismatched tab label count — `sectionLabels` count must equal `elements` count
```json
// WRONG - 2 labels, 1 element
"sectionLabels": [{"label": "Tab 1"}, {"label": "Tab 2"}],
"elements": [{"name": "report1", ...}]

// CORRECT - counts match
"sectionLabels": [{"label": "Tab 1"}, {"label": "Tab 2"}],
"elements": [{"name": "report1", ...}, {"name": "report2", ...}]
```

**Mistake 3:** `tabLabels` in uiSchema must match `sectionLabels` in config exactly (same strings, same order)

---

## Testing Checklist

- [ ] Tabs display correctly
- [ ] Can click to switch tabs
- [ ] Content loads in each tab
- [ ] Tables render properly
- [ ] Data loads from API
- [ ] Responsive on mobile
- [ ] Lazy loading works (if enabled)
- [ ] Custom styling applied
- [ ] Vertical/horizontal orientation correct

---

## Reference

**Based on:** page_builderPayoutReview  
**Widget:** TabLayout (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
