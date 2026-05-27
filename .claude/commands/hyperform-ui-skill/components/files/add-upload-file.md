---
name: add-upload-file
description: Add UploadFile (standalone upload button) to Hyperform pages. Use this skill whenever you need a dedicated file upload button — invoice uploads, certificate uploads, bulk CSV import, or any single-file submission. Covers config type "UploadFile", uiSchema widget "UploadFile", onClick handler with service.post FormData to /externalData/save, storing fileId in formdata, file type/size validation, and success/error notifications.
compatibility: Hyperform MCP server, update_page tool
---

# HyPerform Skill: Add UploadFile Component

**Pattern Reference:** page_paymentDetailsManagement  
**Version:** 1.0  
**Status:** Production Ready

---

## How to Add UploadFile to Your Page

UploadFile Component provides a dedicated file upload button for single file uploads. Perfect for:
- Invoice/document uploads
- Certificate uploads
- Report file uploads
- Template uploads
- Bulk data file uploads (CSV/Excel)
- Standalone file submission

---

## Step 1: Add to config.elements

```json
{
  "name": "uploadFile",
  "type": "UploadFile",
  "label": "Invoice File",
  "events": [
    {
      "Handler": "custom",
      "eventType": "onClick",
      "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => {\n  const file = dynamicData?.changeEvent?.target?.files?.[0];\n\n  if (!file) {\n    store.setNotify({ FailMessage: 'Please select a file', Fail: true });\n    return;\n  }\n\n  const formData = new FormData();\n  formData.append('metadata', JSON.stringify({\n    name: file.name,\n    type: file.name.split('.').pop()\n  }));\n  formData.append('file', file);\n  formData.append('fileType', 'externalData');\n\n  try {\n    const response = await service.post('/externalData/save', formData);\n\n    store.setFormdata((prev) => ({\n      ...prev,\n      uploadFileId: response.data,\n      uploadFileName: file.name\n    }));\n\n    store.setNotify({ SuccessMessage: 'File Uploaded Successfully', Success: true });\n  } catch (error) {\n    store.setNotify({ FailMessage: 'File Upload Failed', Fail: true });\n  }\n}"
    }
  ],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "3"},
    {"key": "xs", "value": "12"}
  ]
}
```

---

## Step 2: Add to uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/uploadFile",
  "config": {
    "main": {
      "label": "Invoice File",
      "onClick": "onClick",
      "required": true
    },
    "style": {
      "backgroundColor": "none"
    },
    "layout": {
      "lg": 3,
      "md": 3,
      "xs": 12
    }
  },
  "options": {
    "widget": "UploadFile"
  }
}
```

---

## Step 3: Add to schema.properties

```json
{
  "uploadFileId": {},
  "uploadFileName": {}
}
```

---

## Key Configuration Points

| Property | Purpose | Example |
|---|---|---|
| type (config) | Must be "UploadFile" | "UploadFile" |
| widget (uiSchema) | Must be "UploadFile" | "UploadFile" |
| label | Button label | "Upload Invoice" |
| required | Mark field as required | true or false |
| onClick | Event name in uiSchema main | "onClick" |

---

## Upload Flow

1. User clicks button → file dialog opens
2. User selects file → `onClick` event fires
3. Access file via `dynamicData?.changeEvent?.target?.files?.[0]`
4. Build `FormData` with `metadata`, `file`, `fileType`
5. `service.post('/externalData/save', formData)` → returns `fileId`
6. Store `fileId` + `fileName` in formdata for later download

---

## Complete Invoice Upload Example

### config.elements

```json
{
  "name": "uploadFile",
  "type": "UploadFile",
  "label": "Invoice File",
  "events": [
    {
      "Handler": "custom",
      "eventType": "onClick",
      "eventCode": "async (store, dynamicData, userValue, parentEventOutput, service) => {\n  const programData = JSON.parse(\n    window.sessionStorage.getItem('selectedProgram') || '{}'\n  )?.id;\n\n  if (!programData) {\n    store.setNotify({ FailMessage: 'Please select Program', Fail: true });\n    return;\n  }\n\n  const file = dynamicData?.changeEvent?.target?.files?.[0];\n\n  if (!file) {\n    store.setNotify({ FailMessage: 'Please select a file', Fail: true });\n    return;\n  }\n\n  const formData = new FormData();\n  formData.append('metadata', JSON.stringify({\n    name: file.name,\n    type: file.name.split('.').pop(),\n    program: programData\n  }));\n  formData.append('file', file);\n  formData.append('fileType', 'externalData');\n\n  try {\n    const response = await service.post('/externalData/save', formData);\n\n    store.setFormdata((prev) => ({\n      ...prev,\n      uploadFileId: response.data,\n      uploadFileName: file.name,\n      downloadFile: file.name\n    }));\n\n    store.setNotify({ SuccessMessage: 'File Uploaded Successfully', Success: true });\n  } catch (error) {\n    store.setNotify({ FailMessage: 'File Upload Failed', Fail: true });\n  }\n}"
    }
  ],
  "layout": [
    {"key": "lg", "value": "3"},
    {"key": "md", "value": "3"},
    {"key": "xs", "value": "12"}
  ]
}
```

### uiSchema.elements

```json
{
  "type": "Control",
  "scope": "#/properties/uploadFile",
  "config": {
    "main": {
      "label": "Invoice File",
      "onClick": "onClick",
      "required": true
    },
    "style": {"backgroundColor": "none"},
    "layout": {"lg": 3, "md": 3, "xs": 12}
  },
  "options": {"widget": "UploadFile"}
}
```

---

## API: POST /externalData/save

**Request (multipart/form-data):**
```
metadata: JSON string {name, type, program}
file:     File binary
fileType: "externalData"
```

**Response:**
```json
{"data": "fileId_12345"}
```

Store this `fileId` — it is required for download.

---

## File Validation

### Type Validation
```javascript
const extension = file.name.split('.').pop().toLowerCase();
const validExtensions = ['pdf', 'xlsx', 'xls', 'csv'];
if (!validExtensions.includes(extension)) {
  store.setNotify({ FailMessage: 'Only PDF and Excel files allowed', Fail: true });
  return;
}
```

### Size Validation (5MB)
```javascript
if (file.size > 5 * 1024 * 1024) {
  store.setNotify({ FailMessage: 'File size must be less than 5MB', Fail: true });
  return;
}
```

---

## Common Mistakes to Avoid

**Mistake 1:** Wrong widget name
```json
// WRONG
"widget": "Upload"

// CORRECT
"widget": "UploadFile"
```

**Mistake 2:** Not using `service` parameter — upload requires `service.post(...)`, not a regular API event handler. The `service` is the 5th parameter of the `onClick` eventCode function.

**Mistake 3:** Not storing `fileId` after upload — the returned `response.data` is the fileId needed for the paired DownloadFile button.

**Mistake 4:** Using `eventType: "onUpload"` instead of `eventType: "onClick"` — UploadFile uses `onClick`, not `onUpload`.

---

## Testing Checklist

- [ ] Upload button displays with label
- [ ] File dialog opens on click
- [ ] File type validation works
- [ ] File size limit enforced
- [ ] Upload API called with correct FormData
- [ ] fileId stored in formdata after upload
- [ ] Success notification shows
- [ ] Error handling works

---

## Reference

**Based on:** page_paymentDetailsManagement  
**Widget:** UploadFile  
**Version:** 1.0  
**Status:** Production Ready
