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

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/filterType",
  "config": {
    "main": {
      "label": "Filter Type",
      "options": [
        "Program Cycle",
        "Date Range"
      ],
      "errorMessage": "Please select a filter type"
    },
    "layout": {
      "lg": 8,
      "md": 8,
      "sm": 11,
      "xs": 12
    }
  },
  "options": {
    "widget": "RadioInputField"
  }
}
```

---

## Step 3: Add Related Fields (Will be conditionally shown/hidden)

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

## Step 4: Add to schema.properties

```json
{
  "filterType": {},
  "startDate": {},
  "endDate": {},
  "programCycle": {}
}
```

---

## Key Configuration Points

| Property | Value | Purpose |
|---|---|---|
| type (config) | Radio | Radio button field |
| widget (uiSchema) | RadioInputField | Radio widget |
| sectionLabels | Array of labels | Option labels |
| eventType | onChange | Trigger on selection |
| disabled: true | In schema | Hide field (grayed out) |
| disabled: false | In schema | Show field (active) |
| store.setSchema | Function | Enable/disable fields |
| store.setFormdata | Function | Clear field values |

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

### uiSchema.elements

```json
{
  "type": "WrapperLayout",
  "scope": "#/properties/Application Report",
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/filterType",
      "config": {
        "main": {
          "label": "Filter Type",
          "options": ["Program Cycle", "Date Range"]
        },
        "layout": {
          "lg": 8, "md": 8, "sm": 11, "xs": 12
        }
      },
      "options": {"widget": "RadioInputField"}
    },
    {
      "type": "Control",
      "scope": "#/properties/programId",
      "config": {
        "main": {
          "type": "text",
          "label": "Program Type",
          "freeSole": false
        },
        "layout": {"lg": 4, "md": 4, "sm": 5, "xs": 12}
      },
      "options": {"widget": "SelectInputField"}
    },
    {
      "type": "Control",
      "scope": "#/properties/startDate",
      "config": {
        "main": {
          "type": "date",
          "label": "Start Date"
        },
        "layout": {"lg": 4, "md": 4, "sm": 5, "xs": 12}
      },
      "options": {"widget": "DateInputField"}
    },
    {
      "type": "Control",
      "scope": "#/properties/endDate",
      "config": {
        "main": {
          "type": "date",
          "label": "End Date"
        },
        "layout": {"lg": 4, "md": 4, "sm": 5, "xs": 12}
      },
      "options": {"widget": "DateInputField"}
    },
    {
      "type": "Control",
      "scope": "#/properties/programCycle",
      "config": {
        "main": {
          "type": "text",
          "label": "Program Cycle",
          "freeSole": false
        },
        "layout": {"lg": 4, "md": 4, "sm": 5, "xs": 12}
      },
      "options": {"widget": "SelectInputField"}
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
2. **Widget:** `RadioInputField` in uiSchema
3. **onChange Event:** Trigger logic on selection
4. **setSchema:** Enable/disable fields dynamically
5. **setFormdata:** Clear values when switching
6. **Options:** Define in `sectionLabels` array

---

## Reference

**Based on:** page_builderCaseReport  
**Widget:** RadioInputField (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
