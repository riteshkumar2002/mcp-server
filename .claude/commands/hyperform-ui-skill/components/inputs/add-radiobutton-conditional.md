---
name: add-radiobutton-conditional
description: Add Radio Button with conditional field visibility to Hyperform pages. Use this skill whenever you need radio buttons that show/hide other fields dynamically — e.g. Filter Type (Date Range vs Program Cycle), View Mode, Report Type, or any toggle that changes what fields are visible.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Radio Button with Conditional Field Visibility

**Pattern Reference:** page_builderCaseReport  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add Radio Button with Conditional Fields

This skill teaches you to create radio buttons that toggle field visibility. Perfect for:
- Filter Type: Date Range vs Program Cycle
- View Mode: List vs Grid
- Report Type: Quick vs Advanced
- Any option that changes what fields users need

---

## Step 1: Add Radio Button to config.elements

```json
{
  "name": "filterType",
  "type": "Radio",
  "label": "Filter Type",
  "value": [],
  "sectionLabels": [
    {
      "label": "Program Cycle"
    },
    {
      "label": "Date Range"
    }
  ],
  "events": [
    {
      "eventType": "onChange",
      "Handler": "custom",
      "eventCode": "async (store) => {\n  const filterType = store?.newData?.filterType;\n  \n  if (filterType === \"Program Cycle\") {\n    store.setSchema((pre) => {\n      return {\n        ...pre,\n        properties: {\n          ...pre.properties,\n          startDate: { disabled: true },\n          endDate: { disabled: true },\n          programCycle: { disabled: false }\n        }\n      };\n    });\n    \n    store.setFormdata((prev) => {\n      return { \n        ...prev, \n        startDate: undefined, \n        endDate: undefined,\n        programId: undefined,\n        programCycle: undefined\n      };\n    });\n  }\n  \n  if (filterType === \"Date Range\") {\n    store.setSchema((pre) => {\n      return {\n        ...pre,\n        properties: {\n          ...pre.properties,\n          startDate: { disabled: false },\n          endDate: { disabled: false },\n          programCycle: { disabled: true }\n        }\n      };\n    });\n    \n    store.setFormdata((prev) => {\n      return { \n        ...prev, \n        startDate: undefined, \n        endDate: undefined,\n        programId: undefined,\n        programCycle: undefined \n      };\n    });\n  }\n};"
    }
  ],
  "layout": [
    {"key": "lg", "value": "8"},
    {"key": "md", "value": "8"},
    {"key": "sm", "value": "11"},
    {"key": "xs", "value": "12"}
  ]
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Step 2: Add Related Fields (Will be conditionally shown/hidden)

**Example: Date Fields (only visible for "Date Range")**

config.elements:
```json
{
  "name": "startDate",
  "type": "Date",
  "label": "Start Date",
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
},
{
  "name": "endDate",
  "type": "Date",
  "label": "End Date",
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

**Example: Program Cycle Field (only visible for "Program Cycle")**

config.elements:
```json
{
  "name": "programCycle",
  "type": "Select",
  "label": "Program Cycle",
  "events": [
    {
      "eventType": "onLoad",
      "Handler": "api",
      "method": "post",
      "path": "/page/getLOV",
      "body": [
        {"key": "type", "value": "programCycle"},
        {"key": "programId", "value": "$programId"},
        {"key": "userId", "value": "$userValue.userId"}
      ]
    }
  ],
  "layout": [
    {"key": "lg", "value": "4"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "5"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Key Configuration Points

| Property | Value | Purpose |
|---|---|---|
| `type` | `"Radio"` | Radio button field |
| `label` | String | Display label |
| `sectionLabels` | Array of `{label}` objects | Radio option labels |
| `errorMessage` | String | Validation error message |
| `toolTip` | String | Optional tooltip text |
| `toolTipPosition` | String | Optional tooltip position |
| `style` | JSON string | Optional inline style |
| `layout` | Array of `{key,value}` | Responsive grid (default: lg:3 md:4 sm:6 xs:12) |
| `eventType` | `"onChange"` | Trigger logic on selection |
| `store.setSchema` | Function | Enable/disable fields dynamically |
| `store.setFormdata` | Function | Clear field values on switch |

---

## How It Works - Visual Flow

```
User sees radio buttons:
┌─────────────────────────┐
│ Filter Type             │
│ ◯ Program Cycle         │
│ ◯ Date Range            │
└─────────────────────────┘

User selects "Program Cycle"
        ↓
onChange event triggered
        ↓
setSchema disables Date fields
          + enables Program Cycle
        ↓
setFormdata clears all values
        ↓
User sees updated form:
┌─────────────────────────┐
│ Filter Type             │
│ ◉ Program Cycle         │
│ ◯ Date Range            │
│ Program Cycle [dropdown]│
│ (Date fields hidden)    │
└─────────────────────────┘

User selects "Date Range"
        ↓
onChange event triggered
        ↓
setSchema enables Date fields
          + disables Program Cycle
        ↓
User sees updated form:
┌─────────────────────────┐
│ Filter Type             │
│ ◯ Program Cycle         │
│ ◉ Date Range            │
│ Start Date [picker]     │
│ End Date [picker]       │
│ (Program Cycle hidden)  │
└─────────────────────────┘
```

---

## The onChange Event Code (Explained)

```javascript
async (store) => {
  // Get the selected radio value
  const filterType = store?.newData?.filterType;
  
  // OPTION 1: "Program Cycle" selected
  if (filterType === "Program Cycle") {
    // Update schema to disable/enable fields
    store.setSchema((pre) => {
      return {
        ...pre,
        properties: {
          ...pre.properties,
          startDate: { disabled: true },    // Disable date fields
          endDate: { disabled: true },
          programCycle: { disabled: false }  // Enable cycle field
        }
      };
    });
    
    // Clear all values (fresh start)
    store.setFormdata((prev) => {
      return { 
        ...prev, 
        startDate: undefined, 
        endDate: undefined,
        programId: undefined,
        programCycle: undefined
      };
    });
  }
  
  // OPTION 2: "Date Range" selected
  if (filterType === "Date Range") {
    store.setSchema((pre) => {
      return {
        ...pre,
        properties: {
          ...pre.properties,
          startDate: { disabled: false },    // Enable date fields
          endDate: { disabled: false },
          programCycle: { disabled: true }   // Disable cycle field
        }
      };
    });
    
    // Clear all values
    store.setFormdata((prev) => {
      return { 
        ...prev, 
        startDate: undefined, 
        endDate: undefined,
        programId: undefined,
        programCycle: undefined 
      };
    });
  }
};
```

---

## Complete Working Example (page_builderCaseReport)

Here's the exact pattern from the reference page:

### config.elements (Report Filters Section)

```json
{
  "name": "Application Report",
  "type": "WrapperSection",
  "divider": "YES",
  "elements": [
    {
      "name": "filterType",
      "type": "Radio",
      "label": "Filter Type",
      "sectionLabels": [
        {"label": "Program Cycle"},
        {"label": "Date Range"}
      ],
      "events": [
        {
          "eventType": "onChange",
          "Handler": "custom",
          "eventCode": "... (see above code)"
        }
      ]
    },
    {
      "name": "programId",
      "type": "Select",
      "label": "Program Type"
    },
    {
      "name": "startDate",
      "type": "Date",
      "label": "Start Date"
    },
    {
      "name": "endDate",
      "type": "Date",
      "label": "End Date"
    },
    {
      "name": "programCycle",
      "type": "Select",
      "label": "Program Cycle"
    },
    {
      "name": "search",
      "type": "Button",
      "label": "Search"
    },
    {
      "name": "builderApplicationReport",
      "type": "Table",
      "label": "Application Report"
    }
  ]
}
```

---

## Use Cases

### Use Case 1: Filter Type Toggle
```
Filter by:
◯ Date Range (shows: Start Date, End Date)
◯ Program Cycle (shows: Program, Cycle)
```

### Use Case 2: View Mode Toggle
```
View:
◯ List View (shows: Table columns for list)
◯ Summary View (shows: Summary cards)
```

### Use Case 3: Report Type Toggle
```
Report:
◯ Quick Report (shows: Common filters only)
◯ Advanced Report (shows: All filters)
```

### Use Case 4: Search By Toggle
```
Search by:
◯ Customer ID (shows: ID field)
◯ Customer Name (shows: Name field)
```

---

## Common Mistakes to Avoid

**Mistake 1:** Forget to clear field values
```javascript
// WRONG - Values still exist but hidden
store.setSchema(...);
// Missing: store.setFormdata(...);

// RIGHT - Clear values when switching
store.setSchema(...);
store.setFormdata((prev) => ({ ...prev, field1: undefined, ... }));
```

**Mistake 2:** Wrong field name in setSchema
```javascript
// WRONG - Typo in property name causes silent failure
startDat: { disabled: true }

// RIGHT - Match exact config.elements names
startDate: { disabled: true }
```

**Mistake 3:** Forget onChange event
```json
// WRONG - No onChange handler
{ "name": "filterType", "type": "Radio" }

// RIGHT - Include onChange
{
  "name": "filterType",
  "type": "Radio",
  "events": [{ "eventType": "onChange", "Handler": "custom", "eventCode": "..." }]
}
```

---

## Testing Checklist

- [ ] Radio buttons display correctly
- [ ] Can click radio options
- [ ] onChange event triggers
- [ ] Correct fields hide when switched
- [ ] Correct fields show when switched
- [ ] Field values clear on switch
- [ ] Disabled fields appear grayed out
- [ ] Can fill enabled fields
- [ ] Can submit form
- [ ] Works on mobile
- [ ] Works on desktop

---

## Key Points to Remember

1. **Radio Button:** `type: "Radio"` in config
2. **Options:** Define in `sectionLabels` array (each entry: `{"label": "..."}`)
3. **onChange Event:** Trigger logic on selection change
4. **setSchema:** Enable/disable fields dynamically at runtime
5. **setFormdata:** Clear values when switching options
6. **uiSchema/schema:** Auto-derived — never build manually

---

## Reference

**Based on:** page_builderCaseReport  
**Widget:** RadioInputField (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
