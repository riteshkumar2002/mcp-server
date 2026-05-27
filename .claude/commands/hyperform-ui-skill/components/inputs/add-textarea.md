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

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/body",
  "config": {
    "main": {
      "heading": "Body",
      "minRows": 4,
      "hideButton": true
    },
    "style": {
      "textAreaStyle": {
        "color": "black",
        "padding": "20px",
        "background": "white",
        "borderRadius": "20px"
      },
      "containerStyle": {
        "borderRadius": "20px"
      },
      "headerContainerStyle": {}
    },
    "layout": {
      "lg": 12,
      "md": 10,
      "sm": 12,
      "xs": 12
    }
  },
  "options": {
    "widget": "TextArea"
  }
}
```

---

## Step 3: Add to schema.properties

```json
{
  "body": {
    "type": "string",
    "minLength": 10
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "TextArea" | "TextArea" |
| widget (uiSchema) | Must be "TextArea" | "TextArea" |
| heading | Label shown above text area | "Message Body" |
| minRows | Minimum visible rows | 4 |
| hideButton | Hide border/styling button | true |
| placeholder | Hint text inside field | "Enter your message..." |

---

## Height Options

### Short (2 rows)
```json
"minRows": 2
```

### Medium (4 rows)
```json
"minRows": 4
```

### Long (8 rows)
```json
"minRows": 8
```

### Fixed pixel height
```json
"textAreaStyle": {
  "minHeight": "300px",
  "maxHeight": "600px"
}
```

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

## Styling Options

### textAreaStyle
```json
"textAreaStyle": {
  "color": "black",
  "padding": "20px",
  "background": "white",
  "borderRadius": "20px",
  "fontSize": "14px",
  "fontFamily": "Poppins",
  "minHeight": "200px",
  "border": "1px solid #ccc",
  "lineHeight": "1.5"
}
```

### containerStyle
```json
"containerStyle": {
  "borderRadius": "20px",
  "boxShadow": "0 2px 4px rgba(0,0,0,0.1)"
}
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

### uiSchema.elements

```json
{
  "type": "WrapperLayout",
  "scope": "#/properties/emailContent",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/subject",
      "config": {
        "main": {"label": "Subject"},
        "layout": {"lg": 12, "md": 12, "sm": 12, "xs": 12}
      },
      "options": {"widget": "InputField"}
    },
    {
      "type": "Control",
      "scope": "#/properties/body",
      "config": {
        "main": {
          "heading": "Message Body",
          "minRows": 6,
          "hideButton": true
        },
        "style": {
          "textAreaStyle": {
            "color": "black",
            "padding": "20px",
            "background": "#f5f5f5",
            "borderRadius": "8px",
            "fontSize": "14px"
          }
        },
        "layout": {"lg": 12, "md": 12, "sm": 12, "xs": 12}
      },
      "options": {"widget": "TextArea"}
    }
  ]
}
```

### schema.properties

```json
{
  "subject": {"type": "string", "minLength": 1},
  "body": {"type": "string", "minLength": 10}
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
