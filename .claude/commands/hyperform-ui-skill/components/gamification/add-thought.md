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

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

Call `update_page(pageName, config, userId)` and both `uiSchema` and `schema` are built automatically from your config. Never construct or pass them manually.

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


> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| `name` | Unique field name | `"thought"` |
| `type` | Must be `"Thought"` | `"Thought"` |
| `thought` | The quote/motivational text to display | `"Excellence is not a destination..."` |
| `label` | Title or attribution line | `"Thought of the Day"` |
| `style` | JSON string for custom styles | `"{\"color\": \"#333\"}"` |
| `layout` | Responsive grid sizing (usually full-width) | lg: 12, xs: 12 |
| `events` | `[]` for static, or `onLoad` custom event for dynamic message | always required |

---

## Complete Example: Contest Dashboard Thought

```json
{
  "name": "thought",
  "type": "Thought",
  "style": "",
  "thought": "Just one small positive thought in the morning can change your whole day.",
  "label": "Thought of the Day",
  "events": [],
  "layout": [
    {"key": "xs", "value": "12"},
    {"key": "sm", "value": "12"},
    {"key": "md", "value": "12"},
    {"key": "lg", "value": "12"}
  ]
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

**Mistake 1:** Wrong `type` name — must be `"Thought"`, not `"ThoughtBanner"` or `"thought"`.

**Mistake 2:** Setting `thought` to a very long string without testing text overflow — always check rendering at the target screen size.

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
