---
name: add-textarea
description: Add TextArea (multi-line text input) fields to Hyperform pages. Use this skill whenever you need multi-line text input — email body, descriptions, comments, notes, or message content. Covers config type "TextArea", uiSchema widget "TextArea", minRows, hideButton, textAreaStyle, validation (required/minLength/maxLength), and dynamic disable/clear patterns.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add TextArea Component

**Pattern Reference:** page_notificationLogView  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add TextArea to Your Page

TextArea Component displays multi-line text input for longer content. Perfect for:
- Email body content
- Description/comments
- Notes fields
- Message input
- Summary/narrative sections

---

## Step 1: Add to config.elements

### Basic TextArea

```json
{
  "name": "body",
  "type": "TextArea",
  "label": "Body",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "10"},
    {"key": "lg", "value": "12"}
  ]
}
```

### TextArea with Validation

```json
{
  "name": "body",
  "type": "TextArea",
  "label": "Message Body",
  "events": [],
  "validation": [
    {"validationType": "required", "validationValue": "true"},
    {"validationType": "minLength", "validationValue": "10"},
    {"validationType": "maxLength", "validationValue": "5000"}
  ]
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field key | `"body"` |
| `type` | Must be `"TextArea"` | `"TextArea"` |
| `label` | Heading shown above the text area | `"Message Body"` |
| `placeholder` | Hint text inside the field | `"Enter your message..."` |
| `enableCodeEditor` | Show code editor mode | `"YES"` or `"NO"` |
| `codeEditorLanguage` | Language for code editor | `"javascript"` |
| `style` | JSON string for inline styles | `"{}"` |
| `layout` | Array of `{key,value}` for responsive grid | Default: full-width (lg:12) |

---

## Layout Options

### Full Width
```json
"layout": {"lg": 12, "md": 12, "sm": 12, "xs": 12}
```

### 2/3 Width
```json
"layout": {"lg": 8, "md": 8, "sm": 12, "xs": 12}
```

### Half Width
```json
"layout": {"lg": 6, "md": 6, "sm": 12, "xs": 12}
```

---

## Complete Example: Email Message Form

### config.elements

```json
{
  "name": "emailContent",
  "type": "WrapperSection",
  "label": "Email Content",
  "elements": [
    {
      "name": "subject",
      "type": "Text",
      "label": "Subject",
      "validation": [
        {"validationType": "required", "validationValue": "true"}
      ]
    },
    {
      "name": "body",
      "type": "TextArea",
      "label": "Message Body",
      "layout": [
        {"key": "lg", "value": "12"},
        {"key": "md", "value": "12"},
        {"key": "sm", "value": "12"},
        {"key": "xs", "value": "12"}
      ],
      "validation": [
        {"validationType": "required", "validationValue": "true"},
        {"validationType": "minLength", "validationValue": "10"}
      ]
    }
  ]
}
```

---

## Validation Rules

### Required
```json
{"validationType": "required", "validationValue": "true"}
```

### Length Restrictions
```json
{"validationType": "minLength", "validationValue": "10"},
{"validationType": "maxLength", "validationValue": "5000"}
```

### Pattern Matching
```json
{"validationType": "pattern", "validationValue": "^[a-zA-Z0-9\\s]*$"}
```

---

## Dynamic Disable/Enable

```javascript
store.setSchema(pre => ({
  ...pre,
  properties: {
    ...pre.properties,
    body: { ...pre.properties.body, disabled: true }
  }
}));
```

## Clear on Event

```javascript
store.setFormdata(prev => ({ ...prev, body: "" }));
```

---

## Common Patterns

### Notification Message Editor
```json
{
  "name": "messageBody",
  "type": "TextArea",
  "label": "Message",
  "layout": [
    {"key": "lg", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ],
  "validation": [
    {"validationType": "required", "validationValue": "true"},
    {"validationType": "minLength", "validationValue": "5"}
  ]
}
```

### Report Description
```json
{
  "name": "description",
  "type": "TextArea",
  "label": "Report Description",
  "layout": [
    {"key": "lg", "value": "8"},
    {"key": "md", "value": "8"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

### Comments Section
```json
{
  "name": "comments",
  "type": "TextArea",
  "label": "Comments",
  "layout": [
    {"key": "lg", "value": "6"},
    {"key": "md", "value": "6"},
    {"key": "sm", "value": "12"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Testing Checklist

- [ ] TextArea displays at correct size
- [ ] Placeholder text shows before input
- [ ] Text wraps properly
- [ ] Rows expand/scroll as needed
- [ ] Validation messages appear
- [ ] Required field enforced
- [ ] Disabled state works
- [ ] Data saves to store
- [ ] Responsive on mobile
- [ ] Custom styling applied

---

## Reference

**Based on:** page_notificationLogView  
**Widget:** TextArea (Multi-line text input)  
**Version:** 1.0  
**Status:** Production Ready
