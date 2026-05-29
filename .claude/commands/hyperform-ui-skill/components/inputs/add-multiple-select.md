---
name: add-multiple-select
description: Add MultipleSelect fields to Hyperform pages. Use this skill whenever you need multi-value selection — email recipients (To/CC/BCC), team member assignment, role/permission selection, tags, or any field where users pick more than one value. Covers freeSolo, lazyLoading, variant, LOV via onLoad, validation (required/minLength/maxLength), and programmatic set/clear patterns.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add MultipleSelect Component

**Pattern Reference:** page_notificationLogView  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add MultipleSelect to Your Page

MultipleSelect Component allows users to select multiple values from a list. Perfect for:
- Multiple email recipients (To, CC, BCC)
- Team member selection
- Role/permission assignment
- Tag selection
- Category selection

---

## Step 1: Add to config.elements

### Basic MultipleSelect

```json
{
  "name": "toList",
  "type": "MultipleSelect",
  "label": "To",
  "value": [],
  "events": [
    {
      "body": [
        {"key": "type", "value": "getEmails"},
        {"key": "pageSize", "value": "100"}
      ],
      "path": "/page/getLOV",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "variant": "outlined",
  "freeSolo": "YES",
  "lazyLoading": "YES"
}
```

### With Validation

```json
{
  "name": "toList",
  "type": "MultipleSelect",
  "label": "Recipients",
  "value": [],
  "events": [
    {
      "body": [{"key": "type", "value": "getEmails"}],
      "path": "/page/getLOV",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "variant": "outlined",
  "freeSolo": "YES",
  "validation": [
    {"validationType": "required", "validationValue": "true"}
  ]
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field key | `"toList"` |
| `type` | Must be `"MultipleSelect"` | `"MultipleSelect"` |
| `label` | Display label | `"To"` |
| `value` | Static options or initial value | `[]` or `[{label, value}]` |
| `variant` | Input style | `"outlined"` or `"filled"` |
| `freeSolo` | Allow custom typed values | `"YES"` or `"NO"` |
| `lazyLoading` | Load options on demand | `"YES"` or `"NO"` |
| `toolTip` | Optional tooltip text | `"Select recipients"` |
| `toolTipPosition` | Optional tooltip position | `"top"` |
| `style` | JSON string for inline styles | `"{}"` |
| `layout` | Array of `{key,value}` | Default: lg:3 md:4 sm:6 xs:6 |

---

## freeSolo Explained

### freeSolo: "YES" — Allow Custom Entries
User can type any value not in the list (e.g. any email address). Use for open-ended inputs like email, tags.

### freeSolo: "NO" — Restrict to List Only
User must pick from predefined options. Use for roles, permissions, fixed categories.

---

## Lazy Loading

### With Lazy Loading (large lists)
```json
"lazyLoading": "YES"
```

### Without Lazy Loading (small lists)
```json
"lazyLoading": "NO"
```

---

## Complete Example: Email Recipients (To / CC / BCC)

### config.elements

```json
[
  {
    "name": "toList",
    "type": "MultipleSelect",
    "label": "To",
    "value": [],
    "events": [
      {
        "body": [
          {"key": "type", "value": "getEmailsLazy"},
          {"key": "pageSize", "value": "100"}
        ],
        "path": "/page/getLOV",
        "method": "post",
        "Handler": "api",
        "apiBody": "(store, dynamicData, user, body) => {\n  return {...body}\n}",
        "eventType": "onLoad"
      }
    ],
    "variant": "outlined",
    "freeSolo": "YES",
    "lazyLoading": "YES",
    "validation": [
      {"validationType": "required", "validationValue": "true"}
    ]
  },
  {
    "name": "ccList",
    "type": "MultipleSelect",
    "label": "Cc",
    "value": [],
    "events": [
      {
        "body": [
          {"key": "type", "value": "getEmailsLazy"},
          {"key": "pageSize", "value": "100"}
        ],
        "path": "/page/getLOV",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "variant": "outlined",
    "freeSolo": "YES",
    "lazyLoading": "YES"
  },
  {
    "name": "bccList",
    "type": "MultipleSelect",
    "label": "Bcc",
    "value": [],
    "events": [
      {
        "body": [
          {"key": "type", "value": "getEmailsLazy"},
          {"key": "pageSize", "value": "100"}
        ],
        "path": "/page/getLOV",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "variant": "outlined",
    "freeSolo": "YES",
    "lazyLoading": "YES"
  }
]
```

---

## Common Use-Case Patterns

### Email Recipients
```json
{"name": "recipients", "type": "MultipleSelect", "freeSolo": "YES", ...}
```

### Team Members (from LOV, no custom)
```json
{"name": "teamMembers", "type": "MultipleSelect", "freeSolo": "NO", ...}
```

### Tags (custom allowed)
```json
{"name": "tags", "type": "MultipleSelect", "freeSolo": "YES", ...}
```

### Permissions (fixed list)
```json
{
  "name": "permissions",
  "type": "MultipleSelect",
  "freeSolo": "NO",
  "validation": [{"validationType": "required", "validationValue": "true"}]
}
```

---

## Validation Rules

### Required (at least one selection)
```json
{"validationType": "required", "validationValue": "true"}
```

### Minimum Selections
```json
{"validationType": "minLength", "validationValue": "2"}
```

### Maximum Selections
```json
{"validationType": "maxLength", "validationValue": "5"}
```

---

## Programmatic Control

### Set Values
```javascript
store.setFormdata(prev => ({
  ...prev,
  toList: ["john@example.com", "jane@example.com"]
}));
```

### Add a Value
```javascript
const current = store.ctx.core.data.toList || [];
store.setFormdata(prev => ({
  ...prev,
  toList: [...current, "newperson@example.com"]
}));
```

### Clear All
```javascript
store.setFormdata(prev => ({ ...prev, toList: [] }));
```

### Read Values
```javascript
const selected = store.ctx.core.data.toList;
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong initial value — must be `[]` (empty array), not `""` or `null`.
```json
// WRONG
"value": ""

// CORRECT
"value": []
```

**Mistake 2:** `freeSolo` and `lazyLoading` in config must be strings (`"YES"`/`"NO"`), not booleans.
```json
// WRONG
"freeSolo": true,
"lazyLoading": true

// CORRECT
"freeSolo": "YES",
"lazyLoading": "YES"
```

---

## Testing Checklist

- [ ] MultipleSelect displays
- [ ] Options load from API
- [ ] Can select single value
- [ ] Can select multiple values
- [ ] Can remove individual selections
- [ ] freeSolo allows custom entry (if enabled)
- [ ] Validation works
- [ ] Data saves as array in store
- [ ] Lazy loading works (if enabled)
- [ ] Responsive on mobile

---

## Reference

**Based on:** page_notificationLogView  
**Widget:** MultipleSelect  
**Version:** 1.0  
**Status:** Production Ready
