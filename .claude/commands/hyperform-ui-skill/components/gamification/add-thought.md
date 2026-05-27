---
name: add-thought
description: Add Thought components to Hyperform pages. Use this skill whenever you need a motivational message, inspirational quote, or daily thought banner — dashboard headers, contest encouragement, team motivation, or performance-based messages. Covers config type "Thought", thought text property, uiSchema widget "Thought", static messages, and dynamic thought generation via onLoad custom events.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Thought Component

**Pattern Reference:** page_ContestDashboard1  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add Thought to Your Page

The Thought Component displays inspirational quotes, motivational messages, or daily thoughts. Perfect for:
- Inspirational messages at top of dashboard
- Motivational quotes for employees
- Daily affirmations/tips
- Contest encouragement messages
- Performance-based motivational banners

---

## Step 1: Add to config.elements

```json
{
  "name": "thought",
  "type": "Thought",
  "style": "",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ],
  "thought": "Just one small positive thought in the morning can change your whole day."
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/thought",
  "config": {
    "main": {
      "thought": "Just one small positive thought in the morning can change your whole day."
    },
    "layout": {
      "xs": 12,
      "sm": 12,
      "md": 12,
      "lg": 12
    }
  },
  "options": {
    "widget": "Thought"
  }
}
```

---

## Step 3: schema.properties

```json
{
  "thought": {
    "type": "string"
  }
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "Thought" | "Thought" |
| widget (uiSchema) | Must be "Thought" | "Thought" |
| thought (config) | Static message text | "Excellence is not a destination..." |
| thought (uiSchema main) | Must match config thought value | same string |
| layout | Responsive grid sizing (usually full-width) | lg: 12, xs: 12 |
| style | Optional CSS-in-JSON string | `"{\"color\": \"#333\"}"` |

---

## Complete Example: Contest Dashboard Thought

### config.elements

```json
{
  "name": "thought",
  "type": "Thought",
  "style": "",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ],
  "thought": "Just one small positive thought in the morning can change your whole day."
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/thought",
  "config": {
    "main": {
      "thought": "Just one small positive thought in the morning can change your whole day."
    },
    "layout": {
      "xs": 12,
      "sm": 12,
      "md": 12,
      "lg": 12
    }
  },
  "options": {
    "widget": "Thought"
  }
}
```

---

## Dynamic Thought Messages

### Random thought on load

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  const thoughts = [\n    'Great work today! Keep it up.',\n    'Every policy brings you closer to your goal.',\n    'Consistency is the key to success.',\n    'Your effort today shapes tomorrow\\'s results.'\n  ];\n  const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];\n  store.setFormdata((prev) => ({\n    ...prev,\n    thought: randomThought\n  }));\n}",
  "eventType": "onLoad"
}
```

### Performance-based thought

```json
{
  "Handler": "custom",
  "eventCode": "async (store, dynamicData, userValue) => {\n  const achievement = store.ctx.core.data.overAllAchivement || 0;\n  let thought = '';\n  if (achievement >= 100) {\n    thought = 'Outstanding! You\\'ve exceeded all targets. You\\'re a superstar!';\n  } else if (achievement >= 80) {\n    thought = 'Excellent progress! You\\'re very close to your goal. Keep going!';\n  } else if (achievement >= 50) {\n    thought = 'You\\'re on the right track! Push a bit more to reach your target.';\n  } else {\n    thought = 'Every step counts. Keep working hard, success is within reach!';\n  }\n  store.setFormdata((prev) => ({ ...prev, thought }));\n}",
  "eventType": "onLoad"
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong widget name
```json
// WRONG
"widget": "ThoughtBanner"

// CORRECT
"widget": "Thought"
```

**Mistake 2:** Setting `thought` text only in config but not in uiSchema `config.main` — both must have the `thought` property for static messages to render.

**Mistake 3:** Forgetting `"events": []` on the config element — even when there are no events, the array must be present.

---

## Testing Checklist

- [ ] Thought displays correctly on all screen sizes
- [ ] Message is readable and clear
- [ ] Layout spans correctly (full width)
- [ ] Text is centered
- [ ] Message updates when formdata changes (if using dynamic logic)
- [ ] No text overflow on long messages

---

## Reference

**Based on:** page_ContestDashboard1  
**Widget:** Thought  
**Version:** 1.0  
**Status:** Production Ready
