---
name: add-card
description: Add Card components to Hyperform pages. Use this skill whenever you need KPI metric cards — dashboard stats, performance indicators, summary cards, or quick-stat displays with icon, value, and description. Covers config type "card", WrapperLayout uiSchema structure, icon URL, columnFormat, hover effects, and responsive grid sizing.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Card Component

**Pattern Reference:** page_empIncentiveManagerDashboard  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add Card to Your Page

Card Component displays KPI metrics with icons, values, and descriptions. Perfect for:
- Dashboard KPIs (Disbursement, Achievement, NPA)
- Performance metrics
- Summary cards
- Quick stats display
- Executive dashboards

---

## Step 1: Add to config.elements

```json
{
  "name": "disbursement",
  "type": "card",
  "label": "Disbursement",
  "url": "https://www.svgrepo.com/show/508166/rupee-circle.svg",
  "events": [
    {
      "body": [
        {"key": "reportName", "value": "disbursement"},
        {"key": "messageType", "value": "generateReport"}
      ],
      "path": "/api/getDisbursement",
      "method": "post",
      "Handler": "api",
      "eventType": "onLoad"
    }
  ],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "4"},
    {"key": "sm", "value": "6"},
    {"key": "xs", "value": "12"}
  ],
  "description": "Target ₹17M (Tier 1)",
  "columnFormat": "amount"
}
```

---

## Step 2: Add to uiSchema.elements

The card uses a `WrapperLayout` with nested `Box` widgets for icon, label, value, and description. Each sub-property scope follows the pattern `#/properties/<cardName>/properties/<field>`.

```json
{
  "type": "WrapperLayout",
  "config": {
    "main": {},
    "style": {
      "wrapperStyle": {
        "top": "50%",
        "position": "relative",
        "transform": "translateY(-50%)",
        "fontFamily": "poppins",
        "borderRadius": "12px",
        "marginBottom": 0
      },
      "componentsBoxStyle": {
        "width": "100% !important",
        "height": "100%",
        "padding": "20px 20px 20px 14px",
        "flexWrap": "nowrap",
        "overflow": "hidden",
        "position": "relative",
        "boxShadow": "0 0 6px 1px rgba(149, 147, 147, 0.25)",
        "minHeight": "100px",
        "background": "transparent",
        "borderRadius": "12px",
        "flexDirection": "column",
        "&:hover": {
          "color": "#ffffff",
          "background": "#1BA1A6"
        }
      }
    },
    "layout": {
      "lg": 3,
      "md": 4,
      "sm": 6,
      "xs": 12
    }
  },
  "elements": [
    {
      "type": "Control",
      "scope": "#/properties/disbursement/properties/url",
      "config": {
        "main": {
          "url": "https://www.svgrepo.com/show/508166/rupee-circle.svg"
        },
        "style": {
          "imageStyle": {
            "color": "inherit",
            "width": "32px",
            "height": "32px",
            "margin": "0px",
            "padding": "0px"
          },
          "containerStyle": {
            "top": "4px",
            "color": "inherit",
            "right": "4px",
            "display": "flex",
            "position": "absolute",
            "alignItems": "flex-start",
            "justifyContent": "flex-end"
          }
        }
      },
      "options": {"widget": "Image"}
    },
    {
      "type": "Control",
      "scope": "#/properties/disbursement/properties/label",
      "config": {
        "main": {"heading": "Disbursement"},
        "style": {
          "top": "8px",
          "left": "12px",
          "color": "inherit",
          "display": "flex",
          "fontSize": "16px",
          "position": "absolute",
          "fontFamily": "Poppins",
          "fontWeight": 300,
          "whiteSpace": "nowrap"
        }
      },
      "options": {"widget": "Box"}
    },
    {
      "type": "Control",
      "scope": "#/properties/disbursement/properties/value",
      "config": {
        "main": {"heading": "5000.00"},
        "style": {
          "color": "inherit",
          "width": "100%",
          "display": "flex",
          "fontSize": {"md": "40px", "xs": "22px"},
          "marginTop": "8px",
          "fontWeight": 600,
          "lineHeight": "1",
          "whiteSpace": "nowrap",
          "marginBottom": "4px"
        }
      },
      "options": {"widget": "Box"}
    },
    {
      "type": "Control",
      "scope": "#/properties/disbursement/properties/description",
      "config": {
        "main": {"heading": "Target ₹17M (Tier 1)"},
        "style": {
          "color": "inherit",
          "margin": "0px",
          "fontSize": "12px",
          "fontWeight": "400",
          "whiteSpace": "nowrap"
        }
      },
      "options": {"widget": "Box"}
    }
  ]
}
```

---

## Step 3: Add to schema.properties

Cards do not require explicit schema entries — leave them absent or add empty objects:

```json
{
  "disbursement": {},
  "achievement": {},
  "npa": {}
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type | Must be lowercase "card" | "card" |
| url | Icon SVG URL (top-right of card) | "https://...rupee-circle.svg" |
| label | Card title | "Disbursement" |
| description | Subtitle / target text | "Target ₹17M (Tier 1)" |
| columnFormat | Number formatting | "amount" (adds currency) |
| layout | Responsive card sizing | {lg: 3, md: 4, sm: 6, xs: 12} |

---

## Card Layout Options

### Four Cards Per Row (KPI Grid)
```json
"layout": [
  {"key": "lg", "value": "3"},
  {"key": "md", "value": "4"},
  {"key": "sm", "value": "6"},
  {"key": "xs", "value": "12"}
]
```

### Three Cards Per Row
```json
"layout": [
  {"key": "lg", "value": "4"},
  {"key": "md", "value": "4"},
  {"key": "sm", "value": "6"},
  {"key": "xs", "value": "12"}
]
```

### Two Cards Per Row
```json
"layout": [
  {"key": "lg", "value": "6"},
  {"key": "md", "value": "6"},
  {"key": "sm", "value": "12"},
  {"key": "xs", "value": "12"}
]
```

---

## Complete Example: 4-Card KPI Grid

### config.elements

```json
[
  {
    "name": "disbursement",
    "type": "card",
    "label": "Disbursement",
    "url": "https://www.svgrepo.com/show/508166/rupee-circle.svg",
    "events": [
      {
        "body": [{"key": "reportName", "value": "disbursement"}],
        "path": "/api/getDisbursement",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ],
    "description": "Target ₹17M",
    "columnFormat": "amount"
  },
  {
    "name": "achievement",
    "type": "card",
    "label": "Overall Achievement",
    "url": "https://www.svgrepo.com/show/510118/percent-symbol.svg",
    "events": [
      {
        "body": [{"key": "reportName", "value": "achievement"}],
        "path": "/api/getAchievement",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ],
    "description": "Slab: 120% payout",
    "columnFormat": "amount"
  },
  {
    "name": "npa",
    "type": "card",
    "label": "NPA",
    "url": "https://www.svgrepo.com/show/509344/documents.svg",
    "events": [
      {
        "body": [{"key": "reportName", "value": "npa"}],
        "path": "/api/getNPA",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ],
    "description": "Non-Performing Assets",
    "columnFormat": "amount"
  },
  {
    "name": "bounce",
    "type": "card",
    "label": "Bounce",
    "url": "https://www.svgrepo.com/show/509344/documents.svg",
    "events": [
      {
        "body": [{"key": "reportName", "value": "bounce"}],
        "path": "/api/getBounce",
        "method": "post",
        "Handler": "api",
        "eventType": "onLoad"
      }
    ],
    "layout": [
      {"key": "lg", "value": "3"},
      {"key": "md", "value": "4"},
      {"key": "sm", "value": "6"},
      {"key": "xs", "value": "12"}
    ],
    "description": "Bounce Count",
    "columnFormat": "amount"
  }
]
```

---

## API Response Format

```json
{
  "data": {
    "value": "5000.00",
    "status": "On Track"
  }
}
```

`columnFormat: "amount"` formats the value with currency symbol (₹).

---

## Icon URLs (Free SVG Sources)

```
Disbursement:  https://www.svgrepo.com/show/508166/rupee-circle.svg
Percentage:    https://www.svgrepo.com/show/510118/percent-symbol.svg
Documents:     https://www.svgrepo.com/show/509344/documents.svg
Users:         https://www.svgrepo.com/show/509999/users.svg
Growth chart:  https://www.svgrepo.com/show/510077/chart-growth.svg
```

---

## Hover Effects

```json
"&:hover": {
  "color": "#ffffff",
  "background": "#1BA1A6"
}
```

Change hover color by replacing the `background` value (e.g. `"#4CAF50"` for green).

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong `type` casing — must be lowercase `"card"`, not `"Card"`

**Mistake 2:** Wrong widget in uiSchema sub-elements
```json
// WRONG
"options": {"widget": "Card"}

// CORRECT - use Box for label/value/description, Image for icon
"options": {"widget": "Box"}
"options": {"widget": "Image"}
```

**Mistake 3:** Wrong scope pattern — sub-properties must use nested path
```json
// WRONG
"scope": "#/properties/value"

// CORRECT
"scope": "#/properties/disbursement/properties/value"
```

---

## Testing Checklist

- [ ] Card displays at correct size
- [ ] Icon appears in top right
- [ ] Title shows correctly
- [ ] Value displays prominently
- [ ] Description shows below value
- [ ] Data loads from API
- [ ] Amount formatted with currency
- [ ] Hover effect works
- [ ] Responsive on mobile and desktop

---

## Reference

**Based on:** page_empIncentiveManagerDashboard  
**Component:** Card (Custom styled WrapperLayout with Box widgets)  
**Version:** 1.0  
**Status:** Production Ready
