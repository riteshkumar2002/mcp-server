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

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/final_amt",
  "config": {
    "main": {
      "min": "10000",
      "max": "1000000",
      "step": "10000",
      "label": "Final Amount",
      "limitToMax": false
    },
    "layout": 12
  },
  "options": {
    "widget": "InputSlider"
  }
}
```

---

## Step 3: Add to schema.properties

```json
"final_amt": {}
```

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

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/final_amt",
  "config": {
    "main": {
      "max": "1000000",
      "min": "10000",
      "step": "10000",
      "label": "Final Amount Bounce BP",
      "limitToMax": false
    },
    "layout": 12
  },
  "options": {
    "widget": "InputSlider"
  }
},
{
  "type": "Control",
  "scope": "#/properties/resolution_per",
  "config": {
    "main": {
      "max": "100",
      "min": "1",
      "step": "1",
      "label": "Resolution %",
      "limitToMax": true
    },
    "layout": 12
  },
  "options": {
    "widget": "InputSlider"
  }
}
```

### schema.properties

```json
{
  "final_amt": {},
  "resolution_per": {}
}
```

---

## Key Configuration Points

| Property | Type | Purpose | Example |
|---|---|---|---|
| min | String | Minimum value | "10000" |
| max | String | Maximum value | "1000000" |
| step | String | Increment step | "10000" |
| label | String | Display label | "Amount" |
| limitToMax | String | Enforce max? | "YES" or "NO" |
| widget | String | Use InputSlider | "InputSlider" |

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
"layout": 12
```

### Half Width
```json
"layout": 6
```

### Custom Responsive
```json
"layout": {
  "lg": 6,
  "md": 6,
  "sm": 12,
  "xs": 12
}
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

**Mistake 2:** Missing widget configuration — both config and uiSchema entries required
```json
// In config: {"type": "InputSlider", ...}
// In uiSchema: {"options": {"widget": "InputSlider"}, ...}
// In schema: {"fieldName": {}}
```

**Mistake 3:** Wrong limitToMax format — must be string "YES"/"NO" in config, boolean in uiSchema
```json
// config.elements
"limitToMax": "YES"   // string

// uiSchema config.main
"limitToMax": true    // boolean
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
