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

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/toList",
  "config": {
    "main": {
      "type": "text",
      "label": "To",
      "options": [],
      "variant": "outlined",
      "multiple": true,
      "lazyLoading": true
    },
    "layout": {
      "lg": 3,
      "md": 4,
      "sm": 6,
      "xs": 6
    }
  },
  "options": {
    "widget": "MultipleSelect"
  }
}
```

---

## Step 3: Add to schema.properties

```json
"toList": {
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | "MultipleSelect" | "MultipleSelect" |
| widget (uiSchema) | "MultipleSelect" | "MultipleSelect" |
| value | Initial value | [] |
| variant | Input style | "outlined" or "filled" |
| multiple | Always true in uiSchema | true |
| freeSolo | Allow custom typed values | "YES" or "NO" |
| lazyLoading | Load options on demand | "YES" or "NO" |

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
"lazyLoading": "YES"  // config
"lazyLoading": true   // uiSchema
```

### Without Lazy Loading (small lists)
```json
"lazyLoading": "NO"   // config
"lazyLoading": false  // uiSchema
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

### uiSchema.elements

```json
[
  {
    "type": "Control",
    "scope": "#/properties/toList",
    "config": {
      "main": {
        "type": "text",
        "label": "To",
        "options": [],
        "variant": "outlined",
        "multiple": true,
        "lazyLoading": true
      },
      "layout": {"lg": 3, "md": 4, "sm": 6, "xs": 6}
    },
    "options": {"widget": "MultipleSelect"}
  },
  {
    "type": "Control",
    "scope": "#/properties/ccList",
    "config": {
      "main": {
        "type": "text",
        "label": "Cc",
        "options": [],
        "variant": "outlined",
        "multiple": true,
        "lazyLoading": true
      },
      "layout": {"lg": 3, "md": 4, "sm": 6, "xs": 6}
    },
    "options": {"widget": "MultipleSelect"}
  },
  {
    "type": "Control",
    "scope": "#/properties/bccList",
    "config": {
      "main": {
        "type": "text",
        "label": "Bcc",
        "options": [],
        "variant": "outlined",
        "multiple": true,
        "lazyLoading": true
      },
      "layout": {"lg": 3, "md": 4, "sm": 6, "xs": 6}
    },
    "options": {"widget": "MultipleSelect"}
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

**Mistake 1:** Missing `"multiple": true` in uiSchema `config.main` — without it the widget behaves as single-select.

**Mistake 2:** Wrong initial value — must be `[]` (empty array), not `""` or `null`.
```json
// WRONG
"value": ""

// CORRECT
"value": []
```

**Mistake 3:** Schema type must be `"array"` not `"string"`
```json
// WRONG
"toList": {"type": "string"}

// CORRECT
"toList": {"type": "array", "items": {"type": "string"}}
```

**Mistake 4:** `freeSolo` in config is a string (`"YES"`/`"NO"`), but `lazyLoading` in uiSchema is a boolean (`true`/`false`).

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
