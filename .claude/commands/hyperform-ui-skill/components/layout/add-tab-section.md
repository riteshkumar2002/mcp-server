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

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

This skill contains **config-only** examples. Never construct or edit uiSchema or schema by hand.

---

## How to Add Tab Section to Your Page

Tab Section (TabLayout) organizes content into tabs. Perfect for:
- Multiple reports in tabs
- Different views of same data
- Organizing related sections
- Cleaner page layouts

---

## Add to config.elements

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
  "orientation": "YES",
  "lazyLoad": "NO"
}
```

---

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Complete Example: Multiple Tabs with Tables

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
  "orientation": "YES",
  "lazyLoad": "NO"
}
```

---

## Key Configuration Points

| Property | Type | Purpose | Example |
|---|---|---|---|
| type | TabSection | Tab container | `"TabSection"` |
| sectionLabels | Array | Tab names | `[{"label": "Report 1"}]` |
| orientation | String | Vertical tabs? | `"YES"` = vertical, `"NO"` = horizontal |
| lazyLoad | String | Load on demand? | `"YES"` or `"NO"` |
| style | String | Custom CSS | `".css-xxx { padding: 24px; }"` |
| elements | Array | Nested components | Tables, Forms, etc. |

---

## Tab Orientation

### Horizontal Tabs
```json
"orientation": "NO"
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
"orientation": "YES"
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

**Mistake 3:** Using `orientation: "YES"` when you want horizontal tabs — `"YES"` means **vertical**. Use `"NO"` for the default horizontal tab bar.

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
