---
name: add-icon-button
description: Add Icon Buttons to Hyperform pages. Use this skill whenever you need compact icon-only action buttons — in table row columns (View, Edit, Delete) or table header (Add, Download, Export). Covers iconName, buttonType, elementType, color, tooltipMessage, and placement in uiSchema headerIcons vs column elements.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Icon Button

**Pattern Reference:** page_NotificationLogs  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add Icon Button to Your Page

Icon Button displays only an icon with optional tooltip. Perfect for:
- Table action buttons (View, Edit, Delete)
- Table header buttons (Add, Download, Export)
- Compact button bars
- Icon-only actions

---

## Step 1: Add to config.elements (In Table)

### Icon Button in Table Column

```json
{
  "name": "viewBtn",
  "type": "Button",
  "color": "primary",
  "label": "View",
  "events": [
    {
      "eventType": "onClick",
      "Handler": "custom",
      "eventCode": "async(store, dynamic, user, body) => {\n  const rowId = dynamic?.rowData.id;\n  store.navigate(`/Template-1/page_view?id=${rowId}`);\n}"
    }
  ],
  "iconName": "ViewIcon",
  "buttonType": "IconButton",
  "defaultStyle": "true",
  "enableFilter": "No"
}
```

### Icon Button in Table Header

```json
{
  "name": "addBtn",
  "type": "Button",
  "label": "Add",
  "events": [
    {
      "eventType": "onClick",
      "Handler": "custom",
      "eventCode": "async(store) => { store.navigate(\"/Template-1/page_create\") }"
    }
  ],
  "iconName": "TableAddIcon",
  "buttonType": "IconButton",
  "elementType": "tableHeader",
  "defaultStyle": "false",
  "tooltipMessage": "Add New Record"
}
```

---

## Step 2: Add to uiSchema.elements

### Icon Button in Table Column

```json
{
  "size": 180,
  "header": "View",
  "widget": {
    "type": "Control",
    "scope": "#/properties/viewBtn",
    "config": {
      "main": {
        "icon": "ViewIcon",
        "name": "View",
        "size": "small",
        "type": "text",
        "color": "primary",
        "onClick": "onClick",
        "variant": "contained",
        "startIcon": "",
        "styleDefault": true
      },
      "style": {},
      "layout": {
        "lg": 1.5,
        "md": 2,
        "sm": 2.5,
        "xs": 4
      }
    },
    "options": {
      "widget": "IconButton"
    }
  },
  "accessorKey": "viewBtn",
  "enableSorting": true,
  "enableColumnFilter": false
}
```

### Icon Button in Table Header (via headerIcons)

```json
{
  "widget": {
    "type": "Control",
    "scope": "#/properties/addBtn",
    "config": {
      "main": {
        "icon": "TableAddIcon",
        "name": "Add",
        "size": "small",
        "type": "text",
        "onClick": "onClick",
        "variant": "contained",
        "startIcon": "",
        "styleDefault": false,
        "tooltipMessage": "Add New Record"
      },
      "style": {},
      "layout": {
        "lg": 1.5,
        "md": 2,
        "sm": 2.5,
        "xs": 4
      }
    },
    "options": {
      "widget": "IconButton"
    }
  }
}
```

Header icons go inside `config.main.headerIcons.elements` on the Table uiSchema entry:

```json
{
  "type": "Control",
  "scope": "#/properties/logsTable",
  "config": {
    "main": {
      "columns": {"dataColumns": [], "actionColumns": []},
      "headerIcons": {
        "elements": [
          {
            "widget": {
              "type": "Control",
              "scope": "#/properties/addBtn",
              "options": {"widget": "IconButton"}
            }
          },
          {
            "widget": {
              "type": "Control",
              "scope": "#/properties/downloadBtn",
              "options": {"widget": "IconButton"}
            }
          }
        ]
      }
    }
  },
  "options": {"widget": "Table"}
}
```

---

## Step 3: Add to schema.properties

```json
{
  "viewBtn": {},
  "addBtn": {},
  "downloadBtn": {}
}
```

---

## Complete Example: Table with Action Buttons

### config.elements

```json
{
  "name": "logsTable",
  "type": "Table",
  "events": [
    {
      "body": [],
      "path": "/api/getLogs",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "elements": [
    {"name": "name", "label": "Name"},
    {"name": "status", "label": "Status"},
    {
      "name": "viewBtn",
      "type": "Button",
      "label": "View",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store, dynamic) => {\n  store.navigate(`/page_detail?id=${dynamic.rowData.id}`);\n}"
        }
      ],
      "iconName": "ViewIcon",
      "buttonType": "IconButton",
      "defaultStyle": "true"
    },
    {
      "name": "deleteBtn",
      "type": "Button",
      "label": "Delete",
      "color": "error",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store, dynamic) => {\n  if (confirm('Delete this record?')) {\n    store.navigate(`/api/delete/${dynamic.rowData.id}`);\n  }\n}"
        }
      ],
      "iconName": "DeleteIcon",
      "buttonType": "IconButton",
      "defaultStyle": "true"
    },
    {
      "name": "addBtn",
      "type": "Button",
      "label": "Add",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "custom",
          "eventCode": "async(store) => { store.navigate('/page_create'); }"
        }
      ],
      "iconName": "TableAddIcon",
      "buttonType": "IconButton",
      "elementType": "tableHeader",
      "defaultStyle": "false",
      "tooltipMessage": "Add New Record"
    },
    {
      "name": "downloadBtn",
      "type": "Button",
      "label": "Download",
      "events": [
        {
          "eventType": "onClick",
          "Handler": "api",
          "path": "/api/downloadLogs",
          "method": "post"
        }
      ],
      "iconName": "TableDownloadIcon",
      "buttonType": "IconButton",
      "elementType": "tableHeader",
      "tooltipMessage": "Download Data"
    }
  ]
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/logsTable",
  "config": {
    "main": {
      "columns": {"dataColumns": [], "actionColumns": []},
      "lazyLoading": true,
      "disableSorting": true,
      "downloadAllData": false,
      "headerIcons": {
        "elements": [
          {
            "widget": {
              "type": "Control",
              "scope": "#/properties/addBtn",
              "options": {"widget": "IconButton"}
            }
          },
          {
            "widget": {
              "type": "Control",
              "scope": "#/properties/downloadBtn",
              "options": {"widget": "IconButton"}
            }
          }
        ]
      }
    }
  },
  "options": {"widget": "Table"},
  "elements": [
    {"size": 180, "header": "Name", "accessorKey": "name"},
    {"size": 180, "header": "Status", "accessorKey": "status"},
    {
      "size": 180,
      "header": "View",
      "widget": {
        "type": "Control",
        "scope": "#/properties/viewBtn",
        "config": {
          "main": {
            "icon": "ViewIcon",
            "name": "View",
            "color": "primary",
            "onClick": "onClick",
            "styleDefault": true
          },
          "layout": {"lg": 1.5, "md": 2, "sm": 2.5, "xs": 4}
        },
        "options": {"widget": "IconButton"}
      },
      "accessorKey": "viewBtn"
    },
    {
      "size": 180,
      "header": "Delete",
      "widget": {
        "type": "Control",
        "scope": "#/properties/deleteBtn",
        "config": {
          "main": {
            "icon": "DeleteIcon",
            "name": "Delete",
            "color": "error",
            "onClick": "onClick",
            "styleDefault": true
          }
        },
        "options": {"widget": "IconButton"}
      },
      "accessorKey": "deleteBtn"
    }
  ]
}
```

---

## Common Icon Names

| Icon | Name |
|---|---|
| View | `ViewIcon` |
| Edit | `EditIcon` |
| Delete | `DeleteIcon` |
| Add | `TableAddIcon` |
| Download | `TableDownloadIcon` |
| Search | `SearchIcon` |
| Approve | `ApproveIcon` |
| Reject | `RejectIcon` |
| Send | `SendIcon` |
| Info | `InfoIcon` |

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| iconName | Icon to display | "ViewIcon" |
| buttonType | Must be "IconButton" | "IconButton" |
| defaultStyle | Icon-only (true) vs text+icon (false) | "true" |
| color | Button color | "primary", "error", "success" |
| tooltipMessage | Hover text | "View Details" |
| elementType | "tableHeader" for header placement | "tableHeader" |
| size | Button size | "small", "medium", "large" |

---

## Colors Available

```json
"color": "primary"    // Blue
"color": "secondary"  // Gray
"color": "success"    // Green
"color": "error"      // Red
"color": "warning"    // Orange
"color": "info"       // Light Blue
```

---

## Button Actions

### Navigate to Detail Page
```javascript
async(store, dynamic) => {
  const id = dynamic?.rowData.id;
  store.navigate(`/page_detail?id=${id}`);
}
```

### Open Modal/Dialog
```javascript
async(store, dynamic) => {
  store.setSchema((pre) => ({
    ...pre,
    properties: { ...pre.properties, modal: { visible: true } }
  }));
}
```

### API Call
```javascript
async(store, dynamic) => {
  const id = dynamic?.rowData.id;
  await service.post(`/api/delete/${id}`);
  store.refreshTable();
}
```

### Copy to Clipboard
```javascript
async(store, dynamic) => {
  navigator.clipboard.writeText(dynamic?.rowData.email);
  store.setNotify({ SuccessMessage: "Copied!", Success: true });
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Missing `iconName`
```json
// WRONG
{"buttonType": "IconButton"}

// CORRECT
{"buttonType": "IconButton", "iconName": "ViewIcon"}
```

**Mistake 2:** Wrong widget type in uiSchema
```json
// WRONG
"widget": "Button"

// CORRECT
"widget": "IconButton"
```

**Mistake 3:** Header buttons placed in column elements instead of `headerIcons.elements` — use `elementType: "tableHeader"` in config AND place the widget inside `config.main.headerIcons.elements` in uiSchema.

---

## Testing Checklist

- [ ] Icon displays correctly
- [ ] Tooltip appears on hover
- [ ] Button is clickable
- [ ] Click action executes
- [ ] Row data accessible via `dynamic.rowData`
- [ ] Color is correct
- [ ] Header icons appear in table toolbar
- [ ] Works on mobile

---

## Reference

**Based on:** page_NotificationLogs  
**Widget:** IconButton (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
