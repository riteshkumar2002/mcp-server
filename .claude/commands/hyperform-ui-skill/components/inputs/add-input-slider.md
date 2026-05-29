---
name: add-input-slider
description: Add Input Slider (range input) fields to Hyperform pages. Use this skill whenever you need a slider for amount ranges, percentages, quantities, or calculator parameters. Covers min/max/step/limitToMax config, uiSchema widget, and result auto-population via Success events.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add Input Slider

**Pattern Reference:** page_ColIncentiveCalculator  
**Version:** 1.0  
**Status:** Production Ready

---

## IMPORTANT: Only Modify config — Never Build uiSchema or Schema Manually

In the Hyperform MCP server, **you only ever build and edit the `config` object.**
`uiSchema` and `schema` are **automatically derived** by `buildUiSchema` / `buildSchema` inside `update_page` and `preview_session_from_config`. Never construct them manually.

The uiSchema and schema examples shown in this skill are **reference only** — they illustrate what the auto-derivation produces from your config. Do not copy or manually build them.

---

## How to Add Input Slider to Your Page

Input Slider is a range input component perfect for:
- Amount ranges (loan amount, transaction amount)
- Percentages (interest rate, discount, payout)
- Quantities (months, days, items)
- Calculator parameters

---

## Step 1: Add to config.elements

### Simple Slider (Amount)

```json
{
  "name": "final_amt",
  "type": "InputSlider",
  "label": "Final Amount",
  "min": "10000",
  "max": "1000000",
  "step": "10000",
  "limitToMax": "NO",
  "events": []
}
```

### Percentage Slider

```json
{
  "name": "resolution_per",
  "type": "InputSlider",
  "label": "Resolution %",
  "min": "1",
  "max": "100",
  "step": "1",
  "limitToMax": "YES",
  "events": []
}
```

### Quantity Slider

```json
{
  "name": "months",
  "type": "InputSlider",
  "label": "Tenure (Months)",
  "min": "6",
  "max": "60",
  "step": "1",
  "limitToMax": "YES",
  "events": []
}
```

> **uiSchema and schema are auto-derived** — call `update_page(pageName, config, userId)` and the server builds both automatically. Never edit them manually.

---

## Complete Calculator Example

Here's the full example from page_ColIncentiveCalculator:

### config.elements

```json
{
  "name": "inputParams",
  "type": "WrapperSection",
  "label": "FE Payout Calculator",
  "elements": [
    {
      "name": "programId",
      "type": "Select",
      "label": "Program",
      "events": [
        {
          "body": [
            {"key": "type", "value": "program"},
            {"key": "userId", "value": "$userValue.userId"}
          ],
          "path": "/page/getLOV",
          "method": "post",
          "Handler": "api",
          "eventType": "onLoad"
        }
      ]
    },
    {
      "name": "city_type",
      "type": "Select",
      "label": "City Type",
      "value": [
        {"label": "METRO", "value": "METRO"},
        {"label": "NON METRO", "value": "NON METRO"}
      ]
    },
    {
      "name": "final_amt",
      "type": "InputSlider",
      "label": "Final Amount Bounce BP",
      "min": "10000",
      "max": "1000000",
      "step": "10000",
      "limitToMax": "NO"
    },
    {
      "name": "resolution_per",
      "type": "InputSlider",
      "label": "Resolution %",
      "min": "1",
      "max": "100",
      "step": "1",
      "limitToMax": "YES"
    },
    {
      "name": "calc",
      "type": "Button",
      "label": "Calculate",
      "events": [
        {
          "body": [
            {"key": "programId", "value": "$programId"},
            {"key": "messageType", "value": "collectionDashboard"},
            {"key": "city_type", "value": "$city_type"},
            {"key": "final_amt", "value": "$final_amt"},
            {"key": "resolution_per", "value": "$resolution_per"},
            {"key": "reportFormat", "value": "calc"}
          ],
          "path": "/HyperformMessage/process",
          "method": "post",
          "Handler": "api",
          "eventType": "onClick",
          "events": [
            {
              "eventType": "Success",
              "Handler": "custom",
              "eventCode": "(store, dynamicData, userValue, parentEventOutput)=>{\n  store.setFormdata((pre)=>{return {...pre,...parentEventOutput.data}})\n}"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## Key Configuration Points

| Property | Type | Purpose | Example |
|---|---|---|---|
| `name` | String | Unique field key | `"final_amt"` |
| `type` | String | Must be `"InputSlider"` | `"InputSlider"` |
| `label` | String | Display label | `"Final Amount"` |
| `min` | String | Minimum value | `"10000"` |
| `max` | String | Maximum value | `"1000000"` |
| `step` | String | Increment step | `"10000"` |
| `limitToMax` | String | Enforce max? | `"YES"` or `"NO"` |
| `style` | JSON string | Optional inline style | `"{}"` |
| `layout` | Array of `{key,value}` | Responsive grid (default: lg:6 md:6 sm:12 xs:12) | |

---

## limitToMax Explained

### limitToMax: "YES" (Enforced)
```
Max allowed: 100
User tries to type 150
Result: Rejected, stays at 100
Use for: Percentages, bounded values
```

### limitToMax: "NO" (Permissive)
```
Max shown: 1,000,000
User can type: 1,500,000
Result: Accepted
Use for: Amounts, flexible ranges
```

---

## Slider Value Access

### In Button Click Event

```json
{
  "body": [
    {
      "key": "amount",
      "value": "$final_amt"
    },
    {
      "key": "percentage",
      "value": "$resolution_per"
    }
  ]
}
```

### In Custom Events

```javascript
const sliderValue = store?.ctx?.core?.data?.final_amt;
const percentage = store?.ctx?.core?.data?.resolution_per;
```

---

## Success Event: Auto-populate Results

After calculating, automatically populate result fields:

```javascript
async (store, dynamicData, userValue, parentEventOutput) => {
  store.setFormdata((pre) => {
    return {
      ...pre,
      ...parentEventOutput.data
    };
  });
}
```

---

## Common Slider Configurations

### Amount Range (10k to 1M, steps of 10k)
```json
{
  "name": "amount",
  "type": "InputSlider",
  "label": "Amount",
  "min": "10000",
  "max": "1000000",
  "step": "10000",
  "limitToMax": "NO"
}
```

### Percentage (1 to 100, steps of 1)
```json
{
  "name": "percentage",
  "type": "InputSlider",
  "label": "Percentage",
  "min": "1",
  "max": "100",
  "step": "1",
  "limitToMax": "YES"
}
```

### Interest Rate (1% to 25%, steps of 0.5%)
```json
{
  "name": "interest_rate",
  "type": "InputSlider",
  "label": "Interest Rate",
  "min": "1",
  "max": "25",
  "step": "0.5",
  "limitToMax": "YES"
}
```

### Months (6 to 60, steps of 1)
```json
{
  "name": "tenure_months",
  "type": "InputSlider",
  "label": "Tenure (Months)",
  "min": "6",
  "max": "60",
  "step": "1",
  "limitToMax": "YES"
}
```

---

## Layout Options

### Full Width (Typical for Sliders)
```json
"layout": [
  {"key": "lg", "value": "12"},
  {"key": "md", "value": "12"},
  {"key": "sm", "value": "12"},
  {"key": "xs", "value": "12"}
]
```

### Half Width (Default)
```json
"layout": [
  {"key": "lg", "value": "6"},
  {"key": "md", "value": "6"},
  {"key": "sm", "value": "12"},
  {"key": "xs", "value": "12"}
]
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong data type — min/max/step must be strings, not numbers
```json
// WRONG
"min": 10000

// CORRECT
"min": "10000"
```

**Mistake 2:** Wrong `limitToMax` format — must be string `"YES"` or `"NO"` in config
```json
// WRONG
"limitToMax": true

// CORRECT
"limitToMax": "YES"
```

---

## Testing Checklist

- [ ] Slider displays correctly
- [ ] Can drag slider handle
- [ ] Can type value directly
- [ ] Min value enforced
- [ ] Max value enforced (if limitToMax: YES)
- [ ] Step increments work
- [ ] Value updates in form data
- [ ] Value passes to API call
- [ ] Success event populates results
- [ ] Works on mobile (touch slider)
- [ ] Works on desktop

---

## Reference

**Based on:** page_ColIncentiveCalculator  
**Widget:** InputSlider (HyPerform standard)  
**Version:** 1.0  
**Status:** Production Ready
